import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignIds, action } = body;

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma campanha selecionada' },
        { status: 400 }
      );
    }

    if (!['ACTIVE', 'PAUSED', 'ARCHIVED'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }

    // Atualizar status das campanhas no banco local
    const updateResult = await prisma.campaign.updateMany({
      where: {
        id: { in: campaignIds },
      },
      data: {
        status: action,
      },
    });

    // Contar quantas foram atualizadas
    const count = updateResult.count;

    // Para ações que precisam sincronizar com Meta (ativar/pausar)
    // Idealmente chamaríamos a Meta API aqui, mas por enquanto
    // apenas atualizamos o banco local
    
    let message = '';
    switch (action) {
      case 'ACTIVE':
        message = `${count} campanha(s) ativada(s) com sucesso!`;
        break;
      case 'PAUSED':
        message = `${count} campanha(s) pausada(s) com sucesso!`;
        break;
      case 'ARCHIVED':
        message = `${count} campanha(s) arquivada(s) com sucesso!`;
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      updatedCount: count,
    });
  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { error: 'Erro ao executar ação em lote' },
      { status: 500 }
    );
  }
}
