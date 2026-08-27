import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        streakDays: true,
        totalWordsLearned: true,
        currentCheckpoint: true,
        characterState: true,
        avatarConfig: true,
        plan: true,
        isSubscribed: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Regra de verificação automática de expiração
    const now = new Date();
    let updatedUser = user;

    if (
      user.isSubscribed &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) < now
    ) {
      // Assinatura expirou! Atualizar banco de dados para EXPIRED e FREE
      const dbUpdated = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          isSubscribed: false,
          subscriptionStatus: 'EXPIRED',
        },
      });

      updatedUser = {
        ...user,
        plan: dbUpdated.plan,
        isSubscribed: dbUpdated.isSubscribed,
        subscriptionStatus: dbUpdated.subscriptionStatus,
      };
    }

    return NextResponse.json({
      authenticated: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error fetching session user:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
