import React from 'react';
import type { BoutiqueIconProps } from './BoutiqueNav';

/**
 * 1. Boutique Check Square (체크박스 체크 상태)
 * 샴페인 골드 헤어라인 프레임 + 정밀 체크 마크
 */
export const BoutiqueCheckSquare: React.FC<BoutiqueIconProps & { checked?: boolean }> = ({
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
    aria-label="Checked"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="4"
      stroke={accent ? '#B49A67' : 'currentColor'}
      strokeWidth={strokeWidth}
      fill={accent ? 'rgba(180, 154, 103, 0.12)' : 'none'}
    />
    <path
      d="M7.5 12L10.5 15L16.5 8.5"
      stroke={accent ? '#8C734B' : 'currentColor'}
      strokeWidth={strokeWidth * 1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 2. Boutique Square (체크박스 미체크 상태)
 */
export const BoutiqueSquare: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Unchecked"
    className={`transition-all duration-200 hover:border-[#B49A67] ${className}`}
    {...props}
  >
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="4"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeOpacity="0.45"
    />
  </svg>
);

/**
 * 3. Boutique Eye Icon (비밀번호 표시)
 */
export const BoutiqueEyeIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Show password"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <path
      d="M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3.2"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
    />
    <circle cx="13" cy="11" r="0.8" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
  </svg>
);

/**
 * 4. Boutique Eye Off Icon (비밀번호 숨김)
 */
export const BoutiqueEyeOffIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Hide password"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <path
      d="M10.2 5.2C10.8 5.06 11.4 5 12 5C16 5 19.5 7.5 21.5 12C20.6 14.1 19.1 15.8 17.2 16.9M6.8 6.8C4.8 8.1 3.3 9.9 2.5 12C4.5 16.5 8 19 12 19C13.8 19 15.5 18.4 17 17.4"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 3L21 21"
      stroke="#B49A67"
      strokeWidth={strokeWidth * 1.1}
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 3" />
  </svg>
);

/**
 * 5. Boutique Mail Icon (이메일 폼 인풋)
 */
export const BoutiqueMailIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Email"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <rect
      x="3.5"
      y="5.5"
      width="17"
      height="13"
      rx="3"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <path
      d="M4.5 7.5L12 12.5L19.5 7.5"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. Boutique Key Icon (비밀번호 및 보안)
 */
export const BoutiqueKeyIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Password Security"
    className={`transition-all duration-200 hover:rotate-12 ${className}`}
    {...props}
  >
    <circle
      cx="7.5"
      cy="12"
      r="4"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
    />
    <circle cx="7.5" cy="12" r="1.5" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <path
      d="M11.5 12H20.5M17.5 12V14.5M20.5 12V14.5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 7. Boutique Lock Icon (자물쇠)
 */
export const BoutiqueLockIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Security Lock"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <rect
      x="5"
      y="10"
      width="14"
      height="10.5"
      rx="2.5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <path
      d="M8 10V6.5C8 4.567 9.791 3 12 3C14.209 3 16 4.567 16 6.5V10"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <circle cx="12" cy="15" r="1.2" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <path d="M12 16.2V18" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

