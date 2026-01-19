# 🔐 Resolver Problema de Login

## ✅ Status Atual

A senha do usuário admin foi **corrigida com sucesso** no banco de dados:
- ✅ Email: `admin@metacampaigns.com`
- ✅ Senha: `admin123`
- ✅ Hash bcrypt correto no banco
- ✅ Teste direto de login funciona

## 🔄 Solução: Reiniciar Servidor Next.js

O servidor Next.js precisa ser **reiniciado** para recarregar:
- Prisma Client atualizado
- Variáveis de ambiente
- Cache do NextAuth

### Como Reiniciar:

1. **Parar o servidor atual:**
   ```bash
   # Pressione Ctrl+C no terminal onde o servidor está rodando
   # OU execute:
   pkill -f "next dev"
   ```

2. **Iniciar novamente:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Testar o login:**
   - Acesse: http://localhost:3000/login
   - Email: `admin@metacampaigns.com`
   - Senha: `admin123`

## 🔍 Verificação

Se após reiniciar ainda não funcionar, verifique:

### 1. Logs do Servidor

Os logs do NextAuth devem aparecer no terminal do servidor quando você tentar fazer login:
```
Auth attempt with: admin@metacampaigns.com
Login successful! admin@metacampaigns.com
```

Se aparecer:
- `User not found:` → Problema de conexão com banco
- `Invalid password for:` → Senha ainda está incorreta
- `Auth error:` → Erro no código de autenticação

### 2. Console do Navegador

Abra o DevTools (F12) e verifique se há erros no console.

### 3. Verificar Variáveis de Ambiente

Certifique-se de que `.env.local` existe e tem:
- `DATABASE_URL` configurado corretamente
- `AUTH_SECRET` configurado
- `NEXTAUTH_URL=http://localhost:3000`

## 📝 Scripts Úteis

### Testar Senha Diretamente:
```bash
cd frontend
node test-login-direct.js
```

### Corrigir Senha Novamente:
```bash
cd frontend
node fix-admin-password.js
```

### Regenerar Prisma Client:
```bash
cd frontend
npx prisma generate
```

## ✅ Próximos Passos

Após reiniciar o servidor:
1. Tente fazer login novamente
2. Se funcionar, você será redirecionado para o dashboard
3. Verá as 12 campanhas sincronizadas da Meta

---

**Status:** Senha corrigida ✅ | Servidor precisa ser reiniciado 🔄
