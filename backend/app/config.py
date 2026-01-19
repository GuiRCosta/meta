"""
Configurações do Backend
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente."""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    
    # Database (Supabase)
    database_url: str = ""
    
    # Meta Ads API
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_access_token: str = ""
    meta_ad_account_id: str = ""
    
    # Evolution API (WhatsApp)
    evolution_api_url: str = ""
    evolution_api_key: str = ""
    evolution_instance: str = ""
    
    # Frontend
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Retorna as configurações cacheadas."""
    return Settings()


settings = get_settings()
