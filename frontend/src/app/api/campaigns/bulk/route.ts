import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { bulkActionSchema, formatZodError } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar input com Zod
    const validation = bulkActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      );
    }

    const { campaignIds, action } = validation.data;

    // Atualizar status das campanhas no banco local (apenas do usuário logado)
    const updateResult = await prisma.campaign.updateMany({
      where: {
        id: { in: campaignIds },
        userId: session.user.id, // Segurança: apenas campanhas do usuário
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
    logger.error('Error in bulk action', error);
    return NextResponse.json(
      { error: 'Erro ao executar ação em lote' },
      { status: 500 }
    );
  }
}
