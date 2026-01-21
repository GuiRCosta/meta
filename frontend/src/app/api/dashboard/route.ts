import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuthAndRateLimit } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/dashboard - Busca dados agregados para o dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

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
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Últimos 30 dias
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    // Calcular estatísticas gerais
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED').length;

    // Calcular métricas agregadas
    const allMetrics = campaigns.flatMap(c => c.metrics);
    
    // Métricas do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthMetrics = allMetrics.filter(m => 
      new Date(m.date) >= startOfMonth
    );

    // Métricas de hoje
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayMetrics = allMetrics.filter(m => 
      new Date(m.date) >= today
    );

    // Calcular totais do mês
    const monthSpend = monthMetrics.reduce((sum, m) => sum + m.spend, 0);
    const monthImpressions = monthMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const monthClicks = monthMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const monthConversions = monthMetrics.reduce((sum, m) => sum + m.conversions, 0);

    // Calcular totais de hoje
    const todaySpend = todayMetrics.reduce((sum, m) => sum + m.spend, 0);
    const todayImpressions = todayMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const todayClicks = todayMetrics.reduce((sum, m) => sum + m.clicks, 0);

    // Calcular CTR médio
    const ctr = monthImpressions > 0 
      ? (monthClicks / monthImpressions) * 100 
      : 0;

    // Calcular ROAS (assumindo que conversions tem valor, senão usar spend/revenue)
    // Para simplificar, vamos usar uma estimativa baseada em conversões
    const estimatedRevenue = monthConversions * 100; // Estimativa: R$ 100 por conversão
    const roas = monthSpend > 0 
      ? estimatedRevenue / monthSpend 
      : 0;

    // Buscar configurações de orçamento
    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    const monthLimit = settings?.monthlyBudgetLimit || 5000;
    const monthSpendRounded = Math.round(monthSpend * 100) / 100;

    // Calcular projeção do mês (baseado na média diária)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const avgDailySpend = monthSpendRounded / currentDay;
    const projectedSpend = Math.round(avgDailySpend * daysInMonth * 100) / 100;

    // Buscar dados dos últimos 7 dias para gráfico
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const spendingData = last7Days.map(date => {
      const dayMetrics = allMetrics.filter(m => {
        const metricDate = new Date(m.date);
        return metricDate.toDateString() === date.toDateString();
      });
      
      const spend = dayMetrics.reduce((sum, m) => sum + m.spend, 0);
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        day: dayNames[date.getDay()],
        spend: Math.round(spend * 100) / 100,
      };
    });

    // Buscar top 3 campanhas por CTR
    const campaignsWithCtr = campaigns.map(campaign => {
      const campaignMetrics = campaign.metrics;
      const totalImpressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
      const totalClicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
      const totalSpend = campaignMetrics.reduce((sum, m) => sum + m.spend, 0);
      const totalConversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
      
      const campaignCtr = totalImpressions > 0 
        ? (totalClicks / totalImpressions) * 100 
        : 0;
      const campaignCpc = totalClicks > 0 
        ? totalSpend / totalClicks 
        : 0;
      const campaignRoas = totalSpend > 0 && totalConversions > 0
        ? (totalConversions * 100) / totalSpend
        : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        ctr: campaignCtr,
        cpc: campaignCpc,
        roas: campaignRoas,
      };
    });

    // Ordenar e pegar top 3
    const topCampaignsByCtr = campaignsWithCtr
      .filter(c => c.ctr > 0)
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 3)
      .map((c, index) => ({
        id: c.id,
        name: c.name,
        metric: 'CTR',
        value: `${c.ctr.toFixed(1)}%`,
        trend: 'up' as const,
      }));

    const topCampaignsByCpc = campaignsWithCtr
      .filter(c => c.cpc > 0)
      .sort((a, b) => a.cpc - b.cpc)
      .slice(0, 1)
      .map(c => ({
        id: c.id,
        name: c.name,
        metric: 'CPC',
        value: `R$ ${c.cpc.toFixed(2)}`,
        trend: 'down' as const,
      }));

    const topCampaignsByRoas = campaignsWithCtr
      .filter(c => c.roas > 0)
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 1)
      .map(c => ({
        id: c.id,
        name: c.name,
        metric: 'ROAS',
        value: `${c.roas.toFixed(1)}x`,
        trend: 'up' as const,
      }));

    const topCampaigns = [...topCampaignsByCtr, ...topCampaignsByCpc, ...topCampaignsByRoas]
      .slice(0, 3);

    // Buscar alertas não lidos
    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calcular tendências (comparar últimos 7 dias com 7 dias anteriores)
    const last7DaysMetrics = allMetrics.filter(m => {
      const metricDate = new Date(m.date);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return metricDate >= sevenDaysAgo && metricDate < today;
    });

    const previous7DaysMetrics = allMetrics.filter(m => {
      const metricDate = new Date(m.date);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return metricDate >= fourteenDaysAgo && metricDate < sevenDaysAgo;
    });

    const last7DaysSpend = last7DaysMetrics.reduce((sum, m) => sum + m.spend, 0);
    const previous7DaysSpend = previous7DaysMetrics.reduce((sum, m) => sum + m.spend, 0);
    const spendTrend = previous7DaysSpend > 0 
      ? ((last7DaysSpend - previous7DaysSpend) / previous7DaysSpend) * 100 
      : 0;

    const last7DaysClicks = last7DaysMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const previous7DaysClicks = previous7DaysMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const clicksTrend = previous7DaysClicks > 0 
      ? ((last7DaysClicks - previous7DaysClicks) / previous7DaysClicks) * 100 
      : 0;

    const last7DaysImpressions = last7DaysMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const previous7DaysImpressions = previous7DaysMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const impressionsTrend = previous7DaysImpressions > 0 
      ? ((last7DaysImpressions - previous7DaysImpressions) / previous7DaysImpressions) * 100 
      : 0;

    const last7DaysCtr = last7DaysImpressions > 0 
      ? (last7DaysClicks / last7DaysImpressions) * 100 
      : 0;
    const previous7DaysCtr = previous7DaysImpressions > 0 
      ? (previous7DaysClicks / previous7DaysImpressions) * 100 
      : 0;
    const ctrTrend = previous7DaysCtr > 0 
      ? ((last7DaysCtr - previous7DaysCtr) / previous7DaysCtr) * 100 
      : 0;

    return NextResponse.json({
      stats: {
        totalCampaigns,
        activeCampaigns,
        pausedCampaigns,
        todaySpend: Math.round(todaySpend * 100) / 100,
        monthSpend: monthSpendRounded,
        monthLimit,
        projectedSpend,
        impressions: todayImpressions,
        clicks: todayClicks,
        ctr: Math.round(ctr * 100) / 100,
        roas: Math.round(roas * 100) / 100,
      },
      spendingData,
      topCampaigns,
      alerts: alerts.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        message: a.message,
      })),
      trends: {
        spend: Math.round(spendTrend * 100) / 100,
        impressions: Math.round(impressionsTrend * 100) / 100,
        clicks: Math.round(clicksTrend * 100) / 100,
        ctr: Math.round(ctrTrend * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard data', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
