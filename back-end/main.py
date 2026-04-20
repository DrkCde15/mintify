from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session, joinedload 
from typing import List, Optional
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import shutil
import os
import uuid
from sqlalchemy import or_

# Importações locais do seu projeto
import models, schemas, security
from database import engine, get_db
from config import settings
from middleware.error_handler import (
    error_handler_middleware,
    validation_exception_handler,
    http_exception_handler
)
from utils.file_validator import validate_upload_file
from utils.image_processor import compress_image
from utils.validators import (
    validar_preco,
    validar_chave_pix,
    validar_valor_saque,
    validar_nota_avaliacao,
    validar_comentario
)

from utils.notifications import notificar_venda, notificar_rastreio, criar_notificacao

# 1. Inicia as tabelas no Banco de Dados
models.Base.metadata.create_all(bind=engine)

# 2. Configuração de Pastas de Upload
UPLOAD_DIR = "uploads"
IMG_DIR = os.path.join(UPLOAD_DIR, "imagens")
FILES_DIR = os.path.join(UPLOAD_DIR, "arquivos")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(FILES_DIR, exist_ok=True)

# 3. Criar aplicação FastAPI
app = FastAPI(
    title="Mintify API - Marketplace Edition",
    version="2.0.0",
    description="API segura para marketplace de infoprodutos"
)

# 4. Configurar Rate Limiting
if settings.RATE_LIMIT_ENABLED:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    print("✅ Rate limiting ativado")
else:
    limiter = None
    print("⚠️  Rate limiting desativado")

# 5. Configurar Middleware de Erros
app.middleware("http")(error_handler_middleware)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)

# 6. Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 7. Servir arquivos estáticos (Imagens e Produtos)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/usuarios/login")

# --- DEPENDÊNCIA DE AUTENTICAÇÃO ---

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Valida token JWT e retorna o e-mail do usuário autenticado"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão inválida. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

# --- ROTAS DE USUÁRIO E PERFIL ---

@app.post("/api/usuarios/cadastro", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute") if limiter else lambda x: x
async def cadastrar_usuario(request: Request, user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """Cadastra um novo usuário no sistema"""
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    novo_usuario = models.Usuario(
        nome=user.nome,
        email=user.email,
        senha=security.gerar_senha_hash(user.senha)
    )
    db.add(novo_usuario)
    db.commit()
    return {"message": "Conta criada com sucesso!"}

@app.post("/api/usuarios/login", response_model=schemas.Token)
@limiter.limit("10/minute") if limiter else lambda x: x
async def login(request: Request, dados: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Autentica usuário e retorna token JWT"""
    user = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    
    if not user or not security.verificar_senha(dados.senha, user.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    access_token = security.criar_token_acesso(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "nome": user.nome,
            "email": user.email,
            "perfil": user.perfil 
        }
    }

@app.put("/api/usuarios/completar-perfil")
async def completar_perfil(dados: schemas.UsuarioUpdate, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    """Completa o perfil do usuário com tipo e chave PIX"""
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if dados.perfil is not None:
        user.perfil = dados.perfil
    if dados.tipo_produto_interesse is not None:
        user.tipo_produto_interesse = dados.tipo_produto_interesse
    if dados.chave_pix is not None:
        # Validar formato da chave PIX
        validar_chave_pix(dados.chave_pix)
        user.chave_pix = dados.chave_pix
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Perfil atualizado com sucesso!",
        "usuario": {
            "nome": user.nome,
            "email": user.email,
            "perfil": user.perfil
        }
    }

# --- ROTAS DE PRODUTOS E MARKETPLACE ---

@app.get("/api/produtos", response_model=schemas.PaginatedResponse[schemas.ProdutoResponse])
def listar_produtos(
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db)
): 
    """Lista todos os produtos com paginação"""
    query = db.query(models.Produto).options(joinedload(models.Produto.midias))
    total = query.count()
    
    produtos = query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()
    total_pages = (total + params.per_page - 1) // params.per_page
    
    return {
        "items": produtos,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

@app.post("/api/produtos/upload", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour") if limiter else lambda x: x
async def upload_produto(
    request: Request,
    titulo: str = Form(...), 
    preco: float = Form(...), 
    descricao: str = Form(...),
    tipo_produto: str = Form("Curso Online"),
    tipo_entrega: str = Form("digital"), # 'digital' ou 'fisico'
    estoque: int = Form(0),
    peso_kg: Optional[float] = Form(None),
    largura_cm: Optional[float] = Form(None),
    altura_cm: Optional[float] = Form(None),
    comprimento_cm: Optional[float] = Form(None),
    imagens: List[UploadFile] = File([]),
    arquivos: List[UploadFile] = File([]),
    db: Session = Depends(get_db), 
    current_user_email: str = Depends(get_current_user)
):
    """Upload de produto com validação de arquivos e preço"""
    
    # Validar que pelo menos um arquivo foi enviado (para digital é obrigatório, para físico imagem é obrigatória)
    if tipo_entrega == "digital" and not arquivos:
         raise HTTPException(status_code=400, detail="Produtos digitais devem conter pelo menos um arquivo.")
    
    if not imagens:
        raise HTTPException(status_code=400, detail="Pelo menos uma imagem deve ser enviada.")
    
    # Validar preço
    preco = validar_preco(preco)
    
    # Validar imagens (máximo 10)
    if len(imagens) > 10:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 10 imagens permitidas"
        )
    
    # Validar arquivos (máximo 5)
    if len(arquivos) > 5:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 5 arquivos permitidos"
        )
    
    # Criar o produto
    novo_produto = models.Produto(
        titulo=titulo, 
        preco=preco, 
        descricao=descricao,
        tipo=tipo_produto,
        tipo_entrega=tipo_entrega,
        estoque=estoque,
        peso_kg=peso_kg,
        largura_cm=largura_cm,
        altura_cm=altura_cm,
        comprimento_cm=comprimento_cm,
        vendedor_email=current_user_email
    )
    db.add(novo_produto)
    db.flush()  # Flush para ter o ID do produto antes do commit

    ordem_midia = 0
    
    # Processar imagens
    for imagem in imagens:
        if not imagem.filename:
            continue
            
        # Validar arquivo
        file_info = await validate_upload_file(imagem, 'image')
        
        # Gerar nome único base
        ext = os.path.splitext(file_info['safe_filename'])[1]
        unique_name = str(uuid.uuid4())
        temp_path = os.path.join(IMG_DIR, f"temp_{unique_name}{ext}")
        final_file_path = os.path.join(IMG_DIR, f"{unique_name}{ext}")
        
        # Salvar arquivo original temporariamente
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
        
        # Comprimir e converter para WebP
        processed_path = compress_image(temp_path, final_file_path)
        processed_file_name = os.path.basename(processed_path)
        
        # Remover temporário
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Registrar no banco
        db.add(models.MidiaProduto(
            produto_id=novo_produto.id,
            titulo=imagem.filename or f"Imagem {ordem_midia + 1}",
            url=f"uploads/imagens/{processed_file_name}",
            tipo="imagem",
            ordem=ordem_midia
        ))
        ordem_midia += 1

    # Processar outros arquivos (vídeos, documentos)
    for arquivo in arquivos:
        if not arquivo.filename:
            continue
        
        # Determinar tipo do arquivo
        ext = os.path.splitext(arquivo.filename)[1].lower()
        
        if ext in ['.mp4', '.mov', '.avi', '.mkv']:
            file_type = 'video'
            media_tipo = 'video'
        elif ext in ['.pdf', '.zip']:
            file_type = 'document'
            media_tipo = 'arquivo'
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não suportado: {ext}"
            )
        
        # Validar arquivo
        file_info = await validate_upload_file(arquivo, file_type)
        
        # Gerar nome único
        ext = os.path.splitext(file_info['safe_filename'])[1]
        file_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(FILES_DIR, file_name)
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(arquivo.file, buffer)
        
        # Registrar no banco
        db.add(models.MidiaProduto(
            produto_id=novo_produto.id,
            titulo=arquivo.filename or f"Aula {ordem_midia + 1}",
            url=f"uploads/arquivos/{file_name}",
            tipo=media_tipo,
            ordem=ordem_midia
        ))
        ordem_midia += 1
    
    db.commit()
    db.refresh(novo_produto)
    
    return {
        "message": "Produto cadastrado com sucesso!",
        "produto": schemas.ProdutoResponse.from_orm(novo_produto)
    }


# --- ROTAS DE BUSCA DE PRODUTOS ---
@app.get("/api/produtos/buscar", response_model=schemas.PaginatedResponse[schemas.ProdutoResponse])
def buscar_produtos(
    q: Optional[str] = None,
    min_preco: Optional[float] = None,
    max_preco: Optional[float] = None,
    tipo: Optional[str] = None,
    vendedor_email: Optional[str] = None,
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db)
):
    """Busca produtos com filtros e paginação"""
    query = db.query(models.Produto).options(joinedload(models.Produto.midias))

    if q:
        query = query.filter(
            or_(
                models.Produto.titulo.ilike(f"%{q}%"),
                models.Produto.descricao.ilike(f"%{q}%")
            )
        )
    if min_preco is not None:
        query = query.filter(models.Produto.preco >= min_preco)
    if max_preco is not None:
        query = query.filter(models.Produto.preco <= max_preco)
    if tipo:
        query = query.filter(models.Produto.tipo == tipo)
    if vendedor_email:
        query = query.filter(models.Produto.vendedor_email == vendedor_email)
    
    total = query.count()
    produtos_com_midias = query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()

    produtos_para_resposta = []
    for produto in produtos_com_midias:
        produto_dict = produto.__dict__
        
        imagens = [m for m in produto.midias if m.tipo == 'imagem']
        outras_midias = [m for m in produto.midias if m.tipo != 'imagem']
        
        # Prioriza a primeira imagem, se existir
        midias_ordenadas = sorted(imagens, key=lambda m: m.ordem) + sorted(outras_midias, key=lambda m: m.ordem)
        
        # Atualiza a lista de midias no dicionário do produto
        produto_dict['midias'] = midias_ordenadas
        
        produtos_para_resposta.append(schemas.ProdutoResponse.model_validate(produto_dict))
    
    total_pages = (total + params.per_page - 1) // params.per_page
    
    return {
        "items": produtos_para_resposta,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

@app.get("/api/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def get_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(models.Produto)\
                .options(joinedload(models.Produto.midias))\
                .filter(models.Produto.id == produto_id)\
                .first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return produto

@app.post("/api/produtos/comprar/{produto_id}")
@limiter.limit("20/hour") if limiter else lambda x: x
async def comprar_produto(
    request: Request, 
    produto_id: int, 
    compra_data: schemas.CompraRequest,
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    """Realiza a compra de um produto (Digital ou Físico)"""
    prod = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # Verifica se é digital e se o aluno já possui
    if prod.tipo_entrega == "digital":
        ja_possui = db.query(models.Compra).filter(
            models.Compra.aluno_email == email, 
            models.Compra.produto_id == produto_id
        ).first()
        if ja_possui:
            raise HTTPException(status_code=400, detail="Você já possui este curso/arquivo.")
    
    # Se for físico, validar estoque e endereço
    if prod.tipo_entrega == "fisico":
        if prod.estoque <= 0:
            raise HTTPException(status_code=400, detail="Produto fora de estoque.")
        
        if not compra_data.endereco:
            raise HTTPException(status_code=400, detail="Endereço de entrega é obrigatório para produtos físicos.")

    try:
        # Dados da Compra
        nova_compra = models.Compra(
            aluno_email=email, 
            produto_id=produto_id, 
            valor_pago=prod.preco,
            tipo_entrega_momento=prod.tipo_entrega
        )
        
        # Se físico, preencher endereço e status logístico
        if prod.tipo_entrega == "fisico":
            nova_compra.status_logistica = "pendente_envio"
            nova_compra.cep = compra_data.endereco.cep
            nova_compra.logradouro = compra_data.endereco.logradouro
            nova_compra.numero = compra_data.endereco.numero
            nova_compra.complemento = compra_data.endereco.complemento
            nova_compra.bairro = compra_data.endereco.bairro
            nova_compra.cidade = compra_data.endereco.cidade
            nova_compra.estado = compra_data.endereco.estado
            
            # Decrementar estoque
            prod.estoque -= 1

        db.add(nova_compra)
        
        # 2. Gera crédito financeiro para o Vendedor
        db.add(models.Movimentacao(vendedor_email=prod.vendedor_email, valor=prod.preco, tipo='venda'))
        
        # 3. Atualiza contador de vendas
        prod.vendas_count += 1
        
        # 4. NOTIFICAÇÕES (In-App e Email)
        notificar_venda(db, prod.vendedor_email, prod.titulo, prod.preco)

        db.commit()

        return {"message": "Compra realizada com sucesso!", "tipo": prod.tipo_entrega}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro no processamento: {str(e)}")

@app.get("/api/meus-cursos", response_model=schemas.PaginatedResponse[schemas.CompraComProduto])
def listar_meus_cursos(
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    """Lista as compras realizadas pelo aluno (Digital ou Físico)"""
    query = db.query(models.Compra)\
              .options(joinedload(models.Compra.produto).joinedload(models.Produto.midias))\
              .filter(models.Compra.aluno_email == email)\
              .order_by(models.Compra.data_compra.desc())
    
    total = query.count()
    compras = query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()
    
    total_pages = (total + params.per_page - 1) // params.per_page

    return {
        "items": compras,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

# --- ROTAS DE AVALIAÇÕES ---
@app.post("/api/avaliacoes", response_model=schemas.Avaliacao, status_code=status.HTTP_201_CREATED)
async def criar_avaliacao(
    avaliacao_data: schemas.AvaliacaoCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    """Cria uma nova avaliação para um produto"""
    
    # Validar nota e comentário
    nota = validar_nota_avaliacao(avaliacao_data.nota)
    comentario = validar_comentario(avaliacao_data.comentario)
    
    # 1. Obter o ID do aluno logado
    aluno = db.query(models.Usuario).filter(models.Usuario.email == current_user_email).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Usuário aluno não encontrado.")

    # 2. Verificar se o produto existe
    produto = db.query(models.Produto).filter(models.Produto.id == avaliacao_data.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    # 3. Verificar se o aluno comprou o produto
    compra_existente = db.query(models.Compra).filter(
        models.Compra.aluno_email == current_user_email,
        models.Compra.produto_id == avaliacao_data.produto_id
    ).first()
    if not compra_existente:
        raise HTTPException(status_code=403, detail="Você só pode avaliar produtos que comprou.")

    # 4. Verificar se o aluno já avaliou este produto
    avaliacao_existente = db.query(models.Avaliacao).filter(
        models.Avaliacao.aluno_id == aluno.id,
        models.Avaliacao.produto_id == avaliacao_data.produto_id
    ).first()
    if avaliacao_existente:
        raise HTTPException(status_code=400, detail="Você já enviou uma avaliação para este produto.")
    
    # 5. Criar a nova avaliação
    nova_avaliacao = models.Avaliacao(
        produto_id=avaliacao_data.produto_id,
        aluno_id=aluno.id,
        nota=nota,
        comentario=comentario
    )
    db.add(nova_avaliacao)
    db.commit()
    db.refresh(nova_avaliacao)
    
    return nova_avaliacao

@app.get("/api/produtos/{produto_id}/avaliacoes", response_model=schemas.PaginatedResponse[schemas.Avaliacao])
def listar_avaliacoes_produto(
    produto_id: int, 
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db)
):
    """Lista as avaliações de um produto com paginação"""
    # 1. Verificar se o produto existe
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    # 2. Listar avaliações para o produto, carregando os dados do aluno
    query = db.query(models.Avaliacao)\
              .options(joinedload(models.Avaliacao.aluno))\
              .filter(models.Avaliacao.produto_id == produto_id)
    
    total = query.count()
    avaliacoes = query.order_by(models.Avaliacao.data_avaliacao.desc())\
                      .offset((params.page - 1) * params.per_page)\
                      .limit(params.per_page)\
                      .all()
    
    total_pages = (total + params.per_page - 1) // params.per_page
    
    return {
        "items": avaliacoes,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

# --- ROTAS FINANCEIRAS E DASHBOARD ---

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    movs = db.query(models.Movimentacao).filter(models.Movimentacao.vendedor_email == email).all()
    vendas = [m for m in movs if m.tipo == 'venda']
    
    saldo = sum(v.valor for v in vendas)
    total_vendas = len(vendas)
    
    total_alunos = db.query(models.Compra).join(models.Produto).filter(
        models.Produto.vendedor_email == email
    ).distinct(models.Compra.aluno_email).count()

    return {
        "saldo_total": saldo,
        "vendas_hoje": total_vendas,
        "novos_alunos": total_alunos
    }

@app.get("/api/financeiro/resumo")
def get_financeiro(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    movs = db.query(models.Movimentacao).filter(models.Movimentacao.vendedor_email == email).order_by(models.Movimentacao.data.desc()).all()
    
    vendas = sum(m.valor for m in movs if m.tipo == 'venda')
    saques = sum(m.valor for m in movs if m.tipo == 'saque')
    
    return {
        "saldo_total": vendas,
        "saldo_disponivel": vendas - saques,
        "historico": movs
    }

@app.post("/api/financeiro/saque")
async def solicitar_saque(dados: dict, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    """Solicita um saque do saldo disponível"""
    valor = float(dados.get("valor", 0))
    chave_pix = dados.get("chave_pix", "")
    
    # Calcular saldo disponível
    movs = db.query(models.Movimentacao).filter(models.Movimentacao.vendedor_email == email).all()
    disponivel = sum(m.valor for m in movs if m.tipo == 'venda') - sum(m.valor for m in movs if m.tipo == 'saque')
    
    # Validar valor do saque
    valor = validar_valor_saque(valor, disponivel)
    
    # Validar chave PIX
    if chave_pix:
        validar_chave_pix(chave_pix)
    else:
        # Buscar chave PIX do perfil do usuário
        user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
        if user and user.chave_pix:
            chave_pix = user.chave_pix
        else:
            raise HTTPException(
                status_code=400,
                detail="Chave PIX não informada. Atualize seu perfil ou informe a chave."
            )

    db.add(models.Movimentacao(
        vendedor_email=email, 
        valor=valor, 
        tipo='saque', 
        status='pendente', 
        chave_pix=chave_pix
    ))
    db.commit()
    return {
        "message": "Solicitação de saque enviada com sucesso!",
        "valor": valor,
        "chave_pix": chave_pix
    }

@app.get("/api/alunos", response_model=schemas.PaginatedResponse[schemas.UsuarioSimples])
def listar_alunos_vendedor(
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    """Lista os alunos que compraram produtos do vendedor com paginação"""
    query = db.query(models.Usuario)\
              .join(models.Compra, models.Usuario.email == models.Compra.aluno_email)\
              .join(models.Produto, models.Compra.produto_id == models.Produto.id)\
              .filter(models.Produto.vendedor_email == email)\
              .distinct()
    
    total = query.count()
    alunos = query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()
    total_pages = (total + params.per_page - 1) // params.per_page
    
    return {
        "items": alunos,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

# --- ROTAS DE LOGÍSTICA E VENDAS (VENDEDOR) ---

@app.get("/api/vendedor/vendas", response_model=schemas.PaginatedResponse[schemas.CompraComProduto])
def listar_vendas_vendedor(
    params: schemas.PaginatedParams = Depends(),
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """Lista todas as vendas realizadas pelo vendedor"""
    query = db.query(models.Compra)\
              .join(models.Produto)\
              .options(joinedload(models.Compra.produto).joinedload(models.Produto.midias))\
              .filter(models.Produto.vendedor_email == email)\
              .order_by(models.Compra.data_compra.desc())
              
    total = query.count()
    vendas = query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()
    total_pages = (total + params.per_page - 1) // params.per_page
    
    return {
        "items": vendas,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "total_pages": total_pages
    }

@app.patch("/api/vendedor/vendas/{compra_id}")
async def atualizar_logistica_venda(
    compra_id: int,
    status_logistica: Optional[str] = Form(None),
    codigo_rastreio: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """Atualiza o status de entrega e código de rastreio de uma venda"""
    venda = db.query(models.Compra)\
              .join(models.Produto)\
              .filter(models.Compra.id == compra_id, models.Produto.vendedor_email == email)\
              .first()
              
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada ou você não tem permissão.")
    
    if status_logistica:
        venda.status_logistica = status_logistica
    if codigo_rastreio:
        venda.codigo_rastreio = codigo_rastreio
        # Notificar o aluno sobre o rastreio
        notificar_rastreio(db, venda.aluno_email, venda.produto.titulo, codigo_rastreio)
        
    db.commit()
    return {"message": "Logística atualizada com sucesso!"}

# --- ROTAS DE NOTIFICAÇÕES ---

@app.get("/api/notificacoes", response_model=List[schemas.NotificacaoResponse])
def listar_notificacoes(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    """Lista as notificações do usuário logado"""
    return db.query(models.Notificacao)\
             .filter(models.Notificacao.usuario_email == email)\
             .order_by(models.Notificacao.data_criacao.desc())\
             .limit(50)\
             .all()

@app.patch("/api/notificacoes/{notificacao_id}")
async def marcar_notificacao_lida(
    notificacao_id: int, 
    dados: schemas.NotificacaoUpdate,
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    notif = db.query(models.Notificacao).filter(
        models.Notificacao.id == notificacao_id,
        models.Notificacao.usuario_email == email
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    notif.lida = dados.lida
    db.commit()
    return {"message": "Status atualizado"}

# --- ÁREA DE MEMBROS (MEMBER AREA) ---

@app.get("/api/membros/curso/{produto_id}")
async def get_materiais_curso(
    produto_id: int, 
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    """Retorna os detalhes do curso, mídias e progresso do aluno"""
    # 1. Verificar se o usuário comprou o curso
    compra = db.query(models.Compra).filter(
        models.Compra.aluno_email == email, 
        models.Compra.produto_id == produto_id
    ).first()
    
    if not compra:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN, 
             detail="Você não tem acesso a este produto. Por favor, realize a compra para acessar."
         )
    
    # 2. Buscar produto e suas mídias
    produto = db.query(models.Produto)\
                .options(joinedload(models.Produto.midias))\
                .filter(models.Produto.id == produto_id)\
                .first()
    
    # 3. Buscar progresso do aluno nestas mídias
    progresso = db.query(models.ProgressoAula).filter(
        models.ProgressoAula.aluno_email == email
    ).all()
    midias_concluidas = {p.midia_id for p in progresso}
    
    # 4. Formatar resposta
    aulas = []
    for m in sorted(produto.midias, key=lambda x: x.ordem):
        aulas.append({
            "id": m.id,
            "titulo": m.titulo or f"Aula {m.ordem + 1}",
            "url": m.url,
            "tipo": m.tipo,
            "concluida": m.id in midias_concluidas
        })
        
    return {
        "produto": {
            "id": produto.id,
            "titulo": produto.titulo,
            "descricao": produto.descricao
        },
        "aulas": aulas
    }

@app.post("/api/membros/concluir-aula/{midia_id}")
async def concluir_aula(
    midia_id: int, 
    db: Session = Depends(get_db), 
    email: str = Depends(get_current_user)
):
    """Marca uma aula/mídia como concluída pelo aluno"""
    # 1. Verificar se a mídia existe
    midia = db.query(models.MidiaProduto).filter(models.MidiaProduto.id == midia_id).first()
    if not midia:
        raise HTTPException(status_code=404, detail="Aula não encontrada")
    
    # 2. Verificar se o usuário tem a compra desse produto
    compra = db.query(models.Compra).filter(
        models.Compra.aluno_email == email, 
        models.Compra.produto_id == midia.produto_id
    ).first()
    
    if not compra:
        raise HTTPException(status_code=403, detail="Você não possui acesso a este produto")
    
    # 3. Registrar progresso (evitar duplicatas)
    existente = db.query(models.ProgressoAula).filter(
        models.ProgressoAula.aluno_email == email, 
        models.ProgressoAula.midia_id == midia_id
    ).first()
    
    if not existente:
        novo_progresso = models.ProgressoAula(aluno_email=email, midia_id=midia_id)
        db.add(novo_progresso)
        db.commit()
    
    return {"message": "Aula concluída com sucesso!"}