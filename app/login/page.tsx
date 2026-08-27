'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SnowfallCanvas from '@/src/components/SnowfallCanvas';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError('Ocorreu uma falha de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-[#0B132B] font-sans antialiased overflow-hidden">
      {/* LEFT COLUMN: HERO & MOUNTAIN BRANDING WITH SNOWFALL */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-gradient-to-b from-[#0F1B3B] via-[#0B132B] to-[#070B19] p-8 md:p-14 flex flex-col justify-between select-none overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/40">
        {/* Canvas de Neve */}
        <SnowfallCanvas />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Ícone de Montanha SVG exato da imagem de referência */}
          <div className="w-12 h-10 flex items-center justify-center">
            <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-md">
              {/* Base da Montanha Azul */}
              <path
                d="M 10 90 Q 35 65 60 45 Q 85 65 110 90 Z"
                fill="#3B82F6"
              />
              <path
                d="M 25 90 C 45 75 75 75 95 90 Z"
                fill="#60A5FA"
              />
              {/* Cume de Neve Branco */}
              <path
                d="M 60 25 L 42 52 Q 52 58 60 54 Q 68 58 78 52 Z"
                fill="#FFFFFF"
              />
              {/* Personagem com a mão levantada cravando o topo */}
              <circle cx="60" cy="14" r="5" fill="#FFFFFF" />
              <line x1="60" y1="19" x2="60" y2="30" stroke="#FFFFFF" strokeWidth="2.5" />
              <path d="M 60 22 L 68 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 60 22 L 52 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 my-auto py-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none mb-3">
            Mountain<br />Learning
          </h1>
          <p className="text-slate-300/80 text-sm sm:text-base font-normal tracking-wide">
            Start your journey now with us
          </p>
        </div>

        {/* Footer info sutil */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © Paul Ortiz. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM CARD */}
      <div className="w-full md:w-1/2 min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Login to your account
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="paulortiz@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition duration-150"
              />
            </div>

            {/* Campo Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition duration-150"
              />
            </div>

            {/* Botão de Ação Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full font-bold text-white text-sm bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? 'Logging in...' : 'Login now'}
            </button>
          </form>

          {/* Rodapé / Alternância para Registro */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-slate-900 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
