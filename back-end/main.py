from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload 
from typing import List, Optional # Adicionado Optional
from jose import JWTError, jwt
import shutil
import os
import uuid
from sqlalchemy import or_ # Adicionado para busca com OR

# Importações locais do seu projeto
import models, schemas, security
from database import engine, get_db
from utils.email import enviar_notificacao_venda  

# 1. Inicia as tabelas no Banco de Dados
models.Base.metadata.create_all(bind=engine)

# 2. Configuração de Pastas de Upload
UPLOAD_DIR = "uploads"
IMG_DIR = os.path.join(UPLOAD_DIR, "imagens")
FILES_DIR = os.path.join(UPLOAD_DIR, "arquivos")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(FILES_DIR, exist_ok=True)

app = FastAPI(title="Mintify API - Marketplace Edition")

# 3. Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos (Imagens e Produtos)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/usuarios/login")

# --- DEPENDÊNCIA DE AUTENTICAÇÃO ---

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão inválida. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

# --- ROTAS DE USUÁRIO E PERFIL ---

@app.post("/api/usuarios/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
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
def login(dados: schemas.LoginRequest, db: Session = Depends(get_db)):
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
def completar_perfil(dados: schemas.UsuarioUpdate, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if dados.perfil is not None:
        user.perfil = dados.perfil
    if dados.tipo_produto_interesse is not None:
        user.tipo_produto_interesse = dados.tipo_produto_interesse
    if dados.chave_pix is not None:
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

@app.get("/api/produtos", response_model=List[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)): # Removed email dependency for public access to products
    return db.query(models.Produto).options(joinedload(models.Produto.midias)).all()

@app.post("/api/produtos/upload", status_code=status.HTTP_201_CREATED)
async def upload_produto(
    titulo: str = Form(...), 
    preco: float = Form(...), 
    descricao: str = Form(...),
    tipo_produto: str = Form("Curso Online"), # Novo campo para tipo de produto
    imagens: List[UploadFile] = File([]), # Lista de imagens
    arquivos: List[UploadFile] = File([]), # Lista de outros arquivos (vídeos, documentos)
    db: Session = Depends(get_db), 
    current_user_email: str = Depends(get_current_user)
):
    if not imagens and not arquivos:
        raise HTTPException(status_code=400, detail="Pelo menos uma imagem ou um arquivo deve ser enviado.")

    # Criar o produto primeiro
    novo_produto = models.Produto(
        titulo=titulo, 
        preco=preco, 
        descricao=descricao,
        tipo=tipo_produto,
        vendedor_email=current_user_email
    )
    db.add(novo_produto)
    db.flush() # Flush para ter o ID do produto antes do commit

    ordem_midia = 0
    # Processar imagens
    for imagem in imagens:
        ext = os.path.splitext(imagem.filename)[1]
        file_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(IMG_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
        
        db.add(models.MidiaProduto(
            produto_id=novo_produto.id,
            url=f"uploads/imagens/{file_name}",
            tipo="imagem",
            ordem=ordem_midia
        ))
        ordem_midia += 1

    # Processar outros arquivos (vídeos, documentos, etc.)
    for arquivo in arquivos:
        ext = os.path.splitext(arquivo.filename)[1]
        file_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(FILES_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(arquivo.file, buffer)
        
        # Determinar o tipo do arquivo (simplificado, pode ser expandido com validação MIME)
        media_tipo = "arquivo"
        if ext.lower() in ['.mp4', '.mov', '.avi', '.mkv']:
            media_tipo = "video"

        db.add(models.MidiaProduto(
            produto_id=novo_produto.id,
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
@app.get("/api/produtos/buscar", response_model=List[schemas.ProdutoResponse])
def buscar_produtos(
    q: Optional[str] = None,
    min_preco: Optional[float] = None,
    max_preco: Optional[float] = None,
    tipo: Optional[str] = None,
    vendedor_email: Optional[str] = None,
    db: Session = Depends(get_db)
):
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
    
    produtos_com_midias = query.all()

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
    
    return produtos_para_resposta

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
def comprar_produto(produto_id: int, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    prod = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    ja_possui = db.query(models.Compra).filter(models.Compra.aluno_email == email, models.Compra.produto_id == produto_id).first()
    if ja_possui:
        raise HTTPException(status_code=400, detail="Você já possui este curso")

    try:
        # 1. Registra a compra para o Aluno
        db.add(models.Compra(aluno_email=email, produto_id=produto_id, valor_pago=prod.preco))
        
        # 2. Gera crédito financeiro para o Vendedor
        db.add(models.Movimentacao(vendedor_email=prod.vendedor_email, valor=prod.preco, tipo='venda'))
        
        # 3. Atualiza contador de vendas
        prod.vendas_count += 1
        
        # Salva tudo no banco antes de enviar o e-mail
        db.commit()

        # 4. GATILHO DE E-MAIL (RESEND)
        # Enviamos a notificação para o vendedor_email que está no produto
        enviar_notificacao_venda(
            email_vendedor=prod.vendedor_email,
            nome_produto=prod.titulo,
            valor=prod.preco
        )

        return {"message": "Compra realizada com sucesso e vendedor notificado!"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro no processamento: {str(e)}")

@app.get("/api/meus-cursos", response_model=List[schemas.ProdutoResponse])
def listar_meus_cursos(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    produtos_comprados = db.query(models.Produto).options(joinedload(models.Produto.midias)).join(models.Compra).filter(models.Compra.aluno_email == email).all()

    produtos_para_resposta = []
    for produto in produtos_comprados:
        produto_dict = produto.__dict__
        arquivo_url = None
        
        # Tenta encontrar um arquivo ou vídeo entre as mídias do produto
        for midia in produto.midias:
            if midia.tipo == 'arquivo' or midia.tipo == 'video':
                arquivo_url = midia.url
                break # Pega o primeiro arquivo/video encontrado

        produto_dict['arquivo_url'] = arquivo_url
        produtos_para_resposta.append(schemas.ProdutoResponse.model_validate(produto_dict))
    
    return produtos_para_resposta

# --- ROTAS DE AVALIAÇÕES ---
@app.post("/api/avaliacoes", response_model=schemas.Avaliacao, status_code=status.HTTP_201_CREATED)
def criar_avaliacao(
    avaliacao_data: schemas.AvaliacaoCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
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
        nota=avaliacao_data.nota,
        comentario=avaliacao_data.comentario
    )
    db.add(nova_avaliacao)
    db.commit()
    db.refresh(nova_avaliacao)
    
    return nova_avaliacao

@app.get("/api/produtos/{produto_id}/avaliacoes", response_model=List[schemas.Avaliacao])
def listar_avaliacoes_produto(produto_id: int, db: Session = Depends(get_db)):
    # 1. Verificar se o produto existe
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    # 2. Listar avaliações para o produto, carregando os dados do aluno
    avaliacoes = db.query(models.Avaliacao)\
                   .options(joinedload(models.Avaliacao.aluno))\
                   .filter(models.Avaliacao.produto_id == produto_id)\
                   .all()
    return avaliacoes

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
def solicitar_saque(dados: dict, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    valor = float(dados.get("valor", 0))
    movs = db.query(models.Movimentacao).filter(models.Movimentacao.vendedor_email == email).all()
    disponivel = sum(m.valor for m in movs if m.tipo == 'venda') - sum(m.valor for m in movs if m.tipo == 'saque')
    
    if valor > disponivel:
        raise HTTPException(status_code=400, detail="Saldo insuficiente para este saque.")

    db.add(models.Movimentacao(
        vendedor_email=email, 
        valor=valor, 
        tipo='saque', 
        status='pendente', 
        chave_pix=dados.get("chave_pix")
    ))
    db.commit()
    return {"message": "Solicitação de saque enviada!"}

@app.get("/api/alunos")
def listar_alunos_vendedor(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    return db.query(models.Usuario).join(models.Compra, models.Usuario.email == models.Compra.aluno_email)\
             .join(models.Produto, models.Compra.produto_id == models.Produto.id)\
             .filter(models.Produto.vendedor_email == email).all()