# Instruções para Execução dos Testes - Meta Campaign Manager

## Setup Inicial

### Backend (Python/FastAPI)

```bash
cd backend

# 1. Ativar ambiente virtual
source venv/bin/activate

# 2. Instalar dependências de teste
pip install -r requirements-test.txt

# 3. Verificar instalação
pytest --version
```

### Frontend (Next.js/TypeScript)

```bash
cd frontend

# 1. Instalar dependências de teste
npm install

# As dependências de teste já estão em package.json:
# - vitest
# - @testing-library/react
# - @testing-library/jest-dom
# - jsdom
# - @vitest/coverage-v8
```

---

## Executar Testes

### Backend

#### Executar todos os testes
```bash
cd backend
pytest
```

#### Executar testes com cobertura
```bash
pytest --cov=app --cov-report=html --cov-report=term
```

#### Executar testes específicos
```bash
# Teste de um arquivo específico
pytest backend/tests/test_meta_api.py -v

# Teste de uma função específica
pytest backend/tests/test_meta_api.py::test_list_campaigns_success -v

# Testes marcados (unitários apenas)
pytest -m unit

# Excluir testes de integração
pytest -m "not integration"
```

#### Watch mode (rerun on changes)
```bash
ptw  # ou pytest-watch
```

#### Executar em paralelo (mais rápido)
```bash
pytest -n auto  # usa todos os CPUs disponíveis
```

#### Gerar relatório de cobertura HTML
```bash
pytest --cov=app --cov-report=html
open coverage_html/index.html  # macOS
```

---

### Frontend

#### Executar todos os testes
```bash
cd frontend
npm run test
```

#### Executar com cobertura
```bash
npm run test:coverage
```

#### Watch mode
```bash
npm run test:watch
```

#### UI mode (interface gráfica)
```bash
npm run test:ui
```

#### Executar testes específicos
```bash
# Teste de um arquivo específico
npm run test src/lib/__tests__/rate-limit.test.ts

# Executar apenas testes modificados
npm run test -- --changed
```

#### Gerar relatório de cobertura
```bash
npm run test:coverage
open coverage/index.html  # macOS
```

---

## Estrutura de Diretórios de Testes

```
meta/
├── backend/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_meta_api.py          # ✅ Criado (TDD cycles 1-5)
│   │   ├── test_api_campaigns.py     # TODO: TDD cycles 6-8
│   │   └── test_integration_meta_api.py  # TODO: Integration tests
│   ├── conftest.py                    # ✅ Criado (fixtures compartilhados)
│   ├── pytest.ini                     # ✅ Criado (configuração pytest)
│   └── requirements-test.txt          # ✅ Criado (dependências)
│
└── frontend/
    ├── src/
    │   └── lib/
    │       └── __tests__/
    │           ├── rate-limit.test.ts  # ✅ Criado (TDD cycle 9)
    │           └── logger.test.ts      # ✅ Criado (TDD cycle 10)
    ├── vitest.config.ts               # ✅ Criado (configuração Vitest)
    ├── vitest.setup.ts                # ✅ Criado (setup global)
    └── package.json                   # ✅ Atualizado (scripts + deps)
```

---

## Verificar Cobertura

### Backend

```bash
cd backend
pytest --cov=app --cov-report=term-missing

# Exemplo de saída esperada:
# Name                                Stmts   Miss  Cover   Missing
# -----------------------------------------------------------------
# app/tools/meta_api.py                 150      15    90%   45-50, 120
# -----------------------------------------------------------------
# TOTAL                                 500     100    80%
```

### Frontend

```bash
cd frontend
npm run test:coverage

# Exemplo de saída esperada:
# File                          | % Stmts | % Branch | % Funcs | % Lines
# -----------------------------------------------------------------
# src/lib/rate-limit.ts         |   100   |   100    |   100   |   100
# src/lib/logger.ts             |   95    |   90     |   100   |   95
# -----------------------------------------------------------------
# All files                     |   85    |   80     |   85    |   85
```

---

## Métricas de Cobertura Alvo

### Alvo Mínimo (80%)

| Componente | Cobertura Alvo | Status |
|------------|---------------|--------|
| `backend/app/tools/meta_api.py` | 90%+ | 🔄 Em progresso |
| `backend/app/api/campaigns.py` | 85%+ | ⏳ Pendente |
| `frontend/src/lib/rate-limit.ts` | 100% | ✅ Completo |
| `frontend/src/lib/logger.ts` | 100% | ✅ Completo |
| `frontend/src/app/api/sync/route.ts` | 85%+ | ⏳ Pendente |
| `frontend/src/app/api/dashboard/route.ts` | 80%+ | ⏳ Pendente |

---

## Troubleshooting

### Backend

#### Erro: `ModuleNotFoundError: No module named 'app'`
```bash
# Solução: Adicionar diretório raiz ao PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/Users/guilhermecosta/Projetos/meta/backend"
```

#### Erro: `asyncio.exceptions.RuntimeWarning`
```bash
# Solução: Já configurado em pytest.ini com asyncio_mode = auto
```

#### Erro: `httpx.TimeoutException`
```bash
# Solução: Aumentar timeout nos testes
# Ou verificar se mock está configurado corretamente
```

---

### Frontend

#### Erro: `Cannot find module '@/lib/...'`
```bash
# Solução: Já configurado em vitest.config.ts com alias
```

#### Erro: `ReferenceError: global is not defined`
```bash
# Solução: Já configurado em vitest.config.ts com environment: 'jsdom'
```

#### Erro: `TypeError: vi is not defined`
```bash
# Solução: Adicionar `globals: true` em vitest.config.ts (já configurado)
```

---

## Próximos Passos

### Fase 1: Completar Backend Tests (Semana 1)
```bash
# 1. Executar testes existentes
cd backend
pytest backend/tests/test_meta_api.py -v

# 2. Verificar cobertura
pytest --cov=app.tools.meta_api --cov-report=term-missing

# 3. Implementar testes faltantes (TDD cycles 6-8)
# - test_api_campaigns.py
# - Aumentar cobertura para 90%+
```

### Fase 2: Completar Frontend Tests (Semana 2)
```bash
# 1. Executar testes existentes
cd frontend
npm run test

# 2. Verificar cobertura
npm run test:coverage

# 3. Implementar testes faltantes (TDD cycles 11-12)
# - app/api/sync/__tests__/route.test.ts
# - app/api/dashboard/__tests__/route.test.ts
```

### Fase 3: CI/CD (Semana 3)
```bash
# Configurar GitHub Actions para executar testes automaticamente
# Ver: .github/workflows/tests.yml
```

---

## Comandos Úteis

### Backend

```bash
# Limpar cache
pytest --cache-clear

# Verbose output
pytest -vv

# Mostrar print statements
pytest -s

# Parar no primeiro erro
pytest -x

# Executar último teste que falhou
pytest --lf

# Gerar relatório JUnit (para CI/CD)
pytest --junitxml=test-results.xml
```

### Frontend

```bash
# Limpar cache
npm run test -- --clearCache

# Executar apenas testes modificados
npm run test -- --changed

# Atualizar snapshots
npm run test -- -u

# Executar com debug
npm run test -- --inspect-brk

# Gerar relatório JSON
npm run test:coverage -- --reporter=json
```

---

## Recursos Adicionais

- **Pytest Docs**: https://docs.pytest.org/
- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **TDD Guide**: Kent Beck - "Test Driven Development: By Example"
- **Plano de Testes Completo**: `/Users/guilhermecosta/Projetos/meta/PLANO_TESTES.md`

---

## Suporte

Se encontrar problemas:
1. Verificar logs de erro
2. Consultar PLANO_TESTES.md
3. Executar testes em modo verbose (`-vv`)
4. Verificar configuração em `pytest.ini` ou `vitest.config.ts`
