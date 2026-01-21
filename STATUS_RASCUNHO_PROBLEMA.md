# 🐛 PROBLEMA CRÍTICO: Status "Rascunho" Não Sincronizado

**Data**: 2026-01-20
**Severidade**: 🔴 ALTA
**Impacto**: Campanhas em rascunho no Meta BM não aparecem no frontend

---

## 🎯 PROBLEMA IDENTIFICADO

### Evidência da Screenshot
- Meta BM mostra campanhas com status **"Em rascunho"**
- Essas campanhas **NÃO** estão sendo sincronizadas para o banco local
- Frontend não mostra campanhas em rascunho

### Status do Meta que NÃO são sincronizados

| Status no Meta | `effective_status` | Sincronizado? |
|----------------|-------------------|---------------|
| Em rascunho | `PREVIEW` | ❌ **NÃO** |
| Em rascunho | `DRAFT` | ❌ **NÃO** |
| Pré-pausado | `PREPAUSED` | ❌ **NÃO** |

---

## 🔍 CAUSA RAIZ

### Backend Filtra Rascunhos por Padrão

**Arquivo**: `/Users/guilhermecosta/Projetos/meta/backend/app/tools/meta_api.py`

**Linha 144**:
```python
# Filtrar rascunhos se não solicitado
if not include_drafts:
    campaigns = [c for c in campaigns if
        c.get("effective_status") not in ["PREVIEW", "DRAFT"] and
        c.get("status") != "PREPAUSED"]
```

**Parâmetro**: `include_drafts` (default: `False`)

### Frontend Não Solicita Rascunhos

**Arquivo**: `/Users/guilhermecosta/Projetos/meta/frontend/src/app/api/sync/route.ts`

**Linha 45**:
```typescript
response = await fetch(`${backendUrl}/api/campaigns/`, {
  method: 'GET',
  // NÃO passa include_drafts=true
});
```

**Resultado**: Backend filtra e remove todos os rascunhos!

---

## 📊 IMPACTO NA DISCREPÂNCIA

### Análise Numérica

**Meta BM**: 164 campanhas
- Inclui campanhas "Em rascunho" e "Desativado"

**Frontend**: 168 campanhas
- **NÃO** inclui campanhas em rascunho (filtradas pelo backend)
- Inclui 4 campanhas "fantasmas" (deletadas no Meta)

**Banco Local**: 170 campanhas
- 0 campanhas com status DRAFT (foram filtradas na sincronização)
- 2 campanhas ARCHIVED (filtradas no frontend)

### A Matemática NÃO Fecha!

Se há campanhas em rascunho no Meta, elas deveriam:
1. Aparecer na contagem do Meta BM (164) ✅
2. Ser sincronizadas para o banco local ❌ **FILTRADAS**
3. Aparecer no frontend ❌ **NÃO ESTÃO NO BANCO**

**Isso significa**:
- Número de rascunhos no Meta BM: **Desconhecido**
- Se há 10 rascunhos no Meta → Banco deveria ter 180, mas tem 170
- A diferença 168 vs 164 **NÃO** inclui rascunhos (porque foram filtrados)

---

## 🚨 PROBLEMA ADICIONAL: Falta Enum de Status

### Schema Atual (Incorreto)

**Arquivo**: `frontend/prisma/schema.prisma` (linha 91)

```prisma
model Campaign {
  // ...
  status          String           @default("PAUSED")
  // ...
}
```

**Problema**: Status é String livre, permite qualquer valor!

### Schema Correto (Deveria Ser)

```prisma
enum CampaignStatus {
  ACTIVE
  PAUSED
  ARCHIVED
  DRAFT        // ⬅️ FALTANDO!
  PREPAUSED    // ⬅️ FALTANDO!
}

model Campaign {
  // ...
  status          CampaignStatus   @default(PAUSED)
  // ...
}
```

---

## 🎯 SOLUÇÕES

### Solução 1: Adicionar Status DRAFT (Recomendado)

#### Passo 1: Atualizar Schema Prisma

**Arquivo**: `frontend/prisma/schema.prisma`

**ANTES (linha 91)**:
```prisma
status          String           @default("PAUSED")
```

**DEPOIS**:
```prisma
enum CampaignStatus {
  ACTIVE
  PAUSED
  ARCHIVED
  DRAFT
  PREPAUSED
}

// ... no model Campaign:
status          CampaignStatus   @default(PAUSED)
```

#### Passo 2: Migração do Banco de Dados

```bash
cd frontend
npx prisma migrate dev --name add-campaign-status-enum
```

**Ou se preferir sem migrações**:
```bash
npx prisma db push
```

#### Passo 3: Habilitar Sincronização de Rascunhos

**Arquivo**: `frontend/src/app/api/sync/route.ts` (linha 45)

**ANTES**:
```typescript
response = await fetch(`${backendUrl}/api/campaigns/`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  signal: AbortSignal.timeout(10000),
});
```

**DEPOIS**:
```typescript
response = await fetch(`${backendUrl}/api/campaigns/?include_drafts=true`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  signal: AbortSignal.timeout(10000),
});
```

#### Passo 4: Mapear Status Corretamente

**Arquivo**: `frontend/src/app/api/sync/route.ts` (linha ~155)

**ANTES**:
```typescript
await prisma.campaign.upsert({
  where: { metaId: metaCampaign.id },
  create: {
    metaId: metaCampaign.id,
    userId: session.user.id,
    name: metaCampaign.name || 'Sem nome',
    objective: metaCampaign.objective || 'UNKNOWN',
    status: metaCampaign.status || 'PAUSED',  // ❌ Pode vir DRAFT do Meta!
    // ...
  },
  update: {
    name: metaCampaign.name,
    objective: metaCampaign.objective,
    status: metaCampaign.status,  // ❌ Pode vir DRAFT do Meta!
    // ...
  },
});
```

**DEPOIS**:
```typescript
// Mapear effective_status do Meta para nosso enum
const mapMetaStatus = (metaStatus: string, effectiveStatus: string): string => {
  // Priorizar effective_status (mais preciso)
  if (effectiveStatus === 'PREVIEW' || effectiveStatus === 'DRAFT') {
    return 'DRAFT';
  }
  if (metaStatus === 'PREPAUSED') {
    return 'PREPAUSED';
  }
  if (effectiveStatus === 'ACTIVE') {
    return 'ACTIVE';
  }
  if (effectiveStatus === 'PAUSED' || metaStatus === 'PAUSED') {
    return 'PAUSED';
  }
  if (effectiveStatus === 'ARCHIVED' || metaStatus === 'ARCHIVED') {
    return 'ARCHIVED';
  }
  return 'PAUSED'; // Fallback
};

const mappedStatus = mapMetaStatus(
  metaCampaign.status,
  metaCampaign.effective_status
);

await prisma.campaign.upsert({
  where: { metaId: metaCampaign.id },
  create: {
    metaId: metaCampaign.id,
    userId: session.user.id,
    name: metaCampaign.name || 'Sem nome',
    objective: metaCampaign.objective || 'UNKNOWN',
    status: mappedStatus,  // ✅ Status correto!
    // ...
  },
  update: {
    name: metaCampaign.name,
    objective: metaCampaign.objective,
    status: mappedStatus,  // ✅ Status correto!
    // ...
  },
});
```

#### Passo 5: Atualizar Filtro do Frontend

**Arquivo**: `frontend/src/app/api/campaigns/route.ts` (linha 77-78)

**ANTES**:
```typescript
// Quando status é 'all' ou não especificado, excluir campanhas arquivadas
where.status = { not: 'ARCHIVED' };
```

**DEPOIS**:
```typescript
// Quando status é 'all' ou não especificado, excluir apenas arquivadas
// (mas incluir DRAFT, PREPAUSED, ACTIVE, PAUSED)
where.status = { not: 'ARCHIVED' };
```

**Status visíveis no frontend**:
- ✅ ACTIVE
- ✅ PAUSED
- ✅ DRAFT (novo!)
- ✅ PREPAUSED (novo!)
- ❌ ARCHIVED (sempre filtrado)

#### Passo 6: Atualizar UI para Mostrar Status DRAFT

**Arquivo**: `frontend/src/app/(dashboard)/campaigns/page.tsx`

Adicionar indicador visual para rascunhos:

```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Ativo</Badge>;
    case 'PAUSED':
      return <Badge variant="warning">Pausado</Badge>;
    case 'DRAFT':
      return <Badge variant="secondary">Rascunho</Badge>;
    case 'PREPAUSED':
      return <Badge variant="secondary">Pré-pausado</Badge>;
    case 'ARCHIVED':
      return <Badge variant="default">Arquivado</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};
```

---

### Solução 2: Apenas Documentar (Temporário)

Se não quiser alterar código agora:

1. Documentar que campanhas em rascunho **não são sincronizadas**
2. Adicionar nota na UI: "Campanhas em rascunho no Meta não aparecem aqui"
3. Avisar usuário para ativar/pausar campanhas antes de gerenciá-las no sistema

---

## 📊 RESULTADO APÓS IMPLEMENTAR

### Antes (Atual)
```
Meta BM: 164 campanhas (todas, incluindo rascunhos)
Frontend: 168 campanhas (sem rascunhos, com 4 fantasmas)
Banco: 170 campanhas (sem rascunhos, com 4 fantasmas)
```

### Depois (Com Fix)
```
Meta BM: 164 campanhas
Frontend: 164 campanhas (incluindo rascunhos, sem fantasmas)
Banco: 164 campanhas (todos os status sincronizados)

Status suportados:
  ACTIVE: X campanhas
  PAUSED: Y campanhas
  DRAFT: Z campanhas (novo!)
  PREPAUSED: W campanhas (novo!)
  ARCHIVED: 0 (filtrado do frontend)
```

---

## 🎯 PRIORIDADE

**Implementar Solução 1**: ALTA

**Por quê?**
1. Usuários criam campanhas em rascunho no Meta BM
2. Essas campanhas NÃO aparecem no frontend
3. Causa confusão: "Criei campanha mas sumiu!"
4. Status DRAFT é válido e usado pelo Meta

**Benefícios**:
- ✅ Sincronização completa com Meta BM
- ✅ Números batem (164 = 164)
- ✅ Todas as campanhas visíveis
- ✅ Type safety com enum
- ✅ Menos bugs relacionados a status

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] 1. Adicionar enum CampaignStatus no schema.prisma
- [ ] 2. Rodar migração: `npx prisma migrate dev`
- [ ] 3. Adicionar `?include_drafts=true` na chamada do backend
- [ ] 4. Implementar função `mapMetaStatus()`
- [ ] 5. Atualizar upsert com status mapeado
- [ ] 6. Adicionar badges de status na UI
- [ ] 7. Testar sincronização com campanha em rascunho
- [ ] 8. Verificar que números batem (Meta BM = Frontend)

---

## 🧪 TESTE

### Antes do Fix
1. Criar campanha em rascunho no Meta BM
2. Sincronizar no frontend
3. **Resultado**: Campanha NÃO aparece ❌

### Depois do Fix
1. Criar campanha em rascunho no Meta BM
2. Sincronizar no frontend
3. **Resultado**: Campanha aparece com badge "Rascunho" ✅

---

**Última atualização**: 2026-01-20
**Status**: Problema identificado, solução documentada
**Próximo passo**: Implementar enum e sincronização de rascunhos
