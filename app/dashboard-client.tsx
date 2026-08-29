'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { 
  Flame,
  Trophy, 
  Flag, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  X, 
  Sparkles,
  ChevronRight,
  Award,
  RotateCcw,
  User,
  Crown,
  Lock,
  ShieldCheck,
  Volume2,
  ChevronLeft,
  Check,
  ListChecks,
  Send,
  HelpCircle
} from 'lucide-react';
import { allBooks, BookData, QuizQuestion } from '@/src/data/books';
import { greatCommissionBooks, GreatCommissionBook } from '@/src/data/books/great-commission';
import AvatarRenderer, { AvatarConfig } from '@/src/components/AvatarRenderer';
import UpgradeModal from '@/src/components/UpgradeModal';
import InteractiveBookReader from '@/src/components/InteractiveBookReader';
import WelcomeOnboardingModal from '@/src/components/WelcomeOnboardingModal';

interface CheckpointCoord {
  id: number;
  x: number;
  y: number;
  hasFlag?: boolean;
}

const CHECKPOINT_COORDS: CheckpointCoord[] = [
  { id: 1, x: 260, y: 510 },
  { id: 2, x: 310, y: 475 },
  { id: 3, x: 365, y: 440 },
  { id: 4, x: 420, y: 410 },
  { id: 5, x: 470, y: 380 },
  { id: 6, x: 430, y: 345 },
  { id: 7, x: 390, y: 315 },
  { id: 8, x: 440, y: 285 },
  { id: 9, x: 500, y: 260 },
  { id: 10, x: 550, y: 235 },
  { id: 11, x: 600, y: 215, hasFlag: true },
  { id: 12, x: 550, y: 190, hasFlag: true },
  { id: 13, x: 490, y: 170 },
  { id: 14, x: 460, y: 145, hasFlag: true },
  { id: 15, x: 480, y: 125 },
  { id: 16, x: 500, y: 100, hasFlag: true },
];

function buildPathD(): string {
  return CHECKPOINT_COORDS.map((pt, idx) => {
    return idx === 0 ? 'M ' + pt.x + ' ' + pt.y : 'L ' + pt.x + ' ' + pt.y;
  }).join(' ');
}

function getClimberTransform(x: number, y: number): string {
  return 'translate(' + (x - 25) + ', ' + (y - 50) + ')';
}

function getNodeTransform(x: number, y: number): string {
  return 'translate(' + x + ', ' + y + ')';
}

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<'main' | 'great_commission'>('main');
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(1);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([1]);
  const [userRole, setUserRole] = useState<'USER' | 'MANAGER' | 'ADMIN'>('USER');
  const [userAvatarConfig, setUserAvatarConfig] = useState<AvatarConfig | null>(null);
  
  const [streakDays, setStreakDays] = useState<number>(1);
  const [wordsLearned, setWordsLearned] = useState<number>(0);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [selectedBookForList, setSelectedBookForList] = useState<number>(1);
  const [vocabSubTab, setVocabSubTab] = useState<'flashcards' | 'word_list'>('flashcards');

  const totalGoal = 2000;

  // Toast / Mensagem de Status
  const [statusToast, setStatusToast] = useState<string>('');

  // Modais
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [upgradeSource, setUpgradeSource] = useState<'quiz_completed' | 'checkpoint_click' | 'header_btn'>('checkpoint_click');

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [writtenFeedback, setWrittenFeedback] = useState<string>('');
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Flashcards State
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserData(data.user);
          setUserRole(data.user.role || 'USER');
          if (data.user.avatarConfig) {
            setUserAvatarConfig(data.user.avatarConfig);
          }
          if (data.user.streakDays) setStreakDays(data.user.streakDays);
          if (data.user.totalWordsLearned) setWordsLearned(data.user.totalWordsLearned);
          if (data.user.currentCheckpoint) {
            const cp = data.user.currentCheckpoint;
            const completed = Array.from({ length: cp }, (_, i) => i + 1);
            setCompletedCheckpoints(completed);
            setActiveCheckpoint(cp);
          }

          // Verificar se é o primeiro acesso para abrir o Popup Motivacional
          const seenKey = 'po_welcome_modal_seen_' + data.user.id;
          const hasSeen = localStorage.getItem(seenKey);
          const searchParams = new URLSearchParams(window.location.search);
          const isOnboarding = searchParams.get('onboarding') === 'true';

          if (!hasSeen || isOnboarding) {
            setIsWelcomeModalOpen(true);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleCloseWelcomeModal = () => {
    if (userData?.id) {
      localStorage.setItem('po_welcome_modal_seen_' + userData.id, 'true');
    } else {
      localStorage.setItem('po_welcome_modal_seen_guest', 'true');
    }
    setIsWelcomeModalOpen(false);
  };

  const handleStartClimbing = () => {
    if (userData?.id) {
      localStorage.setItem('po_welcome_modal_seen_' + userData.id, 'true');
    } else {
      localStorage.setItem('po_welcome_modal_seen_guest', 'true');
    }
    setIsWelcomeModalOpen(false);
    setActiveCheckpoint(1);
    setIsVocabOpen(true);
  };

  const isSuperAdminUser = userData?.email?.toLowerCase().trim() === 'gabrielandrews.me@gmail.com';

  const isPlusUser = 
    isSuperAdminUser ||
    userRole === 'ADMIN' || 
    userRole === 'MANAGER' || 
    (userData?.isSubscribed === true && userData?.subscriptionStatus === 'ACTIVE');

  // Livro atual conforme a aba selecionada
  const currentBook: BookData = activeTab === 'main'
    ? (allBooks.find(b => b.checkpoint === activeCheckpoint) || allBooks[0])
    : ({
        ...(greatCommissionBooks.find(b => b.checkpoint === activeCheckpoint) || greatCommissionBooks[0]),
      } as any);

  const activeCoord = CHECKPOINT_COORDS.find(c => c.id === activeCheckpoint) || CHECKPOINT_COORDS[0];

  // Regra de bloqueio/desbloqueio sequencial dos Checkpoints
  const handleCheckpointClick = (id: number) => {
    setStatusToast('');

    // Trava de Progressão Sequencial: id só é liberado se id === 1 ou id - 1 já foi concluído (ou Super Admin)
    const isSequentialUnlocked = id === 1 || completedCheckpoints.includes(id - 1) || isSuperAdminUser;

    if (!isSequentialUnlocked) {
      setStatusToast(`🔒 Complete o Checkpoint ${id - 1} antes de avançar para o Checkpoint ${id}!`);
      setTimeout(() => setStatusToast(''), 4000);
      return;
    }

    // Regra Freemium: Livro 1 liberado para todos. Livros 2+ ou Great Commission apenas com Plus (bypassed para Super Admin)
    if (id > 1 || activeTab === 'great_commission') {
      if (!isPlusUser) {
        setUpgradeSource('checkpoint_click');
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setActiveCheckpoint(id);
    setSelectedOption(null);
    setWrittenAnswer('');
    setWrittenFeedback('');
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setFlashcardIdx(0);
    setIsFlipped(false);
  };

  // Tratar avanço nas perguntas do Quiz (Múltipla Escolha e Escrita Discursiva)
  const handleNextQuestion = () => {
    const questions: QuizQuestion[] = currentBook.quiz || [];
    const q = questions[currentQuestionIdx];

    if (!q) return;

    let isCorrect = false;

    if (q.type === 'open_writing') {
      const cleanAnswer = writtenAnswer.toLowerCase().trim();
      if (!cleanAnswer) return;

      if (q.expected_keywords && q.expected_keywords.length > 0) {
        isCorrect = q.expected_keywords.some(k => cleanAnswer.includes(k.toLowerCase()));
      } else {
        isCorrect = cleanAnswer.length >= 3;
      }

      setWrittenFeedback(isCorrect ? '✨ Excelente escrita! Resposta aceita.' : '💡 Bom esforço! Continue praticando.');
    } else {
      if (selectedOption === null) return;
      isCorrect = selectedOption === q.correct_answer;
    }

    const newScore = isCorrect ? quizScore + 1 : quizScore;
    if (isCorrect) setQuizScore(newScore);

    if (currentQuestionIdx + 1 < questions.length) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
        setWrittenAnswer('');
        setWrittenFeedback('');
      }, q.type === 'open_writing' ? 800 : 0);
    } else {
      setQuizCompleted(true);
      if (newScore >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setWordsLearned(prev => Math.min(totalGoal, prev + 15));

        // Desbloquear próximo checkpoint
        setCompletedCheckpoints(prev => Array.from(new Set([...prev, activeCheckpoint])));

        if (activeCheckpoint === 1 && !isPlusUser) {
          setTimeout(() => {
            setIsQuizOpen(false);
            setUpgradeSource('quiz_completed');
            setIsUpgradeModalOpen(true);
          }, 1500);
        }
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setWrittenAnswer('');
    setWrittenFeedback('');
    setQuizScore(0);
    setQuizCompleted(false);
  };

  // Tratar palavra marcada como dominada nos flashcards ou leitor
  const handleMarkAsMastered = (cleanWord: string) => {
    setMasteredWords(prev => new Set(prev).add(cleanWord.toLowerCase().trim()));
    setWordsLearned(prev => Math.min(totalGoal, prev + 1));

    // Avança para o próximo flashcard no deck completo
    const deck = currentBook.interactive_text || [];
    if (deck.length > 0) {
      setFlashcardIdx(prev => (prev + 1) % deck.length);
      setIsFlipped(false);
    }
  };

  // Tocar pronúncia TTS de uma palavra
  const speakWord = (word: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const pathD = buildPathD();
  const climberTransform = getClimberTransform(activeCoord.x, activeCoord.y);
  const goalWidthPercent = Math.min(100, (wordsLearned / totalGoal) * 100) + '%';
  
  // Deck completo do livro atual
  const currentDeck = currentBook?.interactive_text || [];
  const currentFlashcard = currentDeck.length > 0 ? currentDeck[flashcardIdx % currentDeck.length] : null;

  // Livro selecionado para a Lista de Vocabulário Aprendido
  const bookForList = allBooks.find(b => b.checkpoint === selectedBookForList) || allBooks[0];

  return (
    <div className="app-container">
      {/* HEADER BAR */}
      <header className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="brand-title">Paul Ortiz</h1>
          {/* Indicador de Assinatura ou Botão de Upgrade */}
          {isSuperAdminUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-100 font-extrabold text-xs">
              <ShieldCheck size={15} className="text-amber-300" />
              <span>Acesso Vitalício / Ilimitado</span>
            </div>
          ) : isPlusUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-100 font-extrabold text-xs">
              <Crown size={15} className="text-amber-300" />
              <span>Plano Plus Ativo</span>
              {userData?.subscriptionEndDate && (
                <span className="text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full text-emerald-300">
                  {Math.max(0, Math.ceil((new Date(userData.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias restantes
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setUpgradeSource('header_btn');
                setIsUpgradeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer"
            >
              <Crown size={15} /> Assinar Plano Plus
            </button>
          )}
        </div>

        <div className="header-center-stats">
          <div className="streak-pill" title="Dias seguidos praticando">
            <span className="streak-icon">
              <Flame size={20} color="#ff7a29" fill="#ff7a29" />
            </span>
            <div className="streak-text-group">
              <span className="streak-label">Streak</span>
              <span className="streak-value">{streakDays}</span>
            </div>
          </div>

          <div className="goal-group">
            <div className="goal-label">
              Daily Goal: {wordsLearned}/{totalGoal} words
            </div>
            <div className="goal-track">
              <div 
                className="goal-fill" 
                style={{ width: goalWidthPercent }} 
              />
            </div>
          </div>
        </div>

        <div className="user-controls">
          {/* EXCLUSIVO PARA GABRIELANDREWS.ME@GMAIL.COM */}
          {isSuperAdminUser && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Painel Administrativo Supremo"
            >
              <ShieldCheck size={16} />
              <span>Painel Admin</span>
            </Link>
          )}

          <Link href="/avatar" className="avatar-wrapper" title="Personalizar Avatar">
            <div className="avatar-img">
              {userAvatarConfig ? (
                <AvatarRenderer config={userAvatarConfig} size={42} overrideBgColor="transparent" />
              ) : (
                <User size={22} color="#1e293b" />
              )}
            </div>
            <div className="status-dot" />
          </Link>
          <button className="icon-btn" onClick={() => setIsSettingsOpen(true)} title="Configurações">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* TOAST DE ALERTA SE QUISER SALTAR DEGRAUS */}
      {statusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <Lock size={16} />
          <span>{statusToast}</span>
        </div>
      )}

      {/* SELETOR DE MÓDULOS / ABAS DA MONTANHA */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem', zIndex: 10 }}>
        <button
          onClick={() => {
            setActiveTab('main');
            setActiveCheckpoint(1);
          }}
          style={{
            background: activeTab === 'main' ? '#ffffff' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'main' ? '#1e293b' : '#ffffff',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'main' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🏔️ Jornada Náutica (16 Livros)
        </button>

        <button
          onClick={() => {
            if (!isPlusUser) {
              setUpgradeSource('checkpoint_click');
              setIsUpgradeModalOpen(true);
              return;
            }
            setActiveTab('great_commission');
            setActiveCheckpoint(1);
          }}
          style={{
            background: activeTab === 'great_commission' ? '#ffffff' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'great_commission' ? '#1e293b' : '#ffffff',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: activeTab === 'great_commission' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {!isPlusUser && <Lock size={14} color="#f59e0b" />}
          <span>✨ Great Commission</span>
        </button>
      </div>

      {/* CENTRAL MOUNTAIN STAGE */}
      <div className="mountain-stage">
        <svg viewBox="0 0 1000 560" className="mountain-svg">
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f75a6" />
              <stop offset="50%" stopColor="#3b5a82" />
              <stop offset="100%" stopColor="#2c4566" />
            </linearGradient>

            <linearGradient id="mountainFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e486b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e324c" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path
            d="M 120 540 Q 320 280 500 120 Q 680 280 880 540 Z"
            fill="url(#mountainGrad)"
          />

          <path
            d="M 500 120 Q 600 300 880 540 L 500 540 Z"
            fill="url(#mountainFacet)"
          />
          <path
            d="M 500 120 Q 420 260 380 540 L 500 540 Z"
            fill="#345277"
            opacity="0.4"
          />

          <path
            d="M 500 120 L 460 185 Q 480 200 500 190 Q 520 205 540 185 Z"
            fill="#ffffff"
          />
          <path
            d="M 460 185 Q 475 210 490 195 Q 510 215 540 185 L 500 120 Z"
            fill="#f1f5f9"
            opacity="0.9"
          />

          {/* Trilha de subida em ziguezague */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Avatar no Checkpoint ativo */}
          <g transform={climberTransform}>
            {userAvatarConfig ? (
              <AvatarRenderer config={userAvatarConfig} size={50} overrideBgColor="transparent" />
            ) : (
              <g>
                <circle cx="0" cy="0" r="8" fill="none" stroke="#1e293b" strokeWidth="2.2" />
                <circle cx="-2" cy="-2" r="1" fill="#1e293b" />
                <circle cx="3" cy="-2" r="1" fill="#1e293b" />
                <line x1="0" y1="8" x2="4" y2="25" stroke="#1e293b" strokeWidth="2.2" />
              </g>
            )}
          </g>

          {/* Checkpoints da Montanha com Regra de Bloqueio Sequencial */}
          {CHECKPOINT_COORDS.map((cp) => {
            const isActive = cp.id === activeCheckpoint;
            const isSequentialUnlocked = cp.id === 1 || completedCheckpoints.includes(cp.id - 1) || isSuperAdminUser;
            const isPlanLocked = cp.id > 1 && !isPlusUser;
            const isLocked = !isSequentialUnlocked || isPlanLocked;
            const nodeTransform = getNodeTransform(cp.x, cp.y);

            return (
              <g 
                key={cp.id} 
                transform={nodeTransform}
                className={isActive ? 'checkpoint-node active' : 'checkpoint-node'}
                onClick={() => handleCheckpointClick(cp.id)}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
              >
                {cp.hasFlag && (
                  <g transform="translate(6, -26)">
                    <line x1="0" y1="0" x2="0" y2="16" stroke="#b91c1c" strokeWidth="2" />
                    <polygon points="0,0 12,4 0,9" fill="#ef4444" />
                  </g>
                )}

                {isActive && (
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="active-pulse-ring"
                  />
                )}

                {isActive && (
                  <circle
                    cx="0"
                    cy="0"
                    r="16"
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth="3.5"
                    filter="url(#glow)"
                  />
                )}

                <circle
                  cx="0"
                  cy="0"
                  r="13"
                  className="checkpoint-circle"
                  style={{ fill: isLocked ? '#64748b' : '#ffffff' }}
                />

                {isLocked ? (
                  <g transform="translate(-6, -6)">
                    <Lock size={12} color="#ffffff" />
                  </g>
                ) : (
                  <text className="checkpoint-text">
                    {cp.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* BOTTOM FEATURE CARDS */}
      <div className="bottom-cards-grid">
        {/* CARD 1 - LEITOR INTERATIVO DE ÁUDIO WEB SPEECH */}
        <div className="feature-card" style={{ gridColumn: 'span 2' }}>
          <InteractiveBookReader
            title={currentBook.title}
            storyEn={currentBook.story_en}
            interactiveText={currentBook.interactive_text || []}
            onWordMastered={(word) => handleMarkAsMastered(word)}
          />
        </div>

        {/* CARD 2 - VOCABULARY MASTERY */}
        <div className="feature-card" onClick={() => setIsVocabOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="card-number-badge">2</div>

          <div className="card-content-top">
            <div className="card-icon-title">
              <div className="card-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 className="card-main-title" style={{ marginTop: '0.2rem' }}>Vocabulary Mastery</h3>
              </div>
            </div>

            <div className="vocab-stats-row">
              <BarChart3 size={24} color="#4a90e2" />
              <div className="vocab-stat-text">
                <span className="vocab-stat-main">{wordsLearned} words learned</span>
                <span className="vocab-stat-sub">Goal: {totalGoal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3 - QUIZ DE CULTURA E INTERPRETAÇÃO */}
        <div className="feature-card">
          <div className="card-number-badge">3</div>

          <div className="card-content-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}>
                <Flag size={18} fill="#ef4444" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
                <Trophy size={20} fill="#f59e0b" />
              </div>
            </div>

            <div style={{ marginTop: '0.2rem' }}>
              <span className="card-header-label">Daily Challenge:</span>
              <h3 className="card-main-title">Culture & Writing Quiz</h3>
            </div>
          </div>

          <button className="card-action-btn" onClick={() => setIsQuizOpen(true)}>
            Start Challenge <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* QUIZ MODAL - MÚLTIPLA ESCOLHA EM INGLÊS E ESCRITA DISCURSIVA */}
      {isQuizOpen && (
        <div className="modal-overlay" onClick={() => setIsQuizOpen(false)}>
          <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsQuizOpen(false)}>
              <X size={18} />
            </button>

            {!quizCompleted ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Award color="#4a90e2" size={24} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Quiz - {currentBook.title}</h2>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      Pergunta {currentQuestionIdx + 1} de {currentBook.quiz?.length || 5}
                    </span>
                    {currentBook.quiz?.[currentQuestionIdx]?.type === 'open_writing' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full">
                        ✍️ Prática de Escrita Discursiva
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.4rem', color: '#0f172a' }}>
                    {currentBook.quiz?.[currentQuestionIdx]?.question || 'Qual o significado correto?'}
                  </p>
                </div>

                {/* Pergunta de Escrita Discursiva */}
                {currentBook.quiz?.[currentQuestionIdx]?.type === 'open_writing' ? (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Type your response in English here..."
                      value={writtenAnswer}
                      onChange={(e) => setWrittenAnswer(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 text-sm"
                    />

                    {writtenFeedback && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-2">
                        <Sparkles size={16} />
                        <span>{writtenFeedback}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Pergunta de Múltipla Escolha */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {currentBook.quiz?.[currentQuestionIdx]?.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          style={{
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            border: isSelected ? '2px solid #4a90e2' : '1px solid #e2e8f0',
                            padding: '0.9rem 1.2rem',
                            borderRadius: '14px',
                            textAlign: 'left',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            color: isSelected ? '#1d4ed8' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                          {isSelected && <CheckCircle2 size={18} color="#4a90e2" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  className="card-action-btn"
                  onClick={handleNextQuestion}
                  disabled={currentBook.quiz?.[currentQuestionIdx]?.type === 'open_writing' ? !writtenAnswer.trim() : selectedOption === null}
                  style={{
                    marginTop: '1.5rem',
                    opacity: (currentBook.quiz?.[currentQuestionIdx]?.type === 'open_writing' ? !writtenAnswer.trim() : selectedOption === null) ? 0.5 : 1,
                    cursor: (currentBook.quiz?.[currentQuestionIdx]?.type === 'open_writing' ? !writtenAnswer.trim() : selectedOption === null) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {currentQuestionIdx + 1 === (currentBook.quiz?.length || 5) ? 'Finalizar Quiz' : 'Próxima Pergunta'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <Sparkles size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {quizScore >= 2 ? 'Parabéns! Você Aprovou!' : 'Tente Novamente'}
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
                  Sua pontuação: <strong>{quizScore} de {currentBook.quiz?.length || 5} acertos</strong>.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.8rem', justifyContent: 'center' }}>
                  <button
                    onClick={restartQuiz}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: 'none',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RotateCcw size={16} /> Tentar de novo
                  </button>
                  <button
                    onClick={() => setIsQuizOpen(false)}
                    className="card-action-btn"
                    style={{ width: 'auto', padding: '0.8rem 1.8rem' }}
                  >
                    Continuar Jornada
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VOCABULARY FLASHCARDS & LISTA DE PALAVRAS APRENDIDAS MODAL */}
      {isVocabOpen && (
        <div className="modal-overlay" onClick={() => setIsVocabOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsVocabOpen(false)}>
              <X size={18} />
            </button>

            {/* SELETOR DE ABAS DO VOCABULÁRIO */}
            <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setVocabSubTab('flashcards')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  vocabSubTab === 'flashcards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers size={16} /> Flashcards Interativos
              </button>

              <button
                onClick={() => setVocabSubTab('word_list')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  vocabSubTab === 'word_list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListChecks size={16} /> Lista por Livro
              </button>
            </div>

            {/* ABA 1: DECK COMPLETO DE FLASHCARDS COM NAVEGAÇÃO E BOTÃO DE DOMÍNIO */}
            {vocabSubTab === 'flashcards' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {currentBook.title} ({flashcardIdx + 1}/{currentDeck.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {masteredWords.size} dominadas
                  </span>
                </div>

                {currentFlashcard === null ? (
                  <p className="text-slate-500 text-center py-8">Nenhuma palavra cadastrada neste livro.</p>
                ) : (
                  <div>
                    {/* Card Virável */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      style={{
                        background: isFlipped ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        border: '2px dashed #93c5fd',
                        borderRadius: '20px',
                        minHeight: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '2rem',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        position: 'relative'
                      }}
                    >
                      {!isFlipped ? (
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            Palavra em Inglês (Clique para ver tradução)
                          </span>
                          <h3 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.5rem' }}>
                            {currentFlashcard.word}
                          </h3>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>
                            Tradução em Português
                          </span>
                          <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#065f46', marginTop: '0.5rem' }}>
                            {currentFlashcard.translation}
                          </h3>
                          {currentFlashcard.part_of_speech && (
                            <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: '999px', marginTop: '0.5rem', display: 'inline-block' }}>
                              {currentFlashcard.part_of_speech}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Botão de Áudio no Card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(currentFlashcard.clean_word || currentFlashcard.word);
                        }}
                        style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        title="Ouvir Pronúncia"
                      >
                        <Volume2 size={18} color="#0284c7" />
                      </button>
                    </div>

                    {/* BOTÕES DE NAVEGAÇÃO E DOMÍNIO */}
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => {
                          setFlashcardIdx(prev => (prev > 0 ? prev - 1 : currentDeck.length - 1));
                          setIsFlipped(false);
                        }}
                        style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>

                      <button
                        onClick={() => handleMarkAsMastered(currentFlashcard.clean_word || currentFlashcard.word)}
                        style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                      >
                        <Check size={16} /> Marcar como Dominada
                      </button>

                      <button
                        onClick={() => {
                          setFlashcardIdx(prev => (prev + 1) % currentDeck.length);
                          setIsFlipped(false);
                        }}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        Próxima <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA 2: LISTA DE PALAVRAS APRENDIDAS FILTRADAS POR LIVRO */}
            {vocabSubTab === 'word_list' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Vocabulário por Livro
                  </h3>

                  {/* Seletor do Livro */}
                  <select
                    value={selectedBookForList}
                    onChange={(e) => setSelectedBookForList(Number(e.target.value))}
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, background: '#ffffff', cursor: 'pointer' }}
                  >
                    {allBooks.map((b) => (
                      <option key={b.checkpoint} value={b.checkpoint}>
                        Livro {b.checkpoint}: {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px', background: '#ffffff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '0.7rem' }}>Palavra (Inglês)</th>
                        <th style={{ padding: '0.7rem' }}>Tradução</th>
                        <th style={{ padding: '0.7rem' }}>Classe</th>
                        <th style={{ padding: '0.7rem', textAlign: 'center' }}>Pronúncia</th>
                        <th style={{ padding: '0.7rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookForList.interactive_text?.map((item, idx) => {
                        const clean = (item.clean_word || item.word).toLowerCase().trim();
                        const isMastered = masteredWords.has(clean);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.7rem', fontWeight: 700, color: '#1e3a8a' }}>{item.word}</td>
                            <td style={{ padding: '0.7rem', color: '#334155' }}>{item.translation}</td>
                            <td style={{ padding: '0.7rem', color: '#64748b' }}>{item.part_of_speech || '-'}</td>
                            <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                              <button
                                onClick={() => speakWord(item.clean_word || item.word)}
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Volume2 size={14} /> Ouvir
                              </button>
                            </td>
                            <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                              {isMastered ? (
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                  ✅ Dominada
                                </span>
                              ) : (
                                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  📘 Em Aprendizado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIGURAÇÕES MODAL */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSettingsOpen(false)}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Configurações da Plataforma</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Plataforma Paul Ortiz sincronizada com o banco de dados <strong>Neon PostgreSQL</strong>.
            </p>
            <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Status do Plano:</strong> {isPlusUser ? '🌟 Plano Plus Ativo' : '🆓 Plano Gratuito (Freemium)'}</p>
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.4rem' }}><strong>Progresso:</strong> Checkpoint {activeCheckpoint} de 16</p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="card-action-btn"
              style={{ marginTop: '1.5rem' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL (GATILHO DE VENDAS) */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        source={upgradeSource}
      />

      {/* POPUP EDUCACIONAL MOTIVACIONAL (PRIMEIRO ACESSO ONLY) */}
      <WelcomeOnboardingModal
        userId={userData?.id}
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcomeModal}
        onStartClimbing={handleStartClimbing}
      />
    </div>
  );
}
