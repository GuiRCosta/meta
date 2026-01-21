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
    get_account_insights,
    duplicate_campaign,
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


class DuplicateCampaignRequest(BaseModel):
    """Request para duplicar campanha."""
    name_suffix: str = " - Cópia"
    deep_copy: bool = False  # Copiar ad sets e ads também (padrão False para evitar limite)
    status_option: str = "PAUSED"  # Status da nova campanha


@router.get("/")
async def get_campaigns(
    status: Optional[str] = None,
    limit: int = 50,
    include_drafts: bool = True
):
    """
    Lista campanhas da conta Meta Ads.
    
    Args:
        status: Filtrar por ACTIVE, PAUSED, ARCHIVED
        limit: Número máximo de campanhas (padrão: 50)
        include_drafts: Incluir rascunhos (padrão: True)
    """
    result = await list_campaigns(status=status, limit=limit, include_drafts=include_drafts)
    
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


@router.post("/{campaign_id}/duplicate")
async def duplicate(campaign_id: str, request: DuplicateCampaignRequest):
    """
    Duplica uma campanha existente na Meta API usando o endpoint /copies.

    Args:
        campaign_id: ID da campanha original no Meta
        request: Request com opções de duplicação
    """
    result = await duplicate_campaign(
        campaign_id,
        name_suffix=request.name_suffix,
        deep_copy=request.deep_copy,
        status_option=request.status_option
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.get("/insights/account")
async def get_account_insights_endpoint(date_preset: str = "last_7d"):
    """
    Busca insights/métricas da conta Meta Ads (nível de conta).

    Períodos válidos:
    - today, yesterday
    - last_7d, last_14d, last_30d
    - this_month, last_month

    Retorna métricas agregadas de todas as campanhas.
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

    result = await get_account_insights(date_preset)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result
