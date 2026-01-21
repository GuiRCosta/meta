# 📊 SITUAÇÃO REAL DAS MÉTRICAS

**Data**: 2026-01-21
**Descoberta**: Os R$ 17.786,50 são dados FAKE do seed

---

## ✅ RESUMO EXECUTIVO

### Situação Atual

| Item | Status | Origem dos Dados |
|------|--------|------------------|
| **Campanhas** | ✅ Reais | Meta API (163 campanhas sincronizadas) |
| **Status das campanhas** | ✅ Real | Todas PAUSED (pausadas) |
| **Métricas (gastos, cliques, etc)** | ❌ Fake | Dados do seed (frontend/prisma/seed.ts) |
| **Gasto "R$ 17.786,50"** | ❌ Fake | Criado pelo seed, não é real |

---

## 🔍 POR QUE AS MÉTRICAS SÃO FAKE?

### 1. Token Meta sem Permissão de Insights

O token de acesso atual **não tem permissão** para ler métricas reais:

```bash
curl "https://graph.facebook.com/v24.0/act_23851104567680791/insights"

# Resposta:
{
  "error": {
    "message": "(#200) Ad account owner has NOT grant ads_management or ads_read permission",
    "type": "OAuthException",
    "code": 200
  }
}
```

**Permissões atuais**: `pages_show_list, pages_read_engagement`
**Permissões necessárias**: `ads_read` ou `ads_management`

---

## 📂 DE ONDE VÊM OS DADOS FAKE?

### Seed do Banco de Dados

**Arquivo**: `/Users/guilhermecosta/Projetos/meta/frontend/prisma/seed.ts`

O seed cria **5 campanhas fake** com métricas aleatórias:

```typescript
// Gerar métricas diárias dos últimos 7 dias
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);

  await prisma.campaignMetric.create({
    data: {
      campaignId: campaign.id,
      date,
      spend: Math.random() * 500, // ⬅️ FAKE: Gasto aleatório
      impressions: Math.floor(Math.random() * 50000), // ⬅️ FAKE
      clicks: Math.floor(Math.random() * 2000), // ⬅️ FAKE
      conversions: Math.floor(Math.random() * 100), // ⬅️ FAKE
      ctr: Math.random() * 5,
      cpm: Math.random() * 20,
      cpc: Math.random() * 2,
      roas: Math.random() * 8,
    },
  });
}
```

### Total de Métricas Fake

Verificação no banco:

```bash
Total de registros: 385
Gasto total: R$ 17.786,50
Impressões: 1.705.067
Cliques: 61.132
Conversões: 4.148
Período: 2026-01-14 a 2026-01-20 (7 dias)
```

**Todos esses valores são aleatórios criados pelo seed!**

---

## 🎯 COMO OBTER MÉTRICAS REAIS?

### Opção 1: Gerar Novo Token com Permissões Corretas

**Passo a passo**:

1. **Acessar**: https://developers.facebook.com/tools/explorer/
2. **Selecionar App**: "agno" (ID: 892743800378312)
3. **Adicionar Permissões**:
   - ✅ `ads_read` (ler dados de anúncios)
   - ✅ `ads_management` (gerenciar anúncios)
   - ✅ `read_insights` (ler métricas)
4. **Gerar Token de Acesso**
5. **Copiar Token** e substituir no `.env`:
   ```bash
   META_ACCESS_TOKEN="novo_token_aqui"
   ```

### Opção 2: Usar Sistema de Autenticação OAuth

**Implementar fluxo OAuth completo**:
1. Usuário autoriza o app no Meta
2. App recebe token com permissões corretas
3. Token é salvo no banco para cada usuário

**Vantagem**: Cada usuário tem seu próprio token com suas próprias permissões

---

## 📊 O QUE A API DO META RETORNA AGORA?

### Dados Disponíveis (com token atual)

```json
{
  "id": "23852848217260791",
  "name": "[VENDAS][PRE-LP2][ABO] — Cópia — Cópia",
  "objective": "OUTCOME_SALES",
  "status": "PAUSED",
  "effective_status": "PAUSED",
  "special_ad_categories": [],
  "created_time": "2026-01-19T18:54:31-0300",
  "updated_time": "2026-01-19T18:54:31-0300"
}
```

**O que está faltando**:
- ❌ `spend` (gasto)
- ❌ `impressions` (impressões)
- ❌ `clicks` (cliques)
- ❌ `conversions` (conversões)
- ❌ `ctr` (taxa de cliques)
- ❌ `cpm` (custo por mil impressões)
- ❌ `cpc` (custo por clique)
- ❌ `roas` (retorno sobre gasto)

---

## 🚨 IMPACTO NO DASHBOARD

### Dashboard Atual

```
Orçamento Mensal: R$ 17.786,50 / R$ 10.000 (178%)
Gasto Hoje: R$ 0.00
ROAS Médio: 23.3x
Campanhas Ativas: 0
Impressões Hoje: 0
Cliques Hoje: 0
CTR Médio: 3.59%
```

### Interpretação Correta

| Dado | Valor | Real ou Fake? |
|------|-------|---------------|
| Campanhas Ativas: 0 | 0 | ✅ **Real** (sincronizado do Meta) |
| Gasto: R$ 17.786,50 | R$ 17.786,50 | ❌ **Fake** (seed) |
| ROAS: 23.3x | 23.3x | ❌ **Fake** (calculado de dados fake) |
| CTR: 3.59% | 3.59% | ❌ **Fake** (calculado de dados fake) |
| Gasto Hoje: R$ 0 | R$ 0 | ✅ **Correto** (não há métricas para hoje) |

---

## ✅ CONCLUSÃO

### Situação Real

1. **Campanhas**: ✅ Reais (163 campanhas sincronizadas do Meta)
2. **Status**: ✅ Real (todas PAUSED)
3. **Métricas**: ❌ Fake (dados aleatórios do seed)

### O Que Está Funcionando

- ✅ Sincronização de campanhas (nome, status, objetivo)
- ✅ Listagem de campanhas
- ✅ Duplicação de campanhas
- ✅ Filtros por status
- ✅ CRUD de campanhas

### O Que NÃO Está Funcionando

- ❌ Métricas reais (gasto, impressões, cliques)
- ❌ Insights do Meta API
- ❌ Gráficos com dados reais
- ❌ ROAS real
- ❌ Dashboard com dados reais

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Opção A: Continuar com Dados Fake (MVP Visual)

**Vantagem**: MVP funciona visualmente, bom para demos
**Desvantagem**: Não reflete realidade

### Opção B: Gerar Token com Permissões (Dados Reais)

**Passos**:
1. Gerar novo token com `ads_read` + `ads_management`
2. Substituir `META_ACCESS_TOKEN` no `.env`
3. Reiniciar backend
4. Criar endpoint para buscar insights
5. Sincronizar métricas reais

**Vantagem**: Dashboard mostra dados reais
**Tempo estimado**: 30-60 minutos

### Opção C: Implementar OAuth (Produção)

**Vantagem**: Cada usuário tem seu token
**Desvantagem**: Mais complexo, leva mais tempo

---

## 📋 COMANDOS ÚTEIS

### Verificar Permissões do Token Atual

```bash
curl -G "https://graph.facebook.com/v24.0/me/permissions" \
  -d "access_token=SEU_TOKEN"
```

### Testar Token Novo

```bash
NEW_TOKEN="seu_novo_token_com_ads_read"

curl -G "https://graph.facebook.com/v24.0/act_23851104567680791/insights" \
  -d "access_token=${NEW_TOKEN}" \
  -d "date_preset=last_7d" \
  -d "fields=spend,impressions,clicks"
```

### Limpar Métricas Fake do Banco

```bash
cd frontend
DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

p.campaignMetric.deleteMany({})
  .then(r => console.log('Deletadas', r.count, 'métricas fake'))
  .finally(() => p.\$disconnect());
"
```

---

**Última atualização**: 2026-01-21
**Status**: Identificado que métricas são fake do seed
**Próxima ação**: Decidir se vai gerar token com permissões ou continuar com dados fake
