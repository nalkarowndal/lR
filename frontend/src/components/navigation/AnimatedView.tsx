import React, { type ReactNode } from 'react';
import { useApp } from '../../context/AppContext';

interface AnimatedViewProps {
  children: ReactNode;
  viewKey: string;
  className?: string;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({ children, viewKey, className = '' }) => {
  const { transitionDirection, userSettings } = useApp();

  const animationClass = userSettings.reduce_animations
    ? ''
    : transitionDirection === 'forward'
    ? 'animate-slideInRight'
    : transitionDirection === 'backward'
    ? 'animate-slideInLeft'
    : 'animate-fadeIn';

  return (
    <div key={viewKey} className={`w-full h-full ${animationClass} ${className}`}>
      {children}
    </div>
  );
};
