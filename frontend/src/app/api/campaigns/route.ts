import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/campaigns - Lista todas as campanhas
 * 
 * Query params:
 * - status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'all' (default: 'all')
 * - search: string (busca por nome)
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtro
    const where: {
      userId: string;
      status?: string | { not: string };
      name?: { contains: string; mode: 'insensitive' };
    } = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    } else {
      // Quando status é 'all' ou não especificado, excluir campanhas arquivadas
      where.status = { not: 'ARCHIVED' };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    console.log('Buscando campanhas com filtro:', where);
    
    // Buscar campanhas com métricas
    let campaigns, total;
    try {
      [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          include: {
            metrics: {
              orderBy: { date: 'desc' },
              take: 7, // Últimos 7 dias
            },
            adSets: {
              select: { id: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.campaign.count({ where }),
      ]);
      console.log(`Encontradas ${campaigns.length} campanhas de ${total} total`);
    } catch (dbError) {
      console.error('Erro ao buscar no banco de dados:', dbError);
      throw dbError;
    }

    // Calcular métricas agregadas para cada campanha
    const campaignsWithMetrics = campaigns.map((campaign) => {
      const totals = campaign.metrics.reduce(
        (acc, m) => ({
          spend: acc.spend + m.spend,
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          conversions: acc.conversions + m.conversions,
        }),
        { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
      );

      const ctr = totals.impressions > 0 
        ? (totals.clicks / totals.impressions) * 100 
        : 0;

      return {
        id: campaign.id,
        metaId: campaign.metaId,
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status,
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        adSetsCount: campaign.adSets.length,
        spend: Math.round(totals.spend * 100) / 100,
        impressions: totals.impressions,
        clicks: totals.clicks,
        conversions: totals.conversions,
        ctr: Math.round(ctr * 100) / 100,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      };
    });

    console.log('Retornando campanhas formatadas:', campaignsWithMetrics.length);
    
    return NextResponse.json({ 
      campaigns: campaignsWithMetrics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log completo do erro para debug
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar campanhas',
        details: errorMessage,
        // Não incluir stack em produção
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns - Cria uma nova campanha (local + Meta API)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { campaign, adSet, ad } = body;

    // Validate required fields
    if (!campaign?.name || !campaign?.objective) {
      return NextResponse.json(
        { error: 'Nome e objetivo da campanha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!adSet?.name || !adSet?.dailyBudget) {
      return NextResponse.json(
        { error: 'Nome e orçamento do conjunto são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar campanha na Meta API via backend
    const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    try {
      // 1. Criar campanha na Meta API
      const campaignBudget = campaign.dailyBudget 
        ? Math.round(campaign.dailyBudget * 100) // Converter para centavos
        : undefined;

      const metaCampaignResponse = await fetch(`${backendUrl}/api/campaigns/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status || 'PAUSED',
          daily_budget: campaignBudget,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (metaCampaignResponse.ok) {
        const metaCampaignData = await metaCampaignResponse.json();
        if (metaCampaignData.success) {
          metaCampaignId = metaCampaignData.campaign_id;
        } else {
          console.error('Erro ao criar campanha na Meta:', metaCampaignData.error);
          // Continuar mesmo se falhar, criar localmente
        }
      } else {
        const errorData = await metaCampaignResponse.json().catch(() => ({}));
        console.error('Erro HTTP ao criar campanha na Meta:', errorData);
        // Continuar mesmo se falhar, criar localmente
      }
    } catch (error) {
      console.error('Erro ao chamar backend para criar campanha:', error);
      // Continuar mesmo se falhar, criar localmente
    }

    // Se não conseguiu criar na Meta, usar IDs mock temporários
    if (!metaCampaignId) {
      metaCampaignId = `meta_camp_${Date.now()}`;
      metaAdSetId = `meta_adset_${Date.now()}`;
      metaAdId = `meta_ad_${Date.now()}`;
    } else {
      // TODO: Criar Ad Set e Ad na Meta API também
      // Por enquanto, usar IDs mock para ad sets e ads
      metaAdSetId = `meta_adset_${Date.now()}`;
      metaAdId = `meta_ad_${Date.now()}`;
    }

    // Criar campanha no banco de dados
    const createdCampaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        metaId: metaCampaignId,
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status || 'PAUSED',
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        adSets: {
          create: {
            metaId: metaAdSetId,
            name: adSet.name,
            status: adSet.status || 'PAUSED',
            dailyBudget: adSet.dailyBudget,
            targeting: adSet.targeting || {},
            ads: ad ? {
              create: {
                metaId: metaAdId,
                name: ad.name || `Anúncio - ${campaign.name}`,
                status: ad.status || 'PAUSED',
                creative: ad.creative || {},
                mediaUrl: ad.mediaUrl,
                mediaType: ad.mediaType,
              },
            } : undefined,
          },
        },
      },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
    });

    // Criar alerta de sucesso
    await prisma.alert.create({
      data: {
        userId: session.user.id,
        type: 'success',
        priority: 'medium',
        title: 'Campanha Criada',
        message: `A campanha "${campaign.name}" foi criada com sucesso.`,
        campaignId: createdCampaign.id,
        campaignName: campaign.name,
      },
    });

    return NextResponse.json({ 
      success: true, 
      campaign: createdCampaign,
      message: 'Campanha criada com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    );
  }
}
