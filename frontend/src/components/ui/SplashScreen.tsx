import React, { useState, useEffect, useRef } from 'react';
import { D1SplashCrownIcon } from '../icons/BoutiqueD1Icons';

export interface SplashScreenProps {
  isReady?: boolean;
  minDurationMs?: number;
  maxTimeoutMs?: number;
  onComplete?: () => void;
  reduceAnimations?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isReady = false,
  minDurationMs = 1200,
  maxTimeoutMs = 3500,
  onComplete,
  reduceAnimations = false,
}) => {
  const [phase, setPhase] = useState<'ENTERING' | 'ACTIVE' | 'EXITING' | 'HIDDEN'>('ENTERING');
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  // 1. Remove native inline HTML splash once React SplashScreen is mounted
  useEffect(() => {
    const nativeSplash = document.getElementById('native-splash');
    if (nativeSplash) {
      nativeSplash.style.opacity = '0';
      nativeSplash.style.pointerEvents = 'none';
      const removeTimer = setTimeout(() => {
        nativeSplash.remove();
      }, 300);
      return () => clearTimeout(removeTimer);
    }
  }, []);

  // 2. Reduced motion check
  const isReducedMotion = reduceAnimations || 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // 3. Minimum display duration timer & emergency timeout
  useEffect(() => {
    if (isReducedMotion) {
      setHasMinTimeElapsed(true);
      return;
    }

    // Step from ENTERING to ACTIVE shortly after mount for CSS transitions
    const enterTimer = setTimeout(() => {
      setPhase(p => (p === 'ENTERING' ? 'ACTIVE' : p));
    }, 50);

    // Guarantee minimum brand showcase duration (1200ms)
    timerRef.current = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, minDurationMs);

    // Fallback maximum timeout to guarantee user is never locked out on slow networks
    timeoutRef.current = setTimeout(() => {
      handleExit();
    }, maxTimeoutMs);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [minDurationMs, maxTimeoutMs, isReducedMotion]);

  // 4. Trigger exit when both backend readiness and minimum timer have completed
  useEffect(() => {
    if ((isReady && hasMinTimeElapsed) || isReducedMotion) {
      handleExit();
    }
  }, [isReady, hasMinTimeElapsed, isReducedMotion]);

  const handleExit = () => {
    setPhase(prev => {
      if (prev === 'EXITING' || prev === 'HIDDEN') return prev;
      return 'EXITING';
    });

    const exitDuration = isReducedMotion ? 50 : 350;
    setTimeout(() => {
      setPhase('HIDDEN');
      try {
        sessionStorage.setItem('lr_splash_viewed', 'true');
      } catch {}
      if (onComplete) onComplete();
    }, exitDuration);
  };

  if (phase === 'HIDDEN') {
    return null;
  }

  const isExiting = phase === 'EXITING';
  const isEntering = phase === 'ENTERING';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="LuxuryRental 로딩 중"
      onClick={handleExit}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between select-none bg-[#0B0C0E] text-white transition-all duration-350 ease-out overflow-hidden cursor-pointer ${
        isExiting 
          ? 'opacity-0 -translate-y-4 pointer-events-none' 
          : 'opacity-100 translate-y-0'
      }`}
      style={{
        backgroundColor: '#0B0C0E',
        backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(197, 168, 128, 0.12) 0%, #0B0C0E 70%)'
      }}
    >
      {/* Subtle luxury hairline frame accent */}
      <div className="absolute inset-4 sm:inset-8 max-w-md mx-auto border border-[#C5A880]/15 rounded-2xl pointer-events-none" />

      {/* Top Bar: Haute Curation Monogram */}
      <div className="pt-10 z-10 text-center">
        <span className="text-[9px] tracking-[0.35em] text-[#C5A880]/70 font-mono uppercase font-semibold">
          HAUTE COUTURE ARCHIVE
        </span>
      </div>

      {/* Center Brand Identity: Emblem + Royal Crown + Typography */}
      <div className="flex flex-col items-center justify-center -mt-6 z-10 px-6">
        {/* D1 Iconoir crown: independent atelier-engraved mark, no medal ring */}
        <div className="w-24 h-24 flex items-center justify-center" aria-hidden="true">
          <D1SplashCrownIcon className="w-20 h-20" />
        </div>

        {/* Wordmark: LUXURY RENTAL */}
        <div className="mt-6 text-center">
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#DFCDAF] via-[#FFFDF8] to-[#C5A880] drop-shadow-sm">
            LUXURY RENTAL
          </h1>
          <p className="mt-2 text-[10px] tracking-[0.35em] text-[#A68F68] uppercase font-medium">
            Curated Luxury Living
          </p>
        </div>

        {/* Champagne Gold Shimmer Loading Line */}
        <div className="w-20 h-[2px] bg-[#1E2024] rounded-full overflow-hidden relative mt-8">
          <div 
            className={`absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-[#E8D7B8] to-transparent ${
              isReducedMotion ? 'w-full' : 'animate-[shimmer_1.4s_infinite]'
            }`}
            style={{
              animation: isReducedMotion ? 'none' : 'lr-shimmer 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pb-8 z-10 flex flex-col items-center gap-1.5">
        <span className="text-[8px] tracking-[0.25em] text-[#7A6B53] uppercase font-mono">
          PARIS · MILAN · SEOUL · TOKYO
        </span>
        <span className="text-[9px] text-[#554A39] font-medium tracking-wide">
          화면을 터치하면 바로 시작합니다
        </span>
      </div>

      {/* Keyframe animation for inline shimmer */}
      <style>{`
        @keyframes lr-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};
