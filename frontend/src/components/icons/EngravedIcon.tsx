import React from 'react';
import type { EngravedIconBaseProps } from './EngravedIcon.types';
import { parseIconSize, EngravedDefs } from './EngravedIconTokens';

export const EngravedIcon: React.FC<EngravedIconBaseProps & { children: React.ReactNode; viewBox?: string; prefix?: string }> = ({
  size = 'md',
  variant = 'satin',
  className = '',
  title,
  ariaLabel,
  active = false,
  viewBox = '0 0 24 24',
  prefix = 'lx',
  children,
  style,
  ...rest
}) => {
  const pixelSize = parseIconSize(size);
  const isAriaHidden = !title && !ariaLabel;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={isAriaHidden ? 'presentation' : 'img'}
      aria-hidden={isAriaHidden ? 'true' : undefined}
      aria-label={ariaLabel || title}
      className={`luxury-engraved-icon luxury-engraved-${variant} ${active ? 'is-active' : ''} inline-block select-none transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.97] active:translate-y-[0.5px] ${className}`}
      style={{
        verticalAlign: 'middle',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        ...style,
      }}
      {...rest}
    >
      {title && <title>{title}</title>}
      <EngravedDefs prefix={prefix} />
      {children}
    </svg>
  );
};
