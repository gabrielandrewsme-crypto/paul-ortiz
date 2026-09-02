// ----------------------------------------------------------------------------
// src/data/books/index.ts
// Manifesto / Índice central dos livros interativos — Jornada da Montanha (Fase 1)
// ----------------------------------------------------------------------------

// ─── Tipos ──────────────────────────────────────────────────────────────────────

/** Palavra interativa dentro do texto de um livro. */
export interface InteractiveWord {
  word: string;
  clean_word: string;
  translation: string;
  is_new: boolean;
  part_of_speech?: string;
  // Campos pedagógicos para expansão futura (NGSL, repetição e classificação de vocabulário):
  target_type?: 'new_target' | 'review' | 'support';
  is_ngsl?: boolean;
  is_ngsl_spoken?: boolean;
  first_introduced_book_id?: string;
}

/** Pergunta do quiz ao final de um livro. */
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  type?: 'multiple_choice' | 'open_writing';
  expected_keywords?: string[];
}

/** Estrutura completa de dados de um livro interativo. */
export interface BookData {
  id: string;
  checkpoint: number;
  title: string;
  summary: string;
  audio_url: string;
  word_count_target: number;
  story_en: string;
  interactive_text: InteractiveWord[];
  quiz: QuizQuestion[];
  // Campos de escalabilidade arquitetural:
  trip_id?: string;
  mountain_id?: string;
  mountain_name?: string;
  target_words_count?: number;
}

// ─── Imports dos 16 livros da Jornada da Montanha ───────────────────────────────────

import book01 from './book-01.json';
import book02 from './book-02.json';
import book03 from './book-03.json';
import book04 from './book-04.json';
import book05 from './book-05.json';
import book06 from './book-06.json';
import book07 from './book-07.json';
import book08 from './book-08.json';
import book09 from './book-09.json';
import book10 from './book-10.json';
import book11 from './book-11.json';
import book12 from './book-12.json';
import book13 from './book-13.json';
import book14 from './book-14.json';
import book15 from './book-15.json';
import book16 from './book-16.json';

// ─── Exports individuais ────────────────────────────────────────────────────────

export {
  book01, book02, book03, book04,
  book05, book06, book07, book08,
  book09, book10, book11, book12,
  book13, book14, book15, book16,
};

// ─── Array consolidado (ordenado por checkpoint) ────────────────────────────────

/**
 * Todos os 16 livros da Jornada da Montanha, ordenados por checkpoint.
 * Cada item é tipado como `BookData`.
 */
export const allBooks: BookData[] = [
  book01, book02, book03, book04,
  book05, book06, book07, book08,
  book09, book10, book11, book12,
  book13, book14, book15, book16,
] as BookData[];

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Busca um livro pelo seu `id` (ex: "book-01").
 * Retorna `undefined` se não encontrado.
 */
import { dailyLifeBooks } from './daily-life';
import { greatCommissionBooks } from './great-commission';

export { dailyLifeBooks, greatCommissionBooks };

/**
 * Busca qualquer livro da plataforma pelo seu `id` (ex: "book-01", "book-17", "great-commission-01").
 * Procura na Jornada da Montanha, Vida Cotidiana e Great Commission com fallback amplo de tratamento de string.
 */
export function getBookById(id: string): BookData | undefined {
  if (!id) return undefined;
  const cleanId = decodeURIComponent(id).trim().toLowerCase();

  const allPlatformBooks: BookData[] = [
    ...allBooks,
    ...(dailyLifeBooks as unknown as BookData[]),
    ...(greatCommissionBooks as unknown as BookData[]),
  ];

  // 1. Busca por ID exato
  let found = allPlatformBooks.find((book) => book.id.trim().toLowerCase() === cleanId);
  if (found) return found;

  // 2. Trata variações de padding de dígitos para Great Commission (ex: "great-commission-1" vs "great-commission-01")
  if (cleanId.startsWith('great-commission-')) {
    const numPart = cleanId.replace('great-commission-', '');
    const checkpointNum = parseInt(numPart, 10);
    if (!isNaN(checkpointNum)) {
      found = (greatCommissionBooks as unknown as BookData[]).find((b) => b.checkpoint === checkpointNum);
      if (found) return found;
    }
  }

  // 3. Trata variações de padding de dígitos para Jornada / Vida Cotidiana (ex: "book-1" vs "book-01")
  if (cleanId.startsWith('book-')) {
    const numPart = cleanId.replace('book-', '');
    const checkpointNum = parseInt(numPart, 10);
    if (!isNaN(checkpointNum)) {
      found = allPlatformBooks.find((b) => b.checkpoint === checkpointNum);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Busca um livro da Jornada da Montanha pelo número do checkpoint (1–16).
 * Retorna `undefined` se não encontrado.
 */
export function getBookByCheckpoint(checkpoint: number): BookData | undefined {
  return allBooks.find((book) => book.checkpoint === checkpoint);
}

/**
 * Retorna o total de palavras novas (`is_new: true`) de um livro.
 */
export function countNewWords(book: BookData): number {
  return book.interactive_text.filter((w) => w.is_new).length;
}

// ─── Re-exportação dos módulos adicionais ───────────────────────────────────

export * from './great-commission';
export * from './daily-life';
