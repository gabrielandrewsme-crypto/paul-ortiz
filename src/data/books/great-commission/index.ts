// ----------------------------------------------------------------------------
// src/data/books/great-commission/index.ts
// Módulo placeholder para a série "Great Commission"
// ----------------------------------------------------------------------------
//
// Este módulo será preenchido conforme os arquivos da série Great Commission
// forem criados. Os arquivos esperados seguem o padrão:
//
//   great-commission-1.json
//   great-commission-2.json
//   great-commission-3.json
//   ...
//
// Cada arquivo segue a mesma estrutura `BookData` definida no índice principal.
// ----------------------------------------------------------------------------

import type { BookData } from '../index';

/** Extensão da interface BookData para livros da Great Commission (se necessário). */
export interface GreatCommissionBook extends BookData {
  /** Série à qual o livro pertence. */
  series: 'great-commission';
}

/**
 * Array de livros da série Great Commission.
 * Será preenchido conforme os arquivos JSON forem adicionados.
 *
 * Exemplo de uso futuro:
 * ```ts
 * import gc1 from './great-commission-1.json';
 *
 * export const greatCommissionBooks: GreatCommissionBook[] = [
 *   { ...gc1, series: 'great-commission' } as GreatCommissionBook,
 * ];
 * ```
 */
export const greatCommissionBooks: GreatCommissionBook[] = [];

/**
 * Busca um livro da Great Commission pelo seu `id`.
 * Retorna `undefined` se não encontrado.
 */
export function getGreatCommissionBookById(
  id: string,
): GreatCommissionBook | undefined {
  return greatCommissionBooks.find((book) => book.id === id);
}
