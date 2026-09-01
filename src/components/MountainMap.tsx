'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import AvatarRenderer, { AvatarConfig } from './AvatarRenderer';

export type TripId = 
  | 'mountain-adventure'
  | 'mountain-journey'
  | 'great-commission'
  | 'daily-life'
  | 'global-travel'
  | 'travel-exploration'
  | 'work-career'
  | 'work-business'
  | string;

interface CheckpointCoord {
  id: number;
  x: number;
  y: number;
  hasFlag?: boolean;
}

/**
 * Gera coordenadas harmônicas, alinhadas e sem sobreposição
 * para qualquer número de checkpoints (7 para Great Commission, 19 para Vida Cotidiana, 16 para Montanha)
 */
function getCoordsForTrip(tripId: string, totalCheckpoints: number): CheckpointCoord[] {
  const count = Math.max(1, totalCheckpoints);
  
  // Trilha Great Commission ( exatamente 7 Checkpoints até o Topo Supremo )
  if (count === 7 || tripId === 'great-commission') {
    return [
      { id: 1, x: 250, y: 500 },
      { id: 2, x: 310, y: 440 },
      { id: 3, x: 380, y: 380 },
      { id: 4, x: 450, y: 320 },
      { id: 5, x: 510, y: 250 },
      { id: 6, x: 460, y: 185 },
      { id: 7, x: 500, y: 130, hasFlag: true },
    ];
  }

  // Distribuição linear padronizada para 19 Checkpoints (Vida Cotidiana) e 16 Checkpoints (Montanha)
  const coords: CheckpointCoord[] = [];
  const startY = 515;
  const endY = 130;
  const stepY = (startY - endY) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const progress = i / (count - 1 || 1);
    const y = Math.round(startY - i * stepY);
    // Oscilação suave em X ao longo do formato cônico da montanha
    const wave = Math.sin(progress * Math.PI * 3);
    const x = Math.round(500 + wave * (150 * (1 - progress * 0.45)));
    
    coords.push({
      id,
      x,
      y,
      hasFlag: id === count || id === Math.round(count / 2),
    });
  }

  return coords;
}

function buildPathD(coords: CheckpointCoord[]): string {
  return coords.map((pt, idx) => {
    return idx === 0 ? 'M ' + pt.x + ' ' + pt.y : 'L ' + pt.x + ' ' + pt.y;
  }).join(' ');
}

function getClimberTransform(x: number, y: number): string {
  return 'translate(' + (x - 25) + ', ' + (y - 50) + ')';
}

function getNodeTransform(x: number, y: number): string {
  return 'translate(' + x + ', ' + y + ')';
}

interface MountainTheme {
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  facetStart: string;
  facetEnd: string;
  leftFacet: string;
  snowCap: string;
  snowHighlight: string;
  trailColor: string;
  pulseColor: string;
  flagColor: string;
  activeBorderColor: string;
}

const THEMES: Record<string, MountainTheme> = {
  'mountain-adventure': {
    bgStart: '#4f75a6',
    bgMid: '#3b5a82',
    bgEnd: '#2c4566',
    facetStart: '#2e486b',
    facetEnd: '#1e324c',
    leftFacet: '#345277',
    snowCap: '#ffffff',
    snowHighlight: '#f1f5f9',
    trailColor: '#38bdf8',
    pulseColor: '#38bdf8',
    flagColor: '#ef4444',
    activeBorderColor: '#38bdf8',
  },
  'mountain-journey': {
    bgStart: '#4f75a6',
    bgMid: '#3b5a82',
    bgEnd: '#2c4566',
    facetStart: '#2e486b',
    facetEnd: '#1e324c',
    leftFacet: '#345277',
    snowCap: '#ffffff',
    snowHighlight: '#f1f5f9',
    trailColor: '#38bdf8',
    pulseColor: '#38bdf8',
    flagColor: '#ef4444',
    activeBorderColor: '#38bdf8',
  },
  'great-commission': {
    bgStart: '#059669',
    bgMid: '#047857',
    bgEnd: '#065f46',
    facetStart: '#064e3b',
    facetEnd: '#022c22',
    leftFacet: '#0f766e',
    snowCap: '#fef08a',
    snowHighlight: '#fde047',
    trailColor: '#f59e0b',
    pulseColor: '#fbbf24',
    flagColor: '#f59e0b',
    activeBorderColor: '#fbbf24',
  },
  'daily-life': {
    bgStart: '#be123c',
    bgMid: '#9f1239',
    bgEnd: '#881337',
    facetStart: '#4c0519',
    facetEnd: '#1c1917',
    leftFacet: '#701a75',
    snowCap: '#fbcfe8',
    snowHighlight: '#f472b6',
    trailColor: '#f43f5e',
    pulseColor: '#fb7185',
    flagColor: '#f43f5e',
    activeBorderColor: '#fb7185',
  },
  'global-travel': {
    bgStart: '#0891b2',
    bgMid: '#0e7490',
    bgEnd: '#155e75',
    facetStart: '#164e63',
    facetEnd: '#083344',
    leftFacet: '#1e3a8a',
    snowCap: '#cffafe',
    snowHighlight: '#67e8f9',
    trailColor: '#22d3ee',
    pulseColor: '#22d3ee',
    flagColor: '#06b6d4',
    activeBorderColor: '#22d3ee',
  },
  'travel-exploration': {
    bgStart: '#0891b2',
    bgMid: '#0e7490',
    bgEnd: '#155e75',
    facetStart: '#164e63',
    facetEnd: '#083344',
    leftFacet: '#1e3a8a',
    snowCap: '#cffafe',
    snowHighlight: '#67e8f9',
    trailColor: '#22d3ee',
    pulseColor: '#22d3ee',
    flagColor: '#06b6d4',
    activeBorderColor: '#22d3ee',
  },
  'work-career': {
    bgStart: '#475569',
    bgMid: '#334155',
    bgEnd: '#1e293b',
    facetStart: '#1e293b',
    facetEnd: '#0f172a',
    leftFacet: '#0f172a',
    snowCap: '#e2e8f0',
    snowHighlight: '#94a3b8',
    trailColor: '#f59e0b',
    pulseColor: '#fbbf24',
    flagColor: '#f59e0b',
    activeBorderColor: '#fbbf24',
  },
  'work-business': {
    bgStart: '#475569',
    bgMid: '#334155',
    bgEnd: '#1e293b',
    facetStart: '#1e293b',
    facetEnd: '#0f172a',
    leftFacet: '#0f172a',
    snowCap: '#e2e8f0',
    snowHighlight: '#94a3b8',
    trailColor: '#f59e0b',
    pulseColor: '#fbbf24',
    flagColor: '#f59e0b',
    activeBorderColor: '#fbbf24',
  },
};

interface MountainMapProps {
  tripId: TripId;
  currentCheckpoint: number;
  totalCheckpoints: number;
  completedCheckpoints?: number[];
  unlockedLevel?: number;
  isPlusUser?: boolean;
  isSuperAdminUser?: boolean;
  freeMode?: boolean;
  userAvatarConfig?: AvatarConfig | null;
  onSelectCheckpoint?: (checkpoint: number) => void;
}

export default function MountainMap({
  tripId,
  currentCheckpoint,
  totalCheckpoints,
  completedCheckpoints = [],
  unlockedLevel = 1,
  isPlusUser = true,
  isSuperAdminUser = false,
  freeMode = false,
  userAvatarConfig = null,
  onSelectCheckpoint,
}: MountainMapProps) {
  const theme = THEMES[tripId] || THEMES['mountain-adventure'];

  // Coordenadas calculadas rigorosamente por Trip e contagem total
  const activeCoords = getCoordsForTrip(tripId, totalCheckpoints);
  const pathD = buildPathD(activeCoords);

  const activeCoord = activeCoords.find((c) => c.id === currentCheckpoint) || activeCoords[0];
  const climberTransform = getClimberTransform(activeCoord.x, activeCoord.y);

  return (
    <div className="mountain-stage relative w-full overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-950">
      <svg viewBox="0 0 1000 560" className="mountain-svg w-full h-auto">
        <defs>
          <linearGradient id={`mountainGrad_${tripId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.bgStart} />
            <stop offset="50%" stopColor={theme.bgMid} />
            <stop offset="100%" stopColor={theme.bgEnd} />
          </linearGradient>

          <linearGradient id={`mountainFacet_${tripId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.facetStart} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.facetEnd} stopOpacity="0.9" />
          </linearGradient>

          <filter id={`glow_${tripId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Silhueta da Montanha em Camadas */}
        <path
          d="M 120 540 Q 320 280 500 120 Q 680 280 880 540 Z"
          fill={`url(#mountainGrad_${tripId})`}
        />

        <path
          d="M 500 120 Q 600 300 880 540 L 500 540 Z"
          fill={`url(#mountainFacet_${tripId})`}
        />
        <path
          d="M 500 120 Q 420 260 380 540 L 500 540 Z"
          fill={theme.leftFacet}
          opacity="0.4"
        />

        {/* Pico com Neve / Brilho da Montanha */}
        <path
          d="M 500 120 L 460 185 Q 480 200 500 190 Q 520 205 540 185 Z"
          fill={theme.snowCap}
        />
        <path
          d="M 460 185 Q 475 210 490 195 Q 510 215 540 185 L 500 120 Z"
          fill={theme.snowHighlight}
          opacity="0.9"
        />

        {/* Trilha de subida pontilhada dinâmica */}
        <path
          d={pathD}
          fill="none"
          stroke={theme.trailColor}
          strokeWidth="3.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Avatar do Montanhista no Checkpoint ativo */}
        <g transform={climberTransform}>
          {userAvatarConfig ? (
            <AvatarRenderer config={userAvatarConfig} size={50} overrideBgColor="transparent" />
          ) : (
            <g>
              <circle cx="0" cy="0" r="8" fill="none" stroke="#ffffff" strokeWidth="2.2" />
              <circle cx="-2" cy="-2" r="1" fill="#ffffff" />
              <circle cx="3" cy="-2" r="1" fill="#ffffff" />
              <line x1="0" y1="8" x2="4" y2="25" stroke="#ffffff" strokeWidth="2.2" />
            </g>
          )}
        </g>

        {/* Nós de Checkpoint Dinâmicos */}
        {activeCoords.map((cp) => {
          const isActive = cp.id === currentCheckpoint;
          const isSequentialUnlocked =
            cp.id === 1 ||
            freeMode ||
            completedCheckpoints.includes(cp.id - 1) ||
            cp.id <= unlockedLevel ||
            isSuperAdminUser;
          const isPlanLocked = cp.id > 1 && !isPlusUser;
          const isLocked = !isSequentialUnlocked || isPlanLocked;
          const nodeTransform = getNodeTransform(cp.x, cp.y);

          return (
            <g
              key={cp.id}
              transform={nodeTransform}
              className={isActive ? 'checkpoint-node active' : 'checkpoint-node'}
              onClick={() => {
                if (onSelectCheckpoint) onSelectCheckpoint(cp.id);
              }}
              style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              {cp.hasFlag && (
                <g transform="translate(6, -26)">
                  <line x1="0" y1="0" x2="0" y2="16" stroke="#b91c1c" strokeWidth="2" />
                  <polygon points="0,0 12,4 0,9" fill={theme.flagColor} />
                </g>
              )}

              {isActive && (
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="active-pulse-ring"
                />
              )}

              {isActive && (
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="none"
                  stroke={theme.activeBorderColor}
                  strokeWidth="3.5"
                  filter={`url(#glow_${tripId})`}
                />
              )}

              <circle
                cx="0"
                cy="0"
                r="13"
                className="checkpoint-circle"
                style={{ fill: isLocked ? '#64748b' : '#ffffff' }}
              />

              {isLocked ? (
                <g transform="translate(-6, -6)">
                  <Lock size={12} color="#ffffff" />
                </g>
              ) : (
                <text className="checkpoint-text" fill="#1e293b" fontWeight="800" fontSize="11" textAnchor="middle" dy="4">
                  {cp.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
