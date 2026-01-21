import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuthAndRateLimit } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/alerts - Lista alertas do usuário
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Buscar alertas
    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Contar total e não lidos
    const [total, unreadCount] = await Promise.all([
      prisma.alert.count({
        where: { userId: user.id },
      }),
      prisma.alert.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return NextResponse.json({ 
      alerts,
      pagination: {
        total,
        unreadCount,
        limit,
        offset,
      }
    });
  } catch (error) {
    logger.error('Error fetching alerts', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts - Cria um novo alerta
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.type || !body.priority || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: type, priority, title, message' },
        { status: 400 }
      );
    }

    // Validar valores permitidos
    const validTypes = ['error', 'warning', 'info', 'success'];
    const validPriorities = ['high', 'medium', 'low'];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `type deve ser: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: `priority deve ser: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Criar alerta
    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        type: body.type,
        priority: body.priority,
        title: body.title,
        message: body.message,
        campaignId: body.campaignId || null,
        campaignName: body.campaignName || null,
      },
    });

    return NextResponse.json({ 
      success: true,
      alert 
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating alert', error);
    return NextResponse.json(
      { error: 'Erro ao criar alerta' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts - Marca alertas como lidos
 */
export async function PATCH(request: NextRequest) {
  try {
    // Autenticação + Rate Limiting (20 req/min)
    const result = await withAuthAndRateLimit(request, 'api');
    if (result instanceof NextResponse) return result;
    const { user } = result;

    const body = await request.json();

    // Marcar todos como lidos
    if (body.markAllRead) {
      await prisma.alert.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ 
        success: true,
        message: 'Todos os alertas marcados como lidos'
      });
    }

    // Marcar IDs específicos como lidos
    if (body.alertIds && Array.isArray(body.alertIds)) {
      await prisma.alert.updateMany({
        where: {
          userId: user.id,
          id: { in: body.alertIds },
        },
        data: { read: true },
      });

      return NextResponse.json({ 
        success: true,
        message: `${body.alertIds.length} alerta(s) marcado(s) como lido(s)`
      });
    }

    return NextResponse.json(
      { error: 'Envie markAllRead: true ou alertIds: [...]' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Error updating alerts', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar alertas' },
      { status: 500 }
    );
  }
}
