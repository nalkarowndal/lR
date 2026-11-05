import React from 'react';
import type { EngravedIconBaseProps } from '../EngravedIcon.types';
import { EngravedDefs } from '../EngravedIconTokens';

/**
 * 관리자/VIP 공식 로열 크라운 엠블럼 (Luxury Regal Crown Engraving)
 */
export const EngravedCrownEmblem: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-champagne ${className}`}
    {...props}
  >
    <EngravedDefs prefix="crown" />
    {/* Base Band with Jewel Etchings */}
    <path
      d="M4 17.5C4 16.95 4.45 16.5 5 16.5H19C19.55 16.5 20 16.95 20 17.5V18.5C20 19.05 19.55 19.5 19 19.5H5C4.45 19.5 4 19.05 4 18.5V17.5Z"
      fill="url(#crown-gold-grad)"
      stroke="#7D653E"
      strokeWidth="0.6"
    />
    <circle cx="8" cy="18" r="0.8" fill="#FFFFFF" />
    <circle cx="12" cy="18" r="0.9" fill="#FFFFFF" />
    <circle cx="16" cy="18" r="0.8" fill="#FFFFFF" />

    {/* Crown Spikes Silhouette */}
    <path
      d="M4.5 16.5L3.5 8.5L8.5 12.5L12 5.5L15.5 12.5L20.5 8.5L19.5 16.5H4.5Z"
      fill="url(#crown-gold-grad)"
      stroke="#7D653E"
      strokeWidth="0.8"
      strokeLinejoin="round"
      filter="url(#crown-deboss-filter)"
    />

    {/* Inner Chiseled Relief Lines */}
    <path d="M12 7.5L10 13H14L12 7.5Z" fill="#F4E8C1" fillOpacity="0.45" />
    <path d="M8.5 13.5L5.8 10L6.5 16H9.5L8.5 13.5Z" fill="#7D653E" fillOpacity="0.18" />
    <path d="M15.5 13.5L18.2 10L17.5 16H14.5L15.5 13.5Z" fill="#7D653E" fillOpacity="0.18" />

    {/* Pearl Finials */}
    <circle cx="3.5" cy="8.5" r="1.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="8.5" cy="12.5" r="1" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="12" cy="5.5" r="1.5" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.6" />
    <circle cx="15.5" cy="12.5" r="1" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="20.5" cy="8.5" r="1.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
  </svg>
);

/**
 * 보안 및 관리자 인증 쉴드 크레스트 (Engraved Shield Crest)
 */
export const EngravedShieldAdmin: React.FC<EngravedIconBaseProps> = ({
  className = 'w-5 h-5',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-graphite ${className}`}
    {...props}
  >
    <EngravedDefs prefix="shield-adm" />
    <path
      d="M12 21.5C12 21.5 20 17 20 10.5V5.5L12 2.5L4 5.5V10.5C4 17 12 21.5 12 21.5Z"
      fill="#252525"
      stroke="url(#shield-adm-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#shield-adm-deboss-filter)"
    />
    <path
      d="M12 18.5C12 18.5 17.5 15.2 17.5 10.8V6.8L12 4.8L6.5 6.8V10.8C6.5 15.2 12 18.5 12 18.5Z"
      stroke="#7A6136"
      strokeWidth="0.7"
      strokeDasharray="1.5 1"
    />
    {/* Center Keyhole Engraving */}
    <circle cx="12" cy="10" r="1.8" fill="url(#shield-adm-gold-grad)" />
    <path d="M11 10.8L10.5 14H13.5L13 10.8H11Z" fill="url(#shield-adm-gold-grad)" />
  </svg>
);

/**
 * Graphite Micro-Bevel 자물쇠 (Engraved Lock)
 */
export const EngravedLockIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-graphite ${className}`}
    {...props}
  >
    <EngravedDefs prefix="lock" />
    {/* Shackle */}
    <path
      d="M7.5 10V6.5C7.5 4 9.5 2 12 2C14.5 2 16.5 4 16.5 6.5V10"
      stroke="url(#lock-gold-grad)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Padlock Body */}
    <rect
      x="4"
      y="10"
      width="16"
      height="12"
      rx="2.5"
      fill="#252525"
      stroke="url(#lock-gold-grad)"
      strokeWidth="1.2"
      filter="url(#lock-deboss-filter)"
    />
    {/* Keyhole */}
    <circle cx="12" cy="15" r="1.5" fill="#DFCA9B" />
    <path d="M11.2 15.8L10.8 18.5H13.2L12.8 15.8H11.2Z" fill="#DFCA9B" />
  </svg>
);

/**
 * Graphite Micro-Bevel 알림 벨 (Engraved Bell)
 */
export const EngravedBellIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-graphite ${className}`}
    {...props}
  >
    <EngravedDefs prefix="bell" />
    <path
      d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      fill="#252525"
      stroke="url(#bell-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#bell-deboss-filter)"
    />
    <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="url(#bell-gold-grad)" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * 회원 프로필 크레스트 (Engraved Profile Crest)
 */
export const EngravedProfileCrest: React.FC<EngravedIconBaseProps> = ({
  className = 'w-10 h-10',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-satin ${className}`}
    {...props}
  >
    <EngravedDefs prefix="prf-crest" />
    {/* Outer Medallion */}
    <circle cx="24" cy="24" r="22" fill="#F8F7F4" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="19" fill="#252525" stroke="url(#prf-crest-gold-grad)" strokeWidth="1" filter="url(#prf-crest-deboss-filter)" />
    {/* Head/Bust Silhouette */}
    <circle cx="24" cy="18" r="6" fill="#DFCA9B" stroke="#7A6136" strokeWidth="0.6" />
    <path d="M14 36C14 30.5 18.5 27 24 27C29.5 27 34 30.5 34 36" fill="#DFCA9B" stroke="#7A6136" strokeWidth="0.6" />
  </svg>
);

/**
 * 4각 반짝임 티어 배지 (Engraved Sparkle Tier)
 */
export const EngravedSparkleTier: React.FC<EngravedIconBaseProps> = ({
  className = 'w-4 h-4',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-champagne ${className}`}
    {...props}
  >
    <EngravedDefs prefix="sparkle" />
    <path
      d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
      fill="url(#sparkle-gold-grad)"
      stroke="#7A6136"
      strokeWidth="0.6"
      filter="url(#sparkle-deboss-filter)"
    />
    <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
  </svg>
);

/**
 * 판매 승인 완료 메달 (Engraved Medal Emblem)
 */
export const EngravedMedalEmblem: React.FC<EngravedIconBaseProps> = ({
  className = 'w-16 h-16',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-satin ${className}`}
    {...props}
  >
    <EngravedDefs prefix="medal" />
    {/* Hanging Ribbon Tails */}
    <path d="M22 36L16 60L32 52L48 60L42 36" fill="#252525" stroke="url(#medal-gold-grad)" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Medal Outer Disc */}
    <circle cx="32" cy="28" r="24" fill="#F8F7F4" stroke="#E6E0D4" strokeWidth="1.2" />
    <circle cx="32" cy="28" r="21" fill="#252525" stroke="url(#medal-gold-grad)" strokeWidth="1.4" filter="url(#medal-deboss-filter)" />
    <circle cx="32" cy="28" r="18" fill="none" stroke="url(#medal-gold-grad)" strokeWidth="0.8" strokeDasharray="2 1.5" />
    {/* Center Checkmark */}
    <path d="M22 28L28 34L42 20" stroke="#DFCA9B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 위탁 상품 촬영 카메라 각인 (Engraved Camera)
 */
export const EngravedCameraIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-6 h-6',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-graphite ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cam" />
    <path
      d="M23 19C23 19.5 22.5 20 22 20H2C1.5 20 1 19.5 1 19V8C1 7.5 1.5 7 2 7H6L8 4H16L18 7H22C22.5 7 23 7.5 23 8V19Z"
      fill="#252525"
      stroke="url(#cam-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#cam-deboss-filter)"
    />
    <circle cx="12" cy="13" r="4" fill="#1C1C1C" stroke="url(#cam-gold-grad)" strokeWidth="1.2" />
    <circle cx="12" cy="13" r="1.5" fill="#DFCA9B" />
  </svg>
);
