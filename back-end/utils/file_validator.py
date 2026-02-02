"""
Utilitário para validação de arquivos enviados
Valida tipo MIME, tamanho e sanitiza nomes de arquivos
"""
from fastapi import UploadFile, HTTPException
import os
import re
from typing import Literal

# Tipos MIME permitidos
ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/gif'
}

ALLOWED_VIDEO_TYPES = {
    'video/mp4', 
    'video/quicktime',  # .mov
    'video/x-msvideo',  # .avi
    'video/x-matroska'  # .mkv
}

ALLOWED_DOC_TYPES = {
    'application/pdf', 
    'application/zip',
    'application/x-zip-compressed'
}

# Extensões permitidas (fallback se MIME não estiver disponível)
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv'}
ALLOWED_DOC_EXTENSIONS = {'.pdf', '.zip'}

# Limites de tamanho (em bytes)
MAX_IMAGE_SIZE = 5 * 1024 * 1024      # 5MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024    # 500MB
MAX_DOC_SIZE = 50 * 1024 * 1024       # 50MB

FileType = Literal['image', 'video', 'document']


def sanitize_filename(filename: str) -> str:
    """
    Remove caracteres perigosos do nome do arquivo
    
    Args:
        filename: Nome original do arquivo
        
    Returns:
        Nome sanitizado do arquivo
    """
    # Remove path traversal attempts
    filename = os.path.basename(filename)
    
    # Remove caracteres especiais perigosos
    filename = re.sub(r'[^\w\s\-\.]', '', filename)
    
    # Remove espaços múltiplos
    filename = re.sub(r'\s+', '_', filename)
    
    # Limita o tamanho do nome
    name, ext = os.path.splitext(filename)
    if len(name) > 100:
        name = name[:100]
    
    return f"{name}{ext}".lower()


async def validate_file_size(file: UploadFile, file_type: FileType) -> int:
    """
    Valida o tamanho do arquivo
    
    Args:
        file: Arquivo enviado
        file_type: Tipo do arquivo (image, video, document)
        
    Returns:
        Tamanho do arquivo em bytes
        
    Raises:
        HTTPException: Se o arquivo for muito grande
    """
    # Obter tamanho do arquivo
    file.file.seek(0, 2)  # Vai para o final do arquivo
    file_size = file.file.tell()
    await file.seek(0)  # Volta para o início
    
    # Definir limite baseado no tipo
    max_sizes = {
        'image': MAX_IMAGE_SIZE,
        'video': MAX_VIDEO_SIZE,
        'document': MAX_DOC_SIZE
    }
    
    max_size = max_sizes.get(file_type, MAX_DOC_SIZE)
    max_size_mb = max_size / 1024 / 1024
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400, 
            detail=f"Arquivo muito grande. Tamanho máximo para {file_type}: {max_size_mb:.0f}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio não é permitido"
        )
    
    return file_size


def validate_file_extension(filename: str, file_type: FileType) -> bool:
    """
    Valida a extensão do arquivo
    
    Args:
        filename: Nome do arquivo
        file_type: Tipo esperado do arquivo
        
    Returns:
        True se a extensão for válida
        
    Raises:
        HTTPException: Se a extensão não for permitida
    """
    ext = os.path.splitext(filename)[1].lower()
    
    allowed_extensions = {
        'image': ALLOWED_IMAGE_EXTENSIONS,
        'video': ALLOWED_VIDEO_EXTENSIONS,
        'document': ALLOWED_DOC_EXTENSIONS
    }
    
    if ext not in allowed_extensions.get(file_type, set()):
        allowed = ', '.join(allowed_extensions.get(file_type, set()))
        raise HTTPException(
            status_code=400,
            detail=f"Extensão de arquivo não permitida. Extensões aceitas para {file_type}: {allowed}"
        )
    
    return True


async def validate_upload_file(file: UploadFile, file_type: FileType) -> dict:
    """
    Valida completamente um arquivo enviado
    
    Args:
        file: Arquivo enviado via FastAPI
        file_type: Tipo do arquivo (image, video, document)
        
    Returns:
        Dict com informações do arquivo validado
        
    Raises:
        HTTPException: Se o arquivo não passar nas validações
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nenhum arquivo foi enviado"
        )
    
    # 1. Validar extensão
    validate_file_extension(file.filename, file_type)
    
    # 2. Validar tamanho
    file_size = await validate_file_size(file, file_type)
    
    # 3. Sanitizar nome do arquivo
    safe_filename = sanitize_filename(file.filename)
    
    # 4. Validar content type (se disponível)
    if file.content_type:
        allowed_types = {
            'image': ALLOWED_IMAGE_TYPES,
            'video': ALLOWED_VIDEO_TYPES,
            'document': ALLOWED_DOC_TYPES
        }
        
        if file.content_type not in allowed_types.get(file_type, set()):
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não permitido: {file.content_type}"
            )
    
    return {
        'original_filename': file.filename,
        'safe_filename': safe_filename,
        'size': file_size,
        'content_type': file.content_type,
        'type': file_type
    }


async def validate_multiple_files(files: list[UploadFile], file_type: FileType, max_files: int = 10) -> list[dict]:
    """
    Valida múltiplos arquivos
    
    Args:
        files: Lista de arquivos
        file_type: Tipo dos arquivos
        max_files: Número máximo de arquivos permitidos
        
    Returns:
        Lista de dicts com informações dos arquivos validados
    """
    if len(files) > max_files:
        raise HTTPException(
            status_code=400,
            detail=f"Número máximo de arquivos excedido. Máximo: {max_files}"
        )
    
    validated_files = []
    for file in files:
        validated = await validate_upload_file(file, file_type)
        validated_files.append(validated)
    
    return validated_files
