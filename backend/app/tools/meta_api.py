"""
Tools para interação com Meta Marketing API
"""
from typing import Optional
import asyncio
import httpx
from app.config import settings


def _get_auth_headers() -> dict:
    """
    Returns authorization headers for Meta API requests.
    Using Authorization header is more secure than query params.
    """
    return {
        "Authorization": f"Bearer {settings.meta_access_token}",
    }


async def list_campaigns(
    status: Optional[str] = None,
    limit: int = 50,
    include_drafts: bool = True
) -> dict:
    """
    Lista todas as campanhas da conta Meta Ads.
    
    Args:
        status: Filtrar por status (ACTIVE, PAUSED, ARCHIVED)
        limit: Número máximo de campanhas
        include_drafts: Incluir rascunhos (campanhas em preview/draft)
        
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
        # Garantir que o Account ID tenha o prefixo 'act_'
        account_id = settings.meta_ad_account_id
        if not account_id.startswith('act_'):
            account_id = f'act_{account_id}'
        
        url = f"https://graph.facebook.com/v24.0/{account_id}/campaigns"

        # Use Authorization header instead of query param for security
        headers = {
            "Authorization": f"Bearer {settings.meta_access_token}",
        }

        params = {
            "fields": "id,name,objective,status,effective_status,daily_budget,lifetime_budget,special_ad_categories,created_time,updated_time",
            "limit": limit,
        }
        
        # Incluir rascunhos se solicitado (campanhas com effective_status = PREVIEW ou status = PREPAUSED)
        if include_drafts and not status:
            # Buscar todas as campanhas incluindo rascunhos
            pass  # Sem filtro para incluir tudo
        elif status:
            params["filtering"] = f'[{{"field":"effective_status","operator":"IN","value":["{status}"]}}]'
        
        all_campaigns = []
        next_url = None
        
        async with httpx.AsyncClient() as client:
            # Primeira requisição
            response = await client.get(url, params=params, headers=headers, timeout=30)
            data = response.json()
            
            if "error" in data:
                error = data["error"]
                error_code = error.get("code")
                error_message = error.get("message", "Erro desconhecido")
                
                # Tratar rate limiting
                if error_code == 80004 or "too many calls" in error_message.lower():
                    return {
                        "success": False,
                        "error": "Muitas requisições à Meta API. Aguarde alguns segundos e tente novamente.",
                        "error_code": error_code,
                        "campaigns": []
                    }
                
                return {
                    "success": False,
                    "error": error_message,
                    "error_code": error_code,
                    "campaigns": []
                }
            
            # Adicionar campanhas da primeira página
            campaigns = data.get("data", [])
            all_campaigns.extend(campaigns)
            
            # Buscar páginas seguintes (paginação automática)
            paging = data.get("paging", {})
            next_url = paging.get("next")
            page_count = 1
            
            # Limitar número de páginas para evitar loops infinitos ou rate limiting
            max_pages = 50  # Máximo 50 páginas (50 * limit = muitas campanhas)
            
            while next_url and page_count < max_pages:
                try:
                    # Pequeno delay entre páginas para evitar rate limiting
                    await asyncio.sleep(0.5)  # 500ms entre páginas
                    
                    response = await client.get(next_url, timeout=30)
                    data = response.json()
                    
                    if "error" in data:
                        error = data["error"]
                        error_code = error.get("code")
                        
                        # Se for rate limiting, parar e retornar o que já temos
                        if error_code == 80004 or "too many calls" in error.get("message", "").lower():
                            break
                        
                        # Para outros erros, também parar
                        break
                    
                    campaigns = data.get("data", [])
                    all_campaigns.extend(campaigns)
                    
                    paging = data.get("paging", {})
                    next_url = paging.get("next")
                    page_count += 1
                    
                except Exception as e:
                    # Se houver erro ao buscar próxima página, retornar o que já temos
                    print(f"Aviso: Erro ao buscar página {page_count + 1}: {e}")
                    break
        
        campaigns = all_campaigns
        
        # Filtrar rascunhos se não solicitado
        if not include_drafts:
            campaigns = [c for c in campaigns if c.get("effective_status") not in ["PREVIEW", "DRAFT"] and c.get("status") != "PREPAUSED"]
        
        # Aplicar limite se especificado (já aplicado nas requisições, mas garantir)
        if limit and len(campaigns) > limit:
            campaigns = campaigns[:limit]
        
        return {
            "success": True,
            "total": len(campaigns),
            "campaigns": campaigns,
            "pages_fetched": page_count,
            "has_more": next_url is not None and page_count >= max_pages
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
        url = f"https://graph.facebook.com/v24.0/{campaign_id}"
        headers = _get_auth_headers()
        params = {
            "fields": "id,name,objective,status,daily_budget,lifetime_budget,special_ad_categories,created_time,adsets{id,name,status,daily_budget,targeting},ads{id,name,status,creative}"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=30)
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
        # Garantir que o Account ID tenha o prefixo 'act_'
        account_id = settings.meta_ad_account_id
        if not account_id.startswith('act_'):
            account_id = f'act_{account_id}'
        
        url = f"https://graph.facebook.com/v24.0/{account_id}/campaigns"
        headers = _get_auth_headers()

        # Construir parâmetros
        data = {
            "name": name,
            "objective": objective,
            "status": status,
        }
        
        # special_ad_categories - só adicionar se não estiver vazio
        # Meta API requer este campo, mas pode ser omitido se for vazio
        categories = special_ad_categories if special_ad_categories else []
        # Tentar sem o campo primeiro, se necessário adicionar depois
        # Mas alguns objetivos requerem o campo explícito
        
        if daily_budget:
            data["daily_budget"] = daily_budget
        
        async with httpx.AsyncClient() as client:
            # Meta API requer special_ad_categories, mesmo que vazio
            # Enviar como JSON quando for array (vazio ou não)
            data["special_ad_categories"] = categories

            # Usar JSON para arrays funcionarem corretamente
            response = await client.post(url, json=data, headers=headers, timeout=30)
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
        url = f"https://graph.facebook.com/v24.0/{campaign_id}"
        headers = _get_auth_headers()
        data = {
            "status": status,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data, headers=headers, timeout=30)
            result = response.json()
        
        if "error" in result:
            return {"success": False, "error": result["error"].get("message")}
        
        return {
            "success": True,
            "message": f"Campanha atualizada para {status}"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


async def duplicate_campaign(
    campaign_id: str, 
    name_suffix: str = " - Cópia",
    deep_copy: bool = False,  # Padrão False para evitar erro "solicitação muito grande"
    status_option: str = "PAUSED"
) -> dict:
    """
    Duplica uma campanha existente na Meta API usando o endpoint /copies.
    
    Args:
        campaign_id: ID da campanha original no Meta
        name_suffix: Sufixo para o nome da campanha duplicada
        deep_copy: Se deve copiar também ad sets e anúncios (padrão: True)
        status_option: Status da nova campanha (ACTIVE, PAUSED) - padrão: PAUSED
        
    Returns:
        Dict com ID da nova campanha criada
    """
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}
    
    try:
        # Usar o endpoint nativo /copies da Meta API
        # Garantir que o Account ID tenha o prefixo 'act_' se necessário
        # Para campaigns, não precisa do prefixo, mas para ad accounts sim
        url = f"https://graph.facebook.com/v24.0/{campaign_id}/copies"
        headers = _get_auth_headers()

        # Preparar parâmetros - Meta API aceita form-data ou JSON
        data = {
            "deep_copy": "true" if deep_copy else "false",
            "status_option": status_option,
        }
        
        # Adicionar sufixo no nome
        if name_suffix:
            # Limpar sufixo (remover espaços extras)
            clean_suffix = name_suffix.strip()
            # Se não começa com espaço ou traço, adicionar
            if not clean_suffix.startswith(" ") and not clean_suffix.startswith("-"):
                clean_suffix = " " + clean_suffix
            data["rename_suffix"] = clean_suffix
        
        async with httpx.AsyncClient() as client:
            # Meta API /copies aceita form-data
            response = await client.post(url, data=data, headers=headers, timeout=30)
            result = response.json()
        
        if "error" in result:
            error_info = result["error"]
            error_msg = error_info.get("message", "Erro desconhecido")
            error_code = error_info.get("code")
            error_subcode = error_info.get("error_subcode")
            
            # Erro específico: solicitação de cópia muito grande
            if error_code == 100 and error_subcode == 1885194:
                # Tentar novamente sem deep_copy se estava habilitado
                if deep_copy:
                    return {
                        "success": False,
                        "error": "A campanha tem muitos ad sets e anúncios. Use deep_copy=false ou use batch requests.",
                        "error_code": error_code,
                        "error_type": error_info.get("type", "Unknown"),
                        "suggestion": "Tente duplicar novamente com deep_copy=false ou divida em batch requests.",
                    }
            
            return {
                "success": False,
                "error": error_msg,
                "error_code": error_code,
                "error_type": error_info.get("type", "Unknown"),
                "error_subcode": error_subcode,
            }
        
        # A resposta da Meta API retorna o ID em "copied_campaign_id" ou "ad_object_ids"
        new_campaign_id = result.get("copied_campaign_id")
        
        # Se não encontrou em copied_campaign_id, tentar em ad_object_ids
        if not new_campaign_id and "ad_object_ids" in result:
            ad_object_ids = result.get("ad_object_ids", [])
            if ad_object_ids and len(ad_object_ids) > 0:
                # Procurar o objeto do tipo "campaign"
                for obj in ad_object_ids:
                    if obj.get("ad_object_type") == "campaign":
                        new_campaign_id = obj.get("copied_id")
                        break
        
        # Fallback: tentar "id" (formato alternativo)
        if not new_campaign_id:
            new_campaign_id = result.get("id")
        
        if not new_campaign_id:
            return {
                "success": False,
                "error": "Resposta da Meta API não contém ID da campanha duplicada",
                "response": result,
            }
        
        return {
            "success": True,
            "campaign_id": new_campaign_id,
            "message": f"Campanha duplicada com sucesso!",
            "deep_copy": deep_copy,
            "status": status_option,
        }
        
    except httpx.TimeoutException:
        return {"success": False, "error": "Timeout ao duplicar campanha na Meta API"}
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
        url = f"https://graph.facebook.com/v24.0/{campaign_id}/insights"
        headers = _get_auth_headers()
        params = {
            "fields": "impressions,clicks,spend,cpc,cpm,ctr,reach,conversions,cost_per_conversion",
            "date_preset": date_preset,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=30)
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
