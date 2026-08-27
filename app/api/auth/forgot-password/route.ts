import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/src/lib/db';
import { sendPasswordResetEmail } from '@/src/lib/email';

export async function POST(request: Request) {
  try {
    // 1. Verificação da Chave de API do Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('[RESEND ERROR] Chave da API Resend não encontrada nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'Chave da API Resend não encontrada nas variáveis de ambiente' },
        { status: 500 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Informe o seu e-mail.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Retorna resposta neutra por razões de segurança (enumeração de usuários)
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá o link de redefinição em breve.',
      });
    }

    // 2. Gerar token de redefinição (32 bytes hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade

    // Limpar tokens anteriores para o mesmo e-mail
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // 3. Disparar e-mail via Resend
    const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

    if (!emailResult.success) {
      console.error('[FORGOT PASSWORD RESEND ERROR]', JSON.stringify(emailResult.error, null, 2));
      
      const resendErrMsg =
        typeof emailResult.error === 'object' && emailResult.error && 'message' in emailResult.error
          ? String((emailResult.error as { message?: string }).message)
          : 'Erro desconhecido na API do Resend';

      return NextResponse.json(
        { error: `Falha no envio de e-mail (Resend): ${resendErrMsg}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Instruções para redefinição enviadas para o seu e-mail.',
    });
  } catch (error) {
    console.error('Forgot password internal server error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação de redefinição de senha.' },
      { status: 500 }
    );
  }
}
