'use client';

import React from 'react';
import { X, Sparkles, BookOpen, Layers, Edit3, Award, Target, Flame } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartJourney?: () => void;
}

export default function TutorialModal({ isOpen, onClose, onStartJourney }: TutorialModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl text-slate-900 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        {/* Botão Fechar */}
        <button className="modal-close-btn z-10" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 -mx-6 -mt-6 p-6 text-white mb-6 relative">
          <div className="flex items-center gap-2 text-sky-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Guia Metodológico Paul Ortiz</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Do Zero à Fluência Prática (B1)
          </h2>
          <p className="text-sm text-sky-100 mt-1 max-w-xl">
            Aprenda inglês de forma natural acompanhando a jornada do personagem Paul através de 16 minilivros imersivos.
          </p>
        </div>

        {/* Objetivo Principal - Card Meta */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-extrabold flex-shrink-0 shadow-md">
            <Target size={26} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              Meta Principal: 2.000 Palavras Únicas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              O segredo para entender 85%+ do inglês falado e escrito no dia a dia é a assimilação dos <strong>2.000 vocábulos mais frequentes</strong>. Cada capítulo da história de Paul minera e fixa novas palavras no seu léxico.
            </p>
          </div>
        </div>

        {/* Método em 4 Passos Sequenciais */}
        <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
          <span>O Método em 4 Passos Sequenciais</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Passo 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2 mb-2 text-sky-600 font-extrabold text-xs uppercase">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">1</span>
              <span>Imersão Narrativa</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
              <BookOpen size={16} className="text-sky-500" /> Leitura & Áudio (Shadowing)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Leia a história de Paul ouvindo o áudio sincronizado com voz natural. Clique em qualquer palavra para ver a tradução e ouvir a pronúncia exata.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2 mb-2 text-amber-600 font-extrabold text-xs uppercase">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">2</span>
              <span>Mineração & SRS</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
              <Layers size={16} className="text-amber-500" /> Flashcards Interativos
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Revise e marque como dominadas as palavras recém-apresentadas no livro através de repetição espaçada ativa.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-extrabold text-xs uppercase">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span>
              <span>Output Ativo</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
              <Edit3 size={16} className="text-indigo-500" /> Criação de Frases
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolide seu aprendizado escrevendo obrigatoriamente 3 frases originais utilizando o vocabulário-chave do capítulo.
            </p>
          </div>

          {/* Passo 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 font-extrabold text-xs uppercase">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">4</span>
              <span>Checkpoint & Resumo</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
              <Award size={16} className="text-emerald-500" /> Contabilização e Avanço
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conclua o livro para somar as novas palavras ao seu saldo acumulado, ver o relatório com áudios e liberar o próximo capítulo.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              if (onStartJourney) onStartJourney();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Flame size={18} className="text-amber-300" />
            <span>Começar Minha Jornada Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
