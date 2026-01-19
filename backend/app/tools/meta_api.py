"""
Tools para interação com Meta Marketing API
"""
from typing import Optional
import httpx
from app.config import settings


async def list_campaigns(
    status: Optional[str] = None,
    limit: int = 50
) -> dict:
    """
    Lista todas as campanhas da conta Meta Ads.
    
    Args:
        status: Filtrar por status (ACTIVE, PAUSED, ARCHIVED)
        limit: Número máximo de campanhas
        
    Returns:
        Dict com lista de campanhas e métricas básicas
    """
    if not settings.meta_access_token:
        return {
            "success": False,
            "error": "Meta API não configurada. Configure META_ACCESS_TOKEN no .env",
            "campaigns": []
        }
    
    try:
        url = f"https://graph.facebook.com/v21.0/{settings.meta_ad_account_id}/campaigns"
        params = {
            "access_token": settings.meta_access_token,
            "fields": "id,name,objective,status,daily_budget,lifetime_budget,created_time,updated_time",
            "limit": limit,
        }
        
        if status:
            params["filtering"] = f'[{{"field":"effective_status","operator":"IN","value":["{status}"]}}]'
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
        
        if "error" in data:
            return {
                "success": False,
                "error": data["error"].get("message", "Erro desconhecido"),
                "campaigns": []
            }
        
        campaigns = data.get("data", [])
        return {
            "success": True,
            "total": len(campaigns),
            "campaigns": campaigns
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "campaigns": []
        }


async def get_campaign_details(campaign_id: str) -> dict:
    """
    Busca detalhes de uma campanha específica, incluindo ad sets e ads.
    
    Args:
        campaign_id: ID da campanha no Meta
        
    Returns:
        Dict com detalhes completos da campanha
    """
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}
    
    try:
        url = f"https://graph.facebook.com/v21.0/{campaign_id}"
        params = {
            "access_token": settings.meta_access_token,
            "fields": "id,name,objective,status,daily_budget,lifetime_budget,created_time,adsets{id,name,status,daily_budget,targeting},ads{id,name,status,creative}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
        
        if "error" in data:
            return {"success": False, "error": data["error"].get("message")}
        
        return {"success": True, "campaign": data}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


async def create_campaign(
    name: str,
    objective: str,
    status: str = "PAUSED",
    daily_budget: Optional[int] = None,
    special_ad_categories: list = None
) -> dict:
    """
    Cria uma nova campanha no Meta Ads.
    
    Args:
        name: Nome da campanha
        objective: OUTCOME_SALES, OUTCOME_LEADS, OUTCOME_TRAFFIC, etc.
        status: ACTIVE ou PAUSED
        daily_budget: Orçamento diário em centavos
        special_ad_categories: Lista de categorias especiais (HOUSING, EMPLOYMENT, etc.)
        
    Returns:
        Dict com ID da campanha criada
    """
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}
    
    try:
        url = f"https://graph.facebook.com/v21.0/{settings.meta_ad_account_id}/campaigns"
        data = {
            "access_token": settings.meta_access_token,
            "name": name,
            "objective": objective,
            "status": status,
            "special_ad_categories": special_ad_categories or [],
        }
        
        if daily_budget:
            data["daily_budget"] = daily_budget
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data)
            result = response.json()
        
        if "error" in result:
            return {"success": False, "error": result["error"].get("message")}
        
        return {
            "success": True,
            "campaign_id": result.get("id"),
            "message": f"Campanha '{name}' criada com sucesso!"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


async def update_campaign_status(campaign_id: str, status: str) -> dict:
    """
    Atualiza o status de uma campanha (ACTIVE, PAUSED, ARCHIVED).
    
    Args:
        campaign_id: ID da campanha
        status: Novo status
        
    Returns:
        Dict com resultado da operação
    """
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}
    
    try:
        url = f"https://graph.facebook.com/v21.0/{campaign_id}"
        data = {
            "access_token": settings.meta_access_token,
            "status": status,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data)
            result = response.json()
        
        if "error" in result:
            return {"success": False, "error": result["error"].get("message")}
        
        return {
            "success": True,
            "message": f"Campanha atualizada para {status}"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_campaign_insights(
    campaign_id: str,
    date_preset: str = "last_7d"
) -> dict:
    """
    Busca insights/métricas de uma campanha.
    
    Args:
        campaign_id: ID da campanha
        date_preset: today, yesterday, last_7d, last_14d, last_30d, this_month
        
    Returns:
        Dict com métricas da campanha
    """
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}
    
    try:
        url = f"https://graph.facebook.com/v21.0/{campaign_id}/insights"
        params = {
            "access_token": settings.meta_access_token,
            "fields": "impressions,clicks,spend,cpc,cpm,ctr,reach,conversions,cost_per_conversion",
            "date_preset": date_preset,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
        
        if "error" in data:
            return {"success": False, "error": data["error"].get("message")}
        
        insights = data.get("data", [{}])[0] if data.get("data") else {}
        
        return {
            "success": True,
            "period": date_preset,
            "insights": {
                "impressions": int(insights.get("impressions", 0)),
                "clicks": int(insights.get("clicks", 0)),
                "spend": float(insights.get("spend", 0)),
                "cpc": float(insights.get("cpc", 0)),
                "cpm": float(insights.get("cpm", 0)),
                "ctr": float(insights.get("ctr", 0)),
                "reach": int(insights.get("reach", 0)),
                "conversions": int(insights.get("conversions", 0)) if insights.get("conversions") else 0,
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
