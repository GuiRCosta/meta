import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/campaigns/[id]/insights - Busca métricas/insights de uma campanha
 * 
 * Query params:
 * - period: 'today' | '7d' | '14d' | '30d' | 'this_month' | 'last_month' (default: '7d')
 * - breakdown: 'day' | 'week' | 'month' (default: 'day')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Verificar se campanha existe e pertence ao usuário
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Calcular datas baseado no período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        now.setDate(0); // Last day of previous month
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Buscar métricas do período
    const metrics = await prisma.campaignMetric.findMany({
      where: {
        campaignId: id,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calcular totais do período
    const totals = metrics.reduce(
      (acc, m) => ({
        spend: acc.spend + m.spend,
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        reach: acc.reach + m.reach,
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 }
    );

    // Calcular KPIs
    const ctr = totals.impressions > 0 
      ? (totals.clicks / totals.impressions) * 100 
      : 0;
    const cpc = totals.clicks > 0 
      ? totals.spend / totals.clicks 
      : 0;
    const cpm = totals.impressions > 0 
      ? (totals.spend / totals.impressions) * 1000 
      : 0;
    const costPerConversion = totals.conversions > 0 
      ? totals.spend / totals.conversions 
      : 0;

    // Calcular tendência (comparando metade do período)
    const midpoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midpoint);
    const secondHalf = metrics.slice(midpoint);

    const firstHalfSpend = firstHalf.reduce((sum, m) => sum + m.spend, 0);
    const secondHalfSpend = secondHalf.reduce((sum, m) => sum + m.spend, 0);
    
    const spendTrend = firstHalfSpend > 0 
      ? ((secondHalfSpend - firstHalfSpend) / firstHalfSpend) * 100 
      : 0;

    // Formatar dados para gráficos
    const chartData = metrics.map(m => ({
      date: m.date.toISOString().split('T')[0],
      spend: Math.round(m.spend * 100) / 100,
      impressions: m.impressions,
      clicks: m.clicks,
      conversions: m.conversions,
      ctr: m.ctr ? Math.round(m.ctr * 100) / 100 : null,
      cpc: m.cpc ? Math.round(m.cpc * 100) / 100 : null,
    }));

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
      },
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        days: metrics.length,
      },
      summary: {
        spend: Math.round(totals.spend * 100) / 100,
        impressions: totals.impressions,
        clicks: totals.clicks,
        conversions: totals.conversions,
        reach: totals.reach,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        costPerConversion: Math.round(costPerConversion * 100) / 100,
      },
      trends: {
        spend: Math.round(spendTrend * 10) / 10,
        direction: spendTrend > 5 ? 'up' : spendTrend < -5 ? 'down' : 'stable',
      },
      chartData,
    });
  } catch (error) {
    console.error('Error fetching campaign insights:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar insights da campanha' },
      { status: 500 }
    );
  }
}
