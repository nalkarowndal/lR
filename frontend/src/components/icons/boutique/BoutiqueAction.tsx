import React from 'react';
import type { BoutiqueIconProps } from './BoutiqueNav';

/**
 * 1. Boutique Heart Icon (찜하기 버튼)
 * 하이엔드 주얼리 하트 실루엣 + 활성 시 루비/에나멜 필링
 */
export const BoutiqueHeartIcon: React.FC<BoutiqueIconProps & { active?: boolean; filled?: boolean }> = ({
  size = 20,
  strokeWidth = 1.35,
  active = false,
  filled = false,
  className = '',
  ...props
}) => {
  const isFilled = active || filled;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Wishlist Heart"
      className={`transition-all duration-300 hover:scale-110 active:scale-90 ${className}`}
      data-selected={isFilled ? '' : undefined}
      {...props}
    >
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill={isFilled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isFilled && (
        <circle cx="15.5" cy="7.5" r="1" fill="#FFFFFF" opacity="0.8" />
      )}
    </svg>
  );
};

/**
 * 2. Boutique Share Icon (공유하기)
 */
export const BoutiqueShareIcon: React.FC<BoutiqueIconProps> = ({
  size = 20,
  strokeWidth = 1.35,
  accent = true,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Share"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <circle cx="18" cy="5" r="3" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} />
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="18" cy="19" r="3" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * 3. Boutique Calendar Icon (렌탈 기간 선택)
 */
export const BoutiqueCalendarIcon: React.FC<BoutiqueIconProps> = ({
  size = 20,
  strokeWidth = 1.35,
  accent = true,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Calendar"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="8" y1="2.5" x2="8" y2="5.5" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="16" y1="2.5" x2="16" y2="5.5" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* 달력 날짜 골드 스톤 비드 */}
    <circle cx="8" cy="13.5" r="1" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="16" cy="13.5" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="8" cy="17" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="17" r="1" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
  </svg>
);

/**
 * 4. Boutique Bell Icon (알림 컨시어지)
 */
export const BoutiqueBellIcon: React.FC<BoutiqueIconProps & { hasUnread?: boolean }> = ({
  size = 20,
  strokeWidth = 1.35,
  accent = true,
  hasUnread = false,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Notifications"
    className={`transition-all duration-200 hover:rotate-12 ${className}`}
    {...props}
  >
    <path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {hasUnread && (
      <circle cx="18.5" cy="5.5" r="2.5" fill="var(--theme-icon-accent, #C5A880)" stroke="#FFFFFF" strokeWidth="1" />
    )}
  </svg>
);

/**
 * 5. Boutique Filter Icon (검색 필터)
 */
export const BoutiqueFilterIcon: React.FC<BoutiqueIconProps> = ({
  size = 20,
  strokeWidth = 1.35,
  accent = true,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Filter"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="9" cy="6" r="2" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} fill="#FFFFFF" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="15" cy="12" r="2" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} fill="#FFFFFF" />
    <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="7" cy="18" r="2" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} fill="#FFFFFF" />
  </svg>
);

/**
 * 6. Boutique Plus / Minus (수량 증감)
 */
export const BoutiquePlusIcon: React.FC<BoutiqueIconProps> = ({
  size = 18,
  strokeWidth = 1.35,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Increase"
    className={`transition-all duration-200 hover:scale-110 active:scale-90 ${className}`}
    {...props}
  >
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const BoutiqueMinusIcon: React.FC<BoutiqueIconProps> = ({
  size = 18,
  strokeWidth = 1.35,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Decrease"
    className={`transition-all duration-200 hover:scale-110 active:scale-90 ${className}`}
    {...props}
  >
    <path d="M5 12H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

/**
 * 7. Boutique Trash Icon (삭제/휴지통)
 */
export const BoutiqueTrashIcon: React.FC<BoutiqueIconProps> = ({
  size = 20,
  strokeWidth = 1.35,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Delete"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <path d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M19 6L18.1 19.1C18.05 19.9 17.4 20.5 16.6 20.5H7.4C6.6 20.5 5.95 19.9 5.9 19.1L5 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="10" x2="10" y2="16" stroke="currentColor" strokeWidth={strokeWidth * 0.9} strokeLinecap="round" strokeOpacity="0.6" />
    <line x1="14" y1="10" x2="14" y2="16" stroke="currentColor" strokeWidth={strokeWidth * 0.9} strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

/**
 * 8. Boutique Trend Icons (실시간 인기 검색어 랭킹)
 */
export const BoutiqueTrendUp: React.FC<BoutiqueIconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`text-red-500 ${className}`} {...props}>
    <path d="M8 3.5L12.5 8H3.5L8 3.5Z" fill="currentColor" />
  </svg>
);

export const BoutiqueTrendDown: React.FC<BoutiqueIconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`text-blue-500 ${className}`} {...props}>
    <path d="M8 12.5L3.5 8H12.5L8 12.5Z" fill="currentColor" />
  </svg>
);

export const BoutiqueTrendSame: React.FC<BoutiqueIconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`text-gray-400 ${className}`} {...props}>
    <rect x="3.5" y="7.25" width="9" height="1.5" rx="0.75" fill="currentColor" />
  </svg>
);

