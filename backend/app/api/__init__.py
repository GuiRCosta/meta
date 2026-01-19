"""
API Routes
"""
from fastapi import APIRouter
from app.api.chat import router as chat_router
from app.api.campaigns import router as campaigns_router
from app.api.sync import router as sync_router

router = APIRouter()

# Incluir rotas
router.include_router(chat_router, prefix="/agent", tags=["Agent"])
router.include_router(campaigns_router, prefix="/campaigns", tags=["Campaigns"])
router.include_router(sync_router, prefix="/sync", tags=["Sync"])
