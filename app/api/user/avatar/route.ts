import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const avatarConfig = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        avatarConfig,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarConfig: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: 'Erro ao salvar avatar.' }, { status: 500 });
  }
}
