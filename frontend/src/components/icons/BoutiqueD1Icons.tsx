import React, { useId } from 'react';

/**
 * luxuryRental D1 — Iconoir based Boutique Line / Atelier Engraved.
 *
 * Source SVG geometry: https://github.com/iconoir-icons/iconoir/tree/main/icons/regular
 * Icons: crown, shirt, handbag, shopping-bag-arrow-up.
 * Copyright (c) 2021 Luca Burgio — MIT.
 * License notice: docs/design/ICONOIR_LICENSE.md
 *
 * Geometry is the original Iconoir path data. Only the stroke appearance is
 * presented differently; no hand-drawn replacement geometry is introduced.
 */
export type D1IconVariant = 'boutique' | 'atelier';
type D1Glyph = 'crown' | 'shirt' | 'handbag' | 'shopping-bag-arrow-up';

export interface D1IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: D1IconVariant;
}

function IconoirPath({ glyph }: { glyph: D1Glyph }) {
  switch (glyph) {
    case 'crown':
      return <path d="M19.2 17L21 7L14.7 10L12 7L9.3 10L3 7L4.8 17H19.2Z" />;
    case 'shirt':
      return (
        <>
          <path d="M6 4H9C9 4 9 7 12 7C15 7 15 4 15 4H18M18 11V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4L6 11" />
          <path d="M18 4L22.4429 5.77717C22.7506 5.90023 22.9002 6.24942 22.7772 6.55709L21.1509 10.6228C21.0597 10.8506 20.8391 11 20.5938 11H18" />
          <path d="M5.99993 4L1.55701 5.77717C1.24934 5.90023 1.09969 6.24942 1.22276 6.55709L2.84906 10.6228C2.94018 10.8506 3.1608 11 3.40615 11H5.99993" />
        </>
      );
    case 'handbag':
      return <path d="M9 8H4C2.89543 8 2 8.89543 2 10V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V10C22 8.89543 21.1046 8 20 8H15M9 8V3.6C9 3.26863 9.26863 3 9.6 3H14.4C14.7314 3 15 3.26863 15 3.6V8M9 8H15M9 8V14M15 8V14" />;
    case 'shopping-bag-arrow-up':
      return (
        <>
          <path d="M16.5 21H18.6688C19.8945 21 20.8319 19.9074 20.6455 18.6959L19.2609 9.69589C19.1108 8.72022 18.2713 8 17.2842 8H6.71584C5.7287 8 4.8892 8.72022 4.73909 9.69589L3.35448 18.6959C3.16809 19.9074 4.10545 21 5.33122 21H7.5" />
          <path d="M12 19V12M12 12L15 15M12 12L9 15" />
          <path d="M14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5" />
        </>
      );
  }
}

/** Two optical treatments of the exact same known icon vectors. */
function D1Icon({ glyph, variant = 'boutique', size, className, style, ...rest }: D1IconProps & { glyph: D1Glyph }) {
  const gradientId = `lr-d1-${useId().replace(/:/g, '')}`;
  const atelier = variant === 'atelier';
  const line = atelier ? `url(#${gradientId})` : '#36322C';
  const initialWidth = size ?? (atelier ? 72 : 48);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={initialWidth}
      height={initialWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {atelier && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2E2BF" />
            <stop offset="40%" stopColor="#D7BA83" />
            <stop offset="72%" stopColor="#B08D57" />
            <stop offset="100%" stopColor="#E6CEA0" />
          </linearGradient>
        </defs>
      )}
      {atelier ? (
        <>
          <g stroke="#30271B" strokeWidth="2.3" opacity=".9" transform="translate(0.12 0.26)">
            <IconoirPath glyph={glyph} />
          </g>
          <g stroke={line} strokeWidth="1.65">
            <IconoirPath glyph={glyph} />
          </g>
          <g stroke="#FFF4D6" strokeWidth=".32" opacity=".38" transform="translate(-0.16 -0.18)">
            <IconoirPath glyph={glyph} />
          </g>
        </>
      ) : (
        <>
          <g stroke="#FBF8F3" strokeWidth="2.3" opacity=".7" transform="translate(-0.16 -0.16)">
            <IconoirPath glyph={glyph} />
          </g>
          <g stroke={line} strokeWidth="1.62">
            <IconoirPath glyph={glyph} />
          </g>
        </>
      )}
    </svg>
  );
}

export const D1SplashCrownIcon: React.FC<D1IconProps> = props => (
  <D1Icon glyph="crown" variant="atelier" {...props} />
);
export const D1RentIcon: React.FC<D1IconProps> = props => (
  <D1Icon glyph="shirt" variant="boutique" {...props} />
);
export const D1BuyIcon: React.FC<D1IconProps> = props => (
  <D1Icon glyph="handbag" variant="boutique" {...props} />
);
export const D1SellIcon: React.FC<D1IconProps> = props => (
  <D1Icon glyph="shopping-bag-arrow-up" variant="boutique" {...props} />
);
