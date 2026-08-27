'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Sparkles, 
  Save, 
  ArrowLeft, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AvatarConfig {
  climberName: string;
  outfit: 'expedition' | 'all_black' | 'high_tech' | 'casual';
  backpack: 'red_expedition' | 'black_tactical' | 'blue_light' | 'none';
  eyewear: 'glacier_goggles' | 'sunglasses' | 'none';
  headwear: 'beanie' | 'sun_hat' | 'climbing_helmet' | 'none';
  footwear: 'altitude_boots' | 'trail_sneakers' | 'classic_leather';
}

export default function AvatarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const [config, setConfig] = useState<AvatarConfig>({
    climberName: 'Gabriel, O Conquistador',
    outfit: 'expedition',
    backpack: 'red_expedition',
    eyewear: 'glacier_goggles',
    headwear: 'beanie',
    footwear: 'altitude_boots',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          if (data.user.avatarConfig) {
            setConfig(prev => ({ ...prev, ...data.user.avatarConfig }));
          } else if (data.user.name) {
            setConfig(prev => ({ ...prev, climberName: data.user.name }));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao salvar avatar.');
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      setError('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // Color mappings for visual SVG preview
  const outfitColors = {
    expedition: { jacket: '#ff7a29', pants: '#3b5a82' },
    all_black: { jacket: '#1e293b', pants: '#0f172a' },
    high_tech: { jacket: '#0284c7', pants: '#334155' },
    casual: { jacket: '#16a34a', pants: '#78350f' },
  }[config.outfit];

  const backpackColor = {
    red_expedition: '#dc2626',
    black_tactical: '#1e293b',
    blue_light: '#0284c7',
    none: 'transparent',
  }[config.backpack];

  return (
    <main className="avatar-page-wrapper">
      <div className="avatar-page-container">
        {/* Header */}
        <header className="avatar-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> Voltar à Montanha
          </Link>
          <h1 className="avatar-title">Customização do Avatar de Escalada</h1>
          <p className="avatar-subtitle">Personalize seu equipamento e visual para a jornada pelos 16 checkpoints</p>
        </header>

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="auth-alert success" style={{ marginBottom: '1.5rem' }}>
            <Check size={18} />
            <span>Avatar salvo com sucesso no banco de dados Neon!</span>
          </div>
        )}

        <div className="avatar-grid">
          {/* LEFT: LIVE SVG AVATAR PREVIEW */}
          <div className="avatar-preview-card">
            <div className="preview-header">
              <Sparkles size={20} color="#f59e0b" />
              <span style={{ fontWeight: 800, color: '#1e293b' }}>Pré-visualização em Tempo Real</span>
            </div>

            <div className="preview-canvas">
              <svg viewBox="0 0 300 380" style={{ width: '100%', height: '280px' }}>
                {/* Backpack (Behind stickman) */}
                {config.backpack !== 'none' && (
                  <rect
                    x="105"
                    y="140"
                    width="42"
                    height="70"
                    rx="12"
                    fill={backpackColor}
                    stroke="#0f172a"
                    strokeWidth="3"
                  />
                )}

                {/* Body / Jacket */}
                <path
                  d="M 125 130 L 175 130 L 168 210 L 132 210 Z"
                  fill={outfitColors.jacket}
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />

                {/* Pants */}
                <path
                  d="M 132 210 L 146 290 L 154 290 L 168 210 Z"
                  fill={outfitColors.pants}
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />

                {/* Head */}
                <circle cx="150" cy="95" r="28" fill="#fed7aa" stroke="#0f172a" strokeWidth="3.5" />
                {/* Eyes */}
                <circle cx="140" cy="92" r="3" fill="#0f172a" />
                <circle cx="160" cy="92" r="3" fill="#0f172a" />
                {/* Smile */}
                <path d="M 138 106 Q 150 118 162 106" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

                {/* Headwear / Hat */}
                {config.headwear === 'beanie' && (
                  <path d="M 120 90 Q 150 50 180 90 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3" />
                )}
                {config.headwear === 'sun_hat' && (
                  <ellipse cx="150" cy="72" rx="42" ry="10" fill="#f59e0b" stroke="#0f172a" strokeWidth="3" />
                )}
                {config.headwear === 'climbing_helmet' && (
                  <path d="M 120 92 Q 150 55 180 92 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
                )}

                {/* Eyewear / Goggles */}
                {config.eyewear === 'glacier_goggles' && (
                  <g>
                    <rect x="130" y="86" width="40" height="12" rx="6" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
                    <line x1="122" y1="92" x2="178" y2="92" stroke="#0f172a" strokeWidth="3" />
                  </g>
                )}
                {config.eyewear === 'sunglasses' && (
                  <rect x="132" y="88" width="36" height="8" rx="2" fill="#0f172a" />
                )}

                {/* Footwear / Boots */}
                {config.footwear === 'altitude_boots' && (
                  <g>
                    <rect x="135" y="290" width="16" height="14" rx="4" fill="#78350f" stroke="#0f172a" strokeWidth="2.5" />
                    <rect x="149" y="290" width="16" height="14" rx="4" fill="#78350f" stroke="#0f172a" strokeWidth="2.5" />
                  </g>
                )}
                {config.footwear === 'trail_sneakers' && (
                  <g>
                    <rect x="135" y="292" width="16" height="12" rx="3" fill="#2563eb" stroke="#0f172a" strokeWidth="2" />
                    <rect x="149" y="292" width="16" height="12" rx="3" fill="#2563eb" stroke="#0f172a" strokeWidth="2" />
                  </g>
                )}

                {/* Arms holding climbing pick */}
                <line x1="128" y1="140" x2="105" y2="180" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                <path d="M 172 140 L 205 110 L 220 90" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                {/* Ice Pick */}
                <line x1="210" y1="100" x2="235" y2="75" stroke="#475569" strokeWidth="4" />
                <polygon points="230,70 245,72 235,85" fill="#94a3b8" />
              </svg>
            </div>

            <div className="preview-title-box">
              <span className="title-label">Título do Escalador:</span>
              <h3 className="title-value">{config.climberName || 'Escalador Anônimo'}</h3>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION OPTIONS FORM */}
          <div className="avatar-options-card">
            {/* 1. Name / Title */}
            <div className="option-section">
              <label className="option-label">Nome ou Título do Escalador</label>
              <input
                type="text"
                className="form-input"
                value={config.climberName}
                onChange={(e) => setConfig({ ...config, climberName: e.target.value })}
                placeholder="Ex: Gabriel, O Conquistador"
              />
            </div>

            {/* 2. Outfit Style */}
            <div className="option-section">
              <label className="option-label">Estilo da Roupa de Escalada</label>
              <div className="chips-grid">
                {[
                  { id: 'expedition', label: '🟧 Expedição Laranja/Azul' },
                  { id: 'all_black', label: '⬛ Técnico All Black' },
                  { id: 'high_tech', label: '🟦 Alta Performance Ciano' },
                  { id: 'casual', label: '🟩 Trilha Casual Verde' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.outfit === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, outfit: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Backpack */}
            <div className="option-section">
              <label className="option-label">Mochila de Expedição</label>
              <div className="chips-grid">
                {[
                  { id: 'red_expedition', label: '🎒 Vermelha 60L' },
                  { id: 'black_tactical', label: '🎒 Tática Preta' },
                  { id: 'blue_light', label: '🎒 Ultra-Leve Azul' },
                  { id: 'none', label: '🚫 Sem Mochila' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.backpack === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, backpack: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Headwear */}
            <div className="option-section">
              <label className="option-label">Acessório de Cabeça</label>
              <div className="chips-grid">
                {[
                  { id: 'beanie', label: '🧶 Gorro Térmico Vermelho' },
                  { id: 'sun_hat', label: '👒 Chapéu Sol Expedição' },
                  { id: 'climbing_helmet', label: '🪖 Capacete de Escalada' },
                  { id: 'none', label: '🚫 Nenhum' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.headwear === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, headwear: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Eyewear */}
            <div className="option-section">
              <label className="option-label">Proteção para os Olhos</label>
              <div className="chips-grid">
                {[
                  { id: 'glacier_goggles', label: '🥽 Óculos de Geleira Pro' },
                  { id: 'sunglasses', label: '🕶️ Óculos Escuros' },
                  { id: 'none', label: '🚫 Nenhum' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.eyewear === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, eyewear: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button className="auth-btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '1rem' }}>
              <Save size={18} /> {saving ? 'Salvando Avatar...' : 'Salvar Configuração de Avatar'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
