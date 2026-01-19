"""
Tools para envio de mensagens via WhatsApp (Evolution API)
"""
from typing import Optional
import httpx
from app.config import settings


async def send_whatsapp_message(
    phone_number: str,
    message: str,
    media_url: Optional[str] = None
) -> dict:
    """
    Envia uma mensagem de texto via WhatsApp.
    
    Args:
        phone_number: Número do destinatário (com código do país, ex: 5511999999999)
        message: Texto da mensagem
        media_url: URL de mídia opcional (imagem/vídeo)
        
    Returns:
        Dict com status do envio
    """
    if not settings.evolution_api_url or not settings.evolution_api_key:
        return {
            "success": False,
            "error": "Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY no .env"
        }
    
    try:
        # Formatar número (remover caracteres especiais)
        phone = phone_number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
        
        # Endpoint para envio de texto
        url = f"{settings.evolution_api_url}/message/sendText/{settings.evolution_instance}"
        
        headers = {
            "apikey": settings.evolution_api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "number": phone,
            "text": message
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            result = response.json()
        
        if response.status_code != 200 and response.status_code != 201:
            return {
                "success": False,
                "error": result.get("message", "Erro ao enviar mensagem")
            }
        
        return {
            "success": True,
            "message_id": result.get("key", {}).get("id"),
            "status": "sent"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


async def send_daily_report(
    phone_number: str,
    report_data: dict
) -> dict:
    """
    Envia o relatório diário formatado via WhatsApp.
    
    Args:
        phone_number: Número do destinatário
        report_data: Dados do relatório (spend, campaigns, metrics, etc.)
        
    Returns:
        Dict com status do envio
    """
    # Formatar relatório
    from datetime import datetime
    
    today = datetime.now().strftime("%d/%m/%Y")
    
    spend = report_data.get("total_spend", 0)
    roas = report_data.get("avg_roas", 0)
    active_campaigns = report_data.get("active_campaigns", 0)
    conversions = report_data.get("total_conversions", 0)
    budget_percent = report_data.get("budget_percent", 0)
    
    # Definir emoji de status
    if budget_percent > 90:
        budget_emoji = "🔴"
    elif budget_percent > 70:
        budget_emoji = "🟡"
    else:
        budget_emoji = "🟢"
    
    message = f"""📊 *Relatório Diário - {today}*

💰 *Gasto Hoje:* R$ {spend:.2f}
📈 *ROAS Médio:* {roas:.1f}x
🎯 *Conversões:* {conversions}
📢 *Campanhas Ativas:* {active_campaigns}

{budget_emoji} *Orçamento Mensal:* {budget_percent:.0f}% utilizado

_Enviado automaticamente às 18:00_"""

    return await send_whatsapp_message(phone_number, message)


async def send_alert(
    phone_number: str,
    alert_type: str,
    title: str,
    message: str,
    campaign_name: Optional[str] = None,
    action_url: Optional[str] = None
) -> dict:
    """
    Envia um alerta formatado via WhatsApp.
    
    Args:
        phone_number: Número do destinatário
        alert_type: critical, warning, info, success
        title: Título do alerta
        message: Mensagem detalhada
        campaign_name: Nome da campanha (opcional)
        action_url: URL para ação (opcional)
        
    Returns:
        Dict com status do envio
    """
    # Emoji baseado no tipo
    emojis = {
        "critical": "🚨",
        "warning": "⚠️",
        "info": "ℹ️",
        "success": "✅"
    }
    emoji = emojis.get(alert_type, "📢")
    
    # Formatar mensagem
    formatted_message = f"""{emoji} *{title}*

{message}"""

    if campaign_name:
        formatted_message += f"\n\n📢 *Campanha:* {campaign_name}"
    
    if action_url:
        formatted_message += f"\n\n👉 *Acessar:* {action_url}"
    
    return await send_whatsapp_message(phone_number, formatted_message)
