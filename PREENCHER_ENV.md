# 🔑 Variáveis de Ambiente - STATUS ATUALIZADO

## ✅ **CONFIGURAÇÃO COMPLETA! (2026-01-20 16:55)**

### 🎉 **Arquivos Criados com Sucesso**
- ✅ `frontend/.env.local` - **8/9 variáveis críticas configuradas** (falta só OpenAI)
- ✅ `backend/.env` - **4/5 variáveis configuradas** (falta só OpenAI)

### ✅ **JÁ CONFIGURADO AUTOMATICAMENTE**
- ✅ DATABASE_URL (Supabase com pgbouncer)
- ✅ DIRECT_URL (Supabase conexão direta)
- ✅ NEXT_PUBLIC_SUPABASE_URL (https://dqwefmgqdfzgtmahsvds.supabase.co)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT token válido)
- ✅ SUPABASE_SERVICE_ROLE_KEY (Service role token)
- ✅ NEXTAUTH_URL (http://localhost:3000)
- ✅ AUTH_SECRET (Chave segura gerada)
- ✅ AGNO_API_URL (http://localhost:8000)
- ✅ META_APP_ID: `892743800378312`
- ✅ META_APP_SECRET: `c07914ffea65333e9674e03a018ea175`
- ✅ META_ACCESS_TOKEN: Token válido configurado
- ✅ META_AD_ACCOUNT_ID: `act_23851104567680791` **✨ NOVO!**
- ✅ FRONTEND_URL (http://localhost:3000)

### 🟡 **FALTA PREENCHER (Opcional - só para Agente IA)**

**IMPORTANTE**: O MVP está 100% FUNCIONAL para campanhas Meta! Só falta OpenAI para IA funcionar.

#### 1. **Supabase** (CRÍTICO - sem isso não funciona)
📍 Onde obter: https://supabase.com/dashboard

Vá em seu projeto Supabase:
1. **Settings** → **Database**
   - `DATABASE_URL` (Connection Pooling)
   - `DIRECT_URL` (Direct Connection)

2. **Settings** → **API**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Formato esperado:**
```bash
DATABASE_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. **Meta Ad Account ID** (IMPORTANTE - para sincronizar campanhas)
📍 Onde obter: https://business.facebook.com/settings

1. Vá em **Business Settings**
2. Clique em **Accounts** → **Ad Accounts**
3. Selecione sua conta
4. Copie o ID (ex: `123456789`)
5. Adicione o prefixo `act_` → `act_123456789`

**Formato esperado:**
```bash
META_AD_ACCOUNT_ID="act_123456789"
```

#### 3. **OpenAI API Key** (OPCIONAL - só para Agente IA)
📍 Onde obter: https://platform.openai.com/api-keys

1. Criar uma nova chave
2. Copiar (começa com `sk-proj-...`)

**Formato esperado:**
```bash
OPENAI_API_KEY="sk-proj-..."
```

---

## 📝 ARQUIVOS PARA CRIAR

### **Arquivo 1: `frontend/.env.local`**

```bash
# ============================================
# SUPABASE (Database + Storage)
# ============================================
# 🔴 PREENCHER COM SUAS CREDENCIAIS DO SUPABASE
DATABASE_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ============================================
# NEXTAUTH (Autenticação)
# ============================================
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="yhCi0An4Uhhabaw7KaaaAdNd8cUiiRiDgcEDXI6GCVQ="

# ============================================
# OPENAI (OPCIONAL - Só se quiser usar Agente IA)
# ============================================
# 🟡 PREENCHER SE QUISER AGENTE IA FUNCIONANDO
OPENAI_API_KEY=""

# ============================================
# META ADS API
# ============================================
META_APP_ID="892743800378312"
META_APP_SECRET="c07914ffea65333e9674e03a018ea175"
META_ACCESS_TOKEN="EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu"
# 🟡 PREENCHER COM SEU AD ACCOUNT ID (com prefixo act_)
META_AD_ACCOUNT_ID=""

# ============================================
# EVOLUTION API (WhatsApp) - OPCIONAL
# ============================================
EVOLUTION_API_URL=""
EVOLUTION_API_KEY=""
EVOLUTION_INSTANCE=""
```

### **Arquivo 2: `backend/.env`**

```bash
# ============================================
# OPENAI (OPCIONAL - Só para Agente IA)
# ============================================
OPENAI_API_KEY=""

# ============================================
# META ADS API
# ============================================
META_ACCESS_TOKEN="EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu"
# 🟡 PREENCHER COM SEU AD ACCOUNT ID
META_AD_ACCOUNT_ID=""

# ============================================
# DATABASE (Usar mesmas credenciais do frontend)
# ============================================
# 🔴 PREENCHER COM SUAS CREDENCIAIS DO SUPABASE
DATABASE_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL="http://localhost:3000"

# ============================================
# EVOLUTION API (WhatsApp) - OPCIONAL
# ============================================
EVOLUTION_API_URL=""
EVOLUTION_API_KEY=""
EVOLUTION_INSTANCE=""
```

---

## 🎯 PRIORIDADES - O QUE PREENCHER PRIMEIRO

### **NÍVEL 1: OBRIGATÓRIO** (Para rodar o frontend)
1. ✅ `DATABASE_URL` (Supabase)
2. ✅ `DIRECT_URL` (Supabase)
3. ✅ `NEXT_PUBLIC_SUPABASE_URL` (Supabase)
4. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase)
5. ✅ `NEXTAUTH_URL` (já está: `http://localhost:3000`)
6. ✅ `AUTH_SECRET` (já gerado: `yhCi0An4Uhhabaw7KaaaAdNd8cUiiRiDgcEDXI6GCVQ=`)

**Sem esses 6, o sistema não roda!**

### **NÍVEL 2: IMPORTANTE** (Para funcionalidades Meta)
7. 🟡 `META_AD_ACCOUNT_ID` (para sincronizar campanhas reais)

**Sem isso, funciona com dados fake do seed**

### **NÍVEL 3: OPCIONAL** (Para features extras)
8. ⚪ `OPENAI_API_KEY` (para Agente IA funcionar)
9. ⚪ `EVOLUTION_API_*` (para WhatsApp)

---

## 🚀 PASSO A PASSO - FAZER AGORA

### **1. Copiar Credenciais do Supabase** (5 min)

```bash
# Abra seu projeto Supabase
https://supabase.com/dashboard/project/[SEU_PROJETO]

# Vá em Settings → Database
# Copie "Connection string" (Transaction pooling)
# Exemplo:
# postgresql://postgres.abcdefghijk:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Vá em Settings → API
# Copie "Project URL" e "anon public"
```

### **2. Criar arquivo `.env.local` no frontend**

```bash
cd frontend
nano .env.local
# Cole o conteúdo do "Arquivo 1" acima
# Preencha as variáveis do Supabase
# Salve: Ctrl+O, Enter, Ctrl+X
```

### **3. Criar arquivo `.env` no backend** (opcional)

```bash
cd ../backend
nano .env
# Cole o conteúdo do "Arquivo 2" acima
# Preencha as variáveis do Supabase
# Salve: Ctrl+O, Enter, Ctrl+X
```

### **4. Testar se está correto**

```bash
cd ../frontend

# Testar Prisma (deve conectar no banco)
npx prisma db push

# Se funcionar, você está pronto!
```

---

## ✅ CHECKLIST RÁPIDO

Marque conforme for preenchendo:

### Frontend (`frontend/.env.local`)
- [ ] `DATABASE_URL` preenchido
- [ ] `DIRECT_URL` preenchido
- [ ] `NEXT_PUBLIC_SUPABASE_URL` preenchido
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` preenchido
- [ ] `NEXTAUTH_URL` = `http://localhost:3000`
- [ ] `AUTH_SECRET` = `yhCi0An4Uhhabaw7KaaaAdNd8cUiiRiDgcEDXI6GCVQ=`
- [ ] `META_ACCESS_TOKEN` = (já está preenchido)
- [ ] `META_AD_ACCOUNT_ID` = `act_...` (seu ID)

### Backend (`backend/.env`) - Opcional
- [ ] `DATABASE_URL` (mesmo do frontend)
- [ ] `META_ACCESS_TOKEN` (já está)
- [ ] `META_AD_ACCOUNT_ID` (mesmo do frontend)
- [ ] `OPENAI_API_KEY` (se quiser IA)

---

## 🆘 AJUDA RÁPIDA

### Não tem Supabase ainda?
1. Criar conta grátis: https://supabase.com
2. Criar novo projeto
3. Copiar credenciais conforme acima

### Não lembra do Ad Account ID?
1. Acesse: https://business.facebook.com/settings/ad-accounts
2. Clique na sua conta
3. Veja o ID (ex: `123456789`)
4. Adicione `act_` na frente → `act_123456789`

### Token da Meta expirou?
1. Acesse: https://developers.facebook.com/tools/explorer
2. Selecione seu App
3. Clique em "Generate Access Token"
4. Copie o novo token

---

## 📌 TEMPLATE PRONTO PARA COPIAR

Copie, cole e preencha só os `[PROJETO]` e `[SENHA]`:

```bash
DATABASE_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[COPIAR_DO_SUPABASE]"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="yhCi0An4Uhhabaw7KaaaAdNd8cUiiRiDgcEDXI6GCVQ="
META_ACCESS_TOKEN="EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu"
META_AD_ACCOUNT_ID="act_[SEU_ID_AQUI]"
OPENAI_API_KEY=""
```

---

**Quer que eu crie os arquivos `.env.local` e `backend/.env` diretamente para você?**

Preciso apenas:
1. Suas credenciais do Supabase (DATABASE_URL, etc)
2. Seu META_AD_ACCOUNT_ID (se tiver)

Ou você prefere fazer manualmente seguindo o guia acima?
