"""
Agentes de IA para Meta Campaign Manager
Powered by Agno Framework
"""
from app.agents.team import get_agent_team, process_message
from app.agents.coordinator import coordinator_agent
from app.agents.creator import creator_agent
from app.agents.analyzer import analyzer_agent
from app.agents.optimizer import optimizer_agent
from app.agents.notifier import notifier_agent

__all__ = [
    "get_agent_team",
    "process_message",
    "coordinator_agent",
    "creator_agent",
    "analyzer_agent",
    "optimizer_agent",
    "notifier_agent",
]
