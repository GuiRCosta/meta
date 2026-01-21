# Plano de Testes - Meta Campaign Manager

## Objetivo

Implementar cobertura de testes de **80%+** usando metodologia **Test-Driven Development (TDD)** para o Meta Campaign Manager.

---

## Metodologia TDD

### Ciclo RED-GREEN-REFACTOR

Para cada funcionalidade:

1. **RED**: Escrever teste que falha
2. **GREEN**: Implementar código mínimo para passar
3. **REFACTOR**: Melhorar implementação
4. **VERIFY**: Confirmar cobertura de 80%+

---

## Stack de Testes

### Backend (Python/FastAPI)
- **Framework**: pytest
- **Async Testing**: pytest-asyncio
- **HTTP Testing**: httpx (AsyncClient)
- **Mocking**: pytest-mock, unittest.mock
- **Coverage**: pytest-cov

### Frontend (Next.js/TypeScript)
- **Framework**: Vitest
- **Component Testing**: @testing-library/react
- **Mocking**: vitest/mock
- **Coverage**: vitest coverage (c8)

---

## Fase 1: Backend - Meta API Tools (PRIORIDADE CRÍTICA)

### Arquivo: `backend/tests/test_meta_api.py`

**Funcionalidades a testar:**

#### 1.1 `list_campaigns()` - TDD Cycle 1
- **RED**: Testar resposta bem-sucedida com campanhas
- **GREEN**: Implementar mock da Meta API
- **REFACTOR**: Adicionar tratamento de erros
- **VERIFY**: Cobertura 80%+

**Casos de teste:**
```python
# RED Phase
test_list_campaigns_success()              # Mock resposta Meta API
test_list_campaigns_with_filters()         # Testar filtros status/limit
test_list_campaigns_pagination()           # Testar paginação automática
test_list_campaigns_rate_limit_error()     # Erro 80004 - rate limit
test_list_campaigns_no_token()             # META_ACCESS_TOKEN não configurado
test_list_campaigns_empty_response()       # API retorna vazio
test_list_campaigns_network_error()        # Timeout/falha de conexão
test_list_campaigns_authorization_header() # Verificar Authorization header
test_list_campaigns_exclude_drafts()       # Filtrar rascunhos
```

**Cobertura esperada**: Linhas 20-163 (100%)

---

#### 1.2 `get_campaign_insights()` - TDD Cycle 2
- **RED**: Testar busca de insights com date_preset
- **GREEN**: Mock resposta de insights
- **REFACTOR**: Validação de date ranges
- **VERIFY**: Cobertura 80%+

**Casos de teste:**
```python
test_get_insights_success()                # Resposta válida
test_get_insights_last_7d()                # Período last_7d
test_get_insights_today()                  # Período today
test_get_insights_invalid_date_preset()    # Date preset inválido
test_get_insights_empty_data()             # Sem dados (campanha nova)
test_get_insights_no_token()               # Sem configuração
test_get_insights_authorization_header()   # Header correto
```

**Cobertura esperada**: Linhas 418-468 (100%)

---

#### 1.3 `duplicate_campaign()` - TDD Cycle 3
- **RED**: Testar duplicação via endpoint /copies
- **GREEN**: Mock resposta Meta API /copies
- **REFACTOR**: Tratamento de erro 1885194 (solicitação muito grande)
- **VERIFY**: Cobertura 80%+

**Casos de teste:**
```python
test_duplicate_campaign_success()          # Duplicação bem-sucedida
test_duplicate_campaign_deep_copy_true()   # deep_copy=True
test_duplicate_campaign_deep_copy_false()  # deep_copy=False
test_duplicate_campaign_custom_suffix()    # Sufixo personalizado
test_duplicate_campaign_error_1885194()    # Erro: solicitação muito grande
test_duplicate_campaign_timeout()          # Timeout
test_duplicate_campaign_no_id_response()   # Resposta sem ID
```

**Cobertura esperada**: Linhas 306-415 (100%)

---

#### 1.4 `create_campaign()` - TDD Cycle 4
**Casos de teste:**
```python
test_create_campaign_success()             # Criação bem-sucedida
test_create_campaign_with_budget()         # Com daily_budget
test_create_campaign_special_categories()  # special_ad_categories
test_create_campaign_invalid_objective()   # Objetivo inválido
test_create_campaign_no_token()            # Sem configuração
```

**Cobertura esperada**: Linhas 199-266 (80%+)

---

#### 1.5 `update_campaign_status()` - TDD Cycle 5
**Casos de teste:**
```python
test_update_status_to_active()             # PAUSED -> ACTIVE
test_update_status_to_paused()             # ACTIVE -> PAUSED
test_update_status_to_archived()           # -> ARCHIVED
test_update_status_invalid()               # Status inválido
```

**Cobertura esperada**: Linhas 269-303 (80%+)

---

### Fixtures Compartilhados (`backend/conftest.py`)

```python
@pytest.fixture
def mock_meta_api_response():
    """Mock resposta padrão da Meta API"""
    return {
        "data": [
            {
                "id": "123456789",
                "name": "Test Campaign",
                "status": "ACTIVE",
                "objective": "OUTCOME_SALES",
                "daily_budget": 5000,
                "created_time": "2024-01-01T00:00:00Z"
            }
        ]
    }

@pytest.fixture
def mock_httpx_client(monkeypatch):
    """Mock httpx.AsyncClient para testes"""
    # Implementação do mock
    pass

@pytest.fixture
def mock_settings():
    """Mock app.config.settings"""
    from unittest.mock import MagicMock
    settings = MagicMock()
    settings.meta_access_token = "test_token"
    settings.meta_ad_account_id = "act_123456"
    return settings
```

---

## Fase 2: Backend - API Endpoints

### Arquivo: `backend/tests/test_api_campaigns.py`

#### 2.1 `GET /api/campaigns/` - TDD Cycle 6
**Casos de teste:**
```python
test_get_campaigns_success()               # Resposta bem-sucedida
test_get_campaigns_with_status_filter()    # Filtro status=ACTIVE
test_get_campaigns_with_limit()            # Limit=10
test_get_campaigns_include_drafts_false()  # Excluir rascunhos
test_get_campaigns_meta_api_error()        # Meta API falha (HTTPException 500)
test_get_campaigns_rate_limit()            # Rate limit retorna 500
```

**Cobertura esperada**: Linhas 41-60 (100%)

---

#### 2.2 `POST /api/campaigns/{id}/duplicate` - TDD Cycle 7
**Casos de teste:**
```python
test_duplicate_endpoint_success()          # 200 OK
test_duplicate_endpoint_custom_suffix()    # Sufixo customizado
test_duplicate_endpoint_deep_copy_true()   # deep_copy=True
test_duplicate_endpoint_error_400()        # Meta API erro -> HTTPException 400
```

**Cobertura esperada**: Linhas 158-177 (100%)

---

#### 2.3 `GET /api/campaigns/{id}/insights` - TDD Cycle 8
**Casos de teste:**
```python
test_get_insights_endpoint_success()       # 200 OK
test_get_insights_invalid_date_preset()    # HTTPException 400
test_get_insights_campaign_not_found()     # HTTPException 400
```

**Cobertura esperada**: Linhas 125-155 (100%)

---

## Fase 3: Frontend - Utilities

### Arquivo: `frontend/src/lib/__tests__/rate-limit.test.ts`

#### 3.1 `ratelimit()` - TDD Cycle 9

**Estrutura TDD completa:**

```typescript
describe('ratelimit', () => {
  // RED Phase
  it('should allow requests within limit', () => {
    const limiter = ratelimit({ limit: 5, window: 60 });
    const result = limiter.limit('user1');

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  // GREEN Phase - Implementação já existe

  // REFACTOR Phase
  it('should block requests exceeding limit', () => {
    const limiter = ratelimit({ limit: 2, window: 60 });

    limiter.limit('user1'); // 1st request
    limiter.limit('user1'); // 2nd request
    const result = limiter.limit('user1'); // 3rd request (blocked)

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after window expires', async () => {
    const limiter = ratelimit({ limit: 1, window: 1 }); // 1 second window

    limiter.limit('user1'); // 1st request (allowed)

    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1s

    const result = limiter.limit('user1'); // Should be allowed after reset
    expect(result.success).toBe(true);
  });

  it('should handle multiple identifiers independently', () => {
    const limiter = ratelimit({ limit: 1, window: 60 });

    const result1 = limiter.limit('user1');
    const result2 = limiter.limit('user2');

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true); // Different identifier
  });

  it('should return correct reset time', () => {
    const limiter = ratelimit({ limit: 1, window: 60 });
    const result = limiter.limit('user1');

    expect(result.reset).toBeGreaterThan(0);
    expect(result.reset).toBeLessThanOrEqual(60);
  });

  it('should increment count correctly', () => {
    const limiter = ratelimit({ limit: 5, window: 60 });

    const r1 = limiter.limit('user1');
    const r2 = limiter.limit('user1');
    const r3 = limiter.limit('user1');

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it('should handle edge case: limit=0', () => {
    const limiter = ratelimit({ limit: 0, window: 60 });
    const result = limiter.limit('user1');

    expect(result.success).toBe(false);
  });

  it('should calculate remaining correctly when blocked', () => {
    const limiter = ratelimit({ limit: 2, window: 60 });

    limiter.limit('user1'); // count=1
    limiter.limit('user1'); // count=2
    const result = limiter.limit('user1'); // count=3 (blocked)

    expect(result.remaining).toBe(0); // Math.max(0, 2 - 3) = 0
  });
});

describe('rateLimiters presets', () => {
  it('should have auth limiter with correct config', () => {
    const result1 = rateLimiters.auth.limit('ip1');
    expect(result1.limit).toBe(5);
  });

  it('should have api limiter with correct config', () => {
    const result1 = rateLimiters.api.limit('ip1');
    expect(result1.limit).toBe(20);
  });

  it('should have sync limiter with correct config', () => {
    const result1 = rateLimiters.sync.limit('ip1');
    expect(result1.limit).toBe(10);
  });

  it('should have sensitive limiter with correct config', () => {
    const result1 = rateLimiters.sensitive.limit('ip1');
    expect(result1.limit).toBe(3);
  });
});
```

**Cobertura esperada**: Linhas 1-126 (100%)

---

### Arquivo: `frontend/src/lib/__tests__/logger.test.ts`

#### 3.2 `sanitize()` - TDD Cycle 10

**Casos de teste:**
```typescript
describe('logger.sanitize', () => {
  it('should redact password field', () => {
    const data = { username: 'user', password: 'secret123' };
    const sanitized = sanitize(data);
    expect(sanitized.password).toBe('[REDACTED]');
  });

  it('should redact token field', () => {
    const data = { access_token: 'abc123' };
    const sanitized = sanitize(data);
    expect(sanitized.access_token).toBe('[REDACTED]');
  });

  it('should redact api_key field', () => {
    const data = { api_key: 'key123' };
    const sanitized = sanitize(data);
    expect(sanitized.api_key).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const data = { user: { name: 'John', password: 'secret' } };
    const sanitized = sanitize(data);
    expect(sanitized.user.password).toBe('[REDACTED]');
  });

  it('should handle arrays', () => {
    const data = [{ password: 'secret1' }, { password: 'secret2' }];
    const sanitized = sanitize(data);
    expect(sanitized[0].password).toBe('[REDACTED]');
    expect(sanitized[1].password).toBe('[REDACTED]');
  });

  it('should preserve non-sensitive data', () => {
    const data = { username: 'user', email: 'test@example.com' };
    const sanitized = sanitize(data);
    expect(sanitized.username).toBe('user');
    expect(sanitized.email).toBe('test@example.com');
  });

  it('should handle null values', () => {
    const sanitized = sanitize(null);
    expect(sanitized).toBeNull();
  });

  it('should handle non-object primitives', () => {
    expect(sanitize('string')).toBe('string');
    expect(sanitize(123)).toBe(123);
    expect(sanitize(true)).toBe(true);
  });

  it('should redact authorization header', () => {
    const data = { Authorization: 'Bearer token123' };
    const sanitized = sanitize(data);
    expect(sanitized.Authorization).toBe('[REDACTED]');
  });

  it('should redact cookie field', () => {
    const data = { cookie: 'session=abc123' };
    const sanitized = sanitize(data);
    expect(sanitized.cookie).toBe('[REDACTED]');
  });
});

describe('logger methods', () => {
  it('should log info in development only', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    logger.info('Test message');

    if (process.env.NODE_ENV === 'development') {
      expect(consoleSpy).toHaveBeenCalled();
    } else {
      expect(consoleSpy).not.toHaveBeenCalled();
    }
  });

  it('should always log errors', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    logger.error('Error message', new Error('Test error'));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should sanitize error data', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    logger.error('Error', new Error('Test'), { password: 'secret' });

    const callArgs = consoleSpy.mock.calls[0][1];
    expect(callArgs.data.password).toBe('[REDACTED]');
  });
});
```

**Cobertura esperada**: Linhas 1-102 (100%)

---

## Fase 4: Frontend - API Routes

### Arquivo: `frontend/src/app/api/sync/__tests__/route.test.ts`

#### 4.1 `POST /api/sync` - TDD Cycle 11

**Casos de teste:**
```typescript
describe('POST /api/sync', () => {
  it('should sync campaigns successfully', async () => {
    // Mock auth session
    // Mock fetch response from backend
    // Mock prisma.campaign.upsert

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 if not authenticated', async () => {
    // Mock auth session = null

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it('should apply rate limiting', async () => {
    // Make 11 requests (limit is 10)

    const response = await POST(mockRequest); // 11th request
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeDefined();
  });

  it('should handle backend connection error', async () => {
    // Mock fetch to throw ECONNREFUSED

    const response = await POST(mockRequest);
    expect(response.status).toBe(503);
  });

  it('should handle Meta API rate limit error', async () => {
    // Mock backend response with rate limit error

    const response = await POST(mockRequest);
    expect(response.status).toBe(429);
  });

  it('should sync multiple campaigns to database', async () => {
    // Mock 3 campaigns from Meta API

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.campaigns_synced).toBe(3);
  });

  it('should handle partial sync errors', async () => {
    // Mock prisma error for 1 of 3 campaigns

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.campaigns_synced).toBe(2);
    expect(data.errors).toHaveLength(1);
  });
});
```

**Cobertura esperada**: Linhas 9-204 (85%+)

---

### Arquivo: `frontend/src/app/api/dashboard/__tests__/route.test.ts`

#### 4.2 `GET /api/dashboard` - TDD Cycle 12

**Casos de teste:**
```typescript
describe('GET /api/dashboard', () => {
  it('should return dashboard stats', async () => {
    // Mock auth session
    // Mock prisma.campaign.findMany

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.stats).toBeDefined();
    expect(data.stats.totalCampaigns).toBeGreaterThanOrEqual(0);
  });

  it('should calculate month spend correctly', async () => {
    // Mock campaigns with metrics

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.stats.monthSpend).toBeGreaterThan(0);
  });

  it('should filter metrics by date range', async () => {
    // Mock metrics from last 30 days only

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.spendingData).toHaveLength(7); // Last 7 days
  });

  it('should calculate CTR correctly', async () => {
    // Mock impressions=1000, clicks=50

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.stats.ctr).toBe(5); // 50/1000 * 100 = 5%
  });

  it('should handle zero impressions', async () => {
    // Mock impressions=0

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.stats.ctr).toBe(0); // Avoid division by zero
  });

  it('should return top campaigns', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.topCampaigns).toBeDefined();
    expect(data.topCampaigns.length).toBeLessThanOrEqual(3);
  });

  it('should exclude archived campaigns', async () => {
    // Mock 2 ACTIVE, 1 ARCHIVED

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.stats.totalCampaigns).toBe(2); // Only active + paused
  });

  it('should calculate trends correctly', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.trends).toBeDefined();
    expect(data.trends.spend).toBeDefined();
  });
});
```

**Cobertura esperada**: Linhas 8-270 (80%+)

---

## Fase 5: Integration Tests (Backend)

### Arquivo: `backend/tests/test_integration_meta_api.py`

**Testes de integração com Meta API real (opcional):**

```python
@pytest.mark.integration
@pytest.mark.skipif(not os.getenv('META_ACCESS_TOKEN'), reason="Meta API not configured")
def test_list_campaigns_real_api():
    """Teste de integração com Meta API real"""
    result = await list_campaigns(limit=5)
    assert result['success'] is True
    assert 'campaigns' in result
```

**Nota**: Testes de integração devem ser marcados com `@pytest.mark.integration` e executados separadamente.

---

## Configuração de Cobertura

### Backend: `.coveragerc`

```ini
[run]
source = app
omit =
    */tests/*
    */venv/*
    */__pycache__/*
    */migrations/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod

[html]
directory = coverage_html
```

### Frontend: `vitest.config.ts` (coverage)

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'app/**/layout.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

## Comandos de Execução

### Backend

```bash
# Instalar dependências de teste
pip install pytest pytest-asyncio pytest-cov httpx pytest-mock

# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=app --cov-report=html --cov-report=term

# Executar apenas testes unitários (excluir integration)
pytest -m "not integration"

# Executar teste específico
pytest backend/tests/test_meta_api.py::test_list_campaigns_success -v

# Watch mode (rerun on changes)
pytest-watch
```

### Frontend

```bash
# Instalar dependências de teste
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom

# Executar todos os testes
npm run test

# Executar com cobertura
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

---

## Cronograma de Implementação

### Semana 1: Backend Core (Fases 1-2)
- **Dia 1-2**: TDD Cycles 1-3 (Meta API tools)
- **Dia 3-4**: TDD Cycles 4-5 (Completar meta_api.py)
- **Dia 5**: TDD Cycles 6-8 (API endpoints)

### Semana 2: Frontend & Integration (Fases 3-4)
- **Dia 1-2**: TDD Cycles 9-10 (Utilities)
- **Dia 3-4**: TDD Cycles 11-12 (API routes)
- **Dia 5**: Code review e ajustes de cobertura

### Semana 3: Refinamento
- **Dia 1-2**: Testes de integração (Fase 5)
- **Dia 3**: Documentação e CI/CD
- **Dia 4-5**: Buffer para ajustes

---

## Métricas de Sucesso

### Cobertura Mínima por Arquivo

| Arquivo | Cobertura Alvo | Prioridade |
|---------|----------------|------------|
| `backend/app/tools/meta_api.py` | 90%+ | CRÍTICO |
| `backend/app/api/campaigns.py` | 85%+ | ALTO |
| `frontend/src/lib/rate-limit.ts` | 100% | ALTO |
| `frontend/src/lib/logger.ts` | 100% | ALTO |
| `frontend/src/app/api/sync/route.ts` | 85%+ | MÉDIO |
| `frontend/src/app/api/dashboard/route.ts` | 80%+ | MÉDIO |

### Critérios de Aprovação

- [ ] Cobertura global backend: 80%+
- [ ] Cobertura global frontend: 80%+
- [ ] Todos os testes de segurança passam (Authorization headers, sanitization)
- [ ] Testes de rate limiting cobertos
- [ ] Testes de edge cases (empty data, timeouts, errors)
- [ ] CI/CD configurado (GitHub Actions)

---

## Segurança nos Testes

### Checklist de Segurança

- [ ] Testes verificam uso de Authorization header (não query params)
- [ ] Testes verificam sanitização de logs (logger.ts)
- [ ] Testes cobrem rate limiting em todos os endpoints
- [ ] Testes verificam validação de inputs (Zod schemas)
- [ ] Testes cobrem tratamento de erros sem vazar informações sensíveis
- [ ] Mock credentials nunca vazam para logs reais

---

## Manutenção Contínua

### Após Implementação Inicial

1. **Pre-commit Hook**: Executar testes antes de cada commit
2. **CI/CD**: GitHub Actions roda testes em PRs
3. **Coverage Reports**: Monitorar cobertura em cada PR
4. **Refactoring**: Executar testes antes/depois de refatorações
5. **New Features**: Sempre começar com TDD (RED-GREEN-REFACTOR)

---

## Próximos Passos

1. Implementar configurações de teste (conftest.py, vitest.config.ts)
2. Começar TDD Cycle 1: `test_list_campaigns_success()`
3. Continuar sequencialmente pelos cycles
4. Monitorar cobertura após cada cycle
5. Ajustar implementação se cobertura < 80%

---

## Referências

- **pytest**: https://docs.pytest.org/
- **Vitest**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **TDD Best Practices**: Kent Beck - "Test Driven Development: By Example"
- **Meta API Testing**: https://developers.facebook.com/docs/graph-api/overview
