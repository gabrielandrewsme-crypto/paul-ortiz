-- ============================================================================
-- PLATAFORMA DE APRENDIZADO DE INGLÊS "PAUL ORTIZ"
-- Schema PostgreSQL / Supabase
-- ============================================================================

-- 1. EXTENSÕES & ENUMERAÇÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Status de progresso das palavras
DO $$ BEGIN
  CREATE TYPE word_status_enum AS ENUM ('learning', 'mastered');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Estado do personagem na jornada da montanha
DO $$ BEGIN
  CREATE TYPE character_state_enum AS ENUM ('climbing', 'holding_flag');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Roles de usuário (RBAC)
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('USER', 'MANAGER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Classes gramaticais (Part of Speech)
DO $$ BEGIN
  CREATE TYPE part_of_speech_enum AS ENUM (
    'noun', 
    'verb', 
    'adjective', 
    'adverb', 
    'pronoun', 
    'preposition', 
    'conjunction', 
    'phrasal_verb', 
    'expression'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ============================================================================

-- TABELA: users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role user_role_enum NOT NULL DEFAULT 'USER',
  avatar_config JSONB,
  streak_days INT NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  total_words_learned INT NOT NULL DEFAULT 0 CHECK (total_words_learned >= 0),
  current_checkpoint INT NOT NULL DEFAULT 1 CHECK (current_checkpoint BETWEEN 1 AND 16),
  character_state character_state_enum NOT NULL DEFAULT 'climbing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: password_reset_tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: books (16 livros correspondentes aos 16 checkpoints)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_order INT UNIQUE NOT NULL CHECK (level_order BETWEEN 1 AND 16),
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  total_words INT NOT NULL CHECK (total_words BETWEEN 100 AND 150),
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: vocabulary (palavras contidas em cada livro)
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  translation VARCHAR(100) NOT NULL,
  part_of_speech part_of_speech_enum NOT NULL,
  context_sentence TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: user_word_progress (progresso individual do aluno em cada palavra)
CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  status word_status_enum NOT NULL DEFAULT 'learning',
  mastered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_word UNIQUE (user_id, word_id)
);

-- TABELA: quiz_attempts (tentativas dos quizes de cada livro - 3 perguntas)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 3),
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. ÍNDICES DE ALTA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_level_order ON public.books(level_order);
CREATE INDEX IF NOT EXISTS idx_vocab_book_id ON public.vocabulary(book_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id ON public.user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_status ON public.user_word_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_book ON public.quiz_attempts(user_id, book_id);

-- ============================================================================
-- 4. FUNÇÕES E TRIGGERS DE GAMIFICAÇÃO DA MONTANHA & STREAK
-- ============================================================================

-- FUNÇÃO: Atualizar streak diário do usuário
CREATE OR REPLACE FUNCTION public.fn_update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_activity_date INTO v_last_date
  FROM public.users
  WHERE id = NEW.user_id;

  IF v_last_date IS NULL THEN
    UPDATE public.users 
    SET streak_days = 1, last_activity_date = v_today 
    WHERE id = NEW.user_id;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    UPDATE public.users 
    SET streak_days = streak_days + 1, last_activity_date = v_today 
    WHERE id = NEW.user_id;
  ELSIF v_last_date < v_today - INTERVAL '1 day' THEN
    UPDATE public.users 
    SET streak_days = 1, last_activity_date = v_today 
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_streak_on_quiz ON public.quiz_attempts;
CREATE TRIGGER trg_update_streak_on_quiz
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_user_streak();


-- FUNÇÃO & TRIGGER: Recalcular Palavras Aprendidas, Checkpoint & Regra do Topo (Checkpoint 16)
CREATE OR REPLACE FUNCTION public.fn_recalculate_user_mountain_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_mastered_count INT;
  v_passed_checkpoint INT;
  v_new_state character_state_enum := 'climbing';
BEGIN
  v_user_id := NEW.user_id;

  -- 1. Total de palavras dominadas ('mastered')
  SELECT COUNT(*) INTO v_mastered_count
  FROM public.user_word_progress
  WHERE user_id = v_user_id AND status = 'mastered';

  -- 2. Maior checkpoint de livro aprovado no quiz (score de aprovação)
  SELECT COALESCE(MAX(b.level_order), 1) INTO v_passed_checkpoint
  FROM public.quiz_attempts q
  JOIN public.books b ON q.book_id = b.id
  WHERE q.user_id = v_user_id AND q.passed = TRUE;

  -- 3. REGRA DO TOPO (Checkpoint 16 e meta de 2.000 palavras atingida)
  IF v_passed_checkpoint >= 16 AND v_mastered_count >= 2000 THEN
    v_new_state := 'holding_flag';
  ELSE
    v_new_state := 'climbing';
  END IF;

  -- 4. Atualizar registro do usuário
  UPDATE public.users
  SET 
    total_words_learned = v_mastered_count,
    current_checkpoint = LEAST(v_passed_checkpoint, 16),
    character_state = v_new_state,
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Disparadores para progresso de palavras e quizzes
DROP TRIGGER IF EXISTS trg_update_progress_words ON public.user_word_progress;
CREATE TRIGGER trg_update_progress_words
AFTER INSERT OR UPDATE OF status ON public.user_word_progress
FOR EACH ROW
EXECUTE FUNCTION public.fn_recalculate_user_mountain_progress();

DROP TRIGGER IF EXISTS trg_update_progress_quiz ON public.quiz_attempts;
CREATE TRIGGER trg_update_progress_quiz
AFTER INSERT OR UPDATE OF passed ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.fn_recalculate_user_mountain_progress();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) PARA SUPABASE / NEON
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública / Autenticada para Catálogo de Livros e Vocabulário
DROP POLICY IF EXISTS "Permitir leitura pública de livros" ON public.books;
CREATE POLICY "Permitir leitura pública de livros" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública de vocabulário" ON public.vocabulary;
CREATE POLICY "Permitir leitura pública de vocabulário" ON public.vocabulary FOR SELECT USING (true);

-- Políticas para Usuários Autenticados (Supabase / Auth)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.users 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem gerenciar seu progresso de palavras" ON public.user_word_progress;
CREATE POLICY "Usuários podem gerenciar seu progresso de palavras" ON public.user_word_progress 
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem registrar tentativas de quiz" ON public.quiz_attempts;
CREATE POLICY "Usuários podem registrar tentativas de quiz" ON public.quiz_attempts 
  FOR ALL USING (auth.uid() = user_id);
