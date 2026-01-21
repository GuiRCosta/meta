# TDD Workflow - Quick Reference Guide

## 🔴 RED → 🟢 GREEN → 🔵 REFACTOR → ✅ VERIFY

---

## Ciclo TDD Completo

### 1. 🔴 RED Phase - Write Failing Test

**Objetivo**: Escrever um teste que falha porque a funcionalidade ainda não existe.

```python
# Exemplo Backend (Python)
@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_success(mock_settings, mock_meta_campaigns_response):
    """
    Test that list_campaigns returns campaigns successfully.

    This test WILL FAIL initially because the function doesn't handle
    the mocked response correctly yet.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        # Arrange: Setup mocks
        # Act: Call function
        result = await list_campaigns()

        # Assert: Expected behavior
        assert result['success'] is True
        assert len(result['campaigns']) == 3
```

```typescript
// Exemplo Frontend (TypeScript)
describe('ratelimit', () => {
  it('should allow requests within limit', () => {
    // RED: Write test first, it will fail
    const limiter = ratelimit({ limit: 5, window: 60 });
    const result = limiter.limit('user1');

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
```

**Executar teste:**
```bash
# Backend
pytest backend/tests/test_meta_api.py::test_list_campaigns_success -v

# Frontend
npm run test src/lib/__tests__/rate-limit.test.ts
```

**Saída esperada**: ❌ FAILED (teste falha)

---

### 2. 🟢 GREEN Phase - Write Minimal Code to Pass

**Objetivo**: Escrever o código mínimo necessário para fazer o teste passar.

```python
# Implementação mínima
async def list_campaigns():
    """Minimal implementation to make test pass."""
    return {
        'success': True,
        'campaigns': [
            {'id': '123', 'name': 'Campaign 1'},
            {'id': '456', 'name': 'Campaign 2'},
            {'id': '789', 'name': 'Campaign 3'},
        ]
    }
```

**Executar teste novamente:**
```bash
pytest backend/tests/test_meta_api.py::test_list_campaigns_success -v
```

**Saída esperada**: ✅ PASSED (teste passa)

---

### 3. 🔵 REFACTOR Phase - Improve Implementation

**Objetivo**: Melhorar o código sem quebrar os testes.

```python
# Implementação melhorada (real)
async def list_campaigns(status=None, limit=50, include_drafts=True):
    """
    Production-ready implementation that:
    - Makes real API calls
    - Handles errors
    - Supports filtering
    - Implements pagination
    """
    if not settings.meta_access_token:
        return {
            'success': False,
            'error': 'Meta API não configurada',
            'campaigns': []
        }

    try:
        url = f"https://graph.facebook.com/v24.0/{account_id}/campaigns"
        headers = {"Authorization": f"Bearer {settings.meta_access_token}"}
        params = {"fields": "id,name,status", "limit": limit}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            data = response.json()

            if "error" in data:
                return {'success': False, 'error': data['error']['message']}

            return {
                'success': True,
                'campaigns': data.get('data', []),
                'total': len(data.get('data', []))
            }
    except Exception as e:
        return {'success': False, 'error': str(e), 'campaigns': []}
```

**Executar TODOS os testes novamente:**
```bash
pytest backend/tests/test_meta_api.py -v
```

**Saída esperada**: ✅ ALL PASSED (todos os testes passam)

---

### 4. ✅ VERIFY Phase - Check Coverage

**Objetivo**: Garantir que a cobertura está em 80%+.

```bash
# Backend - Verificar cobertura
pytest --cov=app.tools.meta_api --cov-report=term-missing

# Frontend - Verificar cobertura
npm run test:coverage
```

**Saída esperada**:
```
Name                        Stmts   Miss  Cover   Missing
---------------------------------------------------------
app/tools/meta_api.py         150     15    90%   45-50
```

Se cobertura < 80%:
- Adicionar mais testes para casos não cobertos
- Repetir ciclo RED-GREEN-REFACTOR para casos faltantes

---

## Checklist TDD para Cada Funcionalidade

### Antes de Começar
- [ ] Ler especificação da funcionalidade
- [ ] Identificar casos de teste (happy path, edge cases, errors)
- [ ] Criar fixtures/mocks necessários

### Durante RED Phase
- [ ] Escrever teste descritivo com docstring
- [ ] Incluir Arrange-Act-Assert comments
- [ ] Executar teste - deve FALHAR
- [ ] Verificar mensagem de erro (está clara?)

### Durante GREEN Phase
- [ ] Escrever código mínimo para passar
- [ ] Executar teste - deve PASSAR
- [ ] NÃO adicionar funcionalidades extras ainda

### Durante REFACTOR Phase
- [ ] Melhorar implementação (performance, legibilidade)
- [ ] Adicionar tratamento de erros
- [ ] Adicionar validação de inputs
- [ ] Executar TODOS os testes - devem PASSAR
- [ ] Revisar código (seguir coding-style.md)

### Durante VERIFY Phase
- [ ] Executar testes com cobertura
- [ ] Verificar cobertura >= 80%
- [ ] Adicionar testes se cobertura baixa
- [ ] Commit com mensagem descritiva

---

## Casos de Teste Essenciais

### Para TODA Funcionalidade

1. **Happy Path** - Caso de sucesso básico
2. **Edge Cases** - Valores limites (vazio, null, zero, máximo)
3. **Error Handling** - Erros esperados (timeout, API down, invalid input)
4. **Security** - Validação de inputs, sanitização, autenticação
5. **Performance** - Rate limiting, pagination, caching

### Exemplo Completo: `list_campaigns()`

```python
# 1. Happy Path
test_list_campaigns_success()

# 2. Edge Cases
test_list_campaigns_empty_response()
test_list_campaigns_with_filters()
test_list_campaigns_pagination()
test_list_campaigns_exclude_drafts()

# 3. Error Handling
test_list_campaigns_rate_limit_error()
test_list_campaigns_network_error()
test_list_campaigns_no_token()
test_list_campaigns_invalid_response()

# 4. Security
test_list_campaigns_authorization_header()  # NOT query params
test_list_campaigns_no_sensitive_data_in_logs()

# 5. Performance
test_list_campaigns_pagination_limit()
test_list_campaigns_timeout_handling()
```

---

## Ordem de Implementação (Por Prioridade)

### Backend (Fase 1)

1. **TDD Cycle 1**: `list_campaigns()` - Core functionality
2. **TDD Cycle 2**: `get_campaign_insights()` - Analytics
3. **TDD Cycle 3**: `duplicate_campaign()` - Advanced feature
4. **TDD Cycle 4**: `create_campaign()` - CRUD
5. **TDD Cycle 5**: `update_campaign_status()` - CRUD

### API Endpoints (Fase 2)

6. **TDD Cycle 6**: `GET /api/campaigns/` - List endpoint
7. **TDD Cycle 7**: `POST /api/campaigns/{id}/duplicate` - Duplication
8. **TDD Cycle 8**: `GET /api/campaigns/{id}/insights` - Analytics

### Frontend Utilities (Fase 3)

9. **TDD Cycle 9**: `ratelimit()` - Rate limiting logic
10. **TDD Cycle 10**: `logger.sanitize()` - Security

### API Routes (Fase 4)

11. **TDD Cycle 11**: `POST /api/sync` - Sync endpoint
12. **TDD Cycle 12**: `GET /api/dashboard` - Dashboard metrics

---

## Comandos Rápidos

### Iniciar novo TDD Cycle

```bash
# 1. Criar arquivo de teste
touch backend/tests/test_nova_funcionalidade.py

# 2. Escrever teste (RED)
# ... escrever código do teste ...

# 3. Executar teste (deve falhar)
pytest backend/tests/test_nova_funcionalidade.py::test_nome -v

# 4. Implementar funcionalidade (GREEN)
# ... escrever código de implementação ...

# 5. Executar teste novamente (deve passar)
pytest backend/tests/test_nova_funcionalidade.py::test_nome -v

# 6. Refatorar e verificar cobertura
pytest --cov=app.module --cov-report=term-missing

# 7. Commit
git add .
git commit -m "feat: add nova_funcionalidade with 90% coverage"
```

---

## Boas Práticas TDD

### ✅ DO

- **Write tests first** - Sempre escrever teste antes do código
- **One test at a time** - Focar em um teste por vez
- **Small iterations** - Ciclos curtos (5-15 minutos)
- **Descriptive names** - Nomes de testes claros e descritivos
- **Test edge cases** - Testar casos limites e erros
- **Run all tests** - Executar todos os testes após refatorar
- **Keep tests fast** - Testes devem ser rápidos (<1s cada)
- **Mock external dependencies** - Isolar testes de APIs externas

### ❌ DON'T

- **Don't skip RED phase** - Não pular a fase de teste falhando
- **Don't write production code without test** - Código sem teste = débito técnico
- **Don't test implementation details** - Testar comportamento, não implementação
- **Don't mock everything** - Usar mocks apenas para dependências externas
- **Don't ignore failing tests** - Investigar e corrigir imediatamente
- **Don't commit broken tests** - Todos os testes devem passar antes do commit

---

## Troubleshooting TDD

### "Meu teste não está falhando na fase RED"

**Problema**: Teste passa imediatamente sem implementação.

**Solução**:
- Verificar se está testando comportamento novo
- Verificar se mocks estão configurados corretamente
- Adicionar assertions mais específicas

### "Meu teste está falhando mesmo após implementação"

**Problema**: Teste continua falhando na fase GREEN.

**Solução**:
- Ler mensagem de erro cuidadosamente
- Verificar se mocks estão retornando dados corretos
- Debugar com `pytest -vv -s` (mostra print statements)
- Usar `import pdb; pdb.set_trace()` para debugging

### "Cobertura está abaixo de 80%"

**Problema**: Implementação não tem testes suficientes.

**Solução**:
```bash
# Ver quais linhas não estão cobertas
pytest --cov=app.module --cov-report=term-missing

# Adicionar testes para linhas faltantes
# Focar em edge cases e error handling
```

---

## Recursos Adicionais

- **Plano de Testes**: `/Users/guilhermecosta/Projetos/meta/PLANO_TESTES.md`
- **Instruções de Execução**: `/Users/guilhermecosta/Projetos/meta/INSTRUCOES_EXECUCAO_TESTES.md`
- **Coding Style**: `~/.claude/rules/coding-style.md`
- **Testing Requirements**: `~/.claude/rules/testing.md`

---

## Exemplo Completo: Implementação TDD Passo a Passo

### Funcionalidade: `get_campaign_insights()`

#### Passo 1: RED - Escrever teste
```python
@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_insights_success(mock_settings):
    """Test that get_campaign_insights returns metrics."""
    # This test will FAIL initially
    result = await get_campaign_insights(campaign_id="123", date_preset="last_7d")

    assert result['success'] is True
    assert 'insights' in result
    assert result['insights']['impressions'] > 0
```

#### Passo 2: Executar (deve falhar)
```bash
$ pytest backend/tests/test_meta_api.py::test_get_insights_success -v

FAILED - KeyError: 'insights'
```

#### Passo 3: GREEN - Implementação mínima
```python
async def get_campaign_insights(campaign_id: str, date_preset: str = "last_7d"):
    """Minimal implementation."""
    return {
        'success': True,
        'insights': {
            'impressions': 1000,
            'clicks': 50,
            'spend': 100.0,
        }
    }
```

#### Passo 4: Executar (deve passar)
```bash
$ pytest backend/tests/test_meta_api.py::test_get_insights_success -v

PASSED ✅
```

#### Passo 5: REFACTOR - Implementação real
```python
async def get_campaign_insights(campaign_id: str, date_preset: str = "last_7d"):
    """Production implementation with API calls."""
    if not settings.meta_access_token:
        return {"success": False, "error": "Meta API não configurada"}

    try:
        url = f"https://graph.facebook.com/v24.0/{campaign_id}/insights"
        headers = _get_auth_headers()
        params = {
            "fields": "impressions,clicks,spend",
            "date_preset": date_preset,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            data = response.json()

            if "error" in data:
                return {"success": False, "error": data["error"]["message"]}

            insights = data.get("data", [{}])[0]

            return {
                "success": True,
                "period": date_preset,
                "insights": {
                    "impressions": int(insights.get("impressions", 0)),
                    "clicks": int(insights.get("clicks", 0)),
                    "spend": float(insights.get("spend", 0)),
                }
            }
    except Exception as e:
        return {"success": False, "error": str(e)}
```

#### Passo 6: VERIFY - Cobertura
```bash
$ pytest --cov=app.tools.meta_api --cov-report=term-missing

Name                        Stmts   Miss  Cover   Missing
---------------------------------------------------------
app/tools/meta_api.py         180     18    90%   125-130

✅ Coverage: 90% (target: 80%+)
```

#### Passo 7: Commit
```bash
git add backend/app/tools/meta_api.py backend/tests/test_meta_api.py
git commit -m "feat: add get_campaign_insights with 90% test coverage

- Implement Meta API insights endpoint integration
- Add date_preset parameter support
- Handle errors and edge cases
- Achieve 90% test coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Conclusão

TDD é um processo **iterativo** e **disciplinado**:

1. 🔴 **RED**: Escrever teste que falha
2. 🟢 **GREEN**: Fazer teste passar (mínimo código)
3. 🔵 **REFACTOR**: Melhorar implementação
4. ✅ **VERIFY**: Garantir 80%+ cobertura
5. 🔁 **REPEAT**: Próximo caso de teste

**Resultado**: Código robusto, testado e confiável com 80%+ de cobertura.
