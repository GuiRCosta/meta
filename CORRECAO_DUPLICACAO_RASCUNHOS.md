# ✅ Correção: Duplicação na Meta API + Rascunhos

## 🔍 Problemas Identificados

1. **Duplicação não criava na Meta**: A duplicação apenas criava no banco local com IDs mock, não na Meta API
2. **Rascunhos não apareciam**: A sincronização não buscava campanhas em rascunho (PREVIEW/DRAFT status)

## ✅ Correções Implementadas

### 1. Duplicação na Meta API

**Antes:**
- Criava apenas no banco local com ID mock (`meta_camp_${timestamp}`)
- Não aparecia no Meta Ads Manager

**Agora:**
- ✅ Busca detalhes da campanha original na Meta
- ✅ Cria nova campanha na Meta API usando `duplicate_campaign`
- ✅ Salva no banco local com o ID real da Meta
- ✅ Aparece no Meta Ads Manager como rascunho ou pausada

**Arquivos alterados:**
- `backend/app/tools/meta_api.py` - Nova função `duplicate_campaign()`
- `backend/app/api/campaigns.py` - Novo endpoint `POST /api/campaigns/{campaign_id}/duplicate`
- `frontend/src/app/api/campaigns/[id]/duplicate/route.ts` - Agora chama backend para criar na Meta

### 2. Listagem inclui Rascunhos

**Antes:**
- Sincronização buscava apenas campanhas ACTIVE, PAUSED, ARCHIVED
- Rascunhos (PREVIEW/DRAFT) não eram incluídos

**Agora:**
- ✅ Função `list_campaigns()` aceita parâmetro `include_drafts=True` (padrão)
- ✅ Busca campanhas com `effective_status` incluindo PREVIEW
- ✅ Endpoint `/api/campaigns/` inclui rascunhos por padrão

**Arquivos alterados:**
- `backend/app/tools/meta_api.py` - `list_campaigns()` atualizada
- `backend/app/api/campaigns.py` - Endpoint atualizado para incluir rascunhos

## 🔧 Como Funciona Agora

### Duplicação:

1. **Frontend** chama `/api/campaigns/{id}/duplicate`
2. **Frontend API** chama backend `/api/campaigns/{metaId}/duplicate`
3. **Backend** busca detalhes da campanha original na Meta
4. **Backend** cria nova campanha na Meta usando `create_campaign()`
5. **Frontend** salva no banco local com ID real da Meta
6. **Resultado**: Campanha aparece no Meta Ads Manager

### Sincronização:

1. **Frontend** chama `/api/sync`
2. **Backend** busca campanhas incluindo rascunhos (`include_drafts=True`)
3. **Campanhas sincronizadas** no banco local (incluindo rascunhos)
4. **Resultado**: Rascunhos aparecem na lista

## 🚀 Próximos Passos

1. **Reiniciar backend** para aplicar mudanças:
   ```bash
   cd backend
   source env.config.sh
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Testar duplicação**:
   - Acesse: http://localhost:3000/campaigns
   - Duplique uma campanha
   - Verifique se aparece no Meta Ads Manager

3. **Testar sincronização**:
   - Clique em "Sincronizar"
   - Verifique se rascunhos aparecem na lista

## ⚠️ Observações

- **Duplicação completa**: Por enquanto, apenas a campanha base é duplicada. Ad Sets e Ads requerem chamadas adicionais à API.
- **Status de rascunhos**: Rascunhos aparecem com `effective_status = "PREVIEW"` ou `status = "PREPAUSED"`
- **Filtros**: O frontend pode filtrar por status, incluindo rascunhos

---

**Status**: ✅ Implementado e pronto para teste!
