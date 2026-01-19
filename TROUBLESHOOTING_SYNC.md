# 🔧 Troubleshooting - Erro ao Sincronizar Campanhas

## 🐛 Problema Identificado

O backend está rodando, mas não está respondendo às requisições. Isso pode causar o erro "Erro ao sincronizar campanhas".

## ✅ Soluções

### 1. Verificar se o Backend está rodando corretamente

```bash
# Verificar se o processo está rodando
ps aux | grep uvicorn

# Verificar se a porta 8000 está em uso
lsof -ti:8000

# Testar endpoint de health
curl http://localhost:8000/health
```

### 2. Reiniciar o Backend

Se o backend não estiver respondendo, reinicie:

```bash
cd backend

# Parar o processo atual (se estiver rodando)
pkill -f "uvicorn app.main"

# Iniciar novamente
source env.config.sh
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 3. Verificar Variáveis de Ambiente

Certifique-se de que as variáveis estão configuradas:

```bash
cd backend
source env.config.sh

# Verificar se foram carregadas
echo $META_ACCESS_TOKEN | head -c 20
echo $META_AD_ACCOUNT_ID
```

### 4. Verificar Logs do Backend

Se o backend está rodando, verifique os logs para erros:

```bash
# Se estiver rodando em terminal, verifique a saída
# Se estiver em background, verifique logs
cd backend
tail -f logs/*.log 2>/dev/null || echo "Verifique a saída do processo"
```

### 5. Testar Conexão Direta com Meta API

Teste se a conexão com a Meta API está funcionando:

```bash
cd backend
source env.config.sh
source venv/bin/activate
python3 test_meta_api.py
```

### 6. Verificar CORS

Se o erro for de CORS, verifique se o frontend está permitido:

No arquivo `backend/app/main.py`, certifique-se de que `http://localhost:3000` está na lista de origens permitidas.

### 7. Verificar se o Backend está acessível

No frontend, verifique se a variável de ambiente está configurada:

```env
AGNO_API_URL=http://localhost:8000
```

Ou verifique no código (`frontend/src/app/api/sync/route.ts`):
```typescript
const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
```

## 🔍 Diagnóstico Passo a Passo

1. **Verificar Status do Backend**:
   ```bash
   curl http://localhost:8000/health
   ```
   - ✅ Se responder: Backend está funcionando
   - ❌ Se não responder: Backend não está disponível

2. **Testar Endpoint de Campanhas**:
   ```bash
   curl http://localhost:8000/api/campaigns/
   ```
   - ✅ Se responder: API está funcionando
   - ❌ Se não responder: Problema no endpoint

3. **Verificar Credenciais Meta**:
   ```bash
   cd backend
   source env.config.sh
   python3 test_meta_api.py
   ```
   - ✅ Se funcionar: Credenciais OK
   - ❌ Se não funcionar: Verificar token e Ad Account ID

## 🚀 Solução Rápida

1. **Parar o backend atual**:
   ```bash
   pkill -f "uvicorn app.main"
   ```

2. **Iniciar o backend novamente**:
   ```bash
   cd /Users/guilhermecosta/Projetos/meta/backend
   source env.config.sh
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

3. **Aguardar alguns segundos** para o backend iniciar completamente

4. **Testar novamente** a sincronização no frontend

## 📝 Mensagens de Erro Comuns

### "Erro ao conectar com o backend"
- **Causa**: Backend não está rodando ou não está acessível
- **Solução**: Verificar se o backend está rodando na porta 8000

### "Erro ao buscar campanhas da Meta API"
- **Causa**: Problema com credenciais da Meta ou API não responde
- **Solução**: Verificar `META_ACCESS_TOKEN` e `META_AD_ACCOUNT_ID`

### "Erro ao sincronizar campanhas"
- **Causa**: Erro ao salvar no banco de dados
- **Solução**: Verificar conexão com banco de dados (Supabase)

## 💡 Dicas

- Sempre inicie o backend **antes** de tentar sincronizar
- Verifique se todas as variáveis de ambiente estão configuradas
- Aguarde alguns segundos após iniciar o backend para ele estar completamente pronto
- Use `test_meta_api.py` para verificar se a conexão com a Meta está funcionando
