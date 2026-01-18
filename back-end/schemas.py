# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

# Schema de Atualização de Perfil (O segredo está no Optional)
class UsuarioUpdate(BaseModel):
    perfil: Optional[str] = None
    tipo_produto_interesse: Optional[str] = None
    chave_pix: Optional[str] = None

class ProdutoResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str] = None
    tipo: str
    preco: float
    imagem_url: Optional[str] = None
    arquivo_url: Optional[str] = None
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
    usuario: dict