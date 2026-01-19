"""
API de Chat com Agentes IA
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from app.agents.team import process_message, process_message_stream


router = APIRouter()


class ChatRequest(BaseModel):
    """Request para enviar mensagem ao agente."""
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    """Response do agente."""
    success: bool
    response: Optional[str]
    error: Optional[str] = None
    session_id: Optional[str] = None
    agent_used: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Envia uma mensagem para o time de agentes e recebe a resposta.
    
    O Coordenador analisa a mensagem e delega para o agente apropriado:
    - Criador: Para criar campanhas, ad sets, ads
    - Analisador: Para analisar métricas e performance
    - Otimizador: Para sugestões de melhoria
    - Notificador: Para configurar alertas WhatsApp
    
    Exemplos de mensagens:
    - "Quero criar uma campanha de vendas"
    - "Como está a performance das campanhas ativas?"
    - "Quais campanhas devo pausar?"
    - "Configure alertas de orçamento no WhatsApp"
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia")
    
    result = await process_message(
        message=request.message,
        session_id=request.session_id,
        user_id=request.user_id,
    )
    
    return ChatResponse(
        success=result["success"],
        response=result.get("response"),
        error=result.get("error"),
        session_id=result.get("session_id"),
        agent_used=result.get("agent_used"),
    )


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Envia uma mensagem e recebe a resposta em streaming.
    
    Útil para respostas longas, mostrando o texto conforme é gerado.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia")
    
    async def generate():
        async for chunk in process_message_stream(
            message=request.message,
            session_id=request.session_id,
        ):
            # Enviar como Server-Sent Events
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        # Sinalizar fim do stream
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/status")
async def agent_status():
    """
    Retorna o status dos agentes.
    """
    from app.config import settings
    
    return {
        "status": "online" if settings.openai_api_key else "not_configured",
        "model": settings.openai_model,
        "agents": [
            {"name": "Coordenador", "role": "Team Leader"},
            {"name": "Criador", "role": "Criação de campanhas"},
            {"name": "Analisador", "role": "Análise de métricas"},
            {"name": "Otimizador", "role": "Otimização de ROI"},
            {"name": "Notificador", "role": "Alertas WhatsApp"},
        ],
        "meta_api_configured": bool(settings.meta_access_token),
        "whatsapp_configured": bool(settings.evolution_api_key),
    }
