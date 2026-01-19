# 🚀 Agente Meta Campanhas

Sistema inteligente de gerenciamento de campanhas publicitárias do Meta (Facebook/Instagram) utilizando agentes de IA para criação, análise e otimização automática.

## ✨ Funcionalidades

### 🎯 Criação Inteligente de Campanhas
- Criação automatizada via agentes de IA
- Sugestões de público-alvo baseadas em dados
- Otimização de orçamento e lances
- Templates de campanhas personalizados
- Upload de mídia (imagens/vídeos) para anúncios

### 📊 Análise e Monitoramento
- Dashboard com métricas em tempo real
- Análise de performance (ROAS, CPC, CTR, etc.)
- Alertas automáticos de anomalias
- Comparativos históricos
- Projeções de resultados e tendências

### 💰 Controle de Gastos e Orçamento
- **Limite de Gastos Mensal**: Definir teto máximo de investimento
- **Alertas de Orçamento**: Notificação quando atingir 50%, 80% e 100% do limite
- **Projeção de Gastos**: Estimativa de gasto até fim do mês baseada na tendência atual
- **Gasto por Campanha**: Acompanhamento individual de cada campanha
- **Histórico de Gastos**: Comparativo mensal e anual

### 📈 Projeções e Previsões
- **Projeção de Resultados**: Estimativa de conversões, cliques e impressões
- **Tendência de Performance**: Análise de melhora ou piora das métricas
- **Previsão de ROAS**: Estimativa de retorno baseada em dados históricos
- **Alerta de Tendência Negativa**: Notificação quando métricas estão em queda
- **Cenários de Orçamento**: Simulação de resultados com diferentes investimentos

### 🤖 Agentes Inteligentes
- **Agente Coordenador**: Orquestra todos os agentes
- **Agente Criador**: Cria campanhas automaticamente
- **Agente Analisador**: Monitora e analisa performance
- **Agente Otimizador**: Ajusta campanhas automaticamente
- **Agente Notificador**: Envia notificações via WhatsApp

### 📱 Notificações via WhatsApp (Evolution API)
- **Relatórios Diários**: Envio automático de relatórios de performance via WhatsApp
- **Alertas de Problemas**: Notificações imediatas sobre campanhas com problemas
- **Sugestões de Otimização**: Recomendações proativas baseadas em análise de dados
- **Status de Campanhas**: Avisos sobre mudanças de status, pausas e reativações
- **Métricas Importantes**: Destaques de KPIs importantes do dia

### 🔐 Autenticação
- Login seguro com NextAuth.js
- Sessão persistente
- Proteção de rotas
- Autenticação via banco de dados (Supabase)

## 🛠️ Tecnologias

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Autenticação**: NextAuth.js v5
- **Banco de Dados**: Supabase (PostgreSQL) + Prisma 6.19.2
- **Gráficos**: Recharts
- **Ícones**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Agentes**: Agno Framework (multiagente)
- **LLM**: OpenAI (GPT-4o) - suporta 23+ provedores
- **Database**: PostgreSQL via Supabase
- **HTTP Client**: httpx, aiohttp

### Integrações
- **Meta API**: Facebook Marketing API
- **WhatsApp**: Evolution API (notificações automáticas)
- **Storage**: Supabase Storage (mídias)

### Deploy
- **Containerização**: Docker + Docker Compose
- **Orquestração**: Portainer (VPS)
- **Banco de Dados**: Supabase (cloud)

## 📋 Pré-requisitos

### 1. Conta Meta Business
- [ ] Criar conta no [Meta Business](https://business.facebook.com)
- [ ] Criar um App no [Meta for Developers](https://developers.facebook.com)
- [ ] Obter App ID e App Secret
- [ ] Configurar permissões:
  - `ads_management`
  - `ads_read`
  - `business_management`
- [ ] Obter Access Token de longa duração
- [ ] Obter Ad Account ID

### 2. LLM Provider (para agentes Agno)
- [ ] Criar conta na [OpenAI](https://platform.openai.com) ou [Anthropic](https://anthropic.com) ou [Google AI](https://ai.google.dev)
- [ ] Obter API Key
- [ ] Agno suporta 23+ provedores - escolha o que preferir

### 3. Banco de Dados (Supabase)
- [ ] Criar conta no [Supabase](https://supabase.com)
- [ ] Criar novo projeto
- [ ] Copiar as credenciais:
  - URL do projeto (`NEXT_PUBLIC_SUPABASE_URL`)
  - Chave anônima (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Connection string (`DATABASE_URL`)

### 4. Evolution API (WhatsApp) - Opcional
- [ ] Instalar e configurar Evolution API (self-hosted ou usar serviço)
- [ ] Obter API Key da Evolution API
- [ ] Conectar número de WhatsApp para receber notificações
- [ ] Configurar webhook (opcional, para receber mensagens de volta)

### 5. VPS com Docker/Portainer - Para Deploy
- [ ] VPS com Docker instalado
- [ ] Portainer configurado
- [ ] Domínio configurado (opcional, para SSL)

## 🚀 Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd agente-meta-campanhas
```

### 2. Configure as variáveis de ambiente

Copie o arquivo `env.example.txt` para `frontend/.env.local`:

```bash
cp env.example.txt frontend/.env.local
```

Preencha as variáveis em `frontend/.env.local`:

```env
# ==========================================
# SUPABASE (Obrigatório)
# ==========================================
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# ==========================================
# NEXTAUTH (Obrigatório)
# ==========================================
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="sua-chave-secreta-gerada-com-openssl-rand-base64-32"

# ==========================================
# OPENAI (Obrigatório para Agentes IA)
# ==========================================
OPENAI_API_KEY="sk-..."

# ==========================================
# META API (Opcional - para integração real)
# ==========================================
META_ACCESS_TOKEN="EAAx..."
META_AD_ACCOUNT_ID="act_123456789"

# ==========================================
# EVOLUTION API - WHATSAPP (Opcional)
# ==========================================
EVOLUTION_API_URL="https://sua-evolution-api.com"
EVOLUTION_API_KEY="sua-api-key"
EVOLUTION_INSTANCE="nome-da-instancia"

# ==========================================
# BACKEND PYTHON (Opcional - para rodar local)
# ==========================================
AGNO_API_URL="http://localhost:8000"
```

### 3. Configure o banco de dados (Supabase)

```bash
cd frontend

# Instalar dependências
npm install

# Gerar cliente Prisma
npm run db:generate

# Enviar schema para o Supabase
npm run db:push

# Popular banco com dados de exemplo (usuário admin)
npm run db:seed

# (Opcional) Abrir Prisma Studio para ver os dados
npm run db:studio
```

> ⚠️ **Importante**: Use `db:push` para desenvolvimento. Para produção, use migrações com `db:migrate`.

**Credenciais padrão após seed:**
- Email: `admin@metacampaigns.com`
- Senha: `admin123`

### 4. Execute o frontend

```bash
cd frontend
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 5. Execute o backend (Opcional - para agentes IA)

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em [http://localhost:8000](http://localhost:8000)

## 📦 Variáveis de Ambiente Necessárias

### Obrigatórias (para funcionar)
- `DATABASE_URL` - URL de conexão pooled (com pgbouncer)
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `NEXTAUTH_URL` - URL da aplicação
- `AUTH_SECRET` - Secret para JWT (gerar com: `openssl rand -base64 32`)

### Para Agentes IA (recomendado)
- `OPENAI_API_KEY` - API Key da OpenAI

### Para Integração Meta (opcional)
- `META_ACCESS_TOKEN` - Token de acesso de longa duração
- `META_AD_ACCOUNT_ID` - ID da conta de anúncios (formato: act_123456789)

### Para WhatsApp (opcional)
- `EVOLUTION_API_URL` - URL da instância Evolution API
- `EVOLUTION_API_KEY` - API Key da Evolution API
- `EVOLUTION_INSTANCE` - Nome da instância

## 📁 Estrutura de Pastas

```
agente-meta-campanhas/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # App Router (Next.js 16+)
│   │   │   ├── (dashboard)/     # Páginas protegidas
│   │   │   │   ├── page.tsx     # Dashboard principal
│   │   │   │   ├── campaigns/   # Gestão de campanhas
│   │   │   │   ├── analytics/   # Analytics e métricas
│   │   │   │   ├── alerts/      # Histórico de alertas
│   │   │   │   ├── agent/       # Chat com agente IA
│   │   │   │   ├── settings/    # Configurações
│   │   │   │   └── docs/        # Documentação
│   │   │   ├── api/             # API Routes (Next.js)
│   │   │   │   ├── auth/        # NextAuth
│   │   │   │   ├── campaigns/   # CRUD campanhas
│   │   │   │   ├── alerts/      # Alertas
│   │   │   │   ├── settings/    # Configurações
│   │   │   │   ├── upload/      # Upload de mídia
│   │   │   │   └── agent/       # Proxy para backend Python
│   │   │   └── login/           # Página de login
│   │   ├── components/          # Componentes React
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   └── campaigns/        # Componentes específicos
│   │   ├── lib/                 # Utilitários
│   │   │   ├── auth.ts          # NextAuth config
│   │   │   ├── db.ts            # Prisma Client
│   │   │   ├── supabase.ts      # Supabase Client
│   │   │   └── utils.ts         # Funções auxiliares
│   │   └── types/               # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco
│   │   └── seed.ts              # Seed de dados
│   ├── Dockerfile               # Docker para produção
│   └── package.json
│
├── backend/                      # Python Backend (FastAPI + Agno)
│   ├── app/
│   │   ├── agents/               # Agentes de IA
│   │   │   ├── coordinator.py   # Agente Coordenador
│   │   │   ├── creator.py        # Agente Criador
│   │   │   ├── analyzer.py      # Agente Analisador
│   │   │   ├── optimizer.py     # Agente Otimizador
│   │   │   ├── notifier.py      # Agente Notificador
│   │   │   ├── prompts.py       # Prompts dos agentes
│   │   │   └── team.py          # Time de agentes
│   │   ├── api/                 # Endpoints FastAPI
│   │   │   ├── chat.py          # Chat com agentes
│   │   │   ├── campaigns.py     # CRUD campanhas
│   │   │   └── sync.py          # Sincronização Meta
│   │   ├── tools/               # Ferramentas dos agentes
│   │   │   ├── meta_api.py     # Meta Marketing API
│   │   │   ├── database.py     # Queries no banco
│   │   │   └── whatsapp.py     # Evolution API
│   │   ├── config.py            # Configurações
│   │   └── main.py              # FastAPI app
│   ├── Dockerfile               # Docker para produção
│   └── requirements.txt
│
├── docker-compose.yml           # Orquestração Docker
├── env.example.txt              # Template de variáveis
└── README.md                    # Este arquivo
```

## 🚢 Deploy via Docker/Portainer

### 1. Preparar Repositório Git

```bash
# Inicializar Git (se ainda não tiver)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit - Meta Campaign Manager"

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/meta-campaigns.git

# Push
git push -u origin main
```

### 2. No Portainer - Criar Stack

1. **Acesse o Portainer** (geralmente em `https://sua-vps:9443`)

2. **Vá em**: Stacks → **Add stack**

3. **Configure**:
   - **Name**: `meta-campaigns`
   - **Build method**: Selecione **"Repository"**

4. **Repository Configuration**:
   | Campo | Valor |
   |-------|-------|
   | **Repository URL** | `https://github.com/SEU-USUARIO/meta-campaigns.git` |
   | **Repository reference** | `refs/heads/main` |
   | **Compose path** | `docker-compose.yml` |

5. **Autenticação** (se repositório privado):
   - Marque **"Authentication"**
   - **Username**: seu usuário GitHub
   - **Personal Access Token**: [Gere um token](https://github.com/settings/tokens) com permissão `repo`

### 3. Configurar Environment Variables

Na seção **"Environment variables"**, adicione cada variável:

```
DATABASE_URL=postgresql://postgres.xxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=https://seu-dominio.com
OPENAI_API_KEY=sk-...
META_ACCESS_TOKEN=EAAx...
META_AD_ACCOUNT_ID=act_123456789
EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua-key
EVOLUTION_INSTANCE=nome-instancia
FRONTEND_URL=https://seu-dominio.com
```

### 4. Deploy

1. Clique em **"Deploy the stack"**
2. Aguarde o build (pode levar 3-5 minutos na primeira vez)
3. Os containers vão aparecer como **"running"** quando prontos

### 5. Verificar

Após o deploy:

```bash
# Na VPS, verificar containers
docker ps

# Ver logs do frontend
docker logs -f meta-campaigns-frontend

# Ver logs do backend  
docker logs -f meta-campaigns-backend

# Testar health checks
curl http://localhost:3000/api/health
curl http://localhost:8000/health
```

### 6. Atualizar após mudanças

Quando você fizer push de novas alterações no Git:

1. No Portainer, vá em **Stacks** → **meta-campaigns**
2. Clique em **"Pull and redeploy"** (ou "Update the stack")
3. O Portainer vai:
   - Puxar as mudanças do Git
   - Rebuild das imagens
   - Reiniciar os containers

## 🔧 Configuração do Meta API

### Passo a passo:

1. **Criar App no Meta for Developers**
   - Acesse: https://developers.facebook.com/apps
   - Clique em "Criar App"
   - Escolha tipo "Negócio"
   - Preencha informações básicas

2. **Adicionar Marketing API**
   - No painel do app, vá em "Adicionar Produto"
   - Procure "Marketing API" e adicione

3. **Configurar Permissões**
   - Vá em "Configurações" > "Permissões e Recursos"
   - Solicite permissões:
     - `ads_management`
     - `ads_read`
     - `business_management`
   - Para cada permissão, submeta para revisão (necessário em produção)

4. **Obter Access Token**
   - Vá em "Ferramentas" > "Graph API Explorer"
   - Selecione seu app
   - Gere um token de curta duração
   - Use a Meta API para converter para token de longa duração (60 dias)

5. **Obter Ad Account ID**
   - Acesse: https://business.facebook.com/settings/ad-accounts
   - Copie o ID da conta (formato: act_123456789)

## 📱 Configuração do Evolution API (WhatsApp)

### Passo a passo:

1. **Instalar Evolution API**
   - Opção A: Self-hosted (Docker recomendado)
     - Clone o repositório: https://github.com/EvolutionAPI/evolution-api
     - Siga a documentação de instalação
     - Configure banco de dados (MongoDB ou PostgreSQL)
   - Opção B: Usar serviço hospedado
     - Contrate serviço Evolution API
     - Obtenha URL e API Key

2. **Criar Instância**
   - Acesse a API da Evolution API
   - Crie uma nova instância do WhatsApp
   - Escaneie o QR Code com seu WhatsApp Business
   - Aguarde a conexão ser estabelecida

3. **Obter Credenciais**
   - `EVOLUTION_API_URL`: URL da sua instalação (ex: https://api.evolution.com)
   - `EVOLUTION_API_KEY`: API Key gerada na Evolution API
   - `EVOLUTION_INSTANCE`: Nome da instância criada

## 🤖 Arquitetura de Agentes (Agno Framework)

O sistema utiliza o **Agno**, um framework multiagente full-stack que oferece:
- Arquitetura de agentes multinível (5 níveis de sofisticação)
- Gerenciamento avançado de contexto e memória
- Interface agnóstica de modelos (23+ provedores: OpenAI, Anthropic, Google, etc.)
- Orquestração multiagente (Coordenador, Router, Colaborador)
- Runtime pronto para produção (FastAPI)

### Estrutura de Agentes

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTE COORDENADOR                       │
│              (Orquestra todos os agentes)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│  CRIADOR  │  │ ANALISADOR│  │OTIMIZADOR │  │NOTIFICADOR│
│           │  │           │  │           │  │           │
│ - Cria    │  │ - Monitora│  │ - Ajusta  │  │ - Envia   │
│   campanha│  │   métricas│  │   lances  │  │   WhatsApp│
│ - Define  │  │ - Detecta │  │ - Pausa   │  │ - Relatório│
│   público │  │   anomalia│  │   campanha│  │   diário  │
│ - Sugere  │  │ - Projeta │  │ - Sugere  │  │ - Alertas │
│   orçament│  │   resultad│  │   ações   │  │ - Projeções│
└───────────┘  └───────────┘  └───────────┘  └───────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             ▼
                    ┌─────────────────┐
                    │  FERRAMENTAS    │
                    │                 │
                    │ • Meta API      │
                    │ • Evolution API │
                    │ • Database      │
                    │ • Analytics     │
                    └─────────────────┘
```

### Detalhamento dos Agentes

#### 1. Agente Coordenador (Orquestrador)
- **Função**: Delega tarefas para os agentes especialistas
- **Modo**: Coordenador hierárquico
- **Responsabilidades**:
  - Receber comandos do usuário
  - Rotear para o agente apropriado
  - Gerenciar fluxo de trabalho
  - Consolidar respostas

#### 2. Agente Criador (Campaign Creator)
- **Função**: Cria campanhas no Meta
- **Ferramentas**: `create_campaign`, `create_adset`, `create_ad`, `suggest_audience`, `estimate_budget`
- **Entrada**: Objetivo, público-alvo, orçamento, criativos
- **Saída**: Campanha completa (Campaign > Ad Set > Ad)

#### 3. Agente Analisador (Performance Analyzer)
- **Função**: Monitora e analisa performance
- **Ferramentas**: `get_campaign_metrics`, `compare_periods`, `detect_anomalies`, `project_results`, `analyze_trends`
- **Entrada**: Campanha ID, período de análise
- **Saída**: Relatório de performance, alertas, projeções

#### 4. Agente Otimizador (Campaign Optimizer)
- **Função**: Otimiza campanhas automaticamente
- **Ferramentas**: `adjust_budget`, `adjust_bid`, `pause_campaign`, `activate_campaign`, `suggest_optimization`
- **Entrada**: Métricas atuais, limites configurados
- **Saída**: Ações de otimização, sugestões

#### 5. Agente Notificador (WhatsApp Notifier)
- **Função**: Envia notificações via WhatsApp
- **Ferramentas**: `send_whatsapp`, `format_daily_report`, `format_alert`, `format_suggestion`, `check_budget_limit`
- **Entrada**: Dados de campanhas, eventos
- **Saída**: Mensagens formatadas no WhatsApp

## 📝 Scripts Disponíveis

### Frontend
```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:generate  # Gera cliente Prisma
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre Prisma Studio
npm run db:push      # Push schema para banco
npm run db:seed      # Popula banco com dados iniciais

# Lint
npm run lint         # Executa ESLint
```

### Backend
```bash
# Desenvolvimento
uvicorn app.main:app --reload --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🐛 Troubleshooting

### Erro de autenticação Meta API
- Verificar se token não expirou
- Verificar permissões do app
- Verificar se Ad Account ID está correto

### Erro de conexão com banco
- Verificar `DATABASE_URL`
- Verificar se banco está acessível
- Executar `npm run db:generate` novamente
- Verificar se Prisma está na versão 6.19.2 (não 7)

### Erro de envio WhatsApp
- Verificar se Evolution API está rodando
- Verificar `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`
- Verificar se instância do WhatsApp está conectada
- Verificar formato do número: deve incluir @c.us
- Verificar logs da Evolution API

### Build falha no Docker
- Verificar se todas variáveis de ambiente estão configuradas
- Verificar logs de build no Portainer
- Testar build local: `docker-compose build`

### Prisma Client não encontrado
```bash
cd frontend
npm run db:generate
```

## 📚 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://www.prisma.io/docs)
- [Agno Framework](https://docs.agno.com) - Framework multiagente
- [shadcn/ui](https://ui.shadcn.com)
- [Evolution API](https://evolution-api.com) - WhatsApp API
- [Docker](https://docs.docker.com/)
- [Portainer](https://docs.portainer.io/)

## 📝 Licença

MIT

## 👤 Autor

Seu Nome

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas!

---

**Nota**: Este projeto utiliza as APIs oficiais do Meta. Certifique-se de seguir os [Termos de Serviço](https://www.facebook.com/policies/) e [Políticas de Publicidade](https://www.facebook.com/policies/ads/) do Meta.
