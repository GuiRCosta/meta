# 🎯 MVP - Agente Meta Campanhas

## Visão Geral do MVP

O MVP (Minimum Viable Product) foca nas funcionalidades essenciais para validar o conceito de um sistema de gerenciamento de campanhas do Meta usando agentes de IA. O objetivo é criar uma versão funcional que permita criar, visualizar e gerenciar campanhas básicas.

## 🎯 Objetivos do MVP

1. ✅ Autenticação básica funcionando
2. ✅ Dashboard com visualização de campanhas
3. ✅ Integração com Meta API funcionando
4. ✅ Criação manual de campanhas
5. ✅ Visualização de métricas básicas
6. ✅ Primeiro agente (Criador) funcional
7. ✅ Sistema de notificações via WhatsApp (Evolution API)
8. ✅ Controle de limite de gastos e alertas de orçamento
9. ✅ Projeções de gastos e resultados

## 📋 Funcionalidades do MVP

### 1. Autenticação e Segurança
- [x] Página de login
- [x] Sistema de autenticação com NextAuth.js
- [x] Credenciais simples (email/senha) - apenas para uso pessoal
- [x] Proteção de rotas autenticadas
- [x] Sessão persistente

**Prioridade**: 🔴 CRÍTICA

### 2. Dashboard Principal
- [x] Visão geral das campanhas ativas
- [x] Cards com métricas principais:
  - Total de campanhas
  - Campanhas ativas
  - Campanhas pausadas
  - Gasto total do mês
  - Impressões totais
  - Cliques totais
- [x] Lista de campanhas recentes
- [x] Gráfico simples de gastos ao longo do tempo
- [x] **Barra de progresso do orçamento mensal** (gasto vs limite)
- [x] **Card de projeção de gastos até fim do mês**
- [x] **Indicador de tendência** (subindo/descendo)

**Prioridade**: 🔴 CRÍTICA

### 3. Gestão de Campanhas (CRUD Básico)
- [x] **Listar campanhas** do Meta
  - Sincronizar campanhas da conta Meta
  - Visualizar em tabela/lista
  - Filtros básicos (status, objetivo)
  - Busca por nome
  
- [x] **Visualizar campanha**
  - Detalhes da campanha
  - Ad Sets associados
  - Anúncios associados
  - Métricas básicas

- [x] **Criar campanha manualmente**
  - Formulário básico:
    - Nome da campanha
    - Objetivo (TR TRAFFIC, CONVERSIONS, REACH, etc.)
    - Status inicial (PAUSED/ACTIVE)
  - Criação de Ad Set básico:
    - Nome
    - Orçamento diário
    - Segmentação básica (país, idade, gênero)
  - Criação de Ad básico:
    - Nome
    - Criativo (imagem + texto)

- [ ] **Editar campanha**
  - Editar nome e status
  - Pausar/Reativar campanha

- [ ] **Deletar campanha**
  - Deletar do Meta (com confirmação)

**Prioridade**: 🔴 CRÍTICA

### 4. Integração Meta API
- [x] Cliente Meta API configurado
- [x] Autenticação com Access Token
- [x] Listar campanhas
- [x] Criar campanha
- [x] Criar Ad Set
- [x] Criar Ad
- [x] Obter métricas básicas
- [x] Sincronização de campanhas existentes

**Prioridade**: 🔴 CRÍTICA

### 5. Sistema de Agentes (Agno Framework)
- [x] **Arquitetura multiagente com Agno**
  - Backend Python com FastAPI
  - Time de agentes coordenados
  - Memória persistente (PostgreSQL)
  - Integração com Next.js via API

- [x] **Agente Coordenador**
  - Orquestra todos os agentes
  - Delega tarefas automaticamente
  - Gerencia fluxo de trabalho

- [x] **Agente Criador**
  - Interface de chat/assistente
  - Entrada via texto natural
  - Extração de parâmetros (objetivo, orçamento, público)
  - Criação automática via Meta API
  - Memória de campanhas criadas

- [x] **Agente Analisador**
  - Monitora métricas em tempo real
  - Detecta anomalias e padrões
  - Projeta resultados
  - Analisa tendências

- [x] **Agente Otimizador**
  - Sugere ajustes de orçamento/lances
  - Pausa campanhas com baixa performance
  - Recomenda otimizações

- [x] **Agente Notificador**
  - Envia mensagens via WhatsApp
  - Formata relatórios diários
  - Gera alertas e sugestões
  - Verifica limites de gastos

**Prioridade**: 🔴 CRÍTICA

### 6. Visualização de Métricas Básicas
- [x] Métricas por campanha:
  - Impressões
  - Cliques
  - Gasto (Spend)
  - CPC (Custo por Clique)
  - CTR (Taxa de Cliques)
  - CPM (Custo por 1000 impressões)
- [x] Gráfico de linha com gastos ao longo do tempo (últimos 7 dias)
- [x] Atualização manual (botão "Atualizar")
- [ ] Período customizável (futuro)

**Prioridade**: 🟡 IMPORTANTE

### 6.1 Controle de Limite de Gastos
- [x] **Configurar limite de gastos mensal**
  - Definir valor máximo de investimento por mês
  - Visualizar progresso (gasto atual vs limite)
  - Barra de progresso com cores (verde, amarelo, vermelho)

- [x] **Alertas de orçamento via WhatsApp**
  - Alerta quando atingir 50% do limite
  - Alerta quando atingir 80% do limite
  - Alerta crítico quando atingir 100% do limite
  - Alerta de projeção de estouro (antes de acontecer)

- [x] **Histórico de gastos**
  - Gasto diário/semanal/mensal
  - Comparativo com meses anteriores
  - Gráfico de evolução de gastos

**Prioridade**: 🔴 CRÍTICA

### 6.2 Projeções e Previsões
- [x] **Projeção de gastos**
  - Estimativa de gasto até fim do mês
  - Baseada na média de gastos diários
  - Alerta se projeção ultrapassar limite

- [x] **Projeção de resultados**
  - Conversões esperadas até fim do mês
  - Cliques esperados
  - Impressões esperadas
  - ROAS projetado

- [x] **Análise de tendência**
  - Indicador de melhora/piora das métricas
  - Comparativo últimos 7 dias vs 7 dias anteriores
  - Alerta de tendência negativa

- [x] **Exibição no dashboard**
  - Card com projeção de gastos
  - Card com projeção de resultados
  - Indicadores visuais de tendência (📈📉)

**Prioridade**: 🟡 IMPORTANTE

### 7. Banco de Dados (Sincronização Local)
- [x] Modelos básicos:
  - User
  - Campaign
  - AdSet
  - Ad
  - Analytics (métricas históricas)
- [x] Sincronização com Meta API
- [x] Cache local para performance
- [x] Histórico de métricas (diário)

**Prioridade**: 🔴 CRÍTICA

### 8. Notificações via WhatsApp (Evolution API)
- [x] **Integração Evolution API**
  - Configurar cliente Evolution API
  - Autenticação com API Key
  - Conectar número de WhatsApp
  - Verificar conexão da instância

- [x] **Relatórios Diários Automáticos**
  - Job agendado (diário às 18h)
  - Resumo de campanhas ativas
  - Métricas principais (impressões, cliques, gasto, CTR)
  - Comparativo com dia anterior
  - Top 3 campanhas
  - Campanhas com problemas
  - **Gasto acumulado vs limite mensal**
  - **Projeção de gastos até fim do mês**
  - **Projeção de resultados (conversões, cliques)**
  - **Indicador de tendência (📈 subindo / 📉 descendo)**

- [x] **Alertas Imediatos**
  - Campanha com CTR muito baixo (< limite configurado)
  - Campanha com CPC muito alto (> limite configurado)
  - Campanha pausada automaticamente
  - Erro detectado na campanha
  - Orçamento esgotado
  - **Limite mensal atingido (50%, 80%, 100%)**
  - **Projeção de estouro de orçamento**
  - **Tendência negativa detectada**

- [x] **Sugestões de Otimização**
  - Detectar campanhas com baixo ROAS
  - Sugerir aumento de orçamento (campanhas performando bem)
  - Sugerir pausar campanhas (baixa performance)
  - Recomendar ajustes de segmentação

- [x] **Status e Mudanças**
  - Notificar criação de campanha
  - Notificar pausa/reativação
  - Notificar mudanças significativas de métricas

- [ ] **Interação via WhatsApp** (Post-MVP)
  - Responder comandos via WhatsApp
  - Aprovar/rejeitar sugestões (SIM/NÃO)

**Prioridade**: 🔴 CRÍTICA

## 🚫 Fora do Escopo do MVP

### Funcionalidades Futuras (Post-MVP)
- ❌ Agente Analisador completo (monitoramento avançado)
- ❌ Agente Otimizador completo (ajustes automáticos complexos)
- ❌ Agente Relator completo (relatórios semanais/mensais detalhados)
- ❌ Interação bidirecional via WhatsApp (comandos, aprovações)
- ❌ Testes A/B automatizados
- ❌ Múltiplas contas de anúncios
- ❌ Permissões de usuários/equipes
- ❌ Exportação de relatórios (PDF/Excel)
- ❌ Webhooks para atualizações em tempo real (receber mensagens)
- ❌ Dashboard de analytics avançado
- ❌ Otimização automática de lances (apenas sugestões no MVP)
- ❌ Sugestões de criativos avançadas
- ❌ Integração com outras plataformas
- ❌ Notificações personalizadas por tipo de alerta

## 📐 Estrutura Mínima de Arquivos

### Arquivos Essenciais MVP

```
agente-meta-campanhas/
│
├── 📁 frontend/                    # Next.js (Deploy VPS/Docker)
│   ├── README.md
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx (Dashboard)
│       │   ├── login/page.tsx
│       │   ├── api/
│       │   │   ├── auth/[...nextauth]/route.ts
│       │   │   ├── campaigns/route.ts
│       │   │   └── agent/route.ts (proxy para Python)
│       │   └── (dashboard)/
│       │       ├── campaigns/
│       │       ├── agent/page.tsx (Chat com Agentes)
│       │       └── settings/page.tsx
│       ├── components/
│       │   ├── ui/ (shadcn)
│       │   ├── layout/
│       │   ├── campaigns/
│       │   └── agent/
│       │       └── AgentChat.tsx
│       ├── lib/
│       │   ├── auth.ts
│       │   ├── db.ts
│       │   └── agent-client.ts (cliente para API Python)
│       ├── services/
│       │   └── meta/
│       └── types/
│
├── 📁 backend/                     # Python + Agno (Deploy VPS/Docker)
│   ├── README.md
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py                 # FastAPI server
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── campaigns.py
│   │   │   └── sync.py
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── coordinator.py      # Time de agentes
│   │   │   ├── creator.py          # Agente Criador
│   │   │   ├── analyzer.py         # Agente Analisador
│   │   │   ├── optimizer.py        # Agente Otimizador
│   │   │   └── notifier.py         # Agente Notificador
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── meta_tools.py       # Ferramentas Meta API
│   │       ├── whatsapp_tools.py   # Ferramentas Evolution API
│   │       ├── analytics_tools.py  # Análise e projeções
│   │       └── budget_tools.py     # Controle de orçamento
│
├── 📄 docker-compose.yml           # Orquestra containers
├── 📄 .env.example                 # Variáveis de ambiente exemplo
└── 📄 MVP.md (este arquivo)
```

### Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                              │
│                    (Browser / WhatsApp)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   FRONTEND          │         │   WHATSAPP          │
│   (Next.js)         │         │   (Evolution API)   │
│   Docker Container  │         │                     │
└─────────┬───────────┘         └─────────┬───────────┘
          │                               │
          │         ┌─────────────────────┘
          ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND AGENTES                             │
│                  (Python + FastAPI + Agno)                   │
│                  Docker Container                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AGENTE COORDENADOR                      │    │
│  │           (Orquestra todos os agentes)               │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│    ┌───────────────────┼───────────────────┐                │
│    ▼                   ▼                   ▼                │
│ ┌────────┐      ┌────────────┐      ┌────────────┐         │
│ │CRIADOR │      │ ANALISADOR │      │NOTIFICADOR │         │
│ └────────┘      └────────────┘      └────────────┘         │
│                        │                   │                 │
│                   ┌────┴────┐              │                 │
│                   ▼         ▼              ▼                 │
│              ┌────────┐ ┌────────┐   ┌──────────┐           │
│              │OTIMIZ. │ │PROJEÇÃO│   │EVOLUTION │           │
│              └────────┘ └────────┘   │   API    │           │
│                                      └──────────┘           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                         │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │  META API   │  │  DATABASE   │  │   LLM API   │         │
│   │  (Facebook) │  │ (Supabase)  │  │(OpenAI/etc) │         │
│   └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Arquitetura Docker (VPS)

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    PORTAINER                         │    │
│  │              (Gerenciamento de Containers)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┼─────────────────────────────┐   │
│  │            DOCKER COMPOSE STACK                       │   │
│  │                                                       │   │
│  │   ┌─────────────────┐    ┌─────────────────┐         │   │
│  │   │   FRONTEND      │    │   BACKEND       │         │   │
│  │   │   (Next.js)     │───▶│   (FastAPI)     │         │   │
│  │   │   :3000         │    │   :8000         │         │   │
│  │   └─────────────────┘    └─────────────────┘         │   │
│  │            │                      │                   │   │
│  │            └──────────┬───────────┘                   │   │
│  │                       │                               │   │
│  │              meta-network (bridge)                    │   │
│  └───────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┼─────────────────────────────┐   │
│  │            REVERSE PROXY (Traefik/Nginx)              │   │
│  │                                                       │   │
│  │   seu-dominio.com:443 ──▶ frontend:3000              │   │
│  │   api.seu-dominio.com:443 ──▶ backend:8000           │   │
│  │                                                       │   │
│  │   SSL/TLS via Let's Encrypt                          │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Design do Frontend

### Princípios de Design
- **Simplicidade**: Interface limpa e intuitiva
- **Consistência**: Usar componentes do shadcn/ui
- **Responsividade**: Funcionar bem em desktop (mobile é secundário no MVP)
- **Feedback Visual**: Loading states, mensagens de sucesso/erro claras
- **Dark Mode**: Tema escuro por padrão (profissional para dashboards)

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🚀 Meta Campaigns    [Sync] [+ Nova Campanha]    🔔  👤 User ││
│  └─────────────────────────────────────────────────────────────┘│
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  CONTEÚDO PRINCIPAL                                   │
│          │                                                       │
│ 📊 Dashboard│                                                    │
│ 📢 Campanhas│                                                    │
│ 🤖 Agente IA│                                                    │
│ 📈 Analytics│                                                    │
│ ⚙️ Config   │                                                    │
│          │                                                       │
│          │                                                       │
│──────────│                                                       │
│ 💰 Orçamento│                                                    │
│ R$ 2.350/5k │                                                    │
│ [████░░] 47%│                                                    │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 🐳 DEPLOY (VPS + Docker/Portainer)

### Arquivos Docker Necessários

#### frontend/Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando para rodar a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### docker-compose.yml (raiz do projeto)

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: meta-campaigns-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - AGNO_API_URL=http://backend:8000
    depends_on:
      - backend
    networks:
      - meta-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: meta-campaigns-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - META_ACCESS_TOKEN=${META_ACCESS_TOKEN}
      - META_AD_ACCOUNT_ID=${META_AD_ACCOUNT_ID}
      - EVOLUTION_API_URL=${EVOLUTION_API_URL}
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
      - EVOLUTION_INSTANCE=${EVOLUTION_INSTANCE}
      - DATABASE_URL=${DATABASE_URL}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - meta-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  meta-network:
    driver: bridge
```

### Deploy no Portainer - Passo a Passo

1. **Preparar o código**:
   ```bash
   # Clone ou suba o código para a VPS
   git clone seu-repo.git /opt/meta-campaigns
   cd /opt/meta-campaigns
   ```

2. **Criar arquivo .env na raiz**:
   ```bash
   # .env
   DATABASE_URL=postgresql://postgres.xxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   AUTH_SECRET=sua-chave-secreta-32-chars
   NEXTAUTH_URL=https://seu-dominio.com
   OPENAI_API_KEY=sk-...
   META_ACCESS_TOKEN=EAAx...
   META_AD_ACCOUNT_ID=act_123456789
   EVOLUTION_API_URL=https://...
   EVOLUTION_API_KEY=...
   EVOLUTION_INSTANCE=...
   FRONTEND_URL=https://seu-dominio.com
   ```

3. **No Portainer**:
   - Acesse `Stacks` → `Add stack`
   - Nome: `meta-campaigns`
   - Build method: `Git Repository` ou `Upload`
   - Se Git: URL do repo + branch + path do compose
   - Configure as env variables (copie do .env)
   - Clique em `Deploy the stack`

4. **Configurar Reverse Proxy** (Traefik ou Nginx):
   - Aponte `seu-dominio.com` → `localhost:3000`
   - Aponte `api.seu-dominio.com` → `localhost:8000` (opcional)
   - Configure SSL com Let's Encrypt

### Comandos Úteis

```bash
# Build local para teste
docker-compose build

# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Parar containers
docker-compose down

# Rebuild após mudanças
docker-compose build --no-cache
docker-compose up -d

# Acessar container
docker exec -it meta-campaigns-frontend sh
docker exec -it meta-campaigns-backend bash
```

---

## 🔧 Configurações Mínimas Necessárias

### Variáveis de Ambiente Mínimas
```env
# Autenticação
NEXTAUTH_URL=https://seu-dominio.com
AUTH_SECRET=gerar-com-openssl

# Meta API (mínimas)
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
META_ACCESS_TOKEN=seu-token-long-lived
META_AD_ACCOUNT_ID=act_seu-ad-account-id

# Database
DATABASE_URL=postgresql://...

# LLM (para agentes)
OPENAI_API_KEY=sua-openai-api-key

# Backend Agentes
AGNO_API_URL=http://backend:8000

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=nome-instancia
WHATSAPP_NUMBER=5511999999999@c.us
```

### Dependências Mínimas

**Frontend (Next.js - package.json):**
```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "next-auth": "^4.24.5",
    "@prisma/client": "^5.7.1",
    "recharts": "^2.10.3",
    "tailwindcss": "^3.4.0",
    "zod": "^3.22.4",
    "axios": "^1.6.2"
  }
}
```

**Backend Agentes (Python - requirements.txt):**
```
agno>=1.0.0
fastapi>=0.109.0
uvicorn>=0.27.0
openai>=1.10.0
anthropic>=0.18.0
facebook-business>=19.0.1
httpx>=0.26.0
psycopg2-binary>=2.9.9
python-dotenv>=1.0.0
apscheduler>=3.10.4
```

## 📊 Métricas de Sucesso do MVP

### Critérios de Aceitação
- [ ] Usuário consegue fazer login
- [ ] Usuário consegue ver campanhas existentes do Meta
- [ ] Usuário consegue criar uma campanha manualmente
- [ ] Usuário consegue criar uma campanha via agente (chat)
- [ ] Métricas são exibidas corretamente
- [ ] Sistema sincroniza com Meta API sem erros
- [ ] Interface é intuitiva e profissional
- [ ] **Sistema envia relatório diário via WhatsApp**
- [ ] **Alertas de problemas são enviados via WhatsApp**
- [ ] **Sugestões de otimização são enviadas via WhatsApp**
- [ ] **Notificações de status são enviadas corretamente**
- [ ] **Limite de gastos mensal pode ser configurado**
- [ ] **Alertas de orçamento (50%, 80%, 100%) funcionam**
- [ ] **Projeção de gastos é exibida no dashboard**
- [ ] **Projeção de resultados é exibida no relatório diário**
- [ ] **Alertas de tendência negativa são enviados**

### Testes Básicos
- [ ] Teste de login/logout
- [ ] Teste de criação manual de campanha
- [ ] Teste de criação via agente
- [ ] Teste de sincronização de campanhas
- [ ] Teste de visualização de métricas
- [ ] Teste em diferentes navegadores (Chrome, Firefox, Safari)
- [ ] **Teste de envio de mensagem via WhatsApp**
- [ ] **Teste de relatório diário agendado**
- [ ] **Teste de alertas automáticos**
- [ ] **Teste de sugestões de otimização**
- [ ] **Teste de configuração de limite de gastos**
- [ ] **Teste de alertas de orçamento**
- [ ] **Teste de cálculo de projeções**
- [ ] **Teste de análise de tendências**

## ⏱️ Timeline Estimada MVP

### Fase 1: Setup Inicial (2-3 dias)
- Configurar Next.js + TypeScript
- Configurar Tailwind + shadcn/ui
- Configurar NextAuth.js
- Configurar Prisma + Banco de Dados
- Configurar estrutura de pastas

### Fase 2: Autenticação e Layout (1-2 dias)
- Página de login
- Layout do dashboard (Sidebar + Header)
- Proteção de rotas
- Navegação básica

### Fase 3: Integração Meta API (2-3 dias)
- Cliente Meta API
- Funções para listar campanhas
- Funções para criar campanha
- Sincronização com banco local
- Tratamento de erros

### Fase 4: CRUD de Campanhas (3-4 dias)
- Lista de campanhas
- Visualização de detalhes
- Formulário de criação
- Edição básica
- Pausar/Reativar

### Fase 5: Métricas e Analytics (2 dias)
- Obter métricas da Meta API
- Exibir métricas na interface
- Gráficos básicos
- Armazenar histórico

### Fase 6: Sistema de Agentes com Agno (4-5 dias)
- Configurar backend Python com FastAPI
- Instalar e configurar Agno framework
- Criar Agente Coordenador (orquestrador)
- Criar Agente Criador (campanhas)
- Criar Agente Analisador (métricas)
- Criar Agente Otimizador (sugestões)
- Criar Agente Notificador (WhatsApp)
- Definir ferramentas (tools) para cada agente
- Configurar memória persistente (PostgreSQL)
- Integrar com Next.js via API
- Interface de chat no frontend

### Fase 7: Notificações WhatsApp (3-4 dias)
- Configurar Evolution API
- Criar cliente Evolution API
- Implementar agente notificador
- Criar templates de mensagens
- Implementar relatório diário (job agendado)
- Implementar alertas automáticos
- Implementar sugestões de otimização
- Página de configurações de notificações

### Fase 8: Docker e Deploy (2-3 dias)
- Criar Dockerfile frontend
- Criar Dockerfile backend
- Criar docker-compose.yml
- Testar build local
- Deploy na VPS via Portainer
- Configurar reverse proxy + SSL
- Testes em produção

**Total Estimado: 20-28 dias** (considerando desenvolvimento em tempo parcial)

> **Nota**: O projeto usa arquitetura híbrida com Docker:
> - **Frontend**: Next.js + TypeScript (Container Docker)
> - **Backend Agentes**: Python + FastAPI + Agno (Container Docker)
> - **Orquestração**: Docker Compose + Portainer

## 🚀 Plano de Lançamento MVP

1. **Semana 1-2**: Setup + Autenticação + Layout
2. **Semana 3**: Integração Meta API + CRUD básico
3. **Semana 4**: Métricas + Agente Criador
4. **Semana 5**: Notificações WhatsApp + Configurações
5. **Semana 6**: Docker + Deploy VPS

## 📝 Checklist MVP

### Setup
- [ ] Projeto Next.js criado
- [ ] TypeScript configurado
- [ ] Tailwind CSS configurado
- [ ] shadcn/ui instalado
- [ ] NextAuth.js configurado
- [ ] Prisma configurado
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas

### Autenticação
- [ ] Página de login criada
- [ ] Sistema de autenticação funcionando
- [ ] Proteção de rotas implementada
- [ ] Sessão persistente funcionando

### Meta API
- [ ] Cliente Meta API configurado
- [ ] Listar campanhas funcionando
- [ ] Criar campanha funcionando
- [ ] Obter métricas funcionando
- [ ] Tratamento de erros implementado

### Interface
- [ ] Dashboard criado
- [ ] Lista de campanhas funcionando
- [ ] Formulário de criação funcionando
- [ ] Visualização de detalhes funcionando
- [ ] Métricas exibidas corretamente

### Agentes (Agno Framework)
- [ ] Backend Python com FastAPI configurado
- [ ] Agno framework instalado e configurado
- [ ] Agente Coordenador implementado
- [ ] Agente Criador implementado
- [ ] Agente Analisador implementado
- [ ] Agente Otimizador implementado
- [ ] Agente Notificador implementado
- [ ] Ferramentas (tools) definidas
- [ ] Memória persistente configurada
- [ ] Integração Next.js ↔ Python funcionando
- [ ] Interface de chat criada
- [ ] Processamento de comandos funcionando

### WhatsApp/Evolution API
- [ ] Evolution API instalada e configurada
- [ ] Cliente Evolution API implementado
- [ ] Conexão WhatsApp estabelecida
- [ ] Agente Notificador implementado
- [ ] Relatório diário agendado funcionando
- [ ] Alertas automáticos funcionando
- [ ] Sugestões de otimização funcionando
- [ ] Templates de mensagens criados
- [ ] Página de configurações criada
- [ ] Teste de envio de mensagem funcionando

### Orçamento e Projeções
- [ ] Limite de gastos mensal configurável
- [ ] Barra de progresso de orçamento no dashboard
- [ ] Alertas de orçamento (50%, 80%, 100%) funcionando
- [ ] Projeção de gastos implementada
- [ ] Projeção de resultados implementada
- [ ] Análise de tendências implementada
- [ ] Alertas de tendência negativa funcionando
- [ ] Projeções exibidas no relatório diário

### Docker e Deploy
- [ ] Dockerfile frontend criado e testado
- [ ] Dockerfile backend criado e testado
- [ ] docker-compose.yml criado
- [ ] Build local funcionando
- [ ] Stack criada no Portainer
- [ ] Variáveis configuradas no Portainer
- [ ] Containers rodando na VPS
- [ ] Reverse proxy configurado (Traefik/Nginx)
- [ ] SSL/HTTPS funcionando
- [ ] Health checks funcionando
- [ ] Comunicação frontend ↔ backend funcionando
- [ ] Agentes funcionando em produção
- [ ] Notificações WhatsApp funcionando em produção
- [ ] Jobs agendados (relatório diário) funcionando

---

**Nota**: Este MVP é focado em validar a viabilidade do conceito. Após validação, as funcionalidades avançadas (interação bidirecional via WhatsApp, comandos por voz, relatórios avançados) serão desenvolvidas.

---

*Última atualização: 13/01/2026 - Adaptado para VPS + Docker/Portainer*
