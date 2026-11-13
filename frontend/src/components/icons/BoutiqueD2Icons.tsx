import React, { useId } from 'react';

/**
 * D2 icon family: original Iconoir SVG geometry, shared style treatments.
 * Source: https://github.com/iconoir-icons/iconoir/tree/main/icons/regular
 * License: MIT, Copyright (c) 2021 Luca Burgio.
 * Attribution: docs/design/ICONOIR_LICENSE.md
 * Original source paths only; no hand-drawn substitutions or medal backplates.
 */
export const D2_ICONOIR_PATHS = {
  "gift": [
    "M20 12V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4V12",
    "M21.4 7H2.6C2.26863 7 2 7.26863 2 7.6V11.4C2 11.7314 2.26863 12 2.6 12H21.4C21.7314 12 22 11.7314 22 11.4V7.6C22 7.26863 21.7314 7 21.4 7Z",
    "M12 22V7",
    "M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z",
    "M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
  ],
  "shirt": [
    "M6 4H9C9 4 9 7 12 7C15 7 15 4 15 4H18M18 11V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4L6 11",
    "M18 4L22.4429 5.77717C22.7506 5.90023 22.9002 6.24942 22.7772 6.55709L21.1509 10.6228C21.0597 10.8506 20.8391 11 20.5938 11H18",
    "M5.99993 4L1.55701 5.77717C1.24934 5.90023 1.09969 6.24942 1.22276 6.55709L2.84906 10.6228C2.94018 10.8506 3.1608 11 3.40615 11H5.99993"
  ],
  "percentage": [
    "M17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17C19 18.1046 18.1046 19 17 19Z",
    "M7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7C9 8.10457 8.10457 9 7 9Z",
    "M19 5L5 19"
  ],
  "box": [
    "M10 12L14 12",
    "M3 3L21 3",
    "M21 7V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V7"
  ],
  "credit-card": [
    "M22 9V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V9ZM22 9H6"
  ],
  "shield-check": [
    "M8.5 11.5L11.5 14.5L16.5 9.5",
    "M5 18L3.13036 4.91253C3.05646 4.39524 3.39389 3.91247 3.90398 3.79912L11.5661 2.09641C11.8519 2.03291 12.1481 2.03291 12.4339 2.09641L20.096 3.79912C20.6061 3.91247 20.9435 4.39524 20.8696 4.91252L19 18C18.9293 18.495 18.5 21.5 12 21.5C5.5 21.5 5.07071 18.495 5 18Z"
  ],
  "crown": [
    "M19.2 17L21 7L14.7 10L12 7L9.3 10L3 7L4.8 17H19.2Z"
  ],
  "refresh-double": [
    "M21.1679 8C19.6247 4.46819 16.1006 2 11.9999 2C6.81459 2 2.55104 5.94668 2.04932 11",
    "M17 8H21.4C21.7314 8 22 7.73137 22 7.4V3",
    "M2.88146 16C4.42458 19.5318 7.94874 22 12.0494 22C17.2347 22 21.4983 18.0533 22 13",
    "M7.04932 16H2.64932C2.31795 16 2.04932 16.2686 2.04932 16.6V21"
  ],
  "mail": [
    "M7 9L12 12.5L17 9",
    "M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z"
  ]
} as const;

export type D2Glyph = keyof typeof D2_ICONOIR_PATHS;
export type D2Finish = 'boutique' | 'atelier';
export interface D2IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  finish?: D2Finish;
}

export function D2Icon({
  glyph,
  finish = 'boutique',
  size = 28,
  style,
  ...rest
}: D2IconProps & { glyph: D2Glyph }) {
  const safeId = useId().replace(/:/g, '');
  const metalId = `lr-d2-metal-${safeId}`;
  const isAtelier = finish === 'atelier';
  const paths = D2_ICONOIR_PATHS[glyph];
  const shapes = paths.map((d, index) => <path d={d} key={index} />);

  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
      data-d2-glyph={glyph}
      data-d2-finish={finish}
    >
      {isAtelier ? (
        <>
          <defs>
            <linearGradient id={metalId} x1="12%" y1="2%" x2="88%" y2="100%">
              <stop offset="0%" stopColor="#FFF1D2" />
              <stop offset="18%" stopColor="#D6BD8E" />
              <stop offset="43%" stopColor="#AA8250" />
              <stop offset="61%" stopColor="#F4DCB1" />
              <stop offset="83%" stopColor="#B68E58" />
              <stop offset="100%" stopColor="#E6C99B" />
            </linearGradient>
          </defs>
          <g stroke="#372918" strokeWidth="2.28" opacity=".92">{shapes}</g>
          <g stroke={`url(#${metalId})`} strokeWidth="1.56">{shapes}</g>
          <g stroke="#FFF2D4" strokeWidth=".24" opacity=".48" transform="translate(-.11 -.16)">{shapes}</g>
        </>
      ) : (
        <>
          <g stroke="#B09A75" strokeWidth="1.67" opacity=".18" transform="translate(0 .13)">{shapes}</g>
          <g stroke="#302D29" strokeWidth="1.53">{shapes}</g>
        </>
      )}
    </svg>
  );
}

export const D2EventGiftIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="gift" finish="atelier" size={38} {...props} />
);
export const D2RentMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="shirt" finish="boutique" {...props} />
);
export const D2DiscountMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="percentage" finish="boutique" {...props} />
);
export const D2ArrivalMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="box" finish="boutique" {...props} />
);
export const D2MembershipMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="credit-card" finish="boutique" {...props} />
);
export const D2CareMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="shield-check" finish="boutique" {...props} />
);
export const D2VipMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="crown" finish="atelier" {...props} />
);
export const D2BuybackMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="refresh-double" finish="boutique" {...props} />
);
export const D2InviteMenuIcon: React.FC<D2IconProps> = props => (
  <D2Icon glyph="mail" finish="boutique" {...props} />
);
