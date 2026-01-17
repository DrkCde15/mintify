# backend/schemas.py
from pydantic import BaseModel, EmailStr

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class ProdutoResponse(BaseModel):
    id: int
    titulo: str
    tipo: str
    preco: float
    status: str
    vendas_count: int
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    saldo_total: float
    vendas_hoje: int
    novos_alunos: int


class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: dict # Para enviar nome/email junto no login

class UsuarioUpdate(BaseModel):
    perfil: str
    tipo_produto_interesse: str
    chave_pix: str | None = None # Opcional