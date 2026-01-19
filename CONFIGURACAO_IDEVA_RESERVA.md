# ✅ Configuração Atualizada para IDEVA Reserva

## 🔄 Mudança Realizada

A aplicação foi configurada para usar a conta **IDEVA Reserva** em vez da conta "Engajamento".

### 📋 Configurações Atualizadas:

- **Business Manager ID**: `471792614410232` (IDEVA Reserva)
- **Ad Account ID**: `act_1568625274500386` (IDEVA)
- **App ID**: `892743800378312` (mantido)
- **App Secret**: `c07914ffea65333e9674e03a018ea175` (mantido)

### ✅ Verificação Realizada:

1. ✅ **Business Manager verificado**: `471792614410232` - IDEVA Reserva
2. ✅ **Ad Account verificada**: `act_1568625274500386` - IDEVA
3. ✅ **Campanhas encontradas**: 5 campanhas na conta IDEVA
4. ✅ **Token tem acesso**: Permissões confirmadas

### 📊 Campanhas Encontradas na Conta IDEVA:

1. **[VENDAS][PRE-LP2][CBO] — Cópia** (PAUSED) - OUTCOME_SALES
2. **[VENDAS][PRE-LP2][CBO]** (PAUSED) - OUTCOME_SALES
3. **[VENDAS][PRE-LP2][CBO]** (PAUSED) - OUTCOME_SALES
4. **Nova campanha de Reconhecimento** (PAUSED) - OUTCOME_AWARENESS
5. **[VENDAS][PRE-LP2][ABO]** (PAUSED) - OUTCOME_SALES

### 🔧 Arquivo Atualizado:

- `backend/env.config.sh` - Ad Account ID atualizado para `act_1568625274500386`

### ⚠️ Importante:

- **Backend reiniciado**: O servidor backend foi reiniciado para aplicar as mudanças
- **Frontend**: Não precisa ser reiniciado, mas a sincronização deve ser executada novamente
- **URL de referência**: https://adsmanager.facebook.com/adsmanager/manage/campaigns?global_scope_id=471792614410232&business_id=471792614410232&act=1568625274500386

### 🚀 Próximos Passos:

1. **Testar sincronização**: Execute a sincronização no frontend para buscar as campanhas da conta IDEVA
2. **Verificar dados**: Confirme se as 5 campanhas aparecem corretamente na aplicação
3. **Testar ações**: Teste pausar/ativar campanhas para garantir que está funcionando com a conta correta

---

**Status**: ✅ Configuração atualizada e testada com sucesso!
