import React from 'react';
import type { BoutiqueIconProps } from './BoutiqueNav';

/**
 * 1. Boutique Camera Icon (판매 등록 사진 촬영 및 프로필)
 */
export const BoutiqueCameraIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Camera"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} strokeWidth={strokeWidth} />
    <circle cx="12" cy="13" r="1.5" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <circle cx="18" cy="9" r="0.75" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
  </svg>
);

/**
 * 2. Boutique Image Upload Icon
 */
export const BoutiqueImageUploadIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Upload Image"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="8.5" cy="8.5" r="1.5" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <path
      d="M21 15L16 10L5 21"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 업로드 화살표 악센트 */}
    <path
      d="M12 7V13M12 7L9.5 9.5M12 7L14.5 9.5"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth * 1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 3. Boutique Users Icon (관리자 근무자 목록)
 */
export const BoutiqueUsersIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Users"
    className={`transition-all duration-200 ${className}`}
    {...props}
  >
    <path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
    <path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 4. Boutique Chat Bubble Icon (실시간 채팅)
 */
export const BoutiqueChatBubbleIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Chat"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="11.5" r="1" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <circle cx="12.5" cy="11.5" r="1" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
    <circle cx="16.5" cy="11.5" r="1" fill={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'} />
  </svg>
);

/**
 * 5. Boutique Send Icon (메시지 전송)
 */
export const BoutiqueSendIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Send"
    className={`transition-all duration-200 hover:translate-x-0.5 active:scale-90 ${className}`}
    {...props}
  >
    <path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke={accent ? 'var(--theme-icon-accent, #C5A880)' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. Boutique Excel Icon (엑셀 데이터 가져오기)
 */
export const BoutiqueExcelIcon: React.FC<BoutiqueIconProps> = ({
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
    aria-label="Excel"
    className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth={strokeWidth} />
    <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M13 11L17 17M17 11L13 17" stroke={accent ? '#107C41' : 'currentColor'} strokeWidth={strokeWidth * 1.15} strokeLinecap="round" />
  </svg>
);

