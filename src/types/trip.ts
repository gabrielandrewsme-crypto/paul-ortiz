// ----------------------------------------------------------------------------
// src/types/trip.ts
// Tipagem central escalável para a arquitetura de TRIPS, MOUNTAINS e VOCABULÁRIO (NGSL / NGSL-Spoken)
// ----------------------------------------------------------------------------

import { BookData } from '@/src/data/books';

export type TripCategory = 
  | 'adventure' 
  | 'daily_life' 
  | 'conversation' 
  | 'travel' 
  | 'work' 
  | 'relationships' 
  | 'faith' 
  | 'ideas_opinions'
  | 'natural_english'
  | 'general';

/** Etapa / Agrupamento de montanha dentro de uma Trip (Evolução futura opcional) */
export interface MountainStage {
  id: string;
  name: string;
  description?: string;
  bookIds: string[];
}

/** Estrutura da Jornada (Trip) de Aprendizado */
export interface Trip {
  id: string; // Ex: 'mountain-adventure', 'great-commission', 'daily-life'
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: TripCategory;
  badgeText: string; // Ex: '16 Capítulos • 2.000 Palavras'
  iconName: string; // Nome do ícone para renderização visual
  accentColor: string; // Gradientes de destaque visual
  isAvailable: boolean; // true para ativas, false para 'Em Breve' (Roadmap de 100 livros)
  books: BookData[];
  mountains?: MountainStage[]; // Agrupamento opcional por Montanhas dentro da Trip
  storageKey: string; // Chave de localStorage para progresso independente
  targetNgslCount?: number; // Meta de palavras NGSL (Ex: 2809)
  targetNgslSpokenCount?: number; // Meta de palavras NGSL-Spoken (Ex: 721)
}

/** Progresso individual de uma Trip */
export interface TripProgressData {
  completedBooks: number[];
  unlockedLevel: number;
  learnedWordsCount: number;
  ngslWordsMastered?: number;
  ngslSpokenWordsMastered?: number;
  wordsToReview?: string[];
}

/** Mapeamento de progresso global e por Trip */
export type UserTripsProgressMap = Record<string, TripProgressData>;

export interface GlobalUserProgress {
  totalLearnedWords: number;
  totalMasteredWords: number;
  ngslLearnedCount: number;
  ngslSpokenLearnedCount: number;
  streakDays: number;
  tripsProgress: UserTripsProgressMap;
}
