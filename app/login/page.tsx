'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
    <main className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <ShieldCheck size={28} color="#4a90e2" />
          </div>
          <h1 className="auth-title">Entrar na Conta</h1>
          <p className="auth-subtitle">Sara Core — Paul Ortiz Mountain Learning</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Senha</label>
              <Link href="/forgot-password" className="auth-link-small">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="input-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar Conta'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Ainda não possui conta? </span>
          <Link href="/register" className="auth-link-bold">
            Cadastrar-se gratuitamente
          </Link>
        </div>
      </div>
    </main>
  );
}
