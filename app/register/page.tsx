'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import SnowfallCanvas from '@/src/components/SnowfallCanvas';

/* ─────────── Mountain Logo SVG ─────────── */
function MountainLogo() {
  return (
    <svg viewBox="0 0 120 100" className="w-12 h-10 drop-shadow-md">
      <path d="M 10 90 Q 35 65 60 45 Q 85 65 110 90 Z" fill="#3B82F6" />
      <path d="M 25 90 C 45 75 75 75 95 90 Z" fill="#60A5FA" />
      <path d="M 60 25 L 42 52 Q 52 58 60 54 Q 68 58 78 52 Z" fill="#FFFFFF" />
      <circle cx="60" cy="14" r="5" fill="#FFFFFF" />
      <line x1="60" y1="19" x2="60" y2="30" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M 60 22 L 68 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 60 22 L 52 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/avatar?onboarding=true');
      }, 1200);
    } catch {
      setError('Connection failure with server.');
      setLoading(false);
    }
  };

  return (
    <main className="auth-split-root">
      {/* ════════ LEFT HERO COLUMN ════════ */}
      <div className="auth-split-left">
        <SnowfallCanvas />

        <div className="auth-brand-top">
          <MountainLogo />
          <span className="auth-brand-text">PAUL ORTIZ</span>
          <span className="auth-brand-dot">.</span>
        </div>

        <div className="auth-hero-center">
          <h1 className="auth-hero-title">
            Mountain<br />Learning
          </h1>
          <p className="auth-hero-subtitle">
            Start your journey now with us
          </p>
        </div>

        <p className="auth-hero-footer">
          © {new Date().getFullYear()} Paul Ortiz. All rights reserved.
        </p>
      </div>

      {/* ════════ RIGHT FORM COLUMN ════════ */}
      <div className="auth-split-right">
        {/* Mobile-only logo */}
        <div className="auth-mobile-logo">
          <MountainLogo />
          <span className="auth-brand-text" style={{ color: '#0B132B' }}>PAUL ORTIZ</span>
        </div>

        <div className="auth-form-card">
          <h2 className="auth-card-title">Create an account</h2>

          {error && (
            <div className="auth-error-box">{error}</div>
          )}

          {success && (
            <div className="auth-success-box">
              Account created! Redirecting to Avatar setup…
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-fields">
            {/* Name */}
            <div className="auth-field">
              <label className="auth-label">Name</label>
              <input
                id="register-name"
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                id="register-email"
                type="email"
                required
                placeholder="paulortiz@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-eye-wrapper">
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="auth-btn-google"
              onClick={() => alert('Google OAuth integration coming soon.')}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading || success}
              className="auth-btn-primary"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
