'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Save, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Smile,
  Scissors,
  Glasses,
  Crown,
  Shirt
} from 'lucide-react';
import AvatarRenderer, { AvatarConfig } from '@/src/components/AvatarRenderer';

function AvatarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const [config, setConfig] = useState<AvatarConfig>({
    climberName: 'Escalador',
    skinTone: 'light_brown',
    bgColor: '#e2e8f0',
    gender: 'neutral',
    eyeShape: 'almond',
    hairStyle: 'black_power',
    hairColor: '#1e293b',
    facialHair: 'clean',
    facialHairColor: '#1e293b',
    eyewear: 'none',
    headwear: 'beanie',
    outfit: 'expedition',
    backpack: 'red_expedition',
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
      })
      .catch(console.error);
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
        setTimeout(() => {
          if (isOnboarding) {
            router.push('/');
          } else {
            setSavedSuccess(false);
          }
        }, 1200);
      }
    } catch (err) {
      setError('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="avatar-page-wrapper">
      <div className="avatar-page-container">
        {/* Header */}
        <header className="avatar-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> Voltar à Montanha
          </Link>
          <h1 className="avatar-title">
            {isOnboarding ? 'Bem-vindo! Personalize seu Avatar' : 'Customização do Avatar de Escalada'}
          </h1>
          <p className="avatar-subtitle">
            {isOnboarding 
              ? 'Monte seu visual exclusivo antes de iniciar sua jornada rumo ao topo da montanha'
              : 'Personalize seu equipamento, tons, cabelo e acessórios de expedição'
            }
          </p>
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
            <span>Avatar salvo com sucesso! {isOnboarding ? 'Iniciando sua jornada...' : ''}</span>
          </div>
        )}

        <div className="avatar-grid">
          {/* LEFT: LIVE SVG AVATAR PREVIEW */}
          <div className="avatar-preview-card">
            <div className="preview-header">
              <Sparkles size={20} color="#f59e0b" />
              <span style={{ fontWeight: 800, color: '#1e293b' }}>Pré-visualização em Tempo Real</span>
            </div>

            <div className="preview-canvas" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
              <AvatarRenderer config={config} size={240} />
            </div>

            <div className="preview-title-box">
              <span className="title-label">Nome no Checkpoint:</span>
              <h3 className="title-value">{config.climberName || 'Escalador Anônimo'}</h3>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION OPTIONS FORM */}
          <div className="avatar-options-card">
            {/* 1. Nome do Escalador */}
            <div className="option-section">
              <label className="option-label">Nome do Escalador</label>
              <input
                type="text"
                className="form-input"
                value={config.climberName || ''}
                onChange={(e) => setConfig({ ...config, climberName: e.target.value })}
                placeholder="Ex: Gabriel, O Conquistador"
              />
            </div>

            {/* 2. Tom de Pele & Cor de Fundo */}
            <div className="option-section">
              <label className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Smile size={16} color="#d97706" /> Tom de Pele
              </label>
              <div className="chips-grid">
                {[
                  { id: 'fair', label: '🌕 Clara' },
                  { id: 'olive', label: '🟨 Oliva' },
                  { id: 'light_brown', label: '🟤 Parda' },
                  { id: 'dark_brown', label: '🟤 Morena Escura' },
                  { id: 'deep_black', label: '⬛ Negra Retinta' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.skinTone === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, skinTone: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Formato dos Olhos */}
            <div className="option-section">
              <label className="option-label">Formato dos Olhos</label>
              <div className="chips-grid">
                {[
                  { id: 'almond', label: '👁️ Amendoados' },
                  { id: 'asian', label: '👁️ Traços Asiáticos' },
                  { id: 'round', label: '👁️ Arredondados' },
                  { id: 'focused', label: '👁️ Focados/Determinado' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.eyeShape === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, eyeShape: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Estilo de Cabelo (Ampla Variedade) */}
            <div className="option-section">
              <label className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scissors size={16} color="#4a90e2" /> Estilo de Cabelo
              </label>
              <div className="chips-grid">
                {[
                  // Afro / Crespos
                  { id: 'black_power', label: '👨🏿‍🦱 Black Power' },
                  { id: 'dreads', label: '🧔🏿 Dreads Expedição' },
                  { id: 'braids', label: '👨🏿‍🦱 Tranças (Braids)' },
                  { id: 'afro_puff', label: '👩🏿‍🦱 Afro Puff' },
                  // Clássicos / Europeus
                  { id: 'undercut', label: '✂️ Undercut Moderno' },
                  { id: 'straight_short', label: '💇‍♂️ Liso Curto' },
                  { id: 'wavy_medium', label: '🌊 Ondulado Médio' },
                  { id: 'pompadour', label: '💈 Pompadour' },
                  // Femininos
                  { id: 'female_long', label: '👩‍🦰 Longo Liso' },
                  { id: 'female_curly', label: '👩‍🦱 Cacheado Volumoso' },
                  { id: 'none', label: '🧑‍🦲 Careca / Raspado' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.hairStyle === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, hairStyle: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor do Cabelo */}
            <div className="option-section">
              <label className="option-label">Cor do Cabelo</label>
              <div className="chips-grid">
                {[
                  { color: '#1e293b', label: 'Preto' },
                  { color: '#78350f', label: 'Castanho' },
                  { color: '#ca8a04', label: 'Loiro' },
                  { color: '#dc2626', label: 'Ruivo' },
                  { color: '#94a3b8', label: 'Grisalho' },
                ].map((opt) => (
                  <button
                    key={opt.color}
                    className={`option-chip ${config.hairColor === opt.color ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, hairColor: opt.color })}
                  >
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: opt.color, marginRight: 6 }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Pelos Faciais (Barba) */}
            <div className="option-section">
              <label className="option-label">Pelos Faciais (Barba / Bigode)</label>
              <div className="chips-grid">
                {[
                  { id: 'clean', label: '🪒 Sem Barba (Liso)' },
                  { id: 'full_beard', label: '🧔 Barba Cheia' },
                  { id: 'lumberjack', label: '🪵 Barba Lenhador' },
                  { id: 'goatee', label: '💈 Cavanhaque' },
                  { id: 'moustache', label: '🥸 Bigode Clássico' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`option-chip ${config.facialHair === opt.id ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, facialHair: opt.id as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Acessórios de Expedição & Proteção */}
            <div className="option-section">
              <label className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Crown size={16} color="#ef4444" /> Acessórios de Cabeça
              </label>
              <div className="chips-grid">
                {[
                  { id: 'beanie', label: '🧶 Gorro Térmico' },
                  { id: 'sun_hat', label: '👒 Chapéu de Expedição' },
                  { id: 'climbing_helmet', label: '🪖 Capacete de Escalada' },
                  { id: 'beret', label: '🎨 Bereta Italiana' },
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

            {/* 7. Proteção para os Olhos */}
            <div className="option-section">
              <label className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Glasses size={16} color="#0284c7" /> Proteção para os Olhos
              </label>
              <div className="chips-grid">
                {[
                  { id: 'glacier_goggles', label: '🥽 Óculos de Geleira Pro' },
                  { id: 'sunglasses', label: '🕶️ Óculos Escuros' },
                  { id: 'reading_glasses', label: '👓 Óculos de Grau' },
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

            {/* 8. Estilo de Roupa */}
            <div className="option-section">
              <label className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shirt size={16} color="#16a34a" /> Roupa de Escalada
              </label>
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

            {/* Botão de Salvar */}
            <button className="auth-btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '1.5rem' }}>
              <Save size={18} /> {saving ? 'Salvando...' : (isOnboarding ? 'Concluir & Ir para a Montanha' : 'Salvar Configuração de Avatar')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AvatarPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#ffffff' }}>Carregando Avatar...</div>}>
      <AvatarContent />
    </Suspense>
  );
}
