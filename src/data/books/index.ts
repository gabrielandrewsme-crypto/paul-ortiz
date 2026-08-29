// ----------------------------------------------------------------------------
// src/data/books/index.ts
// Manifesto / Índice central dos livros interativos — Jornada Náutica (Fase 1)
// ----------------------------------------------------------------------------

// ─── Tipos ──────────────────────────────────────────────────────────────────────

/** Palavra interativa dentro do texto de um livro. */
export interface InteractiveWord {
  word: string;
  clean_word: string;
  translation: string;
  is_new: boolean;
  part_of_speech?: string;
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
}

// ─── Imports dos 16 livros da Jornada Náutica ───────────────────────────────────

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
 * Todos os 16 livros da Jornada Náutica, ordenados por checkpoint.
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
export function getBookById(id: string): BookData | undefined {
  return allBooks.find((book) => book.id === id);
}

/**
 * Busca um livro pelo número do checkpoint (1–16).
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

// ─── Re-exportação do módulo Great Commission ───────────────────────────────────

export * from './great-commission';
