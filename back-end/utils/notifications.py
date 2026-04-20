from sqlalchemy.orm import Session
import models
from utils.email import enviar_notificacao_venda

def criar_notificacao(db: Session, email: str, titulo: str, mensagem: str, tipo: str = "geral"):
    """Cria uma notificação in-app no banco de dados"""
    nova_notificacao = models.Notificacao(
        usuario_email=email,
        titulo=titulo,
        mensagem=mensagem,
        tipo=tipo
    )
    db.add(nova_notificacao)
    db.commit()
    return nova_notificacao

def notificar_venda(db: Session, email_vendedor: str, nome_produto: str, valor: float):
    """Notifica o vendedor via E-mail e In-App"""
    titulo = "🔥 Nova Venda Realizada!"
    mensagem = f"Você vendeu o produto '{nome_produto}' por R$ {valor:.2f}."
    
    # Notificação In-App
    criar_notificacao(db, email_vendedor, titulo, mensagem, tipo="venda")
    
    # E-mail (já existente)
    try:
        enviar_notificacao_venda(email_vendedor, nome_produto, valor)
    except Exception as e:
        print(f"⚠️ Erro ao enviar e-mail de venda: {e}")

def notificar_rastreio(db: Session, email_aluno: str, nome_produto: str, codigo: str):
    """Notifica o aluno sobre a atualização do rastreio"""
    titulo = "📦 Seu pedido foi enviado!"
    mensagem = f"O produto '{nome_produto}' já está a caminho. Código de rastreio: {codigo}"
    
    criar_notificacao(db, email_aluno, titulo, mensagem, tipo="entrega")
