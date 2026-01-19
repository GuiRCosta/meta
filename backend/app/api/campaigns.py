"""
API de Campanhas - Proxy para Meta API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.tools.meta_api import (
    list_campaigns,
    get_campaign_details,
    create_campaign,
    update_campaign_status,
    get_campaign_insights,
)


router = APIRouter()


class CreateCampaignRequest(BaseModel):
    """Request para criar campanha."""
    name: str
    objective: str
    status: str = "PAUSED"
    daily_budget: Optional[int] = None  # Em centavos


class UpdateStatusRequest(BaseModel):
    """Request para atualizar status."""
    status: str  # ACTIVE, PAUSED, ARCHIVED


@router.get("/")
async def get_campaigns(
    status: Optional[str] = None,
    limit: int = 50
):
    """
    Lista campanhas da conta Meta Ads.
    
    Args:
        status: Filtrar por ACTIVE, PAUSED, ARCHIVED
        limit: Número máximo de campanhas (padrão: 50)
    """
    result = await list_campaigns(status=status, limit=limit)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str):
    """
    Busca detalhes de uma campanha específica.
    
    Args:
        campaign_id: ID da campanha no Meta
    """
    result = await get_campaign_details(campaign_id)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.post("/")
async def create_new_campaign(request: CreateCampaignRequest):
    """
    Cria uma nova campanha no Meta Ads.
    
    Objetivos válidos:
    - OUTCOME_SALES: Vendas/Conversões
    - OUTCOME_LEADS: Geração de leads
    - OUTCOME_TRAFFIC: Tráfego para site
    - OUTCOME_ENGAGEMENT: Engajamento
    - OUTCOME_AWARENESS: Reconhecimento de marca
    """
    result = await create_campaign(
        name=request.name,
        objective=request.objective,
        status=request.status,
        daily_budget=request.daily_budget,
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.patch("/{campaign_id}/status")
async def update_status(campaign_id: str, request: UpdateStatusRequest):
    """
    Atualiza o status de uma campanha.
    
    Status válidos: ACTIVE, PAUSED, ARCHIVED
    """
    if request.status not in ["ACTIVE", "PAUSED", "ARCHIVED"]:
        raise HTTPException(
            status_code=400,
            detail="Status deve ser ACTIVE, PAUSED ou ARCHIVED"
        )
    
    result = await update_campaign_status(campaign_id, request.status)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/{campaign_id}/insights")
async def get_insights(
    campaign_id: str,
    date_preset: str = "last_7d"
):
    """
    Busca insights/métricas de uma campanha.
    
    Períodos válidos:
    - today, yesterday
    - last_7d, last_14d, last_30d
    - this_month, last_month
    """
    valid_presets = [
        "today", "yesterday",
        "last_7d", "last_14d", "last_30d",
        "this_month", "last_month"
    ]
    
    if date_preset not in valid_presets:
        raise HTTPException(
            status_code=400,
            detail=f"date_preset deve ser um de: {', '.join(valid_presets)}"
        )
    
    result = await get_campaign_insights(campaign_id, date_preset)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result
