# 🤖 Meta Campaign Manager - Backend

Backend Python com FastAPI e Agno para gerenciamento inteligente de campanhas Meta Ads.

## 🏗️ Arquitetura

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configurações
│   ├── api/
│   │   ├── chat.py          # Endpoint /agent/chat
│   │   ├── campaigns.py     # Endpoints /campaigns
│   │   └── sync.py          # Endpoints /sync
│   ├── agents/
│   │   ├── team.py          # Time coordenado
│   │   ├── coordinator.py   # Agente Coordenador
│   │   ├── creator.py       # Agente Criador
│   │   ├── analyzer.py      # Agente Analisador
│   │   ├── optimizer.py     # Agente Otimizador
│   │   └── notifier.py      # Agente Notificador
│   └── tools/
│       ├── meta_api.py      # Meta Marketing API
│       ├── database.py      # Supabase/Prisma
│       └── whatsapp.py      # Evolution API
├── requirements.txt
└── README.md
```

## 🤖 Agentes

| Agente | Função | Tools |
|--------|--------|-------|
| **Coordenador** | Orquestra o time e delega tarefas | - |
| **Criador** | Cria campanhas, ad sets, ads | create_campaign, list_campaigns |
| **Analisador** | Analisa métricas e performance | get_metrics, compare_campaigns |
| **Otimizador** | Sugere e aplica otimizações | pause_campaign, identify_winners |
| **Notificador** | Envia alertas via WhatsApp | send_message, send_report |

## 🚀 Instalação

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar servidor
python -m app.main
# ou: uvicorn app.main:app --reload
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```bash
# OpenAI (obrigatório)
OPENAI_API_KEY=sk-...

# Meta Ads (obrigatório para campanhas reais)
META_ACCESS_TOKEN=EAAx...
META_AD_ACCOUNT_ID=act_123456789

# Evolution API (opcional, para WhatsApp)
EVOLUTION_API_URL=https://...
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE=...

# Database (Supabase)
DATABASE_URL=postgresql://...
```

## 📡 API Endpoints

### Chat com Agentes

```bash
# Enviar mensagem
POST /api/agent/chat
{
  "message": "Quero criar uma campanha de vendas",
  "session_id": "optional"
}

# Resposta
{
  "success": true,
  "response": "🚀 Vou te ajudar a criar uma campanha...",
  "agent_used": "Criador"
}
```

### Campanhas

```bash
# Listar campanhas
GET /api/campaigns?status=ACTIVE&limit=10

# Detalhes da campanha
GET /api/campaigns/{id}

# Criar campanha
POST /api/campaigns
{
  "name": "Vendas_Produto_Janeiro2026",
  "objective": "OUTCOME_SALES",
  "status": "PAUSED",
  "daily_budget": 5000  # R$ 50,00 em centavos
}

# Atualizar status
PATCH /api/campaigns/{id}/status
{
  "status": "ACTIVE"
}

# Métricas
GET /api/campaigns/{id}/insights?date_preset=last_7d
```

### Sincronização

```bash
# Sincronizar campanhas do Meta
POST /api/sync/campaigns

# Sincronizar métricas
POST /api/sync/metrics?date_preset=last_7d

# Sincronização completa
POST /api/sync/full
```

## 💬 Exemplos de Uso

### Via Chat Natural

```
Usuário: "Quero criar uma campanha de vendas para meu e-commerce"
Criador: "🚀 Vou te ajudar! Preciso de algumas informações..."

Usuário: "Como estão as campanhas ativas?"
Analisador: "📊 Encontrei 5 campanhas ativas..."

Usuário: "Quais campanhas devo pausar?"
Otimizador: "⚠️ 2 campanhas com baixa performance..."

Usuário: "Envia relatório no WhatsApp"
Notificador: "✅ Relatório enviado para +5511..."
```

## 🔧 Desenvolvimento

```bash
# Rodar com reload automático
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ver docs da API
# http://localhost:8000/docs (Swagger)
# http://localhost:8000/redoc (ReDoc)
```

## 📦 Deploy

### Railway/Render

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variáveis de Ambiente no Deploy

Configure todas as variáveis do `.env` nas configurações do serviço de hospedagem.
