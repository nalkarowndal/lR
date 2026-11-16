import { useEffect, useState } from 'react';
import splashArtSvg from '../../theme/splash-art.svg?raw';
import { splashArtDataUrl } from '../../theme/splashArt';

const splashArt = splashArtDataUrl(splashArtSvg);
const exitDurationMs = 280;

export interface SplashScreenProps {
  isReady?: boolean;
  minDurationMs?: number;
  maxTimeoutMs?: number;
  onComplete?: () => void;
  reduceAnimations?: boolean;
}

export const SplashScreen = ({
  isReady = false,
  minDurationMs = 1200,
  maxTimeoutMs = 3500,
  onComplete,
  reduceAnimations = false,
}: SplashScreenProps) => {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const reduceMotion = reduceAnimations || systemReduceMotion;
  const exiting = dismissed || (isReady && minimumElapsed) || reduceMotion;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event: MediaQueryListEvent) => setSystemReduceMotion(event.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const minimum = window.setTimeout(() => setMinimumElapsed(true), minDurationMs);
    const limit = window.setTimeout(() => setDismissed(true), maxTimeoutMs);
    return () => {
      window.clearTimeout(minimum);
      window.clearTimeout(limit);
    };
  }, [minDurationMs, maxTimeoutMs]);

  useEffect(() => {
    if (!exiting) return;
    const done = window.setTimeout(() => {
      try { sessionStorage.setItem('lr_splash_viewed', 'true'); } catch {}
      onComplete?.();
    }, reduceMotion ? 0 : exitDurationMs);
    return () => window.clearTimeout(done);
  }, [exiting, onComplete, reduceMotion]);

  return (
    <div
      id="app-splash"
      className="lr-splash"
      data-exiting={exiting ? '' : undefined}
      data-reduced-motion={reduceMotion ? '' : undefined}
      inert={exiting}
      onClick={() => setDismissed(true)}
    >
      <span className="lr-splash__status" role="status">LuxuryRental 로딩 중</span>
      <span className="lr-splash__eyebrow">HAUTE COUTURE ARCHIVE</span>
      <div className="lr-splash__brand">
        <img className="lr-splash__art" src={splashArt} width={104} height={104} alt="" />
        <h1 className="lr-splash__wordmark">LUXURY RENTAL</h1>
        <p className="lr-splash__slogan">Curated Luxury Living</p>
        <div className="lr-splash__bar" aria-hidden="true" />
      </div>
      <div className="lr-splash__footer">
        <span className="lr-splash__cities">PARIS · MILAN · SEOUL · TOKYO</span>
        <button className="lr-splash__skip" type="button">바로 시작하기</button>
      </div>
    </div>
  );
};
