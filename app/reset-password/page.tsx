'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente ou inválido.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">
          <KeyRound size={28} color="#4a90e2" />
        </div>
        <h1 className="auth-title">Nova Senha</h1>
        <p className="auth-subtitle">Crie uma nova senha segura para sua conta</p>
      </div>

      {error && (
        <div className="auth-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert success">
          <CheckCircle2 size={18} />
          <span>Senha redefinida com sucesso! Redirecionando para o login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Nova Senha</label>
          <div className="input-input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirmar Nova Senha</label>
          <div className="input-input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              required
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" className="auth-btn-primary" disabled={loading || !token || success}>
          {loading ? 'Redefinindo...' : 'Salvar Nova Senha'} <ArrowRight size={18} />
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/login" className="auth-link-bold">
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="auth-wrapper">
      <Suspense fallback={<div>Carregando formulário...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
