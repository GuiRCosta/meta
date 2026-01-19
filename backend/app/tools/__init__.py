"""
Tools para os agentes de IA
Cada tool é uma função que pode ser chamada pelos agentes para executar ações.
"""
from app.tools.meta_api import (
    list_campaigns,
    get_campaign_details,
    create_campaign,
    update_campaign_status,
    get_campaign_insights,
    duplicate_campaign,
)
from app.tools.database import (
    get_user_settings,
    get_alerts,
    create_alert,
    get_monthly_summary,
)
from app.tools.whatsapp import (
    send_whatsapp_message,
    send_daily_report,
)

__all__ = [
    # Meta API
    "list_campaigns",
    "get_campaign_details",
    "create_campaign",
    "update_campaign_status",
    "get_campaign_insights",
    "duplicate_campaign",
    # Database
    "get_user_settings",
    "get_alerts",
    "create_alert",
    "get_monthly_summary",
    # WhatsApp
    "send_whatsapp_message",
    "send_daily_report",
]
