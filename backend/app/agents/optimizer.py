"""
Agente Otimizador - Especialista em melhorar ROI
"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import OPTIMIZER_PROMPT
from app.tools.meta_api import (
    list_campaigns,
    get_campaign_insights,
    update_campaign_status,
)


def create_optimizer_tools() -> list:
    """Cria as tools disponíveis para o Agente Otimizador."""
    
    async def tool_identify_underperformers(threshold_roas: float = 1.0) -> str:
        """
        Identifica campanhas com baixa performance que devem ser pausadas ou otimizadas.
        
        Args:
            threshold_roas: ROAS mínimo aceitável (padrão: 1.0x = break-even)
        """
        campaigns_result = await list_campaigns(status="ACTIVE", limit=20)
        
        if not campaigns_result["success"]:
            return f"❌ Erro: {campaigns_result['error']}"
        
        underperformers = []
        
        for camp in campaigns_result["campaigns"]:
            insights = await get_campaign_insights(camp["id"], "last_7d")
            if insights["success"]:
                i = insights["insights"]
                # Calcular ROAS aproximado (se tiver conversões)
                # Por simplicidade, usando CTR como proxy
                if i["ctr"] < 0.5:
                    underperformers.append({
                        "name": camp["name"],
                        "id": camp["id"],
                        "ctr": i["ctr"],
                        "spend": i["spend"],
                        "reason": "CTR muito baixo"
                    })
        
        if not underperformers:
            return "✅ Nenhuma campanha com performance crítica encontrada!"
        
        lines = [
            f"⚠️ **{len(underperformers)} campanha(s) com baixa performance:**\n"
        ]
        
        total_waste = 0
        for camp in underperformers:
            lines.append(f"🔴 **{camp['name']}**")
            lines.append(f"   CTR: {camp['ctr']:.2f}% | Gasto: R$ {camp['spend']:.2f}")
            lines.append(f"   Motivo: {camp['reason']}")
            total_waste += camp["spend"]
        
        lines.append(f"\n💸 **Potencial desperdício:** R$ {total_waste:.2f}/semana")
        lines.append("\n**Ação Recomendada:** Pausar ou otimizar estas campanhas")
        
        return "\n".join(lines)
    
    async def tool_identify_winners(min_ctr: float = 1.5) -> str:
        """
        Identifica campanhas vencedoras que podem ser escaladas.
        
        Args:
            min_ctr: CTR mínimo para considerar vencedora (padrão: 1.5%)
        """
        campaigns_result = await list_campaigns(status="ACTIVE", limit=20)
        
        if not campaigns_result["success"]:
            return f"❌ Erro: {campaigns_result['error']}"
        
        winners = []
        
        for camp in campaigns_result["campaigns"]:
            insights = await get_campaign_insights(camp["id"], "last_7d")
            if insights["success"]:
                i = insights["insights"]
                if i["ctr"] >= min_ctr and i["spend"] > 0:
                    winners.append({
                        "name": camp["name"],
                        "id": camp["id"],
                        "ctr": i["ctr"],
                        "cpc": i["cpc"],
                        "spend": i["spend"],
                    })
        
        if not winners:
            return "📊 Nenhuma campanha atingiu os critérios de vencedora no período."
        
        # Ordenar por CTR
        winners.sort(key=lambda x: x["ctr"], reverse=True)
        
        lines = [
            f"🏆 **{len(winners)} campanha(s) vencedora(s):**\n"
        ]
        
        for camp in winners:
            lines.append(f"🟢 **{camp['name']}**")
            lines.append(f"   CTR: {camp['ctr']:.2f}% | CPC: R$ {camp['cpc']:.2f}")
            lines.append(f"   Gasto atual: R$ {camp['spend']:.2f}/semana")
            # Sugerir aumento de 30%
            new_budget = camp["spend"] * 1.3
            lines.append(f"   💡 Sugestão: Aumentar para R$ {new_budget:.2f}/semana (+30%)")
        
        return "\n".join(lines)
    
    async def tool_pause_campaign(campaign_id: str, reason: str = "") -> str:
        """
        Pausa uma campanha para evitar mais gastos.
        
        Args:
            campaign_id: ID da campanha a ser pausada
            reason: Motivo da pausa (para registro)
        """
        result = await update_campaign_status(campaign_id, "PAUSED")
        
        if result["success"]:
            msg = f"⏸️ Campanha pausada com sucesso!"
            if reason:
                msg += f"\nMotivo: {reason}"
            return msg
        else:
            return f"❌ Erro ao pausar: {result['error']}"
    
    async def tool_activate_campaign(campaign_id: str) -> str:
        """
        Ativa uma campanha que estava pausada.
        
        Args:
            campaign_id: ID da campanha a ser ativada
        """
        result = await update_campaign_status(campaign_id, "ACTIVE")
        
        if result["success"]:
            return "▶️ Campanha ativada com sucesso!"
        else:
            return f"❌ Erro ao ativar: {result['error']}"
    
    async def tool_generate_optimization_plan() -> str:
        """
        Gera um plano de otimização completo para a conta.
        """
        campaigns_result = await list_campaigns(status="ACTIVE", limit=20)
        
        if not campaigns_result["success"]:
            return f"❌ Erro: {campaigns_result['error']}"
        
        immediate_actions = []
        planned_actions = []
        
        for camp in campaigns_result["campaigns"]:
            insights = await get_campaign_insights(camp["id"], "last_7d")
            if insights["success"]:
                i = insights["insights"]
                
                # Ações imediatas
                if i["ctr"] < 0.3:
                    immediate_actions.append(f"⏸️ **Pausar** '{camp['name']}' - CTR crítico ({i['ctr']:.2f}%)")
                elif i["ctr"] > 2.0:
                    immediate_actions.append(f"💰 **Escalar** '{camp['name']}' - CTR excelente ({i['ctr']:.2f}%)")
                
                # Ações planejadas
                if 0.3 <= i["ctr"] < 1.0:
                    planned_actions.append(f"🔧 Testar novos criativos para '{camp['name']}'")
        
        lines = ["🔧 **Plano de Otimização**\n"]
        
        if immediate_actions:
            lines.append("**Ações Imediatas (fazer agora):**")
            for i, action in enumerate(immediate_actions, 1):
                lines.append(f"{i}. {action}")
            lines.append("")
        
        if planned_actions:
            lines.append("**Ações Planejadas (próxima semana):**")
            for i, action in enumerate(planned_actions, 1):
                lines.append(f"{i}. {action}")
        
        if not immediate_actions and not planned_actions:
            lines.append("✅ Todas as campanhas estão com performance aceitável!")
            lines.append("Continue monitorando regularmente.")
        
        return "\n".join(lines)
    
    return [
        tool_identify_underperformers,
        tool_identify_winners,
        tool_pause_campaign,
        tool_activate_campaign,
        tool_generate_optimization_plan,
    ]


def get_optimizer_agent() -> Agent:
    """Retorna o Agente Otimizador configurado."""
    return Agent(
        name="Otimizador",
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        instructions=OPTIMIZER_PROMPT,
        tools=create_optimizer_tools(),
        show_tool_calls=True,
        markdown=True,
    )


# Singleton
optimizer_agent = get_optimizer_agent() if settings.openai_api_key else None
