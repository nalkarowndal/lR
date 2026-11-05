import React from 'react';
import type { EngravedIconBaseProps } from '../EngravedIcon.types';
import { EngravedDefs } from '../EngravedIconTokens';

/** 1. 슈즈/스니커즈 각인 아이콘 */
export const EngravedSneakerIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-8 h-8',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-shoe" />
    {/* Shoe Body Silhouette */}
    <path
      d="M6 34C14 34 38 34 42 34C43 34 44 33 43 31L39 19C38 16 35 15 32 16L24 19L14 23L7 28C6 29 6 32 6 34Z"
      fill="#252525"
      stroke="url(#cat-shoe-gold-grad)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#cat-shoe-deboss-filter)"
    />
    {/* Sole & Foxing Stripe */}
    <path
      d="M6 34V37C6 38.5 7.5 40 9 40H40C41.5 40 43 38.5 43 37V34"
      stroke="url(#cat-shoe-gold-grad)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Precision Eyelets & Stitching */}
    <path d="M20 20L22 27" stroke="url(#cat-shoe-gold-grad)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    <path d="M25 19L27 26" stroke="url(#cat-shoe-gold-grad)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    <path d="M30 18L32 25" stroke="url(#cat-shoe-gold-grad)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    {/* Heel Tab Specular */}
    <circle cx="39.5" cy="20.5" r="1.2" fill="url(#cat-shoe-gold-grad)" />
  </svg>
);

/** 2. 주얼리 각인 아이콘 */
export const EngravedJewelryIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-8 h-8',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-jewelry" />
    {/* Outer Band Circle */}
    <circle
      cx="24"
      cy="28"
      r="13"
      fill="#252525"
      stroke="url(#cat-jewelry-gold-grad)"
      strokeWidth="1.8"
      filter="url(#cat-jewelry-deboss-filter)"
    />
    {/* Inner Band Relief */}
    <circle cx="24" cy="28" r="8.5" fill="#1C1C1C" stroke="url(#cat-jewelry-gold-grad)" strokeWidth="1" />
    {/* Solitaire Faceted Diamond Top */}
    <polygon
      points="24,6 29,12 24,17 19,12"
      fill="#F5F2ED"
      stroke="url(#cat-jewelry-gold-grad)"
      strokeWidth="1.2"
    />
    {/* Prong Settings */}
    <path d="M20 9L28 9" stroke="url(#cat-jewelry-gold-grad)" strokeWidth="1.2" />
    <circle cx="24" cy="11.5" r="1.2" fill="#E6D3A3" />
  </svg>
);

/** 3. 의류/코트 각인 아이콘 */
export const EngravedCoatIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-8 h-8',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-coat" />
    {/* Tailored Coat Outline */}
    <path
      d="M16 6L24 16L32 6H38L42 20L36 22L34 42H14L12 22L6 20L10 6H16Z"
      fill="#252525"
      stroke="url(#cat-coat-gold-grad)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#cat-coat-deboss-filter)"
    />
    {/* Center Placket */}
    <path d="M24 16V42" stroke="url(#cat-coat-gold-grad)" strokeWidth="1.2" />
    {/* Tailored Pocket Welts */}
    <path d="M18 25H21.5" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M18 31H21.5" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M26.5 25H30" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M26.5 31H30" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** 4. 가방/러기지 각인 아이콘 */
export const EngravedLuggageIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-10 h-10',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-luggage" />
    {/* Trunk Body */}
    <rect
      x="10"
      y="14"
      width="28"
      height="28"
      rx="3.5"
      fill="#252525"
      stroke="url(#cat-luggage-gold-grad)"
      strokeWidth="1.6"
      filter="url(#cat-luggage-deboss-filter)"
    />
    {/* Telescopic Top Handle */}
    <path d="M19 14V8C19 6.9 19.9 6 21 6H27C28.1 6 29 6.9 29 8V14" stroke="url(#cat-luggage-gold-grad)" strokeWidth="1.6" strokeLinecap="round" />
    {/* Horizontal Reinforcement Ribs */}
    <line x1="10" y1="23" x2="38" y2="23" stroke="url(#cat-luggage-gold-grad)" strokeWidth="1" strokeDasharray="3 2" />
    <line x1="10" y1="33" x2="38" y2="33" stroke="url(#cat-luggage-gold-grad)" strokeWidth="1" strokeDasharray="3 2" />
    {/* Corner Protectors */}
    <rect x="10" y="14" width="4" height="4" fill="url(#cat-luggage-gold-grad)" />
    <rect x="34" y="14" width="4" height="4" fill="url(#cat-luggage-gold-grad)" />
    <rect x="10" y="38" width="4" height="4" fill="url(#cat-luggage-gold-grad)" />
    <rect x="34" y="38" width="4" height="4" fill="url(#cat-luggage-gold-grad)" />
    {/* Dual Casters */}
    <circle cx="15" cy="43" r="1.8" fill="url(#cat-luggage-gold-grad)" />
    <circle cx="33" cy="43" r="1.8" fill="url(#cat-luggage-gold-grad)" />
  </svg>
);

/** 5. 하이엔드 워치 각인 아이콘 */
export const EngravedWatchIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-8 h-8',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-watch" />
    {/* Bracelet Top & Bottom */}
    <path d="M19 12V6H29V12" stroke="url(#cat-watch-gold-grad)" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M19 36V42H29V36" stroke="url(#cat-watch-gold-grad)" strokeWidth="1.6" strokeLinecap="round" />
    {/* Watch Bezel Body */}
    <circle
      cx="24"
      cy="24"
      r="13"
      fill="#252525"
      stroke="url(#cat-watch-gold-grad)"
      strokeWidth="1.8"
      filter="url(#cat-watch-deboss-filter)"
    />
    <circle cx="24" cy="24" r="10" stroke="#7A6136" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    {/* Chrono Hands */}
    <polyline points="24 17 24 24 28 28" stroke="#DFCA9B" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="24" cy="24" r="1.2" fill="#DFCA9B" />
  </svg>
);

/** 6. 럭셔리 지갑 각인 아이콘 */
export const EngravedWalletIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-8 h-8',
  active = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-category ${className}`}
    {...props}
  >
    <EngravedDefs prefix="cat-wallet" />
    {/* Wallet Body */}
    <rect
      x="8"
      y="14"
      width="32"
      height="22"
      rx="3"
      fill="#252525"
      stroke="url(#cat-wallet-gold-grad)"
      strokeWidth="1.6"
      filter="url(#cat-wallet-deboss-filter)"
    />
    {/* Fastener Tab */}
    <path
      d="M26 20H38V28H26C24.5 28 24.5 20 26 20Z"
      fill="#2E2C2A"
      stroke="url(#cat-wallet-gold-grad)"
      strokeWidth="1.2"
    />
    {/* Clasp Snap */}
    <circle cx="32" cy="24" r="1.5" fill="#DFCA9B" stroke="#7A6136" strokeWidth="0.4" />
    {/* Perimeter Stitching Line */}
    <rect x="10.5" y="16.5" width="27" height="17" rx="1.5" stroke="#7A6136" strokeWidth="0.6" strokeDasharray="2 1.5" />
  </svg>
);
