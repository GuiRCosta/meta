---
name: ad-campaign-orchestrator
description: Orquestrador central do ecossistema de agentes para campanhas publicitárias. Use como ponto de entrada para: (1) Coordenar múltiplos skills em workflows complexos, (2) Rotear requisições para o skill apropriado, (3) Executar pipelines de criação/otimização completos, (4) Gerenciar estado entre operações. Este skill conhece e coordena todos os outros skills do ecossistema.
---

# Ad Campaign Orchestrator

Orquestrador central que coordena o ecossistema de agentes de campanhas publicitárias do Meta Campaign Manager.

## 📋 Visão Geral

Este skill atua como maestro, coordenando 7 skills especializados para executar workflows complexos de criação, otimização e análise de campanhas Meta Ads.

## 🎯 Skills do Ecossistema

| Skill | Responsabilidade | Quando Usar |
|-------|------------------|-------------|
| `campaign-creator` | Criar novas campanhas | Briefing novo, estruturação inicial |
| `campaign-editor` | Modificar campanhas existentes | Ajustes, otimizações, manutenção |
| `audience-manager` | Gerenciar audiências | Segmentação, remarketing, lookalike |
| `creative-manager` | Gerenciar criativos | Textos, imagens, vídeos, testes A/B |
| `budget-optimizer` | Otimizar orçamentos | Alocação, lances, simulações |
| `performance-analyzer` | Analisar performance | Diagnósticos, insights, anomalias |
| `report-generator` | Gerar relatórios | Reporting periódico, dashboards |

## 🔀 Roteamento Inteligente

O orquestrador identifica qual skill usar baseado em palavras-chave:

### Palavras-Chave → Skill

```yaml
campaign-creator:
  - "criar campanha"
  - "nova campanha"
  - "estruturar campanha"
  - "montar campanha"
  
campaign-editor:
  - "editar campanha"
  - "modificar"
  - "atualizar"
  - "pausar"
  - "ativar"
  - "duplicar"
  
audience-manager:
  - "público"
  - "audiência"
  - "segmentação"
  - "remarketing"
  - "lookalike"
  - "custom audience"
  
creative-manager:
  - "anúncio"
  - "texto"
  - "copy"
  - "criativo"
  - "headline"
  - "imagem"
  - "vídeo"
  
budget-optimizer:
  - "orçamento"
  - "budget"
  - "lance"
  - "bid"
  - "CPA alvo"
  - "ROAS"
  - "alocação"
  
performance-analyzer:
  - "analisar"
  - "performance"
  - "diagnóstico"
  - "problema"
  - "por que"
  - "caiu"
  - "piorou"
  
report-generator:
  - "relatório"
  - "report"
  - "dashboard"
  - "exportar"
  - "enviar"
```

## 🔄 Workflows Pré-Configurados

### 1. Workflow: Criar Campanha Completa

**Trigger**: "Criar campanha para [produto]"

**Passos**:
1. **campaign-creator**: Validar briefing e definir estrutura
2. **audience-manager**: Criar audiências necessárias
3. **creative-manager**: Gerar textos de anúncios
4. **budget-optimizer**: Calcular CPA/ROAS alvo
5. **campaign-creator**: Consolidar e validar campanha final

**Output**: Campanha pronta para publicação

### 2. Workflow: Otimização Semanal

**Trigger**: "Otimizar campanhas"

**Passos**:
1. **performance-analyzer**: Coletar métricas e identificar problemas
2. **budget-optimizer**: Analisar alocação e recomendar realocações
3. **creative-manager**: Identificar ads com baixo CTR
4. **campaign-editor**: Aplicar otimizações
5. **report-generator**: Gerar relatório semanal

**Output**: Campanhas otimizadas + relatório

### 3. Workflow: Diagnóstico de Problema

**Trigger**: "Por que o [métrica] [piorou/melhorou]?"

**Passos**:
1. **performance-analyzer**: Analisar tendência e identificar causas
2. **Roteamento condicional**:
   - Se CTR baixo → **creative-manager**
   - Se CVR baixo → **audience-manager**
   - Se CPC alto → **budget-optimizer**
3. **campaign-editor**: Aplicar correções

**Output**: Problema diagnosticado e corrigido

### 4. Workflow: Reporting Automatizado

**Trigger**: Agenda (diário/semanal/mensal)

**Passos**:
1. **performance-analyzer**: Coletar dados e calcular métricas
2. **performance-analyzer**: Gerar insights
3. **report-generator**: Popular template e exportar
4. **report-generator**: Enviar para destinatários

**Output**: Relatório gerado e enviado

## 🎬 Comandos de Alto Nível

| Comando | Workflow Ativado |
|---------|------------------|
| "Criar campanha para [produto]" | Criar Campanha Completa |
| "Otimizar campanhas" | Otimização Semanal |
| "Por que [métrica] [piorou/melhorou]?" | Diagnóstico de Problema |
| "Gerar relatório [período]" | Reporting Automatizado |
| "Escalar campanha [id]" | Escalar + Budget Optimizer |
| "Pausar tudo exceto [ids]" | Campaign Editor (batch) |

## 💾 Contexto e Estado

### Informações Persistentes

```yaml
contexto_conta:
  plataformas_ativas: [meta_ads]
  moeda: BRL
  timezone: America/Sao_Paulo
  meta_pixel_id: null
  conversion_actions: []
  
contexto_campanha:
  campanha_atual_id: null
  ultima_acao: null
  historico_mudancas: []
  
contexto_metas:
  cpa_target: 50.00
  roas_target: 3.0
  budget_mensal: 5000
```

### Passagem de Contexto Entre Skills

```json
{
  "workflow_id": "wf_001",
  "current_step": 2,
  "context": {
    "campaign_id": "123456",
    "platform": "meta_ads",
    "objective": "OUTCOME_SALES"
  },
  "artifacts": {
    "step_1": {"file": "structure.json", "skill": "campaign-creator"},
    "step_2": {"file": "audiences.json", "skill": "audience-manager"}
  },
  "next_skill": "creative-manager"
}
```

## 🔧 Integração com Backend

### APIs Disponíveis

```python
# Meta Ads API
from backend.app.tools.meta_api import MetaAPI
meta = MetaAPI()
campaigns = meta.list_campaigns()
insights = meta.get_insights(campaign_id)

# Database
from backend.app.tools.database import DatabaseTool
db = DatabaseTool()
campaigns = db.get_campaigns()
metrics = db.get_metrics(campaign_id)

# WhatsApp (Evolution API)
from backend.app.tools.whatsapp import WhatsAppTool
whatsapp = WhatsAppTool()
whatsapp.send_message(number, message)
```

## ✅ Boas Práticas

1. **Sempre validar antes de executar** - Rodar validações do skill específico
2. **Logging de ações** - Manter histórico de todas as operações
3. **Rollback disponível** - Guardar estado anterior antes de mudanças
4. **Confirmação para ações críticas** - Deletar, pausar em lote, mudanças de budget >30%
5. **Rate limiting** - Respeitar limites de API do Meta

## 📊 Exemplos de Uso

### Exemplo 1: Criar Campanha Completa

```
User: "Quero criar uma campanha de vendas para meu e-commerce de roupas"

Orchestrator:
  Step 1 [campaign-creator]: Validando briefing...
  Step 2 [audience-manager]: Criando audiência de remarketing...
  Step 3 [creative-manager]: Gerando textos de anúncios...
  Step 4 [budget-optimizer]: Calculando CPA alvo de R$ 45...
  Step 5 [campaign-creator]: Campanha criada com sucesso!
  
Output: Campanha "E-commerce Roupas - Janeiro 2026" pronta
```

### Exemplo 2: Diagnóstico

```
User: "Por que o CPA subiu 30% essa semana?"

Orchestrator:
  Step 1 [performance-analyzer]: Analisando tendência de CPA...
  
  Causa identificada: CTR caiu de 2.5% para 1.8%
  
  Step 2 [creative-manager]: Revisando criativos...
  Recomendação: Testar novos headlines e CTAs
  
  Step 3 [campaign-editor]: Aplicando novos criativos...
  
Output: 3 novos anúncios criados e ativados
```

## 🚀 Comandos Disponíveis

Execute o orquestrador via chat do agente:

```bash
# Via Frontend
http://localhost:3000/agent

# Exemplos de comandos
"Criar campanha de vendas"
"Otimizar todas as campanhas ativas"
"Por que o ROAS caiu?"
"Gerar relatório semanal"
"Pausar campanhas com CPA > R$ 60"
```

## 📁 Estrutura de Arquivos

```
skills/
├── ad-campaign-orchestrator/
│   ├── SKILL.md (este arquivo)
│   └── scripts/
│       ├── route_request.py
│       ├── execute_workflow.py
│       ├── manage_context.py
│       └── validate_workflow.py
│
├── campaign-creator/
├── campaign-editor/
├── audience-manager/
├── creative-manager/
├── budget-optimizer/
├── performance-analyzer/
└── report-generator/
```

---

**Nota**: Este skill funciona em conjunto com o backend FastAPI (`backend/app/agents/`) que implementa os agentes Agno reais.
