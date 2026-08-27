import book01 from '../book-01.json';
import book02 from '../book-02.json';
import book03 from '../book-03.json';

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

export const greatCommissionBooks: GreatCommissionBook[] = [
  {
    id: 'gc-01',
    checkpoint: 1,
    title: 'Great Commission — Part 1: The Calling',
    summary: 'The initial mandate to reach nations and teach foundational truths.',
    audio_url: '',
    word_count_target: 300,
    story_en: book01.story_en || '',
    interactive_text: book01.interactive_text || [],
    quiz: book01.quiz || [],
    series: 'great-commission',
  },
  {
    id: 'gc-02',
    checkpoint: 2,
    title: 'Great Commission — Part 2: Discipleship',
    summary: 'Deepening vocabulary and structured commitment to growth.',
    audio_url: '',
    word_count_target: 350,
    story_en: book02.story_en || '',
    interactive_text: book02.interactive_text || [],
    quiz: book02.quiz || [],
    series: 'great-commission',
  },
  {
    id: 'gc-03',
    checkpoint: 3,
    title: 'Great Commission — Part 3: The Ascent',
    summary: 'Mastering expressions for international communication and leadership.',
    audio_url: '',
    word_count_target: 400,
    story_en: book03.story_en || '',
    interactive_text: book03.interactive_text || [],
    quiz: book03.quiz || [],
    series: 'great-commission',
  },
];

export function getGreatCommissionBookByCheckpoint(checkpoint: number): GreatCommissionBook | undefined {
  return greatCommissionBooks.find((book) => book.checkpoint === checkpoint);
}
