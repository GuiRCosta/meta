# 🔐 Configuração da API Meta - Concluída

## ✅ Status: CONFIGURADO E FUNCIONAL

### Credenciais Configuradas:

- **Token de Acesso**: `EAAMr8h0Y08gBQa9TYM4Rl02kqK7oZCUj0qzlPsAdhd3jkLQxVA8U9npTvlCFJ66QpMm8eHZAIIIZBt4vfGXhZAfAGZBoa4h10HgutTlscZBJcZCvqVBEv6hxlh0l8fpw8RD7IaQZCZClrtxZCG9PoXbncVlLv7Tzo9xdvpsqP99h7qyOXAEBCbNtfyON4Im1wMKaaIvOhcHx8Q`
- **App ID**: `892743800378312`
- **App Secret**: `c07914ffea65333e9674e03a018ea175`
- **Ad Account ID**: `act_323269928724732` (conta: "Engajamento")

### Contas de Anúncios Disponíveis:

O token tem acesso a **10 contas de anúncios**:

1. **Engajamento** - `act_323269928724732` ⭐ (configurada)
2. [INTERIOR][BT] - `act_394394558956062`
3. Mais Amor por Você - `act_341222557869741`
4. EQUILIBRIO GOLD - `act_725646645090607`
5. [C.A][JBF PROMOTORA][2023] - `act_205771168415907`
6. Júlio Carvalho - `act_263169879320063`
7. [C.A] HeroClub - `act_394571789473496`
8. IDEVA - `act_1568625274500386`
9. [C.A][Mercadinho do Digital][#01] - `act_641674821087302`
10. [C.A] [CAROL QUEIROZ] - `act_1347634972801284`

### Teste Realizado:

✅ **Conexão estabelecida com sucesso!**
- 📊 **5 campanhas encontradas** na conta "Engajamento"
- ✅ Listagem de campanhas funcionando
- ✅ Busca de detalhes funcionando

**Campanhas encontradas:**
1. [TRAFEGO] WHATSAPP 20/02 - NACIONAL (ACTIVE)
2. [ENG] SEMANA COVER [27/11] (PAUSED)
3. [REC] Moto Rock (PAUSED)
4. (mais 2 campanhas)

## 🚀 Como Usar

### Para iniciar o backend com as credenciais:

```bash
cd backend
source env.config.sh  # Carrega as variáveis de ambiente
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Para testar a conexão:

```bash
cd backend
source env.config.sh
source venv/bin/activate
python3 test_meta_api.py
```

### Para mudar de conta de anúncios:

Edite o arquivo `backend/env.config.sh` e altere:
```bash
export META_AD_ACCOUNT_ID="act_XXXXX"  # Use o ID da conta desejada
```

## 📝 Arquivos Criados:

1. **`backend/env.config.sh`** - Script com variáveis de ambiente
2. **`backend/get_ad_account_id.py`** - Script para buscar Ad Account IDs
3. **`backend/test_meta_api.py`** - Script de teste da API
4. **`CONFIGURACAO_META.md`** - Este arquivo

## ⚠️ Importante:

- O token de acesso pode expirar. Se isso acontecer, gere um novo token no [Meta for Developers](https://developers.facebook.com/)
- Para produção, use tokens de longa duração (60 dias) ou tokens que não expiram
- Mantenha as credenciais seguras e não as compartilhe publicamente

## 🔄 Próximos Passos:

1. ✅ Duplicação de campanhas - **IMPLEMENTADO E FUNCIONAL**
2. ✅ Conexão com API Meta - **CONFIGURADO E TESTADO**
3. ⏭️ Integrar duplicação com API Meta (criar campanhas reais na Meta)
4. ⏭️ Implementar sincronização de campanhas do Meta para o banco local
