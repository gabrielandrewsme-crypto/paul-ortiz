import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { hashPassword } from '@/src/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve conter no mínimo 6 caracteres.' }, { status: 400 });
    }

    // Look up token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Token de redefinição inválido ou expirado.' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expiresAt)) {
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json({ error: 'Token de redefinição expirado. Solicite um novo link.' }, { status: 400 });
    }

    // Update user password in Neon DB
    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode realizar login.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Erro ao redefinir senha.' }, { status: 500 });
  }
}
