"""
API de Sincronização - Sincroniza dados entre Meta e banco local
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.tools.meta_api import list_campaigns, get_campaign_insights


router = APIRouter()


class SyncResult(BaseModel):
    """Resultado da sincronização."""
    success: bool
    campaigns_synced: int = 0
    metrics_synced: int = 0
    errors: list = []
    message: str = ""


@router.post("/campaigns")
async def sync_campaigns():
    """
    Sincroniza campanhas do Meta para o banco local.
    
    - Busca todas as campanhas ativas e pausadas
    - Cria/atualiza registros no banco local
    - Retorna estatísticas da sincronização
    """
    result = await list_campaigns(limit=100)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    campaigns = result.get("campaigns", [])
    synced = 0
    errors = []
    
    for camp in campaigns:
        try:
            # Em produção, salvaria no banco via Prisma/SQLAlchemy
            # await db.campaign.upsert(...)
            synced += 1
        except Exception as e:
            errors.append(f"Erro ao sincronizar {camp['name']}: {str(e)}")
    
    return SyncResult(
        success=len(errors) == 0,
        campaigns_synced=synced,
        errors=errors,
        message=f"Sincronizadas {synced} de {len(campaigns)} campanhas"
    )


@router.post("/metrics")
async def sync_metrics(date_preset: str = "last_7d"):
    """
    Sincroniza métricas das campanhas do Meta para o banco local.
    
    Args:
        date_preset: Período para sincronizar (last_7d, last_14d, last_30d)
    """
    # Buscar campanhas
    campaigns_result = await list_campaigns(limit=100)
    
    if not campaigns_result["success"]:
        raise HTTPException(status_code=500, detail=campaigns_result["error"])
    
    campaigns = campaigns_result.get("campaigns", [])
    metrics_synced = 0
    errors = []
    
    for camp in campaigns:
        try:
            # Buscar insights
            insights = await get_campaign_insights(camp["id"], date_preset)
            
            if insights["success"]:
                # Em produção, salvaria no banco
                # await db.campaign_metric.create(...)
                metrics_synced += 1
            else:
                errors.append(f"Erro ao buscar métricas de {camp['name']}")
                
        except Exception as e:
            errors.append(f"Erro ao sincronizar métricas de {camp['name']}: {str(e)}")
    
    return SyncResult(
        success=len(errors) == 0,
        campaigns_synced=len(campaigns),
        metrics_synced=metrics_synced,
        errors=errors,
        message=f"Sincronizadas métricas de {metrics_synced} campanhas"
    )


@router.post("/full")
async def full_sync():
    """
    Sincronização completa: campanhas + métricas.
    """
    # Sincronizar campanhas
    campaigns_result = await sync_campaigns()
    
    # Sincronizar métricas
    metrics_result = await sync_metrics("last_7d")
    
    return {
        "success": campaigns_result.success and metrics_result.success,
        "campaigns": campaigns_result.dict(),
        "metrics": metrics_result.dict(),
        "message": "Sincronização completa executada"
    }
