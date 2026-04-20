from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Generic, TypeVar
from datetime import datetime

T = TypeVar('T')

class PaginatedParams(BaseModel):
    page: int = 1
    per_page: int = 12

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    total_pages: int

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
    url: str
    titulo: Optional[str] = None
    tipo: str # 'imagem', 'video', 'arquivo'
    ordem: int = 0

class ProgressoAulaSchema(BaseModel):
    midia_id: int
    data_conclusao: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class MidiaProdutoResponse(MidiaProdutoBase):
    id: int
    produto_id: int

    model_config = ConfigDict(from_attributes=True)

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
    
    # Novos campos para produtos físicos
    tipo_entrega: str
    estoque: int = 0
    peso_kg: Optional[float] = None
    largura_cm: Optional[float] = None
    altura_cm: Optional[float] = None
    comprimento_cm: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class EnderecoEntrega(BaseModel):
    cep: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str

class CompraRequest(BaseModel):
    endereco: Optional[EnderecoEntrega] = None

class CompraResponse(BaseModel):
    id: int
    aluno_email: EmailStr
    produto_id: int
    valor_pago: float
    tipo_entrega_momento: str
    status_logistica: Optional[str] = None
    codigo_rastreio: Optional[str] = None
    data_compra: datetime
    
    # Endereço
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CompraComProduto(CompraResponse):
    produto: ProdutoResponse

class DashboardStats(BaseModel):
    saldo_total: float
    vendas_hoje: int
    novos_alunos: int

class UsuarioSimples(BaseModel):
    id: int
    nome: str
    email: EmailStr
    perfil: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

class NotificacaoResponse(BaseModel):
    id: int
    titulo: str
    mensagem: str
    tipo: str
    lida: int
    data_criacao: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificacaoUpdate(BaseModel):
    lida: int
