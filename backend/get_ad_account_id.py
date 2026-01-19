#!/usr/bin/env python3
"""
Script para obter o Ad Account ID usando o Access Token
"""
import httpx
import sys

# Token fornecido
ACCESS_TOKEN = "EAAMr8h0Y08gBQa9TYM4Rl02kqK7oZCUj0qzlPsAdhd3jkLQxVA8U9npTvlCFJ66QpMm8eHZAIIIZBt4vfGXhZAfAGZBoa4h10HgutTlscZBJcZCvqVBEv6hxlh0l8fpw8RD7IaQZCZClrtxZCG9PoXbncVlLv7Tzo9xdvpsqP99h7qyOXAEBCbNtfyON4Im1wMKaaIvOhcHx8Q"

async def get_ad_accounts():
    """Busca todas as contas de anúncios disponíveis."""
    try:
        # Primeiro, obter o ID do usuário/me
        url = "https://graph.facebook.com/v21.0/me"
        params = {
            "access_token": ACCESS_TOKEN,
            "fields": "id,name"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            user_data = response.json()
            
            if "error" in user_data:
                print(f"❌ Erro ao buscar usuário: {user_data['error'].get('message')}")
                return None
            
            user_id = user_data.get("id")
            print(f"✅ Usuário encontrado: {user_data.get('name', 'N/A')} (ID: {user_id})")
        
        # Buscar contas de anúncios
        url = "https://graph.facebook.com/v21.0/me/adaccounts"
        params = {
            "access_token": ACCESS_TOKEN,
            "fields": "id,name,account_id,currency,timezone_name",
            "limit": 10
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
        
        if "error" in data:
            print(f"❌ Erro: {data['error'].get('message')}")
            print(f"   Código: {data['error'].get('code')}")
            print(f"   Tipo: {data['error'].get('type')}")
            return None
        
        accounts = data.get("data", [])
        
        if not accounts:
            print("⚠️  Nenhuma conta de anúncios encontrada")
            print("\n💡 Dicas:")
            print("   - Verifique se o token tem permissão 'ads_read'")
            print("   - Verifique se você tem acesso a contas de anúncios no Business Manager")
            return None
        
        print(f"\n✅ Encontradas {len(accounts)} conta(s) de anúncios:\n")
        
        for i, account in enumerate(accounts, 1):
            account_id = account.get("id", "")
            account_name = account.get("name", "Sem nome")
            currency = account.get("currency", "N/A")
            timezone = account.get("timezone_name", "N/A")
            
            print(f"{i}. {account_name}")
            print(f"   ID: {account_id}")
            print(f"   Moeda: {currency}")
            print(f"   Timezone: {timezone}")
            print()
        
        # Retornar o primeiro (ou o selecionado)
        return accounts[0].get("id") if accounts else None
        
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    import asyncio
    
    print("=" * 60)
    print("BUSCANDO AD ACCOUNT ID")
    print("=" * 60)
    print()
    
    ad_account_id = asyncio.run(get_ad_accounts())
    
    if ad_account_id:
        print("=" * 60)
        print(f"✅ AD ACCOUNT ID ENCONTRADO: {ad_account_id}")
        print("=" * 60)
        print("\nUse este ID no arquivo .env:")
        print(f"META_AD_ACCOUNT_ID={ad_account_id}")
    else:
        print("\n❌ Não foi possível obter o Ad Account ID")
        sys.exit(1)
