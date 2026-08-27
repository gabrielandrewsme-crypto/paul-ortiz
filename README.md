# Modelagem de Banco de Dados & Gamificação - Paul Ortiz

Este repositório contém a modelagem completa do banco de dados (SQL puro, Drizzle ORM e Prisma ORM) para a plataforma de aprendizado de inglês **Paul Ortiz**.

---

## 🛠️ Arquivos Gerados

1. [schema.sql](file:///c:/projects/Paul%20Ortiz/schema.sql) — Script DDL PostgreSQL/Supabase com tabelas, índices, triggers, funções e RLS.
2. [drizzle.ts](file:///c:/projects/Paul%20Ortiz/drizzle.ts) — Schema TypeScript para **Drizzle ORM** com relações e inferência de tipos.
3. [schema.prisma](file:///c:/projects/Paul%20Ortiz/schema.prisma) — Schema completo para **Prisma ORM**.
4. [seed.sql](file:///c:/projects/Paul%20Ortiz/seed.sql) — Script de povoamento inicial com os 16 livros e vocabulário modelo.
5. [celebration-modal.tsx](file:///c:/projects/Paul%20Ortiz/celebration-modal.tsx) — Componente React / Next.js para o efeito de vitória no Checkpoint 16 (`Holding Flag` + `canvas-confetti`).

---

## 📊 Estrutura do Banco de Dados

### 1. `users`
Guarda os dados cadastrais e os atributos de gamificação do aluno.
- `streak_days`: Dias consecutivos de estudo (calculado via trigger ao realizar quiz).
- `total_words_learned`: Quantidade total de palavras no status `mastered` (meta 2.000).
- `current_checkpoint`: Nível/Livro atual na montanha (de 1 a 16).
- `character_state`: Estado do boneco na montanha (`climbing` ou `holding_flag`).

### 2. `books`
Os 16 livros da plataforma correspondentes aos 16 checkpoints da montanha.
- Cada livro introduz entre 100 e 150 palavras inéditas.

### 3. `vocabulary`
Banco de palavras ligadas aos livros.
- Armazena a palavra em inglês, tradução em português, classe gramatical (`part_of_speech`) e frase de contexto.

### 4. `user_word_progress`
Relaciona o usuário com as palavras aprendidas.
- Status de aprendizado (`learning` ou `mastered`).
- Ao mudar para `mastered`, recalcula automaticamente a contagem de palavras do usuário via trigger.

### 5. `quiz_attempts`
Registra as tentativas dos quizes de 3 perguntas no final de cada livro.
- Ao passar (`passed = true`), avança o `current_checkpoint` do usuário via trigger.

---

## 🏔️ Lógica da Gamificação da Montanha (16 Checkpoints)

### Trigger `fn_recalculate_user_mountain_progress`
A lógica de transição de nível e cume da montanha roda diretamente no banco PostgreSQL:
- Toda vez que o usuário conclui o quiz ou domina palavras:
  1. O banco atualiza a contagem real de palavras `mastered`.
  2. O banco atualiza o `current_checkpoint` para o maior nível concluído com sucesso.
  3. **REGRA DO TOPO (Checkpoint 16)**:
     Se `current_checkpoint >= 16` **E** `total_words_learned >= 2000`, o banco altera `character_state` para `'holding_flag'`.

---

## 🎨 Configuração de Assets e Favicon (Next.js App Router)

### 1. Favicon com a Logo local (`./logo/Paul ortiz.jpeg`)
No Next.js (App Router):
1. Converta a imagem `c:\projects\Paul Ortiz\logo\Paul ortiz.jpeg` para `icon.png` ou `favicon.ico`.
2. Mova a imagem para a pasta `app/` do Next.js:
   - `app/icon.png` (ou `app/favicon.ico`).
3. O Next.js detecta automaticamente o arquivo na pasta `app/` e configura a tag `<link rel="icon">` com otimização automática.

### 2. Guia de Estética e UI (`./design estética`)
Com base no layout de referência em `c:\projects\Paul Ortiz\design estética`:
- **Paleta de Cores Recomendada (Modo Escuro / Emerald Glow)**:
  - Fundo Principal: `#0F172A` (Slate 900)
  - Cards & Glassmorphism: `#1E293B` (Slate 800 com borda `border-emerald-500/20`)
  - Cor de Destaque / Progresso: `#10B981` (Emerald 500)
  - Cor Secundária / Ouro (Moedas/Streak): `#F59E0B` (Amber 500)
  - Texto Principal: `#F8FAFC` (Slate 50)
- **Tipografia**: Google Fonts **Inter** ou **Outfit**.

---

## 🚀 Como Rodar na Vercel / Supabase

### Opção A: Execução do Script SQL no Supabase
1. Acesse o **SQL Editor** do seu painel no Supabase.
2. Copie e cole o conteúdo de [schema.sql](file:///c:/projects/Paul%20Ortiz/schema.sql).
3. Clique em **Run**.
4. Em seguida, rode [seed.sql](file:///c:/projects/Paul%20Ortiz/seed.sql) para inserir os 16 livros de teste.

### Opção B: Drizzle ORM (Vercel Postgres / Supabase)
1. Instale os pacotes: `npm install drizzle-orm postgres` e `npm install -D drizzle-kit`.
2. Configure o arquivo `drizzle.config.ts` apontando para [drizzle.ts](file:///c:/projects/Paul%20Ortiz/drizzle.ts).
3. Execute `npx drizzle-kit push`.

### Opção C: Prisma ORM
1. Mova [schema.prisma](file:///c:/projects/Paul%20Ortiz/schema.prisma) para `prisma/schema.prisma`.
2. Execute `npx prisma db push` para sincronizar o banco.
