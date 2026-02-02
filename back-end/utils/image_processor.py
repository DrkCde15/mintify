"""
Utilitário para processamento e compressão de imagens
Redimensiona, otimiza e converte imagens para formatos modernos (WebP)
"""
import os
from PIL import Image
from typing import Tuple

def compress_image(
    input_path: str, 
    output_path: str, 
    max_width: int = 1200, 
    quality: int = 80,
    convert_to_webp: bool = True
) -> str:
    """
    Comprime e redimensiona uma imagem mantendo a proporção.
    
    Args:
        input_path: Caminho da imagem original
        output_path: Caminho para salvar a imagem processada
        max_width: Largura máxima permitida
        quality: Qualidade da compressão (1-95)
        convert_to_webp: Se deve converter para .webp
        
    Returns:
        Caminho final da imagem salva
    """
    with Image.open(input_path) as img:
        # Converter para RGB se necessário (ex: PNG com transparência para JPEG)
        if img.mode in ("RGBA", "P") and not convert_to_webp:
            img = img.convert("RGB")
            
        # Redimensionar se for maior que o máximo
        width, height = img.size
        if width > max_width:
            ratio = max_width / width
            new_size = (max_width, int(height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        
        # Ajustar extensão se converter para WebP
        if convert_to_webp:
            base_name = os.path.splitext(output_path)[0]
            output_path = f"{base_name}.webp"
            img.save(output_path, "WEBP", quality=quality, optimize=True)
        else:
            img.save(output_path, optimize=True, quality=quality)
            
    return output_path
