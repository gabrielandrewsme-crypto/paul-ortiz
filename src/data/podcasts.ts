export interface PodcastEpisodeData {
  id: string;
  episodeNumber: number;
  title: string;
  subtitle: string;
  description: string;
  audioUrl: string;
  duration: string;
  publishedAt: string;
  host: string;
  tags: string[];
}

export const initialPodcastEpisodes: PodcastEpisodeData[] = [
  {
    id: 'ep-01',
    episodeNumber: 1,
    title: 'Episódio 01: O Início da Jornada de Paul',
    subtitle: 'Imersão Narrativa & Assimilação de 2.000 Palavras',
    description: 'Neste episódio de estreia do Podcast Paul Ortiz, acompanhamos os primeiros passos de Paul no aprendizado de inglês do zero ao nível intermediário (B1). Descubra como funciona a assimilação natural do vocabulário essencial de 2.000 palavras mais usadas e como usar a imersão diária a seu favor.',
    audioUrl: '/podcasts/episodio-01.mp3',
    duration: '20:00',
    publishedAt: '2026-08-29',
    host: 'Paul Ortiz & Equipe',
    tags: ['Inglês do Zero', 'Paul Ortiz', 'Imersão Narrativa', 'Fluência B1'],
  },
];
