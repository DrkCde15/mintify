from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
import shutil
import os
import uuid
from datetime import datetime

import models, schemas, security
from database import engine, get_db

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
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    access_token = security.criar_token_acesso(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {"nome": user.nome, "email": user.email, "perfil": user.perfil}
    }

# ROTA CORRIGIDA (completar-perfil) para evitar erro 404
@app.put("/api/usuarios/completar-perfil")
def completar_perfil(dados: schemas.UsuarioUpdate, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Atualiza apenas o que foi enviado (evita sobrescrever com None)
    if dados.perfil is not None:
        user.perfil = dados.perfil
        
    if dados.tipo_produto_interesse is not None:
        user.tipo_produto_interesse = dados.tipo_produto_interesse
        
    if dados.chave_pix is not None:
        user.chave_pix = dados.chave_pix
    
    db.commit()
    db.refresh(user) # Recarrega o objeto com os dados atualizados do banco
    
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
def listar_produtos(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    return db.query(models.Produto).all()

@app.post("/api/produtos/upload")
async def upload_produto(
    titulo: str = Form(...), preco: float = Form(...), descricao: str = Form(...),
    arquivo_produto: UploadFile = File(...), imagem_capa: UploadFile = File(...),
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):
    # Salvar Arquivo do Produto (PDF/ZIP/MP4)
    f_ext = os.path.splitext(arquivo_produto.filename)[1]
    f_name = f"{uuid.uuid4()}{f_ext}"
    with open(os.path.join(FILES_DIR, f_name), "wb") as b:
        shutil.copyfileobj(arquivo_produto.file, b)

    # Salvar Imagem de Capa
    i_ext = os.path.splitext(imagem_capa.filename)[1]
    i_name = f"{uuid.uuid4()}{i_ext}"
    with open(os.path.join(IMG_DIR, i_name), "wb") as b:
        shutil.copyfileobj(imagem_capa.file, b)

    novo_produto = models.Produto(
        titulo=titulo, preco=preco, descricao=descricao,
        arquivo_url=f"uploads/arquivos/{f_name}",
        imagem_url=f"uploads/imagens/{i_name}",
        vendedor_email=current_user
    )
    db.add(novo_produto)
    db.commit()
    return {"message": "Produto cadastrado com sucesso!"}

@app.post("/api/produtos/comprar/{produto_id}")
def comprar_produto(produto_id: int, db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    prod = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    ja_possui = db.query(models.Compra).filter(models.Compra.aluno_email == email, models.Compra.produto_id == produto_id).first()
    if ja_possui:
        raise HTTPException(status_code=400, detail="Você já possui este curso")

    # 1. Registra a compra para o Aluno
    db.add(models.Compra(aluno_email=email, produto_id=produto_id, valor_pago=prod.preco))
    
    # 2. Gera crédito financeiro para o Vendedor
    db.add(models.Movimentacao(vendedor_email=prod.vendedor_email, valor=prod.preco, tipo='venda'))
    
    prod.vendas_count += 1
    db.commit()
    return {"message": "Compra realizada com sucesso!"}

@app.get("/api/meus-cursos")
def listar_meus_cursos(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    return db.query(models.Produto).join(models.Compra).filter(models.Compra.aluno_email == email).all()

# --- ROTAS FINANCEIRAS E DASHBOARD ---

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    movs = db.query(models.Movimentacao).filter(models.Movimentacao.vendedor_email == email).all()
    vendas = [m for m in movs if m.tipo == 'venda']
    
    saldo = sum(v.valor for v in vendas)
    total_vendas = len(vendas)
    
    # Conta alunos únicos
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
    
    # Validação de saldo
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
    # Lista usuários que compraram produtos deste vendedor
    return db.query(models.Usuario).join(models.Compra, models.Usuario.email == models.Compra.aluno_email)\
             .join(models.Produto, models.Compra.produto_id == models.Produto.id)\
             .filter(models.Produto.vendedor_email == email).all()