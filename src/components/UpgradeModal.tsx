'use client';

import React from 'react';
import { Crown, Check, MessageSquare, Sparkles, X, Lock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  source?: 'quiz_completed' | 'checkpoint_click' | 'header_btn';
}

export default function UpgradeModal({
  isOpen,
  onClose,
  whatsappNumber = '5511999999999', // Substituir ou parametrizar
  source = 'checkpoint_click',
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const msgMensal = encodeURIComponent(
    'Olá! Concluí o Livro 1 e quero assinar o Plano Mensal (R$ 37,90) para liberar todos os livros e podcasts!'
  );
  const msgSemestral = encodeURIComponent(
    'Olá! Concluí o Livro 1 e quero aproveitar a oferta do Plano Semestral (R$ 109,90) para liberar o acesso total!'
  );

  const linkMensal = `https://wa.me/${whatsappNumber}?text=${msgMensal}`;
  const linkSemestral = `https://wa.me/${whatsappNumber}?text=${msgSemestral}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        {/* Badge do Modal */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 shadow-sm">
          <Crown size={34} />
        </div>

        {source === 'quiz_completed' ? (
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              🎉 Parabéns por dar o primeiro passo!
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Você concluiu a primeira etapa do aprendizado (Livro 1). Para liberar a subida até o cume (Livros 2 a 16 + Great Commission), assine o <strong>Plano Plus</strong>!
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Desbloqueie a Montanha Completa 🏔️
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Este conteúdo faz parte do <strong>Plano Plus</strong>. Assine agora para liberar os 16 Checkpoints e podcasts exclusivos!
            </p>
          </div>
        )}

        {/* Cards de Oferta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Plano Mensal */}
          <div className="border border-slate-200 rounded-2xl p-5 hover:border-sky-500 transition relative flex flex-col justify-between bg-slate-50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plano Mensal</span>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-extrabold text-slate-900">R$ 37,90</span>
                <span className="text-slate-500 text-xs"> / mês</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-4">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Acesso aos 16 Livros e Quizzes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Áudios e Podcasts em HD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Suporte via WhatsApp</span>
                </li>
              </ul>
            </div>

            <a
              href={linkMensal}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold text-center text-white bg-slate-800 hover:bg-slate-900 transition flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <MessageSquare size={16} /> Assinar Mensal
            </a>
          </div>

          {/* Plano Semestral - DESTAQUE */}
          <div className="border-2 border-amber-400 rounded-2xl p-5 transition relative flex flex-col justify-between bg-amber-50/50 shadow-lg">
            <div className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
              🔥 50% OFF (MAIS POPULAR)
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Plano Semestral</span>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-extrabold text-slate-900">R$ 109,90</span>
                <span className="text-slate-500 text-xs"> / semestre</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 mb-4">
                <li className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Todos os 16 Checkpoints Liberados</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Acesso Módulo Great Commission</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Economize R$ 117,50 no semestre</span>
                </li>
              </ul>
            </div>

            <a
              href={linkSemestral}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold text-center text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <Sparkles size={16} /> Garanta 50% OFF no WhatsApp
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          🔒 Ativação imediata da conta após a mensagem no WhatsApp. Sem fidelidade.
        </p>
      </div>
    </div>
  );
}
