import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Volume2 } from 'lucide-react';
import { getSessionUser } from '@/src/lib/auth';
import { getBookById } from '@/src/data/books';
import InteractiveBookReader from '@/src/components/InteractiveBookReader';

interface BookPageProps {
  params: {
    id: string;
  };
}

export default async function BookReaderPage({ params }: BookPageProps) {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const book = getBookById(params.id);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Livro não encontrado</h1>
        <p className="text-slate-400 mb-4">O livro &quot;{params.id}&quot; não existe na plataforma.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-sky-500 text-slate-950 font-bold rounded-xl hover:bg-sky-400"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1329] text-white p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header com botão de voltar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
        >
          <ChevronLeft size={16} />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20">
          <BookOpen size={14} />
          <span>{book.id.toUpperCase()}</span>
        </div>
      </div>

      {/* Título & Resumo do Livro */}
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white">{book.title}</h1>
        <p className="text-sm text-slate-400">{book.summary}</p>

        {book.audio_url && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Volume2 className="text-sky-400" size={18} />
            <audio controls src={book.audio_url} className="w-full h-8" />
          </div>
        )}
      </div>

      {/* Leitor Interativo */}
      <InteractiveBookReader
        title={book.title}
        storyEn={book.story_en}
        interactiveText={book.interactive_text || []}
      />
    </div>
  );
}
