# 📚 Documentação: Endpoint /copies da Meta API

## ✅ Implementação Concluída

**Data:** 19/01/2026  
**Status:** ✅ Funcional (com algumas limitações)

---

## 📌 Endpoint para Duplicar Campanhas

### POST `/{CAMPAIGN_ID}/copies`

**URL Completa:**
```
POST https://graph.facebook.com/v24.0/{CAMPAIGN_ID}/copies
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `access_token` | string | ✅ Sim | - | Token de acesso do Meta |
| `deep_copy` | string ("true"/"false") | ❌ Não | "false" | Se deve copiar também ad sets e anúncios |
| `status_option` | string | ❌ Não | "PAUSED" | Status da nova campanha (ACTIVE, PAUSED) |
| `rename_suffix` | string | ❌ Não | - | Sufixo para o nome da campanha |
| `rename_prefix` | string | ❌ Não | - | Prefixo para o nome da campanha |
| `rename_strategy` | string | ❌ Não | - | Estratégia de renomeação |

### ⚠️ Limitações Importantes

1. **Limite de Objetos:**
   - Com `deep_copy=true`, o total de ad sets + ads não pode exceder **3 objetos**
   - Se a campanha tiver muitos ad sets/ads, use `deep_copy=false`
   - Para campanhas grandes, use **batch requests** assíncronos

2. **Mesma Conta de Anúncios:**
   - ✅ Funciona dentro da mesma conta de anúncios
   - ❌ Não funciona para copiar entre diferentes ad accounts

3. **Permissões:**
   - Requer token com permissão `ads_management`
   - Geralmente requer **Advanced Access** no Meta Developer

### Exemplo de Uso

#### Python (httpx)
```python
import httpx

async def duplicate_campaign(campaign_id: str, token: str):
    url = f"https://graph.facebook.com/v24.0/{campaign_id}/copies"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            data={
                "access_token": token,
                "deep_copy": "false",  # false para evitar limite
                "status_option": "PAUSED",
                "rename_suffix": " - Cópia",
            },
            timeout=30
        )
        result = response.json()
        
        if "error" in result:
            print(f"Erro: {result['error']['message']}")
        else:
            new_campaign_id = result.get("id")
            print(f"Nova campanha: {new_campaign_id}")
```

#### cURL
```bash
curl -X POST "https://graph.facebook.com/v24.0/{CAMPAIGN_ID}/copies" \
  -F 'access_token=SEU_TOKEN' \
  -F 'deep_copy=false' \
  -F 'status_option=PAUSED' \
  -F 'rename_suffix= - Cópia'
```

### Resposta de Sucesso

```json
{
  "id": "12345678901234567"
}
```

### Resposta de Erro

#### Erro 1: Solicitação muito grande (error_subcode: 1885194)
```json
{
  "error": {
    "message": "Invalid parameter",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": 1885194,
    "error_user_title": "A solicitação de cópia é muito grande",
    "error_user_msg": "O número de objetos de anúncio que você está tentando copiar no momento é muito grande. O número total de anúncios, conjuntos de anúncios e campanhas a serem copiados de uma vez deve ser inferior a 3. Se você está usando o modo de API normal, considere a possibilidade de chamar a API no lote assíncrono..."
  }
}
```

**Solução:** Use `deep_copy=false` ou divida em batch requests assíncronos.

#### Erro 2: Permissão insuficiente
```json
{
  "error": {
    "message": "(#200) Requires extended permission: ads_management",
    "type": "OAuthException",
    "code": 200
  }
}
```

**Solução:** Solicite permissão `ads_management` no Meta Developer.

---

## 🔧 Implementação Atual

### Backend: `app/tools/meta_api.py`

```python
async def duplicate_campaign(
    campaign_id: str, 
    name_suffix: str = " - Cópia",
    deep_copy: bool = False,  # Padrão False para evitar limite
    status_option: str = "PAUSED"
) -> dict:
    """
    Duplica uma campanha existente na Meta API usando o endpoint /copies.
    """
    url = f"https://graph.facebook.com/v24.0/{campaign_id}/copies"
    
    data = {
        "deep_copy": "true" if deep_copy else "false",
        "status_option": status_option,
    }
    
    if name_suffix:
        clean_suffix = name_suffix.strip()
        if not clean_suffix.startswith(" ") and not clean_suffix.startswith("-"):
            clean_suffix = " " + clean_suffix
        data["rename_suffix"] = clean_suffix
    
    # ... implementação completa no código
```

### Endpoint: `POST /api/campaigns/{campaign_id}/duplicate`

```python
@router.post("/{campaign_id}/duplicate")
async def duplicate(campaign_id: str, request: DuplicateCampaignRequest):
    """
    Duplica uma campanha existente na Meta API usando o endpoint /copies.
    """
    result = await duplicate_campaign(
        campaign_id,
        name_suffix=request.name_suffix,
        deep_copy=request.deep_copy,  # Padrão: False
        status_option=request.status_option
    )
    # ...
```

---

## 📊 Testes Realizados

✅ **Teste 1:** Duplicação com `deep_copy=false` - **SUCESSO**  
⚠️ **Teste 2:** Duplicação com `deep_copy=true` - **ERRO** (solicitação muito grande)  
✅ **Teste 3:** Duplicação com `rename_suffix` - **SUCESSO**

---

## 💡 Recomendações

1. **Use `deep_copy=false` por padrão:**
   - Evita erros de limite
   - Funciona para a maioria das campanhas
   - Ad sets e ads podem ser duplicados depois manualmente se necessário

2. **Para campanhas grandes:**
   - Use batch requests assíncronos
   - Documentação: https://developers.facebook.com/docs/graph-api/asynchronous-batch-requests

3. **Tratamento de erros:**
   - Sempre verifique `error_subcode: 1885194` (solicitação muito grande)
   - Sugira usar `deep_copy=false` ou batch requests

---

## 🔗 Referências

- [Meta Marketing API - Duplicar Campanha](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/copies/)
- [Batch Requests Assíncronos](https://developers.facebook.com/docs/graph-api/asynchronous-batch-requests)

---

**Status:** ✅ Implementado e Funcional  
**Última Atualização:** 19/01/2026
