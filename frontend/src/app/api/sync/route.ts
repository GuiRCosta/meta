import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { CampaignStatus } from '@prisma/client';

/**
 * Mapeia status do Meta para enum CampaignStatus
 * Prioriza effective_status (mais preciso) sobre status
 */
function mapMetaStatus(metaStatus?: string, effectiveStatus?: string): CampaignStatus {
  // Priorizar effective_status (estado real da campanha)
  if (effectiveStatus === 'PREVIEW' || effectiveStatus === 'DRAFT') {
    return 'DRAFT';
  }
  if (metaStatus === 'PREPAUSED') {
    return 'PREPAUSED';
  }
  if (effectiveStatus === 'ACTIVE') {
    return 'ACTIVE';
  }
  if (effectiveStatus === 'PAUSED' || metaStatus === 'PAUSED') {
    return 'PAUSED';
  }
  if (effectiveStatus === 'ARCHIVED' || metaStatus === 'ARCHIVED') {
    return 'ARCHIVED';
  }
  // Fallback para PAUSED se status desconhecido
  return 'PAUSED';
}

/**
 * POST /api/sync - Sincroniza campanhas do Meta para o banco local
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limiting: 10 requests per 5 minutes
    const identifier = session.user.id;
    const rateLimit = rateLimiters.sync.limit(identifier);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Muitas requisições de sincronização. Aguarde alguns minutos.',
          retry_after: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
            'Retry-After': String(rateLimit.reset),
          },
        }
      );
    }

    // Chamar backend Python para buscar campanhas da Meta API (incluindo rascunhos)
    const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';

    logger.info('Tentando sincronizar campanhas', { backendUrl, userId: session.user.id });

    let response: Response;
    try {
      const url = `${backendUrl}/api/campaigns/?include_drafts=true`;
      logger.info('Chamando backend', { url });

      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });

      logger.info('Resposta do backend recebida', { status: response.status, ok: response.ok });
    } catch (error) {
      logger.error('Erro ao conectar com backend', error);
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

      logger.error('Erro do backend', null, { errorData, status: response.status });

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
      logger.error('Erro na resposta do backend', null, { error: errorMsg });

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
        // Mapear status do Meta para nosso enum
        const mappedStatus = mapMetaStatus(
          metaCampaign.status,
          metaCampaign.effective_status
        );

        // Buscar ou criar campanha no banco
        await prisma.campaign.upsert({
          where: {
            metaId: metaCampaign.id,
          },
          update: {
            name: metaCampaign.name,
            status: mappedStatus,
            objective: metaCampaign.objective || 'UNKNOWN',
            dailyBudget: metaCampaign.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : null,
            lifetimeBudget: metaCampaign.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : null,
            updatedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            metaId: metaCampaign.id,
            name: metaCampaign.name,
            status: mappedStatus,
            objective: metaCampaign.objective || 'UNKNOWN',
            dailyBudget: metaCampaign.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : null,
            lifetimeBudget: metaCampaign.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : null,
          },
        });
        synced++;
      } catch (error) {
        const errorMsg = `Erro ao sincronizar ${metaCampaign.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        errors.push(errorMsg);
        logger.error('Erro ao sincronizar campanha', error, { campaignName: metaCampaign.name });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Sincronizadas ${synced} de ${campaigns.length} campanhas`,
      campaigns_synced: synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Error syncing campaigns', error);
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
