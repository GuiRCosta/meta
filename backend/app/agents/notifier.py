"""
Agente Notificador - Especialista em WhatsApp e alertas
"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import NOTIFIER_PROMPT
from app.tools.whatsapp import (
    send_whatsapp_message,
    send_daily_report,
    send_alert,
)
from app.tools.database import get_user_settings, get_alerts, create_alert


def create_notifier_tools() -> list:
    """Cria as tools disponíveis para o Agente Notificador."""
    
    async def tool_send_message(phone_number: str, message: str) -> str:
        """
        Envia uma mensagem de texto via WhatsApp.
        
        Args:
            phone_number: Número com código do país (ex: 5511999999999)
            message: Texto da mensagem (use *negrito* e _itálico_)
        """
        result = await send_whatsapp_message(phone_number, message)
        
        if result["success"]:
            return f"✅ Mensagem enviada com sucesso para {phone_number}"
        else:
            return f"❌ Erro ao enviar: {result['error']}"
    
    async def tool_send_report(phone_number: str) -> str:
        """
        Envia o relatório diário de campanhas via WhatsApp.
        
        Args:
            phone_number: Número do destinatário
        """
        # Mock data - em produção buscaria dados reais
        report_data = {
            "total_spend": 285.50,
            "avg_roas": 3.2,
            "active_campaigns": 5,
            "total_conversions": 12,
            "budget_percent": 47,
        }
        
        result = await send_daily_report(phone_number, report_data)
        
        if result["success"]:
            return "✅ Relatório diário enviado com sucesso!"
        else:
            return f"❌ Erro ao enviar relatório: {result['error']}"
    
    async def tool_send_budget_alert(
        phone_number: str,
        percent_used: float,
        current_spend: float,
        budget_limit: float
    ) -> str:
        """
        Envia alerta de orçamento via WhatsApp.
        
        Args:
            phone_number: Número do destinatário
            percent_used: Percentual do orçamento utilizado
            current_spend: Gasto atual em R$
            budget_limit: Limite de orçamento em R$
        """
        # Definir tipo de alerta
        if percent_used >= 100:
            alert_type = "critical"
            title = "LIMITE DE ORÇAMENTO ATINGIDO"
            emoji = "🚨"
        elif percent_used >= 80:
            alert_type = "warning"
            title = "Alerta de Orçamento"
            emoji = "⚠️"
        else:
            alert_type = "info"
            title = "Atualização de Orçamento"
            emoji = "ℹ️"
        
        message = f"""*Orçamento Mensal:* {percent_used:.0f}% utilizado
        
💰 Gasto atual: R$ {current_spend:.2f}
📊 Limite: R$ {budget_limit:.2f}
📉 Restante: R$ {budget_limit - current_spend:.2f}"""
        
        result = await send_alert(phone_number, alert_type, title, message)
        
        if result["success"]:
            return f"✅ Alerta de orçamento ({percent_used:.0f}%) enviado!"
        else:
            return f"❌ Erro: {result['error']}"
    
    async def tool_send_performance_alert(
        phone_number: str,
        campaign_name: str,
        metric: str,
        current_value: float,
        threshold: float,
        is_above: bool = True
    ) -> str:
        """
        Envia alerta de performance de campanha via WhatsApp.
        
        Args:
            phone_number: Número do destinatário
            campaign_name: Nome da campanha com problema
            metric: Nome da métrica (CTR, CPC, ROAS, etc.)
            current_value: Valor atual da métrica
            threshold: Limite configurado
            is_above: True se ultrapassou limite superior, False se caiu abaixo
        """
        if is_above:
            message = f"""*{metric}* está muito alto!

📢 *Campanha:* {campaign_name}
📊 Valor atual: {current_value:.2f}
⚠️ Limite máximo: {threshold:.2f}

*Ação sugerida:* Revisar segmentação ou criativo"""
        else:
            message = f"""*{metric}* está muito baixo!

📢 *Campanha:* {campaign_name}
📊 Valor atual: {current_value:.2f}
⚠️ Mínimo esperado: {threshold:.2f}

*Ação sugerida:* Testar novos criativos ou ajustar público"""
        
        result = await send_alert(phone_number, "warning", f"Alerta de {metric}", message, campaign_name)
        
        if result["success"]:
            return f"✅ Alerta de {metric} enviado para {phone_number}"
        else:
            return f"❌ Erro: {result['error']}"
    
    async def tool_create_system_alert(
        alert_type: str,
        priority: str,
        title: str,
        message: str,
        campaign_name: str = None
    ) -> str:
        """
        Cria um alerta no sistema (banco de dados).
        
        Args:
            alert_type: error, warning, info, success
            priority: high, medium, low
            title: Título do alerta
            message: Mensagem detalhada
            campaign_name: Nome da campanha (opcional)
        """
        result = await create_alert(
            user_id="current_user",  # Em produção pegaria do contexto
            alert_type=alert_type,
            priority=priority,
            title=title,
            message=message,
            campaign_name=campaign_name
        )
        
        if result["success"]:
            return f"✅ Alerta criado no sistema: {title}"
        else:
            return "❌ Erro ao criar alerta"
    
    async def tool_get_notification_settings() -> str:
        """
        Busca configurações de notificação do usuário.
        """
        result = await get_user_settings("current_user")
        
        if not result["success"]:
            return "❌ Erro ao buscar configurações"
        
        s = result["settings"]
        
        whatsapp_status = "🟢 Ativo" if s["whatsapp_enabled"] else "🔴 Desativado"
        
        lines = [
            "📱 **Configurações de Notificação**\n",
            f"**WhatsApp:** {whatsapp_status}",
            f"**Número:** {s['whatsapp_number'] or 'Não configurado'}",
            f"**Relatório Diário:** {s['daily_report_time']}",
            "",
            "**Alertas de Orçamento:**",
            f"• 50% do limite: {'✅' if s['alert_at_50_percent'] else '❌'}",
            f"• 80% do limite: {'✅' if s['alert_at_80_percent'] else '❌'}",
            f"• 100% do limite: {'✅' if s['alert_at_100_percent'] else '❌'}",
        ]
        
        return "\n".join(lines)
    
    return [
        tool_send_message,
        tool_send_report,
        tool_send_budget_alert,
        tool_send_performance_alert,
        tool_create_system_alert,
        tool_get_notification_settings,
    ]


def get_notifier_agent() -> Agent:
    """Retorna o Agente Notificador configurado."""
    return Agent(
        name="Notificador",
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        instructions=NOTIFIER_PROMPT,
        tools=create_notifier_tools(),
        show_tool_calls=True,
        markdown=True,
    )


# Singleton
notifier_agent = get_notifier_agent() if settings.openai_api_key else None
