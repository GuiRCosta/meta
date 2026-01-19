# 🚀 Deploy no Portainer com Traefik

## Pré-requisitos ✅
- [x] Portainer funcionando
- [x] Traefik configurado na rede `idevanet`
- [x] Evolution API rodando
- [x] Domínio apontando para VPS

---

## 📋 Passo a Passo

### 1️⃣ **Preparar o código na VPS**

```bash
# SSH na VPS
ssh usuario@seu-servidor

# Clone ou faça upload do código
cd /opt
git clone SEU_REPO_GIT meta-campaigns
cd meta-campaigns

# Ou se já tem o código, faça git pull
cd /opt/meta-campaigns
git pull
```

---

### 2️⃣ **Criar arquivo .env**

```bash
cd /opt/meta-campaigns

# Copiar template
cp .env.production .env

# Editar com suas credenciais
nano .env
```

**Variáveis OBRIGATÓRIAS para editar**:
```bash
# Seu domínio
DOMAIN=meta.seudominio.com

# Supabase (você já deve ter)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# OpenAI (CRÍTICO - obter em platform.openai.com)
OPENAI_API_KEY="sk-..."

# Auth (gerar com: openssl rand -base64 32)
AUTH_SECRET="chave-gerada-aqui"

# NextAuth
NEXTAUTH_URL="https://meta.seudominio.com"
FRONTEND_URL="https://meta.seudominio.com"

# Evolution API (ajustar conforme seu setup)
EVOLUTION_API_URL="http://evolution-api:8080"
EVOLUTION_API_KEY="sua-key"
EVOLUTION_INSTANCE="default"
```

---

### 3️⃣ **Criar Stack no Portainer**

**Opção A: Via Git Repository (RECOMENDADO)**
1. Portainer → **Stacks** → **Add stack**
2. Nome: `meta-campaigns`
3. Build method: **Git Repository**
4. Repository URL: `https://github.com/seu-usuario/meta-campaigns`
5. Reference: `main` (ou branch que você usa)
6. Compose path: `docker-compose.yml`
7. **Environment variables**: Carregar do `.env` ou copiar variáveis manualmente
8. Click: **Deploy the stack**

**Opção B: Via Upload**
1. Portainer → **Stacks** → **Add stack**
2. Nome: `meta-campaigns`
3. Build method: **Upload**
4. Upload do arquivo `docker-compose.yml`
5. **Environment variables**: Adicionar manualmente ou via arquivo
6. Click: **Deploy the stack**

**Opção C: Via Web Editor**
1. Portainer → **Stacks** → **Add stack**
2. Nome: `meta-campaigns`
3. Build method: **Web editor**
4. Copiar e colar conteúdo do `docker-compose.yml`
5. **Environment variables**: Adicionar cada uma
6. Click: **Deploy the stack**

---

### 4️⃣ **Configurar Variáveis no Portainer**

No campo **Environment variables**, adicionar:

```env
DOMAIN=meta.seudominio.com
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
AUTH_SECRET=sua-chave-gerada
NEXTAUTH_URL=https://meta.seudominio.com
OPENAI_API_KEY=sk-...
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=sua-key
EVOLUTION_INSTANCE=default
FRONTEND_URL=https://meta.seudominio.com
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
```

---

### 5️⃣ **Verificar Deploy**

Após deploy, verificar no Portainer:

1. **Containers** → Procurar:
   - `meta-campaigns-frontend` - Status: **Running** (verde)
   - `meta-campaigns-backend` - Status: **Running** (verde)

2. **Logs** (click no container):
   - Frontend: Deve mostrar `✓ Ready in XXXms`
   - Backend: Deve mostrar `Uvicorn running on http://0.0.0.0:8000`

---

### 6️⃣ **Testar Acesso**

```bash
# Teste 1: Acesso via domínio
curl -I https://meta.seudominio.com
# Deve retornar: HTTP/2 200

# Teste 2: Backend health (interno)
docker exec meta-campaigns-backend curl http://localhost:8000/health
# Deve retornar: {"status":"healthy"}

# Teste 3: Acessar no navegador
# https://meta.seudominio.com
# Deve carregar a página de login
```

---

## 🚨 Troubleshooting

### ❌ Container não inicia

**Verificar logs**:
```bash
docker logs meta-campaigns-frontend
docker logs meta-campaigns-backend
```

**Erros comuns**:
- `DATABASE_URL not set` → Variável de ambiente faltando
- `OPENAI_API_KEY not set` → Falta configurar key
- `network idevanet not found` → Rede não existe

**Solução**:
```bash
# Verificar redes
docker network ls | grep idevanet

# Se não existir, criar
docker network create idevanet
```

---

### ❌ Traefik não roteia

**Verificar labels**:
```bash
docker inspect meta-campaigns-frontend | grep -A 20 Labels
```

**Deve mostrar**:
- `traefik.enable=true`
- `traefik.http.routers.meta-frontend.rule=Host(...)`

**Verificar entrypoints do Traefik**:
- Certifique-se que Traefik tem `web` (porta 80) e `websecure` (porta 443)

---

### ❌ SSL/HTTPS não funciona

**Verificar certresolver**:
- Label usa `letsencrypt` como certresolver
- Seu Traefik deve ter um certresolver com esse nome

**Se seu Traefik usa outro nome** (ex: `myresolver`), editar `docker-compose.yml`:
```yaml
- "traefik.http.routers.meta-frontend.tls.certresolver=myresolver"
```

---

### ❌ Erro 502 Bad Gateway

**Causa**: Frontend não conseguiu iniciar

**Verificar**:
```bash
# Health check
docker inspect meta-campaigns-frontend | grep -A 5 Health

# Se unhealthy, ver logs
docker logs meta-campaigns-frontend --tail 100
```

---

## 📊 Recursos Configurados

**Frontend**:
- CPU: 1-2 cores
- RAM: 1-2GB
- Rede: `idevanet` + `meta-network`

**Backend**:
- CPU: 1-2 cores
- RAM: 1-2GB
- Rede: `meta-network` + `idevanet` (read-only)

---

## 🔄 Atualizar Stack

```bash
# Na VPS
cd /opt/meta-campaigns
git pull

# No Portainer
Stacks → meta-campaigns → Update the stack → Pull latest image → Update
```

---

## ✅ Checklist Final

- [ ] Código está na VPS (`/opt/meta-campaigns`)
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] OpenAI API Key configurada
- [ ] Domínio aponta para VPS
- [ ] Stack criada no Portainer
- [ ] Containers rodando (verde)
- [ ] Logs sem erros críticos
- [ ] Acesso via HTTPS funcionando
- [ ] Página de login carrega

**Pronto!** 🎉 MVP 100% funcional!
