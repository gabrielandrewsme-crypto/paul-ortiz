import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/src/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
}
