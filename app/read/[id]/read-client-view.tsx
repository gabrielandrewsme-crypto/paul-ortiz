'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw,
  ChevronLeft,
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Award,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { BookData } from '@/src/data/books';
import InteractiveBookReader from '@/src/components/InteractiveBookReader';

interface ReadClientViewProps {
  book: BookData;
  userEmail: string;
  userName: string;
}

/** Componente de Áudio com resiliência a erros (Fallback para Web Speech IA se o MP3 falhar) */
function AudioPlayerWithFallback({ 
  audioUrl, 
  title, 
  textToNarrate 
}: { 
  audioUrl?: string; 
  title: string; 
  textToNarrate: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [useTTS, setUseTTS] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    setUseTTS(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioUrl, title]);

  const speakTextTTS = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToNarrate || title;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (useTTS || audioError || !audioUrl) {
      speakTextTTS();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Arquivo de áudio MP3 indisponível, utilizando narração nativa IA:', err);
          setAudioError(true);
          setUseTTS(true);
          speakTextTTS();
        });
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-3 shadow-lg">
      {audioUrl && !useTTS && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setAudioError(true);
            setUseTTS(true);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black flex items-center justify-center shadow-lg transition cursor-pointer"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div>
            <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
              {useTTS ? '🎙️ Narração com Voz IA Nativa' : '🎧 Narração Nativa do Capítulo'}
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{title}</h4>
          </div>
        </div>

        {duration > 0 && !useTTS && (
          <span className="text-xs text-slate-400 font-mono font-bold">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {duration > 0 && !useTTS && (
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setCurrentTime(val);
            if (audioRef.current) audioRef.current.currentTime = val;
          }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />
      )}
    </div>
  );
}

export default function ReadClientView({ book, userEmail, userName }: ReadClientViewProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [statusToast, setStatusToast] = useState<string>('');

  // Estados dos Flashcards (SRS)
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentDeck = book.interactive_text || [];
  const currentFlashcard = currentDeck[flashcardIdx] || null;

  const handleMarkAsMastered = (cleanWord: string) => {
    setMasteredWords((prev) => new Set(prev).add(cleanWord.toLowerCase().trim()));
  };

  const speakWord = (word: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleNextCard = () => {
    setIsFlipped(false); // Reseta para OCULTO por padrão
    setFlashcardIdx((prev) => (prev + 1) % currentDeck.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false); // Reseta para OCULTO por padrão
    setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : currentDeck.length - 1));
  };

  const handleCompleteRead = () => {
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
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#061413] text-slate-100 font-sans p-3 sm:p-6 overflow-x-hidden selection:bg-teal-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* CABEÇALHO DEDICADO DE LEITURA COM BOTÃO MINIMALISTA DE VOLTAR */}
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

            {/* PLAYER DE ÁUDIO RESILIENTE DO LIVRO */}
            <div className="mt-4">
              <AudioPlayerWithFallback
                audioUrl={book.audio_url}
                title={book.title}
                textToNarrate={book.story_en}
              />
            </div>
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
              onClick={() => {
                setIsFlipped(false); // Reseta estado do flashcard
                setCurrentStep(2);
              }}
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
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
              >
                <span>Avançar para Passo 2: Flashcards</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: REVISÃO DE FLASHCARDS DO CAPÍTULO COM OCULTAÇÃO E REVELAÇÃO SOB CLIQUE */}
        {currentStep === 2 && (
          <div className="bg-slate-900/80 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Layers className="text-amber-400" size={20} />
                  <span>Passo 2 — Treino de Vocabulário Flashcards (SRS)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Palavra {flashcardIdx + 1} de {currentDeck.length} deste minilivro
                </p>
              </div>
              <span className="text-xs bg-teal-500/20 text-teal-300 font-extrabold px-3 py-1 rounded-full border border-teal-500/30">
                {masteredWords.size} dominadas
              </span>
            </div>

            {currentFlashcard === null ? (
              <p className="text-slate-400 text-center py-8">Nenhuma palavra cadastrada neste capítulo.</p>
            ) : (
              <div className="space-y-4">
                {/* CARTÃO VIRÁVEL (FRENTE: INGLÊS / VERSO: PORTUGUÊS SOB CLIQUE) */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[240px] rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/60 border-2 border-dashed border-teal-500/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01] shadow-2xl relative select-none"
                >
                  <span className="absolute top-4 right-4 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                    {isFlipped ? '✨ Tradução Revelada' : '🔒 Clique para revelar tradução'}
                  </span>

                  {!isFlipped ? (
                    /* FRENTE DO CARD — TRADUÇÃO ESTRITAMENTE OCULTA */
                    <div className="space-y-3">
                      <span className="text-[11px] font-black uppercase text-teal-400 tracking-widest block">
                        Termo em Inglês
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
                        {currentFlashcard.word}
                      </h3>
                      {currentFlashcard.part_of_speech && (
                        <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 font-extrabold text-xs border border-teal-500/20">
                          {currentFlashcard.part_of_speech}
                        </span>
                      )}
                      <p className="text-xs text-slate-400 pt-3 flex items-center justify-center gap-1.5">
                        <Eye size={16} className="text-teal-400" />
                        <span>Clique no cartão para mostrar a tradução em Português</span>
                      </p>
                    </div>
                  ) : (
                    /* VERSO DO CARD — TRADUÇÃO EM PORTUGUÊS REVELADA APÓS O CLIQUE */
                    <div className="space-y-3">
                      <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest block">
                        Tradução em Português
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-300">
                        {currentFlashcard.translation}
                      </h3>
                      {currentFlashcard.part_of_speech && (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                          {currentFlashcard.part_of_speech}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CONTROLES DE NAVEGAÇÃO DOS FLASHCARDS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => speakWord(currentFlashcard.clean_word || currentFlashcard.word)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer flex-1 sm:flex-initial"
                    >
                      <Volume2 size={16} className="text-teal-400" />
                      <span>Ouvir Pronúncia</span>
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer flex-1 sm:flex-initial"
                    >
                      {isFlipped ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>{isFlipped ? 'Ocultar Tradução' : 'Revelar Tradução'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handlePrevCard}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1 flex-1 sm:flex-initial"
                    >
                      <ChevronLeft size={16} />
                      <span>Anterior</span>
                    </button>

                    <button
                      onClick={handleNextCard}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1 flex-1 sm:flex-initial"
                    >
                      <span>Próxima</span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => handleMarkAsMastered(currentFlashcard.clean_word || currentFlashcard.word)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <CheckCircle2 size={16} />
                      <span>Dominada</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
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
