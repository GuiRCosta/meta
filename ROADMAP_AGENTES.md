# 🗺️ Roadmap de Melhorias - Agentes IA (Agno)

## 🎯 Objetivo
Evoluir a arquitetura multi-agente mantendo **Agno** como framework base, implementando melhorias de produção que aumentam **robustez**, **inteligência** e **automação**.

## 📊 Visão Geral

| Melhoria | Impacto | Esforço | ROI | Prioridade |
|----------|---------|---------|-----|------------|
| **1. Memória Persistente** | 🔥 Alto | 2-3h | ⭐⭐⭐⭐⭐ | 1️⃣ FAZER JÁ |
| **2. Supervisor/Validação** | 🔥 Muito Alto | 2d | ⭐⭐⭐⭐⭐ | 2️⃣ CRÍTICO |
| **3. Retry + Timeout** | 🔥 Alto | 4-6h | ⭐⭐⭐⭐ | 3️⃣ IMPORTANTE |
| **4. Scheduler (Tarefas Agendadas)** | 🔥 Alto | 1d | ⭐⭐⭐⭐ | 4️⃣ IMPORTANTE |
| **5. Streaming Rico** | 🔥 Médio | 1d | ⭐⭐⭐ | 5️⃣ MELHORIA |
| **6. Cache Inteligente** | 🔥 Médio | 4-6h | ⭐⭐⭐ | 6️⃣ MELHORIA |
| **7. Prompts Modulares** | 🔥 Médio | 6-8h | ⭐⭐ | 7️⃣ FUTURO |

**Tempo Total Estimado**: 8-10 dias úteis

---

## 📅 Cronograma Detalhado

### **Semana 1: Fundação Robusta**
**Objetivo**: Adicionar resiliência e contexto

#### Segunda-feira (2-3h)
- [ ] **Melhoria #1: Memória Persistente**
  - Implementar `PostgresAgentMemory` do Agno
  - Configurar namespace por usuário
  - Testar persistência entre sessões
  - Migrar endpoints para usar sessões

#### Terça-feira (4h) + Quarta-feira (2h)
- [ ] **Melhoria #3: Retry + Timeout** 
  - Instalar `tenacity` package
  - Adicionar decorador `@retry` em todas as tools
  - Configurar timeouts (30s Meta API, 10s WhatsApp)
  - Testar com API fora do ar

#### Quinta-feira + Sexta-feira (2 dias)
- [ ] **Melhoria #2: Supervisor/Validação**
  - Criar `SupervisorAgent` class
  - Implementar validações para ações críticas
  - Integrar aprovação humana via WhatsApp
  - Adicionar logging de decisões

**Entregável Semana 1**: Sistema com memória, resiliente a falhas, com validação de ações críticas

---

### **Semana 2: Automação Inteligente**
**Objetivo**: Proatividade e agendamento

#### Segunda-feira (1 dia)
- [ ] **Melhoria #4: Scheduler**
  - Instalar `APScheduler`
  - Implementar jobs: relatório diário, check orçamento, otimização noturna
  - Configurar cron triggers
  - Testar execuções agendadas

#### Terça-feira + Quarta-feira (1 dia)
- [ ] **Melhoria #5: Streaming Rico**
  - Refatorar streaming para incluir eventos
  - Adicionar indicadores de agente ativo
  - Mostrar tools sendo executadas
  - Atualizar frontend para consumir eventos

#### Quinta-feira + Sexta-feira
- [ ] **Testes End-to-End**
  - Testar todos os fluxos principais
  - Validar scheduler em produção
  - Monitorar performance
  - Ajustar timeouts se necessário

**Entregável Semana 2**: Sistema totalmente automatizado com streaming avançado

---

### **Semana 3: Otimização**
**Objetivo**: Performance e UX

#### Segunda-feira (4-6h)
- [ ] **Melhoria #6: Cache Inteligente**
  - Implementar `CachedTools` class
  - Adicionar cache em metrics/insights
  - Configurar TTL por tipo de dado
  - Implementar invalidação inteligente

#### Terça-feira (6-8h)
- [ ] **Melhoria #7: Prompts Modulares**
  - Criar `PromptManager` class
  - Migrar prompts para templates
  - Adicionar personalização por usuário
  - Testar A/B de prompts

#### Quarta-feira + Quinta-feira
- [ ] **Refatoração e Cleanup**
  - Organizar código em módulos
  - Adicionar type hints completos
  - Documentar todas as classes
  - Escrever testes unitários

#### Sexta-feira
- [ ] **Deploy e Monitoramento**
  - Deploy em staging
  - Monitorar logs e métricas
  - Ajustar configurações
  - Deploy em produção

**Entregável Semana 3**: Sistema otimizado, documentado e em produção

---

### **Semana 4: Polimento** (Opcional)
**Objetivo**: Refinamentos e melhorias incrementais

- [ ] Adicionar métricas de observabilidade
- [ ] Criar dashboard de saúde dos agentes
- [ ] Implementar rate limiting
- [ ] Adicionar alertas de erro
- [ ] Otimizar custos OpenAI

---

## 🔧 Detalhamento Técnico

### **1. Memória Persistente** ⭐⭐⭐⭐⭐

**Arquivo**: `backend/app/memory/manager.py`

```python
from agno.memory import PostgresAgentMemory
from app.config import settings

class MemoryManager:
    """Gerencia memória persistente dos agentes."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.memory = PostgresAgentMemory(
            db_url=settings.database_url,
            user_id=user_id,
            namespace="meta_campaigns"
        )
    
    def get_team_with_memory(self, session_id: str):
        """Retorna team com memória persistente."""
        from app.agents.team import get_agent_team
        
        team = get_agent_team()
        team.memory = self.memory
        team.session_id = session_id
        
        return team
```

**Alterações Necessárias**:
- Criar tabela `agent_memory` no Supabase
- Atualizar `app/api/agents/chat.py` para usar `MemoryManager`
- Adicionar `session_id` nas requisições do frontend

**Testes**:
```python
# Teste: contexto persistente
team = manager.get_team_with_memory("session_123")
await team.arun("Crie campanha X")
# ... nova instância
team2 = manager.get_team_with_memory("session_123")
await team2.arun("Pause campanha X")  # Deve lembrar!
```

---

### **2. Supervisor/Validação** ⭐⭐⭐⭐⭐

**Arquivo**: `backend/app/agents/supervisor.py`

```python
class SupervisorAgent:
    """Valida ações críticas antes de executar."""
    
    CRITICAL_ACTIONS = [
        "pause_campaign",
        "delete_campaign",
        "update_budget"
    ]
    
    async def validate_action(
        self,
        action: str,
        params: dict,
        context: dict
    ) -> dict:
        """
        Valida se ação é segura.
        
        Returns:
            {
                "approved": bool,
                "requires_human_approval": bool,
                "warnings": List[str],
                "suggested_action": str
            }
        """
        if action not in self.CRITICAL_ACTIONS:
            return {"approved": True}
        
        # Implementar validações específicas
        validator = getattr(self, f"_validate_{action}")
        return await validator(params, context)
    
    async def _validate_pause_campaign(self, params, context):
        """Valida antes de pausar campanha."""
        campaign_id = params["campaign_id"]
        
        # Buscar dados
        campaign = await get_campaign_details(campaign_id)
        metrics = await get_campaign_insights(campaign_id, "last_7d")
        
        warnings = []
        
        # Regras de validação
        if metrics["ctr"] > 2.0:
            warnings.append(
                f"⚠️ CTR alto ({metrics['ctr']:.2f}%) - "
                "pausar pode impactar resultados"
            )
        
        if metrics["spend"] > 1000:
            warnings.append(
                f"⚠️ Gasto alto (R$ {metrics['spend']:.2f}) - confirmar?"
            )
        
        # Verificar se é única ativa
        active = await list_campaigns(status="ACTIVE")
        if len(active["campaigns"]) == 1:
            warnings.append(
                "⚠️ Última campanha ativa - conta ficará sem anúncios!"
            )
        
        if warnings:
            return {
                "approved": False,
                "requires_human_approval": True,
                "warnings": warnings,
                "suggested_action": "Revisar antes de pausar"
            }
        
        return {"approved": True}
```

**Integração**:
```python
# Em optimizer.py
supervisor = SupervisorAgent()

async def pause_campaign_safe(campaign_id, reason):
    validation = await supervisor.validate_action(
        "pause_campaign",
        {"campaign_id": campaign_id},
        {"reason": reason}
    )
    
    if not validation["approved"]:
        if validation["requires_human_approval"]:
            # Enviar WhatsApp pedindo aprovação
            await request_human_approval(
                action="Pausar campanha",
                warnings=validation["warnings"]
            )
            return {"status": "pending_approval"}
    
    # Prosseguir
    return await pause_campaign(campaign_id, reason)
```

---

### **3. Retry + Timeout** ⭐⭐⭐⭐

**Arquivo**: `backend/app/tools/resilient.py`

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import asyncio
import httpx

class ResilientTools:
    """Wrapper para tools com retry e timeout."""
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, asyncio.TimeoutError))
    )
    async def create_campaign_resilient(
        self,
        name: str,
        objective: str,
        status: str = "PAUSED",
        daily_budget: int = None
    ) -> dict:
        """Cria campanha com retry automático."""
        try:
            async with asyncio.timeout(30):  # 30s timeout
                result = await create_campaign(
                    name=name,
                    objective=objective,
                    status=status,
                    daily_budget=daily_budget
                )
                
                # Se API retornar 5xx, lançar exceção para retry
                if not result["success"] and "5" in str(result.get("status_code", "")):
                    raise httpx.HTTPStatusError(
                        f"Meta API erro: {result['error']}",
                        request=None,
                        response=None
                    )
                
                return result
                
        except asyncio.TimeoutError:
            logger.error(f"Timeout ao criar campanha: {name}")
            return {
                "success": False,
                "error": "Meta API não respondeu em 30s"
            }
        except Exception as e:
            logger.error(f"Erro ao criar campanha: {e}")
            return {
                "success": False,
                "error": str(e)
            }
```

**Aplicar em todas as tools**:
- Meta API: timeout 30s, 3 retries
- WhatsApp: timeout 10s, 2 retries
- Database: timeout 5s, sem retry (fail fast)

---

### **4. Scheduler (Tarefas Agendadas)** ⭐⭐⭐⭐

**Arquivo**: `backend/app/scheduler/jobs.py`

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

class AgentScheduler:
    """Gerencia tarefas agendadas dos agentes."""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    def setup(self):
        """Configura todos os jobs."""
        
        # Relatório diário às 18h
        self.scheduler.add_job(
            func=self.daily_report,
            trigger=CronTrigger(hour=18, minute=0),
            id="daily_report",
            name="Relatório Diário WhatsApp",
            replace_existing=True
        )
        
        # Verificar orçamento (a cada hora)
        self.scheduler.add_job(
            func=self.check_budget,
            trigger=CronTrigger(minute=0),
            id="budget_check",
            name="Verificação de Orçamento"
        )
        
        # Otimização automática (23h)
        self.scheduler.add_job(
            func=self.auto_optimize,
            trigger=CronTrigger(hour=23, minute=0),
            id="auto_optimize",
            name="Otimização Automática"
        )
        
        # Sync métricas (30 em 30 min)
        self.scheduler.add_job(
            func=self.sync_metrics,
            trigger="interval",
            minutes=30,
            id="sync_metrics"
        )
        
    async def daily_report(self):
        """Job: Relatório diário."""
        # Buscar todos os usuários com WhatsApp ativo
        users = await get_users_with_whatsapp_enabled()
        
        for user in users:
            try:
                team = get_team_for_user(user["id"])
                await team.arun(
                    f"Envie o relatório diário para {user['whatsapp_number']}"
                )
            except Exception as e:
                logger.error(f"Erro ao enviar relatório para {user['id']}: {e}")
    
    async def check_budget(self):
        """Job: Verificar orçamento."""
        users = await get_all_users()
        
        for user in users:
            summary = await get_monthly_summary(user["id"])
            settings = await get_user_settings(user["id"])
            
            percent = (summary["total_spend"] / settings["monthly_budget_limit"]) * 100
            
            # Alertar se necessário
            if percent >= 100 and settings["alert_at_100_percent"]:
                await send_budget_alert(user, percent, "critical")
            elif percent >= 80 and settings["alert_at_80_percent"]:
                await send_budget_alert(user, percent, "warning")
    
    def start(self):
        """Inicia o scheduler."""
        self.setup()
        self.scheduler.start()
        logger.info("✅ Scheduler iniciado com sucesso!")

# No main.py
@app.on_event("startup")
async def startup():
    scheduler = AgentScheduler()
    scheduler.start()
```

---

### **5. Streaming Rico** ⭐⭐⭐

**Arquivo**: `backend/app/agents/streaming.py`

```python
from typing import AsyncGenerator
from enum import Enum

class StreamEventType(str, Enum):
    STATUS = "status"
    AGENT_SWITCH = "agent_switch"
    TOOL_CALL = "tool_call"
    CONTENT = "content"
    COMPLETE = "complete"
    ERROR = "error"

async def stream_with_events(
    team,
    message: str
) -> AsyncGenerator[dict, None]:
    """Stream com eventos ricos."""
    
    # Evento: início
    yield {
        "type": StreamEventType.STATUS,
        "content": "🤔 Processando sua solicitação..."
    }
    
    try:
        async for chunk in team.arun_stream(message):
            # Detectar mudança de agente
            if hasattr(chunk, "agent"):
                yield {
                    "type": StreamEventType.AGENT_SWITCH,
                    "agent": chunk.agent,
                    "content": f"🤖 {chunk.agent} está trabalhando..."
                }
            
            # Detectar execução de tool
            if hasattr(chunk, "tool_call"):
                yield {
                    "type": StreamEventType.TOOL_CALL,
                    "tool": chunk.tool_call.name,
                    "params": chunk.tool_call.args,
                    "content": f"🔧 Executando: {chunk.tool_call.name}..."
                }
            
            # Conteúdo da resposta
            if chunk.content:
                yield {
                    "type": StreamEventType.CONTENT,
                    "content": chunk.content
                }
        
        # Evento: sucesso
        yield {
            "type": StreamEventType.COMPLETE,
            "content": "✅ Concluído!"
        }
        
    except Exception as e:
        # Evento: erro
        yield {
            "type": StreamEventType.ERROR,
            "content": f"❌ Erro: {str(e)}"
        }
```

**Frontend (Next.js)**:
```typescript
// app/components/ChatStream.tsx
async function handleStream(message: string) {
  const response = await fetch('/api/agent/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ message })
  })
  
  const reader = response.body.getReader()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const event = JSON.parse(value)
    
    switch (event.type) {
      case 'agent_switch':
        setActiveAgent(event.agent)  // UI mostra qual agente
        break
      case 'tool_call':
        showToolProgress(event.tool)  // Spinner com nome da tool
        break
      case 'content':
        appendMessage(event.content)  // Adiciona ao chat
        break
    }
  }
}
```

---

### **6. Cache Inteligente** ⭐⭐⭐

**Arquivo**: `backend/app/cache/manager.py`

```python
from datetime import datetime, timedelta
import hashlib
from typing import Optional, Any

class CacheManager:
    """Gerencia cache de tools."""
    
    def __init__(self):
        self.cache = {}  # {key: (data, expiry)}
        self.default_ttl = 300  # 5 minutos
    
    def _key(self, func_name: str, **kwargs) -> str:
        """Gera chave única."""
        params = str(sorted(kwargs.items()))
        return hashlib.md5(f"{func_name}:{params}".encode()).hexdigest()
    
    async def get_or_fetch(
        self,
        func_name: str,
        fetcher: callable,
        ttl: Optional[int] = None,
        **kwargs
    ) -> Any:
        """Busca do cache ou executa fetcher."""
        key = self._key(func_name, **kwargs)
        ttl = ttl or self.default_ttl
        
        # Verificar cache
        if key in self.cache:
            data, expiry = self.cache[key]
            if datetime.now() < expiry:
                logger.debug(f"✅ Cache HIT: {func_name}")
                return data
        
        # Cache miss - buscar
        logger.debug(f"❌ Cache MISS: {func_name}")
        data = await fetcher(**kwargs)
        
        # Salvar cache
        self.cache[key] = (data, datetime.now() + timedelta(seconds=ttl))
        
        return data
    
    def invalidate(self, pattern: str):
        """Invalida cache por padrão."""
        keys_to_remove = [
            k for k in self.cache.keys()
            if pattern in str(k)
        ]
        for key in keys_to_remove:
            del self.cache[key]
        
        logger.info(f"🗑️ Invalidados {len(keys_to_remove)} itens do cache")

# Uso
cache = CacheManager()

async def get_campaign_insights_cached(campaign_id, period):
    return await cache.get_or_fetch(
        func_name="get_campaign_insights",
        fetcher=get_campaign_insights,
        ttl=300,  # 5 min
        campaign_id=campaign_id,
        period=period
    )
```

**TTLs Recomendados**:
- Métricas de campanha: 5 min
- Lista de campanhas: 2 min
- Detalhes de campanha: 10 min
- Resumo mensal: 30 min

---

### **7. Prompts Modulares** ⭐⭐

**Arquivo**: `backend/app/prompts/manager.py`

```python
from string import Template
from typing import Dict, Optional

class PromptManager:
    """Gerencia prompts modulares."""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Template]:
        return {
            "creator": Template("""
Você é um especialista em criar campanhas Meta Ads.

**Perfil do Cliente:**
- Orçamento mensal: R$ $monthly_budget
- Objetivo: $objective
- Público: $audience

**Tom:** $tone
**Idioma:** $language

$additional_instructions
            """),
            
            "analyzer": Template("""
Você é um analista de performance Meta Ads.

**KPIs:**
- CTR alvo: > $target_ctr%
- CPC máx: R$ $max_cpc
- ROAS mín: $min_roas x

$additional_instructions
            """)
        }
    
    def get_prompt(
        self,
        agent_type: str,
        user_config: Optional[Dict] = None
    ) -> str:
        """Gera prompt personalizado."""
        
        defaults = {
            "monthly_budget": "10.000",
            "objective": "Vendas",
            "audience": "Não especificado",
            "tone": "profissional",
            "language": "pt-BR",
            "target_ctr": "1.5",
            "max_cpc": "2.00",
            "min_roas": "2.0",
            "additional_instructions": ""
        }
        
        if user_config:
            defaults.update(user_config)
        
        template = self.templates[agent_type]
        return template.substitute(**defaults)
```

---

## ✅ Checklist de Implementação

### Semana 1
- [ ] Instalar dependências: `agno[postgres]`, `tenacity`
- [ ] Criar tabela `agent_memory` no Supabase
- [ ] Implementar `MemoryManager`
- [ ] Adicionar `@retry` em todas as tools
- [ ] Criar `SupervisorAgent`
- [ ] Integrar aprovação humana

### Semana 2
- [ ] Instalar `APScheduler`
- [ ] Implementar `AgentScheduler`
- [ ] Configurar jobs (relatório, budget, otimização)
- [ ] Refatorar streaming com eventos
- [ ] Atualizar frontend para consumir eventos

### Semana 3
- [ ] Implementar `CacheManager`
- [ ] Criar `PromptManager`
- [ ] Adicionar testes unitários
- [ ] Documentar código
- [ ] Deploy em staging

### Semana 4 (Opcional)
- [ ] Monitoramento e observabilidade
- [ ] Rate limiting
- [ ] Alertas de erro
- [ ] Otimização de custos

---

## 🎯 Métricas de Sucesso

**Antes**:
- Tempo resposta médio: 5-10s
- Taxa de erro: 5-10%
- Contexto perdido entre mensagens
- Sem automação

**Depois**:
- Tempo resposta: 1-3s (cache)
- Taxa de erro: <1% (retry)
- Contexto persistente
- 4 automações rodando 24/7
- Validação em 100% das ações críticas

---

## 📚 Recursos

**Documentação**:
- Agno: https://docs.agno.com
- Tenacity: https://tenacity.readthedocs.io
- APScheduler: https://apscheduler.readthedocs.io

**Dependências**:
```bash
pip install agno[postgres] tenacity apscheduler
```

**Estrutura de Pastas**:
```
backend/app/
├── agents/
│   ├── supervisor.py      # Novo
│   └── ...
├── memory/
│   └── manager.py         # Novo
├── cache/
│   └── manager.py         # Novo
├── scheduler/
│   └── jobs.py            # Novo
├── prompts/
│   └── manager.py         # Novo
└── tools/
    └── resilient.py       # Novo
```

---

**Criado em**: 19/01/2026  
**Versão**: 1.0  
**Próxima Revisão**: Após Semana 1
