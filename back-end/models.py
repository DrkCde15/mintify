from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    perfil = Column(String(20), nullable=True) # 'aluno' ou 'vendedor'
    tipo_produto_interesse = Column(String(50), nullable=True) 
    chave_pix = Column(String(100), nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(String(500), nullable=True)
    tipo = Column(String(50), default="Curso Online") 
    preco = Column(Float, nullable=False)
    arquivo_url = Column(String(255), nullable=True)
    imagem_url = Column(String(255), nullable=True) 
    vendedor_email = Column(String(100), nullable=False)
    status = Column(String(20), default="Ativo")   
    vendas_count = Column(Integer, default=0)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Compra(Base):
    __tablename__ = "compras"
    id = Column(Integer, primary_key=True, index=True)
    aluno_email = Column(String(100), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    valor_pago = Column(Float, nullable=False) # Guardar o preço no momento da compra
    data_compra = Column(DateTime(timezone=True), server_default=func.now())

class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    id = Column(Integer, primary_key=True, index=True)
    vendedor_email = Column(String(100), nullable=False)
    valor = Column(Float, nullable=False)
    tipo = Column(String(20)) # 'venda' ou 'saque'
    status = Column(String(20), default="concluido") # 'concluido' ou 'pendente'
    chave_pix = Column(String(100), nullable=True)
    data = Column(DateTime(timezone=True), server_default=func.now())