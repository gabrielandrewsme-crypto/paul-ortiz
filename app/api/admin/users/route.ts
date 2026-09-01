import { NextResponse } from 'next/server';
import { getSessionUser, isSuperAdmin, SUPER_ADMIN_EMAIL } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

/**
 * GET /api/admin/users
 * Retorna usuários e métricas de assinatura (Acesso restrito a gabrielandrews.me@gmail.com)
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Acesso restrito exclusivamente ao e-mail administrador Supremo.' }, { status: 403 });
    }

    // Garantir que gabrielandrews.me@gmail.com tenha perfil ADMIN e Acesso Vitalício no banco
    const adminUser = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });
    if (adminUser && (adminUser.role !== 'ADMIN' || adminUser.plan !== 'LIFETIME' || !adminUser.isSubscribed)) {
      await prisma.user.update({
        where: { email: SUPER_ADMIN_EMAIL },
        data: {
          role: 'ADMIN',
          plan: 'LIFETIME',
          isSubscribed: true,
          subscriptionStatus: 'ACTIVE',
        },
      });
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
        isComplimentary: true,
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

    // Identificar usuários com assinaturas expirando em breve (próximos 5 dias)
    const expiringSoonUsers = users.filter((u) => {
      if (isSuperAdmin(u.email) || u.plan === 'LIFETIME' || !u.subscriptionEndDate) return false;
      const endDate = new Date(u.subscriptionEndDate);
      return endDate <= fiveDaysFromNow && endDate >= now;
    });

    const totalUsers = users.length;
    const activeSubscribers = users.filter((u) => u.isSubscribed && u.subscriptionStatus === 'ACTIVE');
    const totalSubscribers = activeSubscribers.length;
    
    const complimentarySubscribers = activeSubscribers.filter((u) => u.isComplimentary).length;
    const paidSubscribers = activeSubscribers.filter((u) => !u.isComplimentary && u.plan !== 'LIFETIME' && !isSuperAdmin(u.email)).length;

    const paidPlusCount = activeSubscribers.filter((u) => (u.plan === 'PLUS' || u.plan === 'MONTHLY') && !u.isComplimentary).length;
    const paidPremiumCount = activeSubscribers.filter((u) => (u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL') && !u.isComplimentary).length;
    const totalPlus = users.filter((u) => (u.plan === 'PLUS' || u.plan === 'MONTHLY') && u.isSubscribed).length;
    const totalPremium = users.filter((u) => (u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL') && u.isSubscribed).length;
    const totalLifetime = users.filter((u) => u.plan === 'LIFETIME' || isSuperAdmin(u.email)).length;

    // Faturamento Total (Caixa Real)
    const grossRevenue = (paidPlusCount * 37.90) + (paidPremiumCount * 109.00);
    // MRR (Plus 37.90/mês + Premium 109.00 / 6 meses = 18.17/mês)
    const mrr = (paidPlusCount * 37.90) + (paidPremiumCount * (109.00 / 6));

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalSubscribers,
        paidSubscribers,
        complimentarySubscribers,
        totalPlus,
        totalPremium,
        totalLifetime,
        grossRevenue,
        mrr,
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
 * POST /api/admin/users (Gerenciamento de Assinatura & Cortesia)
 * Actions: "activate_plus_30d", "activate_premium_180d", "activate_lifetime", "revoke", "renew", "toggle_complimentary"
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Acesso restrito ao e-mail administrador Supremo.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, daysToAdd, isComplimentary } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const now = new Date();
    let updateData: any = {};

    if (action === 'toggle_complimentary') {
      updateData = {
        isComplimentary: isComplimentary !== undefined ? Boolean(isComplimentary) : !targetUser.isComplimentary,
      };
    } else if (action === 'activate_plus_30d' || action === 'activate_monthly') {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      updateData = {
        plan: 'PLUS',
        isSubscribed: true,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionStatus: 'ACTIVE',
      };
    } else if (action === 'activate_premium_180d' || action === 'activate_semiannual') {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 180);

      updateData = {
        plan: 'PREMIUM',
        isSubscribed: true,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionStatus: 'ACTIVE',
      };
    } else if (action === 'activate_lifetime') {
      updateData = {
        plan: 'LIFETIME',
        isSubscribed: true,
        subscriptionStartDate: now,
        subscriptionEndDate: null,
        subscriptionStatus: 'ACTIVE',
      };
    } else if (action === 'revoke') {
      updateData = {
        plan: 'FREE',
        isSubscribed: false,
        subscriptionEndDate: null,
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
        isComplimentary: true,
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
