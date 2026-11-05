import React from 'react';
import type { MetalVariant, IconSize } from './EngravedIcon.types';

export const METAL_PALETTE = {
  graphite: {
    base: '#252525',
    dark: '#1A1A1A',
    light: '#3A3A3A',
    highlight: '#4D4D4D',
    stroke: '#333333',
    accent: '#B49A67',
  },
  champagne: {
    base: '#B49A67',
    dark: '#8C734B',
    light: '#C9B07A',
    highlight: '#E6D3A3',
    stroke: '#7D653E',
    accent: '#252525',
  },
  satin: {
    base: '#C5C6C8',
    dark: '#8E9195',
    light: '#E2E3E5',
    highlight: '#F4F5F6',
    stroke: '#7A7D82',
    accent: '#252525',
  },
  gunmetal: {
    base: '#2D3139',
    dark: '#1E2024',
    light: '#424752',
    highlight: '#737A88',
    stroke: '#1A1C20',
    accent: '#DFCA9B',
  },
  silver: {
    base: '#D0D2D6',
    dark: '#A6A8AD',
    light: '#EBECEE',
    highlight: '#FFFFFF',
    stroke: '#8E9096',
    accent: '#B49A67',
  },
  surface: {
    ivory: '#F9F8F6',
    warmAlabaster: '#F5F2ED',
    border: '#E6E0D4',
    innerRing: '#D9D3C7',
  }
};

export const parseIconSize = (size?: IconSize): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'xs': return 14;
    case 'sm': return 18;
    case 'md': return 24;
    case 'lg': return 36;
    case 'xl': return 48;
    default: return 24;
  }
};

/**
 * Universal SVG Defs Component for Engraved Metal Gradients & Deboss Filters.
 * Injected once or within SVG headers using deterministic IDs.
 */
export const EngravedDefs: React.FC<{ prefix?: string }> = ({ prefix = 'lx' }) => (
  <defs>
    {/* 1. Satin Metal Deboss Gradient (Main Service & Menu Items) */}
    <linearGradient id={`${prefix}-satin-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
      <stop offset="35%" stopColor="#D8D9DB" />
      <stop offset="70%" stopColor="#A8ABB0" />
      <stop offset="100%" stopColor="#7E8187" />
    </linearGradient>

    {/* 2. Champagne Gold Etch Gradient (Luxury Accents & Clasps) */}
    <linearGradient id={`${prefix}-gold-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#F0E2C2" />
      <stop offset="30%" stopColor="#D6BE8B" />
      <stop offset="70%" stopColor="#B49A67" />
      <stop offset="100%" stopColor="#7A6136" />
    </linearGradient>

    {/* 3. Graphite Micro-Bevel Gradient (Forms & Settings) */}
    <linearGradient id={`${prefix}-graphite-grad`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3E3E3E" />
      <stop offset="50%" stopColor="#252525" />
      <stop offset="100%" stopColor="#181818" />
    </linearGradient>

    {/* 4. Dark Gunmetal Engraving Gradient (Admin Dashboard) */}
    <linearGradient id={`${prefix}-gunmetal-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#4A505C" />
      <stop offset="45%" stopColor="#2E333D" />
      <stop offset="85%" stopColor="#1C1F26" />
      <stop offset="100%" stopColor="#13151A" />
    </linearGradient>

    {/* 5. Satin Surface Radial Halo */}
    <radialGradient id={`${prefix}-radial-halo`} cx="50%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
      <stop offset="65%" stopColor="#E9ECEF" stopOpacity="0.1" />
      <stop offset="100%" stopColor="#252525" stopOpacity="0.08" />
    </radialGradient>

    {/* Precision Deboss Inner/Drop Shadow Filter */}
    <filter id={`${prefix}-deboss-filter`} x="-20%" y="-20%" width="140%" height="140%">
      {/* 135-degree specular light source (top-left) */}
      <feDropShadow dx="0.5" dy="1" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.22" />
      <feDropShadow dx="-0.4" dy="-0.4" stdDeviation="0.3" floodColor="#FFFFFF" floodOpacity="0.35" />
    </filter>

    {/* Micro-Engraved Cutout Filter */}
    <filter id={`${prefix}-bevel-cut`} x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="0.75" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.28" />
    </filter>

    {/* Subtle Glow Filter for Active State */}
    <filter id={`${prefix}-gold-glow`} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);
