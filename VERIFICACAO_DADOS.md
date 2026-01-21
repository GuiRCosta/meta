# ✅ VERIFICAÇÃO DE DADOS - Dashboard vs Banco vs Meta API

**Data**: 2026-01-21
**Objetivo**: Validar se os dados do dashboard estão corretos

---

## 📊 RESUMO EXECUTIVO

### Status Geral: ⚠️ PARCIALMENTE CORRETO

| Métrica | Dashboard | Banco de Dados | Meta API | Status |
|---------|-----------|----------------|----------|--------|
| Orçamento Mensal | R$ 10.000 | R$ 10.000 | N/A | ✅ Correto |
| Gasto Exibido | R$ 17.786,50 | R$ 17.786,50 (total histórico) | N/A | ⚠️ **Confuso** |
| Gasto Hoje | R$ 0,00 | R$ 0,00 | N/A | ✅ Correto |
| Campanhas Ativas | 0 | 0 | 0 | ✅ Correto |
| ROAS Médio | 23.3x | 12.3x | N/A | ❌ **Divergente** |
| CTR Médio | 3.59% | 3.59% | N/A | ✅ Correto |
| Impressões Hoje | 0 | 0 | N/A | ✅ Correto |
| Cliques Hoje | 0 | 0 | N/A | ✅ Correto |
| Total Campanhas | 168 (frontend) | 170 (banco) | 163 (Meta) | ⚠️ **Discrepante** |

---

## 🔍 ANÁLISE DETALHADA

### 1. Orçamento Mensal

**Dashboard**: R$ 17.786,50 / R$ 10.000 (178%)

**Análise**:
- ❌ **Label INCORRETO**: O dashboard mostra "Orçamento Mensal" mas está exibindo o **GASTO TOTAL HISTÓRICO**
- ✅ **Valor CORRETO**: R$ 17.786,50 é realmente o gasto total acumulado
- ⚠️ **Problema**: O label deveria ser "Gasto Total Histórico" ou "Gasto Acumulado"
- 📊 **Período**: 2026-01-14 a 2026-01-20 (7 dias)

**Conclusão**:
```
Gasto total em 7 dias: R$ 17.786,50
Limite mensal: R$ 10.000
Percentual: 178% (já excedeu o limite!)
```

---

### 2. Campanhas Ativas

**Dashboard**: 0

**Banco de Dados**:
- Total: 170 campanhas
- Ativas (ACTIVE): 0
- Pausadas (PAUSED): 170
- Rascunho (DRAFT): 0
- Arquivadas (ARCHIVED): 2 (filtradas)

**Meta API**:
- Total retornado: 163 campanhas
- Todas com status PAUSED

**Análise**:
- ✅ **Correto**: Realmente não há campanhas ativas
- ⚠️ **Nota**: Todas as 170 campanhas no banco foram convertidas para PAUSED após migração do enum
- 🔴 **Discrepância**: Banco tem 170, Meta API retorna 163

**Possíveis causas da discrepância**:
1. **Meta BM deletou 7 campanhas**: Banco local ainda tem campanhas que foram deletadas no Meta
2. **Campanhas fantasmas**: Banco tem registros órfãos
3. **Sincronização pendente**: Última sincronização não limpou campanhas deletadas

---

### 3. ROAS Médio

**Dashboard**: 23.3x

**Banco de Dados**: 12.3x

**Análise**:
- ❌ **DIVERGENTE**: Diferença de quase 2x entre dashboard e cálculo do banco
- 🔍 **Cálculo do Banco**:
  - Total ROAS somado: 4737.55
  - Registros de métricas: 385
  - ROAS médio: 4737.55 / 385 = 12.3x

**Possíveis causas**:
1. Dashboard usa **média ponderada** (por gasto)
2. Dashboard filtra **apenas campanhas ativas** (mas não há nenhuma)
3. Dashboard usa **período diferente** (últimos 30 dias vs todos os registros)
4. **Bug no cálculo** do dashboard

**Recomendação**: Verificar código do dashboard em `/api/dashboard` ou componente que calcula ROAS

---

### 4. Métricas "Hoje"

**Dashboard**:
- Gasto Hoje: R$ 0,00
- Impressões Hoje: 0
- Cliques Hoje: 0

**Banco de Dados**:
- Data de hoje: 2026-01-21
- Registros com data 2026-01-21: 0
- Última métrica: 2026-01-20

**Análise**:
- ✅ **Correto**: Realmente não há métricas para hoje (2026-01-21)
- ⏰ **Normal**: É esperado que não haja dados se não houve sincronização hoje
- 📅 **Período das métricas**: 2026-01-14 a 2026-01-20 (últimos 7 dias)

---

### 5. CTR Médio

**Dashboard**: 3.59%

**Banco de Dados**: 3.59%

**Cálculo**:
```
CTR = (Total Cliques / Total Impressões) × 100
CTR = (61.132 / 1.705.067) × 100
CTR = 3.59%
```

**Análise**:
- ✅ **Correto**: Cálculo bate perfeitamente
- 📊 **Boa taxa**: CTR de 3.59% é considerado bom para Meta Ads (média é 1-2%)

---

### 6. Discrepância de Campanhas

**Números**:
- Frontend exibe: 168 campanhas (filtra 2 ARCHIVED)
- Banco tem: 170 campanhas
- Meta API retorna: 163 campanhas
- Meta BM mostra: 164 campanhas (screenshot anterior)

**Análise Completa**:

```
Meta BM: 164 campanhas (referência real)
  ├── Meta API retorna: 163 (pode ter limite de paginação ou 1 deletada)
  └── Diferença: -1 campanha

Banco Local: 170 campanhas
  ├── Frontend mostra: 168 (170 - 2 ARCHIVED)
  └── Diferença vs Meta BM: +6 campanhas

Campanhas "fantasmas" no banco: 6-7
```

**Causa Raiz**:
- ✅ **Identificado**: Banco tem 6-7 campanhas que foram deletadas no Meta BM mas ainda estão no banco local
- 🔄 **Solução**: Próxima sincronização deveria deletar ou arquivar campanhas que não existem mais no Meta

---

### 7. Campanhas Duplicadas

**Meta API**:
- Total: 163 campanhas
- Nomes únicos: 8
- **Duplicadas: 155 campanhas** (95%!)

**Top duplicações**:
```
"[VENDAS][PRE-LP2][ABO] — Cópia — Cópia": 150x 🚨
"[VENDAS][PRE-LP2][ABO] — Cópia": 3x
"[VENDAS][PRE-LP2][CBO] — Cópia — Cópia": 3x
"Nova campanha de Reconhecimento — Cópia": 2x
"[VENDAS][PRE-LP2][CBO]": 2x
```

**Análise**:
- 🚨 **CRÍTICO**: 150 campanhas com o mesmo nome!
- 📝 **Problema**: Função de duplicação criou muitas cópias
- 💰 **Impacto**: Poluição do Meta BM e dificuldade de gerenciamento
- 🗑️ **Recomendação**: Limpar essas duplicatas

---

## 📋 DADOS BRUTOS

### Banco de Dados
```
Orçamento mensal configurado: R$ 10.000
Total de campanhas: 170
Campanhas ativas: 0
Campanhas pausadas: 170
Campanhas rascunho: 0

Total de registros de métricas: 385
Gasto total histórico: R$ 17.786,50
Impressões totais: 1.705.067
Cliques totais: 61.132
Conversões totais: 4.148
CTR médio: 3.59%
ROAS médio: 12.3x

Período das métricas:
  Data mais antiga: 2026-01-14
  Data mais recente: 2026-01-20
```

### Meta API
```
Total de campanhas: 163
Status: 100% PAUSED
Nomes únicos: 8
Duplicatas: 155 (95%)

Campanhas DRAFT/PREVIEW: 0
```

---

## ✅ CONCLUSÕES

### Dados Corretos ✅
1. **Gasto Hoje**: R$ 0,00 (sem métricas para 2026-01-21)
2. **Campanhas Ativas**: 0 (todas pausadas)
3. **CTR Médio**: 3.59% (cálculo correto)
4. **Impressões/Cliques Hoje**: 0 (sem métricas para hoje)

### Dados Confusos ⚠️
1. **Label "Orçamento Mensal"**: Deveria ser "Gasto Total Histórico" ou "Gasto Acumulado (7 dias)"
2. **Percentual 178%**: Correto matematicamente, mas confuso porque compara gasto histórico com limite mensal

### Dados Divergentes ❌
1. **ROAS Médio**: Dashboard mostra 23.3x, banco calcula 12.3x (verificar código do dashboard)
2. **Total de Campanhas**: 170 (banco) vs 163 (Meta API) - 7 campanhas fantasmas

### Problemas Críticos 🚨
1. **155 campanhas duplicadas** no Meta BM (poluição)
2. **Gasto de R$ 17.786,50 em 7 dias** excedeu limite mensal de R$ 10.000 em 78%
3. **7 campanhas fantasmas** no banco local (deletadas no Meta mas não sincronizadas)

---

## 🎯 RECOMENDAÇÕES

### Imediato (Corrigir Dashboard)

1. **Corrigir Label do Orçamento**:
   - De: "Orçamento Mensal: R$ 17.786,50 / R$ 10.000 (178%)"
   - Para: "Gasto Total (7 dias): R$ 17.786,50 | Limite Mensal: R$ 10.000"

2. **Investigar ROAS**:
   - Verificar código em `/api/dashboard` ou `/app/(dashboard)/page.tsx`
   - Comparar cálculo com banco de dados (12.3x vs 23.3x)

3. **Adicionar Período no Dashboard**:
   - Exibir claramente: "Métricas de 14/01 a 20/01 (7 dias)"

### Curto Prazo (Sincronização)

4. **Sincronizar e Limpar**:
   - Executar sincronização via UI
   - Implementar lógica para deletar/arquivar campanhas que não existem mais no Meta
   - Verificar se 7 campanhas fantasmas serão removidas

5. **Limpar Duplicatas**:
   - Deletar ou arquivar 150 campanhas duplicadas "[VENDAS][PRE-LP2][ABO] — Cópia — Cópia"
   - Manter apenas 1 de cada nome único
   - Reduzir de 163 para ~8 campanhas únicas

### Médio Prazo (Melhorias)

6. **Adicionar Filtro de Período**:
   - Dropdown: "Hoje", "Últimos 7 dias", "Últimos 30 dias", "Todo o período"
   - Recalcular métricas com base no período selecionado

7. **Alertas de Orçamento**:
   - Exibir alerta quando gasto mensal exceder limite
   - Notificação: "Você excedeu o limite mensal em 78%"

8. **Dashboard de Duplicatas**:
   - Widget mostrando campanhas duplicadas
   - Botão "Limpar Duplicatas" em massa

---

## 📞 COMANDOS ÚTEIS

### Verificar Gasto Mensal Atual
```bash
cd frontend
DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

p.campaignMetric.aggregate({
  where: { date: { gte: firstDay } },
  _sum: { spend: true }
}).then(r => console.log('Gasto este mês:', r._sum.spend))
  .finally(() => p.\$disconnect());
"
```

### Deletar Campanhas Duplicadas
```sql
-- Listar duplicatas
SELECT name, COUNT(*) as count
FROM "Campaign"
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Manter apenas a primeira de cada nome (CUIDADO!)
DELETE FROM "Campaign"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "Campaign"
  GROUP BY name
);
```

---

**Última atualização**: 2026-01-21
**Próxima ação**: Corrigir label do dashboard e investigar divergência de ROAS
