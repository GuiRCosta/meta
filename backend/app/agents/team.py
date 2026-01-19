"""
Time de Agentes - Orquestração com Agno Team
"""
from typing import Optional, AsyncGenerator
from agno.agent import Agent
from agno.team import Team
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import COORDINATOR_PROMPT
from app.agents.creator import get_creator_agent
from app.agents.analyzer import get_analyzer_agent
from app.agents.optimizer import get_optimizer_agent
from app.agents.notifier import get_notifier_agent


def get_agent_team() -> Optional[Team]:
    """
    Cria e retorna o time de agentes.
    
    O Coordenador lidera o time e delega tarefas para os especialistas:
    - Criador: Cria campanhas, ad sets, ads
    - Analisador: Analisa métricas e performance
    - Otimizador: Sugere e aplica otimizações
    - Notificador: Envia alertas via WhatsApp
    """
    if not settings.openai_api_key:
        return None
    
    # Criar agentes especialistas
    creator = get_creator_agent()
    analyzer = get_analyzer_agent()
    optimizer = get_optimizer_agent()
    notifier = get_notifier_agent()
    
    # Criar time coordenado
    team = Team(
        name="Meta Campaign Team",
        mode="coordinate",  # Coordenador decide qual agente usar
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        members=[creator, analyzer, optimizer, notifier],
        instructions=COORDINATOR_PROMPT,
        show_tool_calls=True,
        markdown=True,
        description="Time de agentes especializados em Meta Ads",
    )
    
    return team


async def process_message(
    message: str,
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> dict:
    """
    Processa uma mensagem do usuário e retorna a resposta do time.
    
    Args:
        message: Mensagem do usuário
        session_id: ID da sessão para manter contexto
        user_id: ID do usuário
        
    Returns:
        Dict com a resposta e metadados
    """
    team = get_agent_team()
    
    if not team:
        return {
            "success": False,
            "error": "Agentes não configurados. Configure OPENAI_API_KEY no .env",
            "response": None,
        }
    
    try:
        # Executar o time
        response = await team.arun(message)
        
        # Extrair conteúdo da resposta
        content = ""
        if hasattr(response, "content"):
            content = response.content
        elif isinstance(response, str):
            content = response
        else:
            content = str(response)
        
        return {
            "success": True,
            "response": content,
            "session_id": session_id,
            "agent_used": getattr(response, "agent", "Coordenador"),
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "response": None,
        }


async def process_message_stream(
    message: str,
    session_id: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Processa uma mensagem com streaming de resposta.
    
    Args:
        message: Mensagem do usuário
        session_id: ID da sessão
        
    Yields:
        Chunks da resposta conforme são gerados
    """
    team = get_agent_team()
    
    if not team:
        yield "❌ Agentes não configurados. Configure OPENAI_API_KEY no .env"
        return
    
    try:
        async for chunk in team.arun_stream(message):
            if hasattr(chunk, "content") and chunk.content:
                yield chunk.content
            elif isinstance(chunk, str):
                yield chunk
                
    except Exception as e:
        yield f"❌ Erro: {str(e)}"
