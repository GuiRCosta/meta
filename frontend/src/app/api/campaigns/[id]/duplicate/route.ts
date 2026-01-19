import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/campaigns/[id]/duplicate - Duplica uma campanha
 * Cria a campanha na Meta API primeiro, depois salva no banco local
 */
export async function POST(
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
    const count = body.count || 1;

    // Buscar campanha original do banco local
    const original = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!original) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem metaId (se não tem, é campanha local apenas)
    if (!original.metaId || original.metaId.startsWith('meta_camp_')) {
      return NextResponse.json(
        { error: 'Esta campanha não pode ser duplicada. Ela precisa estar sincronizada com a Meta primeiro.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.AGNO_API_URL || 'http://localhost:8000';
    const duplicatedCampaigns = [];

    // Criar múltiplas cópias
    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` - Cópia ${i + 1}` : ' - Cópia';

      try {
        // 1. Chamar backend para duplicar na Meta API
        const duplicateResponse = await fetch(
          `${backendUrl}/api/campaigns/${original.metaId}/duplicate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name_suffix: suffix }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (!duplicateResponse.ok) {
          const errorData = await duplicateResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ao duplicar na Meta API: ${duplicateResponse.status}`);
        }

        const duplicateData = await duplicateResponse.json();
        
        if (!duplicateData.success) {
          throw new Error(duplicateData.error || 'Erro ao duplicar na Meta API');
        }

        const newMetaId = duplicateData.campaign_id;
        const newName = `${original.name}${suffix}`;

        // 2. Buscar detalhes da campanha criada na Meta para sincronizar
        const detailsResponse = await fetch(
          `${backendUrl}/api/campaigns/${newMetaId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
          }
        );

        let metaCampaign = null;
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          if (detailsData.success) {
            metaCampaign = detailsData.campaign;
          }
        }

        // 3. Salvar no banco local
        const duplicated = await prisma.campaign.upsert({
          where: {
            metaId: newMetaId,
          },
          update: {
            name: metaCampaign?.name || newName,
            status: metaCampaign?.status || 'PAUSED',
            objective: metaCampaign?.objective || original.objective,
            dailyBudget: metaCampaign?.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : original.dailyBudget,
            lifetimeBudget: metaCampaign?.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : original.lifetimeBudget,
            updatedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            metaId: newMetaId,
            name: metaCampaign?.name || newName,
            status: metaCampaign?.status || 'PAUSED',
            objective: metaCampaign?.objective || original.objective,
            dailyBudget: metaCampaign?.daily_budget ? Math.round(metaCampaign.daily_budget / 100) : original.dailyBudget,
            lifetimeBudget: metaCampaign?.lifetime_budget ? Math.round(metaCampaign.lifetime_budget / 100) : original.lifetimeBudget,
          },
        });

        duplicatedCampaigns.push(duplicated);

        // Criar alerta de sucesso
        await prisma.alert.create({
          data: {
            userId: session.user.id,
            type: 'success',
            priority: 'low',
            title: 'Campanha Duplicada',
            message: `A campanha "${newName}" foi criada na Meta e sincronizada com sucesso.`,
            campaignId: duplicated.id,
            campaignName: newName,
          },
        });
      } catch (error) {
        console.error(`Erro ao duplicar campanha ${i + 1}:`, error);
        // Continuar tentando as próximas mesmo se uma falhar
      }
    }

    if (duplicatedCampaigns.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma campanha foi duplicada. Verifique os logs para mais detalhes.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `${duplicatedCampaigns.length} ${duplicatedCampaigns.length > 1 ? 'cópias criadas' : 'cópia criada'} com sucesso na Meta!`,
      campaigns: duplicatedCampaigns,
    });
  } catch (error) {
    console.error('Error duplicating campaign:', error);
    return NextResponse.json(
      { error: `Erro ao duplicar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
