import React from 'react';

export type MetalVariant = 'satin' | 'graphite' | 'gunmetal' | 'champagne' | 'silver';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface EngravedIconBaseProps extends React.SVGProps<SVGSVGElement> {
  variant?: MetalVariant;
  size?: IconSize;
  className?: string;
  title?: string;
  ariaLabel?: string;
  active?: boolean;
  depth?: 'shallow' | 'medium' | 'deep';
  glow?: boolean;
}

export type EngravedIconProps = EngravedIconBaseProps;

export interface EngravedMenuIconProps {
  className?: string;
  size?: number;
  variant?: MetalVariant;
  active?: boolean;
}
