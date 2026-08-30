'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
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
  HelpCircle,
  Edit3,
  Target,
  ArrowRight,
  LogOut,
  Radio,
  Headphones,
  MessageCircle
} from 'lucide-react';
import { allBooks, BookData, QuizQuestion } from '@/src/data/books';
import { greatCommissionBooks, GreatCommissionBook } from '@/src/data/books/great-commission';
import AvatarRenderer, { AvatarConfig } from '@/src/components/AvatarRenderer';
import UpgradeModal from '@/src/components/UpgradeModal';
import InteractiveBookReader from '@/src/components/InteractiveBookReader';
import WelcomeOnboardingModal from '@/src/components/WelcomeOnboardingModal';
import TutorialModal from '@/src/components/TutorialModal';
import BookCompletionModal from '@/src/components/BookCompletionModal';
import PodcastModal from '@/src/components/PodcastModal';

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

function buildPathD(coords: CheckpointCoord[]): string {
  return coords.map((pt, idx) => {
    return idx === 0 ? 'M ' + pt.x + ' ' + pt.y : 'L ' + pt.x + ' ' + pt.y;
  }).join(' ');
}

function getClimberTransform(x: number, y: number): string {
  return 'translate(' + (x - 25) + ', ' + (y - 50) + ')';
}

function getNodeTransform(x: number, y: number): string {
  return 'translate(' + x + ', ' + y + ')';
}

interface BookProgress {
  completedBooks: number[]; // IDs dos livros concluídos ex: [1, 2]
  unlockedLevel: number;    // Nível máximo liberado ex: 2
  learnedWordsCount: number;
}

export default function DashboardClient() {
  // 1. Estado com flag de montagem para ELIMINAR o flicker do F5
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Progresso isolado para a Jornada da Montanha
  const [mountainProgress, setMountainProgress] = useState<BookProgress>({
    completedBooks: [1],
    unlockedLevel: 1,
    learnedWordsCount: 0,
  });

  // Progresso isolado para The Great Commission
  const [gcProgress, setGcProgress] = useState<BookProgress>({
    completedBooks: [1],
    unlockedLevel: 1,
    learnedWordsCount: 0,
  });

  const [activeTab, setActiveTab] = useState<'main' | 'great_commission'>('main');
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(1);
  const [userRole, setUserRole] = useState<'USER' | 'MANAGER' | 'ADMIN'>('USER');
  const [userAvatarConfig, setUserAvatarConfig] = useState<AvatarConfig | null>(null);
  
  const [streakDays, setStreakDays] = useState<number>(1);
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

  // Modais de Tutorial, Conclusão e Podcast
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState<boolean>(false);

  // Workflow Sequencial do Livro Ativo (4 Passos)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [outputSentences, setOutputSentences] = useState<[string, string, string]>(['', '', '']);
  const [outputSubmitted, setOutputSubmitted] = useState<boolean>(false);

  // Flashcards State
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const [userData, setUserData] = useState<any>(null);

  // Pillar 2: Modo Livre vs. Modo Jornada Pedagógica
  const [freeMode, setFreeMode] = useState<boolean>(false);

  // Carrega do localStorage os progressos de ambas as coleções na montagem (Pillar 1)
  useEffect(() => {
    const savedM = localStorage.getItem('@antigravity:progress_mountain') || localStorage.getItem('@antigravity:progress');
    if (savedM) {
      try {
        const parsed: BookProgress = JSON.parse(savedM);
        if (parsed && Array.isArray(parsed.completedBooks)) {
          setMountainProgress(parsed);
        }
      } catch (e) {
        console.error('Erro ao ler progresso da montanha:', e);
      }
    }

    const savedGC = localStorage.getItem('@antigravity:progress_great_commission');
    if (savedGC) {
      try {
        const parsed: BookProgress = JSON.parse(savedGC);
        if (parsed && Array.isArray(parsed.completedBooks)) {
          setGcProgress(parsed);
        }
      } catch (e) {
        console.error('Erro ao ler progresso Great Commission:', e);
      }
    }

    const savedFreeMode = localStorage.getItem('@antigravity:free_mode');
    if (savedFreeMode) {
      setFreeMode(savedFreeMode === 'true');
    }
    setIsMounted(true);
  }, []);

  // Progresso da aba ativa no momento
  const activeProgress = activeTab === 'main' ? mountainProgress : gcProgress;
  const maxCheckpoints = activeTab === 'main' ? 16 : 5;

  // Salva o progresso na coleção correspondente
  const saveProgress = (newProgress: BookProgress) => {
    if (activeTab === 'main') {
      setMountainProgress(newProgress);
      localStorage.setItem('@antigravity:progress_mountain', JSON.stringify(newProgress));
      localStorage.setItem('@antigravity:progress', JSON.stringify(newProgress));
    } else {
      setGcProgress(newProgress);
      localStorage.setItem('@antigravity:progress_great_commission', JSON.stringify(newProgress));
    }
  };

  const toggleFreeMode = (enabled: boolean) => {
    setFreeMode(enabled);
    localStorage.setItem('@antigravity:free_mode', String(enabled));
    setStatusToast(
      enabled
        ? '🔓 Modo Livre ativado: todos os livros liberados para testes.'
        : '🔒 Modo Jornada Pedagógica ativado: desbloqueio sequencial ativado.'
    );
    setTimeout(() => setStatusToast(''), 4000);
  };

  const handleResetProgress = () => {
    if (
      confirm(
        'Tem certeza que deseja resetar o progresso de TODAS as coleções? Esta ação apagará seus checkpoints concluídos e zerará os contadores para recomeçar do zero.'
      )
    ) {
      const resetProg: BookProgress = {
        completedBooks: [1],
        unlockedLevel: 1,
        learnedWordsCount: 0,
      };
      setMountainProgress(resetProg);
      setGcProgress(resetProg);
      localStorage.setItem('@antigravity:progress_mountain', JSON.stringify(resetProg));
      localStorage.setItem('@antigravity:progress', JSON.stringify(resetProg));
      localStorage.setItem('@antigravity:progress_great_commission', JSON.stringify(resetProg));

      setMasteredWords(new Set());
      setActiveCheckpoint(1);
      setCurrentStep(1);
      setOutputSentences(['', '', '']);
      setOutputSubmitted(false);
      setStatusToast('✨ Progresso de todas as coleções resetado com sucesso!');
      setTimeout(() => setStatusToast(''), 4000);
      setIsSettingsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao encerrar sessão backend:', err);
    }
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error('Erro no signOut do NextAuth:', err);
    }
    localStorage.removeItem('@antigravity:progress_mountain');
    localStorage.removeItem('@antigravity:progress_great_commission');
    localStorage.removeItem('@antigravity:progress');
    localStorage.removeItem('@antigravity:free_mode');
    localStorage.removeItem('@antigravity:user_name');
    window.location.href = '/login';
  };

  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const savedName = localStorage.getItem('@antigravity:user_name');
    if (savedName) setDisplayName(savedName);
  }, []);

  const handleSaveDisplayName = () => {
    const cleanName = displayName.trim();
    if (!cleanName) return;

    if (userData) {
      setUserData({ ...userData, name: cleanName });
    }
    localStorage.setItem('@antigravity:user_name', cleanName);
    setStatusToast(`✨ Nome de exibição atualizado para "${cleanName}"!`);
    setTimeout(() => setStatusToast(''), 4000);
  };

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

          if (data.user.currentCheckpoint && mountainProgress.completedBooks.length <= 1) {
            const cp = data.user.currentCheckpoint;
            const completed = Array.from({ length: cp }, (_, i) => i + 1);
            const newProg: BookProgress = {
              completedBooks: completed,
              unlockedLevel: Math.max(mountainProgress.unlockedLevel, cp),
              learnedWordsCount: data.user.totalWordsLearned || mountainProgress.learnedWordsCount,
            };
            setMountainProgress(newProg);
            localStorage.setItem('@antigravity:progress_mountain', JSON.stringify(newProg));
          }

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
    localStorage.setItem('@antigravity:has_seen_onboarding', 'true');
    setIsWelcomeModalOpen(false);
    setActiveCheckpoint(1);
    setCurrentStep(1);
  };

  const isSuperAdminUser = userData?.email?.toLowerCase().trim() === 'gabrielandrews.me@gmail.com';

  const isPlusUser = 
    isSuperAdminUser ||
    userRole === 'ADMIN' || 
    userRole === 'MANAGER' || 
    (userData?.isSubscribed === true && userData?.subscriptionStatus === 'ACTIVE');

  // Alternar abas com isolamento total de dados e checkpoints
  const handleTabChange = (tab: 'main' | 'great_commission') => {
    if (tab === 'great_commission' && !isPlusUser) {
      setUpgradeSource('checkpoint_click');
      setIsUpgradeModalOpen(true);
      return;
    }
    setActiveTab(tab);
    const targetProg = tab === 'main' ? mountainProgress : gcProgress;
    const maxLvl = tab === 'main' ? 16 : 5;
    setActiveCheckpoint(Math.min(maxLvl, Math.max(1, targetProg.unlockedLevel)));
    setCurrentStep(1);
    setOutputSentences(['', '', '']);
    setOutputSubmitted(false);
  };

  // Coordenadas dinâmicas da trilha baseadas na coleção ativa (16 para Montanha, 5 para Great Commission)
  const activeCoords = activeTab === 'main' ? CHECKPOINT_COORDS : CHECKPOINT_COORDS.slice(0, 5);
  const pathD = buildPathD(activeCoords);

  // Coleção de livros isolada da aba ativa
  const currentBookList: BookData[] = activeTab === 'main'
    ? allBooks
    : (greatCommissionBooks as unknown as BookData[]);

  const currentBook: BookData = currentBookList.find(b => b.checkpoint === activeCheckpoint) || currentBookList[0];
  const activeCoord = activeCoords.find(c => c.id === activeCheckpoint) || activeCoords[0];
  const wordsLearned = (mountainProgress.learnedWordsCount || 0) + (gcProgress.learnedWordsCount || 0);

  // Regra de bloqueio/desbloqueio sequencial dos Checkpoints por coleção
  const handleCheckpointClick = (id: number) => {
    setStatusToast('');

    const isSequentialUnlocked =
      id === 1 ||
      freeMode ||
      activeProgress.completedBooks.includes(id - 1) ||
      id <= activeProgress.unlockedLevel ||
      isSuperAdminUser;

    if (!isSequentialUnlocked) {
      setStatusToast(`🔒 Complete o Checkpoint ${id - 1} antes de avançar para o Checkpoint ${id}!`);
      setTimeout(() => setStatusToast(''), 4000);
      return;
    }

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
    setCurrentStep(1);
    setOutputSentences(['', '', '']);
    setOutputSubmitted(false);
  };

  // Tratar conclusão do livro (Passo 4 / Módulo de Contabilização)
  const handleCompleteBook = () => {
    const isAlreadyCompleted = activeProgress.completedBooks.includes(activeCheckpoint);
    const newWordsInThisBook = currentBook.interactive_text?.filter((w) => w.is_new).length || 0;

    const updatedCompleted = isAlreadyCompleted
      ? activeProgress.completedBooks
      : [...activeProgress.completedBooks, activeCheckpoint];

    const nextLevel = Math.max(activeProgress.unlockedLevel, activeCheckpoint + 1);
    const updatedWordsCount = isAlreadyCompleted
      ? activeProgress.learnedWordsCount
      : activeProgress.learnedWordsCount + newWordsInThisBook;

    const newProgress: BookProgress = {
      completedBooks: updatedCompleted,
      unlockedLevel: Math.min(nextLevel, maxCheckpoints),
      learnedWordsCount: updatedWordsCount,
    };

    saveProgress(newProgress);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

    setIsCompletionModalOpen(true);
  };

  // Evita renderizar a árvore com estado falso antes do localStorage ser lido
  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d131f] text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

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
      if (newScore >= 1) {
        handleCompleteBook();
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
    const newProg: BookProgress = {
      ...activeProgress,
      learnedWordsCount: activeProgress.learnedWordsCount + 1,
    };
    saveProgress(newProg);

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

  const climberTransform = getClimberTransform(activeCoord.x, activeCoord.y);
  const goalWidthPercent = Math.min(100, (wordsLearned / totalGoal) * 100) + '%';
  
  // Deck completo do livro atual
  const currentDeck = currentBook?.interactive_text || [];
  const currentFlashcard = currentDeck.length > 0 ? currentDeck[flashcardIdx % currentDeck.length] : null;

  // Livro selecionado para a Lista de Vocabulário Aprendido
  const bookForList = allBooks.find(b => b.checkpoint === selectedBookForList) || allBooks[0];

  return (
    <div className="app-container w-full max-w-md sm:max-w-4xl md:max-w-6xl mx-auto px-4 overflow-x-hidden">
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
          {/* BOTÃO PODCAST AUDIO EXPERIENCE */}
          <button
            onClick={() => setIsPodcastModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:brightness-110 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            title="Ouvir Episódios do Podcast Antigravity"
          >
            <Radio size={16} className="text-sky-300 animate-pulse" />
            <span className="hidden sm:inline">Podcast</span>
          </button>

          {/* BOTÃO TUTORIAL E OBJETIVO DA PLATAFORMA */}
          <button
            onClick={() => setIsTutorialModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white font-extrabold text-xs backdrop-blur-md border border-white/30 shadow-md transition cursor-pointer"
            title="Ver Tutorial e Método de Aprendizado em 4 Passos"
          >
            <HelpCircle size={16} className="text-amber-300" />
            <span className="hidden sm:inline">Tutorial & Objetivo</span>
          </button>

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

      {/* SELETOR DE MÓDULOS / ABAS DA PLATAFORMA */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem', zIndex: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => handleTabChange('main')}
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
          🏔️ Jornada da Montanha (16 Livros)
        </button>

        <button
          onClick={() => handleTabChange('great_commission')}
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
          <span>✨ The Great Commission (5 Livros)</span>
        </button>

        <button
          onClick={() => setIsPodcastModalOpen(true)}
          style={{
            background: 'rgba(99,102,241,0.3)',
            color: '#ffffff',
            border: '1px solid rgba(165,180,252,0.4)',
            padding: '0.5rem 1.2rem',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <Radio size={15} className="text-sky-300" />
          <span>🎙️ Podcasts</span>
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

          {/* Checkpoints da Montanha com Regra de Bloqueio Sequencial Otimizados por Coleção */}
          {activeCoords.map((cp) => {
            const isActive = cp.id === activeCheckpoint;
            const isSequentialUnlocked =
              cp.id === 1 ||
              freeMode ||
              activeProgress.completedBooks.includes(cp.id - 1) ||
              cp.id <= activeProgress.unlockedLevel ||
              isSuperAdminUser;
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

      {/* CARD DE COMUNIDADE & PRÁTICA DE CONVERSAÇÃO NO WHATSAPP */}
      <div className="w-full max-w-md sm:max-w-none mx-auto bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
            <MessageCircle size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Grupo Oficial de Alunos
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
              Comunidade & Prática de Conversação
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Participe do nosso grupo de prática diária e tire dúvidas diretamente com o mentor.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/5521965161242?text=Ol%C3%A1%2C%20gostaria%20de%20participar%20do%20grupo%20de%20pr%C3%A1tica%20de%20ingl%C3%AAs%20do%20Antigravity!"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25 cursor-pointer whitespace-nowrap"
        >
          <MessageCircle size={18} />
          <span>Entrar no Grupo do WhatsApp</span>
        </a>
      </div>

      {/* PAINEL DO WORKFLOW SEQUENCIAL EM 4 PASSOS NO LIVRO ATIVO */}
      <div className="w-full max-w-md sm:max-w-none mx-auto bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-3xl p-4 sm:p-6 mb-6 shadow-2xl overflow-x-hidden">
        {/* CABEÇALHO DO LIVRO E SELETOR DE PASSOS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              <BookOpen size={15} />
              <span>
                {activeTab === 'main'
                  ? `Livro ${currentBook.checkpoint} de 16 — Jornada da Montanha`
                  : `Livro ${currentBook.checkpoint} de 5 — The Great Commission`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentBook.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{currentBook.summary}</p>
          </div>

          {/* BARRA DE NAVEGAÇÃO DOS 4 PASSOS */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex-1 md:flex-none px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                currentStep === 1
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">1</span>
              <span>1. Imersão</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex-1 md:flex-none px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                currentStep === 2
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">2</span>
              <span>2. Flashcards</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`flex-1 md:flex-none px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                currentStep === 3
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">3</span>
              <span>3. Output Ativo</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className={`flex-1 md:flex-none px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                currentStep === 4
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">4</span>
              <span>4. Conclusão</span>
            </button>
          </div>
        </div>

        {/* PASSO 1 — IMERSÃO NARRATIVA (LEITURA INTERATIVA & ÁUDIO) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <InteractiveBookReader
              title={currentBook.title}
              storyEn={currentBook.story_en}
              interactiveText={currentBook.interactive_text || []}
              onWordMastered={(word) => handleMarkAsMastered(word)}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                <span>Avançar para Passo 2: Flashcards (SRS)</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2 — MINERAÇÃO & SRS (FLASHCARDS DE VOCABULÁRIO) */}
        {currentStep === 2 && (
          <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Layers className="text-amber-400" size={20} />
                  <span>Passo 2 — Treino de Vocabulário SRS</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Revise o vocabulário deste capítulo ({flashcardIdx + 1}/{currentDeck.length})
                </p>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-500/30">
                {masteredWords.size} dominadas
              </span>
            </div>

            {currentFlashcard === null ? (
              <p className="text-slate-400 text-center py-6">Nenhuma palavra cadastrada neste capítulo.</p>
            ) : (
              <div>
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[200px] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative border-2 border-dashed border-sky-400/40"
                  style={{
                    background: isFlipped
                      ? 'linear-gradient(135deg, rgba(14, 116, 144, 0.4), rgba(30, 58, 138, 0.4))'
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                  }}
                >
                  {!isFlipped ? (
                    <div>
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                        Palavra em Inglês (Clique para ver a tradução)
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-white tracking-wide mt-2">
                        {currentFlashcard.word}
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        Tradução em Português
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 mt-2">
                        {currentFlashcard.translation}
                      </h3>
                      {currentFlashcard.part_of_speech && (
                        <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          {currentFlashcard.part_of_speech}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentFlashcard.clean_word || currentFlashcard.word);
                    }}
                    className="absolute bottom-3 right-3 p-2.5 rounded-full bg-sky-500/20 text-sky-300 hover:bg-sky-500/40 transition border border-sky-400/30 cursor-pointer"
                    title="Ouvir Pronúncia"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <button
                    onClick={() => {
                      setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : currentDeck.length - 1));
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>

                  <button
                    onClick={() => handleMarkAsMastered(currentFlashcard.clean_word || currentFlashcard.word)}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Check size={16} /> Marcar como Dominada
                  </button>

                  <button
                    onClick={() => {
                      setFlashcardIdx((prev) => (prev + 1) % currentDeck.length);
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                <span>Avançar para Passo 3: Output Ativo (Criação de Frases)</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3 — CONSTRUÇÃO ATIVA (OUTPUT): ESCREVER 3 FRASES ORIGINAIS */}
        {currentStep === 3 && (
          <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Edit3 size={16} />
                <span>Passo 3 — Desafio de Produção Escrita</span>
              </div>
              <h3 className="font-extrabold text-white text-lg">
                Escreva 3 Frases Originais em Inglês
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Para fixar ativamente o vocabulário, elabore 3 frases em inglês utilizando os novos termos do Livro {currentBook.checkpoint}.
              </p>
            </div>

            {/* Sugestões de Vocabulário do Livro */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-sky-400 block mb-1.5">Vocabulário-chave para usar nas suas frases:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentBook.interactive_text?.slice(0, 10).map((w, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                    {w.clean_word || w.word} ({w.translation})
                  </span>
                ))}
              </div>
            </div>

            {/* Form de 3 Frases */}
            <div className="space-y-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Frase {idx + 1}:
                  </label>
                  <input
                    type="text"
                    placeholder={`Escreva a frase ${idx + 1} em inglês contendo uma palavra do livro...`}
                    value={outputSentences[idx]}
                    onChange={(e) => {
                      const next = [...outputSentences] as [string, string, string];
                      next[idx] = e.target.value;
                      setOutputSentences(next);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* Status e Validação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {outputSubmitted ? (
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>3 frases salvas com sucesso! Passo 3 concluído.</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (outputSentences.every((s) => s.trim().length >= 3)) {
                      setOutputSubmitted(true);
                      setStatusToast('✨ Excelente! 3 frases salvas com sucesso.');
                      setTimeout(() => setStatusToast(''), 3000);
                    } else {
                      setStatusToast('⚠️ Escreva ao menos 3 caracteres em cada frase.');
                      setTimeout(() => setStatusToast(''), 3000);
                    }
                  }}
                  disabled={!outputSentences.every((s) => s.trim().length >= 3)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs transition cursor-pointer"
                >
                  Validar Frases
                </button>
              )}

              <button
                onClick={() => setCurrentStep(4)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Ir para Passo 4: Concluir Livro</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4 — CHECKPOINT DE CONCLUSÃO E RESUMO */}
        {currentStep === 4 && (
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/80 rounded-2xl p-6 border border-emerald-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-lg">
              <Award size={36} />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Passo 4 — Checkpoint Final de Validação
              </span>
              <h3 className="text-2xl font-black text-white">
                Pronto para Concluir o Livro {currentBook.checkpoint}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
                Ao clicar no botão abaixo, você abrirá o <strong>Relatório de Impacto</strong> com todas as palavras mineradas, atualizará seu contador geral rumo às 2.000 palavras e liberará o próximo capítulo!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCompleteBook}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-base shadow-2xl hover:scale-105 transition cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                <span>Concluir Livro & Liberar Próximo Capítulo</span>
              </button>
            </div>
          </div>
        )}
      </div>

        {/* CARDS SECUNDÁRIOS DE REVISÃO E DESAFIO */}
        <div className="bottom-cards-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full max-w-md sm:max-w-none mx-auto px-0">
          {/* CARD 2 - VOCABULARY MASTERY */}
          <div className="feature-card w-full m-0" onClick={() => setIsVocabOpen(true)} style={{ cursor: 'pointer' }}>
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

          {/* CARD 3 - QUIZ DE CULTURA E INTERPRETAÇÃO (DAILY CHALLENGE) */}
          <div className="feature-card w-full m-0">
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

      {/* CONFIGURAÇÕES & PERFIL MODAL */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content max-w-md text-slate-900 overflow-hidden relative p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSettingsOpen(false)}>
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Settings size={22} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Configurações & Perfil</h2>
                <p className="text-xs text-slate-500">Gerencie seu aprendizado e dados da conta</p>
              </div>
            </div>

            {/* 1. DADOS DO USUÁRIO (E-MAIL READ-ONLY E NOME EDITÁVEL) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Dados da Conta</span>
                {isPlusUser ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <Crown size={12} className="text-amber-500" /> Acesso Pro
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    🆓 Gratuito
                  </span>
                )}
              </div>

              {/* E-mail em modo leitura */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">E-mail da Conta (Modo Leitura)</label>
                <input
                  type="email"
                  value={userData?.email || 'aluno@paulortiz.com'}
                  readOnly
                  disabled
                  className="w-full p-2.5 rounded-xl bg-slate-200/80 border border-slate-300 text-slate-600 font-bold text-xs sm:text-sm cursor-not-allowed select-none"
                  title="O e-mail é utilizado para identificação de login e não pode ser alterado diretamente."
                />
              </div>

              {/* Nome de exibição editável com persistência */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Nome de Exibição</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Digite seu Nome de Exibição"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-extrabold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveDisplayName}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs whitespace-nowrap transition cursor-pointer shadow-md"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MODO DE APRENDIZADO (TOGGLE) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Modo de Aprendizado</span>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {freeMode ? '🔓 Modo Livre (Testes)' : '🔒 Modo Jornada Pedagógica'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {freeMode
                      ? 'Todos os livros desbloqueados para teste direto.'
                      : 'Bloqueio sequencial com liberação via Quiz.'}
                  </p>
                </div>
                <button
                  onClick={() => toggleFreeMode(!freeMode)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    freeMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      freeMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 3. AÇÕES E LOGOUT DESTACADO */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsTutorialModalOpen(true);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <HelpCircle size={16} className="text-amber-500" />
                <span>Como Funciona (Tutorial & Método)</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="w-full p-2.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw size={16} className="text-red-600" />
                <span>Resetar Meu Progresso</span>
              </button>

              {/* BOTÃO DESTACADO PARA SAIR DA CONTA (LOGOUT) */}
              <button
                onClick={handleLogout}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/25"
              >
                <LogOut size={18} />
                <span>Sair da Conta (Logout)</span>
              </button>
            </div>
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

      {/* MODAL DE TUTORIAL E METODOLOGIA DA PLATAFORMA */}
      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        onStartJourney={() => {
          setIsTutorialModalOpen(false);
          setCurrentStep(1);
        }}
      />

      {/* MODAL DE RESUMO E CONTABILIZAÇÃO AO CONCLUIR LIVRO */}
      <BookCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        book={currentBook}
        newWordsCount={currentBook.interactive_text?.filter(w => w.is_new).length || 0}
        totalAccumulatedWords={wordsLearned}
        onAdvanceToNextBook={() => {
          setIsCompletionModalOpen(false);
          const nextCp = Math.min(maxCheckpoints, activeCheckpoint + 1);
          handleCheckpointClick(nextCp);
        }}
      />

      {/* MODAL DO PLAYER NATIVO DE PODCAST */}
      <PodcastModal
        isOpen={isPodcastModalOpen}
        onClose={() => setIsPodcastModalOpen(false)}
      />
    </div>
  );
}
