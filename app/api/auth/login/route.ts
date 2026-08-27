import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { verifyPassword, createSessionToken, setSessionCookie, determineUserRole } from '@/src/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Preencha o e-mail e a senha.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // Auto Upgrade Rule for gabrielandrews.me@gmail.com on login
    let userRole = user.role;
    if (normalizedEmail === 'gabrielandrews.me@gmail.com' && user.role !== 'ADMIN') {
      userRole = 'ADMIN';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: userRole as 'USER' | 'MANAGER' | 'ADMIN',
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        avatarConfig: user.avatarConfig,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar login.' }, { status: 500 });
  }
}
