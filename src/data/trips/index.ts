// ----------------------------------------------------------------------------
// src/data/trips/index.ts
// Registro Central das TRIPS (Jornadas de Aprendizado de Inglês)
// Preserva 100% dos 16 livros existentes na Trip 1 ("mountain-adventure")
// e permite expansão contínua para novas Trips e até ~100 livros.
// ----------------------------------------------------------------------------

import { Trip } from '@/src/types/trip';
import { allBooks, BookData } from '@/src/data/books';
import { greatCommissionBooks } from '@/src/data/books/great-commission';

export const allTrips: Trip[] = [
  {
    id: 'mountain-adventure',
    slug: 'jornada-da-montanha',
    title: 'A Jornada da Montanha',
    subtitle: 'A História de Paul & Assimilação de 2.000 Palavras',
    description: 'Acompanhe a aventura completa de Paul do zero ao nível intermediário (B1) através dos 16 minilivros originais com leitura interativa e áudio.',
    category: 'adventure',
    badgeText: '16 Livros • 2.000 Palavras',
    iconName: 'Mountain',
    accentColor: 'from-blue-600 via-indigo-600 to-sky-500',
    isAvailable: true,
    books: allBooks,
    storageKey: '@antigravity:progress_mountain',
  },
  {
    id: 'great-commission',
    slug: 'the-great-commission',
    title: 'The Great Commission',
    subtitle: 'Jornada Devocional & Vocabulário em Inglês',
    description: 'Explore 5 capítulos inspiradores com diálogos e vocabulário contextual focado no aprendizado prático da Grande Comissão.',
    category: 'faith',
    badgeText: '5 Livros • Vocabulário Prático',
    iconName: 'Compass',
    accentColor: 'from-emerald-600 via-teal-600 to-cyan-500',
    isAvailable: true,
    books: greatCommissionBooks as unknown as BookData[],
    storageKey: '@antigravity:progress_great_commission',
  },

  // ─── ESTRUTURA PARA FUTURAS TRIPS (ROADMAP DE ~100 LIVROS) ──────────────────────────
  {
    id: 'daily-life',
    slug: 'vida-cotidiana',
    title: 'Vida Cotidiana & Diálogos Reais',
    subtitle: 'Situações Práticas do Dia a Dia',
    description: 'Jornada focada na conversação do dia a dia, rotinas, compras e expressões mais comuns faladas por nativos.',
    category: 'daily_life',
    badgeText: 'Em Breve • Roadmap 100 Livros',
    iconName: 'Coffee',
    accentColor: 'from-amber-600 to-orange-500',
    isAvailable: false,
    books: [],
    storageKey: '@antigravity:progress_daily_life',
  },
  {
    id: 'travel-exploration',
    slug: 'viagens-e-exploracao',
    title: 'Viagens & Exploração Global',
    subtitle: 'Aeroportos, Hotéis, Imigração & Turismo',
    description: 'Aprenda o inglês prático para viajar pelo mundo com autonomia: check-in, restaurantes, pedir informações e imigração.',
    category: 'travel',
    badgeText: 'Em Breve • Roadmap 100 Livros',
    iconName: 'Globe',
    accentColor: 'from-purple-600 to-pink-500',
    isAvailable: false,
    books: [],
    storageKey: '@antigravity:progress_travel',
  },
  {
    id: 'work-business',
    slug: 'mundo-do-trabalho',
    title: 'Mundo do Trabalho & Carreira',
    subtitle: 'Entrevistas, Reuniões & E-mails Profissionais',
    description: 'Desenvolva seu vocabulário profissional para reuniões, apresentações, e-mails de trabalho e entrevistas corporativas.',
    category: 'work',
    badgeText: 'Em Breve • Roadmap 100 Livros',
    iconName: 'Briefcase',
    accentColor: 'from-slate-700 to-slate-900',
    isAvailable: false,
    books: [],
    storageKey: '@antigravity:progress_work',
  },
];

export function getTripById(tripId: string): Trip {
  return allTrips.find((t) => t.id === tripId) || allTrips[0];
}
