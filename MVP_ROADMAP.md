# 🚀 MVP Roadmap - Meta Campaign Manager

## 🎯 Objetivo do MVP

Sistema funcional para **testar gerenciamento de campanhas Meta Ads** com:
- ✅ Dashboard com métricas em tempo real
- ✅ CRUD completo de campanhas
- ✅ Sincronização com Meta API
- ✅ Alertas de orçamento
- 🔄 Agente IA básico (opcional para MVP)

---

## 📊 Status Atual (2026-01-20)

### ✅ **O QUE JÁ ESTÁ PRONTO**

#### Frontend (90% completo)
- ✅ Autenticação (NextAuth.js)
- ✅ Dashboard com métricas
- ✅ Listagem de campanhas
- ✅ Criação de campanhas (wizard)
- ✅ Edição de campanhas
- ✅ Duplicação de campanhas
- ✅ Analytics (gráficos)
- ✅ Alertas
- ✅ Configurações (settings)
- ✅ Página de documentação
- ✅ Chat com agente IA
- ✅ UI/UX completa (shadcn/ui + Tailwind)
- ✅ Upload de mídias (Supabase Storage)

#### Backend (70% completo)
- ✅ FastAPI estruturado
- ✅ Agentes IA (Agno framework)
- ✅ Meta API integration
- ✅ Endpoints de campanhas
- ✅ Endpoints de sync
- ✅ Health checks

#### Database (100% completo)
- ✅ Schema Prisma completo
- ✅ Todas as tabelas criadas
- ✅ Relações entre entidades

### 🔴 **O QUE ESTÁ FALTANDO PARA MVP**

#### Configuração (CRÍTICO)
- ❌ OpenAI API Key não configurada no backend
- ❌ Database URL não configurada no backend
- ❌ Evolution API (WhatsApp) não configurada
- ❌ Variáveis de ambiente desorganizadas

#### Infraestrutura (IMPORTANTE)
- ❌ Docker Compose para rodar tudo junto
- ❌ Seed do banco com dados de teste
- ❌ Migrations Prisma estruturadas

#### Validação (IMPORTANTE)
- ❌ Testes end-to-end
- ❌ Validação de fluxo completo
- ❌ Tratamento de erros em produção

---

## 🗓️ PLANO DE AÇÃO - MVP EM 3 FASES

### **FASE 1: CONFIGURAR E RODAR** ⏱️ 2-3 horas

**Objetivo**: Ter frontend + backend rodando e conversando

#### 1.1 Organizar Variáveis de Ambiente
- [x] Criar `.env.example` na raiz
- [ ] Copiar para `.env` e preencher valores reais
- [ ] Validar todas as keys necessárias
- [ ] Documentar onde obter cada credencial

#### 1.2 Configurar Backend
- [ ] Adicionar `OPENAI_API_KEY` (obter em platform.openai.com)
- [ ] Adicionar `DATABASE_URL` (usar o mesmo do frontend)
- [ ] Testar conexão com Supabase
- [ ] Verificar se Meta API está funcionando

#### 1.3 Configurar Database
- [ ] Rodar `npx prisma db push` (criar tabelas)
- [ ] Criar seed básico (1 usuário + configurações)
- [ ] Testar login com usuário seed

#### 1.4 Docker Compose (Opcional para MVP1)
- [ ] Criar `docker-compose.yml` básico
- [ ] Testar build e start
- [ ] Validar comunicação entre serviços

**Entregável Fase 1**: Sistema rodando localmente ✅

---

### **FASE 2: TESTAR FUNCIONALIDADES CORE** ⏱️ 3-4 horas

**Objetivo**: Validar que todas as features principais funcionam

#### 2.1 Fluxo de Autenticação
- [ ] Testar login com credenciais válidas
- [ ] Testar login com credenciais inválidas
- [ ] Verificar redirecionamento para dashboard
- [ ] Testar logout

#### 2.2 Fluxo de Campanhas (CORE DO MVP)
- [ ] Sincronizar campanhas do Meta
  - [ ] Clicar em "Sincronizar"
  - [ ] Verificar se campanhas aparecem na lista
  - [ ] Validar métricas básicas
- [ ] Criar nova campanha
  - [ ] Preencher wizard completo
  - [ ] Salvar no banco
  - [ ] Enviar para Meta API
  - [ ] Validar criação no Meta Ads Manager
- [ ] Editar campanha existente
  - [ ] Alterar nome, budget, status
  - [ ] Salvar e verificar atualização
- [ ] Duplicar campanha
  - [ ] Clonar campanha existente
  - [ ] Verificar que foi criada nova campanha
- [ ] Pausar/Ativar campanha
  - [ ] Mudar status
  - [ ] Verificar atualização no Meta

#### 2.3 Dashboard e Métricas
- [ ] Verificar cards de métricas
  - [ ] Gasto hoje
  - [ ] Campanhas ativas
  - [ ] Impressões
  - [ ] Cliques
  - [ ] CTR
  - [ ] ROAS
- [ ] Verificar gráfico de gastos (7 dias)
- [ ] Verificar top campanhas
- [ ] Verificar orçamento mensal
  - [ ] Validar cálculo de porcentagem
  - [ ] Validar projeção de gastos

#### 2.4 Alertas
- [ ] Configurar limite de orçamento em Settings
- [ ] Simular gasto que atinja 50%
- [ ] Verificar se alerta aparece
- [ ] Testar marcar como lido

#### 2.5 Analytics
- [ ] Abrir página de analytics
- [ ] Verificar gráficos de performance
- [ ] Filtrar por período
- [ ] Validar dados com Meta Ads Manager

#### 2.6 Configurações
- [ ] Atualizar orçamento mensal
- [ ] Configurar alertas (50%, 80%, 100%)
- [ ] Salvar Meta Access Token
- [ ] Salvar Ad Account ID
- [ ] Testar conexão

**Entregável Fase 2**: Funcionalidades core validadas ✅

---

### **FASE 3: POLIMENTO E AGENTE IA** ⏱️ 2-3 horas

**Objetivo**: Deixar pronto para testes com usuários reais

#### 3.1 Agente IA (Opcional para MVP)
- [ ] Configurar OpenAI API Key
- [ ] Testar chat básico
- [ ] Validar respostas dos agentes:
  - [ ] Criador: "Crie uma campanha de vendas"
  - [ ] Analisador: "Como estão as campanhas?"
  - [ ] Otimizador: "Quais campanhas devo pausar?"
  - [ ] Notificador: "Envie relatório" (se Evolution API configurado)

#### 3.2 Tratamento de Erros
- [ ] Testar sem Meta API configurada
- [ ] Testar com token expirado
- [ ] Testar sem internet
- [ ] Validar mensagens de erro amigáveis
- [ ] Adicionar loading states onde faltam

#### 3.3 Performance e UX
- [ ] Testar velocidade de carregamento
- [ ] Validar responsividade (mobile)
- [ ] Verificar skeleton loaders
- [ ] Testar dark mode (já está ativo)

#### 3.4 Documentação de Uso
- [ ] Criar guia de "Primeiros Passos"
- [ ] Documentar como obter credenciais Meta
- [ ] Criar vídeo/GIF de demonstração (opcional)

**Entregável Fase 3**: MVP pronto para testes com usuários ✅

---

## 🎯 CRITÉRIOS DE SUCESSO DO MVP

Um usuário deve conseguir:

1. **Login** → Dashboard
2. **Conectar** sua conta Meta Ads (token + account ID)
3. **Sincronizar** campanhas existentes do Meta
4. **Ver métricas** em tempo real no dashboard
5. **Criar** uma nova campanha pelo wizard
6. **Editar** uma campanha (budget, status)
7. **Ver alertas** quando orçamento está alto
8. **Ver analytics** com gráficos de performance

**Tempo estimado de teste**: 15-20 minutos por usuário

---

## 🚫 O QUE FICA DE FORA DO MVP

### Features não essenciais (v2+):
- ❌ Notificações WhatsApp (Evolution API)
- ❌ Agente IA avançado (funciona, mas não é essencial)
- ❌ Relatórios PDF
- ❌ Múltiplas contas Meta
- ❌ A/B Testing automatizado
- ❌ Webhooks
- ❌ Exportação CSV/Excel
- ❌ Análise de sentimento
- ❌ Sugestões de criativos com IA

### Infraestrutura (pode ser manual):
- ❌ CI/CD automatizado
- ❌ Testes automatizados
- ❌ Deploy em produção
- ❌ Monitoring e logs estruturados

---

## 📋 CHECKLIST RÁPIDO - MVP MÍNIMO

### Pré-requisitos
- [ ] Node.js 20+ instalado
- [ ] Python 3.11+ instalado
- [ ] Conta Meta Developer (App criado)
- [ ] Conta Supabase (projeto criado)
- [ ] Conta OpenAI (API key gerada)

### Setup (30min)
- [ ] Clonar repo
- [ ] Copiar `.env.example` → `.env`
- [ ] Preencher variáveis:
  - [ ] `DATABASE_URL` (Supabase)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXTAUTH_SECRET` (gerar com `openssl rand -base64 32`)
  - [ ] `META_ACCESS_TOKEN`
  - [ ] `META_AD_ACCOUNT_ID`
  - [ ] `OPENAI_API_KEY`
- [ ] Frontend: `npm install` + `npx prisma db push` + `npm run dev`
- [ ] Backend: `pip install -r requirements.txt` + `uvicorn app.main:app --reload`

### Teste Básico (15min)
- [ ] Abrir http://localhost:3000
- [ ] Login com admin@metacampaigns.com / admin123
- [ ] Ir em Settings → preencher Meta API
- [ ] Clicar em "Sincronizar" no header
- [ ] Ver campanhas na lista
- [ ] Criar nova campanha
- [ ] Ver métricas no dashboard

### ✅ MVP APROVADO
- [ ] Consegui logar
- [ ] Consegui sincronizar campanhas
- [ ] Consegui criar campanha
- [ ] Consegui ver métricas
- [ ] Consegui editar campanha
- [ ] Não travou / não deu erro crítico

---

## 🔧 TROUBLESHOOTING RÁPIDO

### Frontend não carrega
1. Verificar se `npm run dev` está rodando sem erros
2. Verificar porta 3000 livre
3. Checar variáveis `NEXT_PUBLIC_*` no `.env`

### Backend não responde
1. Verificar se `uvicorn` está rodando em 8000
2. Checar `OPENAI_API_KEY` e `DATABASE_URL`
3. Ver logs do terminal

### Campanhas não sincronizam
1. Validar `META_ACCESS_TOKEN` não expirou
2. Verificar `META_AD_ACCOUNT_ID` tem prefixo `act_`
3. Confirmar permissões do token (ads_management, ads_read)

### Agente IA não funciona
1. Validar `OPENAI_API_KEY` está correta
2. Verificar créditos na conta OpenAI
3. Ver logs do backend para erros específicos

---

## 📅 TIMELINE ESTIMADO

| Fase | Tempo | Responsável |
|------|-------|-------------|
| **Fase 1**: Configurar | 2-3h | Dev/Ops |
| **Fase 2**: Testar Core | 3-4h | QA/Product |
| **Fase 3**: Polimento | 2-3h | Dev |
| **TOTAL** | **7-10h** | - |

**Data alvo MVP**: 2-3 dias úteis

---

## 🚀 PRÓXIMO PASSO AGORA

**COMEÇAR FASE 1 - ITEM 1.1**

Quer que eu crie o `.env.example` estruturado com todas as variáveis necessárias?

