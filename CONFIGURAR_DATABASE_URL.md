# 🔧 Configurar DATABASE_URL - Instruções

## ⚠️ Problema Identificado

O Prisma não está conseguindo ler `DATABASE_URL` do arquivo `.env.local`. Isso causa erro 500 no endpoint `/api/campaigns`.

## 🔍 Diagnóstico

1. ✅ Arquivo `.env.local` existe
2. ✅ NEXTAUTH_URL e AUTH_SECRET configurados
3. ❌ **DATABASE_URL com valores de exemplo** (`PROJETO:SENHA`)
4. ❌ Prisma não consegue conectar ao banco (credenciais inválidas)

## ✅ Solução

### Passo 1: Obter Credenciais do Supabase

1. **Acesse**: https://supabase.com/dashboard
2. **Crie conta** ou faça login
3. **Crie um novo projeto** (ou use um existente)
4. **Aguarde** o projeto ser criado (1-2 minutos)

### Passo 2: Copiar Credenciais

1. **No painel do projeto**, vá em **Settings** (⚙️)
2. **Database**:
   - **Connection string**: Use **"Connection pooling"**
   - **Copie a string** (formato: `postgresql://postgres.xxx:xxx@...`)
   - **Copie também a "Direct connection"**
3. **API**:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: Copie a chave

### Passo 3: Configurar no .env.local

Abra o arquivo `frontend/.env.local` e substitua:

```env
# ANTES (valores de exemplo):
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# DEPOIS (com suas credenciais reais):
DATABASE_URL="postgresql://postgres.abc123xyz:SUA_SENHA_REAL@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abc123xyz:SUA_SENHA_REAL@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://abc123xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua-chave-real-aqui"
```

**⚠️ Importante**: 
- **NÃO inclua espaços** antes ou depois do `=`
- **Mantenha as aspas** ao redor dos valores
- **Não compartilhe** essas credenciais publicamente

### Passo 4: Reiniciar o Servidor

```bash
# 1. Parar o servidor Next.js (Ctrl+C no terminal)

# 2. Reiniciar
cd frontend
npm run dev

# 3. Aguardar alguns segundos para o servidor iniciar
```

### Passo 5: Configurar o Banco de Dados

```bash
cd frontend

# Gerar Prisma Client
npm run db:generate

# Enviar schema para o banco (cria as tabelas)
npm run db:push

# Popular banco com dados de exemplo (usuário admin)
npm run db:seed
```

### Passo 6: Testar

1. Acesse: http://localhost:3000
2. Faça login com:
   - Email: `admin@metacampaigns.com`
   - Senha: `admin123`
3. Acesse: http://localhost:3000/campaigns
4. Verifique se o erro 500 foi resolvido

## 🔍 Verificações

### Verificar se DATABASE_URL está carregado:

No terminal do Next.js, você deve ver nos logs:
- Sem erros de "Environment variable not found"
- Prisma conectando ao banco

### Testar Conexão do Prisma:

```bash
cd frontend
npm run db:studio
```

Se o Prisma Studio abrir, significa que a conexão está funcionando! ✅

## 📝 Resumo

1. ✅ Arquivo `.env.local` criado
2. ✅ NEXTAUTH_URL e AUTH_SECRET configurados
3. ⚠️ **Precisa configurar credenciais reais do Supabase**
4. ⚠️ **Depois: reiniciar servidor e executar `npm run db:push`**

## 💡 Dica

Se você ainda não tem conta no Supabase:
- É **gratuito** até certo limite
- Demora ~2 minutos para criar o projeto
- Você pode usar o plano gratuito para desenvolvimento

## ✅ Após Configurar

Quando você configurar as credenciais reais e reiniciar o servidor:
- ✅ O erro 500 deve ser resolvido
- ✅ O endpoint `/api/campaigns` deve funcionar
- ✅ A página de campanhas deve carregar corretamente

**Configure as credenciais do Supabase e teste novamente!** 🚀
