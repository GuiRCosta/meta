# 📘 Meta Marketing API - Documentação de Endpoints

Este documento descreve os principais endpoints da **Meta Marketing API (Graph API v24.0)** para criar, listar, pausar, ativar e excluir campanhas de anúncios.

---

## 🧠 Pré-Requisitos

Antes de usar os endpoints:

✔️ **Access Token** com permissões:
- `ads_management` - Para criar e modificar campanhas
- `ads_read` - Para ler informações de campanhas
- Aprovação do app no Meta Developer (para produção)

✔️ **Ad Account ID** no formato `act_123456789`  
✔️ **Versão da API**: `v24.0` (configurada no projeto)

**Formato das requisições:**
```
https://graph.facebook.com/v24.0/<ENDPOINT>
```

**Autenticação:**
Todas as requisições incluem o token de acesso:
```
Authorization: Bearer <ACCESS_TOKEN>
```
ou via parâmetro:
```
?access_token=<ACCESS_TOKEN>
```

---

## 🚀 Endpoints Principais

### 🔹 1. Criar Campanha

**Método:** `POST`

**Endpoint:**
```
https://graph.facebook.com/v24.0/act_<AD_ACCOUNT_ID>/campaigns
```

**Parâmetros obrigatórios:**
- `name` (string) - Nome da campanha
- `objective` (string) - Objetivo da campanha
- `status` (string) - Status inicial (ACTIVE, PAUSED)
- `access_token` (string) - Token de acesso

**Parâmetros opcionais:**
- `daily_budget` (integer) - Orçamento diário em centavos
- `lifetime_budget` (integer) - Orçamento total em centavos
- `special_ad_categories` (array) - Categorias especiais (HOUSING, EMPLOYMENT, CREDIT)
- `buying_type` (string) - Tipo de compra (AUCTION, RESERVATION)

**Objetivos válidos:**
- `OUTCOME_SALES` - Vendas/Conversões
- `OUTCOME_LEADS` - Geração de leads
- `OUTCOME_TRAFFIC` - Tráfego para site
- `OUTCOME_ENGAGEMENT` - Engajamento
- `OUTCOME_AWARENESS` - Reconhecimento de marca
- `LINK_CLICKS` - Cliques no link

**Exemplo CURL:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/act_1568625274500386/campaigns" \
  -F 'name=Minha Campanha API' \
  -F 'objective=OUTCOME_SALES' \
  -F 'status=PAUSED' \
  -F 'special_ad_categories=[]' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```

**Exemplo Python (httpx):**
```python
import httpx

url = "https://graph.facebook.com/v24.0/act_1568625274500386/campaigns"
data = {
    "access_token": "SEU_ACCESS_TOKEN",
    "name": "Minha Campanha API",
    "objective": "OUTCOME_SALES",
    "status": "PAUSED",
    "special_ad_categories": []
}

async with httpx.AsyncClient() as client:
    response = await client.post(url, json=data)
    result = response.json()
    print(result)
```

**Resposta de sucesso:**
```json
{
  "id": "23851571763180791"
}
```

---

### 🔹 2. Listar Campanhas

**Método:** `GET`

**Endpoint:**
```
https://graph.facebook.com/v24.0/act_<AD_ACCOUNT_ID>/campaigns
```

**Parâmetros de query:**
- `fields` (string) - Campos a retornar (separados por vírgula)
- `limit` (integer) - Número máximo de resultados (padrão: 25, máximo: 100)
- `filtering` (JSON string) - Filtros para buscar campanhas específicas
- `access_token` (string) - Token de acesso

**Campos disponíveis:**
- `id` - ID da campanha
- `name` - Nome da campanha
- `objective` - Objetivo
- `status` - Status (ACTIVE, PAUSED, ARCHIVED, DELETED)
- `effective_status` - Status efetivo (inclui PREVIEW, PENDING_REVIEW, etc.)
- `daily_budget` - Orçamento diário
- `lifetime_budget` - Orçamento total
- `created_time` - Data de criação
- `updated_time` - Data de atualização

**Exemplo CURL:**
```bash
curl -X GET "https://graph.facebook.com/v24.0/act_1568625274500386/campaigns?fields=id,name,status,objective&limit=50&access_token=SEU_ACCESS_TOKEN"
```

**Exemplo com filtro por status:**
```bash
curl -X GET "https://graph.facebook.com/v24.0/act_1568625274500386/campaigns?fields=id,name,status&filtering=[{\"field\":\"effective_status\",\"operator\":\"IN\",\"value\":[\"ACTIVE\",\"PAUSED\"]}]&access_token=SEU_ACCESS_TOKEN"
```

**Exemplo Python:**
```python
import httpx

url = "https://graph.facebook.com/v24.0/act_1568625274500386/campaigns"
params = {
    "access_token": "SEU_ACCESS_TOKEN",
    "fields": "id,name,status,objective,effective_status,daily_budget",
    "limit": 50
}

async with httpx.AsyncClient() as client:
    response = await client.get(url, params=params)
    data = response.json()
    campaigns = data.get("data", [])
    print(f"Encontradas {len(campaigns)} campanhas")
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "23851571763180791",
      "name": "[VENDAS][PRE-LP2][CBO] — Cópia",
      "status": "PAUSED",
      "objective": "OUTCOME_SALES",
      "effective_status": "PAUSED"
    }
  ],
  "paging": {
    "cursors": {
      "before": "...",
      "after": "..."
    }
  }
}
```

---

### 🔹 3. Buscar Detalhes de uma Campanha

**Método:** `GET`

**Endpoint:**
```
https://graph.facebook.com/v24.0/<CAMPAIGN_ID>
```

**Parâmetros de query:**
- `fields` (string) - Campos a retornar
- `access_token` (string) - Token de acesso

**Exemplo CURL:**
```bash
curl -X GET "https://graph.facebook.com/v24.0/23851571763180791?fields=id,name,objective,status,daily_budget,special_ad_categories&access_token=SEU_ACCESS_TOKEN"
```

**Exemplo com Ad Sets e Ads:**
```bash
curl -X GET "https://graph.facebook.com/v24.0/23851571763180791?fields=id,name,objective,status,adsets{id,name,status},ads{id,name,status}&access_token=SEU_ACCESS_TOKEN"
```

---

### 🔹 4. Atualizar Status da Campanha

**Método:** `POST`

**Endpoint:**
```
https://graph.facebook.com/v24.0/<CAMPAIGN_ID>
```

**Parâmetros:**
- `status` (string) - Novo status:
  - `ACTIVE` - Ativar campanha
  - `PAUSED` - Pausar campanha
  - `ARCHIVED` - Arquivar campanha
  - `DELETED` - Deletar campanha
- `access_token` (string) - Token de acesso

**Exemplo - Pausar Campanha:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/23851571763180791" \
  -F 'status=PAUSED' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```

**Exemplo - Ativar Campanha:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/23851571763180791" \
  -F 'status=ACTIVE' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```

**Exemplo Python:**
```python
import httpx

campaign_id = "23851571763180791"
url = f"https://graph.facebook.com/v24.0/{campaign_id}"
data = {
    "access_token": "SEU_ACCESS_TOKEN",
    "status": "PAUSED"  # ou "ACTIVE"
}

async with httpx.AsyncClient() as client:
    response = await client.post(url, data=data)
    result = response.json()
    print(result)
```

**Resposta de sucesso:**
```json
{
  "success": true
}
```

---

### 🔹 5. Atualizar Outras Propriedades da Campanha

**Método:** `POST`

**Endpoint:**
```
https://graph.facebook.com/v24.0/<CAMPAIGN_ID>
```

**Propriedades que podem ser atualizadas:**
- `name` - Nome da campanha
- `daily_budget` - Orçamento diário (em centavos)
- `lifetime_budget` - Orçamento total (em centavos)
- `special_ad_categories` - Categorias especiais
- `status` - Status da campanha

**Exemplo - Atualizar Nome:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/23851571763180791" \
  -F 'name=Novo Nome da Campanha' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```

**Exemplo - Atualizar Orçamento Diário:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/23851571763180791" \
  -F 'daily_budget=10000' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```
*(10000 = R$ 100,00 em centavos)*

---

### 🔹 6. Deletar/Remover Campanha

⚠️ **Importante:** A API não exclui fisicamente a campanha, apenas marca como `DELETED`.

**Método:** `POST`

**Endpoint:**
```
https://graph.facebook.com/v24.0/<CAMPAIGN_ID>
```

**Parâmetros:**
- `status=DELETED`
- `access_token` (string) - Token de acesso

**Exemplo CURL:**
```bash
curl -X POST "https://graph.facebook.com/v24.0/23851571763180791" \
  -F 'status=DELETED' \
  -F 'access_token=SEU_ACCESS_TOKEN'
```

**Exemplo Python:**
```python
import httpx

campaign_id = "23851571763180791"
url = f"https://graph.facebook.com/v24.0/{campaign_id}"
data = {
    "access_token": "SEU_ACCESS_TOKEN",
    "status": "DELETED"
}

async with httpx.AsyncClient() as client:
    response = await client.post(url, data=data)
    result = response.json()
    print(result)
```

---

### 🔹 7. Buscar Insights/Métricas da Campanha

**Método:** `GET`

**Endpoint:**
```
https://graph.facebook.com/v24.0/<CAMPAIGN_ID>/insights
```

**Parâmetros:**
- `fields` (string) - Métricas a retornar
- `date_preset` (string) - Período (today, yesterday, last_7d, last_14d, last_30d, etc.)
- `time_range` (JSON string) - Período customizado
- `access_token` (string) - Token de acesso

**Campos disponíveis:**
- `impressions` - Impressões
- `clicks` - Cliques
- `spend` - Gasto
- `cpc` - Custo por clique
- `ctr` - Taxa de cliques
- `reach` - Alcance
- `conversions` - Conversões
- `cost_per_conversion` - Custo por conversão

**Exemplo CURL:**
```bash
curl -X GET "https://graph.facebook.com/v24.0/23851571763180791/insights?fields=impressions,clicks,spend,ctr&date_preset=last_7d&access_token=SEU_ACCESS_TOKEN"
```

**Exemplo Python:**
```python
import httpx

campaign_id = "23851571763180791"
url = f"https://graph.facebook.com/v24.0/{campaign_id}/insights"
params = {
    "access_token": "SEU_ACCESS_TOKEN",
    "fields": "impressions,clicks,spend,ctr,reach,conversions",
    "date_preset": "last_7d"
}

async with httpx.AsyncClient() as client:
    response = await client.get(url, params=params)
    data = response.json()
    insights = data.get("data", [{}])[0] if data.get("data") else {}
    print(insights)
```

---

## 📋 Tabela Resumo de Endpoints

| Ação | Método | Endpoint | Parâmetros Principais |
|------|--------|----------|----------------------|
| **Criar campanha** | `POST` | `/act_<AD_ACCOUNT_ID>/campaigns` | `name`, `objective`, `status` |
| **Listar campanhas** | `GET` | `/act_<AD_ACCOUNT_ID>/campaigns` | `fields`, `limit`, `filtering` |
| **Buscar detalhes** | `GET` | `/<CAMPAIGN_ID>` | `fields` |
| **Pausar campanha** | `POST` | `/<CAMPAIGN_ID>` | `status=PAUSED` |
| **Ativar campanha** | `POST` | `/<CAMPAIGN_ID>` | `status=ACTIVE` |
| **Atualizar propriedades** | `POST` | `/<CAMPAIGN_ID>` | `name`, `daily_budget`, etc. |
| **Deletar campanha** | `POST` | `/<CAMPAIGN_ID>` | `status=DELETED` |
| **Buscar insights** | `GET` | `/<CAMPAIGN_ID>/insights` | `fields`, `date_preset` |

---

## ⚠️ Códigos de Erro Comuns

| Código | Mensagem | Solução |
|--------|----------|---------|
| `100` | Invalid parameter | Verifique se todos os parâmetros obrigatórios foram enviados |
| `190` | Invalid access token | Token expirado ou inválido - gere um novo token |
| `200` | Permission denied | Token não tem permissões necessárias (`ads_management`) |
| `2500` | Unknown path components | ID da campanha ou ad account inválido |
| `2635` | No permission to access | Token não tem acesso a essa conta de anúncios |

---

## 📝 Exemplo Completo - Fluxo de Uso

```python
import httpx
import asyncio

# Configurações
ACCESS_TOKEN = "SEU_ACCESS_TOKEN"
AD_ACCOUNT_ID = "act_1568625274500386"
API_VERSION = "v24.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"

async def gerenciar_campanha():
    async with httpx.AsyncClient() as client:
        # 1. Criar campanha
        create_url = f"{BASE_URL}/{AD_ACCOUNT_ID}/campaigns"
        create_data = {
            "access_token": ACCESS_TOKEN,
            "name": "Campanha Teste API",
            "objective": "OUTCOME_SALES",
            "status": "PAUSED",
            "special_ad_categories": []
        }
        
        response = await client.post(create_url, json=create_data)
        create_result = response.json()
        
        if "error" in create_result:
            print(f"Erro ao criar: {create_result['error']}")
            return
        
        campaign_id = create_result["id"]
        print(f"✅ Campanha criada: {campaign_id}")
        
        # 2. Buscar detalhes
        details_url = f"{BASE_URL}/{campaign_id}"
        details_params = {
            "access_token": ACCESS_TOKEN,
            "fields": "id,name,status,objective"
        }
        response = await client.get(details_url, params=details_params)
        details = response.json()
        print(f"📋 Detalhes: {details}")
        
        # 3. Ativar campanha
        update_url = f"{BASE_URL}/{campaign_id}"
        update_data = {
            "access_token": ACCESS_TOKEN,
            "status": "ACTIVE"
        }
        response = await client.post(update_url, data=update_data)
        update_result = response.json()
        print(f"🟢 Campanha ativada: {update_result}")
        
        # 4. Buscar métricas
        insights_url = f"{BASE_URL}/{campaign_id}/insights"
        insights_params = {
            "access_token": ACCESS_TOKEN,
            "fields": "impressions,clicks,spend",
            "date_preset": "last_7d"
        }
        response = await client.get(insights_url, params=insights_params)
        insights = response.json()
        print(f"📊 Métricas: {insights}")

# Executar
asyncio.run(gerenciar_campanha())
```

---

## 🔗 Referências

- **Documentação Oficial:** https://developers.facebook.com/docs/marketing-apis
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Marketing API Reference:** https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group
- **App Dashboard:** https://developers.facebook.com/apps/

---

## ⚙️ Configuração no Projeto

**Backend (`backend/app/tools/meta_api.py`):**
- Versão da API: `v24.0`
- Ad Account ID: `act_1568625274500386` (IDEVA Reserva)
- Access Token: Configurado via `META_ACCESS_TOKEN`

**Endpoints Implementados:**
- ✅ `list_campaigns()` - Listar campanhas
- ✅ `get_campaign_details()` - Buscar detalhes
- ✅ `create_campaign()` - Criar campanha
- ✅ `update_campaign_status()` - Atualizar status
- ✅ `get_campaign_insights()` - Buscar métricas
- ✅ `duplicate_campaign()` - Duplicar campanha

---

**Última atualização:** 19/01/2026  
**Versão da API:** v24.0  
**Status:** ✅ Documentação completa
