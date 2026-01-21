# ✅ Instalação Everything Claude Code - COMPLETA

**Data**: 2026-01-20
**Repositório**: https://github.com/affaan-m/everything-claude-code.git
**Localização**: `/tmp/everything-claude-code`

---

## 📦 O Que Foi Instalado

### ✅ Agentes (9) → `~/.claude/agents/`

| Agente | Função | Quando Usar |
|--------|--------|-------------|
| `planner.md` | Planejamento de features | Antes de implementar novas funcionalidades |
| `architect.md` | Decisões de arquitetura | Design de sistemas e escolhas técnicas |
| `code-reviewer.md` | Revisão de código | Após implementação, antes de commit |
| `security-reviewer.md` | Análise de segurança | Revisão de vulnerabilidades |
| `tdd-guide.md` | Test-Driven Development | Guiar desenvolvimento com testes |
| `build-error-resolver.md` | Resolver erros de build | Quando build falha |
| `e2e-runner.md` | Testes E2E Playwright | Criar/rodar testes end-to-end |
| `refactor-cleaner.md` | Limpeza de código morto | Remover código não usado |
| `doc-updater.md` | Sincronizar documentação | Manter docs atualizados |

---

### ✅ Skills (7) → `~/.claude/skills/`

| Skill | Descrição | Aplicação no Meta Campaign Manager |
|-------|-----------|-------------------------------------|
| `backend-patterns.md` | Patterns de backend (APIs, DB, cache) | Refatorar `meta_api.py`, criar Repository Pattern |
| `frontend-patterns.md` | Patterns React/Next.js | Otimizar Dashboard, Analytics |
| `coding-standards.md` | Best practices TypeScript/Python | Padronizar código do projeto |
| `tdd-workflow/` | Metodologia TDD | Criar testes para sincronização de insights |
| `security-review/` | Checklist de segurança | Validar tokens, secrets, APIs |
| `clickhouse-io.md` | Analytics ClickHouse | (Não aplicável no MVP) |
| `project-guidelines-example.md` | Exemplo de guidelines | Template para criar `CLAUDE.md` |

---

### ✅ Commands (9) → `~/.claude/commands/`

| Command | Função | Exemplo de Uso |
|---------|--------|----------------|
| `/plan` | Planejar implementação | `/plan Implementar sincronização de insights` |
| `/tdd` | Test-Driven Development | `/tdd Criar testes para meta_api.py` |
| `/code-review` | Revisar código | `/code-review backend/app/tools/meta_api.py` |
| `/build-fix` | Resolver erros de build | `/build-fix` |
| `/e2e` | Gerar testes E2E | `/e2e Testar fluxo de criação de campanha` |
| `/refactor-clean` | Remover código morto | `/refactor-clean` |
| `/test-coverage` | Análise de cobertura | `/test-coverage` |
| `/update-codemaps` | Atualizar mapas de código | `/update-codemaps` |
| `/update-docs` | Sincronizar documentação | `/update-docs README.md` |

---

### ✅ Rules (8) → `~/.claude/rules/`

| Rule | Aplica | Previne/Garante |
|------|--------|-----------------|
| `security.md` | Sempre | Sem secrets hardcoded, validação de inputs |
| `coding-style.md` | Sempre | Imutabilidade, arquivos < 500 linhas |
| `testing.md` | Sempre | TDD, cobertura 80%+ |
| `git-workflow.md` | Sempre | Formato de commits, PRs |
| `agents.md` | Sempre | Quando delegar para subagentes |
| `performance.md` | Sempre | Seleção de modelo, gestão de contexto |
| `patterns.md` | Sempre | Formatos de API, hooks |
| `hooks.md` | Sempre | Documentação de hooks |

---

### ✅ Hooks → `~/.claude/settings.json`

**Hooks instalados**:

#### **PreToolUse** (antes de executar ferramenta):
1. **Block dev servers fora de tmux** - Dev servers devem rodar em tmux
2. **Reminder para tmux** - Sugestão de usar tmux para comandos longos
3. **Pause before git push** - Revisar antes de push
4. **Block .md files** - Evitar criação de arquivos .md desnecessários

#### **PostToolUse** (depois de executar ferramenta):
1. **Log PR URL** - Após criar PR, mostra URL e comando de review
2. **Auto-format Prettier** - Formata JS/TS após edições
3. **TypeScript check** - Valida TypeScript após edições
4. **Warn console.log** - Avisa sobre console.log em código

#### **Stop** (ao encerrar sessão):
1. **Final audit console.log** - Verifica console.log antes de encerrar

---

## 🎯 Como Usar no Meta Campaign Manager

### Exemplo 1: Planejar Sincronização de Insights

```bash
# 1. Usar comando /plan
/plan Implementar sincronização de insights da Meta API para tabela CampaignMetric

# O agente planner.md será ativado automaticamente
# Ele vai:
# - Analisar arquivos existentes (meta_api.py, dashboard/route.ts)
# - Criar plano detalhado de implementação
# - Identificar arquivos críticos
# - Sugerir abordagem
```

---

### Exemplo 2: Implementar com TDD

```bash
# 1. Usar comando /tdd
/tdd Criar função sync_campaign_insights() em meta_api.py

# O agente tdd-guide.md será ativado
# Ele vai:
# - Criar testes primeiro (RED)
# - Implementar código mínimo (GREEN)
# - Refatorar (REFACTOR)
# - Validar cobertura 80%+
```

---

### Exemplo 3: Revisar Código Crítico

```bash
# 1. Revisar backend
/code-review backend/app/tools/meta_api.py

# O agente code-reviewer.md será ativado
# Ele vai:
# - Analisar qualidade de código
# - Identificar code smells
# - Sugerir melhorias
# - Validar segurança
```

---

### Exemplo 4: Validar Segurança

```bash
# 1. Revisar variáveis de ambiente
/security-review frontend/.env.local backend/.env

# O agente security-reviewer.md será ativado
# Ele vai:
# - Verificar secrets expostos
# - Validar permissões de API
# - Checar vulnerabilidades conhecidas
# - Sugerir melhorias de segurança
```

---

## 🔧 Configuração Adicional Recomendada

### 1. Criar `CLAUDE.md` no Projeto

```bash
# Copiar template
cp /tmp/everything-claude-code/examples/CLAUDE.md \
   /Users/guilhermecosta/Projetos/meta/CLAUDE.md

# Editar e customizar para o Meta Campaign Manager
```

**O que incluir**:
- Visão geral do projeto
- Stack técnica (Next.js, FastAPI, Prisma, Supabase, Meta API)
- Estrutura de arquivos
- Regras específicas do projeto
- Convenções de nomenclatura

---

### 2. Configurar MCP Servers (Opcional)

```bash
# Ver MCPs disponíveis
cat /tmp/everything-claude-code/mcp-configs/mcp-servers.json

# Adicionar ao ~/.claude.json (se quiser GitHub, Supabase, etc.)
```

**MCPs úteis para o projeto**:
- GitHub MCP (gerenciar PRs, issues)
- Supabase MCP (queries diretas ao DB)
- Docker MCP (gerenciar containers)

---

## 📊 Status Atual

### ✅ Instalado e Funcionando

- ✅ 9 Agentes instalados
- ✅ 7 Skills instaladas
- ✅ 9 Commands instalados
- ✅ 8 Rules instaladas
- ✅ Hooks configurados em settings.json

### 🎯 Pronto Para Usar

Agora você pode usar comandos como:

```bash
/plan Implementar sincronização de insights
/tdd Criar testes para meta_api
/code-review backend/app/tools/meta_api.py
/security-review frontend/.env.local
```

---

## 🚀 Próximo Passo Recomendado

### Opção A: Planejar Sincronização de Insights (MVP Crítico)

```bash
/plan Implementar sincronização de insights da Meta API para popular tabela CampaignMetric com métricas (spend, impressions, clicks, CTR, ROAS)
```

### Opção B: Revisar Segurança do Projeto

```bash
/security-review frontend/.env.local backend/.env backend/app/tools/meta_api.py
```

### Opção C: Criar CLAUDE.md do Projeto

Documentar estrutura, regras e conventions específicas do Meta Campaign Manager.

---

## 📚 Recursos

- **Guia Completo**: https://x.com/affaanmustafa/status/2012378465664745795
- **Repo Original**: https://github.com/affaan-m/everything-claude-code
- **Integração Local**: [INTEGRACAO_CLAUDE_CODE_SKILLS.md](INTEGRACAO_CLAUDE_CODE_SKILLS.md)

---

## ⚠️ Importante

### Gestão de Contexto

- Não ativar todos os MCPs ao mesmo tempo
- Manter < 10 MCPs ativos por projeto
- Manter < 80 tools ativas

### Customização

Os configs são um ponto de partida. Você deve:
1. Usar o que faz sentido para o projeto
2. Modificar para seu stack
3. Remover o que não usa
4. Adicionar seus próprios patterns

---

**✅ Instalação completa! Everything Claude Code está pronto para uso.**
