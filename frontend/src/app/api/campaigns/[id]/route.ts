import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/campaigns/[id] - Busca uma campanha específica
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

    // Buscar campanha com adSets, ads e métricas
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 30, // Últimos 30 dias
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Calcular métricas totais
    const totalMetrics = campaign.metrics.reduce(
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
    const ctr = totalMetrics.impressions > 0 
      ? (totalMetrics.clicks / totalMetrics.impressions) * 100 
      : 0;
    const cpc = totalMetrics.clicks > 0 
      ? totalMetrics.spend / totalMetrics.clicks 
      : 0;
    const cpm = totalMetrics.impressions > 0 
      ? (totalMetrics.spend / totalMetrics.impressions) * 1000 
      : 0;

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        totalMetrics: {
          ...totalMetrics,
          ctr: Math.round(ctr * 100) / 100,
          cpc: Math.round(cpc * 100) / 100,
          cpm: Math.round(cpm * 100) / 100,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar campanha' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id] - Atualiza uma campanha
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se campanha existe e pertence ao usuário
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Campos permitidos para atualização local
    const allowedFields = ['name', 'status', 'dailyBudget', 'lifetimeBudget'];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Atualizar no banco local
    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    // TODO: Sincronizar com Meta API
    // Se status mudou, atualizar na Meta
    // if (body.status && body.status !== existing.status) {
    //   await metaApi.updateCampaignStatus(existing.metaId, body.status);
    // }

    return NextResponse.json({ 
      success: true,
      message: 'Campanha atualizada com sucesso!',
      campaign,
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar campanha' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id] - Remove/arquiva uma campanha
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se campanha existe e pertence ao usuário
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Na Meta API, campanhas não são realmente deletadas, apenas arquivadas
    // Aqui vamos apenas marcar como ARCHIVED no banco local
    await prisma.campaign.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // TODO: Arquivar na Meta API
    // await metaApi.archiveCampaign(existing.metaId);

    return NextResponse.json({ 
      success: true,
      message: 'Campanha arquivada com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Erro ao arquivar campanha' },
      { status: 500 }
    );
  }
}
