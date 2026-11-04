import React from 'react';

/**
 * Official vector brand logos for social sign-in providers
 * Strict compliance with brand guidelines:
 * - Kakao: #000000 symbol on #FEE500
 * - Apple: #000000 symbol on white/black
 * - Naver: #FFFFFF 'N' on #03C75A
 * - PAYCO: #FFFFFF 'P' on #EA3323
 */

export const KakaoOfficialSymbol = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="#000000" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.83 5.18 4.6 6.48-.2.75-.74 2.72-.85 3.15-.14.54.2.53.42.38.17-.11 2.74-1.87 3.86-2.63.63.09 1.29.14 1.97.14 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
  </svg>
);

export const AppleOfficialSymbol = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg 
    viewBox="0 0 170 170" 
    className={className} 
    fill="#000000" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.14-10.82-19.29-14.46-30.46-3.64-11.16-5.46-22.09-5.46-32.78 0-14.58 3.73-26.68 11.2-36.3 7.46-9.62 16.79-14.54 27.97-14.77 4.8.11 10.05 1.34 15.77 3.69 5.72 2.36 9.69 3.59 11.9 3.69 2.01 0 6.09-1.29 12.24-3.86 6.16-2.58 11.58-3.71 16.27-3.4 12.38.64 22.42 5.38 30.12 14.23-10.74 6.52-16 15.42-15.77 26.69.23 8.81 3.55 16.14 9.97 21.99 6.41 5.84 14.07 9.17 22.97 9.97-2.35 6.94-5.24 14.05-8.68 21.32zM119.22 31.84c0-7.39 2.66-14.39 7.97-21 5.31-6.61 11.95-10.55 19.92-11.84.23 1.19.34 2.37.34 3.56 0 7.27-2.73 14.35-8.19 21.23-5.46 6.88-12.06 10.73-19.8 11.56-.11-1.19-.24-2.36-.24-3.51z"/>
  </svg>
);

export const NaverOfficialSymbol = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="#FFFFFF" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
  </svg>
);

export const PaycoOfficialSymbol = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="#FFFFFF" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2.5V7.5H13c2.2 0 4 1.57 4 3.5s-1.8 3.5-4 3.5zm0-5h-1v3h1c1.1 0 2-.67 2-1.5S14.1 11.5 13 11.5z"/>
  </svg>
);
