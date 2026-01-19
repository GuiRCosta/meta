# ✅ Solução - Erro "ModuleNotFoundError: No module named 'agno'"

## 🐛 Problema

O backend estava falhando ao iniciar com o erro:
```
ModuleNotFoundError: No module named 'agno'
```

## ✅ Solução Aplicada

1. **Instalado o módulo agno**:
   ```bash
   cd backend
   source venv/bin/activate
   pip install agno==1.2.6
   ```

2. **Verificado instalação**:
   ```bash
   python -c "import agno; print('✅ agno instalado com sucesso')"
   ```

## 🚀 Como Iniciar o Backend

```bash
cd /Users/guilhermecosta/Projetos/meta/backend

# Carregar variáveis de ambiente
source env.config.sh

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências (se necessário)
pip install -r requirements.txt

# Iniciar backend
uvicorn app.main:app --reload --port 8000
```

## ⚠️ Nota sobre psycopg2-binary

O `psycopg2-binary` pode falhar na instalação em alguns sistemas. Isso não impede o backend de funcionar se você estiver usando Supabase (não precisa do psycopg2 local).

As dependências essenciais são:
- `fastapi`
- `uvicorn`
- `httpx`
- `pydantic-settings`
- `python-dotenv`
- `openai`
- `agno`

## ✅ Status

- ✅ agno instalado
- ✅ Backend deve estar iniciando

## 🔍 Verificar se está funcionando

```bash
# Verificar health
curl http://localhost:8000/health

# Verificar campanhas
curl http://localhost:8000/api/campaigns/
```
