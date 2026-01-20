#!/usr/bin/env python3
"""
Script de teste para validar sincronização com Meta API
"""
import asyncio
import httpx
import json
from datetime import datetime, timedelta

# Configurações
META_ACCESS_TOKEN = "EAAMr8h0Y08gBQa9TYM4Rl02kqK7oZCUj0qzlPsAdhd3jkLQxVA8U9npTvlCFJ66QpMm8eHZAIIIZBt4vfGXhZAfAGZBoa4h10HgutTlscZBJcZCvqVBEv6hxlh0l8fpw8RD7IaQZCZClrtxZCG9PoXbncVlLv7Tzo9xdvpsqP99h7qyOXAEBCbNtfyON4Im1wMKaaIvOhcHx8Q"
META_AD_ACCOUNT_ID = "act_23851104567680791"

async def test_campaign_list():
    """Busca lista de campanhas da Meta API"""
    print("=" * 80)
    print("🔍 TESTANDO SINCRONIZAÇÃO COM META API")
    print("=" * 80)

    url = f"https://graph.facebook.com/v24.0/{META_AD_ACCOUNT_ID}/campaigns"
    params = {
        "access_token": META_ACCESS_TOKEN,
        "fields": "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time",
        "limit": 50  # Buscar 50 campanhas
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
            data = response.json()

            if "error" in data:
                print(f"❌ Erro: {data['error'].get('message')}")
                return None

            campaigns = data.get("data", [])
            print(f"\n✅ Total de campanhas encontradas: {len(campaigns)}\n")

            # Procurar campanhas CBO
            target_campaign = None
            cbo_campaigns = []
            for campaign in campaigns:
                name = campaign.get("name", "")
                if "[CBO]" in name:
                    cbo_campaigns.append(campaign)
                    if "[VENDAS][PRE-LP2][CBO] — Cópia" == name:
                        target_campaign = campaign

            if target_campaign:
                print("🎯 CAMPANHA ENCONTRADA: [VENDAS][PRE-LP2][CBO] — Cópia")
                print("-" * 80)
                print(f"📝 Nome: {target_campaign.get('name')}")
                print(f"🆔 ID: {target_campaign.get('id')}")
                print(f"🎯 Objetivo: {target_campaign.get('objective')}")
                print(f"📊 Status: {target_campaign.get('status')}")
                print(f"📊 Status Efetivo: {target_campaign.get('effective_status')}")

                daily_budget = target_campaign.get('daily_budget')
                if daily_budget:
                    print(f"💰 Orçamento Diário: R$ {int(daily_budget)/100:.2f}")

                lifetime_budget = target_campaign.get('lifetime_budget')
                if lifetime_budget:
                    print(f"💰 Orçamento Total: R$ {int(lifetime_budget)/100:.2f}")

                print(f"📅 Criada em: {target_campaign.get('created_time')}")
                print(f"🔄 Atualizada em: {target_campaign.get('updated_time')}")

                # Buscar insights (métricas)
                await test_campaign_insights(target_campaign.get('id'))
            else:
                if cbo_campaigns:
                    print(f"⚠️  Campanha exata não encontrada, mas encontradas {len(cbo_campaigns)} campanhas [CBO]:")
                    for i, camp in enumerate(cbo_campaigns, 1):
                        print(f"   {i}. {camp.get('name')} (ID: {camp.get('id')})")
                    # Usar a primeira campanha CBO para teste
                    if cbo_campaigns:
                        print(f"\n📍 Usando primeira campanha CBO para demonstração:")
                        target_campaign = cbo_campaigns[0]
                        print(f"📝 Nome: {target_campaign.get('name')}")
                        await test_campaign_insights(target_campaign.get('id'))
                else:
                    print("⚠️  Nenhuma campanha [CBO] encontrada nos primeiros 50 resultados")
                    print("\n📋 Primeiras 5 campanhas:")
                    for i, camp in enumerate(campaigns[:5], 1):
                        print(f"   {i}. {camp.get('name')}")

            return campaigns

    except Exception as e:
        print(f"❌ Erro ao buscar campanhas: {e}")
        return None

async def test_campaign_insights(campaign_id):
    """Busca insights (métricas) de uma campanha específica"""
    print("\n" + "=" * 80)
    print("📊 BUSCANDO MÉTRICAS (INSIGHTS)")
    print("=" * 80)

    # Período: últimos 7 dias (igual ao Meta Ads Manager)
    date_start = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    date_end = datetime.now().strftime("%Y-%m-%d")

    url = f"https://graph.facebook.com/v24.0/{campaign_id}/insights"
    params = {
        "access_token": META_ACCESS_TOKEN,
        "fields": "campaign_id,campaign_name,spend,impressions,clicks,reach,frequency,ctr,cpm,cpc,actions,action_values",
        "date_preset": "last_7d",  # Últimos 7 dias
        "level": "campaign"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
            data = response.json()

            if "error" in data:
                print(f"❌ Erro ao buscar insights: {data['error'].get('message')}")
                return None

            insights = data.get("data", [])

            if not insights:
                print("⚠️  Nenhum insight encontrado (campanha sem impressões no período)")
                return None

            insight = insights[0]  # Primeiro resultado

            print(f"\n📊 MÉTRICAS (Período: {date_start} a {date_end})")
            print("-" * 80)
            print(f"💰 Gasto: R$ {float(insight.get('spend', 0)):.2f}")
            print(f"👁️  Impressões: {insight.get('impressions', 0)}")
            print(f"👥 Alcance: {insight.get('reach', 0)}")
            print(f"🔄 Frequência: {float(insight.get('frequency', 0)):.2f}")
            print(f"🖱️  Cliques: {insight.get('clicks', 0)}")
            print(f"📈 CTR: {float(insight.get('ctr', 0)):.2f}%")
            print(f"💵 CPM: R$ {float(insight.get('cpm', 0)):.2f}")

            cpc = insight.get('cpc')
            if cpc:
                print(f"💵 CPC: R$ {float(cpc):.2f}")
            else:
                print(f"💵 CPC: — (sem cliques)")

            # Ações (conversões)
            actions = insight.get('actions', [])
            if actions:
                print("\n🎯 CONVERSÕES:")
                for action in actions:
                    action_type = action.get('action_type', 'unknown')
                    value = action.get('value', 0)
                    print(f"   • {action_type}: {value}")

            # Valores de conversão
            action_values = insight.get('action_values', [])
            if action_values:
                print("\n💰 VALORES DE CONVERSÃO:")
                for action_value in action_values:
                    action_type = action_value.get('action_type', 'unknown')
                    value = float(action_value.get('value', 0))
                    print(f"   • {action_type}: R$ {value:.2f}")

            print("\n✅ Insights obtidos com sucesso!")
            return insight

    except Exception as e:
        print(f"❌ Erro ao buscar insights: {e}")
        return None

async def compare_with_database():
    """Compara dados da Meta API com o banco de dados"""
    print("\n" + "=" * 80)
    print("🔄 COMPARAÇÃO: META API vs BANCO DE DADOS")
    print("=" * 80)
    print("\n⚠️  Nota: Esta função requer acesso ao banco de dados")
    print("Execute manualmente no frontend: npx prisma studio")
    print("Ou consulte a tabela 'Campaign' no Supabase")

async def main():
    """Função principal"""
    print("\n🚀 INICIANDO VALIDAÇÃO META API")
    print(f"📅 Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🏢 Account ID: {META_AD_ACCOUNT_ID}")

    # Buscar campanhas
    await test_campaign_list()

    # Comparação com banco
    await compare_with_database()

    print("\n" + "=" * 80)
    print("✅ VALIDAÇÃO CONCLUÍDA")
    print("=" * 80)
    print("\n📝 Próximos passos:")
    print("   1. Comparar os dados acima com a aplicação")
    print("   2. Verificar se os valores batem")
    print("   3. Implementar sincronização de insights se necessário")

if __name__ == "__main__":
    asyncio.run(main())
