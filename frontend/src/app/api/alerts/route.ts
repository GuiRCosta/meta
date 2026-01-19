import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/alerts - Lista alertas do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Buscar alertas
    const alerts = await prisma.alert.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Contar total e não lidos
    const [total, unreadCount] = await Promise.all([
      prisma.alert.count({
        where: { userId: session.user.id },
      }),
      prisma.alert.count({
        where: { userId: session.user.id, read: false },
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
    console.error('Error fetching alerts:', error);
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
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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
        userId: session.user.id,
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
    console.error('Error creating alert:', error);
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
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Marcar todos como lidos
    if (body.markAllRead) {
      await prisma.alert.updateMany({
        where: { 
          userId: session.user.id,
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
          userId: session.user.id,
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
    console.error('Error updating alerts:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar alertas' },
      { status: 500 }
    );
  }
}
