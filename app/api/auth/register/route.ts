import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { hashPassword, createSessionToken, setSessionCookie, determineUserRole } from '@/src/lib/auth';
import { sendWelcomeEmail } from '@/src/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    // Hash password & determine role (gabrielandrews.me@gmail.com -> ADMIN)
    const passwordHash = await hashPassword(password);
    const role = determineUserRole(normalizedEmail);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        avatarConfig: {
          climberName: name,
          outfit: 'expedition',
          backpack: 'red_expedition',
          eyewear: 'none',
          headwear: 'beanie',
          footwear: 'hiking_boots',
        },
      },
    });

    // Send Welcome Email async via Resend
    sendWelcomeEmail(normalizedEmail, name, role).catch(console.error);

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'USER' | 'MANAGER' | 'ADMIN',
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarConfig: user.avatarConfig,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}
