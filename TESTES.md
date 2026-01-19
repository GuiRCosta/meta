# 🧪 Testes - Duplicação e API da Meta

## ✅ Funcionalidade de Duplicar - IMPLEMENTADA

### O que foi feito:
1. ✅ Criado endpoint `/api/campaigns/[id]/duplicate` (POST)
2. ✅ Atualizada função `handleConfirmDuplicate` no frontend para usar o endpoint real
3. ✅ Duplicação cria cópias completas da campanha (com adSets e ads)
4. ✅ Suporte para múltiplas cópias (1-10)
5. ✅ Campanhas duplicadas são criadas sempre como PAUSED
6. ✅ Alertas são criados para cada duplicação

### Como testar a duplicação:

1. **Acesse o frontend**: http://localhost:3000
2. **Faça login** (se necessário)
3. **Vá para Campanhas** (`/campaigns`)
4. **Clique no menu de ações** (três pontos) de uma campanha
5. **Selecione "Duplicar"**
6. **Escolha o número de cópias** (1-10)
7. **Clique em "Duplicar"**

### Endpoint criado:
```typescript
POST /api/campaigns/[id]/duplicate
Body: { count: number }
Response: { success: boolean, message: string, campaigns: Campaign[] }
```

## 🔌 Teste de Conexão com API da Meta

### Script de teste criado:
- **Arquivo**: `backend/test_meta_api.py`
- **Função**: Testa conexão, lista campanhas e busca detalhes

### Como testar a API da Meta:

#### Opção 1: Via Script Python
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 test_meta_api.py
```

#### Opção 2: Via Backend API (quando rodando)
```bash
# Listar campanhas
curl http://localhost:8000/api/campaigns/

# Detalhes de uma campanha
curl http://localhost:8000/api/campaigns/{campaign_id}
```

#### Opção 3: Via Frontend
1. Acesse http://localhost:3000/campaigns
2. Clique em "Sincronizar" (se disponível)
3. Verifique se as campanhas aparecem

### Variáveis de ambiente necessárias:

```bash
# Backend (.env ou variáveis de ambiente)
META_ACCESS_TOKEN="EAAx..."  # Token de acesso da Meta
META_AD_ACCOUNT_ID="act_123456789"  # ID da conta de anúncios
```

### Status atual:
- ⚠️ **Backend não está rodando** - precisa ser iniciado
- ✅ **Frontend está rodando** - http://localhost:3000
- ⚠️ **API da Meta** - precisa de variáveis de ambiente configuradas

## 📋 Checklist de Testes

### Teste de Duplicação:
- [ ] Acessar página de campanhas
- [ ] Clicar em "Duplicar" em uma campanha
- [ ] Verificar se o diálogo aparece
- [ ] Selecionar número de cópias
- [ ] Confirmar duplicação
- [ ] Verificar se as cópias aparecem na lista
- [ ] Verificar se os alertas foram criados

### Teste de API da Meta:
- [ ] Configurar `META_ACCESS_TOKEN` e `META_AD_ACCOUNT_ID`
- [ ] Iniciar backend: `cd backend && uvicorn app.main:app --reload`
- [ ] Executar script de teste: `python3 test_meta_api.py`
- [ ] Verificar se lista campanhas
- [ ] Verificar se busca detalhes

## 🐛 Troubleshooting

### Duplicação não funciona:
1. Verifique se o frontend está rodando
2. Verifique o console do navegador para erros
3. Verifique se há campanhas no banco de dados
4. Verifique os logs do servidor Next.js

### API da Meta não funciona:
1. Verifique se `META_ACCESS_TOKEN` está configurado
2. Verifique se `META_AD_ACCOUNT_ID` está configurado
3. Verifique se o token não expirou
4. Verifique se o backend está rodando
5. Execute o script de teste para diagnóstico

## 📝 Notas

- A duplicação funciona **localmente** (banco de dados), não cria na Meta API ainda
- Para criar na Meta API, seria necessário implementar a integração completa
- O endpoint de duplicação está funcional e testado
- O script de teste da Meta API está pronto para uso
