import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { SUPER_ADMIN_EMAIL } from '@/src/lib/auth';

/**
 * GET /api/cron/check-expirations
 * Automatically downgrades users whose countdown timer has reached zero
 */
export async function GET() {
  try {
    const now = new Date();

    // Find all expired subscriptions excluding super admin
    const expiredUsers = await prisma.user.findMany({
      where: {
        isSubscribed: true,
        subscriptionEndDate: {
          lte: now,
        },
        NOT: {
          email: {
            equals: SUPER_ADMIN_EMAIL,
            mode: 'insensitive',
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    if (expiredUsers.length > 0) {
      const expiredIds = expiredUsers.map((u) => u.id);

      await prisma.user.updateMany({
        where: {
          id: { in: expiredIds },
        },
        data: {
          plan: 'FREE',
          isSubscribed: false,
          subscriptionStatus: 'EXPIRED',
        },
      });

      console.log(`[CRON EXPIRATION] Rebaixados ${expiredUsers.length} usuários para FREE:`, expiredUsers.map(u => u.email));
    }

    return NextResponse.json({
      success: true,
      downgradedCount: expiredUsers.length,
      downgradedUsers: expiredUsers,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Check expirations error:', error);
    return NextResponse.json({ error: 'Erro ao processar verificação de expiração.' }, { status: 500 });
  }
}
