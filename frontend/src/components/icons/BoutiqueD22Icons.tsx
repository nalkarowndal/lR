import React, { useId } from 'react';
import { D2_ICONOIR_PATHS } from './BoutiqueD2Icons';
import { D22_SHAPES_A } from './D22IconShapesA';
import { D22_SHAPES_B } from './D22IconShapesB';
import { D22_SHAPES_C } from './D22IconShapesC';

/**
 * D2-2: The same 24x24 Iconoir geometry and finishes on all non-bottom-nav pages.
 * Iconoir paths/shapes retain original geometry. MIT notice is preserved under
 * docs/design/ICONOIR_LICENSE.md. No externally drawn badge/medallion.
 */
const originalShapes: Record<string, readonly {tag: string; props: Record<string, string>}[]> = {
  ...D22_SHAPES_A,
  ...D22_SHAPES_B,
  ...D22_SHAPES_C,
};
const originalPaths: Record<string, readonly string[]> = D2_ICONOIR_PATHS;
export type D22Glyph = keyof typeof D22_SHAPES_A | keyof typeof D22_SHAPES_B | keyof typeof D22_SHAPES_C | keyof typeof D2_ICONOIR_PATHS;
export type D22Finish = 'boutique' | 'atelier';

export interface D22IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  size?: number;
  finish?: D22Finish;
}

export function D22Icon({
  glyph,
  size = 24,
  finish = 'boutique',
  strokeWidth,
  className,
  fill = 'none',
  style,
  ...rest
}: D22IconProps & { glyph: D22Glyph }) {
  const metalId = `lr-d22-metal-${useId().replace(/:/g, '')}`;
  const atelier = finish === 'atelier';
  const sourceShapes = originalShapes[glyph] ?? originalPaths[glyph]?.map(d => ({ tag: 'path', props: { d } }));
  if (!sourceShapes?.length) return null;
  const shapes = sourceShapes.map((item, index) =>
    React.createElement(item.tag, { ...item.props, key: index })
  );
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth ?? (atelier ? 1.55 : 1.58)}
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
      data-d22-glyph={glyph}
      data-d22-finish={finish}
    >
      {atelier && (
        <defs>
          <linearGradient id={metalId} x1="10%" y1="1%" x2="92%" y2="100%">
            <stop offset="0%" stopColor="#FFF1D2" />
            <stop offset="18%" stopColor="#D6BD8E" />
            <stop offset="43%" stopColor="#AA8250" />
            <stop offset="61%" stopColor="#F4DCB1" />
            <stop offset="83%" stopColor="#B68E58" />
            <stop offset="100%" stopColor="#E6C99B" />
          </linearGradient>
        </defs>
      )}
      {atelier ? (
        <>
          <g stroke="#312517" strokeWidth={strokeWidth ?? 2.05} opacity=".86">{shapes}</g>
          <g stroke={`url(#${metalId})`} strokeWidth={strokeWidth ?? 1.48}>{shapes}</g>
          <g stroke="#FFF1D2" strokeWidth=".18" opacity=".40" transform="translate(-.1 -.13)">{shapes}</g>
        </>
      ) : (
        <g stroke="currentColor">{shapes}</g>
      )}
    </svg>
  );
}

function makeIcon(glyph: D22Glyph, finish: D22Finish = 'boutique') {
  const Component: React.FC<D22IconProps> = props => (
    <D22Icon glyph={glyph} finish={finish} {...props} />
  );
  Component.displayName = `D22${glyph.replaceAll('-', '')}`;
  return Component;
}

export const D22ChevronLeft = makeIcon('nav-arrow-left');
export const D22ChevronRight = makeIcon('nav-arrow-right');
export const D22ArrowLeft = makeIcon('arrow-left');
export const D22ArrowUp = makeIcon('arrow-up');
export const D22ArrowDown = makeIcon('arrow-down');
export const D22Search = makeIcon('search');
export const D22Settings = makeIcon('settings');
export const D22Heart = makeIcon('heart');
export const D22MessageCircle = makeIcon('chat-bubble');
export const D22ShoppingCart = makeIcon('cart');
export const D22ShoppingBag = makeIcon('shopping-bag');
export const D22ShieldCheck = makeIcon('shield-check');
export const D22Trash2 = makeIcon('trash');
export const D22CheckCircle2 = makeIcon('check-circle');
export const D22Check = makeIcon('check');
export const D22AlertCircle = makeIcon('warning-circle');
export const D22Clock = makeIcon('clock');
export const D22Edit3 = makeIcon('edit-pencil');
export const D22UploadCloud = makeIcon('cloud-upload');
export const D22Bell = makeIcon('bell');
export const D22Lock = makeIcon('lock');
export const D22LogOut = makeIcon('log-out');
export const D22Info = makeIcon('info-circle');
export const D22FileText = makeIcon('page');
export const D22PlusCircle = makeIcon('plus-circle');
export const D22User = makeIcon('user');
export const D22Crown = makeIcon('crown', 'atelier');
export const D22Sparkles = makeIcon('spark', 'atelier');
export const D22PackageCheck = makeIcon('package');
export const D22X = makeIcon('xmark');
export const D22Sell = makeIcon('shopping-bag-arrow-up');
export const D22BadgeCheck = makeIcon('badge-check', 'atelier');
export const D22Medal = makeIcon('medal', 'atelier');
export const D22Profile = makeIcon('user-circle');
export const D22Refresh = makeIcon('refresh-double');
export const D22Box = makeIcon('box');
export const D22Gift = makeIcon('gift', 'atelier');
export const D22ShieldAlert = makeIcon('warning-circle');
