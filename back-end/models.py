# backend/models.py
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
    tipo_produto_interesse = Column(String(50), nullable=True) # ebook, video, etc
    chave_pix = Column(String(100), nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    tipo = Column(String(50), default="Curso Online") # E-book, Mentoria, etc.
    preco = Column(Float, nullable=False)
    status = Column(String(20), default="Ativo")   # Ativo, Rascunho
    vendas_count = Column(Integer, default=0)

class Transacao(Base):
    __tablename__ = "transacoes"
    id = Column(Integer, primary_key=True, index=True)
    valor = Column(Float, nullable=False)
    status = Column(String(20), default="Pago") # Pago, Pendente, Cancelado
    data = Column(DateTime(timezone=True), server_default=func.now())
    
class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(20), default="Ativo") # Ativo, Bloqueado, Atrasado
    data_entrada = Column(DateTime(timezone=True), server_default=func.now())