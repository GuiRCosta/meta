# 🔍 Diagnóstico - Erro 500 em /api/campaigns

## 🐛 Problema

O endpoint `/api/campaigns` está retornando erro 500 (Internal Server Error).

## 🔍 Possíveis Causas

### 1. ❌ **Arquivo `.env.local` não encontrado ou `DATABASE_URL` não configurado**

O Prisma precisa de `DATABASE_URL` para conectar ao banco de dados. Se não estiver configurado, causará erro 500.

**Solução:**
1. Verificar se existe `.env.local` em `frontend/`:
   ```bash
   cd frontend
   ls -la .env.local
   ```

2. Se não existir, criar baseado no `env.example.txt`:
   ```bash
   cp ../env.example.txt frontend/.env.local
   ```

3. Configurar `DATABASE_URL` com a string de conexão do Supabase

### 2. ❌ **Prisma Client não gerado**

Se o Prisma Client não foi gerado após mudanças no schema, pode causar erros.

**Solução:**
```bash
cd frontend
npm run db:generate
```

### 3. ❌ **Erro na autenticação/sessão**

Se a sessão não for encontrada ou o `userId` não estiver disponível.

**Já corrigido:** Agora há logs detalhados para verificar isso.

### 4. ❌ **Erro no banco de dados**

Erro ao executar query no Prisma.

**Já corrigido:** Agora há try-catch específico para erros do banco.

## ✅ O que foi feito

1. **Logs detalhados adicionados**:
   - Log quando busca campanhas
   - Log quando encontra campanhas
   - Log de erros específicos do banco
   - Log completo do erro com stack trace

2. **Tratamento de erros melhorado**:
   - Retorna detalhes do erro (em desenvolvimento)
   - Stack trace visível no console

## 🔍 Como Verificar o Erro Real

1. **Verificar o console do servidor Next.js** (terminal onde está rodando `npm run dev`):
   - Você verá logs como "GET /api/campaigns - Iniciando..."
   - Verá onde o erro está acontecendo

2. **Verificar o console do navegador** (F12):
   - Agora mostra detalhes do erro na resposta
   - Stack trace em desenvolvimento

## 🚀 Próximos Passos

1. **Criar/verificar `.env.local`**:
   ```bash
   cd frontend
   # Se não existir, copiar do exemplo
   cp ../env.example.txt .env.local
   # Editar e configurar DATABASE_URL
   ```

2. **Verificar variáveis de ambiente**:
   ```bash
   cd frontend
   cat .env.local | grep DATABASE_URL
   ```

3. **Gerar Prisma Client** (se necessário):
   ```bash
   cd frontend
   npm run db:generate
   ```

4. **Reiniciar o servidor Next.js**:
   ```bash
   # Parar o servidor (Ctrl+C)
   # Iniciar novamente
   npm run dev
   ```

5. **Testar novamente**:
   - Abrir http://localhost:3000/campaigns
   - Verificar console do servidor para ver os logs
   - Verificar console do navegador para ver os detalhes do erro

## 📝 Logs Esperados

Com os logs adicionados, você deve ver no console do servidor:

```
GET /api/campaigns - Iniciando...
Session: Existe <user-id>
Buscando campanhas com filtro: { userId: '...' }
Encontradas X campanhas de Y total
Retornando campanhas formatadas: X
```

Ou, se houver erro:

```
Error fetching campaigns: <erro>
Error details: { message: '...', stack: '...' }
```

## ⚠️ Se o Erro Persistir

1. Verifique os logs completos no terminal do Next.js
2. Compartilhe o erro completo (message + stack)
3. Verifique se o banco de dados está acessível
4. Verifique se o Prisma Client está atualizado
