import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/settings - Busca configurações do usuário
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar settings do usuário
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          monthlyBudgetLimit: 5000,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings - Atualiza configurações do usuário
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Campos permitidos para atualização
    const allowedFields = [
      'monthlyBudgetLimit',
      'alertAt50Percent',
      'alertAt80Percent',
      'alertAt100Percent',
      'alertOnProjectedOverrun',
      'conversionGoal',
      'roasGoal',
      'cpcMaxLimit',
      'ctrMinLimit',
      'whatsappEnabled',
      'whatsappNumber',
      'dailyReportTime',
      'sendDailyReports',
      'sendImmediateAlerts',
      'sendSuggestions',
      'sendStatusChanges',
      'metaAccessToken',
      'metaAdAccountId',
      'metaPageId',
    ];

    // Filtrar apenas campos permitidos
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Upsert: criar se não existir, atualizar se existir
    const settings = await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Configurações atualizadas com sucesso!',
      settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
