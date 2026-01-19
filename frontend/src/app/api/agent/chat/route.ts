import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Backend API URL (Agno Agent)
const AGNO_API_URL = process.env.AGNO_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * POST /api/agent/chat - Envia mensagem para o Agente IA
 * 
 * Este endpoint recebe a mensagem do usuário e encaminha para o backend
 * Python que processa com o framework Agno e retorna a resposta do agente.
 * 
 * Agentes disponíveis:
 * - Coordenador: Orquestra os outros agentes
 * - Criador: Cria campanhas com base em objetivos
 * - Analisador: Analisa performance e métricas
 * - Otimizador: Sugere otimizações
 * - Notificador: Envia alertas via WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { message, history = [], session_id } = body as { 
      message: string; 
      history: Message[];
      session_id?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Tentar conectar com backend Python (Agno)
    try {
      const response = await fetch(`${AGNO_API_URL}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id,
          user_id: session.user.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        return NextResponse.json({
          success: true,
          response: {
            role: 'assistant',
            content: result.response,
            agent_used: result.agent_used,
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      // Se o backend não respondeu OK, usa fallback
      console.warn('Backend não disponível, usando fallback');
    } catch (backendError) {
      // Backend não está rodando, usar mock
      console.warn('Não foi possível conectar ao backend:', backendError);
    }

    // Fallback: Mock AI response quando backend não está disponível
    const lowercaseMessage = message.toLowerCase();
    let aiResponse = '';
    let actions: Array<{ type: string; label: string; data?: unknown }> = [];

    if (lowercaseMessage.includes('criar') && lowercaseMessage.includes('campanha')) {
      aiResponse = `Ótimo! Vou te ajudar a criar uma nova campanha. 🚀

Para começar, preciso de algumas informações:

1. **Qual o objetivo principal?**
   - Vendas (e-commerce, loja física)
   - Leads (formulários, cadastros)
   - Tráfego (visitas ao site)
   - Engajamento (curtidas, comentários)
   - Reconhecimento (alcance de marca)

2. **Qual o orçamento diário pretendido?**

3. **Qual o público-alvo?** (idade, localização, interesses)

Me conte mais sobre o que você quer promover!

⚠️ *Nota: Backend Python não está conectado. Inicie com \`cd backend && python -m app.main\`*`;
      
      actions = [
        { type: 'create_campaign', label: 'Ir para Criar Campanha' },
      ];
    } else if (lowercaseMessage.includes('analis') || lowercaseMessage.includes('performance')) {
      aiResponse = `📊 Vou analisar suas campanhas!

**Resumo das últimas 24 horas:**

| Métrica | Valor | Variação |
|---------|-------|----------|
| Gasto | R$ 245,50 | +5% |
| Impressões | 12.500 | +12% |
| Cliques | 340 | +8% |
| CTR | 2.72% | -3% |
| Conversões | 15 | +20% |
| ROAS | 3.2x | +15% |

**Insights:**
✅ Conversões estão 20% acima da média
⚠️ CTR caiu 3% - considere testar novos criativos
💡 A campanha "E-commerce Janeiro" está com melhor performance

Quer que eu analise alguma campanha específica?

⚠️ *Dados de demonstração - conecte o backend para dados reais*`;
      
      actions = [
        { type: 'view_analytics', label: 'Ver Analytics Detalhado' },
        { type: 'optimize', label: 'Ver Sugestões de Otimização' },
      ];
    } else if (lowercaseMessage.includes('otimiz')) {
      aiResponse = `🔧 **Sugestões de Otimização:**

1. **Campanha "E-commerce Janeiro"**
   - 🎯 CTR abaixo da média (2.72% vs 3.0% benchmark)
   - 💡 Recomendação: Testar novos títulos e imagens
   - ⚡ Ação: Criar variação A/B do criativo

2. **Campanha "Leads Qualificados"**
   - 💰 CPC alto (R$ 0.85 vs R$ 0.60 meta)
   - 💡 Recomendação: Refinar público-alvo
   - ⚡ Ação: Excluir faixas etárias com baixa conversão

3. **Orçamento Geral**
   - 📈 47% do orçamento mensal utilizado
   - 💡 Projeção: R$ 4.850 até fim do mês
   - ✅ Dentro do limite de R$ 5.000

Posso aplicar alguma dessas otimizações automaticamente?

⚠️ *Backend não conectado - ações reais requerem o servidor Python*`;
      
      actions = [
        { type: 'apply_optimization', label: 'Aplicar Otimizações', data: { optimizationId: '1' } },
      ];
    } else if (lowercaseMessage.includes('relatório') || lowercaseMessage.includes('relatorio')) {
      aiResponse = `📋 **Relatório de Performance**

**Período:** Últimos 7 dias (03/01 - 10/01/2026)

**Resumo Executivo:**
- Total investido: R$ 1.245,75
- Retorno gerado: R$ 4.235,50
- ROAS médio: 3.4x
- Conversões: 89

**Top 3 Campanhas:**
1. 🥇 E-commerce Janeiro - ROAS 4.2x
2. 🥈 Leads Qualificados - 45 leads
3. 🥉 Promo Verão - 2.500 cliques

**Tendências:**
📈 Conversões +25% vs semana anterior
📉 CPC -10% (melhorando)
📈 CTR +0.3% (melhorando)

Deseja que eu envie este relatório por WhatsApp?`;
      
      actions = [
        { type: 'send_whatsapp', label: 'Enviar por WhatsApp' },
        { type: 'download_pdf', label: 'Baixar PDF' },
      ];
    } else if (lowercaseMessage.includes('whatsapp') || lowercaseMessage.includes('notifica')) {
      aiResponse = `📱 **Configuração de Notificações WhatsApp**

O Agente Notificador pode enviar:

1. **Relatório Diário** (18:00)
   - Resumo de gastos e conversões
   - Comparativo com dia anterior
   - Projeção de orçamento

2. **Alertas de Orçamento**
   - ⚠️ 50% do limite → Informativo
   - 🟡 80% do limite → Atenção
   - 🔴 100% do limite → Crítico

3. **Alertas de Performance**
   - CTR muito baixo
   - CPC muito alto
   - Campanha sem conversões

Para configurar, acesse **Configurações > Notificações** e:
1. Ative o WhatsApp
2. Informe seu número
3. Configure os alertas desejados

⚠️ *Requer Evolution API configurada no backend*`;
      
      actions = [
        { type: 'settings', label: 'Ir para Configurações' },
      ];
    } else {
      aiResponse = `Olá! Sou seu assistente de campanhas Meta. 🤖

Posso te ajudar com:

🚀 **Criar campanhas** - "Criar uma campanha de vendas"
📊 **Analisar performance** - "Como estão minhas campanhas?"
🔧 **Otimizar resultados** - "Otimizar minhas campanhas"
📋 **Gerar relatórios** - "Gerar relatório semanal"
💰 **Gerenciar orçamento** - "Quanto já gastei este mês?"
📱 **Notificações** - "Configurar alertas no WhatsApp"

Como posso te ajudar hoje?`;
      
      actions = [
        { type: 'quick_action', label: 'Criar Campanha', data: { action: 'create' } },
        { type: 'quick_action', label: 'Ver Performance', data: { action: 'analyze' } },
        { type: 'quick_action', label: 'Otimizar', data: { action: 'optimize' } },
      ];
    }

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      response: {
        role: 'assistant',
        content: aiResponse,
        actions,
        timestamp: new Date().toISOString(),
        is_fallback: true, // Indica que é resposta mock
      },
    });
  } catch (error) {
    console.error('Error in agent chat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
