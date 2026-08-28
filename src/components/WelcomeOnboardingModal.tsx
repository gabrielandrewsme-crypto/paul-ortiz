'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, Mountain, BookOpen, GraduationCap, Compass, ArrowRight } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartClimbing: () => void;
}

/* ─────────── Stylized Mountain SVG Header ─────────── */
function StylizedMountainHeader() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-blue-950/60 to-slate-900/80 border border-blue-500/20 mb-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/20 to-sky-500/10 blur-xl" />

      <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-90">
        <path d="M 0 120 L 90 50 L 160 85 L 240 20 L 320 75 L 400 120 Z" fill="url(#bg-mountains)" />
        <path d="M 60 120 L 170 30 L 250 80 L 330 25 L 400 120 Z" fill="url(#fg-mountains)" />
        
        {/* Snow Peaks */}
        <path d="M 240 20 L 220 45 L 235 48 L 245 42 L 255 46 L 260 40 Z" fill="#FFFFFF" opacity="0.95" />
        <path d="M 170 30 L 155 50 L 168 53 L 175 48 L 185 52 Z" fill="#FFFFFF" opacity="0.9" />
        <path d="M 330 25 L 315 45 L 325 48 L 335 44 L 345 47 Z" fill="#FFFFFF" opacity="0.9" />

        <defs>
          <linearGradient id="bg-mountains" x1="200" y1="20" x2="200" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" stopOpacity="0.8" />
            <stop offset="1" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="fg-mountains" x1="200" y1="25" x2="200" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1e293b" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-extrabold text-[11px] uppercase tracking-wider backdrop-blur-md shadow-sm">
        <Sparkles size={12} className="text-blue-400" />
        <span>First-Time Onboarding</span>
      </div>
    </div>
  );
}

export default function WelcomeOnboardingModal({
  userId = 'guest',
  isOpen,
  onClose,
  onStartClimbing,
}: WelcomeOnboardingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Fechar Discreto */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Topo do Modal com SVG da Montanha */}
        <StylizedMountainHeader />

        {/* Título Principal */}
        <div className="mb-6 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-2 justify-center sm:justify-start mb-2">
            <Compass size={16} /> Bem-vindo(a) ao Paul Ortiz — Mountain Learning
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            A Jornada ao Topo: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">Mais do que Gramática, uma Nova Mente.</span>
          </h2>
        </div>

        {/* Conteúdo Motivacional & Educacional */}
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
          {/* Destaque Acadêmico */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-slate-200">
            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-1.5">
              <GraduationCap size={16} /> Destaque Acadêmico
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Estudos de <strong>Harvard</strong> e neurociência cognitiva demonstraram que a verdadeira fluência no inglês não é construída decorando regras gramaticais complexas, mas sim através da expansão ativa do vocabulário e da retenção contextual de palavras. Quando você memoriza blocos de significado e ganha repertório verbal, o seu cérebro desbloqueia a fala de forma natural e intuitiva.
            </p>
          </div>

          {/* A Filosofia da Montanha */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1.5">
              <Mountain size={16} /> A Filosofia da Montanha
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              O aprendizado de uma nova língua é como escalar uma montanha. Cada palavra aprendida é um grampo fixado na rocha; cada frase praticada é um passo rumo à altitude. Haverá momentos de cansaço, mas a vista lá de cima muda completamente a sua perspectiva do mundo.
            </p>
          </div>

          {/* A Parceria com o Paul & A Promessa dos 6 Meses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-1.5">
                <Compass size={16} /> A Parceria com o Paul
              </div>
              <p className="text-xs text-slate-300">
                Você não está fazendo essa travessia sozinho. O Paul estará ao seu lado em cada etapa do caminho — ajustando o ritmo, guiando seus passos e garantindo que você não perca o foco. Juntos, vocês vão conquistar essa montanha e chegar até o topo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1.5">
                <Sparkles size={16} /> A Promessa dos 6 Meses
              </div>
              <p className="text-xs text-slate-300">
                Com dedicação diária e o método certo, <strong>6 meses</strong> são mais do que suficientes para você sair do zero e alcançar a fluência prática para mudar sua vida.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            🎯 Seu primeiro checkpoint já está disponível no mapa.
          </span>

          <button
            onClick={() => {
              onStartClimbing();
            }}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>Iniciar minha escalada</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
