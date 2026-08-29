'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, Sparkles, X } from 'lucide-react';
import { InteractiveWord } from '@/src/data/books';

interface InteractiveBookReaderProps {
  storyEn?: string;
  interactiveText: InteractiveWord[];
  title: string;
  onWordMastered?: (word: string) => void;
}

export default function InteractiveBookReader({
  storyEn = '',
  interactiveText = [],
  title,
  onWordMastered,
}: InteractiveBookReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [hoveredWord, setHoveredWord] = useState<{
    idx: number;
    word: string;
    translation: string;
    partOfSpeech?: string;
  } | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop synthesis on unmount or book change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [title]);

  // Speak single word on click
  const handleWordClick = (item: InteractiveWord, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel ongoing full reading if playing
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    setActiveWordIdx(index);
    setHoveredWord({
      idx: index,
      word: item.word,
      translation: item.translation,
      partOfSpeech: item.part_of_speech,
    });

    if (onWordMastered) {
      onWordMastered(item.clean_word || item.word);
    }

    const cleanText = item.clean_word || item.word.replace(/[^a-zA-Z]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  };

  // Play full story with real-time boundary word highlight
  const toggleFullReading = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveWordIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    setHoveredWord(null);

    const fullText = storyEn || interactiveText.map((i) => i.word).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;

    utteranceRef.current = utterance;

    let charIndexMap: { charIndex: number; wordIdx: number }[] = [];
    let currentLength = 0;

    interactiveText.forEach((item, idx) => {
      charIndexMap.push({ charIndex: currentLength, wordIdx: idx });
      currentLength += item.word.length + 1;
    });

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        const matched = charIndexMap.reduce((prev, curr) => {
          return curr.charIndex <= charIdx ? curr : prev;
        }, charIndexMap[0]);

        if (matched) {
          setActiveWordIdx(matched.wordIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setActiveWordIdx(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveWordIdx(null);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const closeTooltip = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setHoveredWord(null);
    setActiveWordIdx(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 my-3 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden break-words text-left mb-6">
      {/* Backdrop transparente para fechar tooltip ao clicar fora */}
      {hoveredWord && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={closeTooltip}
        />
      )}

      {/* Reader Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700/60 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <Volume2 size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">Leitura Interativa & Narração por IA (Web Speech)</p>
          </div>
        </div>

        {/* Full Reading Control */}
        <button
          onClick={toggleFullReading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition duration-200 cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pausar Narração' : 'Ouvir Texto Completo'}</span>
        </button>
      </div>

      {/* Interactive Text Display */}
      <div className="relative text-base sm:text-lg leading-relaxed text-slate-200 tracking-wide font-medium p-2 select-none">
        {interactiveText.map((item, idx) => {
          const isActive = activeWordIdx === idx;
          const isTooltipActive = hoveredWord?.idx === idx;

          return (
            <span key={idx} className="relative inline-block mx-[2px] my-[3px]">
              {/* Word Element */}
              <span
                onClick={() => handleWordClick(item, idx)}
                className={`cursor-pointer px-1 py-0.5 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 font-bold scale-105 shadow-md shadow-sky-400/40 ring-2 ring-sky-300'
                    : item.is_new
                    ? 'text-sky-300 hover:bg-sky-500/20 underline decoration-sky-400/50 underline-offset-4'
                    : 'hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {item.word}
              </span>

              {/* Tooltip / Popover com Botão X de Fechamento Instantâneo */}
              {isTooltipActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-max max-w-[240px] bg-slate-950 border border-sky-400/50 rounded-xl p-3 shadow-2xl text-center animate-fade-in pointer-events-auto">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>{item.clean_word || item.word}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTooltip();
                      }}
                      className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
                      aria-label="Fechar tradução"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {item.translation}
                  </div>
                  {item.part_of_speech && (
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30 mt-1 inline-block">
                      {item.part_of_speech}
                    </span>
                  )}
                  {/* Arrow Indicator */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
                </div>
              )}
            </span>
          );
        })}
      </div>

      {/* Reader Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <span>💡 Clique em qualquer palavra para ouvir sua pronúncia e ver a tradução.</span>
        {activeWordIdx !== null && (
          <button
            onClick={closeTooltip}
            className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Resetar Destaque
          </button>
        )}
      </div>
    </div>
  );
}
