#!/usr/bin/env python3
"""
Script de teste para verificar conexão com Meta API
"""
import asyncio
import sys
import os

# Adicionar o diretório do backend ao path
sys.path.insert(0, os.path.dirname(__file__))

from app.tools.meta_api import list_campaigns, get_campaign_details
from app.config import settings


async def test_meta_api():
    """Testa a conexão com a API da Meta."""
    print("=" * 60)
    print("TESTE DE CONEXÃO COM META API")
    print("=" * 60)
    print()
    
    # Verificar configuração
    print("1. Verificando configuração...")
    if not settings.meta_access_token:
        print("   ❌ META_ACCESS_TOKEN não configurado")
        print("   Configure a variável de ambiente META_ACCESS_TOKEN")
        return False
    else:
        token_preview = settings.meta_access_token[:20] + "..." if len(settings.meta_access_token) > 20 else settings.meta_access_token
        print(f"   ✅ META_ACCESS_TOKEN: {token_preview}")
    
    if not settings.meta_ad_account_id:
        print("   ❌ META_AD_ACCOUNT_ID não configurado")
        print("   Configure a variável de ambiente META_AD_ACCOUNT_ID")
        return False
    else:
        print(f"   ✅ META_AD_ACCOUNT_ID: {settings.meta_ad_account_id}")
    
    print()
    
    # Teste 1: Listar campanhas
    print("2. Testando listagem de campanhas...")
    result = await list_campaigns(limit=5)
    
    if not result["success"]:
        print(f"   ❌ Erro: {result.get('error', 'Erro desconhecido')}")
        return False
    
    campaigns = result.get("campaigns", [])
    total = result.get("total", 0)
    
    print(f"   ✅ Conexão estabelecida com sucesso!")
    print(f"   📊 Total de campanhas encontradas: {total}")
    
    if campaigns:
        print(f"   📋 Primeiras {len(campaigns)} campanhas:")
        for i, camp in enumerate(campaigns[:3], 1):
            print(f"      {i}. {camp.get('name', 'Sem nome')} ({camp.get('status', 'N/A')})")
    else:
        print("   ℹ️  Nenhuma campanha encontrada na conta")
    
    print()
    
    # Teste 2: Buscar detalhes de uma campanha (se houver)
    if campaigns:
        print("3. Testando busca de detalhes de campanha...")
        first_campaign_id = campaigns[0].get("id")
        if first_campaign_id:
            details = await get_campaign_details(first_campaign_id)
            if details["success"]:
                print(f"   ✅ Detalhes da campanha '{campaigns[0].get('name')}' obtidos com sucesso!")
            else:
                print(f"   ⚠️  Aviso: {details.get('error', 'Erro ao buscar detalhes')}")
        print()
    
    print("=" * 60)
    print("✅ TESTE CONCLUÍDO - API DA META ESTÁ FUNCIONAL")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_meta_api())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
