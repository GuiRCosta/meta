"""
Tools para interação com banco de dados Supabase
"""
from typing import Optional
import httpx
from app.config import settings


# Base URL para Supabase REST API
def get_supabase_url() -> str:
    """Extrai URL base do Supabase da connection string."""
    # Se tiver SUPABASE_URL configurado, usa diretamente
    # Senão, está conectando via Prisma direto
    return ""


async def get_user_settings(user_id: str) -> dict:
    """
    Busca configurações do usuário.
    
    Args:
        user_id: ID do usuário
        
    Returns:
        Dict com configurações
    """
    # Por enquanto retorna mock - em produção usaria Prisma/SQLAlchemy
    return {
        "success": True,
        "settings": {
            "monthly_budget_limit": 10000,
            "alert_at_50_percent": True,
            "alert_at_80_percent": True,
            "alert_at_100_percent": True,
            "whatsapp_enabled": False,
            "whatsapp_number": None,
            "daily_report_time": "18:00",
        }
    }


async def get_alerts(
    user_id: str,
    unread_only: bool = False,
    limit: int = 10
) -> dict:
    """
    Busca alertas do usuário.
    
    Args:
        user_id: ID do usuário
        unread_only: Apenas não lidos
        limit: Limite de alertas
        
    Returns:
        Dict com lista de alertas
    """
    # Mock - em produção usaria Prisma/SQLAlchemy
    return {
        "success": True,
        "alerts": [],
        "unread_count": 0
    }


async def create_alert(
    user_id: str,
    alert_type: str,
    priority: str,
    title: str,
    message: str,
    campaign_id: Optional[str] = None,
    campaign_name: Optional[str] = None
) -> dict:
    """
    Cria um novo alerta.
    
    Args:
        user_id: ID do usuário
        alert_type: error, warning, info, success
        priority: high, medium, low
        title: Título do alerta
        message: Mensagem detalhada
        campaign_id: ID da campanha (opcional)
        campaign_name: Nome da campanha (opcional)
        
    Returns:
        Dict com alerta criado
    """
    # Mock - em produção usaria Prisma/SQLAlchemy
    return {
        "success": True,
        "alert": {
            "id": "mock_alert_id",
            "type": alert_type,
            "priority": priority,
            "title": title,
            "message": message,
        }
    }


async def get_monthly_summary(user_id: str, month: int, year: int) -> dict:
    """
    Busca resumo mensal de gastos e métricas.
    
    Args:
        user_id: ID do usuário
        month: Mês (1-12)
        year: Ano
        
    Returns:
        Dict com resumo do mês
    """
    # Mock - em produção usaria Prisma/SQLAlchemy
    return {
        "success": True,
        "summary": {
            "month": month,
            "year": year,
            "total_spend": 0,
            "total_impressions": 0,
            "total_clicks": 0,
            "total_conversions": 0,
            "avg_ctr": 0,
            "avg_cpc": 0,
            "avg_roas": 0,
        }
    }
