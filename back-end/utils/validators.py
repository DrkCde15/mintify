"""
Utilitários de validação de dados de negócio
Valida preços, chaves PIX, valores de saque, etc.
"""
import re
from fastapi import HTTPException
from typing import Optional


def validar_preco(preco: float) -> float:
    """
    Valida se o preço está dentro dos limites permitidos
    
    Args:
        preco: Valor do preço
        
    Returns:
        Preço arredondado para 2 casas decimais
        
    Raises:
        HTTPException: Se o preço estiver fora dos limites
    """
    if preco < 1.0:
        raise HTTPException(
            status_code=400, 
            detail="Preço mínimo é R$ 1,00"
        )
    
    if preco > 10000.0:
        raise HTTPException(
            status_code=400, 
            detail="Preço máximo é R$ 10.000,00"
        )
    
    return round(preco, 2)


def validar_cpf(cpf: str) -> bool:
    """
    Valida formato de CPF (apenas formato, não valida dígitos verificadores)
    
    Args:
        cpf: String com CPF
        
    Returns:
        True se o formato for válido
    """
    # Remove caracteres não numéricos
    cpf_limpo = re.sub(r'\D', '', cpf)
    
    # Verifica se tem 11 dígitos
    if len(cpf_limpo) != 11:
        return False
    
    # Verifica se não é uma sequência repetida (111.111.111-11, etc)
    if cpf_limpo == cpf_limpo[0] * 11:
        return False
    
    return True


def validar_cnpj(cnpj: str) -> bool:
    """
    Valida formato de CNPJ (apenas formato, não valida dígitos verificadores)
    
    Args:
        cnpj: String com CNPJ
        
    Returns:
        True se o formato for válido
    """
    # Remove caracteres não numéricos
    cnpj_limpo = re.sub(r'\D', '', cnpj)
    
    # Verifica se tem 14 dígitos
    if len(cnpj_limpo) != 14:
        return False
    
    # Verifica se não é uma sequência repetida
    if cnpj_limpo == cnpj_limpo[0] * 14:
        return False
    
    return True


def validar_email(email: str) -> bool:
    """
    Valida formato de e-mail
    
    Args:
        email: String com e-mail
        
    Returns:
        True se o formato for válido
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validar_telefone(telefone: str) -> bool:
    """
    Valida formato de telefone brasileiro
    Aceita: +5511999999999, 11999999999, (11) 99999-9999
    
    Args:
        telefone: String com telefone
        
    Returns:
        True se o formato for válido
    """
    # Remove caracteres não numéricos
    tel_limpo = re.sub(r'\D', '', telefone)
    
    # Remove código do país se presente
    if tel_limpo.startswith('55'):
        tel_limpo = tel_limpo[2:]
    
    # Verifica se tem 10 ou 11 dígitos (com DDD)
    if len(tel_limpo) not in [10, 11]:
        return False
    
    # Verifica se o DDD é válido (11 a 99)
    ddd = int(tel_limpo[:2])
    if ddd < 11 or ddd > 99:
        return False
    
    return True


def validar_chave_aleatoria(chave: str) -> bool:
    """
    Valida formato de chave PIX aleatória (UUID)
    
    Args:
        chave: String com chave aleatória
        
    Returns:
        True se o formato for válido
    """
    pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
    return bool(re.match(pattern, chave.lower()))


def validar_chave_pix(chave: str) -> bool:
    """
    Valida formato de chave PIX
    Aceita: CPF, CNPJ, E-mail, Telefone, Chave Aleatória
    
    Args:
        chave: String com a chave PIX
        
    Returns:
        True se o formato for válido
        
    Raises:
        HTTPException: Se o formato for inválido
    """
    if not chave or len(chave.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Chave PIX não pode ser vazia"
        )
    
    chave = chave.strip()
    
    # Tenta validar como CPF
    if validar_cpf(chave):
        return True
    
    # Tenta validar como CNPJ
    if validar_cnpj(chave):
        return True
    
    # Tenta validar como e-mail
    if validar_email(chave):
        return True
    
    # Tenta validar como telefone
    if validar_telefone(chave):
        return True
    
    # Tenta validar como chave aleatória
    if validar_chave_aleatoria(chave):
        return True
    
    raise HTTPException(
        status_code=400,
        detail="Formato de chave PIX inválido. Use CPF, CNPJ, e-mail, telefone ou chave aleatória."
    )


def validar_valor_saque(valor: float, saldo_disponivel: float) -> float:
    """
    Valida valor de saque
    
    Args:
        valor: Valor solicitado para saque
        saldo_disponivel: Saldo disponível na conta
        
    Returns:
        Valor arredondado para 2 casas decimais
        
    Raises:
        HTTPException: Se o valor for inválido
    """
    if valor <= 0:
        raise HTTPException(
            status_code=400,
            detail="Valor de saque deve ser maior que zero"
        )
    
    if valor < 10.0:
        raise HTTPException(
            status_code=400,
            detail="Valor mínimo de saque é R$ 10,00"
        )
    
    if valor > saldo_disponivel:
        raise HTTPException(
            status_code=400,
            detail=f"Saldo insuficiente. Disponível: R$ {saldo_disponivel:.2f}"
        )
    
    return round(valor, 2)


def validar_nota_avaliacao(nota: int) -> int:
    """
    Valida nota de avaliação
    
    Args:
        nota: Nota de 1 a 5
        
    Returns:
        Nota validada
        
    Raises:
        HTTPException: Se a nota for inválida
    """
    if nota < 1 or nota > 5:
        raise HTTPException(
            status_code=400,
            detail="Nota deve ser entre 1 e 5"
        )
    
    return nota


def validar_comentario(comentario: Optional[str], max_length: int = 500) -> Optional[str]:
    """
    Valida comentário de avaliação
    
    Args:
        comentario: Texto do comentário
        max_length: Tamanho máximo permitido
        
    Returns:
        Comentário validado
        
    Raises:
        HTTPException: Se o comentário for muito longo
    """
    if not comentario:
        return None
    
    comentario = comentario.strip()
    
    if len(comentario) > max_length:
        raise HTTPException(
            status_code=400,
            detail=f"Comentário muito longo. Máximo: {max_length} caracteres"
        )
    
    return comentario if comentario else None
