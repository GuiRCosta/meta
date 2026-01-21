# Meta Campaign Manager

Sistema completo de gerenciamento inteligente de campanhas Meta Ads com agentes de IA, dashboard em tempo real e automação de otimizações.

## Visão Geral

O Meta Campaign Manager é uma plataforma fullstack que permite gerenciar campanhas de publicidade do Meta (Facebook/Instagram) através de uma interface intuitiva, com suporte a agentes de IA para análise, otimização e notificações automatizadas.

### Principais Funcionalidades

- Dashboard em tempo real com métricas de desempenho
- Sistema de agentes de IA multi-especializados (Criador, Analisador, Otimizador, Notificador)
- Gerenciamento completo de campanhas, ad sets e anúncios
- Sincronização automática com Meta Marketing API
- Alertas inteligentes sobre orçamento e performance
- Duplicação de campanhas com histórico
- Integração com WhatsApp (Evolution API) para notificações
- Sistema de autenticação seguro
- Upload de mídias para Supabase Storage

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Gráficos**: Recharts
- **Autenticação**: NextAuth.js v5
- **Database**: Prisma + PostgreSQL (Supabase)
- **HTTP Client**: Axios
- **Forms & Validation**: Zod

### Backend
- **Framework**: FastAPI (Python)
- **Agentes de IA**: Agno 1.2.6
- **LLM**: OpenAI GPT
- **Meta API**: facebook-business SDK
- **Database**: SQLAlchemy + asyncpg
- **HTTP Client**: httpx + aiohttp

### Infraestrutura
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Deploy**: Docker + Portainer
- **CI/CD**: Pronto para Railway/Render

## Arquitetura

```
meta/
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/  # Páginas protegidas
│   │   │   │   ├── page.tsx  # Dashboard principal
│   │   │   │   ├── campaigns/
│   │   │   │   ├── analytics/
│   │   │   │   ├── agent/    # Chat com agentes IA
│   │   │   │   ├── alerts/
│   │   │   │   ├── docs/
│   │   │   │   └── settings/
│   │   │   ├── api/          # API Routes
│   │   │   │   ├── campaigns/
│   │   │   │   ├── analytics/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── sync/
│   │   │   │   ├── agent/
│   │   │   │   └── auth/
│   │   │   └── login/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── campaigns/    # Campaign components
│   │   │   └── providers/
│   │   └── lib/
│   │       ├── auth.ts       # NextAuth config
│   │       ├── db.ts         # Prisma client
│   │       └── supabase.ts   # Supabase client
│   └── prisma/
│       └── schema.prisma     # Database schema
│
└── backend/                  # FastAPI Backend
    ├── app/
    │   ├── main.py           # FastAPI app
    │   ├── config.py         # Settings
    │   ├── api/              # Endpoints
    │   │   ├── chat.py       # /agent/chat
    │   │   ├── campaigns.py  # /campaigns
    │   │   └── sync.py       # /sync
    │   ├── agents/           # Agentes IA (Agno)
    │   │   ├── team.py       # Orquestração
    │   │   ├── coordinator.py
    │   │   ├── creator.py
    │   │   ├── analyzer.py
    │   │   ├── optimizer.py
    │   │   └── notifier.py
    │   └── tools/            # Ferramentas
    │       ├── meta_api.py   # Meta Marketing API
    │       ├── database.py   # Supabase/Prisma
    │       └── whatsapp.py   # Evolution API
    └── requirements.txt
```

## Database Schema (Prisma)

### Principais Tabelas

- **users**: Usuários autenticados
- **settings**: Configurações (orçamento, alertas, WhatsApp, Meta API)
- **campaigns**: Campanhas sincronizadas do Meta
- **ad_sets**: Conjuntos de anúncios
- **ads**: Anúncios individuais
- **campaign_metrics**: Métricas diárias (impressões, cliques, gastos, conversões)
- **monthly_summaries**: Resumos mensais de gastos
- **alerts**: Alertas e notificações
- **agent_sessions**: Histórico de conversas com agentes IA

## Instalação

### Pré-requisitos

- Node.js 20+
- Python 3.11+
- PostgreSQL (Supabase recomendado)
- Meta Developer Account (Facebook/Instagram)
- OpenAI API Key

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd meta
```

### 2. Configure Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp env.example.txt .env
```

Edite o `.env` com suas credenciais:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="sua-chave-secreta-gerada"

# OpenAI (Obrigatório para Agentes IA)
OPENAI_API_KEY="sk-..."

# Meta Ads API
META_ACCESS_TOKEN="EAAx..."
META_AD_ACCOUNT_ID="act_123456789"

# Evolution API (WhatsApp - Opcional)
EVOLUTION_API_URL="https://..."
EVOLUTION_API_KEY="..."
EVOLUTION_INSTANCE="..."

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:3000"
```

### 3. Setup do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Gerar Prisma Client
npm run db:generate

# Rodar migrations (se necessário)
npm run db:push

# Seed do banco (opcional - cria dados de exemplo)
npm run db:seed

# Iniciar em desenvolvimento
npm run dev
```

Frontend disponível em: [http://localhost:3000](http://localhost:3000)

### 4. Setup do Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Carregar variáveis de ambiente
source env.config.sh  # ou configure manualmente

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

Backend disponível em: [http://localhost:8000](http://localhost:8000)

API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

## Uso

### Dashboard Principal

O dashboard mostra:
- Orçamento mensal com projeção de gastos
- Métricas em tempo real (gasto hoje, ROAS, impressões, cliques, CTR)
- Gráfico de gastos dos últimos 7 dias
- Top campanhas por performance
- Alertas ativos (budget, performance)

### Gerenciamento de Campanhas

1. **Criar Campanha**: Configure nome, objetivo, budget e status
2. **Editar Campanha**: Atualize configurações em tempo real
3. **Duplicar Campanha**: Clone campanhas de sucesso
4. **Pausar/Ativar**: Controle status das campanhas
5. **Ver Insights**: Métricas detalhadas e gráficos

### Agente de IA

O sistema possui 5 agentes especializados:

1. **Coordenador**: Orquestra o time e delega tarefas
2. **Criador**: Cria campanhas, ad sets e anúncios
3. **Analisador**: Analisa métricas e performance
4. **Otimizador**: Sugere e aplica otimizações
5. **Notificador**: Envia alertas via WhatsApp

Exemplos de uso via chat:

```
"Quero criar uma campanha de vendas para meu e-commerce"
"Como estão as campanhas ativas?"
"Quais campanhas devo pausar?"
"Envia relatório no WhatsApp"
```

### Sincronização com Meta

```bash
# Via Interface
Dashboard → Botão "Sincronizar"

# Via API
POST /api/sync/campaigns  # Sincronizar campanhas
POST /api/sync/metrics    # Sincronizar métricas
POST /api/sync/full       # Sincronização completa
```

### Alertas Automáticos

O sistema gera alertas para:
- Orçamento mensal em 50%, 80% e 100%
- Projeção de estouro de orçamento
- Campanhas com baixo ROAS
- Campanhas com baixo CTR
- Campanhas com CPC acima do limite

## API Endpoints

### Frontend API Routes (Next.js)

```bash
# Dashboard
GET  /api/dashboard

# Campanhas
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/[id]
PATCH  /api/campaigns/[id]
DELETE /api/campaigns/[id]
POST   /api/campaigns/[id]/duplicate
GET    /api/campaigns/[id]/insights

# Analytics
GET /api/analytics

# Sync
POST /api/sync

# Alertas
GET   /api/alerts
PATCH /api/alerts

# Agente
POST /api/agent/chat

# Settings
GET  /api/settings
POST /api/settings

# Upload
POST /api/upload
```

### Backend API (FastAPI)

```bash
# Health Check
GET  /health

# Chat com Agentes
POST /api/agent/chat

# Campanhas
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/{id}
PATCH  /api/campaigns/{id}/status
GET    /api/campaigns/{id}/insights

# Sincronização
POST /api/sync/campaigns
POST /api/sync/metrics
POST /api/sync/full
```

## Deploy

### Frontend (Vercel/Railway/Render)

```bash
# Build
npm run build

# Start
npm start
```

Variáveis de ambiente necessárias:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`

### Backend (Railway/Render/Docker)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Variáveis de ambiente necessárias:
- `OPENAI_API_KEY`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `DATABASE_URL`
- `EVOLUTION_API_URL` (opcional)
- `EVOLUTION_API_KEY` (opcional)
- `FRONTEND_URL`

### Docker Compose (Completo)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Scripts Úteis

### Frontend

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run lint         # Linter
npm run db:generate  # Gerar Prisma Client
npm run db:push      # Push schema para DB
npm run db:migrate   # Criar migration
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed banco
```

### Backend

```bash
# Health check
curl http://localhost:8000/health

# Listar campanhas
curl http://localhost:8000/api/campaigns/

# Chat com agente
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Como estão as campanhas?"}'
```

## Configuração Meta API

### 1. Criar App no Meta Developers

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie um novo App
3. Adicione o produto "Marketing API"
4. Configure permissões: `ads_management`, `ads_read`, `business_management`

### 2. Gerar Access Token

1. Acesse Graph API Explorer
2. Selecione seu App
3. Gere um User Access Token com as permissões necessárias
4. Copie o token para `META_ACCESS_TOKEN`

### 3. Obter Ad Account ID

```bash
cd backend
python get_ad_account_id.py
```

Ou manualmente em: Business Manager → Configurações de Negócios → Contas de Anúncio

## Troubleshooting

### Frontend não conecta ao Backend

- Verifique se o backend está rodando em `http://localhost:8000`
- Confirme `FRONTEND_URL` no `.env` do backend
- Verifique configuração de CORS no `backend/app/main.py`

### Agentes de IA não funcionam

- Verifique se `OPENAI_API_KEY` está configurado
- Confirme que há créditos na conta OpenAI
- Veja logs do backend para erros específicos

### Erro ao sincronizar com Meta

- Confirme `META_ACCESS_TOKEN` e `META_AD_ACCOUNT_ID`
- Verifique permissões do token no Graph API Explorer
- Veja se o token não expirou (tokens de User expiram em ~2 meses)

### Prisma errors

```bash
# Regenerar client
npm run db:generate

# Reset banco (cuidado!)
npx prisma db push --force-reset
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Roadmap

- [ ] Testes automatizados (Jest + Pytest)
- [ ] Modo dark/light theme
- [ ] Suporte a múltiplas contas Meta
- [ ] Relatórios em PDF
- [ ] Webhooks para alertas em tempo real
- [ ] Integração com Google Analytics
- [ ] A/B Testing automatizado
- [ ] Sugestões de criativos com IA
- [ ] Análise de sentimento de comentários
- [ ] Exportação de dados (CSV/Excel)

## Licença

Este projeto é privado. Todos os direitos reservados.

## Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Verifique os logs (`docker-compose logs` ou console do navegador)

---

Feito com ❤️ para otimizar suas campanhas Meta Ads
