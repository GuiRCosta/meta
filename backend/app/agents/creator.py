"""
Agente Criador - Especialista em criar campanhas Meta Ads
"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import CREATOR_PROMPT
from app.tools.meta_api import (
    create_campaign,
    list_campaigns,
    get_campaign_details,
)


def create_creator_tools() -> list:
    """Cria as tools disponíveis para o Agente Criador."""
    
    async def tool_create_campaign(
        name: str,
        objective: str,
        status: str = "PAUSED",
        daily_budget: int = None
    ) -> str:
        """
        Cria uma nova campanha no Meta Ads.
        
        Args:
            name: Nome da campanha (ex: "Vendas_Produto_Janeiro2026")
            objective: OUTCOME_SALES, OUTCOME_LEADS, OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, OUTCOME_AWARENESS
            status: ACTIVE ou PAUSED (recomendado começar PAUSED)
            daily_budget: Orçamento diário em centavos (ex: 5000 = R$ 50,00)
        """
        result = await create_campaign(
            name=name,
            objective=objective,
            status=status,
            daily_budget=daily_budget
        )
        
        if result["success"]:
            return f"✅ Campanha criada com sucesso!\nID: {result['campaign_id']}\nNome: {name}\nObjetivo: {objective}\nStatus: {status}"
        else:
            return f"❌ Erro ao criar campanha: {result['error']}"
    
    async def tool_list_campaigns(status: str = None, limit: int = 10) -> str:
        """
        Lista campanhas existentes na conta Meta Ads.
        
        Args:
            status: Filtrar por ACTIVE, PAUSED, ou ARCHIVED (opcional)
            limit: Número máximo de campanhas (padrão: 10)
        """
        result = await list_campaigns(status=status, limit=limit)
        
        if not result["success"]:
            return f"❌ Erro: {result['error']}"
        
        if not result["campaigns"]:
            return "📭 Nenhuma campanha encontrada."
        
        lines = [f"📋 **{result['total']} campanhas encontradas:**\n"]
        for camp in result["campaigns"]:
            status_emoji = "🟢" if camp["status"] == "ACTIVE" else "🟡" if camp["status"] == "PAUSED" else "⚫"
            lines.append(f"{status_emoji} **{camp['name']}**")
            lines.append(f"   ID: {camp['id']} | Objetivo: {camp['objective']}")
        
        return "\n".join(lines)
    
    async def tool_get_campaign_details(campaign_id: str) -> str:
        """
        Busca detalhes completos de uma campanha específica.
        
        Args:
            campaign_id: ID da campanha no Meta (ex: "123456789")
        """
        result = await get_campaign_details(campaign_id)
        
        if not result["success"]:
            return f"❌ Erro: {result['error']}"
        
        camp = result["campaign"]
        lines = [
            f"📢 **{camp['name']}**",
            f"ID: {camp['id']}",
            f"Objetivo: {camp['objective']}",
            f"Status: {camp['status']}",
        ]
        
        if camp.get("daily_budget"):
            lines.append(f"Orçamento Diário: R$ {int(camp['daily_budget'])/100:.2f}")
        
        adsets = camp.get("adsets", {}).get("data", [])
        if adsets:
            lines.append(f"\n📦 **{len(adsets)} Ad Set(s):**")
            for adset in adsets:
                lines.append(f"  • {adset['name']} ({adset['status']})")
        
        return "\n".join(lines)
    
    return [tool_create_campaign, tool_list_campaigns, tool_get_campaign_details]


def get_creator_agent() -> Agent:
    """Retorna o Agente Criador configurado."""
    return Agent(
        name="Criador",
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        instructions=CREATOR_PROMPT,
        tools=create_creator_tools(),
        show_tool_calls=True,
        markdown=True,
    )


# Singleton
creator_agent = get_creator_agent() if settings.openai_api_key else None
