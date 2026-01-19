# 🔧 Resolução - Erros 500 e 503

## 🐛 Problemas Identificados

1. **Erro 500 em `/api/campaigns`**: Internal Server Error ao buscar campanhas
2. **Erro 503 em `/api/sync`**: Service Unavailable - Backend não está respondendo

## 🔍 Diagnóstico

### Erro 500 - `/api/campaigns`
Possíveis causas:
- Problema com Prisma/banco de dados
- Erro na autenticação
- Problema com a query do Prisma

### Erro 503 - `/api/sync`
O backend está rodando (processo existe), mas não está respondendo:
- Backend pode estar travado
- Backend pode estar ainda iniciando
- Pode haver erro que impede o servidor de responder

## ✅ Soluções Aplicadas

1. **Melhorado tratamento de erros** em `/api/campaigns`:
   - Agora retorna detalhes do erro para debug
   - Logs mais detalhados no console

2. **Verificação do backend**:
   - Backend está rodando (processo existe)
   - Mas não está respondendo nas requisições

## 🚀 Próximos Passos

### 1. Verificar Erro 500 no `/api/campaigns`

Abra o console do navegador e verifique os detalhes do erro. Os erros agora incluem:
- Mensagem de erro
- Stack trace (em desenvolvimento)
- Detalhes completos no console do servidor

### 2. Reiniciar o Backend

O backend não está respondendo. Reinicie:

```bash
# Parar todos os processos uvicorn
pkill -f "uvicorn app.main"

# Aguardar alguns segundos
sleep 2

# Iniciar novamente
cd /Users/guilhermecosta/Projetos/meta/backend
source env.config.sh
source venv/bin/activate

# Verificar se agno está instalado
python -c "import agno; print('✅ agno OK')"

# Iniciar backend
uvicorn app.main:app --reload --port 8000
```

### 3. Verificar Conexão com Banco de Dados

O erro 500 pode ser causado por problema de conexão com o banco:

```bash
cd frontend
source .env.local  # ou verificar variáveis de ambiente
npm run db:studio  # Verificar se Prisma conecta
```

### 4. Verificar Logs do Backend

Verifique o terminal onde o backend está rodando para ver erros:
- Erros de importação
- Erros de conexão com Meta API
- Erros de configuração

## 💡 Verificações Rápidas

1. **Backend está respondendo?**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Prisma está conectado?**
   - Verifique `DATABASE_URL` no `.env.local`
   - Teste com `npm run db:studio`

3. **Meta API está configurada?**
   ```bash
   cd backend
   source env.config.sh
   python3 test_meta_api.py
   ```

## 🔧 Comandos de Debug

```bash
# Ver processos uvicorn
ps aux | grep uvicorn

# Ver porta 8000
lsof -i :8000

# Testar backend
curl -v http://localhost:8000/health

# Ver logs do Next.js (frontend)
# Verifique o terminal onde está rodando npm run dev
```

## ⚠️ Se o Problema Persistir

1. **Limpar e reinstalar dependências**:
   ```bash
   # Frontend
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Backend
   cd backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Verificar variáveis de ambiente**:
   - Frontend: `.env.local` com `DATABASE_URL`
   - Backend: `env.config.sh` com `META_ACCESS_TOKEN`

3. **Verificar logs completos**:
   - Console do navegador (F12)
   - Terminal do frontend (Next.js)
   - Terminal do backend (uvicorn)
