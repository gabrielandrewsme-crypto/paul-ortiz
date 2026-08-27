'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
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
  User
} from 'lucide-react';
import { allBooks, BookData } from '@/src/data/books';

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
  return 'translate(' + (x - 22) + ', ' + (y - 48) + ')';
}

function getNodeTransform(x: number, y: number): string {
  return 'translate(' + x + ', ' + y + ')';
}

export default function DashboardClient() {
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(4);
  const [streakDays] = useState<number>(450);
  const [wordsLearned, setWordsLearned] = useState<number>(450);
  const totalGoal = 2000;

  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentBook: BookData = allBooks.find(b => b.checkpoint === activeCheckpoint) || allBooks[0];
  const activeCoord = CHECKPOINT_COORDS.find(c => c.id === activeCheckpoint) || CHECKPOINT_COORDS[3];

  const handleCheckpointClick = (id: number) => {
    setActiveCheckpoint(id);
    setSelectedOption(null);
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handleOptionSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    const questions = currentBook.quiz || [];
    const isCorrect = selectedOption === questions[currentQuestionIdx]?.correct_answer;
    
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    if (isCorrect) setQuizScore(newScore);

    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      if (newScore >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setWordsLearned(prev => Math.min(totalGoal, prev + 15));
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const pathD = buildPathD();
  const climberTransform = getClimberTransform(activeCoord.x, activeCoord.y);
  const goalWidthPercent = Math.min(100, (wordsLearned / totalGoal) * 100) + '%';
  const firstNewWord = currentBook.interactive_text?.find(w => w.is_new)?.word;
  const nextLessonText = firstNewWord ? 'Vocabulary: ' + firstNewWord : 'Subjunctive Mood';

  const newWords = currentBook.interactive_text?.filter(w => w.is_new) || [];
  const currentWord = newWords.length > 0 ? newWords[flashcardIdx % newWords.length] : null;

  return (
    <div className="app-container">
      {/* HEADER BAR */}
      <header className="header-bar">
        <h1 className="brand-title">Paul Ortiz</h1>

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
          <div className="avatar-wrapper" onClick={() => setIsSettingsOpen(true)} title="Seu Perfil">
            <div className="avatar-img">
              <User size={22} color="#1e293b" />
            </div>
            <div className="status-dot" />
          </div>
          <button className="icon-btn" onClick={() => setIsSettingsOpen(true)} title="Configuracoes">
            <Settings size={20} />
          </button>
        </div>
      </header>

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

          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity="0.75"
          />

          <g transform="translate(500, 72)" style={{ cursor: 'pointer' }}>
            <circle cx="0" cy="0" r="9" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <path d="M -4 2 Q 0 6 4 2" fill="none" stroke="#1e293b" strokeWidth="2" />
            <circle cx="-3" cy="-2" r="1.2" fill="#1e293b" />
            <circle cx="3" cy="-2" r="1.2" fill="#1e293b" />
            <line x1="0" y1="9" x2="0" y2="30" stroke="#1e293b" strokeWidth="2.5" />
            <path d="M 0 16 L 14 2 L 20 -6" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1="16" x2="-12" y2="24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1="30" x2="-10" y2="46" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1="30" x2="10" y2="46" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <g transform={climberTransform}>
            <circle cx="0" cy="0" r="8" fill="none" stroke="#1e293b" strokeWidth="2.2" />
            <circle cx="-2" cy="-2" r="1" fill="#1e293b" />
            <circle cx="3" cy="-2" r="1" fill="#1e293b" />
            <path d="M -3 2 Q 0 5 3 2" fill="none" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="0" y1="8" x2="4" y2="25" stroke="#1e293b" strokeWidth="2.2" />
            <path d="M 2 12 L 18 2 L 24 -10" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="-10" y2="20" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4" y1="25" x2="-6" y2="38" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4" y1="25" x2="12" y2="36" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {CHECKPOINT_COORDS.map((cp) => {
            const isActive = cp.id === activeCheckpoint;
            const nodeTransform = getNodeTransform(cp.x, cp.y);
            return (
              <g 
                key={cp.id} 
                transform={nodeTransform}
                className={isActive ? 'checkpoint-node active' : 'checkpoint-node'}
                onClick={() => handleCheckpointClick(cp.id)}
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
                />

                <text className="checkpoint-text">
                  {cp.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* BOTTOM FEATURE CARDS */}
      <div className="bottom-cards-grid">
        {/* CARD 1 */}
        <div className="feature-card">
          <div className="card-number-badge">1</div>
          
          <div className="card-content-top">
            <div className="card-icon-title">
              <div className="card-icon-box">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="card-header-label">Current Module:</span>
                <h3 className="card-main-title">{currentBook.title}</h3>
              </div>
            </div>

            <div className="card-progress-row">
              <div className="mini-progress-bar">
                <div className="mini-progress-fill" style={{ width: '25%' }} />
              </div>
              <span className="percent-label">25%</span>
            </div>

            <div className="sub-lesson-box">
              <Lightbulb size={16} color="#f59e0b" />
              <div className="sub-lesson-text">
                <span className="sub-lesson-label">Next Lesson:</span>
                <span className="sub-lesson-value">{nextLessonText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
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

        {/* CARD 3 */}
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
              <h3 className="card-main-title">Culture Quiz</h3>
            </div>
          </div>

          <button className="card-action-btn" onClick={() => setIsQuizOpen(true)}>
            Start Challenge <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* QUIZ MODAL */}
      {isQuizOpen && (
        <div className="modal-overlay" onClick={() => setIsQuizOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Pergunta {currentQuestionIdx + 1} de {currentBook.quiz?.length || 3}
                  </span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.4rem', color: '#0f172a' }}>
                    {currentBook.quiz?.[currentQuestionIdx]?.question || 'Qual o significado correto?'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {currentBook.quiz?.[currentQuestionIdx]?.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
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

                <button
                  className="card-action-btn"
                  onClick={handleNextQuestion}
                  disabled={selectedOption === null}
                  style={{
                    marginTop: '1.5rem',
                    opacity: selectedOption === null ? 0.5 : 1,
                    cursor: selectedOption === null ? 'not-allowed' : 'pointer'
                  }}
                >
                  {currentQuestionIdx + 1 === (currentBook.quiz?.length || 3) ? 'Finalizar Quiz' : 'Proxima Pergunta'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <Sparkles size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {quizScore >= 2 ? 'Parabens! Voce Aprovou!' : 'Tente Novamente'}
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
                  Sua pontuacao: <strong>{quizScore} de {currentBook.quiz?.length || 3} acertos</strong>.
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

      {/* VOCABULARY FLASHCARDS MODAL */}
      {isVocabOpen && (
        <div className="modal-overlay" onClick={() => setIsVocabOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsVocabOpen(false)}>
              <X size={18} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
              Flashcards de Vocabulario - {currentBook.title}
            </h2>

            {currentWord === null ? (
              <p>Nenhuma palavra nova neste livro.</p>
            ) : (
              <div>
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    background: isFlipped ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '2px dashed #93c5fd',
                    borderRadius: '20px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                >
                  {!isFlipped ? (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Palavra em Ingles (Clique para virar)
                      </span>
                      <h3 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.5rem' }}>
                        {currentWord.word}
                      </h3>
                      {currentWord.part_of_speech && (
                        <span style={{ fontSize: '0.85rem', color: '#2563eb', background: '#dbeafe', padding: '0.2rem 0.6rem', borderRadius: '999px', marginTop: '0.5rem', display: 'inline-block' }}>
                          {currentWord.part_of_speech}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>
                        Traducao em Portugues
                      </span>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#065f46', marginTop: '0.5rem' }}>
                        {currentWord.translation}
                      </h3>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    Card {flashcardIdx + 1} de {newWords.length}
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => { setFlashcardIdx(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
                      disabled={flashcardIdx === 0}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', cursor: flashcardIdx === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => { setFlashcardIdx(prev => (prev + 1) % newWords.length); setIsFlipped(false); }}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#4a90e2', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Proximo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSettingsOpen(false)}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Configuracoes da Plataforma</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Plataforma Paul Ortiz sincronizada com o banco de dados <strong>Neon PostgreSQL</strong>.
            </p>
            <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Status do Banco:</strong> Conectado ao Neon (ep-misty-glade)</p>
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.4rem' }}><strong>Progresso Salvo:</strong> Checkpoint {activeCheckpoint} de 16</p>
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
    </div>
  );
}
