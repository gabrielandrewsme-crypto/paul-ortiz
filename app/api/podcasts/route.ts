import { NextResponse } from 'next/server';
import { initialPodcastEpisodes } from '@/src/data/podcasts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const dbEpisodes = await prisma.podcastEpisode.findMany({
      orderBy: { episodeNumber: 'asc' },
    });

    if (dbEpisodes && dbEpisodes.length > 0) {
      return NextResponse.json({
        success: true,
        episodes: dbEpisodes,
      });
    }
  } catch (error) {
    console.warn('Banco de dados indisponível ou tabela ainda não migrada, retornando lista estática:', error);
  }

  return NextResponse.json({
    success: true,
    episodes: initialPodcastEpisodes,
  });
}
