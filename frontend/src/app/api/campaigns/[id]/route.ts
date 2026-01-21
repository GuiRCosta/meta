import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateCampaignSchema, formatZodError } from '@/lib/validation';
import { withAuthAndRateLimit } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/campaigns/[id] - Busca uma campanha específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const { id } = await params;

    // Buscar campanha com adSets, ads e métricas
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId: user.id,
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
    logger.error('Error fetching campaign', error);
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
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const { id } = await params;
    const body = await request.json();

    // Validar input com Zod
    const validation = updateCampaignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      );
    }

    // Verificar se campanha existe e pertence ao usuário
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    const updateData = validation.data;

    // Se status mudou e tem metaId, atualizar na Meta API
    if (body.status && body.status !== existing.status && existing.metaId) {
      try {
        const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
        const metaResponse = await fetch(
          `${backendUrl}/api/campaigns/${existing.metaId}/status`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: body.status }),
          }
        );

        if (!metaResponse.ok) {
          const error = await metaResponse.json();
          logger.error('Erro ao atualizar na Meta API', null, { error });
          // Continuar mesmo se falhar na Meta, atualizar localmente
        }
      } catch (error) {
        logger.error('Erro ao chamar Meta API', error);
        // Continuar mesmo se falhar na Meta, atualizar localmente
      }
    }

    // Atualizar no banco local
    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Campanha atualizada com sucesso!',
      campaign,
    });
  } catch (error) {
    logger.error('Error updating campaign', error);
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
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const { id } = await params;

    // Verificar se campanha existe e pertence ao usuário
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Arquivar na Meta API primeiro (se tiver metaId)
    if (existing.metaId && !existing.metaId.startsWith('meta_camp_')) {
      try {
        const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
        const metaResponse = await fetch(
          `${backendUrl}/api/campaigns/${existing.metaId}/status`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ARCHIVED' }),
          }
        );

        if (!metaResponse.ok) {
          const errorData = await metaResponse.json().catch(() => ({}));
          logger.error('Erro ao arquivar na Meta API', null, { errorData });
          // Continuar mesmo se falhar na Meta, arquivar localmente
        }
      } catch (error) {
        logger.error('Erro ao chamar Meta API para arquivar', error);
        // Continuar mesmo se falhar na Meta, arquivar localmente
      }
    }

    // Arquivar no banco local
    await prisma.campaign.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Campanha arquivada com sucesso!'
    });
  } catch (error) {
    logger.error('Error deleting campaign', error);
    return NextResponse.json(
      { error: 'Erro ao arquivar campanha' },
      { status: 500 }
    );
  }
}
