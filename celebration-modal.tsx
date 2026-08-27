'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
  characterState: 'climbing' | 'holding_flag';
  totalWordsLearned: number;
  currentCheckpoint: number;
  userName: string;
  onClose?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  characterState,
  totalWordsLearned,
  currentCheckpoint,
  userName,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // REGRA DO TOPO: Checkpoint 16 + 2.000 Palavras
    if (currentCheckpoint >= 16 && totalWordsLearned >= 2000 && characterState === 'holding_flag') {
      setIsOpen(true);
      triggerConfettiAnimation();
    }
  }, [currentCheckpoint, totalWordsLearned, characterState]);

  const triggerConfettiAnimation = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center shadow-2xl shadow-emerald-500/20">
        {/* Ícone de Sucesso / Bandeira no Cume */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-4xl shadow-inner">
          🚩
        </div>

        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 mb-2">
          ¡CUME ALCANÇADO!
        </h2>
        
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          Parabéns, <strong className="text-emerald-400">{userName}</strong>! Você completou os <strong className="text-amber-300">16 Checkpoints</strong> da montanha e dominou todas as <strong className="text-emerald-400">2.000 palavras</strong>!
        </p>

        {/* Card do Personagem Holding Flag */}
        <div className="my-5 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center gap-2">
          <div className="text-5xl animate-bounce">🧗‍♂️🚩</div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
            Estado: Holding Flag (Cravou a Bandeira!)
          </span>
        </div>

        <button
          onClick={() => {
            setIsOpen(false);
            if (onClose) onClose();
          }}
          className="w-full py-3 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:opacity-95 transition duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer"
        >
          Continuar Jornada
        </button>
      </div>
    </div>
  );
};
