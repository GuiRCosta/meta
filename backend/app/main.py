"""
Meta Campaign Manager - Backend API
FastAPI server com integração Agno para agentes de IA
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager para startup e shutdown."""
    # Startup
    print("🚀 Iniciando Meta Campaign Manager Backend...")
    print(f"   OpenAI Model: {settings.openai_model}")
    print(f"   Meta Ad Account: {settings.meta_ad_account_id or 'Não configurado'}")
    print(f"   Evolution API: {settings.evolution_api_url or 'Não configurado'}")
    
    yield
    
    # Shutdown
    print("👋 Encerrando servidor...")


app = FastAPI(
    title="Meta Campaign Manager API",
    description="Backend API para gerenciamento de campanhas Meta com agentes de IA",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Meta Campaign Manager API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    """Health check detalhado."""
    return {
        "status": "healthy",
        "openai_configured": bool(settings.openai_api_key),
        "meta_configured": bool(settings.meta_access_token),
        "evolution_configured": bool(settings.evolution_api_key),
        "database_configured": bool(settings.database_url),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
