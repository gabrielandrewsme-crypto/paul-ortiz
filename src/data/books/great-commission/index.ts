import gc1 from './gc-book1.json.json';
import gc2 from './gc-book2.json.json';
import gc3 from './gc-book3.json.json';
import gc4 from './gc-book4.json.json';
import gc5 from './gc-book5.json.json';

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
  const storyEn = json.dialogue
    ? json.dialogue.map((d: any) => `${d.speaker}: "${d.text}"`).join('\n\n')
    : json.story_en || '';

  const interactiveText = json.vocabulary
    ? json.vocabulary.map((v: any) => ({
        word: v.word,
        clean_word: v.word.replace(/[^a-zA-Z]/g, ''),
        translation: v.translation,
        is_new: true,
        part_of_speech: v.phonetic || 'vocabulary',
      }))
    : json.interactive_text || [];

  const quiz = json.quiz
    ? json.quiz.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer || 0,
      }))
    : json.quiz || [];

  return {
    id: json.id || `gc-0${checkpoint}`,
    checkpoint: checkpoint,
    title: json.title ? `Great Commission ${checkpoint}: ${json.title}` : `Great Commission — Part ${checkpoint}`,
    summary: json.subtitle || json.description || json.summary || '',
    audio_url: '',
    word_count_target: storyEn.split(/\s+/).filter(Boolean).length || 200,
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
];

export function getGreatCommissionBookByCheckpoint(checkpoint: number): GreatCommissionBook | undefined {
  return greatCommissionBooks.find((book) => book.checkpoint === checkpoint);
}
