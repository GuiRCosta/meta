---
name: performance-analyzer
description: Análise de performance de campanhas publicitárias com diagnósticos e recomendações. Use quando o agente precisar: (1) Analisar métricas de campanhas, (2) Identificar problemas de performance, (3) Comparar períodos ou campanhas, (4) Detectar anomalias, (5) Gerar insights acionáveis, (6) Priorizar ações de otimização.
---

# Performance Analyzer

Skill para análise profunda de performance de campanhas publicitárias.

## Framework de Análise

### Hierarquia de Diagnóstico
```
1. Volume → Há impressões/cliques suficientes?
2. Qualidade → CTR/Relevance Score está bom?
3. Conversão → CVR está no esperado?
4. Valor → CPA/ROAS está no alvo?
5. Tendência → Está melhorando ou piorando?
```

### Métricas por Nível
| Nível | Métricas Primárias | Métricas Secundárias |
|-------|-------------------|---------------------|
| Conta | Spend, ROAS, CPA | Budget utilizado |
| Campanha | Conversões, ROAS | Impressions Share |
| Ad Group | CTR, CVR | Quality Score |
| Ad | CTR, Conversões | Relevance |
| Keyword | CPC, Conversões | Search Terms |

## Diagnósticos Comuns

### Problema: Baixo Volume de Impressões
```yaml
sintomas:
  - impressoes < 1000/dia
  - impression_share < 50%

causas_provaveis:
  - Budget muito baixo
  - Lances não competitivos
  - Targeting muito restrito
  - Keywords muito específicas

diagnostico:
  - Verificar: "Budget vs Recomendado"
  - Verificar: "Avg Position / Top Impression Rate"
  - Verificar: "Audience Size"

acoes:
  - Aumentar budget ou lances
  - Expandir keywords (adicionar broad match)
  - Relaxar targeting de audiência
```

### Problema: CTR Baixo
```yaml
sintomas:
  - ctr_search < 2%
  - ctr_display < 0.5%

causas_provaveis:
  - Headlines pouco atrativos
  - Mismatch entre ad e keyword
  - Posição média baixa
  - Criativos genéricos

diagnostico:
  - Analisar: "Ad relevance por keyword"
  - Analisar: "CTR por posição"
  - Analisar: "Competitor ads"

acoes:
  - Reescrever headlines com benefícios claros
  - Segmentar ad groups por tema
  - Testar novos criativos
  - Aumentar lances para melhor posição
```

### Problema: Baixa Taxa de Conversão
```yaml
sintomas:
  - cvr < 1%
  - bounce_rate > 70%

causas_provaveis:
  - Landing page desalinhada
  - Tráfego não qualificado
  - UX problemático
  - Oferta pouco atrativa

diagnostico:
  - Analisar: "Message match (ad vs LP)"
  - Analisar: "Métricas de LP (time on site, scroll)"
  - Analisar: "Segmentação de converters vs non-converters"

acoes:
  - Alinhar copy do ad com LP
  - Revisar targeting (excluir baixa qualidade)
  - Otimizar LP (speed, CTA, form)
  - Testar oferta diferente
```

### Problema: CPA Alto / ROAS Baixo
```yaml
sintomas:
  - cpa > target × 1.5
  - roas < target × 0.7

causas_provaveis:
  - CPC muito alto
  - CVR muito baixo
  - Ticket médio menor que esperado
  - Canais ineficientes

diagnostico:
  - Calcular: "Contribuição de cada etapa"
  - Identificar: "Campanhas/keywords com pior CPA"
  - Comparar: "CPA por dispositivo/geo/hora"

acoes:
  - Pausar keywords com CPA > 2x target
  - Ajustar bid modifiers
  - Realocar budget para top performers
  - Testar novas audiências
```

## Análise Comparativa

### Comparação de Períodos
```python
# Estrutura de análise período-over-período
comparacao = {
    "periodo_atual": "2024-01-01 a 2024-01-31",
    "periodo_anterior": "2023-12-01 a 2023-12-31",
    "metricas": {
        "spend": {"atual": 10000, "anterior": 9500, "variacao": "+5.3%"},
        "conversoes": {"atual": 150, "anterior": 120, "variacao": "+25%"},
        "cpa": {"atual": 66.67, "anterior": 79.17, "variacao": "-15.8%"},
        "roas": {"atual": 3.2, "anterior": 2.8, "variacao": "+14.3%"}
    },
    "insight": "Performance melhorou significativamente. CPA reduziu 15.8% com aumento de 25% em conversões."
}
```

### Análise de Cohort
```
Por Período de Aquisição:
- Cohort Janeiro: ROAS 30 dias = 2.5x, ROAS 90 dias = 4.2x
- Cohort Fevereiro: ROAS 30 dias = 2.8x, ROAS 90 dias = TBD

Por Fonte:
- Google Search: CAC R$45, LTV R$320, LTV/CAC = 7.1
- Meta Ads: CAC R$38, LTV R$180, LTV/CAC = 4.7
- LinkedIn: CAC R$95, LTV R$580, LTV/CAC = 6.1
```

## Detecção de Anomalias

### Thresholds de Alerta
```yaml
alertas:
  critico:
    - "Spend diário > 150% do budget"
    - "CVR drop > 50% vs média 7 dias"
    - "Zero conversões por 48h (com spend > R$500)"

  alto:
    - "CPA > 200% do target"
    - "CTR drop > 30% vs média 7 dias"
    - "Impression share drop > 40%"

  medio:
    - "CPC increase > 25%"
    - "Frequency > 5 em 7 dias"
    - "Relevance score < 5"
```

### Análise de Tendência
```
Tendência de CPA (últimos 14 dias):
Day 1-7 avg: R$ 52.30
Day 8-14 avg: R$ 61.80
Variação: +18.2%
Tendência: ⬆️ PIORANDO

Ação Recomendada: Investigar causas do aumento de CPA
- Verificar mudanças em lances/orçamento
- Analisar novos competidores
- Revisar quality score
```

## Framework de Priorização

### Matriz Impacto × Esforço
```
                    Baixo Esforço    Alto Esforço
                   ┌─────────────────┬─────────────────┐
    Alto           │   QUICK WINS    │   BIG BETS      │
    Impacto        │   Fazer Agora   │   Planejar      │
                   ├─────────────────┼─────────────────┤
    Baixo          │   FILL-INS      │   DEPRIORITIZE  │
    Impacto        │   Se Sobrar     │   Não Fazer     │
                   └─────────────────┴─────────────────┘
```

### Score de Prioridade
```
Prioridade = (Impacto_Potencial × Confiança) / Esforço

Onde:
- Impacto_Potencial = Melhoria estimada em R$ ou %
- Confiança = 0.5 (hipótese) a 1.0 (comprovado)
- Esforço = 1 (minutos) a 5 (dias)
```

## Scripts Disponíveis

- `scripts/analyze_performance.py` - Análise completa de métricas
- `scripts/detect_anomalies.py` - Detecção automática de anomalias
- `scripts/compare_periods.py` - Comparação entre períodos
- `scripts/prioritize_actions.py` - Prioriza ações de otimização
- `scripts/generate_insights.py` - Gera insights a partir de dados

## Referências

- `references/benchmarks.md` - Benchmarks por indústria e vertical
- `references/diagnostic-trees.md` - Árvores de diagnóstico detalhadas
- `references/kpi-definitions.md` - Definições padronizadas de KPIs
