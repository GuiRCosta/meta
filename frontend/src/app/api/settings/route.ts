import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateSettingsSchema, formatZodError } from '@/lib/validation';
import { logger } from '@/lib/logger';

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
    logger.error('Error fetching settings', error);
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

    // Validar input com Zod
    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      );
    }

    const updateData = validation.data;

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
    logger.error('Error updating settings', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
