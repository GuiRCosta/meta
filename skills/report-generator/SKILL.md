---
name: report-generator
description: Geração de relatórios de performance de campanhas publicitárias. Use quando o agente precisar: (1) Criar relatórios periódicos (diário, semanal, mensal), (2) Gerar dashboards executivos, (3) Exportar dados em diferentes formatos, (4) Criar visualizações de métricas, (5) Automatizar envio de relatórios, (6) Personalizar relatórios por stakeholder.
---

# Report Generator

Skill para geração automatizada de relatórios de campanhas publicitárias.

## Tipos de Relatório

### Por Frequência
| Tipo | Conteúdo | Audiência |
|------|----------|-----------|
| Diário | Alertas, anomalias, spend | Operação |
| Semanal | Tendências, comparativos | Gestores |
| Mensal | Performance completa, insights | Diretoria |
| Trimestral | Análise estratégica, projeções | C-Level |

### Por Audiência
| Stakeholder | Foco | Nível de Detalhe |
|-------------|------|------------------|
| Operacional | Métricas granulares, ações | Alto |
| Tático | Tendências, otimizações | Médio |
| Estratégico | ROI, crescimento | Baixo |
| Cliente | Resultados de negócio | Executivo |

## Estruturas de Relatório

### Relatório Executivo (1 página)
```markdown
# Performance Report - [Período]

## Resumo Executivo
[2-3 frases com principais resultados]

## KPIs Principais
| Métrica | Atual | Meta | Δ vs Meta | Δ vs Período Ant. |
|---------|-------|------|-----------|-------------------|
| Investimento | R$ X | R$ Y | +Z% | +W% |
| Conversões | X | Y | +Z% | +W% |
| CPA | R$ X | R$ Y | -Z% | -W% |
| ROAS | X.Xx | Y.Yx | +Z% | +W% |

## Destaques
✅ [Vitória principal]
✅ [Segunda vitória]
⚠️ [Ponto de atenção]

## Próximos Passos
1. [Ação prioritária]
2. [Segunda ação]
```

### Relatório Operacional (Detalhado)
```markdown
# Relatório de Performance - [Período]

## 1. Overview
[Contexto e resumo do período]

## 2. Performance por Canal
### Google Ads
[Métricas detalhadas, top/bottom performers]

### Meta Ads
[Métricas detalhadas, top/bottom performers]

## 3. Performance por Campanha
[Tabela com todas as campanhas]

## 4. Análise de Criativos
[Top performers, testes em andamento]

## 5. Análise de Audiências
[Segmentos com melhor/pior performance]

## 6. Diagnósticos e Recomendações
[Problemas identificados + ações sugeridas]

## 7. Plano de Ação
[Ações priorizadas para próximo período]

## Anexos
[Dados brutos, gráficos adicionais]
```

### Relatório para Cliente
```markdown
# Relatório de Resultados - [Cliente] - [Período]

## Seus Resultados
[Foco em métricas de negócio]

## O Que Fizemos
[Resumo das ações executadas]

## O Que Aprendemos
[Insights principais]

## Próximos Passos
[Recomendações estratégicas]

## Investimento
[Breakdown de custos se aplicável]
```

## Visualizações Padrão

### Gráficos Obrigatórios
1. **Evolução Temporal** - Linha com principais KPIs
2. **Funil de Conversão** - Barra horizontal
3. **Distribuição de Budget** - Pizza ou treemap
4. **Comparativo de Período** - Barras lado a lado
5. **Performance por Dimensão** - Tabela com heatmap

### Código de Cores
```
Verde: Meta atingida ou superada (>= 100%)
Amarelo: Próximo da meta (80-99%)
Vermelho: Abaixo da meta (< 80%)

Para variações:
Verde: Melhoria (+)
Vermelho: Piora (-) em métricas de custo positivo
Invertido para CPA/CPL
```

## Templates de Dados

### Estrutura de Dados para Relatório
```json
{
  "report_meta": {
    "title": "Performance Report",
    "period": {"start": "2024-01-01", "end": "2024-01-31"},
    "generated_at": "2024-02-01T10:00:00Z",
    "currency": "BRL"
  },
  "summary": {
    "total_spend": 50000,
    "total_revenue": 175000,
    "total_conversions": 350,
    "overall_roas": 3.5,
    "overall_cpa": 142.86
  },
  "by_channel": [
    {
      "channel": "google_ads",
      "spend": 30000,
      "conversions": 200,
      "revenue": 100000,
      "roas": 3.33,
      "cpa": 150
    }
  ],
  "by_campaign": [],
  "trends": [],
  "insights": [],
  "recommendations": []
}
```

## Automação de Relatórios

### Configuração de Agendamento
```yaml
schedules:
  - name: "Daily Alert"
    frequency: "daily"
    time: "09:00"
    timezone: "America/Sao_Paulo"
    template: "daily_alert"
    recipients: ["operacao@empresa.com"]
    conditions:
      - "spend > 0"

  - name: "Weekly Performance"
    frequency: "weekly"
    day: "monday"
    time: "08:00"
    template: "weekly_performance"
    recipients: ["gestores@empresa.com", "cliente@cliente.com"]

  - name: "Monthly Report"
    frequency: "monthly"
    day: 1
    time: "10:00"
    template: "monthly_detailed"
    recipients: ["diretoria@empresa.com"]
    format: "pdf"
```

### Triggers de Alerta
```yaml
alerts:
  - name: "Budget Exceeded"
    condition: "daily_spend > daily_budget * 1.2"
    message: "⚠️ Gasto diário excedeu 120% do budget"
    recipients: ["operacao@empresa.com"]

  - name: "Zero Conversions"
    condition: "conversions_24h == 0 AND spend_24h > 500"
    message: "🚨 Nenhuma conversão nas últimas 24h"
    recipients: ["operacao@empresa.com", "gestor@empresa.com"]
```

## Formatos de Exportação

| Formato | Uso | Ferramentas |
|---------|-----|-------------|
| PDF | Relatórios formais, clientes | WeasyPrint, ReportLab |
| Excel | Análise, dados brutos | openpyxl, pandas |
| Google Sheets | Colaboração, dashboards | gspread |
| PowerPoint | Apresentações | python-pptx |
| HTML | E-mail, web | Jinja2 |
| JSON | Integração, APIs | nativo |

## Scripts Disponíveis

- `scripts/generate_report.py` - Gerador principal de relatórios
- `scripts/create_charts.py` - Criação de visualizações
- `scripts/export_pdf.py` - Exportação para PDF
- `scripts/export_excel.py` - Exportação para Excel
- `scripts/send_email.py` - Envio automatizado por e-mail
- `scripts/schedule_reports.py` - Agendador de relatórios

## Assets

- `assets/templates/` - Templates HTML/Word para relatórios
- `assets/styles/` - CSS e estilos para formatação
- `assets/logos/` - Logos para branding de relatórios

## Referências

- `references/kpi-glossary.md` - Glossário de métricas
- `references/chart-guidelines.md` - Boas práticas de visualização
- `references/report-examples.md` - Exemplos de relatórios
