import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const ADMIN_EMAIL = 'gabrielandrews.me@gmail.com';

/**
 * GET /api/admin/users
 * Retorna usuários e métricas de assinatura (Acesso restrito ao e-mail administrador)
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso restrito exclusivamente ao e-mail administrador Supremo.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        streakDays: true,
        currentCheckpoint: true,
        totalWordsLearned: true,
        plan: true,
        isSubscribed: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    // Identificar usuários com assinaturas expirando em breve (próximos 5 dias) ou já expiradas
    const expiringSoonUsers = users.filter((u) => {
      if (!u.subscriptionEndDate) return false;
      const endDate = new Date(u.subscriptionEndDate);
      return endDate <= fiveDaysFromNow;
    });

    const totalUsers = users.length;
    const totalSubscribers = users.filter((u) => u.isSubscribed && u.subscriptionStatus === 'ACTIVE').length;
    const totalMonthly = users.filter((u) => u.plan === 'MONTHLY' && u.isSubscribed).length;
    const totalSemiannual = users.filter((u) => u.plan === 'SEMIANNUAL' && u.isSubscribed).length;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalSubscribers,
        totalMonthly,
        totalSemiannual,
        expiringSoonCount: expiringSoonUsers.length,
        databaseStatus: 'Conectado (Neon PostgreSQL)',
      },
      users,
      expiringSoonUsers,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados de administração.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users (Gerenciamento de Assinatura)
 * Actions: "activate_monthly", "activate_semiannual", "revoke", "renew"
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso restrito ao e-mail administrador Supremo.' }, { status: 403 });
    }

    const { userId, action, daysToAdd } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const now = new Date();
    let updateData: any = {};

    if (action === 'activate_monthly') {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      updateData = {
        plan: 'MONTHLY',
        isSubscribed: true,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionStatus: 'ACTIVE',
      };
    } else if (action === 'activate_semiannual') {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 180);

      updateData = {
        plan: 'SEMIANNUAL',
        isSubscribed: true,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionStatus: 'ACTIVE',
      };
    } else if (action === 'revoke') {
      updateData = {
        plan: 'FREE',
        isSubscribed: false,
        subscriptionStatus: 'NONE',
      };
    } else if (action === 'renew') {
      const days = daysToAdd || 30;
      let baseDate = targetUser.subscriptionEndDate && new Date(targetUser.subscriptionEndDate) > now
        ? new Date(targetUser.subscriptionEndDate)
        : new Date(now);

      baseDate.setDate(baseDate.getDate() + days);

      updateData = {
        isSubscribed: true,
        subscriptionEndDate: baseDate,
        subscriptionStatus: 'ACTIVE',
      };
    } else {
      return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        isSubscribed: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Admin subscription POST error:', error);
    return NextResponse.json({ error: 'Erro ao processar assinatura do usuário.' }, { status: 500 });
  }
}
