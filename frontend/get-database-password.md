# 🔑 Obter Senha do Banco de Dados

## ✅ Status Atual

- ✅ `NEXT_PUBLIC_SUPABASE_URL` configurado: `https://dqwefmgqdfzgtmahsvds.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- ✅ Conexão via Supabase Client funcionando
- ⚠️ `DATABASE_URL` ainda precisa da senha do banco

## 📝 Como Obter a Senha do Banco

### Opção 1: Via Dashboard do Supabase

1. **Acesse**: https://supabase.com/dashboard/project/dqwefmgqdfzgtmahsvds
2. **Vá em**: Settings → Database
3. **Copie a Connection String**:
   - Use **"Connection pooling"** (porta 6543) para `DATABASE_URL`
   - Use **"Direct connection"** (porta 5432) para `DIRECT_URL`
4. **Cole no `.env.local`**

### Opção 2: Resetar a Senha (se necessário)

1. No dashboard, vá em **Settings → Database**
2. Clique em **"Reset Database Password"**
3. Copie a nova senha
4. Use para construir a connection string

## 🔧 Formato da Connection String

```env
DATABASE_URL="postgresql://postgres.dqwefmgqdfzgtmahsvds:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.dqwefmgqdfzgtmahsvds:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

Substitua `SENHA` pela senha real do banco de dados.

## ✅ Após Configurar

Execute novamente:
```bash
cd frontend
node test-database.js
```
