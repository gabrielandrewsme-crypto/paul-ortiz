// ----------------------------------------------------------------------------
// src/data/books/daily-life/index.ts
// Coleção da Trip "Vida Cotidiana & Diálogos Reais" (Livros canônicos 17 a 35)
// ----------------------------------------------------------------------------

import { BookData } from '../index';

import book17 from '../book-17.json';
import book18 from '../book-18.json';
import book19 from '../book-19.json';
import book20 from '../book-20.json';
import book21 from '../book-21.json';
import book22 from '../book-22.json';
import book23 from '../book-23.json';
import book24 from '../book-24.json';
import book25 from '../book-25.json';
import book26 from '../book-26.json';
import book27 from '../book-27.json';
import book28 from '../book-28.json';
import book29 from '../book-29.json';
import book30 from '../book-30.json';
import book31 from '../book-31.json';
import book32 from '../book-32.json';
import book33 from '../book-33.json';
import book34 from '../book-34.json';
import book35 from '../book-35.json';

const rawDailyLifeBooks = [
  book17, book18, book19, book20, book21, book22, book23,
  book24, book25, book26, book27, book28, book29, book30,
  book31, book32, book33, book34, book35
];

/**
 * Array ordenado dos 19 minilivros da Trip "Vida Cotidiana & Diálogos Reais" (Books 17 a 35).
 * Mapeia os checkpoints relativos à Trip (1 a 19) mantendo os IDs originais ('book-17' a 'book-35').
 */
export const dailyLifeBooks: BookData[] = rawDailyLifeBooks.map((book, idx) => ({
  ...(book as unknown as BookData),
  checkpoint: idx + 1, // Checkpoints 1 a 19 para a Trip Vida Cotidiana
  trip_id: 'daily-life',
}));

export {
  book17, book18, book19, book20, book21, book22, book23,
  book24, book25, book26, book27, book28, book29, book30,
  book31, book32, book33, book34, book35
};
