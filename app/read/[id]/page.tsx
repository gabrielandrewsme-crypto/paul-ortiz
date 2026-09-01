import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Volume2, Crown, Sparkles } from 'lucide-react';
import { getSessionUser } from '@/src/lib/auth';
import { getBookById } from '@/src/data/books';
import ReadClientView from './read-client-view';

interface ReadPageProps {
  params: {
    id: string;
  };
}

export default async function ReadDedicatedPage({ params }: ReadPageProps) {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const book = getBookById(params.id);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#061413] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white">Livro não encontrado</h1>
          <p className="text-xs text-slate-400">
            O livro com o identificador &quot;{params.id}&quot; não foi localizado na base de dados das Trilhas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-black text-xs hover:bg-teal-400 transition"
          >
            <ArrowLeft size={16} />
            <span>Voltar à Trilha</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReadClientView book={book} userEmail={session.email} userName={session.name} />
  );
}
