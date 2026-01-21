# 🔄 Como Sincronizar Campanhas Agora

**Status**: ✅ Sistema pronto para sincronizar com suporte a DRAFT
**Data**: 2026-01-20

---

## 🎯 Objetivo

Sincronizar todas as campanhas do Meta (incluindo rascunhos) para o banco de dados local.

---

## 📋 Passo a Passo

### 1. Abrir o Frontend

```
http://localhost:3000
```

### 2. Fazer Login

- **Email**: `admin@metacampaigns.com`
- **Senha**: `admin123`

### 3. Clicar no Botão "Sincronizar"

- Localizado no **header** (topo da página)
- Ícone de sincronização (refresh/reload)

### 4. Aguardar a Sincronização

Você verá uma mensagem como:
```
"Sincronizadas X de Y campanhas"
```

### 5. Verificar os Resultados

Após a sincronização:
- Ir em **"Campanhas"** no menu lateral
- Verificar se há campanhas com badge **azul "Rascunho"**
- Contar o total de campanhas (deve estar próximo de 164)

---

## ✅ O Que Esperar

### Antes da Sincronização
```
Banco: 170 campanhas
├── PAUSED: 165
├── ACTIVE: 3
└── ARCHIVED: 2
```

### Depois da Sincronização
```
Banco: ~164 campanhas (pode variar)
├── PAUSED: X
├── ACTIVE: Y
├── DRAFT: Z (NOVO!)
├── PREPAUSED: W (se houver)
└── ARCHIVED: 2
```

**Frontend mostrará**: ~162 campanhas (excluindo as 2 arquivadas)

---

## 🎨 Badges Visuais

Após sincronizar, você verá:

- 🟢 **Verde** - Campanhas ativas
- ⚪ **Cinza** - Campanhas pausadas
- 🔵 **Azul** - Campanhas em rascunho (NOVO!)
- 🟠 **Laranja** - Campanhas pré-pausadas (NOVO!)

---

## 🐛 Se Algo Der Errado

### Erro: "Erro ao conectar com backend"
**Solução**: Verificar se backend está rodando
```bash
curl http://localhost:8000/health
```

### Erro: "Muitas requisições"
**Solução**: Aguardar 2-3 minutos e tentar novamente

### Campanhas não aparecem
**Solução**: Atualizar a página (F5)

---

## 📊 Como Verificar Status no Banco

```bash
cd frontend
DATABASE_URL="postgresql://postgres:IDEVA@go2025@db.dqwefmgqdfzgtmahsvds.supabase.co:6543/postgres?pgbouncer=true" npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.campaign.groupBy({ by: ['status'], _count: { _all: true } })
  .then(r => {
    console.log('Status no banco:');
    r.forEach(s => console.log('  ', s.status, ':', s._count._all));
  })
  .finally(() => p.\$disconnect());
"
```

---

## ✅ Checklist de Validação

Após sincronizar, verificar:

- [ ] Total de campanhas mudou?
- [ ] Há campanhas com badge azul "Rascunho"?
- [ ] Campanhas arquivadas NÃO aparecem na lista?
- [ ] Número se aproxima dos 164 do Meta BM?

---

## 💡 Próximos Passos

Depois de sincronizar e verificar:

1. **Comparar números**: Frontend vs Meta BM
2. **Testar filtros**: Ver se consegue filtrar por status
3. **Criar campanha em rascunho** no Meta e sincronizar novamente

---

**Última atualização**: 2026-01-20
**Servidores rodando**:
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:8000
