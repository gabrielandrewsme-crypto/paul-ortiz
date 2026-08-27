-- ============================================================================
-- PLATAFORMA DE APRENDIZADO DE INGLÊS "PAUL ORTIZ"
-- Seed de Dados Iniciais (16 Livros e Vocabulário Modelo)
-- ============================================================================

INSERT INTO public.books (level_order, title, summary, total_words, audio_url)
VALUES
(1, 'Book 1: The Mountain Beckons', 'Começando a jornada aos pés da montanha com vocabulário fundamental do dia a dia.', 125, 'https://cdn.paulortiz.com/audio/book-1.mp3'),
(2, 'Book 2: First Foothills', 'Primeiros passos pela trilha aprendendo expressões de rotina e saudações.', 125, 'https://cdn.paulortiz.com/audio/book-2.mp3'),
(3, 'Book 3: Forest Trails', 'Desbravando novos caminhos e construindo frases mais elaboradas.', 125, 'https://cdn.paulortiz.com/audio/book-3.mp3'),
(4, 'Book 4: Whispering Winds', 'Praticando conversação sobre preferências e experiências pessoais.', 125, 'https://cdn.paulortiz.com/audio/book-4.mp3'),
(5, 'Book 5: The Crystal Stream', 'Vocabulário enriquecido com adjetivos e conectivos essenciais.', 125, 'https://cdn.paulortiz.com/audio/book-5.mp3'),
(6, 'Book 6: Pine Ridge', 'Consolidando o tempo verbal passado e narrativas de histórias curtas.', 125, 'https://cdn.paulortiz.com/audio/book-6.mp3'),
(7, 'Book 7: Echoing Canyon', 'Compreensão auditiva e leitura fluida sobre trabalho e hobbies.', 125, 'https://cdn.paulortiz.com/audio/book-7.mp3'),
(8, 'Book 8: Mid-Mountain Camp', 'Alcançando a metade do caminho! Revisão intensa e vocabulário intermediário.', 125, 'https://cdn.paulortiz.com/audio/book-8.mp3'),
(9, 'Book 9: Rocky Ascents', 'Lidando com termos abstratos e argumentos de opinião em inglês.', 125, 'https://cdn.paulortiz.com/audio/book-9.mp3'),
(10, 'Book 10: Misty Pass', 'Dominando phrasal verbs de uso diário e expressões idiomáticas.', 125, 'https://cdn.paulortiz.com/audio/book-10.mp3'),
(11, 'Book 11: High Altitude', 'Leitura avançada com termos técnicos e formais de comunicação.', 125, 'https://cdn.paulortiz.com/audio/book-11.mp3'),
(12, 'Book 12: Glacier Edge', 'Refinando tempos verbais complexos (Perfect tenses e Conditionals).', 125, 'https://cdn.paulortiz.com/audio/book-12.mp3'),
(13, 'Book 13: Windstorm Ridge', 'Interpretação de textos nativos e nuances de significado.', 125, 'https://cdn.paulortiz.com/audio/book-13.mp3'),
(14, 'Book 14: The Frozen Plateau', 'Domínio de vocabulário acadêmico e de negócios.', 125, 'https://cdn.paulortiz.com/audio/book-14.mp3'),
(15, 'Book 15: Summit Ridge', 'A um passo do topo! Leitura rápida, fluência e vocabulário avançado.', 125, 'https://cdn.paulortiz.com/audio/book-15.mp3'),
(16, 'Book 16: The Peak Victory', 'O cume! Conclusão das 2.000 palavras e conquista da bandeira no topo da montanha.', 125, 'https://cdn.paulortiz.com/audio/book-16.mp3')
ON CONFLICT (level_order) DO NOTHING;

-- Vocabulário de Amostra para o Livro 1
WITH b1 AS (SELECT id FROM public.books WHERE level_order = 1 LIMIT 1)
INSERT INTO public.vocabulary (book_id, word, translation, part_of_speech, context_sentence)
SELECT id, 'summit', 'topo / cume', 'noun'::part_of_speech_enum, 'Paul reached the summit after days of climbing.' FROM b1
UNION ALL
SELECT id, 'trail', 'trilha', 'noun'::part_of_speech_enum, 'Follow the marked trail up the mountain.' FROM b1
UNION ALL
SELECT id, 'climb', 'escalar / subir', 'verb'::part_of_speech_enum, 'We climb step by step to build fluency.' FROM b1
UNION ALL
SELECT id, 'stamina', 'resistência', 'noun'::part_of_speech_enum, 'Daily practice builds your language stamina.' FROM b1
UNION ALL
SELECT id, 'achieve', 'conquistar / alcançar', 'verb'::part_of_speech_enum, 'You will achieve 2,000 words at checkpoint 16!' FROM b1;
