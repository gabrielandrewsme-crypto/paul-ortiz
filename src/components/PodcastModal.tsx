'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Radio, 
  Headphones, 
  Clock, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { PodcastEpisodeData, initialPodcastEpisodes } from '@/src/data/podcasts';

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastModal({ isOpen, onClose }: PodcastModalProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisodeData[]>(initialPodcastEpisodes);
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisodeData>(initialPodcastEpisodes[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/podcasts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.episodes) && data.episodes.length > 0) {
          setEpisodes(data.episodes);
          setActiveEpisode(data.episodes[0]);
        }
      })
      .catch((err) => {
        console.warn('Usando episódios estáticos de podcast:', err);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Erro ao reproduzir podcast:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSelectEpisode = (ep: PodcastEpisodeData) => {
    setActiveEpisode(ep);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = ep.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-2xl bg-[#0b0f19] text-white border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ELEMENTO AUDIO HTML5 */}
        <audio
          ref={audioRef}
          src={activeEpisode.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />

        {/* BOTAO FECHAR */}
        <button className="modal-close-btn text-slate-400 hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        {/* TITULO E CABEÇALHO */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-lg">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Podcast Paul Ortiz
              </span>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Headphones size={12} /> Áudio Nativo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Paul Ortiz Audio Experience
            </h2>
          </div>
        </div>

        {/* PLAYER ATIVO REPRODUTOR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Reproduzindo Agora
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {activeEpisode.title}
              </h3>
              <p className="text-xs text-slate-400">{activeEpisode.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                {activeEpisode.duration}
              </span>
            </div>
          </div>

          {/* BARRA DE PROGRESSO DO AUDIO */}
          <div className="space-y-1.5 pt-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* CONTROLES DO PLAYER (PLAY, PAUSE, REWIND, FORWARD, SPEED, VOLUME) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* VELOCIDADE DE REPRODUÇÃO */}
            <div className="flex items-center gap-1">
              {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                    playbackSpeed === speed
                      ? 'bg-sky-500 text-slate-950 font-extrabold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* BOTÕES CENTRAIS DE PLAY / PAUSE / REWIND */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => skipTime(-10)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Voltar 10 segundos"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 hover:scale-105 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-sky-500/25 transition cursor-pointer"
              >
                {isPlaying ? <Pause size={22} fill="#020617" /> : <Play size={22} fill="#020617" className="ml-0.5" />}
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Avançar 10 segundos"
              >
                <RotateCw size={18} />
              </button>
            </div>

            {/* VOLUMETRIA */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white transition">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>
        </div>

        {/* FEED / LISTA DE EPISÓDIOS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio size={14} className="text-sky-400" /> Episódios Disponíveis ({episodes.length})
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {episodes.map((ep) => {
              const isSelected = activeEpisode.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEpisode(ep)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-extrabold">
                        EP #{ep.episodeNumber.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {ep.publishedAt}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white leading-snug">
                      {ep.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ep.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ep.tags?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                      isSelected && isPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-white'
                    }`}
                  >
                    {isSelected && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
