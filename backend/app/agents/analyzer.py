"""
Agente Analisador - Especialista em métricas e performance
"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import ANALYZER_PROMPT
from app.tools.meta_api import (
    list_campaigns,
    get_campaign_insights,
)
from app.tools.database import get_monthly_summary


def create_analyzer_tools() -> list:
    """Cria as tools disponíveis para o Agente Analisador."""
    
    async def tool_get_campaign_metrics(
        campaign_id: str,
        period: str = "last_7d"
    ) -> str:
        """
        Busca métricas de performance de uma campanha.
        
        Args:
            campaign_id: ID da campanha no Meta
            period: today, yesterday, last_7d, last_14d, last_30d, this_month
        """
        result = await get_campaign_insights(campaign_id, period)
        
        if not result["success"]:
            return f"❌ Erro: {result['error']}"
        
        i = result["insights"]
        
        # Classificar métricas
        def classify(value, good, bad, higher_is_better=True):
            if higher_is_better:
                return "🟢" if value >= good else "🔴" if value <= bad else "🟡"
            else:
                return "🟢" if value <= good else "🔴" if value >= bad else "🟡"
        
        ctr_status = classify(i["ctr"], 1.5, 0.5)
        cpc_status = classify(i["cpc"], 1.0, 3.0, higher_is_better=False)
        
        lines = [
            f"📊 **Métricas - Período: {period}**\n",
            "| Métrica | Valor | Status |",
            "|---------|-------|--------|",
            f"| Impressões | {i['impressions']:,} | - |",
            f"| Cliques | {i['clicks']:,} | - |",
            f"| CTR | {i['ctr']:.2f}% | {ctr_status} |",
            f"| CPC | R$ {i['cpc']:.2f} | {cpc_status} |",
            f"| CPM | R$ {i['cpm']:.2f} | - |",
            f"| Alcance | {i['reach']:,} | - |",
            f"| Gasto | R$ {i['spend']:.2f} | - |",
        ]
        
        if i["conversions"]:
            lines.append(f"| Conversões | {i['conversions']} | - |")
        
        return "\n".join(lines)
    
    async def tool_compare_campaigns(limit: int = 5) -> str:
        """
        Compara performance das campanhas ativas.
        
        Args:
            limit: Número de campanhas para comparar (padrão: 5)
        """
        campaigns_result = await list_campaigns(status="ACTIVE", limit=limit)
        
        if not campaigns_result["success"]:
            return f"❌ Erro: {campaigns_result['error']}"
        
        if not campaigns_result["campaigns"]:
            return "📭 Nenhuma campanha ativa encontrada."
        
        lines = ["📊 **Comparação de Campanhas Ativas**\n"]
        lines.append("| Campanha | Gasto | CTR | CPC |")
        lines.append("|----------|-------|-----|-----|")
        
        for camp in campaigns_result["campaigns"]:
            insights = await get_campaign_insights(camp["id"], "last_7d")
            if insights["success"]:
                i = insights["insights"]
                lines.append(f"| {camp['name'][:20]} | R$ {i['spend']:.0f} | {i['ctr']:.2f}% | R$ {i['cpc']:.2f} |")
            else:
                lines.append(f"| {camp['name'][:20]} | - | - | - |")
        
        return "\n".join(lines)
    
    async def tool_get_account_summary(month: int = None, year: int = None) -> str:
        """
        Busca resumo de performance da conta no mês.
        
        Args:
            month: Mês (1-12), padrão: mês atual
            year: Ano, padrão: ano atual
        """
        from datetime import datetime
        now = datetime.now()
        month = month or now.month
        year = year or now.year
        
        result = await get_monthly_summary("user_id", month, year)
        
        if not result["success"]:
            return f"❌ Erro ao buscar resumo"
        
        s = result["summary"]
        
        lines = [
            f"📈 **Resumo de {month:02d}/{year}**\n",
            f"💰 **Gasto Total:** R$ {s['total_spend']:.2f}",
            f"👀 **Impressões:** {s['total_impressions']:,}",
            f"👆 **Cliques:** {s['total_clicks']:,}",
            f"🎯 **Conversões:** {s['total_conversions']}",
            "",
            "**Médias:**",
            f"• CTR: {s['avg_ctr']:.2f}%",
            f"• CPC: R$ {s['avg_cpc']:.2f}",
            f"• ROAS: {s['avg_roas']:.1f}x",
        ]
        
        return "\n".join(lines)
    
    async def tool_diagnose_campaign(campaign_id: str) -> str:
        """
        Faz diagnóstico detalhado de uma campanha com recomendações.
        
        Args:
            campaign_id: ID da campanha para diagnosticar
        """
        result = await get_campaign_insights(campaign_id, "last_7d")
        
        if not result["success"]:
            return f"❌ Erro: {result['error']}"
        
        i = result["insights"]
        problems = []
        suggestions = []
        
        # Analisar CTR
        if i["ctr"] < 0.5:
            problems.append("🔴 CTR muito baixo (< 0.5%)")
            suggestions.append("• Testar novos criativos com gatilhos diferentes")
            suggestions.append("• Revisar segmentação de público")
        elif i["ctr"] < 1.0:
            problems.append("🟡 CTR abaixo da média (< 1.0%)")
            suggestions.append("• Considerar teste A/B de criativos")
        
        # Analisar CPC
        if i["cpc"] > 3.0:
            problems.append("🔴 CPC muito alto (> R$ 3,00)")
            suggestions.append("• Público pode estar muito competitivo")
            suggestions.append("• Testar horários diferentes de veiculação")
        elif i["cpc"] > 1.5:
            problems.append("🟡 CPC acima da média")
        
        # Resultado
        if not problems:
            status = "✅ Campanha saudável - métricas dentro do esperado"
        else:
            status = f"⚠️ {len(problems)} problema(s) identificado(s)"
        
        lines = [
            f"🔍 **Diagnóstico de Campanha**\n",
            f"**Status Geral:** {status}\n",
        ]
        
        if problems:
            lines.append("**Problemas:**")
            lines.extend(problems)
            lines.append("\n**Sugestões:**")
            lines.extend(suggestions)
        else:
            lines.append("Continue monitorando e considere escalar o orçamento se manter performance.")
        
        return "\n".join(lines)
    
    return [
        tool_get_campaign_metrics,
        tool_compare_campaigns,
        tool_get_account_summary,
        tool_diagnose_campaign,
    ]


def get_analyzer_agent() -> Agent:
    """Retorna o Agente Analisador configurado."""
    return Agent(
        name="Analisador",
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        instructions=ANALYZER_PROMPT,
        tools=create_analyzer_tools(),
        show_tool_calls=True,
        markdown=True,
    )


# Singleton
analyzer_agent = get_analyzer_agent() if settings.openai_api_key else None
