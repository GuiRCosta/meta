# 🎯 Integração: Everything Claude Code → Meta Campaign Manager

## 📁 Repositório Clonado

**Localização**: `/tmp/everything-claude-code`

**Fonte**: https://github.com/affaan-m/everything-claude-code.git

---

## 🎨 Estrutura Disponível

```
everything-claude-code/
├── agents/           # 9 agentes especializados
├── skills/           # 7 skills + workflows
├── commands/         # 9 slash commands
├── rules/            # 8 rules sempre-ativas
├── hooks/            # Automações baseadas em eventos
├── mcp-configs/      # Configs de MCP servers
└── examples/         # Exemplos de configuração
```

---

## ✅ Skills Úteis para Meta Campaign Manager

### 1. **backend-patterns.md** → Melhorar Backend FastAPI

**Por que usar**:
- Padronizar estrutura de APIs
- Implementar Repository Pattern para Meta API
- Melhorar organização do backend

**Como integrar**:
```bash
# Copiar para o projeto
cp /tmp/everything-claude-code/skills/backend-patterns.md \
   ~/.claude/skills/
```

**Aplicação no projeto**:
- Refatorar `backend/app/tools/meta_api.py` com Repository Pattern
- Separar lógica de negócio (Service Layer) de acesso a dados
- Padronizar endpoints da API

---

### 2. **frontend-patterns.md** → Padronizar Frontend Next.js

**Por que usar**:
- Patterns para React/Next.js
- Otimizações de performance
- Server/Client components

**Como integrar**:
```bash
cp /tmp/everything-claude-code/skills/frontend-patterns.md \
   ~/.claude/skills/
```

**Aplicação no projeto**:
- Revisar components em `frontend/src/components/`
- Otimizar data fetching (Dashboard, Analytics)
- Implementar Server Components onde aplicável

---

### 3. **coding-standards.md** → Garantir Qualidade de Código

**Por que usar**:
- Padrões de código TypeScript/Python
- Best practices de organização
- Code review guidelines

**Como integrar**:
```bash
cp /tmp/everything-claude-code/skills/coding-standards.md \
   ~/.claude/skills/
```

**Aplicação no projeto**:
- Revisar código TypeScript do frontend
- Aplicar padrões Python no backend
- Criar guidelines para novos desenvolvedores

---

### 4. **tdd-workflow/** → Implementar Testes

**Por que usar**:
- Workflow de TDD (Test-Driven Development)
- Garantir 80%+ de cobertura de testes
- Evitar regressões

**Como integrar**:
```bash
cp -r /tmp/everything-claude-code/skills/tdd-workflow \
      ~/.claude/skills/
```

**Aplicação no projeto**:
- Criar testes para Meta API integration
- Testar endpoints do backend
- Testar componentes críticos (Dashboard, Analytics)

---

### 5. **security-review/** → Validar Segurança

**Por que usar**:
- Checklist de segurança
- Validar tokens, APIs, secrets
- Prevenir vulnerabilidades

**Como integrar**:
```bash
cp -r /tmp/everything-claude-code/skills/security-review \
      ~/.claude/skills/
```

**Aplicação no projeto**:
- Revisar armazenamento de `META_ACCESS_TOKEN`
- Validar autenticação NextAuth
- Verificar permissões de API

---

## 🤖 Agentes Úteis para o Projeto

### 1. **planner.md** → Planejar Features

**Quando usar**: Antes de implementar sincronização de insights

```bash
cp /tmp/everything-claude-code/agents/planner.md \
   ~/.claude/agents/
```

**Como usar**:
```bash
# No Claude Code CLI
/plan Implementar sincronização de insights da Meta API
```

---

### 2. **code-reviewer.md** → Revisar Código

**Quando usar**: Após implementar features críticas

```bash
cp /tmp/everything-claude-code/agents/code-reviewer.md \
   ~/.claude/agents/
```

**Como usar**:
```bash
/code-review backend/app/tools/meta_api.py
```

---

### 3. **build-error-resolver.md** → Resolver Erros de Build

**Quando usar**: Quando frontend/backend não compila

```bash
cp /tmp/everything-claude-code/agents/build-error-resolver.md \
   ~/.claude/agents/
```

**Como usar**:
```bash
/build-fix
```

---

### 4. **security-reviewer.md** → Revisar Segurança

**Quando usar**: Antes de deploy

```bash
cp /tmp/everything-claude-code/agents/security-reviewer.md \
   ~/.claude/agents/
```

**Como usar**:
```bash
/security-review frontend/.env.local backend/.env
```

---

## 📋 Commands Úteis para o Projeto

### 1. **/tdd** → Test-Driven Development

```bash
cp /tmp/everything-claude-code/commands/tdd.md \
   ~/.claude/commands/
```

**Uso**:
```bash
/tdd Criar testes para sincronização de insights
```

---

### 2. **/plan** → Planejar Implementação

```bash
cp /tmp/everything-claude-code/commands/plan.md \
   ~/.claude/commands/
```

**Uso**:
```bash
/plan Implementar dashboard com métricas em tempo real
```

---

### 3. **/code-review** → Revisar Código

```bash
cp /tmp/everything-claude-code/commands/code-review.md \
   ~/.claude/commands/
```

**Uso**:
```bash
/code-review frontend/src/app/api/dashboard/route.ts
```

---

### 4. **/update-docs** → Atualizar Documentação

```bash
cp /tmp/everything-claude-code/commands/update-docs.md \
   ~/.claude/commands/
```

**Uso**:
```bash
/update-docs README.md MVP_ROADMAP.md
```

---

## 🔒 Rules Essenciais

### 1. **security.md** → Segurança Obrigatória

```bash
cp /tmp/everything-claude-code/rules/security.md \
   ~/.claude/rules/
```

**Previne**:
- Hardcoded secrets em código
- Commits com tokens expostos
- Vulnerabilidades conhecidas

---

### 2. **coding-style.md** → Padrão de Código

```bash
cp /tmp/everything-claude-code/rules/coding-style.md \
   ~/.claude/rules/
```

**Garante**:
- Imutabilidade (const > let)
- Arquivos < 500 linhas
- Funções < 50 linhas

---

### 3. **testing.md** → Cobertura de Testes

```bash
cp /tmp/everything-claude-code/rules/testing.md \
   ~/.claude/rules/
```

**Garante**:
- TDD para features críticas
- 80%+ de cobertura
- Testes unitários + integração

---

### 4. **git-workflow.md** → Git Guidelines

```bash
cp /tmp/everything-claude-code/rules/git-workflow.md \
   ~/.claude/rules/
```

**Padroniza**:
- Formato de commits
- Processo de PR
- Branching strategy

---

## 🎬 Instalação Rápida

### Opção 1: Copiar Tudo

```bash
# Copiar todos os agentes
cp /tmp/everything-claude-code/agents/*.md ~/.claude/agents/

# Copiar todas as skills
cp -r /tmp/everything-claude-code/skills/* ~/.claude/skills/

# Copiar todos os commands
cp /tmp/everything-claude-code/commands/*.md ~/.claude/commands/

# Copiar todas as rules
cp /tmp/everything-claude-code/rules/*.md ~/.claude/rules/
```

---

### Opção 2: Copiar Seletivamente (Recomendado)

```bash
# Apenas essenciais para Meta Campaign Manager

# Agentes
cp /tmp/everything-claude-code/agents/planner.md ~/.claude/agents/
cp /tmp/everything-claude-code/agents/code-reviewer.md ~/.claude/agents/
cp /tmp/everything-claude-code/agents/security-reviewer.md ~/.claude/agents/

# Skills
cp /tmp/everything-claude-code/skills/backend-patterns.md ~/.claude/skills/
cp /tmp/everything-claude-code/skills/frontend-patterns.md ~/.claude/skills/
cp /tmp/everything-claude-code/skills/coding-standards.md ~/.claude/skills/
cp -r /tmp/everything-claude-code/skills/security-review ~/.claude/skills/

# Commands
cp /tmp/everything-claude-code/commands/plan.md ~/.claude/commands/
cp /tmp/everything-claude-code/commands/code-review.md ~/.claude/commands/
cp /tmp/everything-claude-code/commands/tdd.md ~/.claude/commands/

# Rules
cp /tmp/everything-claude-code/rules/security.md ~/.claude/rules/
cp /tmp/everything-claude-code/rules/coding-style.md ~/.claude/rules/
cp /tmp/everything-claude-code/rules/testing.md ~/.claude/rules/
```

---

## 🚀 Como Usar no Projeto Atual

### Cenário 1: Implementar Sincronização de Insights

```bash
# 1. Planejar feature
/plan Implementar sincronização de insights da Meta API para tabela CampaignMetric

# 2. Aplicar TDD
/tdd Criar testes para sync_campaign_insights()

# 3. Revisar código após implementação
/code-review backend/app/tools/meta_api.py

# 4. Validar segurança
/security-review backend/app/tools/meta_api.py
```

---

### Cenário 2: Otimizar Dashboard

```bash
# 1. Planejar otimizações
/plan Otimizar performance do dashboard usando Server Components

# 2. Aplicar frontend patterns
# (skill carregada automaticamente)

# 3. Revisar implementação
/code-review frontend/src/app/(dashboard)/page.tsx
```

---

### Cenário 3: Refatorar Backend

```bash
# 1. Planejar refatoração
/plan Refatorar meta_api.py usando Repository Pattern

# 2. Aplicar backend patterns
# (skill carregada automaticamente)

# 3. Implementar com TDD
/tdd Criar testes para MarketRepository

# 4. Revisar código
/code-review backend/app/tools/meta_api.py
```

---

## 📊 Prioridades para MVP

### 🔴 Alta Prioridade (Usar Agora)

1. **security.md** (rule) - Validar tokens e secrets
2. **planner.md** (agent) - Planejar sincronização de insights
3. **backend-patterns.md** (skill) - Refatorar meta_api.py

### 🟡 Média Prioridade (Próximas Sprints)

1. **tdd-workflow** (skill) - Adicionar testes
2. **code-reviewer.md** (agent) - Revisar código crítico
3. **frontend-patterns.md** (skill) - Otimizar Dashboard

### 🟢 Baixa Prioridade (Pós-MVP)

1. **e2e-runner.md** (agent) - Testes end-to-end
2. **doc-updater.md** (agent) - Manter docs atualizados
3. **refactor-cleaner.md** (agent) - Limpar código morto

---

## 🎯 Próximo Passo

**Escolha uma opção**:

### A) Instalar skills essenciais agora
```bash
# Executar Opção 2 (Copiar Seletivamente)
```

### B) Usar planner para sincronização de insights
```bash
# Copiar planner.md e executar /plan
cp /tmp/everything-claude-code/agents/planner.md ~/.claude/agents/
```

### C) Aplicar backend-patterns ao meta_api.py
```bash
# Copiar skill e refatorar código
cp /tmp/everything-claude-code/skills/backend-patterns.md ~/.claude/skills/
```

---

**Qual opção você prefere?**

1. **A** - Instalar tudo e organizar ambiente
2. **B** - Planejar implementação de insights (crítico para MVP)
3. **C** - Refatorar backend com patterns (melhoria de código)
