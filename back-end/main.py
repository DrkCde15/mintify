from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
import shutil
import os
import models, schemas, security
from database import engine, get_db

# Cria as tabelas automaticamente no MySQL ao iniciar
models.Base.metadata.create_all(bind=engine)

# Configuração da pasta para salvar os arquivos
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI(title="Mintify API")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/usuarios/login")

# --- DEPENDÊNCIA DE AUTENTICAÇÃO ---

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão expirada ou inválida.",
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

# --- ROTAS DE USUÁRIO ---

@app.post("/api/usuarios/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    novo_usuario = models.Usuario(
        nome=user.nome,
        email=user.email,
        senha=security.gerar_senha_hash(user.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"message": "Sucesso!", "id": novo_usuario.id}

@app.post("/api/usuarios/login", response_model=schemas.Token)
def login(dados: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not user or not security.verificar_senha(dados.senha, user.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    
    access_token = security.criar_token_acesso(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {"nome": user.nome, "email": user.email, "perfil": user.perfil}
    }

@app.put("/api/usuarios/completar-perfil")
def completar_perfil(dados: schemas.UsuarioUpdate, db: Session = Depends(get_db), current_user_email: str = Depends(get_current_user)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == current_user_email).first()
    if not db_user: raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db_user.perfil = dados.perfil
    db_user.tipo_produto_interesse = dados.tipo_produto_interesse
    if dados.chave_pix: db_user.chave_pix = dados.chave_pix
    
    db.commit()
    return {"message": "Perfil atualizado!"}

# --- ROTAS DE PRODUTO ---

@app.get("/api/produtos", response_model=List[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(models.Produto).all()

@app.post("/api/produtos/upload")
async def upload_produto(
    titulo: str = Form(...),
    preco: float = Form(...),
    descricao: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Recebe arquivo + dados e salva no banco e na pasta uploads/
    """
    # Salva o arquivo fisicamente
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Salva no MySQL
    novo_produto = models.Produto(
        titulo=titulo,
        preco=preco,
        descricao=descricao,
        arquivo_url=file_path,
        vendedor_email=current_user
    )
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    return {"message": "Produto criado!", "id": novo_produto.id}

# --- OUTRAS ROTAS ---

@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return {"saldo_total": 15780.00, "vendas_hoje": 12, "novos_alunos": 4}

@app.get("/api/alunos")
def listar_alunos(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(models.Aluno).all()

@app.get("/api/financeiro")
def get_financeiro(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return {
        "saldo": 15780.00,
        "saques": [{"id": 1, "data": "2024-03-10", "valor": 500.0, "status": "Concluído"}]
    }