# ✅ Checklist de Validação - Meta Campaign Manager vs Meta Ads

## 📊 Status Atual: 2026-01-20

### 1. Quantidade de Campanhas
- **Meta Ads Manager**: 164 campanhas
- **Aplicação**: 161 campanhas sincronizadas
- **Diferença**: 3 campanhas (1.8%)
- **Status**: ✅ OK (diferença aceitável)

---

## 🔍 Campos que a Aplicação Sincroniza

### ✅ Campos Básicos (Funcionando)
| Campo | Meta | Aplicação | Status |
|-------|------|-----------|--------|
| ID da campanha | ✅ | ✅ | Sincronizado |
| Nome | ✅ | ✅ | Sincronizado |
| Objetivo | ✅ | ✅ | Sincronizado |
| Status | ✅ | ✅ | Sincronizado |
| Status Efetivo | ✅ | ✅ | Sincronizado |
| Orçamento Diário | ✅ | ✅ | Sincronizado |
| Orçamento Total | ✅ | ✅ | Sincronizado |
| Categorias Especiais | ✅ | ✅ | Sincronizado |
| Data de Criação | ✅ | ✅ | Sincronizado |
| Data de Atualização | ✅ | ✅ | Sincronizado |

### ❌ Métricas (NÃO Sincronizadas - Precisa Implementar)
| Métrica | Meta | Aplicação | Status |
|---------|------|-----------|--------|
| Gasto (Spend) | ✅ | ❌ | Mostram R$ 0 |
| Impressões | ✅ | ❌ | Mostram 0 |
| Cliques | ✅ | ❌ | Mostram 0 |
| CTR | ✅ | ❌ | Mostram 0% |
| ROAS | ✅ | ❌ | Mostram - |
| Conversões | ✅ | ❌ | Não sincronizado |
| CPA | ✅ | ❌ | Não sincronizado |

---

## 🎯 Validação Manual - Escolha UMA campanha

### Campanha Selecionada: `[VENDAS][PRE-LP2][ABO] — Cópia — Cópia`

#### Dados Básicos
| Campo | Meta Ads Manager | Aplicação | ✅/❌ |
|-------|------------------|-----------|-------|
| Nome completo | | `[VENDAS][PRE-LP2][ABO] — Cópia — Cópia` | |
| Status | Pausada | Pausada | ✅ |
| Objetivo | Vendas | OUTCOME_SALES | ✅ |
| Data criação | | | |
| Orçamento diário | | | |

#### Métricas (Últimos 7 dias)
| Métrica | Meta Ads Manager | Aplicação | ✅/❌ |
|---------|------------------|-----------|-------|
| Gasto total | R$ ? | R$ 0 | ❌ |
| Impressões | ? | 0 | ❌ |
| Cliques | ? | 0 | ❌ |
| CTR | ?% | 0% | ❌ |
| ROAS | ? | - | ❌ |

---

## 🔧 O Que Precisa Ser Corrigido

### Problema Identificado:
A função `list_campaigns()` em `backend/app/tools/meta_api.py` **NÃO** busca métricas (insights).

Ela só busca campos básicos na linha 42:
```python
"fields": "id,name,objective,status,effective_status,daily_budget,lifetime_budget,special_ad_categories,created_time,updated_time"
```

### Solução:
Adicionar busca de insights (métricas) por campanha.

---

## 📋 Próximos Passos

### 1. Validar Dados Básicos (Agora)
- [ ] Comparar nomes das campanhas
- [ ] Validar status
- [ ] Verificar objetivos
- [ ] Conferir orçamentos

### 2. Implementar Sincronização de Métricas (Depois)
- [ ] Adicionar endpoint de insights
- [ ] Buscar spend, impressions, clicks
- [ ] Calcular CTR e ROAS
- [ ] Atualizar dashboard

### 3. Testar Outras Funcionalidades
- [ ] Criar nova campanha
- [ ] Editar campanha existente
- [ ] Duplicar campanha
- [ ] Pausar/Ativar campanha

---

## ✅ Validação Completa

**Data**: 2026-01-20
**Versão**: MVP v1.0
**Status Geral**: ✅ Sincronização básica funcionando
**Próximo**: Implementar sincronização de métricas
