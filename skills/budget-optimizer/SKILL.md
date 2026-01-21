---
name: budget-optimizer
description: Otimização de orçamentos e estratégias de lance para campanhas publicitárias. Use quando o agente precisar: (1) Recomendar distribuição de budget entre campanhas, (2) Sugerir estratégias de lance, (3) Calcular ROAS/CPA alvo, (4) Ajustar orçamentos baseado em performance, (5) Planejar pacing de gastos, (6) Simular cenários de investimento.
---

# Budget Optimizer

Skill para otimização de orçamentos e lances em campanhas publicitárias.

## Métricas Fundamentais

### Métricas de Custo
| Métrica | Fórmula | Uso |
|---------|---------|-----|
| CPC | Custo / Cliques | Search, Display |
| CPM | (Custo / Impressões) × 1000 | Awareness |
| CPA | Custo / Conversões | Performance |
| CPL | Custo / Leads | Geração de Leads |
| ROAS | Receita / Custo | E-commerce |
| ROI | (Receita - Custo) / Custo | Geral |

### Métricas de Eficiência
| Métrica | Fórmula | Benchmark |
|---------|---------|-----------|
| CTR | Cliques / Impressões | 1-3% Search, 0.5-1% Display |
| CVR | Conversões / Cliques | 2-5% |
| ACOS | Custo / Receita | <30% |

## Estratégias de Lance por Objetivo

### Awareness (Alcance)
```
Recomendação: CPM ou Maximize Reach
- Meta: Máximo de impressões únicas
- Bid: Automático ou CPM manual
- Budget: Alto para saturação rápida
```

### Consideration (Tráfego)
```
Recomendação: Maximize Clicks ou Target CPC
- Meta: Volume de cliques qualificados
- Bid: CPC manual ou automático com limite
- Budget: Médio, distribuído ao longo do período
```

### Conversion (Performance)
```
Recomendação: Target CPA ou Maximize Conversions
- Meta: Máximo de conversões no CPA alvo
- Bid: Automático com CPA/ROAS target
- Budget: Flexível baseado em performance
```

### Value (Valor)
```
Recomendação: Target ROAS ou Maximize Conversion Value
- Meta: Maximizar valor total de conversões
- Bid: ROAS alvo baseado em margem
- Budget: Escala conforme ROAS se mantém
```

## Cálculos de Budget

### Budget Mínimo Recomendado
```
Budget Diário Mínimo = CPA Alvo × 10

Exemplo:
- CPA alvo: R$ 50
- Budget mínimo: R$ 500/dia
- Permite ~10 conversões/dia para otimização
```

### Distribuição por Funil
```
Exemplo Budget Total: R$ 10.000/mês

Modelo Agressivo (Growth):
├── Topo (Awareness): 20% = R$ 2.000
├── Meio (Consideration): 30% = R$ 3.000
└── Fundo (Conversion): 50% = R$ 5.000

Modelo Conservador (Efficiency):
├── Topo (Awareness): 10% = R$ 1.000
├── Meio (Consideration): 20% = R$ 2.000
└── Fundo (Conversion): 70% = R$ 7.000

Modelo Balanced:
├── Topo (Awareness): 15% = R$ 1.500
├── Meio (Consideration): 35% = R$ 3.500
└── Fundo (Conversion): 50% = R$ 5.000
```

### Cálculo de CPA/ROAS Alvo
```
CPA Máximo = Ticket Médio × Margem × CVR Esperado

Exemplo:
- Ticket médio: R$ 200
- Margem: 40%
- CVR landing page: 10%
- CPA máximo = 200 × 0.4 × 0.1 = R$ 8 (conservador)
- CPA alvo = R$ 8 × 2 = R$ 16 (com margem)

ROAS Mínimo = 1 / Margem

Exemplo:
- Margem: 40%
- ROAS mínimo = 1 / 0.4 = 2.5x (break-even)
- ROAS alvo = 2.5 × 1.5 = 3.75x (com lucro)
```

## Otimização de Budget

### Regras de Realocação
```yaml
regras:
  - nome: "Escalar Winners"
    condicao: "ROAS > target × 1.5 AND conversões > 20"
    acao: "Aumentar budget em 20%"
    frequencia: "Semanal"

  - nome: "Reduzir Underperformers"
    condicao: "ROAS < target × 0.7 AND spend > R$500"
    acao: "Reduzir budget em 30%"
    frequencia: "Semanal"

  - nome: "Pausar Perdedores"
    condicao: "ROAS < 1 AND spend > R$1000"
    acao: "Pausar campanha"
    frequencia: "Diária"

  - nome: "Testar Novos"
    condicao: "conversões < 10"
    acao: "Manter budget teste por 14 dias"
    frequencia: "Quinzenal"
```

### Pacing de Gastos
```
Daily Pacing = Budget Mensal / Dias no Mês

Acelerado (Front-loaded):
- Dias 1-10: 40% do budget
- Dias 11-20: 35% do budget
- Dias 21-30: 25% do budget

Linear (Even):
- Distribuição igual por dia
- Ajuste por dia da semana (±15%)

Conservador (Back-loaded):
- Dias 1-10: 25% do budget
- Dias 11-20: 35% do budget
- Dias 21-30: 40% do budget
```

## Simulador de Cenários

### Inputs Necessários
```json
{
  "budget_total": 10000,
  "periodo_dias": 30,
  "cpc_medio": 2.50,
  "cvr_esperado": 0.03,
  "ticket_medio": 150,
  "margem": 0.35
}
```

### Output Esperado
```json
{
  "cenario": "Base",
  "metricas_projetadas": {
    "impressoes": 166667,
    "cliques": 4000,
    "conversoes": 120,
    "receita": 18000,
    "custo": 10000,
    "roas": 1.8,
    "cpa": 83.33,
    "lucro": 1300
  },
  "recomendacao": "ROAS abaixo do mínimo (2.86). Considere reduzir CPC ou melhorar CVR."
}
```

## Scripts Disponíveis

- `scripts/calculate_targets.py` - Calcula CPA/ROAS alvos
- `scripts/simulate_budget.py` - Simula cenários de investimento
- `scripts/optimize_allocation.py` - Recomenda realocação de budget
- `scripts/forecast_spend.py` - Projeta gastos e resultados

## Referências

- `references/bid-strategies.md` - Detalhes de estratégias de lance
- `references/benchmarks.md` - Benchmarks por indústria
- `references/seasonality.md` - Ajustes sazonais recomendados
