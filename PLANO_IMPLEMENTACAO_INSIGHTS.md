# 📋 Plano de Implementação: Sincronização de Insights Meta API

**Criado por**: Claude Code Planner Agent
**Data**: 2026-01-20
**Agent ID**: a0209dc

---

## 📊 Resumo Executivo

### Estado Atual
- ✅ Backend tem `get_campaign_insights()` em `meta_api.py` (linhas 407-458)
- ✅ Database tem model `CampaignMetric` com schema correto
- ❌ Frontend endpoints leem da tabela `CampaignMetric` VAZIA
- ❌ Sem mecanismo de sincronização de insights

### Solução
Implementar camada de sincronização de métricas que busca insights da Meta API e popula tabela `CampaignMetric`, seguindo padrão de sincronização existente em `/api/sync/route.ts`.

---

## ✅ Respostas às Questões Críticas

### 1. Onde adicionar `get_campaign_insights()`?
**Resposta**: Já existe em `backend/app/tools/meta_api.py` (linhas 407-458). Não precisa alterações.

### 2. Endpoint separado ou integrar no `/api/sync` existente?
**Resposta**: **Estender endpoint `/api/sync` existente** para sincronizar campanhas E métricas em uma única chamada.

**Justificativa**:
- Sync endpoint em `/api/sync/route.ts` só sincroniza campos básicos
- Backend já tem `/api/sync/full` que chama campanhas e métricas
- Botão "Sincronizar" do dashboard já chama `/api/sync` - sem mudanças no frontend
- Evita múltiplas chamadas de API e problemas de rate limiting

### 3. Sincronizar insights de todas campanhas ou só ativas?
**Resposta**: **Todas campanhas não-arquivadas** (ativas + pausadas).

**Justificativa**:
- Campanhas pausadas podem ter dados históricos necessários para analytics
- Usuários precisam ver métricas de todas campanhas no dashboard
- Campanhas arquivadas devem ser excluídas para evitar chamadas desnecessárias
- Segue padrão de sincronização de campanhas (linha 20 em `/api/campaigns/route.ts`)

### 4. Qual período buscar (7d, 30d, 90d)?
**Resposta**: **last_30d** para sync inicial, com opção configurável para syncs manuais.

**Justificativa**:
- Dashboard mostra últimos 30 dias por padrão (linha 26 em `/api/dashboard/route.ts`)
- Analytics suporta múltiplos períodos (7d, 14d, 30d, 90d)
- 30 dias balanceia completude de dados vs limites de API
- Pode adicionar parâmetro `period` opcional para flexibilidade

### 5. Como lidar com rate limiting da Meta API?
**Resposta**: Implementar **processamento em lotes com delays** e **exponential backoff**.

**Estratégia**:
- Processar campanhas em lotes de 10 (evita sobrecarregar API)
- Adicionar delay de 500ms entre lotes (padrão existente em `meta_api.py` linha 97)
- Capturar erros de rate limit (já implementado em `meta_api.py` linhas 67-73)
- Retornar sucesso parcial se algumas campanhas falharem
- Armazenar timestamp de último sync para evitar syncs redundantes

### 6. Atualizar métricas existentes ou criar novas?
**Resposta**: **Estratégia upsert** - atualizar se existir para mesma data, criar se nova.

**Justificativa**:
- `CampaignMetric` tem constraint única em `[campaignId, date]` (linha 179 em `schema.prisma`)
- Insights da Meta API são agregados por data
- Permite re-sincronizar para atualizar métricas sem duplicatas
- Segue padrão de sync de campanhas em `/api/sync/route.ts` (linha 123 - upsert)

### 7. Executar via cron job ou manual?
**Resposta**: **Manual inicialmente**, com opção de adicionar sync agendado depois.

**Implementação**:
- Fase 1: Sync manual via botão "Sincronizar" (existente)
- Fase 2 (opcional): Adicionar cron job para auto-sync diário
- Armazenar timestamp `lastSyncedAt` para mostrar atualização na UI

---

## 🎯 Plano de Implementação (Passo a Passo)

### Fase 1: Backend - Melhorar Endpoint Sync

**Arquivo**: `backend/app/api/sync.py`

**Mudanças necessárias**:

1. **Atualizar endpoint `POST /api/sync/metrics`** (linhas 57-96):
   - Aceitar parâmetro opcional `date_preset` (padrão: "last_30d")
   - Adicionar lógica de processamento em lotes com delays
   - Retornar resultados detalhados incluindo erros por campanha
   - Adicionar tratamento de rate limit com sucesso parcial

2. **Criar função helper `sync_campaign_metrics_batch()`**:
   ```python
   async def sync_campaign_metrics_batch(
       campaigns: list,
       date_preset: str = "last_30d",
       batch_size: int = 10
   ) -> dict:
       # Processar campanhas em lotes
       # Adicionar delays entre lotes
       # Tratar rate limiting graciosamente
       # Retornar resultados detalhados
   ```

3. **Atualizar endpoint `POST /api/sync/full`** (linhas 99-115):
   - Chamar sync de métricas após sync de campanhas
   - Retornar resultados combinados
   - Adicionar informações de timing

**Comportamento esperado**:
```json
{
  "success": true,
  "campaigns_synced": 45,
  "metrics_synced": 42,
  "metrics_failed": 3,
  "errors": ["Campaign X: rate limit", "Campaign Y: no data"],
  "period": "last_30d",
  "sync_duration_seconds": 23.5
}
```

---

### Fase 2: Frontend - Melhorar Rota Sync

**Arquivo**: `frontend/src/app/api/sync/route.ts`

**Mudanças necessárias (linhas 116-151)**:

1. **Após sync de campanhas, chamar endpoint de métricas do backend**:
   ```typescript
   // Após linha 151, adicionar sync de métricas
   const metricsResponse = await fetch(
     `${backendUrl}/api/sync/metrics?date_preset=last_30d`,
     { method: 'POST', ... }
   );
   ```

2. **Processar dados de métricas e salvar no banco**:
   ```typescript
   for (const metric of metricsData) {
     await prisma.campaignMetric.upsert({
       where: {
         campaignId_date: {
           campaignId: campaign.id,
           date: new Date(metric.date)
         }
       },
       update: { /* campos de métrica */ },
       create: { /* campos de métrica */ }
     });
   }
   ```

3. **Retornar resultados de sync combinados**:
   ```typescript
   {
     success: true,
     campaigns_synced: 45,
     metrics_synced: 42,
     message: "Sincronizadas 45 campanhas e 42 métricas"
   }
   ```

---

### Fase 3: Função Helper de Database

**Arquivo**: Criar `frontend/src/lib/sync-metrics.ts`

**Propósito**: Extrair lógica de sync de métricas para função reutilizável

**Assinatura da função**:
```typescript
export async function syncCampaignMetrics(
  userId: string,
  campaigns: Campaign[],
  period: string = 'last_30d'
): Promise<{
  synced: number;
  errors: string[];
}>;
```

**Benefícios**:
- Separação de responsabilidades
- Lógica testável
- Reutilizável para cron jobs ou syncs manuais
- Tratamento de erros facilitado

---

### Fase 4: Tratamento de Erros & Rate Limiting

**Melhorias necessárias**:

1. **Exponential backoff para rate limits**:
   ```typescript
   async function retryWithBackoff(
     fn: () => Promise<any>,
     maxRetries: number = 3
   ): Promise<any> {
     // Implementar exponential backoff
   }
   ```

2. **Tratamento de sucesso parcial**:
   - Continuar processando campanhas restantes se uma falhar
   - Coletar erros mas não falhar sync inteiro
   - Retornar relatório detalhado de erros

3. **Detecção de rate limit**:
   - Verificar código de erro 80004 da Meta API
   - Adicionar delay antes de retry
   - Pular campanha e ir para próxima se rate limited

---

### Fase 5: Melhorias na UI Frontend (Opcional)

**Arquivo**: `frontend/src/app/(dashboard)/campaigns/page.tsx`

**Mudanças (linhas 202-249)**:

1. **Adicionar status de sync de métricas ao toast**:
   ```typescript
   toast.success('Campanhas e métricas sincronizadas!', {
     description: `${data.campaigns_synced} campanhas, ${data.metrics_synced} métricas`,
   });
   ```

2. **Mostrar timestamp de último sync**:
   ```typescript
   <p className="text-xs text-muted-foreground">
     Última sincronização: {lastSyncTime}
   </p>
   ```

3. **Adicionar seletor de período de sync (opcional)**:
   ```typescript
   <Select value={syncPeriod} onValueChange={setSyncPeriod}>
     <SelectItem value="last_7d">Últimos 7 dias</SelectItem>
     <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
     <SelectItem value="last_90d">Últimos 90 dias</SelectItem>
   </Select>
   ```

---

### Fase 6: Transformação de Dados

**Transformações chave necessárias**:

1. **Resposta Meta API → Formato Database**:
   ```typescript
   // Meta API retorna:
   {
     "impressions": "1234",
     "clicks": "56",
     "spend": "123.45",
     "ctr": "4.55",
     "cpc": "2.20"
   }

   // Transformar para:
   {
     impressions: 1234,
     clicks: 56,
     spend: 123.45,
     ctr: 4.55,
     cpc: 2.20,
     conversions: 0,
     reach: 0
   }
   ```

2. **Tratar campos faltantes**:
   - Valores padrão para métricas ausentes
   - Tratamento de null para campos opcionais (cpc, ctr, cpm, roas)
   - Parsear números em string para integers/floats

3. **Tratamento de datas**:
   - Meta API retorna strings de data
   - Converter para objetos Date do Prisma
   - Garantir consistência de timezone (UTC)

---

## 📊 Diagrama de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA "SINCRONIZAR"                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/sync                                        │
│  - Autentica usuário                                             │
│  - Chama backend para campanhas                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: GET /api/campaigns/                                    │
│  - Chama Meta API list_campaigns()                               │
│  - Retorna campos básicos de campanha                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Upsert campanhas na tabela Campaign                   │
│  - Cria novas campanhas                                          │
│  - Atualiza campanhas existentes                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/sync/metrics (NOVO)                         │
│  - Envia lista de IDs de campanhas                               │
│  - Solicita período (last_30d)                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: POST /api/sync/metrics                                 │
│  - Loop pelas campanhas                                          │
│  - Chama get_campaign_insights() para cada                       │
│  - Trata rate limiting                                           │
│  - Retorna resultados agregados                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Meta API: GET /{campaign_id}/insights                           │
│  - Retorna métricas para range de datas                          │
│  - Campos: spend, impressions, clicks, etc.                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Transformar & Upsert na tabela CampaignMetric         │
│  - Parsear data dos insights                                     │
│  - Transformar números em string para tipos                      │
│  - Upsert por (campaignId, date)                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Sucesso! Dashboard & Analytics mostram dados reais              │
│  - /api/dashboard lê de CampaignMetric                           │
│  - /api/analytics agrega métricas                                │
│  - Gráficos populam com dados reais                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗓️ Sequência de Implementação

### Sprint 1: Funcionalidade Core de Sync
1. Atualizar endpoint backend `/api/sync/metrics`
2. Implementar fetch e transformação de métricas
3. Testar com campanha única
4. Verificar dados aparecem no banco

### Sprint 2: Integração Frontend
5. Atualizar rota frontend `/api/sync`
6. Adicionar chamada de sync de métricas após sync de campanhas
7. Implementar lógica de upsert no banco
8. Testar fluxo end-to-end

### Sprint 3: Tratamento de Erros & Otimização
9. Adicionar tratamento de rate limiting
10. Implementar processamento em lotes
11. Adicionar exponential backoff
12. Tratar falhas parciais graciosamente

### Sprint 4: UI & Experiência do Usuário
13. Atualizar feedback do botão sync
14. Adicionar display de timestamp de último sync
15. Mostrar progresso/status de sync
16. Adicionar notificações de erro

### Sprint 5: Testes & Validação
17. Escrever testes unitários
18. Escrever testes de integração
19. Testes manuais com dados reais
20. Testes de performance com 100+ campanhas

---

## ⚠️ Avaliação de Riscos & Mitigação

### Riscos Altos:

1. **Rate Limiting da Meta API**
   - **Risco**: Sync falha para usuários com muitas campanhas
   - **Mitigação**: Processamento em lotes, delays, exponential backoff, sucesso parcial

2. **Inconsistência de Dados**
   - **Risco**: Métricas dessincronizadas com Meta
   - **Mitigação**: Timestamps, opção de re-sync forçado, mensagens de erro claras

3. **Problemas de Performance**
   - **Risco**: Sync lento para contas grandes (200+ campanhas)
   - **Mitigação**: Fila de jobs em background, paginação, indicador de progresso

### Riscos Médios:

4. **Problemas de Data/Timezone**
   - **Risco**: Métricas aparecem em datas erradas
   - **Mitigação**: Usar UTC consistentemente, testar em múltiplos timezones

5. **Campos Ausentes/Null**
   - **Risco**: Meta API não retorna todos campos
   - **Mitigação**: Valores padrão, tratamento de null, validação

### Riscos Baixos:

6. **Constraints de Database**
   - **Risco**: Violações de constraint única
   - **Mitigação**: Padrão upsert já trata isso

---

## 📏 Métricas de Sucesso

Após implementação, verificar:

1. ✅ Dashboard mostra valores não-zero para spend, impressões, cliques
2. ✅ Gráficos de Analytics populam com dados
3. ✅ Métricas atualizam quando campanhas têm novos dados
4. ✅ Sem métricas duplicadas para mesma data
5. ✅ Sync completa em < 30 segundos para 50 campanhas
6. ✅ Rate limiting tratado graciosamente
7. ✅ Mensagens de erro claras e acionáveis
8. ✅ Botão sync fornece feedback sobre sucesso/falha

---

## 🚀 Melhorias Futuras (Opcional)

1. **Sync Agendado**:
   - Adicionar cron job para sincronizar métricas diariamente
   - Frequência de sync configurável em settings
   - Notificações por email em falhas de sync

2. **Atualizações em Tempo Real**:
   - Conexão WebSocket para métricas ao vivo
   - Auto-refresh do dashboard quando sync completa
   - Push notifications para mudanças de métricas

3. **Seleção Avançada de Período**:
   - Seletor de range de datas customizado
   - Comparar períodos lado a lado
   - Políticas de retenção de dados históricos

4. **Otimizações de Performance**:
   - Cache de dados de insights
   - Sync incremental (só datas novas)
   - Processamento paralelo com pool de workers

---

## 📁 Arquivos Críticos para Implementação

Baseado neste plano, aqui estão os 5 arquivos mais críticos para modificar:

1. **`backend/app/api/sync.py`** - Lógica core de sync
   - **Motivo**: Adicionar endpoint de sync de métricas, processamento em lotes, rate limit
   - **Linhas para modificar**: 57-96 (função sync_metrics), 99-115 (função full_sync)

2. **`frontend/src/app/api/sync/route.ts`** - Orquestração de sync no frontend
   - **Motivo**: Chamar endpoint de métricas do backend, salvar no banco, retornar resultados
   - **Linhas para modificar**: Após linha 151 (adicionar lógica de sync de métricas)

3. **`backend/app/tools/meta_api.py`** - Integração Meta API (apenas referência)
   - **Motivo**: `get_campaign_insights()` já existe - usar como referência
   - **Linhas para referenciar**: 407-458 (função insights existente)

4. **`frontend/prisma/schema.prisma`** - Schema do banco (apenas referência)
   - **Motivo**: Entender estrutura do model CampaignMetric para upsert
   - **Linhas para referenciar**: 159-183 (model CampaignMetric)

5. **`frontend/src/app/api/dashboard/route.ts`** - Endpoint de validação
   - **Motivo**: Verificar métricas aparecem corretamente após sync (sem mudanças necessárias)
   - **Linhas para testar**: 23-31 (query de métricas), 39-76 (cálculos de métricas)

---

## ✅ Próximo Passo

Este plano fornece uma abordagem abrangente, passo a passo, para implementar sincronização de insights da Meta API seguindo padrões existentes, tratando casos extremos e mantendo qualidade de código.

**Implementação pode ser feita incrementalmente com pontos de validação claros em cada fase.**

**Agent ID para retomar**: a0209dc
