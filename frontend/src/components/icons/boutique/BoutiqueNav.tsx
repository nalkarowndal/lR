import React from 'react';

export interface BoutiqueIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
  accent?: boolean;
}

/**
 * 1. Boutique Luxury Shopping Bag (헤더 및 장바구니 전용)
 * 파리지앵 명품 부티크 쇼핑백 실루엣 + 샴페인 골드 트윈 트위스트 핸들
 */
export const BoutiqueBagIcon: React.FC<BoutiqueIconProps> = ({
  size = 22,
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
    aria-label="Shopping Bag"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    {/* 쇼핑백 본체 실루엣 */}
    <path
      d="M4.5 8.5C4.5 7.67157 5.17157 7 6 7H18C18.8284 7 19.5 7.67157 19.5 8.5L20.5 20C20.5 20.8284 19.8284 21.5 19 21.5H5C4.17157 21.5 3.5 20.8284 3.5 20L4.5 8.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* 트윈 트위스트 핸들 (샴페인 골드 악센트 포인트) */}
    <path
      d="M8.5 9.5V6C8.5 4.067 10.067 2.5 12 2.5C13.933 2.5 15.5 4.067 15.5 6V9.5"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* 미세 하단 밑판 주름선 */}
    <line
      x1="7.5"
      y1="18.5"
      x2="16.5"
      y2="18.5"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.75}
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 2. Boutique Diamond Lens Search Icon (상단 헤더 및 통합 검색)
 * 다이아몬드 커팅 렌즈 림 + 테이퍼드 핸들 + 샴페인 골드 반사호
 */
export const BoutiqueSearchIcon: React.FC<BoutiqueIconProps> = ({
  size = 22,
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
    aria-label="Search"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={strokeWidth} />
    {/* 세련된 테이퍼드 핸들 */}
    <path
      d="M16 16L21 21"
      stroke="currentColor"
      strokeWidth={strokeWidth * 1.2}
      strokeLinecap="round"
    />
    {/* 렌즈 상단 샴페인 골드 반사 아치 */}
    {accent && (
      <path
        d="M8.5 8.5C9.2 7.8 10.1 7.4 11 7.4"
        stroke="var(--theme-icon-accent, #C5A880)"
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
    )}
  </svg>
);

/**
 * 3. Boutique Jewelry Gear Settings Icon (설정 및 옵션 제어)
 * 톱니 윤곽과 중앙 샴페인 골드 링
 */
export const BoutiqueSettingsIcon: React.FC<BoutiqueIconProps> = ({
  size = 22,
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
    aria-label="Settings"
    className={`transition-transform duration-200 active:scale-95 ${className}`}
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="3.2"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
    />
    <path
      d="M10.1 3.4h3.8l.6 2.55 1.5.86 2.51-.75 1.9 3.29-1.91 1.81v1.72l1.91 1.81-1.9 3.29-2.51-.75-1.5.86-.6 2.55h-3.8l-.6-2.55-1.5-.86-2.51.75-1.9-3.29 1.91-1.81v-1.72L3.59 9.35l1.9-3.29L8 6.81l1.5-.86.6-2.55Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 4. Boutique Hairline Close Icon (모달 닫기 버튼)
 * 슬림 1.35px 미세 헤어라인 크로스 + 미세 노치
 */
export const BoutiqueCloseIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Close"
    className={`transition-all duration-200 hover:rotate-90 active:scale-90 ${className}`}
    {...props}
  >
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 5. Boutique Chevrons (네비게이션 화살표)
 */
export const BoutiqueChevronLeft: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Previous"
    className={`transition-transform duration-200 hover:-translate-x-0.5 active:scale-90 ${className}`}
    {...props}
  >
    <path
      d="M15 19L8 12L15 5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BoutiqueChevronRight: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Next"
    className={`transition-transform duration-200 hover:translate-x-0.5 active:scale-90 ${className}`}
    {...props}
  >
    <path
      d="M9 5L16 12L9 19"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BoutiqueChevronDown: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Expand"
    className={`transition-transform duration-200 ${className}`}
    {...props}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. Boutique Menu Icon (헤어라인 버거)
 */
export const BoutiqueMenuIcon: React.FC<BoutiqueIconProps> = ({
  size = 22,
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
    aria-label="Menu"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="4" y1="12" x2="16" y2="12" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

