"""
Configurações da aplicação usando Pydantic Settings
Carrega e valida variáveis de ambiente
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Banco de Dados
    DATABASE_URL: str
    
    # Segurança JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # E-mail (SMTP)
    EMAIL: str = ""
    EMAIL_PASS_APP: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USE_TLS: bool = True
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Mintify"
    SMTP_FROM_EMAIL: str = ""
    
    # Ambiente
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"
    
    # Upload
    MAX_IMAGE_SIZE_MB: int = 5
    MAX_VIDEO_SIZE_MB: int = 500
    MAX_DOC_SIZE_MB: int = 50
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    # Fluxo de compra
    # False: exige fluxo externo de pagamento (ex.: Cakto webhook) para liberar acesso.
    # True: permite compra interna imediata (modo legado).
    ALLOW_INTERNAL_PURCHASE: bool = False
    
    # Cakto API
    CAKTO_BASE_URL: str = "https://api.cakto.com.br"
    CAKTO_CLIENT_ID: str = ""
    CAKTO_CLIENT_SECRET: str = ""
    CAKTO_FALLBACK_CHECKOUT_URL: str = ""
    CAKTO_AUTO_CREATE_CHECKOUT: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Converte string de origens CORS em lista"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


# Instância global de configurações
settings = Settings()
