# 🚨 REVOGAR TOKENS EXPOSTOS - AÇÃO URGENTE

**Status**: ⚠️ CRÍTICO - Execute IMEDIATAMENTE
**Tempo Estimado**: 10-15 minutos
**Data**: 2026-01-20

---

## ⚠️ POR QUE ISSO É URGENTE?

O arquivo `test_meta_sync.py` continha seu **Meta Access Token** em texto plano:
```
EAAMr8h0Y08gBQa9TYM4Rl02kqK7oZCUj0qzlPsAdhd3jkLQxVA8U9npTvlCFJ66QpMm8eHZAIIIZBt4vfGXhZAfAGZBoa4h10HgutTlscZBJcZCvqVBEv6hxlh0l8fpw8RD7IaQZCZClrtxZCG9PoXbncVlLv7Tzo9xdvpsqP99h7qyOXAEBCbNtfyON4Im1wMKaaIvOhcHx8Q
```

Embora o arquivo tenha sido removido do tracking, **o token ainda está ativo** e pode ser usado para:
- ✅ Acessar sua conta de anúncios do Meta
- ✅ Ver todas as campanhas
- ✅ Criar/modificar/deletar campanhas
- ✅ Gastar seu orçamento de anúncios
- ✅ Acessar dados de clientes

---

## 📋 PASSO A PASSO - REVOGAR E GERAR NOVO TOKEN

### 1️⃣ Revogar Token Antigo (Meta)

**Opção A: Via Facebook Business Manager**

1. Acesse: https://business.facebook.com/settings/system-users
2. Localize o usuário do sistema que gerou o token
3. Clique em **"Gerar novo token"** ou **"Revogar token atual"**
4. Confirme a revogação

**Opção B: Via Graph API Explorer**

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Clique no ícone de informação (ℹ️) ao lado do Access Token
3. Clique em **"Open in Access Token Tool"**
4. Clique em **"Revoke Token"**
5. Confirme

**Opção C: Via Access Token Debugger**

1. Acesse: https://developers.facebook.com/tools/debug/accesstoken/
2. Cole o token antigo
3. Clique em **"Debug"**
4. Se aparecer "Token is valid", clique em **"Revoke Token"**
5. Confirme

---

### 2️⃣ Gerar Novo Token (Meta)

**Método Recomendado: System User Token (Long-Lived)**

1. Acesse: https://business.facebook.com/settings/system-users

2. **Se já existe um System User**:
   - Clique no usuário do sistema
   - Clique em **"Gerar novo token"**
   - Selecione o App: **Meta Campaign Manager** (ID: 892743800378312)
   - Selecione a conta de anúncios: **act_23851104567680791**
   - Marque as permissões necessárias:
     - ✅ `ads_management`
     - ✅ `ads_read`
     - ✅ `business_management`
   - Clique em **"Gerar token"**
   - **COPIE O TOKEN IMEDIATAMENTE** (não será mostrado novamente)

3. **Se NÃO existe um System User**:
   - Clique em **"Adicionar"**
   - Nome: `Meta Campaign Manager Bot`
   - Função: **Admin**
   - Clique em **"Criar usuário do sistema"**
   - Siga os passos acima para gerar token

---

### 3️⃣ Atualizar Token no Projeto

**Frontend** (`frontend/.env.local`):

```bash
# Abrir arquivo
code frontend/.env.local

# Atualizar linha 42
META_ACCESS_TOKEN="SEU_NOVO_TOKEN_AQUI"
```

**Backend** (`backend/.env`):

```bash
# Abrir arquivo
code backend/.env

# Atualizar linha 23
META_ACCESS_TOKEN="SEU_NOVO_TOKEN_AQUI"
```

---

### 4️⃣ Verificar Token Novo Funciona

**Backend**:
```bash
cd backend
source venv/bin/activate
python -c "
from app.config import settings
print('Token configurado:', settings.meta_access_token[:20] + '...')
"
```

**Testar conexão**:
```bash
# Iniciar backend
uvicorn app.main:app --reload --port 8000

# Em outro terminal, testar
curl http://localhost:8000/api/campaigns/ | jq .
```

Deve retornar lista de campanhas (não erro de autenticação).

---

### 5️⃣ Verificar Token Antigo Foi Revogado

**Testar token antigo** (deve FALHAR):
```bash
curl "https://graph.facebook.com/v24.0/act_23851104567680791/campaigns?access_token=TOKEN_ANTIGO&fields=id,name&limit=1"
```

**Resposta Esperada** (erro):
```json
{
  "error": {
    "message": "Error validating access token: Session has been invalidated",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463
  }
}
```

Se retornar campanhas = token ainda ativo! Repita passo 1️⃣.

---

## 🔒 CHECKLIST DE SEGURANÇA

Após revogar e atualizar, verifique:

- [ ] Token antigo revogado (teste acima retorna erro)
- [ ] Token novo funcionando (backend retorna campanhas)
- [ ] `frontend/.env.local` atualizado
- [ ] `backend/.env` atualizado
- [ ] Arquivo `.env.local` está no `.gitignore` (já está ✅)
- [ ] Arquivo `test_meta_sync.py` está no `.gitignore` (já está ✅)
- [ ] **NUNCA** commitar arquivos com tokens

---

## 🚫 O QUE NÃO FAZER

❌ **NÃO** compartilhe o novo token via:
- Slack/Discord/WhatsApp
- Email
- Screenshot
- Repositório Git (público ou privado)

✅ **SEMPRE** use variáveis de ambiente (`.env`)

---

## 📊 IMPACTO DA REVOGAÇÃO

### O Que Para de Funcionar (Temporariamente):
- ⏸️ Sincronização de campanhas (até atualizar token)
- ⏸️ Criação/edição de campanhas via aplicação
- ⏸️ Insights da Meta API

### O Que Continua Funcionando:
- ✅ Login/Logout na aplicação
- ✅ Dashboard com dados locais (do banco)
- ✅ Campanhas já sincronizadas
- ✅ Analytics com dados locais

**Tempo de Downtime**: 5-10 minutos (enquanto atualiza tokens)

---

## 🔄 PRÓXIMOS PASSOS (Após Revogar)

1. ✅ Token revogado e novo gerado
2. ✅ Aplicação funcionando com novo token
3. Continuar com melhorias de segurança:
   - Aplicar rate limiting em todos endpoints
   - Adicionar validação Zod
   - Substituir console.log por logger

---

## 📞 EM CASO DE PROBLEMAS

### Problema: "Não consigo revogar o token"

**Solução**: O token pode já ter expirado. Verifique:
```bash
curl "https://graph.facebook.com/debug_token?input_token=SEU_TOKEN&access_token=SEU_TOKEN"
```

Se retornar erro, o token já está inválido (bom!).

---

### Problema: "Novo token não funciona"

**Verificar**:
1. Token copiado completamente (sem espaços)
2. Permissões corretas (`ads_management`, `ads_read`)
3. Conta de anúncios correta (`act_23851104567680791`)
4. Token é de System User (não User Token de curta duração)

---

### Problema: "Backend retorna 'Meta API não configurada'"

**Causa**: `META_ACCESS_TOKEN` não está sendo lida

**Solução**:
```bash
cd backend
source venv/bin/activate
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('META_ACCESS_TOKEN'))"
```

Se retornar `None`, o arquivo `.env` não está sendo carregado.

---

## ⏱️ TEMPO ESTIMADO

| Etapa | Tempo |
|-------|-------|
| Revogar token antigo | 2 min |
| Gerar novo token | 3 min |
| Atualizar `.env` files | 2 min |
| Testar backend | 2 min |
| Verificar revogação | 1 min |
| **TOTAL** | **10 min** |

---

## ✅ CONFIRMAÇÃO FINAL

Execute este comando para confirmar tudo está OK:

```bash
# Backend funcionando com novo token
curl http://localhost:8000/api/campaigns/ | jq '.campaigns | length'

# Deve retornar número de campanhas (ex: 161)
```

Se retornar número, **tudo certo!** ✅

Se retornar erro, revise os passos acima.

---

**⚠️ LEMBRE-SE: Execute isso HOJE. Quanto mais tempo o token ficar exposto, maior o risco.**

**Última Atualização**: 2026-01-20
**Próxima Ação**: Aplicar rate limiting em todos endpoints
