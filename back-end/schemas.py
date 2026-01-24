# back-end/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class UsuarioUpdate(BaseModel):
    perfil: Optional[str] = None
    tipo_produto_interesse: Optional[str] = None
    chave_pix: Optional[str] = None

class MidiaProdutoBase(BaseModel):
    url: str # Changed from HttpUrl to str
    tipo: str # 'imagem', 'video', 'arquivo'
    ordem: int = 0

class MidiaProdutoResponse(MidiaProdutoBase):
    id: int
    produto_id: int

    class Config:
        from_attributes = True

class ProdutoResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str] = None
    tipo: str
    preco: float
    midias: List[MidiaProdutoResponse] = []
    status: str
    vendas_count: int
    arquivo_url: Optional[str] = None # Adicionado para retornar a URL do arquivo principal
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    saldo_total: float
    vendas_hoje: int
    novos_alunos: int

class UsuarioSimples(BaseModel):
    nome: str
    email: EmailStr
    perfil: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioSimples

class AvaliacaoCreate(BaseModel):
    produto_id: int
    nota: int
    comentario: Optional[str] = None

class Avaliacao(BaseModel):
    id: int
    nota: int
    comentario: Optional[str] = None
    data_avaliacao: datetime
    aluno: UsuarioSimples

    class Config:
        from_attributes = True
