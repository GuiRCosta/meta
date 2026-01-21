import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuthAndRateLimit } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/analytics - Busca dados agregados para analytics
 *
 * Query params:
 * - period: '7d' | '14d' | '30d' | '90d' (default: '7d')
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calcular datas baseado no período
    const now = new Date();
    let startDate: Date;
    let days: number;

    switch (period) {
      case '7d':
        days = 7;
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        days = 14;
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        days = 30;
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        days = 90;
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        days = 7;
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Buscar todas as campanhas do usuário (não arquivadas)
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: user.id,
        status: { not: 'ARCHIVED' },
      },
      include: {
        metrics: {
          where: {
            date: {
              gte: startDate,
              lte: now,
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    // Calcular métricas agregadas do período
    const allMetrics = campaigns.flatMap(c => c.metrics);
    
    const totals = allMetrics.reduce(
      (acc, m) => ({
        spend: acc.spend + m.spend,
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    );

    // Calcular métricas do período anterior para comparação
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousMetrics = await prisma.campaignMetric.findMany({
      where: {
        campaign: {
          userId: user.id,
          status: { not: 'ARCHIVED' },
        },
        date: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const previousTotals = previousMetrics.reduce(
      (acc, m) => ({
        spend: acc.spend + m.spend,
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    );

    // Calcular mudanças percentuais
    const spendChange = previousTotals.spend > 0 
      ? ((totals.spend - previousTotals.spend) / previousTotals.spend) * 100 
      : 0;
    const impressionsChange = previousTotals.impressions > 0 
      ? ((totals.impressions - previousTotals.impressions) / previousTotals.impressions) * 100 
      : 0;
    const clicksChange = previousTotals.clicks > 0 
      ? ((totals.clicks - previousTotals.clicks) / previousTotals.clicks) * 100 
      : 0;
    const conversionsChange = previousTotals.conversions > 0 
      ? ((totals.conversions - previousTotals.conversions) / previousTotals.conversions) * 100 
      : 0;

    // Preparar dados do gráfico (por dia)
    const chartDataMap = new Map<string, {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>();

    allMetrics.forEach(m => {
      const dateKey = new Date(m.date).toISOString().split('T')[0];
      const existing = chartDataMap.get(dateKey) || { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
      chartDataMap.set(dateKey, {
        spend: existing.spend + m.spend,
        impressions: existing.impressions + m.impressions,
        clicks: existing.clicks + m.clicks,
        conversions: existing.conversions + m.conversions,
      });
    });

    // Preencher dias sem dados com zero
    const chartData = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = chartDataMap.get(dateKey) || { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        day: dayNames[date.getDay()],
        spend: Math.round(dayData.spend * 100) / 100,
        impressions: dayData.impressions,
        clicks: dayData.clicks,
        conversions: dayData.conversions,
      };
    });

    // Distribuição por campanha
    const campaignBreakdown = campaigns.map(campaign => {
      const campaignMetrics = campaign.metrics;
      const campaignSpend = campaignMetrics.reduce((sum, m) => sum + m.spend, 0);
      return {
        name: campaign.name,
        spend: Math.round(campaignSpend * 100) / 100,
      };
    }).filter(c => c.spend > 0);

    const totalSpend = campaignBreakdown.reduce((sum, c) => sum + c.spend, 0);
    const campaignBreakdownWithPercentage = campaignBreakdown.map(c => ({
      ...c,
      percentage: totalSpend > 0 ? Math.round((c.spend / totalSpend) * 100) : 0,
    })).sort((a, b) => b.spend - a.spend);

    // Projeções do mês
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthMetrics = allMetrics.filter(m => new Date(m.date) >= currentMonthStart);
    const monthSpend = monthMetrics.reduce((sum, m) => sum + m.spend, 0);
    const monthConversions = monthMetrics.reduce((sum, m) => sum + m.conversions, 0);
    
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const avgDailySpend = monthSpend / currentDay;
    const projectedSpend = Math.round(avgDailySpend * daysInMonth * 100) / 100;
    const projectedConversions = Math.round((monthConversions / currentDay) * daysInMonth);

    // Calcular ROAS médio
    const estimatedRevenue = totals.conversions * 100; // Estimativa: R$ 100 por conversão
    const roas = totals.spend > 0 
      ? estimatedRevenue / totals.spend 
      : 0;

    // Calcular tendência geral
    const trend = spendChange > 5 ? 12 : spendChange < -5 ? -8 : 0;

    return NextResponse.json({
      overview: {
        spend: { value: Math.round(totals.spend * 100) / 100, change: Math.round(spendChange * 100) / 100 },
        impressions: { value: totals.impressions, change: Math.round(impressionsChange * 100) / 100 },
        clicks: { value: totals.clicks, change: Math.round(clicksChange * 100) / 100 },
        conversions: { value: totals.conversions, change: Math.round(conversionsChange * 100) / 100 },
      },
      chartData,
      campaignBreakdown: campaignBreakdownWithPercentage,
      projections: {
        spendMonth: projectedSpend,
        conversions: projectedConversions,
        roas: Math.round(roas * 100) / 100,
        trend: Math.round(trend * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Error fetching analytics data', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de analytics' },
      { status: 500 }
    );
  }
}
