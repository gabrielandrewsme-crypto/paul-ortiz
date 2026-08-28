'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import SnowfallCanvas from '@/src/components/SnowfallCanvas';

/* ─────────── Minimalist Mountain Logo SVG ─────────── */
function MountainLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 4L4 26H28L16 4Z" fill="url(#mountain-grad)" />
      <path d="M16 4L11 14L14 16L16 13L18 16L21 14L16 4Z" fill="#FFFFFF" opacity="0.9" />
      <defs>
        <linearGradient id="mountain-grad" x1="16" y1="4" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────── Google Icon SVG ─────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar login.');
        setLoading(false);
        return;
      }

      if (data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('Ocorreu uma falha de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError('Erro ao iniciar autenticação com o Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ════════ LEFT COLUMN (Lado Escuro) ════════ */}
      <div className="relative flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-slate-950 to-blue-950 overflow-hidden min-h-[320px] md:min-h-screen">
        {/* Snow animation background */}
        <SnowfallCanvas />

        {/* Top Left Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <MountainLogo />
          <span className="text-white font-extrabold text-lg tracking-wider">
            PAUL ORTIZ<span className="text-blue-500">.</span>
          </span>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Mountain<br />Learning
          </h1>
          <p className="text-slate-400 text-lg mt-3 font-normal">
            Start your journey now with us
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Paul Ortiz. All rights reserved.
        </div>
      </div>

      {/* ════════ RIGHT COLUMN (Lado Claro) ════════ */}
      <div className="bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Login to your account
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium mb-5">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer text-sm disabled:opacity-60 mb-5"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Redirecionando para o Google...' : 'Continue with Google'}
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="paulortiz@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login now'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
