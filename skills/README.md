# Skills - Ad Campaign Management

Sistema de skills especializadas para gerenciamento de campanhas publicitárias.

## 📋 Visão Geral

Este diretório contém 8 skills especializadas que trabalham em conjunto para criar, otimizar e analisar campanhas publicitárias em múltiplas plataformas (Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads).

## 🎯 Arquitetura

```
skills/
├── ad-campaign-orchestrator/     # Skill central de orquestração
├── campaign-creator/             # Criação de campanhas
├── campaign-editor/              # Edição de campanhas existentes
├── audience-manager/             # Gerenciamento de audiências
├── creative-manager/             # Gerenciamento de criativos
├── budget-optimizer/             # Otimização de orçamentos
├── performance-analyzer/         # Análise de performance
└── report-generator/             # Geração de relatórios
```

## 🔧 Skills Disponíveis

### 1. Ad Campaign Orchestrator
**Arquivo:** [ad-campaign-orchestrator/SKILL.md](./ad-campaign-orchestrator/SKILL.md)

Skill central que coordena todos os outros skills. Use como ponto de entrada para:
- Rotear requisições para o skill apropriado
- Executar workflows complexos multi-step
- Gerenciar estado entre operações
- Coordenar múltiplos skills em pipelines

**Quando usar:**
```
"Criar campanha completa para produto X"
"Otimizar todas as campanhas"
"Por que o CPA aumentou?"
"Gerar relatório mensal"
```

---

### 2. Campaign Creator
**Arquivo:** [campaign-creator/SKILL.md](./campaign-creator/SKILL.md)

Criação estruturada de novas campanhas do zero.

**Quando usar:**
- Criar nova campanha baseada em briefing
- Configurar estrutura inicial
- Definir objetivos e settings
- Gerar payloads para APIs

**Plataformas suportadas:** Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads

---

### 3. Campaign Editor
**Arquivo:** [campaign-editor/SKILL.md](./campaign-editor/SKILL.md)

Edição segura de campanhas existentes.

**Quando usar:**
- Modificar configurações de campanhas ativas
- Atualizar textos, criativos ou targeting
- Ajustar orçamentos e lances
- Pausar/ativar elementos
- Duplicar campanhas com modificações

**Principais operações:**
- Edição simples (campos individuais)
- Edição em lote (múltiplos elementos)
- Duplicação com modificações
- Rollback de mudanças

---

### 4. Audience Manager
**Arquivo:** [audience-manager/SKILL.md](./audience-manager/SKILL.md)

Gerenciamento de audiências e segmentação.

**Quando usar:**
- Criar públicos customizados ou lookalike
- Definir segmentação demográfica/comportamental
- Configurar remarketing
- Importar/exportar listas de clientes
- Analisar sobreposição de audiências

**Tipos de audiência:**
- Custom Audiences (Website, CRM, Engagement)
- Lookalike Audiences
- Saved/Detailed Audiences
- Customer Match

---

### 5. Creative Manager
**Arquivo:** [creative-manager/SKILL.md](./creative-manager/SKILL.md)

Gerenciamento de criativos publicitários.

**Quando usar:**
- Criar textos de anúncios otimizados
- Gerar variações de copy
- Especificar requisitos de imagem/vídeo
- Validar criativos contra políticas
- Criar testes A/B

**Componentes:**
- Headlines, descrições, CTAs
- Especificações de imagem/vídeo
- Templates de copywriting (AIDA, PAS)
- Validação de políticas

---

### 6. Budget Optimizer
**Arquivo:** [budget-optimizer/SKILL.md](./budget-optimizer/SKILL.md)

Otimização de orçamentos e estratégias de lance.

**Quando usar:**
- Recomendar distribuição de budget
- Sugerir estratégias de lance
- Calcular CPA/ROAS alvo
- Ajustar orçamentos baseado em performance
- Simular cenários de investimento

**Cálculos principais:**
- Budget mínimo recomendado
- Distribuição por funil
- CPA/ROAS alvo
- Pacing de gastos

---

### 7. Performance Analyzer
**Arquivo:** [performance-analyzer/SKILL.md](./performance-analyzer/SKILL.md)

Análise profunda de performance com diagnósticos.

**Quando usar:**
- Analisar métricas de campanhas
- Identificar problemas de performance
- Comparar períodos ou campanhas
- Detectar anomalias
- Priorizar ações de otimização

**Framework de análise:**
- Hierarquia de diagnóstico (Volume → Qualidade → Conversão → Valor → Tendência)
- Diagnósticos comuns (baixo CTR, CVR, ROAS)
- Detecção de anomalias
- Matriz de priorização

---

### 8. Report Generator
**Arquivo:** [report-generator/SKILL.md](./report-generator/SKILL.md)

Geração automatizada de relatórios.

**Quando usar:**
- Criar relatórios periódicos (diário, semanal, mensal)
- Gerar dashboards executivos
- Exportar dados em diferentes formatos
- Automatizar envio de relatórios

**Tipos de relatório:**
- Executivo (1 página)
- Operacional (detalhado)
- Cliente (foco em resultados)

**Formatos:** PDF, Excel, Google Sheets, PowerPoint, HTML, JSON

---

## 🔄 Workflows Integrados

### Workflow 1: Criar Campanha Completa
```
1. campaign-creator → Validar briefing e criar estrutura
2. audience-manager → Criar audiências necessárias
3. creative-manager → Gerar textos e especificar criativos
4. budget-optimizer → Calcular alvos e recomendar budget
5. campaign-creator → Consolidar e validar
```

### Workflow 2: Otimização Semanal
```
1. performance-analyzer → Coletar métricas e diagnosticar
2. budget-optimizer → Recomendar realocações
3. creative-manager → Sugerir novos criativos
4. campaign-editor → Aplicar otimizações
5. report-generator → Gerar relatório
```

### Workflow 3: Diagnóstico de Problema
```
1. performance-analyzer → Identificar causa raiz
2. [Skill específico baseado na causa] → Propor correção
3. campaign-editor → Aplicar correções
```

### Workflow 4: Reporting Automatizado
```
1. performance-analyzer → Coletar dados e insights
2. report-generator → Gerar e enviar relatório
```

---

## 🚀 Como Usar

### Via Orquestrador (Recomendado)
```
"Criar campanha para produto X com orçamento Y"
→ ad-campaign-orchestrator roteia para workflows apropriados
```

### Diretamente (Avançado)
```
"@campaign-creator Criar estrutura para campanha de conversão no Google Ads"
→ Invoca skill específica diretamente
```

---

## 📁 Estrutura de Cada Skill

Cada skill contém:
```
skill-name/
├── SKILL.md              # Documentação principal
├── scripts/              # Scripts Python executáveis
├── assets/               # Templates, logos, estilos
└── references/           # Documentação de referência
```

---

## 🔌 Integração com Backend

As skills se conectam ao backend existente via:
- **APIs**: Endpoints em `backend/app/api/`
- **Agentes**: Agno agents em `backend/app/agents/`
- **Meta API**: Conector em `backend/app/services/meta_api.py`

---

## 📝 Nomenclatura e Convenções

### Campanhas
```
[PLATAFORMA]_[OBJETIVO]_[PRODUTO]_[AUDIENCIA]_[DATA]

Exemplo:
META_CONV_CURSO-PYTHON_REMARKETING_2024Q1
```

### Arquivos de Output
```
[SKILL]_[ENTITY]_[ACTION]_[TIMESTAMP].json

Exemplo:
campaign-creator_campaign_payload_20240120.json
```

---

## 🧪 Testes e Validação

Cada skill fornece scripts de validação:
- `scripts/validate_*.py` - Valida antes de executar
- `scripts/test_*.py` - Suite de testes unitários

---

## 🤝 Contribuindo

Ao adicionar ou modificar skills:
1. Manter estrutura YAML no frontmatter
2. Incluir exemplos práticos
3. Documentar scripts disponíveis
4. Atualizar referências cruzadas
5. Seguir convenções de nomenclatura

---

## 📚 Documentação Adicional

- [MVP Roadmap](../MVP_ROADMAP.md)
- [Setup Local](../SETUP_LOCAL.md)
- [Backend Architecture](../backend/README.md)
- [Frontend Integration](../frontend/README.md)

---

## 🔗 Referências Rápidas

| Preciso... | Skill |
|-----------|-------|
| Criar nova campanha | campaign-creator |
| Modificar campanha existente | campaign-editor |
| Criar audiência | audience-manager |
| Escrever anúncios | creative-manager |
| Ajustar orçamento | budget-optimizer |
| Entender performance | performance-analyzer |
| Gerar relatório | report-generator |
| Executar workflow completo | ad-campaign-orchestrator |

---

**Status:** ✅ Documentação completa - Pronto para implementação

**Próximos passos:**
1. Implementar scripts Python em cada skill
2. Criar assets e templates
3. Integrar com backend existente
4. Testar workflows end-to-end
