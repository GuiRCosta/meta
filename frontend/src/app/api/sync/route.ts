import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/sync - Sincroniza campanhas do Meta para o banco local
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Chamar backend Python para buscar campanhas da Meta API
    const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
    
    let response: Response;
    try {
      response = await fetch(`${backendUrl}/api/campaigns/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });
    } catch (error) {
      console.error('Erro ao conectar com backend:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMsg.includes('fetch failed') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Erro ao conectar com o backend. Verifique se o backend está rodando na porta 8000.',
            details: 'Execute: cd backend && source env.config.sh && source venv/bin/activate && uvicorn app.main:app --reload --port 8000'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao conectar com o backend',
          details: errorMsg
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        errorData = { detail: errorText };
      }
      
      console.error('Erro do backend:', errorData);
      
      // Tratar rate limiting especificamente
      const errorMessage = errorData.detail || errorData.error || 'Erro desconhecido';
      
      if (response.status === 500 && (errorMessage.includes('requisições') || errorMessage.includes('rate limit'))) {
        return NextResponse.json(
          { 
            error: 'Muitas requisições à Meta API. Aguarde alguns minutos e tente novamente.',
            details: errorMessage,
            retry_after: 120 // 2 minutos
          },
          { status: 429 } // Too Many Requests
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao buscar campanhas da Meta API',
          details: errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage
        },
        { status: response.status }
      );
    }

    const metaData = await response.json();
    
    // Verificar se há erro na resposta mesmo com status 200
    if (metaData.error || !metaData.success) {
      const errorMsg = metaData.error || metaData.detail || 'Erro ao buscar campanhas da Meta API';
      console.error('Erro na resposta do backend:', errorMsg);
      
      // Se for rate limiting
      if (errorMsg.includes('requisições') || errorMsg.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'Muitas requisições à Meta API. Aguarde alguns minutos e tente novamente.',
            details: errorMsg,
            retry_after: 120
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { 
          error: errorMsg,
          details: metaData.details
        },
        { status: 500 }
      );
    }
    
    const campaigns = metaData.campaigns || [];

    // Sincronizar campanhas no banco local
    let synced = 0;
    const errors: string[] = [];

    for (const metaCampaign of campaigns) {
      try {
        // Buscar ou criar campanha no banco
        await prisma.campaign.upsert({
          where: {
            metaId: metaCampaign.id,
          },
          update: {
            name: metaCampaign.name,
            status: metaCampaign.status,
            objective: metaCampaign.objective || 'UNKNOWN',
            dailyBudget: metaCampaign.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : null,
            lifetimeBudget: metaCampaign.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : null,
            updatedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            metaId: metaCampaign.id,
            name: metaCampaign.name,
            status: metaCampaign.status,
            objective: metaCampaign.objective || 'UNKNOWN',
            dailyBudget: metaCampaign.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : null,
            lifetimeBudget: metaCampaign.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : null,
          },
        });
        synced++;
      } catch (error) {
        const errorMsg = `Erro ao sincronizar ${metaCampaign.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Sincronizadas ${synced} de ${campaigns.length} campanhas`,
      campaigns_synced: synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing campaigns:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Verificar se é erro de conexão
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Erro ao conectar com o backend. Verifique se o backend está rodando.',
          details: 'Certifique-se de que o backend Python está rodando na porta 8000'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao sincronizar campanhas',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
