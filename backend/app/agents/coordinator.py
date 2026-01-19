"""
Agente Coordenador - Team Leader que orquestra todos os agentes
"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.config import settings
from app.agents.prompts import COORDINATOR_PROMPT


def get_coordinator_agent() -> Agent:
    """Retorna o Agente Coordenador configurado."""
    return Agent(
        name="Coordenador",
        model=OpenAIChat(
            id=settings.openai_model,
            api_key=settings.openai_api_key,
        ),
        instructions=COORDINATOR_PROMPT,
        show_tool_calls=True,
        markdown=True,
    )


# Singleton
coordinator_agent = get_coordinator_agent() if settings.openai_api_key else None
