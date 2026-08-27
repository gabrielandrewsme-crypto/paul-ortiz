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
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching session user:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
