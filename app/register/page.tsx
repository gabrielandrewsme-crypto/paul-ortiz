'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/avatar?onboarding=true');
      }, 1200);
    } catch (err) {
      setError('Falha na comunicação com o servidor.');
      setLoading(false);
    }
  };

  const isAdminSpecial = email.toLowerCase().trim() === 'gabrielandrews.me@gmail.com';

  return (
    <main className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Shield size={28} color="#4a90e2" />
          </div>
          <h1 className="auth-title">Criar Sua Conta</h1>
          <p className="auth-subtitle">Comece sua escalada pelos 16 checkpoints</p>
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
            <span>Conta criada com sucesso! Redirecionando...</span>
          </div>
        )}

        {isAdminSpecial && (
          <div className="auth-alert info" style={{ background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}>
            <Shield size={18} />
            <span>E-mail reconhecido: Permissão <strong>ADMIN Supremo</strong> será concedida!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <div className="input-input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

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
            <label className="form-label">Senha</label>
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
            <label className="form-label">Confirmar Senha</label>
            <div className="input-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading || success}>
            {loading ? 'Cadastrando...' : 'Criar Minha Conta'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Já tem uma conta? </span>
          <Link href="/login" className="auth-link-bold">
            Realizar Login
          </Link>
        </div>
      </div>
    </main>
  );
}
