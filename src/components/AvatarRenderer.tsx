'use client';

import React from 'react';

export interface AvatarConfig {
  climberName?: string;
  skinTone?: 'pale' | 'fair' | 'light_brown' | 'dark_brown' | 'deep_black' | 'olive';
  bgColor?: string;
  gender?: 'male' | 'female' | 'neutral';
  eyeShape?: 'almond' | 'asian' | 'round' | 'focused';
  hairStyle?: 
    | 'black_power' | 'dreads' | 'braids' | 'afro_puff' | 'fade_curly'
    | 'undercut' | 'straight_short' | 'wavy_medium' | 'pompadour' | 'buzz'
    | 'female_long' | 'female_curly' | 'female_bun' | 'bob' | 'side_braid'
    | 'none';
  hairColor?: string;
  facialHair?: 'full_beard' | 'lumberjack' | 'goatee' | 'moustache' | 'clean';
  facialHairColor?: string;
  eyewear?: 'glacier_goggles' | 'sunglasses' | 'reading_glasses' | 'none';
  headwear?: 'beanie' | 'sun_hat' | 'climbing_helmet' | 'beret' | 'none';
  outfit?: 'expedition' | 'all_black' | 'high_tech' | 'casual';
  backpack?: 'red_expedition' | 'black_tactical' | 'blue_light' | 'none';
}

interface AvatarRendererProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
}

export default function AvatarRenderer({ config = {}, size = 200, className = '' }: AvatarRendererProps) {
  const {
    skinTone = 'light_brown',
    bgColor = '#e2e8f0',
    eyeShape = 'almond',
    hairStyle = 'black_power',
    hairColor = '#1e293b',
    facialHair = 'clean',
    facialHairColor = '#1e293b',
    eyewear = 'none',
    headwear = 'beanie',
    outfit = 'expedition',
    backpack = 'red_expedition',
  } = config;

  const skinColors: Record<string, string> = {
    pale: '#fde047',
    fair: '#fed7aa',
    olive: '#f59e0b',
    light_brown: '#d97706',
    dark_brown: '#92400e',
    deep_black: '#451a03',
  };
  const currentSkin = skinColors[skinTone] || skinColors.fair;

  const outfitColors = {
    expedition: { jacket: '#ff7a29', detail: '#0284c7' },
    all_black: { jacket: '#1e293b', detail: '#475569' },
    high_tech: { jacket: '#0284c7', detail: '#38bdf8' },
    casual: { jacket: '#16a34a', detail: '#ca8a04' },
  }[outfit] || { jacket: '#ff7a29', detail: '#0284c7' };

  const backpackColors: Record<string, string> = {
    red_expedition: '#dc2626',
    black_tactical: '#0f172a',
    blue_light: '#0284c7',
    none: 'transparent',
  };
  const currentBackpack = backpackColors[backpack] || 'transparent';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {bgColor !== 'transparent' && (
        <circle cx="100" cy="120" r="95" fill={bgColor} stroke="#cbd5e1" strokeWidth="3" />
      )}

      {backpack !== 'none' && (
        <g>
          <rect x="52" y="95" width="28" height="65" rx="8" fill={currentBackpack} stroke="#0f172a" strokeWidth="2.5" />
          <rect x="120" y="95" width="28" height="65" rx="8" fill={currentBackpack} stroke="#0f172a" strokeWidth="2.5" />
        </g>
      )}

      <path
        d="M 60 135 Q 100 120 140 135 L 155 220 L 45 220 Z"
        fill={outfitColors.jacket}
        stroke="#0f172a"
        strokeWidth="3.5"
      />
      <path d="M 100 130 L 100 220" stroke={outfitColors.detail} strokeWidth="3.5" />
      <path d="M 75 160 L 125 160" stroke="#0f172a" strokeWidth="2.5" strokeDasharray="4 4" />

      <rect x="88" y="105" width="24" height="25" fill={currentSkin} stroke="#0f172a" strokeWidth="3" />

      <ellipse cx="100" cy="85" rx="34" ry="38" fill={currentSkin} stroke="#0f172a" strokeWidth="3.5" />

      <ellipse cx="64" cy="88" rx="6" ry="9" fill={currentSkin} stroke="#0f172a" strokeWidth="2.5" />
      <ellipse cx="136" cy="88" rx="6" ry="9" fill={currentSkin} stroke="#0f172a" strokeWidth="2.5" />

      {eyeShape === 'asian' && (
        <g>
          <path d="M 80 82 Q 88 78 94 83" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 106 83 Q 112 78 120 82" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
      {eyeShape === 'almond' && (
        <g>
          <ellipse cx="85" cy="82" rx="5" ry="3" fill="#0f172a" />
          <ellipse cx="115" cy="82" rx="5" ry="3" fill="#0f172a" />
        </g>
      )}
      {eyeShape === 'round' && (
        <g>
          <circle cx="85" cy="82" r="4.5" fill="#0f172a" />
          <circle cx="115" cy="82" r="4.5" fill="#0f172a" />
        </g>
      )}
      {eyeShape === 'focused' && (
        <g>
          <line x1="80" y1="80" x2="90" y2="84" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="80" x2="110" y2="84" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="85" cy="84" r="3" fill="#0f172a" />
          <circle cx="115" cy="84" r="3" fill="#0f172a" />
        </g>
      )}

      <path d="M 78 74 Q 86 70 93 75" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 107 75 Q 114 70 122 74" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M 88 104 Q 100 114 112 104" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

      {hairStyle === 'black_power' && (
        <circle cx="100" cy="65" r="44" fill={hairColor} stroke="#0f172a" strokeWidth="3" />
      )}
      {hairStyle === 'dreads' && (
        <g fill={hairColor} stroke="#0f172a" strokeWidth="2">
          <rect x="62" y="45" width="8" height="50" rx="4" />
          <rect x="74" y="38" width="9" height="60" rx="4" />
          <rect x="87" y="35" width="9" height="65" rx="4" />
          <rect x="100" y="35" width="9" height="65" rx="4" />
          <rect x="113" y="38" width="9" height="60" rx="4" />
          <rect x="126" y="45" width="8" height="50" rx="4" />
        </g>
      )}
      {hairStyle === 'braids' && (
        <g stroke="#0f172a" strokeWidth="2.5" fill={hairColor}>
          <path d="M 64 55 Q 60 85 58 115" />
          <path d="M 76 48 Q 72 85 70 120" />
          <path d="M 124 48 Q 128 85 130 120" />
          <path d="M 136 55 Q 140 85 142 115" />
        </g>
      )}
      {hairStyle === 'afro_puff' && (
        <g>
          <circle cx="75" cy="50" r="22" fill={hairColor} stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="125" cy="50" r="22" fill={hairColor} stroke="#0f172a" strokeWidth="2.5" />
        </g>
      )}
      {hairStyle === 'undercut' && (
        <path d="M 64 70 Q 64 45 100 42 Q 136 45 136 70 Z" fill={hairColor} stroke="#0f172a" strokeWidth="3" />
      )}
      {hairStyle === 'straight_short' && (
        <path d="M 62 75 Q 60 40 100 38 Q 140 40 138 75 Z" fill={hairColor} stroke="#0f172a" strokeWidth="3" />
      )}
      {hairStyle === 'wavy_medium' && (
        <path d="M 58 85 C 55 45 75 35 100 35 C 125 35 145 45 142 85 C 130 75 110 80 100 70 C 90 80 70 75 58 85 Z" fill={hairColor} stroke="#0f172a" strokeWidth="3" />
      )}
      {hairStyle === 'pompadour' && (
        <path d="M 64 68 Q 60 25 100 22 Q 140 25 136 68 Z" fill={hairColor} stroke="#0f172a" strokeWidth="3.5" />
      )}
      {hairStyle === 'female_long' && (
        <g fill={hairColor} stroke="#0f172a" strokeWidth="3">
          <path d="M 56 75 C 50 110 52 145 55 160 Q 70 140 68 85 Z" />
          <path d="M 144 75 C 150 110 148 145 145 160 Q 130 140 132 85 Z" />
          <path d="M 64 65 Q 100 38 136 65 Z" />
        </g>
      )}
      {hairStyle === 'female_curly' && (
        <g fill={hairColor} stroke="#0f172a" strokeWidth="2.5">
          <circle cx="60" cy="70" r="16" />
          <circle cx="54" cy="95" r="18" />
          <circle cx="56" cy="120" r="16" />
          <circle cx="140" cy="70" r="16" />
          <circle cx="146" cy="95" r="18" />
          <circle cx="144" cy="120" r="16" />
          <circle cx="100" cy="45" r="24" />
        </g>
      )}

      {facialHair === 'full_beard' && (
        <path d="M 66 90 Q 64 125 100 128 Q 136 125 134 90 Q 115 120 100 120 Q 85 120 66 90 Z" fill={facialHairColor} stroke="#0f172a" strokeWidth="2.5" />
      )}
      {facialHair === 'lumberjack' && (
        <path d="M 64 85 Q 60 140 100 145 Q 140 140 136 85 Q 115 125 100 125 Q 85 125 64 85 Z" fill={facialHairColor} stroke="#0f172a" strokeWidth="3" />
      )}
      {facialHair === 'goatee' && (
        <path d="M 85 102 Q 100 124 115 102 Q 100 120 85 102 Z" fill={facialHairColor} stroke="#0f172a" strokeWidth="2" />
      )}
      {facialHair === 'moustache' && (
        <path d="M 82 100 Q 100 95 118 100 Q 100 106 82 100 Z" fill={facialHairColor} stroke="#0f172a" strokeWidth="2" />
      )}

      {eyewear === 'glacier_goggles' && (
        <g>
          <rect x="70" y="74" width="60" height="18" rx="9" fill="#0284c7" stroke="#0f172a" strokeWidth="3" />
          <line x1="56" y1="83" x2="144" y2="83" stroke="#0f172a" strokeWidth="4" />
          <line x1="78" y1="78" x2="88" y2="88" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
        </g>
      )}
      {eyewear === 'sunglasses' && (
        <g fill="#0f172a" stroke="#0f172a" strokeWidth="2">
          <rect x="73" y="76" width="24" height="14" rx="3" />
          <rect x="103" y="76" width="24" height="14" rx="3" />
          <line x1="97" y1="80" x2="103" y2="80" strokeWidth="3" />
        </g>
      )}
      {eyewear === 'reading_glasses' && (
        <g fill="none" stroke="#0f172a" strokeWidth="3">
          <rect x="74" y="76" width="22" height="14" rx="2" />
          <rect x="104" y="76" width="22" height="14" rx="2" />
          <line x1="96" y1="82" x2="104" y2="82" strokeWidth="3" />
        </g>
      )}

      {headwear === 'beanie' && (
        <g>
          <path d="M 60 72 Q 100 20 140 72 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3.5" />
          <rect x="58" y="66" width="84" height="12" rx="4" fill="#dc2626" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="100" cy="22" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        </g>
      )}
      {headwear === 'sun_hat' && (
        <g>
          <ellipse cx="100" cy="62" rx="60" ry="14" fill="#f59e0b" stroke="#0f172a" strokeWidth="3" />
          <path d="M 72 62 Q 100 30 128 62 Z" fill="#d97706" stroke="#0f172a" strokeWidth="3" />
        </g>
      )}
      {headwear === 'climbing_helmet' && (
        <g>
          <path d="M 62 72 Q 100 28 138 72 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
          <rect x="64" y="68" width="72" height="8" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        </g>
      )}
      {headwear === 'beret' && (
        <g>
          <path d="M 52 68 Q 90 30 148 55 Q 120 78 52 68 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}
