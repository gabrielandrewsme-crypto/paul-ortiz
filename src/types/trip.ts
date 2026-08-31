// ----------------------------------------------------------------------------
// src/types/trip.ts
// Tipagem central escalável para a arquitetura de TRIPS (Jornadas de Aprendizado)
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
  | 'general';

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
  storageKey: string; // Chave de localStorage para progresso independente
}

export interface TripProgressData {
  completedBooks: number[];
  unlockedLevel: number;
  learnedWordsCount: number;
}

export type UserTripsProgressMap = Record<string, TripProgressData>;
