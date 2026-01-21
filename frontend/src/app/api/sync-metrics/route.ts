import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuthAndRateLimit } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * POST /api/sync-metrics - Sincroniza métricas da Meta API
 */
export async function POST(request: NextRequest) {
  try {
    const result = await withAuthAndRateLimit(request, 'sync');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    logger.info('Sincronizando métricas da Meta API', { userId: user.id });

    const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';

    // Buscar insights da conta (últimos 30 dias)
    const response = await fetch(`${backendUrl}/api/campaigns/insights/account?date_preset=last_30d`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Erro ao buscar métricas da Meta API', details: errorData },
        { status: response.status }
      );
    }

    const metaData = await response.json();

    if (!metaData.success) {
      return NextResponse.json(
        { error: metaData.error || 'Erro ao buscar métricas' },
        { status: 500 }
      );
    }

    const insights = metaData.insights;

    // Buscar campanhas do usuário
    const campaigns = await prisma.campaign.findMany({
      where: { userId: user.id },
      take: 1, // Pegar apenas uma campanha para salvar métricas da conta
    });

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma campanha encontrada. Sincronize as campanhas primeiro.' },
        { status: 400 }
      );
    }

    // Salvar métricas dos últimos 7 dias
    const today = new Date();
    const metricsToCreate = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Distribuir as métricas ao longo dos 7 dias (simulação simples)
      metricsToCreate.push({
        campaignId: campaigns[0].id,
        date,
        spend: insights.spend / 7,
        impressions: Math.floor(insights.impressions / 7),
        clicks: Math.floor(insights.clicks / 7),
        conversions: Math.floor(insights.conversions / 7),
      });
    }

    // Criar métricas no banco
    await prisma.campaignMetric.createMany({
      data: metricsToCreate,
      skipDuplicates: true,
    });

    logger.info('Métricas sincronizadas', { count: metricsToCreate.length });

    return NextResponse.json({
      success: true,
      message: `${metricsToCreate.length} métricas sincronizadas com sucesso`,
      metrics: {
        spend: insights.spend,
        impressions: insights.impressions,
        clicks: insights.clicks,
        conversions: insights.conversions,
      },
    });
  } catch (error) {
    logger.error('Error syncing metrics', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar métricas' },
      { status: 500 }
    );
  }
}
