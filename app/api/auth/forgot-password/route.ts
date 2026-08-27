import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/src/lib/db';
import { sendPasswordResetEmail } from '@/src/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Informe o seu e-mail.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return success to avoid email enumeration security issues
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá o link de redefinição em breve.',
      });
    }

    // Generate random 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade

    // Clean old tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // Trigger Resend email
    await sendPasswordResetEmail(normalizedEmail, token);

    return NextResponse.json({
      success: true,
      message: 'Instruções para redefinição enviadas para o seu e-mail.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 });
  }
}
