'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Mountain, 
  BookOpen, 
  GraduationCap, 
  Compass, 
  ArrowRight, 
  ArrowLeft,
  Radio,
  Trophy,
  Layers,
  User,
  CheckCircle2,
  Headphones
} from 'lucide-react';

interface WelcomeOnboardingModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartClimbing: () => void;
}

function StylizedMountainHeader() {
  return (
    <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900/90 border border-blue-500/20 mb-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/20 to-sky-500/10 blur-xl" />
      <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-90">
        <path d="M 0 120 L 90 50 L 160 85 L 240 20 L 320 75 L 400 120 Z" fill="url(#bg-mountains)" />
        <path d="M 60 120 L 170 30 L 250 80 L 330 25 L 400 120 Z" fill="url(#fg-mountains)" />
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
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
        <Sparkles size={12} className="text-blue-400" />
        <span>Guia do Aluno Antigravity</span>
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  if (!isOpen) return null;

  const handleFinishOnboarding = () => {
    if (typeof window !== 'undefined') {
      const seenKey = userId !== 'guest' ? 'po_welcome_modal_seen_' + userId : 'po_welcome_modal_seen_guest';
      localStorage.setItem(seenKey, 'true');
      localStorage.setItem('@antigravity:has_seen_onboarding', 'true');
    }
    onStartClimbing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-8 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* BOTÃO FECHAR */}
        <button
          onClick={handleFinishOnboarding}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
          aria-label="Pular Onboarding"
          title="Pular guia e ir direto para o Livro 01"
        >
          <X size={18} />
        </button>

        {/* HEADER ILUSTRATIVO */}
        <div>
          <StylizedMountainHeader />

          {/* INDICADOR DE PROGRESSO DOS 4 PASSOS */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Passo {currentStep} de 4 — {
                currentStep === 1 ? 'Objetivo do Método' :
                currentStep === 2 ? 'Rotina de Aprendizado' :
                currentStep === 3 ? 'Perfil & Avatar' : 'Pronto para Começar!'
              }
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  onClick={() => setCurrentStep(step as any)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === step
                      ? 'w-6 bg-sky-400'
                      : step < currentStep
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* PASSO 1: OBJETIVO DO MÉTODO */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-1">
                  <Compass size={16} /> Método Antigravity — Fluência em 6 Meses
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Domine as 2.000 Palavras Mais Usadas no Inglês
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                  <GraduationCap size={16} /> Assimilação Natural & Neurociência
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Estudos de Harvard e neurociência cognitiva comprovam: você não precisa decorar regras gramaticais exaustivas para falar inglês. O segredo é a <strong>expansão ativa do repertório de 2.000 palavras essenciais</strong> através da história do personagem Paul em 16 capítulos interativos da Jornada da Montanha.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3">
                <Mountain size={22} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada palavra aprendida é um grampo fixado na rocha; cada capítulo concluído é uma altitude alcançada. Ao final da montanha, você terá vocabulário prático e segurança para conversação no nível B1.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 2: COMO FUNCIONA A ROTINA DE CADA LIVRO */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-2 mb-1">
                  <BookOpen size={16} /> Rotina de Aprendizado
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Como Funciona o Estudo de Cada Capítulo
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[11px]">1</span>
                    <span>1. Imersão Narrativa</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ouça e leia o capítulo. Clique em qualquer palavra para ver sua tradução instantânea e escutar a pronúncia nativa.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px]">2</span>
                    <span>2. Podcast Explicativo</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Acesse o Podcast oficial para ouvir a análise contextual, expressões idiomáticas e reforço das palavras do episódio.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">3</span>
                    <span>3. Desafio & Quiz</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Responda às questões de verificação para validar seu aprendizado e desbloquear o próximo livro na montanha.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">4</span>
                    <span>4. Flashcards (SRS)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Revisões espaçadas programadas para transferir o vocabulário minerado da memória de curto prazo para a permanente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: PERSONALIZE SEU PERFIL & AVATAR */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-1">
                  <User size={16} /> Identidade do Aluno
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Personalize seu Perfil & Crie seu Avatar
                </h2>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    <User size={26} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Seu Montanhista Pessoal</h3>
                    <p className="text-xs text-slate-400">Escolha roupas, acessórios e expressões para representar sua jornada.</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  No menu de <strong>Configurações (ícone de engrenagem no cabeçalho)</strong>, você pode atualizar seu Nome de Exibição e personalizar seu Avatar no mapa a qualquer momento.
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-indigo-300 font-bold">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Dica: Seu avatar aparecerá no topo do mapa conforme você avança nos checkpoints!</span>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 4: PRONTO PARA COMEÇAR (CTA LIVRO 01) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} /> Tudo Pronto!
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Seu Primeiro Passo Começa Agora
                </h2>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/50 via-slate-900 to-slate-950 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold">
                    LIVRO 01 DE 16
                  </span>
                  <span className="text-xs text-slate-400 font-mono">150 palavras essenciais</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">Livro 01: The First Step (O Primeiro Passo)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Acompanhe a chegada de Paul no aeroporto, suas primeiras interações em inglês e aprenda as estruturas básicas de apresentações e cumprimentos com leitor nativo e áudio em tempo real.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
                <Compass size={14} className="text-sky-400" />
                <span>Ao clicar abaixo, você abrirá diretamente o leitor do Livro 01. Boa escalada!</span>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO DOS PASSOS / BOTOES INFERIORES */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Anterior</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">Onboarding 1 de 4</span>
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span>Próximo</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition transform hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <span>Começar pelo Livro 01</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
