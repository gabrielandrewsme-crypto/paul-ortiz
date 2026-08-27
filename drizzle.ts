import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  timestamp,
  text,
  boolean,
  pgEnum,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ----------------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------------
export const wordStatusEnum = pgEnum('word_status_enum', ['learning', 'mastered']);

export const characterStateEnum = pgEnum('character_state_enum', [
  'climbing',
  'holding_flag',
]);

export const userRoleEnum = pgEnum('user_role_enum', ['USER', 'MANAGER', 'ADMIN']);

export const partOfSpeechEnum = pgEnum('part_of_speech_enum', [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'phrasal_verb',
  'expression',
]);

// ----------------------------------------------------------------------------
// TABELAS
// ----------------------------------------------------------------------------

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: userRoleEnum('role').default('USER').notNull(),
  avatarConfig: jsonb('avatar_config'),
  streakDays: integer('streak_days').default(0).notNull(),
  lastActivityDate: date('last_activity_date').defaultNow(),
  totalWordsLearned: integer('total_words_learned').default(0).notNull(),
  currentCheckpoint: integer('current_checkpoint').default(1).notNull(),
  characterState: characterStateEnum('character_state').default('climbing').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Password Reset Tokens Table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxResetTokenEmail: index('idx_reset_token_email').on(table.email),
}));

// 2. Books Table (16 checkpoints)
export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  levelOrder: integer('level_order').notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  totalWords: integer('total_words').notNull(),
  audioUrl: text('audio_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxBooksLevelOrder: index('idx_books_level_order').on(table.levelOrder),
}));

// 3. Vocabulary Table
export const vocabulary = pgTable('vocabulary', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  word: varchar('word', { length: 100 }).notNull(),
  translation: varchar('translation', { length: 100 }).notNull(),
  partOfSpeech: partOfSpeechEnum('part_of_speech').notNull(),
  contextSentence: text('context_sentence').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxVocabBookId: index('idx_vocab_book_id').on(table.bookId),
}));

// 4. User Word Progress Table
export const userWordProgress = pgTable('user_word_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  wordId: uuid('word_id').notNull().references(() => vocabulary.id, { onDelete: 'cascade' }),
  status: wordStatusEnum('status').default('learning').notNull(),
  masteredAt: timestamp('mastered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uqUserWord: unique('uq_user_word').on(table.userId, table.wordId),
  idxUwpUserId: index('idx_uwp_user_id').on(table.userId),
  idxUwpUserStatus: index('idx_uwp_user_status').on(table.userId, table.status),
}));

// 5. Quiz Attempts Table (3 perguntas por livro)
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(), // 0 a 3 acertos
  passed: boolean('passed').default(false).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxQaUserBook: index('idx_qa_user_book').on(table.userId, table.bookId),
}));

// ----------------------------------------------------------------------------
// RELATIONS
// ----------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  wordProgress: many(userWordProgress),
  quizAttempts: many(quizAttempts),
}));

export const booksRelations = relations(books, ({ many }) => ({
  vocabularyList: many(vocabulary),
  quizAttempts: many(quizAttempts),
}));

export const vocabularyRelations = relations(vocabulary, ({ one, many }) => ({
  book: one(books, {
    fields: [vocabulary.bookId],
    references: [books.id],
  }),
  userProgress: many(userWordProgress),
}));

export const userWordProgressRelations = relations(userWordProgress, ({ one }) => ({
  user: one(users, {
    fields: [userWordProgress.userId],
    references: [users.id],
  }),
  word: one(vocabulary, {
    fields: [userWordProgress.wordId],
    references: [vocabulary.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [quizAttempts.bookId],
    references: [books.id],
  }),
}));

// Types Inferred
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type Vocabulary = typeof vocabulary.$inferSelect;
export type UserWordProgress = typeof userWordProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
