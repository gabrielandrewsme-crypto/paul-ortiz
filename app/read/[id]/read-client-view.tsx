'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Volume2, 
  Radio, 
  Headphones, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  HelpCircle,
  Award,
  X
} from 'lucide-react';
import { BookData } from '@/src/data/books';
import InteractiveBookReader from '@/src/components/InteractiveBookReader';

interface ReadClientViewProps {
  book: BookData;
  userEmail: string;
  userName: string;
}

export default function ReadClientView({ book, userEmail, userName }: ReadClientViewProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [writtenFeedback, setWrittenFeedback] = useState<string>('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string>('');

  const currentDeck = book.interactive_text || [];

  const handleMarkAsMastered = (cleanWord: string) => {
    setMasteredWords((prev) => new Set(prev).add(cleanWord.toLowerCase().trim()));
  };

  const handleCompleteRead = () => {
    // Salva o progresso no localStorage dependendo do tipo do livro
    let storageKey = '@antigravity:progress_mountain';
    if (book.id.startsWith('great-commission')) {
      storageKey = '@antigravity:progress_great_commission';
    } else if (book.id.startsWith('book-') && book.checkpoint > 16) {
      storageKey = '@antigravity:progress_daily_life';
    }

    try {
      const saved = localStorage.getItem(storageKey);
      let completedBooks: number[] = [];
      let unlockedLevel = 1;
      let learnedWordsCount = 0;

      if (saved) {
        const parsed = JSON.parse(saved);
        completedBooks = parsed.completedBooks || [];
        unlockedLevel = parsed.unlockedLevel || 1;
        learnedWordsCount = parsed.learnedWordsCount || 0;
      }

      const cpId = book.checkpoint;
      if (!completedBooks.includes(cpId)) {
        completedBooks.push(cpId);
        unlockedLevel = Math.max(unlockedLevel, cpId + 1);
        learnedWordsCount += book.interactive_text?.filter((w) => w.is_new).length || 0;
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          completedBooks,
          unlockedLevel,
          learnedWordsCount,
        })
      );

      setStatusToast('🎉 Capítulo concluído com sucesso! Progresso salvo na sua jornada.');
    } catch (e) {
      console.error('Erro ao salvar progresso:', e);
    }
  };

  const handleCloseTab = () => {
    if (typeof window !== 'undefined') {
      window.close();
      // Se não for possível fechar por política do navegador, redirecionar para a Home
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#061413] text-slate-100 font-sans p-3 sm:p-6 overflow-x-hidden selection:bg-teal-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* CAMEÇALHO DEDICADO DE LEITURA COM BOTÃO MINIMALISTA DE VOLTAR */}
        <header className="flex items-center justify-between border-b border-teal-500/20 pb-4 pt-2">
          <button
            onClick={handleCloseTab}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-teal-300 font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            <ArrowLeft size={16} />
            <span>← Voltar à Trilha</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-black text-teal-300 bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/30 shadow-inner">
            <BookOpen size={14} />
            <span className="uppercase tracking-wider">Checkpoint {book.checkpoint}</span>
          </div>
        </header>

        {/* STATUS TOAST */}
        {statusToast && (
          <div className="bg-teal-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span>{statusToast}</span>
            </div>
            <button onClick={() => setStatusToast('')} className="hover:opacity-80">
              <X size={16} />
            </button>
          </div>
        )}

        {/* PAINEL CABEÇALHO DO LIVRO & BARRA DE NAVEGAÇÃO DOS PASSOS */}
        <div className="bg-slate-900/70 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest block mb-1">
              Capítulo {book.checkpoint} — Leitura Isolada
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{book.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{book.summary}</p>

            {/* PLAYER DE ÁUDIO DO LIVRO */}
            {book.audio_url && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex items-center gap-3">
                <Volume2 className="text-teal-400 flex-shrink-0" size={20} />
                <audio controls src={book.audio_url} className="w-full h-8" />
              </div>
            )}
          </div>

          {/* BARRA DE SELEÇÃO DOS PASSOS (1. Imersão, 2. Flashcards, 3. Quiz) */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentStep === 1
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>1. Imersão Narrativa</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentStep === 2
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>2. Flashcards (SRS)</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                currentStep === 3
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>3. Quiz & Conclusão</span>
            </button>
          </div>
        </div>

        {/* PASSO 1: LEITURA INTERATIVA COM TRADUÇÕES E TTS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <InteractiveBookReader
              title={book.title}
              storyEn={book.story_en}
              interactiveText={book.interactive_text || []}
              onWordMastered={(word) => handleMarkAsMastered(word)}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
              >
                <span>Avançar para Passo 2: Flashcards</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: REVISÃO DE FLASHCARDS DO CAPÍTULO */}
        {currentStep === 2 && (
          <div className="bg-slate-900/80 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Layers className="text-amber-400" size={20} />
                  <span>Vocabulário Interativo do Capítulo</span>
                </h3>
                <p className="text-xs text-slate-400">Total de {currentDeck.length} termos selecionados neste minilivro</p>
              </div>
              <span className="text-xs bg-teal-500/20 text-teal-300 font-extrabold px-3 py-1 rounded-full border border-teal-500/30">
                {masteredWords.size} palavras praticadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {currentDeck.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-black text-white text-sm block">{item.word}</span>
                    <span className="text-xs text-teal-400 font-semibold">{item.translation}</span>
                  </div>
                  {item.part_of_speech && (
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                      {item.part_of_speech}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
              >
                <span>Avançar para Passo 3: Quiz do Capítulo</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: QUIZ DE FIXAÇÃO & FINALIZAÇÃO */}
        {currentStep === 3 && (
          <div className="bg-slate-900/80 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-xl flex items-center gap-2">
                <Award className="text-teal-400" size={24} />
                <span>Validação de Compreensão & Conclusão</span>
              </h3>
              <p className="text-xs text-slate-400">Responda ao quiz para concluir o Checkpoint {book.checkpoint}</p>
            </div>

            {book.quiz && book.quiz.length > 0 ? (
              <div className="space-y-4">
                {book.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-white text-sm">
                      {qIdx + 1}. {q.question}
                    </h4>

                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs font-bold transition ${
                              optIdx === q.correct_answer
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Leitura direta e assimilação de vocabulário concluídas.</p>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleCompleteRead}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>Concluir e Salvar Capítulo</span>
              </button>

              <button
                onClick={handleCloseTab}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-sm transition cursor-pointer text-center"
              >
                ← Voltar à Trilha Principal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
