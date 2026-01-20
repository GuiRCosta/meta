# 🚀 Setup Local - Meta Campaign Manager

## 📋 O QUE FUNCIONA AGORA LOCALMENTE

### ✅ **Pronto para usar**
- ✅ Backend rodando (porta 8000)
- ✅ Seed do Prisma (dados de exemplo)
- ✅ Meta API configurada (token válido)
- ✅ Schema do banco completo

### ⚠️ **Precisa configurar**
- ❌ Frontend não está rodando
- ❌ OpenAI API Key (agentes IA)
- ❌ Database URL do backend
- ❌ Variáveis de ambiente para local

---

## 🎯 PLANO: DEIXAR TUDO FUNCIONAL EM 30 MIN

### **OPÇÃO 1: Setup Completo** (Recomendado)
Frontend + Backend + Banco com dados de exemplo

### **OPÇÃO 2: Setup Mínimo** (Mais rápido)
Só Frontend conectado ao Supabase (sem backend)

---

## 🔧 OPÇÃO 1: SETUP COMPLETO (30min)

### **PASSO 1: Configurar Variáveis de Ambiente** (5min)

#### 1.1 Criar `.env.local` no frontend
```bash
cd frontend
cp ../.env .env.local
```

#### 1.2 Editar `.env.local` e mudar para local:
```bash
# ============================================
# AMBIENTE LOCAL
# ============================================

# ============================================
# SUPABASE (Database + Storage)
# ============================================
# Usar as mesmas credenciais do .env da raiz
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ============================================
# NEXTAUTH (Autenticação)
# ============================================
NEXTAUTH_URL="http://localhost:3000"
# Gerar com: openssl rand -base64 32
AUTH_SECRET="sua-chave-secreta-aqui"

# ============================================
# OPENAI (Para Agentes IA)
# ============================================
OPENAI_API_KEY="sk-proj-..."

# ============================================
# META ADS API
# ============================================
META_APP_ID="892743800378312"
META_APP_SECRET="c07914ffea65333e9674e03a018ea175"
META_ACCESS_TOKEN="EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu"
META_AD_ACCOUNT_ID="act_SEU_ACCOUNT_ID"

# ============================================
# EVOLUTION API (WhatsApp) - OPCIONAL
# ============================================
EVOLUTION_API_URL=""
EVOLUTION_API_KEY=""
EVOLUTION_INSTANCE=""
```

#### 1.3 Criar `.env` no backend
```bash
cd ../backend
touch .env
```

Copiar conteúdo:
```bash
# Backend .env
OPENAI_API_KEY=sk-proj-...
META_ACCESS_TOKEN=EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu
META_AD_ACCOUNT_ID=act_SEU_ACCOUNT_ID
DATABASE_URL=postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
FRONTEND_URL=http://localhost:3000
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=
```

---

### **PASSO 2: Preparar o Banco de Dados** (10min)

#### 2.1 Instalar dependências do frontend (se necessário)
```bash
cd frontend
npm install
```

#### 2.2 Gerar Prisma Client
```bash
npm run db:generate
```

#### 2.3 Criar tabelas no banco
```bash
npm run db:push
```

#### 2.4 Popular banco com dados de exemplo
```bash
npm run db:seed
```

**Saída esperada**:
```
🌱 Iniciando seed do banco de dados...

👤 Criando usuário admin...
   ✅ Usuário criado: admin@metacampaigns.com
   📧 Email: admin@metacampaigns.com
   🔑 Senha: admin123

📢 Criando campanhas de exemplo...
   ✅ E-commerce Janeiro 2026
   ✅ Leads Qualificados
   ✅ Promo Verão
   ✅ Brand Awareness
   ✅ Engajamento Social

📊 Criando métricas de exemplo...
   ✅ Métricas criadas para 5 campanhas

🔔 Criando alertas de exemplo...
   ✅ CTR abaixo do esperado
   ✅ 80% do orçamento utilizado
   ✅ Tendência negativa detectada

📅 Criando resumo mensal...
   ✅ Resumo de janeiro de 2026

═══════════════════════════════════════════
🎉 Seed concluído com sucesso!
═══════════════════════════════════════════

📧 Login: admin@metacampaigns.com
🔑 Senha: admin123

Dados criados:
  • 1 usuário administrador
  • 5 campanhas de exemplo
  • 35 registros de métricas
  • 3 alertas de exemplo
  • 1 resumo mensal
```

---

### **PASSO 3: Iniciar os Serviços** (5min)

#### 3.1 Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```

**Saída esperada**:
```
   ▲ Next.js 16.1.1
   - Local:        http://localhost:3000
   - Ready in 2.3s
```

#### 3.2 Terminal 2 - Backend (já está rodando)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Saída esperada**:
```
🚀 Iniciando Meta Campaign Manager Backend...
   OpenAI Model: gpt-4o-mini
   Meta Ad Account: act_... ou Não configurado
   Evolution API: Não configurado

INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### **PASSO 4: Testar o Sistema** (10min)

#### 4.1 Abrir o navegador
```
http://localhost:3000
```

#### 4.2 Fazer login
```
Email: admin@metacampaigns.com
Senha: admin123
```

#### 4.3 Verificar Dashboard
- ✅ Ver 5 campanhas de exemplo
- ✅ Ver métricas no dashboard
- ✅ Ver gráfico de gastos (7 dias)
- ✅ Ver 3 alertas

#### 4.4 Testar funcionalidades
- [ ] **Campanhas**: Listar, ver detalhes
- [ ] **Dashboard**: Ver métricas em tempo real
- [ ] **Analytics**: Ver gráficos
- [ ] **Alertas**: Ver e marcar como lido
- [ ] **Settings**: Atualizar orçamento

---

## 🔧 OPÇÃO 2: SETUP MÍNIMO (15min)

**Se você quer testar SEM o backend:**

### Configurar apenas Frontend

```bash
cd frontend

# Criar .env.local
cat > .env.local <<EOF
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="sua-chave-secreta"
META_ACCESS_TOKEN="EAAMr8h0Y08gBQatevaZBhnq3FOmR7qEYorsDVyDTiuQMl5EOHXF7BPgTyCcSiDX6FpKKLL181szSZCZCo4AQrnyBtOo8kWaUNUs6rofj5fOoEbb0gHjjtvuSZAZCttRZBeu7m3TZBoqZAmXXvNYmIfV38ggxKo5zJZBQkuBgVQGbFogCZBZCE0MKZBrb6ZCN23CWYBsR206t9Ysxu"
META_AD_ACCOUNT_ID="act_SEU_ID"
EOF

# Instalar deps
npm install

# Preparar banco
npm run db:generate
npm run db:push
npm run db:seed

# Rodar
npm run dev
```

**O que funciona sem backend:**
- ✅ Login/Logout
- ✅ Dashboard com dados do seed
- ✅ Listagem de campanhas
- ✅ Analytics
- ✅ Alertas
- ✅ Settings
- ❌ Agente IA (precisa backend)
- ❌ Sincronização em tempo real com Meta

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Frontend rodando
- [ ] Abrir http://localhost:3000
- [ ] Fazer login com admin@metacampaigns.com / admin123
- [ ] Ver dashboard com 5 campanhas
- [ ] Ver gráfico de gastos
- [ ] Ver 3 alertas

### Backend rodando (opcional)
- [ ] Abrir http://localhost:8000/docs
- [ ] Ver documentação Swagger
- [ ] Testar endpoint GET /health
- [ ] Testar endpoint GET /api/campaigns

### Agente IA (se configurou OpenAI)
- [ ] Ir em /agent
- [ ] Enviar mensagem: "Como estão as campanhas?"
- [ ] Receber resposta do agente

### Meta API (se configurou token)
- [ ] Ir em Settings
- [ ] Clicar em "Testar Conexão"
- [ ] Ver sucesso na conexão

---

## 🎯 O QUE VOCÊ PODE TESTAR AGORA

### **Funcionalidades 100% Funcionais (Com Seed)**

1. **Dashboard Completo**
   - Orçamento mensal (R$ 2.350 / R$ 5.000)
   - Gasto hoje
   - Campanhas ativas (3)
   - Impressões, cliques, CTR
   - ROAS médio
   - Gráfico de gastos (7 dias)
   - Top campanhas
   - 3 alertas ativos

2. **Campanhas**
   - Listar 5 campanhas
   - Ver detalhes de cada uma
   - Ver métricas individuais
   - Filtrar por status
   - Duplicar campanha (cria no banco)

3. **Analytics**
   - Gráficos de performance
   - Métricas por campanha
   - Comparação de períodos

4. **Alertas**
   - Ver 3 alertas de exemplo
   - Marcar como lido
   - Filtrar por tipo

5. **Settings**
   - Atualizar orçamento mensal
   - Configurar alertas (50%, 80%, 100%)
   - Salvar Meta API credentials

### **Funcionalidades que Precisam de Configuração**

6. **Criar Nova Campanha**
   - ✅ Funciona localmente (salva no banco)
   - ⚠️ Precisa Meta API configurada para enviar ao Meta

7. **Sincronizar Campanhas**
   - ⚠️ Precisa Meta API configurada
   - Puxa campanhas reais do Meta Ads Manager

8. **Agente IA**
   - ⚠️ Precisa OpenAI API Key
   - ⚠️ Precisa Backend rodando
   - Chat com agentes especializados

9. **Notificações WhatsApp**
   - ⚠️ Precisa Evolution API configurada
   - Relatórios diários

---

## 🚨 TROUBLESHOOTING

### Frontend não inicia
```bash
# Verificar se porta 3000 está livre
lsof -ti:3000 | xargs kill -9

# Limpar cache e reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Erro no Prisma
```bash
# Regenerar client
npm run db:generate

# Resetar banco (CUIDADO: apaga tudo)
npx prisma db push --force-reset
npm run db:seed
```

### Backend não conecta ao banco
```bash
# Verificar DATABASE_URL no backend/.env
# Deve ser a mesma do frontend
echo $DATABASE_URL
```

### Agente IA não responde
```bash
# Verificar OpenAI API Key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 📝 RESUMO - COMANDOS RÁPIDOS

### Setup Inicial (executar UMA vez)
```bash
# Frontend
cd frontend
npm install
npm run db:generate
npm run db:push
npm run db:seed

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Rodar Diariamente
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend (opcional)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Acessar
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs
- Login: admin@metacampaigns.com / admin123

---

## 🎯 PRÓXIMO PASSO

**Escolha um caminho:**

### A) Testar Funcionalidades Básicas (SEM configurar APIs)
- Rodar frontend com seed
- Explorar dashboard, campanhas, analytics
- Ver como funciona a UI/UX
- **Tempo: 5 minutos**

### B) Setup Completo com Meta API (Conectar conta real)
- Configurar todas as variáveis
- Sincronizar campanhas reais
- Criar campanhas que vão para o Meta
- **Tempo: 30 minutos**

### C) Setup Completo + Agente IA
- Tudo do item B
- Configurar OpenAI API
- Testar chat com agentes
- **Tempo: 45 minutos**

---

**Qual caminho você quer seguir? A, B ou C?**
