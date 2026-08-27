import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

/**
 * GET /api/admin/users
 * Returns system metrics & list of users
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Acesso restrito a Administradores e Gestores.' }, { status: 403 });
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
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
    const totalManagers = users.filter(u => u.role === 'MANAGER').length;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalAdmins,
        totalManagers,
        databaseStatus: 'Conectado (Neon PostgreSQL)',
      },
      users,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados de administração.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Update user role
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas o Administrador Supremo pode alterar cargos.' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !['USER', 'MANAGER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Dados inválidos para alteração de cargo.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Erro ao alterar cargo do usuário.' }, { status: 500 });
  }
}
