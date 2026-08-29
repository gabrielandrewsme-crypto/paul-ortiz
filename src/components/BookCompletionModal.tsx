'use client';

import React from 'react';
import { X, Sparkles, Volume2, Trophy, ArrowRight, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { BookData, InteractiveWord } from '@/src/data/books';

interface BookCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookData;
  newWordsCount: number;
  totalAccumulatedWords: number;
  onAdvanceToNextBook: () => void;
}

export default function BookCompletionModal({
  isOpen,
  onClose,
  book,
  newWordsCount,
  totalAccumulatedWords,
  onAdvanceToNextBook,
}: BookCompletionModalProps) {
  if (!isOpen) return null;

  const totalWordsInBook = book.story_en
    ? book.story_en.split(/\s+/).filter(Boolean).length
    : book.interactive_text?.length || 0;

  const speakWord = (word: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Find sentence containing the word for context
  const getContextSentence = (wordClean: string) => {
    if (!book.story_en) return book.title;
    const sentences = book.story_en.split(/(?<=[.!?])\s+/);
    const matched = sentences.find((s) =>
      s.toLowerCase().includes(wordClean.toLowerCase())
    );
    return matched || sentences[0] || book.title;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl text-slate-900 overflow-hidden relative max-h-[90vh] flex flex-col p-0" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 p-6 text-white relative">
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Capítulo Concluído com Sucesso!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Livro {book.checkpoint}: {book.title}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Parabéns! Você concluiu todas as etapas da metodologia neste capítulo.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Métricas de Impacto */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[11px] font-bold text-sky-600 uppercase block mb-1">Palavras Lidas</span>
              <span className="text-2xl font-extrabold text-sky-900">{totalWordsInBook}</span>
              <span className="text-[10px] text-sky-600 block mt-0.5">no capítulo</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-600 uppercase block mb-1">Novas Palavras</span>
              <span className="text-2xl font-extrabold text-emerald-900">+{newWordsCount}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">mineradas hoje</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-amber-600 uppercase block mb-1">Léxico Total</span>
              <span className="text-2xl font-extrabold text-amber-900">{totalAccumulatedWords} / 2.000</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">rumo à fluência B1</span>
            </div>
          </div>

          {/* Agendamento no Algoritmo SRS */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>Agendamento de Revisão Espaçada (SRS)</span>
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                As novas palavras deste livro foram agendadas para revisão nos intervalos otimizados: <strong>1º dia, 3º dia, 7º dia e 14º dia</strong>.
              </p>
            </div>
          </div>

          {/* Relatório na Íntegra (Palavras Aprendidas) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <BookOpen size={18} className="text-emerald-600" />
                <span>Relatório na Íntegra (Vocabulário Aprendido)</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {book.interactive_text?.length || 0} palavras únicas
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                    <th className="p-2.5">Palavra (EN)</th>
                    <th className="p-2.5">Tradução (PT)</th>
                    <th className="p-2.5">Contexto na História</th>
                    <th className="p-2.5 text-center">Áudio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {book.interactive_text?.map((item: InteractiveWord, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-blue-900 whitespace-nowrap">
                        {item.word}
                        {item.is_new && (
                          <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full">
                            NOVA
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium whitespace-nowrap">
                        {item.translation}
                      </td>
                      <td className="p-2.5 text-slate-500 text-xs italic max-w-xs truncate" title={getContextSentence(item.clean_word || item.word)}>
                        "{getContextSentence(item.clean_word || item.word)}"
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => speakWord(item.clean_word || item.word)}
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition cursor-pointer inline-flex items-center gap-1 font-bold text-xs"
                          title="Ouvir pronúncia"
                        >
                          <Volume2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition cursor-pointer"
          >
            Fechar Relatório
          </button>

          <button
            onClick={() => {
              onClose();
              onAdvanceToNextBook();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Avançar para o Próximo Livro</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
