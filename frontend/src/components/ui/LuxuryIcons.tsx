import React from 'react';

// ============================================================================
// LuxuryRental Precision Metal Engraving & Embossed Emblem Design System
// Palette:
//   - Deep Graphite: #252525
//   - Muted Champagne Gold: #B49A67
//   - Antique Brass: #A88C60
//   - Soft Platinum: #A6A8AA
//   - Ivory Surface: #F5F2ED
//   - Subtle Shadow: rgba(0, 0, 0, 0.12)
// ============================================================================

export interface EngravedIconProps {
  className?: string;
  size?: number;
}

// ----------------------------------------------------------------------------
// 1. Main Action Service Card Icons (렌트하기, 구매하기, 판매하기, 회원가입 이벤트)
// ----------------------------------------------------------------------------

/**
 * 렌트하기 (Luxury Haute Couture Atelier Engraving)
 * 정교한 오뜨 꾸뛰르 실루엣, 샴페인 골드 행거 넥, 미세 드레이프 각인 라인
 */
export const LuxuryDressIcon: React.FC<EngravedIconProps> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldEtch" x1="12" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C9B07A" />
        <stop offset="50%" stopColor="#A88C60" />
        <stop offset="100%" stopColor="#8C734B" />
      </linearGradient>
      <filter id="engraveShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    {/* Background Embossed Shield */}
    <circle cx="24" cy="24" r="21" fill="#F8F6F1" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="18.5" fill="none" stroke="#B49A67" strokeWidth="0.6" strokeDasharray="1.5 1.5" strokeOpacity="0.6" />
    
    {/* Atelier Hanger Hook */}
    <path d="M24 8.5C24 7.2 24.9 6.5 25.8 6.5C26.8 6.5 27.5 7.3 27.5 8.2C27.5 9.5 25.8 10.5 24 11.5V13.5" 
      stroke="url(#goldEtch)" strokeWidth="1.6" strokeLinecap="round" />
    
    {/* Bodice & Shoulders */}
    <path d="M18 14.5L24 16.5L30 14.5L32.5 18L30 22.5H18L15.5 18L18 14.5Z" 
      fill="#252525" stroke="#252525" strokeWidth="1.2" strokeLinejoin="round" />
    
    {/* Inner Chiffon V-Neck Etch */}
    <path d="M21 14.8L24 19L27 14.8" stroke="#B49A67" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

    {/* Flared Gown Silhouette */}
    <path d="M18.5 22.5L13.5 39.5C18.5 38 29.5 38 34.5 39.5L29.5 22.5H18.5Z" 
      fill="#252525" fillOpacity="0.88" stroke="#252525" strokeWidth="1.2" strokeLinejoin="round" filter="url(#engraveShadow)" />

    {/* Precision Pleats & Drapery Inward Incisions */}
    <path d="M21.5 23L19.5 38.5" stroke="#B49A67" strokeWidth="0.8" strokeOpacity="0.75" />
    <path d="M24 22.5V38.2" stroke="#E6D3A3" strokeWidth="0.9" />
    <path d="M26.5 23L28.5 38.5" stroke="#B49A67" strokeWidth="0.8" strokeOpacity="0.75" />
    
    {/* Waistline Belt Seal */}
    <rect x="18" y="21.5" width="12" height="1.8" rx="0.9" fill="#B49A67" />
  </svg>
);

/**
 * 구매하기 (Luxury Structured Handbag Engraving)
 * 정교한 턴락 잠금장치, 샴페인 골드 아치 핸들, 사각 더블스티치 가죽 각인
 */
export const LuxuryBagIcon: React.FC<EngravedIconProps> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldEtch2" x1="14" y1="8" x2="34" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C9B07A" />
        <stop offset="50%" stopColor="#B49A67" />
        <stop offset="100%" stopColor="#8C734B" />
      </linearGradient>
    </defs>
    {/* Outer Embossed Ring */}
    <circle cx="24" cy="24" r="21" fill="#F8F6F1" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="18.5" fill="none" stroke="#B49A67" strokeWidth="0.6" strokeDasharray="1.5 1.5" strokeOpacity="0.6" />

    {/* Rigid Arch Handle */}
    <path d="M18.5 17V12C18.5 8.96 20.96 6.5 24 6.5C27.04 6.5 29.5 8.96 29.5 12V17" 
      stroke="url(#goldEtch2)" strokeWidth="1.8" strokeLinecap="round" />
    
    {/* Handle Attach Buckles */}
    <rect x="17.2" y="15.8" width="2.6" height="3" rx="0.6" fill="#A88C60" />
    <rect x="28.2" y="15.8" width="2.6" height="3" rx="0.6" fill="#A88C60" />

    {/* Structured Trapezoid Bag Body */}
    <path d="M12 18.5H36L38.5 38.5C38.5 39.6 37.6 40.5 36.5 40.5H11.5C10.4 40.5 9.5 39.6 9.5 38.5L12 18.5Z" 
      fill="#252525" stroke="#252525" strokeWidth="1.2" strokeLinejoin="round" />

    {/* Flap & Saddle Stitch Contour */}
    <path d="M12 18.5L13.8 29.5C14 30.5 14.8 31.2 15.8 31.2H32.2C33.2 31.2 34 30.5 34.2 29.5L36 18.5" 
      fill="#2C2B2A" stroke="#B49A67" strokeWidth="0.9" strokeLinejoin="round" />
    
    {/* Center Turn-lock Clasp */}
    <ellipse cx="24" cy="29.5" rx="3.2" ry="2.2" fill="#C9B07A" stroke="#8C734B" strokeWidth="0.7" />
    <rect x="23.2" y="28.4" width="1.6" height="2.2" rx="0.4" fill="#252525" />
    
    {/* Base Feet Studs */}
    <circle cx="14" cy="39.5" r="0.8" fill="#B49A67" />
    <circle cx="34" cy="39.5" r="0.8" fill="#B49A67" />
  </svg>
);

/**
 * 판매하기 (Luxury Concierge Consignment Partnership Crest)
 * 정교한 월계수·파트너십 양각 엠블럼과 금속 인장
 */
export const LuxuryHandshakeIcon: React.FC<EngravedIconProps> = ({ className = "w-11 h-11" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldEtch3" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C9B07A" />
        <stop offset="50%" stopColor="#B49A67" />
        <stop offset="100%" stopColor="#8C734B" />
      </linearGradient>
    </defs>
    {/* Outer Embossed Seal */}
    <circle cx="24" cy="24" r="21" fill="#F8F6F1" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="18.5" fill="none" stroke="#B49A67" strokeWidth="0.6" strokeDasharray="1.5 1.5" strokeOpacity="0.6" />

    {/* Concentric Medal Ring */}
    <circle cx="24" cy="24" r="15" fill="#252525" stroke="#B49A67" strokeWidth="1" />

    {/* Refined Interlocking Hands (Stylized Concierge Seal) */}
    {/* Left Hand Cuff */}
    <path d="M14 26L18 22L21 24.5L17.5 29L14 26Z" fill="#B49A67" />
    {/* Right Hand Cuff */}
    <path d="M34 22L30 26L26.5 23.5L30.5 19L34 22Z" fill="#C9B07A" />
    
    {/* Interlocking Clasped Fingers */}
    <path d="M19 23.5L23.5 20C24.5 19.2 25.8 19.5 26.5 20.5L28 22.5L25 25.5L22.5 24L19 23.5Z" 
      fill="#E6D3A3" stroke="#252525" strokeWidth="0.5" />
    <path d="M22.5 24.5L25 27.5C25.8 28.5 27.2 28.8 28.2 28L30 26.5L28 23.5L25 25.5L22.5 24.5Z" 
      fill="#C9B07A" stroke="#252525" strokeWidth="0.5" />

    {/* Surrounding Delicate Laurel Leaf Engravings */}
    <path d="M16 16.5C18 15 20.5 14.5 24 14.5C27.5 14.5 30 15 32 16.5" 
      stroke="#B49A67" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1 2" />
    <path d="M16 31.5C18 33 20.5 33.5 24 33.5C27.5 33.5 30 33 32 31.5" 
      stroke="#B49A67" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1 2" />
  </svg>
);

/**
 * 회원가입 이벤트 (Faceted Diamond Gift Medallion)
 * 기하학적 패싯 기프트 박스, 양각 리본 각인
 */
export const LuxuryGiftIcon: React.FC<EngravedIconProps> = ({ className = "w-7 h-7" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="giftGold" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#DFCA9B" />
        <stop offset="60%" stopColor="#B49A67" />
        <stop offset="100%" stopColor="#8C734B" />
      </linearGradient>
    </defs>
    {/* Bow Loops with Precision Facets */}
    <path d="M12 7.2C10.8 5 8 4 6.8 5.2C5.5 6.5 6.8 8.8 12 7.8Z" 
      fill="url(#giftGold)" stroke="#6E5630" strokeWidth="0.5" />
    <path d="M12 7.2C13.2 5 16 4 17.2 5.2C18.5 6.5 17.2 8.8 12 7.8Z" 
      fill="url(#giftGold)" stroke="#6E5630" strokeWidth="0.5" />
    <circle cx="12" cy="7.5" r="1.2" fill="#EADBB8" />

    {/* Gift Box Lid */}
    <rect x="3.5" y="8" width="17" height="3.5" rx="0.8" fill="#252525" stroke="#B49A67" strokeWidth="0.8" />
    {/* Lid Center Ribbon */}
    <rect x="10.8" y="8" width="2.4" height="3.5" fill="url(#giftGold)" />

    {/* Gift Box Body */}
    <path d="M4.5 11.5H19.5V19.2C19.5 20 18.8 20.7 18 20.7H6C5.2 20.7 4.5 20 4.5 19.2V11.5Z" 
      fill="#252525" stroke="#B49A67" strokeWidth="0.8" />
    {/* Vertical Body Ribbon */}
    <rect x="10.8" y="11.5" width="2.4" height="9.2" fill="url(#giftGold)" />
    
    {/* Delicate Micro Highlight Line */}
    <line x1="5.5" y1="13" x2="9.8" y2="13" stroke="#B49A67" strokeWidth="0.5" strokeOpacity="0.4" />
  </svg>
);

// ----------------------------------------------------------------------------
// 2. Main 8-Grid Menu Icons (일관된 24x24 뷰포트, 정밀 음각·메탈 각인)
// ----------------------------------------------------------------------------

/** 1. 렌트 소개: 부티크 샴페인 브라스 옷걸이 각인 */
export const MenuHangerIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.5C12 3.4 12.8 2.5 13.8 2.5C14.8 2.5 15.5 3.2 15.5 4C15.5 5.2 14 6.2 12 7.2V9.5" 
      stroke="#B49A67" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 9.5L3.8 15.2C3.2 15.6 3.5 16.5 4.2 16.5H19.8C20.5 16.5 20.8 15.6 20.2 15.2L12 9.5Z" 
      fill="#252525" stroke="#B49A67" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M6 16.5H18" stroke="#DFCA9B" strokeWidth="1" strokeLinecap="round" />
    <circle cx="12" cy="13" r="0.8" fill="#B49A67" />
  </svg>
);

/** 2. 70% 할인: 정교한 프리미엄 각인 가격 태그 */
export const MenuTagIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.8 2.8H4.2C3.4 2.8 2.8 3.4 2.8 4.2V11.8C2.8 12.2 3 12.6 3.3 12.9L12.5 22.1C13.1 22.7 14.1 22.7 14.7 22.1L22.1 14.7C22.7 14.1 22.7 13.1 22.1 12.5L12.9 3.3C12.6 3 12.2 2.8 11.8 2.8Z" 
      fill="#252525" stroke="#B49A67" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Brass Grommet */}
    <circle cx="7" cy="7" r="1.8" fill="#F8F6F1" stroke="#B49A67" strokeWidth="1.2" />
    {/* Inner % Engraving Symbol */}
    <circle cx="12.5" cy="12.5" r="0.8" fill="#DFCA9B" />
    <line x1="16.5" y1="10.5" x2="11.5" y2="15.5" stroke="#DFCA9B" strokeWidth="1" strokeLinecap="round" />
    <circle cx="15.5" cy="13.5" r="0.8" fill="#DFCA9B" />
  </svg>
);

/** 3. 오늘신규입고: 하이엔드 워치 다이얼 각인 */
export const MenuClockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Watch Bezel Outer Ring */}
    <circle cx="12" cy="12" r="9.2" fill="#252525" stroke="#B49A67" strokeWidth="1.4" />
    {/* Inner Dial Track */}
    <circle cx="12" cy="12" r="7" stroke="#A88C60" strokeWidth="0.6" strokeDasharray="1.2 1.2" />
    {/* Hour Markers (12, 3, 6, 9) */}
    <line x1="12" y1="5.5" x2="12" y2="6.8" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="18.5" y1="12" x2="17.2" y2="12" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="18.5" x2="12" y2="17.2" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="5.5" y1="12" x2="6.8" y2="12" stroke="#DFCA9B" strokeWidth="1.2" strokeLinecap="round" />
    {/* Watch Hands */}
    <line x1="12" y1="12" x2="12" y2="8" stroke="#DFCA9B" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="12" y1="12" x2="15.2" y2="13.5" stroke="#DFCA9B" strokeWidth="1" strokeLinecap="round" />
    {/* Center Pin */}
    <circle cx="12" cy="12" r="1" fill="#DFCA9B" />
  </svg>
);

/** 4. 베이직멤버십: 프리미엄 메탈 멤버십 카드 각인 */
export const MenuMembershipIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="5.2" width="19" height="13.6" rx="2" fill="#252525" stroke="#B49A67" strokeWidth="1.2" />
    {/* Magnetic Strip */}
    <line x1="2.5" y1="9" x2="21.5" y2="9" stroke="#161616" strokeWidth="1.6" />
    {/* Smart Chip Engraving */}
    <rect x="5.5" y="11.5" width="3.2" height="2.6" rx="0.5" fill="#DFCA9B" stroke="#8C734B" strokeWidth="0.5" />
    {/* Subtle Card Embossed Number Lines */}
    <line x1="11" y1="13.5" x2="18.5" y2="13.5" stroke="#B49A67" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="14" y1="15.5" x2="18.5" y2="15.5" stroke="#B49A67" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

/** 5. 렌트잇 케어: 금속 보증 엠블럼 & 쉴드 크레스트 */
export const MenuCareIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Crest */}
    <path d="M12 21.5C12 21.5 19.5 17.5 19.5 10.5V5.2L12 2.5L4.5 5.2V10.5C4.5 17.5 12 21.5 12 21.5Z" 
      fill="#252525" stroke="#B49A67" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Inner Concentric Shield */}
    <path d="M12 18.5C12 18.5 17 15.5 17 10.8V6.8L12 5L7 6.8V10.8C7 15.5 12 18.5 12 18.5Z" 
      stroke="#A88C60" strokeWidth="0.7" strokeOpacity="0.6" />
    {/* Center Authentication Star / Facet */}
    <path d="M12 8L13 10.5H15.5L13.5 12L14.2 14.5L12 13L9.8 14.5L10.5 12L8.5 10.5H11L12 8Z" 
      fill="#DFCA9B" stroke="#8C734B" strokeWidth="0.4" />
  </svg>
);

/** 6. VIP: 미니멀 임페리얼 크레스트 코로넷 문양 */
export const MenuVipIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crown Base */}
    <path d="M3.5 17.8C8 17.2 16 17.2 20.5 17.8L19.2 19.5H4.8L3.5 17.8Z" 
      fill="#B49A67" stroke="#8C734B" strokeWidth="0.6" />
    {/* Crown Body with 5 Refined Peaks */}
    <path d="M4 17L5.5 9L9.5 13.5L12 6.5L14.5 13.5L18.5 9L20 17H4Z" 
      fill="#252525" stroke="#B49A67" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Pearl / Gem Finials on Peaks */}
    <circle cx="5.5" cy="8.2" r="1.1" fill="#DFCA9B" />
    <circle cx="12" cy="5.5" r="1.3" fill="#DFCA9B" />
    <circle cx="18.5" cy="8.2" r="1.1" fill="#DFCA9B" />
    {/* Center Diamond Emboss */}
    <polygon points="12,11 13.5,13.5 12,16 10.5,13.5" fill="#DFCA9B" stroke="#6E5630" strokeWidth="0.4" />
  </svg>
);

/** 7. 바이백: 순환·교환 인피니티 럭셔리 엠블럼 */
export const MenuBuybackIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top Clockwise Arch */}
    <path d="M19.5 11C19.2 7 15.8 4 12 4C9.5 4 7.2 5.2 5.8 7.2L3.5 9.5" 
      stroke="#B49A67" strokeWidth="1.4" strokeLinecap="round" />
    <polyline points="3.5 5.5 3.5 9.5 7.5 9.5" stroke="#DFCA9B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom Counter-clockwise Arch */}
    <path d="M4.5 13C4.8 17 8.2 20 12 20C14.5 20 16.8 18.8 18.2 16.8L20.5 14.5" 
      stroke="#B49A67" strokeWidth="1.4" strokeLinecap="round" />
    <polyline points="20.5 18.5 20.5 14.5 16.5 14.5" stroke="#DFCA9B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Center Faceted Diamond */}
    <polygon points="12,9.2 14.5,12 12,14.8 9.5,12" fill="#252525" stroke="#DFCA9B" strokeWidth="1" />
  </svg>
);

/** 8. 친구 초대: 각인된 왁스 실 초대장 문양 */
export const MenuInviteIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Deckle Edge Envelope */}
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="#252525" stroke="#B49A67" strokeWidth="1.2" />
    {/* Flap Fold */}
    <path d="M3.5 6.2L12 12.8L20.5 6.2" stroke="#B49A67" strokeWidth="1.2" strokeLinecap="round" />
    {/* Wax Seal Medallion */}
    <circle cx="12" cy="12.8" r="2.8" fill="#B49A67" stroke="#6E5630" strokeWidth="0.6" />
    <circle cx="12" cy="12.8" r="1.8" fill="#DFCA9B" />
    {/* Monogram Monad */}
    <path d="M11.3 12.8L12 11.8L12.7 12.8L12 13.8L11.3 12.8Z" fill="#252525" />
  </svg>
);

// ----------------------------------------------------------------------------
// 3. Category Feature Silhouettes (슈즈, 주얼리, 의류, 러기지)
// ----------------------------------------------------------------------------

export const LuxurySneakerIcon = ({ className = "w-8 h-8 text-[#B49A67]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 34C14 34 38 34 42 34C43 34 44 33 43 31L39 19C38 16 35 15 32 16L24 19L14 23L7 28C6 29 6 32 6 34Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M6 34V37C6 38.5 7.5 40 9 40H40C41.5 40 43 38.5 43 37V34" />
    <path d="M20 20L22 27" strokeDasharray="1 1" />
    <path d="M25 19L27 26" strokeDasharray="1 1" />
    <path d="M30 18L32 25" strokeDasharray="1 1" />
  </svg>
);

export const LuxuryJewelryIcon = ({ className = "w-8 h-8 text-[#B49A67]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="28" r="13" fill="currentColor" fillOpacity="0.08" />
    <circle cx="24" cy="28" r="8.5" />
    <polygon points="24,6 29,12 24,17 19,12" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
    <path d="M20 9L28 9" />
  </svg>
);

export const LuxuryCoatIcon = ({ className = "w-8 h-8 text-[#252525]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6L24 16L32 6H38L42 20L36 22L34 42H14L12 22L6 20L10 6H16Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M24 16V42" />
    <path d="M19 24H22" />
    <path d="M19 30H22" />
  </svg>
);

export const LuxuryLuggageIcon = ({ className = "w-10 h-10 text-[#252525]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="14" width="28" height="28" rx="4" fill="currentColor" fillOpacity="0.08" />
    <path d="M19 14V8C19 6.9 19.9 6 21 6H27C28.1 6 29 6.9 29 8V14" />
    <line x1="10" y1="28" x2="38" y2="28" strokeDasharray="3 3" />
    <circle cx="15" cy="43" r="2" fill="currentColor" />
    <circle cx="33" cy="43" r="2" fill="currentColor" />
  </svg>
);

// ----------------------------------------------------------------------------
// 4. Refined Brand Monogram Medallion (각인형 타이포그래피 배지)
// ----------------------------------------------------------------------------

export const BrandMonogram = ({ name, active = false }: { name: string; active?: boolean }) => {
  const getMonogram = (n: string) => {
    switch (n) {
      case '루이비통': return { code: 'LV', font: 'font-serif font-black tracking-widest' };
      case '스톤 아일랜드': return { code: 'SI', font: 'font-mono font-black tracking-wider' };
      case '구찌': return { code: 'GG', font: 'font-serif font-black tracking-widest' };
      case '샤넬': return { code: 'CC', font: 'font-serif font-black tracking-widest' };
      case 'CP 컴퍼니': return { code: 'C.P.', font: 'font-mono font-black tracking-wider' };
      case '셀린느': return { code: 'CEL', font: 'font-sans font-black tracking-widest' };
      case '프라다': return { code: 'PRD', font: 'font-serif font-black tracking-wider' };
      case '디올': return { code: 'CD', font: 'font-serif font-black tracking-widest' };
      case '에르메스': return { code: 'H', font: 'font-serif font-black tracking-widest' };
      case '보테가 베네타': return { code: 'BV', font: 'font-sans font-black tracking-wider' };
      case '생로랑': return { code: 'YSL', font: 'font-serif font-black tracking-widest' };
      case '발렌시아가': return { code: 'BB', font: 'font-sans font-black tracking-widest' };
      case '롤렉스': return { code: 'RLX', font: 'font-serif font-black tracking-wider' };
      case '까르띠에': return { code: 'CRT', font: 'font-serif font-black tracking-widest' };
      default: return { code: n.slice(0, 2).toUpperCase(), font: 'font-sans font-black' };
    }
  };

  const info = getMonogram(name);

  return (
    <div 
      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
        active 
          ? 'bg-[#252525] text-[#DFCA9B] shadow-md ring-2 ring-[#B49A67]' 
          : 'bg-[#F9F8F6] text-[#252525] border border-[#E5E1D8] hover:border-[#B49A67] hover:bg-[#F2EFE9]'
      }`}
    >
      {/* Concentric Engraved Ring */}
      <div className={`absolute inset-1 rounded-full border pointer-events-none transition-colors ${
        active ? 'border-[#B49A67]/40' : 'border-[#D9D3C7]/60'
      }`} />
      
      <span className={`text-[14px] select-none ${info.font}`}>
        {info.code}
      </span>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 5. Product Vault Watermark Badge (투명하고 정갈한 로딩/대체 배지)
// ----------------------------------------------------------------------------

export const ProductVisualBadge = ({ 
  brand = "", 
  category = "bag",
  className = "w-full h-full"
}: { 
  brand?: string; 
  category?: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  className?: string;
}) => {
  return (
    <div className={`${className} bg-gradient-to-b from-[#FAF8F5] via-[#F4F1EA] to-[#EAE6DD] flex flex-col items-center justify-center relative p-4 transition-transform duration-300`}>
      <div className="absolute inset-2 border border-[#B49A67]/20 rounded-xl pointer-events-none" />
      <div className="text-[#8C734B]/60 flex items-center justify-center mb-1">
        {category === 'shoes' && <LuxurySneakerIcon className="w-12 h-12" />}
        {category === 'jewelry' && <LuxuryJewelryIcon className="w-12 h-12" />}
        {category === 'clothing' && <LuxuryCoatIcon className="w-12 h-12" />}
        {category === 'bag' && <LuxuryBagIcon className="w-12 h-12" />}
        {category === 'wallet' && (
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="14" width="32" height="22" rx="3" fill="currentColor" fillOpacity="0.08" />
            <path d="M26 21H38V29H26C24.5 29 24.5 21 26 21Z" fill="currentColor" fillOpacity="0.18" />
            <circle cx="32" cy="25" r="1.5" fill="currentColor" />
          </svg>
        )}
        {category === 'watch' && (
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="12" fill="currentColor" fillOpacity="0.08" />
            <polyline points="24 16 24 24 28 28" />
            <path d="M19 12V6H29V12" />
            <path d="M19 36V42H29V36" />
          </svg>
        )}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-[#8C734B] font-extrabold font-mono mt-1">
        {brand || 'LUXURY RENTAL'}
      </span>
      <span className="text-[8px] text-[#A6A8AA] font-semibold tracking-tight mt-0.5">
        STUDIO CURATION
      </span>
    </div>
  );
};

/**
 * 관리자 공식 엠블럼 (Luxury Regal Crown Engraving)
 * 정교한 5개 첨탑, 샴페인 골드 & 앤틱 브라스 각인 아치 및 펄 피니얼
 */
export const LuxuryCrownIcon: React.FC<EngravedIconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="crownGold" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#DFCA8D" />
        <stop offset="45%" stopColor="#B49A67" />
        <stop offset="100%" stopColor="#8C734B" />
      </linearGradient>
    </defs>
    {/* Base Band with Inset Jewel Etchings */}
    <path d="M4 17.5C4 16.95 4.45 16.5 5 16.5H19C19.55 16.5 20 16.95 20 17.5V18.5C20 19.05 19.55 19.5 19 19.5H5C4.45 19.5 4 19.05 4 18.5V17.5Z" 
      fill="url(#crownGold)" stroke="#7D653E" strokeWidth="0.6" />
    <circle cx="8" cy="18" r="0.8" fill="#FFFFFF" />
    <circle cx="12" cy="18" r="0.9" fill="#FFFFFF" />
    <circle cx="16" cy="18" r="0.8" fill="#FFFFFF" />

    {/* Crown Spikes and Diadem Silhouette */}
    <path d="M4.5 16.5L3.5 8.5L8.5 12.5L12 5.5L15.5 12.5L20.5 8.5L19.5 16.5H4.5Z" 
      fill="url(#crownGold)" stroke="#7D653E" strokeWidth="0.8" strokeLinejoin="round" />

    {/* Inner Chiseled Relief Lines */}
    <path d="M12 7.5L10 13H14L12 7.5Z" fill="#F4E8C1" fillOpacity="0.4" />
    <path d="M8.5 13.5L5.8 10L6.5 16H9.5L8.5 13.5Z" fill="#7D653E" fillOpacity="0.15" />
    <path d="M15.5 13.5L18.2 10L17.5 16H14.5L15.5 13.5Z" fill="#7D653E" fillOpacity="0.15" />

    {/* Pearl Finials on Spikes */}
    <circle cx="3.5" cy="8.5" r="1.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="8.5" cy="12.5" r="1" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="12" cy="5.5" r="1.5" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.6" />
    <circle cx="15.5" cy="12.5" r="1" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
    <circle cx="20.5" cy="8.5" r="1.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.5" />
  </svg>
);
