// ----------------------------------------------------------------------------
// src/data/books/great-commission/index.ts
// Módulo de Dados da Trip "The Great Commission" (7 Livros Canônicos)
// ----------------------------------------------------------------------------

import gc1 from './great-commission-01.json.json';
import gc2 from './great-commission-02.json';
import gc3 from './great-commission-03.json';
import gc4 from './great-commission-04.json';
import gc5 from './great-commission-05.json';
import gc6 from './great-commission-06.json';
import gc7 from './great-commission-07.json.json';

export interface GreatCommissionBook {
  id: string;
  checkpoint: number;
  title: string;
  summary: string;
  audio_url: string;
  word_count_target: number;
  story_en: string;
  interactive_text: any[];
  quiz: any[];
  series: 'great-commission';
}

function formatGcBook(json: any, checkpoint: number): GreatCommissionBook {
  const storyEn = json.story_en || (json.dialogue
    ? json.dialogue.map((d: any) => `${d.speaker}: "${d.text}"`).join('\n\n')
    : '');

  const interactiveText = json.interactive_text || (json.vocabulary
    ? json.vocabulary.map((v: any) => ({
        word: v.word,
        clean_word: v.word.replace(/[^a-zA-Z]/g, ''),
        translation: v.translation,
        is_new: true,
        part_of_speech: v.phonetic || 'vocabulary',
      }))
    : []);

  const quiz = json.quiz
    ? json.quiz.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer || 0,
      }))
    : [];

  return {
    id: json.id || `great-commission-0${checkpoint}`,
    checkpoint: checkpoint,
    title: json.title || `Great Commission ${checkpoint}`,
    summary: json.summary || json.subtitle || json.description || '',
    audio_url: json.audio_url || `/audios/great-commission-0${checkpoint}.mp3`,
    word_count_target: json.word_count_target || storyEn.split(/\s+/).filter(Boolean).length || 200,
    story_en: storyEn,
    interactive_text: interactiveText,
    quiz: quiz,
    series: 'great-commission',
  };
}

export const greatCommissionBooks: GreatCommissionBook[] = [
  formatGcBook(gc1, 1),
  formatGcBook(gc2, 2),
  formatGcBook(gc3, 3),
  formatGcBook(gc4, 4),
  formatGcBook(gc5, 5),
  formatGcBook(gc6, 6),
  formatGcBook(gc7, 7),
];

export function getGreatCommissionBookByCheckpoint(checkpoint: number): GreatCommissionBook | undefined {
  return greatCommissionBooks.find((book) => book.checkpoint === checkpoint);
}
