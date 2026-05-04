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
    
    # Pagamentos
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    PAYPAL_MODE: str = "sandbox"  # 'sandbox' ou 'live'
    PAYPAL_LIVE_CLIENT_ID: str = ""
    PAYPAL_LIVE_SECRET_KEY: str = ""
    PAYPAL_SANDBOX_CLIENT_ID: str = ""
    PAYPAL_SANDBOX_SECRET_KEY: str = ""
    
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
    CORS_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Upload
    MAX_IMAGE_SIZE_MB: int = 5
    MAX_VIDEO_SIZE_MB: int = 500
    MAX_DOC_SIZE_MB: int = 50
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Converte string de origens CORS em lista"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def paypal_base_url(self) -> str:
        """Retorna a URL base do PayPal dependendo do modo"""
        if self.PAYPAL_MODE.lower() == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

    @property
    def paypal_client_id(self) -> str:
        """Retorna o Client ID correto dependendo do modo"""
        if self.PAYPAL_MODE.lower() == "live":
            return self.PAYPAL_LIVE_CLIENT_ID
        return self.PAYPAL_SANDBOX_CLIENT_ID

    @property
    def paypal_secret_key(self) -> str:
        """Retorna a Secret Key correta dependendo do modo"""
        if self.PAYPAL_MODE.lower() == "live":
            return self.PAYPAL_LIVE_SECRET_KEY
        return self.PAYPAL_SANDBOX_SECRET_KEY

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


# Instância global de configurações
settings = Settings()
