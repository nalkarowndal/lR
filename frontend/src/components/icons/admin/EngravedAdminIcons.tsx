import React from 'react';
import type { EngravedIconBaseProps } from '../EngravedIcon.types';
import { EngravedDefs } from '../EngravedIconTokens';

/** 1. 관리자 파트너십/위탁 아이콘 (FontAwesome fa-handshake 대체) */
export const EngravedAdminHandshake: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-hs" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-hs-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-hs-bevel-cut)" />
    <path d="M7 13.5L9.5 11L11.5 12.8L9.5 15.5L7 13.5Z" fill="#DFCA9B" />
    <path d="M17 10.5L14.5 13L12.5 11.2L14.5 8.5L17 10.5Z" fill="#DFCA9B" />
    <path d="M10 12L12.5 9.8C13.2 9.2 14.2 9.4 14.8 10.2L15.5 11.5L13.5 13.5L12 12.5L10 12Z" fill="#F4E8C1" />
  </svg>
);

/** 2. 관리자 신규 등록 아이콘 (FontAwesome fa-plus 대체) */
export const EngravedAdminPlus: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-plus" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-plus-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-plus-bevel-cut)" />
    <line x1="12" y1="7" x2="12" y2="17" stroke="#DFCA9B" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="12" x2="17" y2="12" stroke="#DFCA9B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** 3. 관리자 1:1 채팅 문의 아이콘 (FontAwesome fa-comments 대체) */
export const EngravedAdminChat: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-chat" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-chat-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-chat-bevel-cut)" />
    <path
      d="M17 12C17 9.5 14.5 7.5 11.5 7.5C8.5 7.5 6 9.5 6 12C6 13.5 7 14.8 8.5 15.6L8 17.5L10.2 16.3C10.6 16.4 11 16.5 11.5 16.5C14.5 16.5 17 14.5 17 12Z"
      fill="#252525"
      stroke="#DFCA9B"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="12" r="0.8" fill="#DFCA9B" />
    <circle cx="11.5" cy="12" r="0.8" fill="#DFCA9B" />
    <circle cx="13.5" cy="12" r="0.8" fill="#DFCA9B" />
  </svg>
);

/** 4. 관리자 회원/담당자 아이콘 (FontAwesome fa-users 대체) */
export const EngravedAdminUsers: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-users" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-users-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-users-bevel-cut)" />
    <circle cx="12" cy="9.5" r="2.5" fill="#DFCA9B" />
    <path d="M7.5 16.5C7.5 14 9.5 12.8 12 12.8C14.5 12.8 16.5 14 16.5 16.5" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** 5. 관리자 엑셀 내보내기 아이콘 (FontAwesome fa-file-excel 대체) */
export const EngravedAdminExcel: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-excel" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-excel-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-excel-bevel-cut)" />
    <rect x="7" y="6.5" width="10" height="11" rx="1.5" fill="#1C1F26" stroke="#DFCA9B" strokeWidth="1" />
    <path d="M9.5 9.5L14.5 14.5" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M14.5 9.5L9.5 14.5" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** 6. 관리자 새로고침 아이콘 (FontAwesome fa-sync/arrows-rotate 대체) */
export const EngravedAdminRefresh: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-gunmetal ${className}`}
    {...props}
  >
    <EngravedDefs prefix="adm-refresh" />
    <circle cx="12" cy="12" r="10.5" fill="url(#adm-refresh-gunmetal-grad)" stroke="#4A505C" strokeWidth="0.8" filter="url(#adm-refresh-bevel-cut)" />
    <path
      d="M17 12A5 5 0 1 1 15.5 8.5L17 7V10H14"
      stroke="#DFCA9B"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
