from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 
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
    avaliacoes = relationship("Avaliacao", back_populates="aluno")

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(String(500), nullable=True)
    tipo = Column(String(50), default="Curso Online") # Ex: 'Curso', 'Ebook', 'Suplemento'
    tipo_entrega = Column(String(20), default="digital", index=True) # 'digital' ou 'fisico'
    preco = Column(Float, nullable=False)
    vendedor_email = Column(String(100), nullable=False, index=True)
    status = Column(String(20), default="Ativo", index=True)   
    vendas_count = Column(Integer, default=0)
    
    # Novos campos para produtos físicos
    estoque = Column(Integer, default=0)
    peso_kg = Column(Float, nullable=True)
    largura_cm = Column(Float, nullable=True)
    altura_cm = Column(Float, nullable=True)
    comprimento_cm = Column(Float, nullable=True)
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    avaliacoes = relationship("Avaliacao", back_populates="produto")
    midias = relationship("MidiaProduto", back_populates="produto", cascade="all, delete-orphan")

class MidiaProduto(Base):
    __tablename__ = "midias_produto"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    titulo = Column(String(150), nullable=True) 
    url = Column(String(255), nullable=False)
    tipo = Column(String(20), nullable=False) # 'imagem', 'video', 'arquivo'
    ordem = Column(Integer, default=0) # Para ordenar a exibição
    produto = relationship("Produto", back_populates="midias")

class Compra(Base):
    __tablename__ = "compras"
    id = Column(Integer, primary_key=True, index=True)
    aluno_email = Column(String(100), nullable=False, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), index=True)
    valor_pago = Column(Float, nullable=False)
    
    # Campo para identificar o tipo na hora da compra
    tipo_entrega_momento = Column(String(20), default="digital")
    forma_pagamento = Column(String(20), nullable=True)
    
    # Campos de Logística (apenas para físico)
    status_logistica = Column(String(30), nullable=True) # 'pedente_envio', 'enviado', 'entregue'
    codigo_rastreio = Column(String(100), nullable=True)
    
    # Endereço de Entrega
    cep = Column(String(10), nullable=True)
    logradouro = Column(String(150), nullable=True)
    numero = Column(String(20), nullable=True)
    complemento = Column(String(100), nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    
    data_compra = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto")

class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    id = Column(Integer, primary_key=True, index=True)
    vendedor_email = Column(String(100), nullable=False, index=True)
    valor = Column(Float, nullable=False)
    tipo = Column(String(20), index=True) # 'venda' ou 'saque'
    status = Column(String(20), default="concluido") # 'concluido' ou 'pendente'
    chave_pix = Column(String(100), nullable=True)
    data = Column(DateTime(timezone=True), server_default=func.now())

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False, index=True)
    aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    nota = Column(Integer, nullable=False) # e.g., 1 to 5
    comentario = Column(String(500), nullable=True)
    data_avaliacao = Column(DateTime(timezone=True), server_default=func.now())
    produto = relationship("Produto", back_populates="avaliacoes")
    aluno = relationship("Usuario", back_populates="avaliacoes")

class Notificacao(Base):
    __tablename__ = "notificacoes"
    id = Column(Integer, primary_key=True, index=True)
    usuario_email = Column(String(100), ForeignKey("usuarios.email"), nullable=False, index=True)
    titulo = Column(String(150), nullable=False)
    mensagem = Column(String(500), nullable=False)
    tipo = Column(String(50), default="geral") # 'venda', 'entrega', 'sistema'
    lida = Column(Integer, default=0) # 0 = não lida, 1 = lida
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())

class ProgressoAula(Base):
    __tablename__ = "progresso_aulas"
    id = Column(Integer, primary_key=True, index=True)
    aluno_email = Column(String(100), ForeignKey("usuarios.email"), nullable=False, index=True)
    midia_id = Column(Integer, ForeignKey("midias_produto.id"), nullable=False)
    data_conclusao = Column(DateTime(timezone=True), server_default=func.now())
