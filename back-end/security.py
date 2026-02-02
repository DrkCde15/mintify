"""
Módulo de segurança para autenticação e criptografia
Gerencia hashing de senhas e criação de tokens JWT
"""
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from config import settings

# Contexto de criptografia de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_senha_hash(senha: str) -> str:
    """
    Gera hash bcrypt de uma senha
    
    Args:
        senha: Senha em texto puro
        
    Returns:
        Hash da senha
    """
    return pwd_context.hash(senha)


def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    """
    Verifica se uma senha corresponde ao hash
    
    Args:
        senha_pura: Senha em texto puro
        senha_hash: Hash armazenado
        
    Returns:
        True se a senha estiver correta
    """
    return pwd_context.verify(senha_pura, senha_hash)


def criar_token_acesso(data: dict) -> str:
    """
    Cria um token JWT com tempo de expiração
    
    Args:
        data: Dados a serem codificados no token (geralmente {"sub": email})
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt