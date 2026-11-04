import React from 'react';

// ============================================================================
// 1. Action Card Luxury Icons (렌트, 구매, 위탁판매)
// ============================================================================

/** 드레스/오뜨 꾸뛰르 실루엣 (렌트하기) */
export const LuxuryDressIcon = ({ className = "w-8 h-8 text-pink-500" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 6L24 14L29 6" />
    <path d="M18 6C15 6 13 9 14 13L16 20C17 21 19 22 21 22H27C29 22 31 21 32 20L34 13C35 9 33 6 30 6" />
    <path d="M21 22L13 42H35L27 22" fill="currentColor" fillOpacity="0.12" />
    <path d="M13 42C18 39 30 39 35 42" />
    <path d="M24 14V22" />
  </svg>
);

/** 럭셔리 토트/핸드백 실루엣 (구매하기) */
export const LuxuryBagIcon = ({ className = "w-8 h-8 text-blue-500" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 16V11C18 7.7 20.7 5 24 5C27.3 5 30 7.7 30 11V16" />
    <rect x="8" y="16" width="32" height="26" rx="4" fill="currentColor" fillOpacity="0.1" />
    <path d="M14 16V22" />
    <path d="M34 16V22" />
    <circle cx="24" cy="25" r="2.5" fill="currentColor" />
    <path d="M8 25C16 27 32 27 40 25" strokeDasharray="2 2" />
  </svg>
);

/** 컨시어지/위탁 파트너십 실루엣 (판매하기) */
export const LuxuryHandshakeIcon = ({ className = "w-8 h-8 text-emerald-600" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 26L7 20L17 10L27 19L20 26L27 33L37 23L42 28L31 39L24 32L14 42L6 34L14 26Z" fill="currentColor" fillOpacity="0.12" />
    <path d="M18 19L22 23" />
    <path d="M22 15L26 19" />
    <path d="M26 11L30 15" />
    <circle cx="24" cy="24" r="18" strokeDasharray="3 3" strokeOpacity="0.3" />
  </svg>
);

/** 리본 기프트 박스 실루엣 (이벤트) */
export const LuxuryGiftIcon = ({ className = "w-6 h-6 text-amber-300" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 8V21" />
    <path d="M5 12V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12" />
    <path d="M12 8C10.5 5 7.5 4 6 5.5C4.5 7 5.5 8 12 8Z" fill="currentColor" fillOpacity="0.3" />
    <path d="M12 8C13.5 5 16.5 4 18 5.5C19.5 7 18.5 8 12 8Z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// ============================================================================
// 2. 8-Grid Menu Icons
// ============================================================================

export const MenuHangerIcon = () => (
  <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7V10L3 17C2.5 17.5 3 18.5 4 18.5H20C21 18.5 21.5 17.5 21 17L12 10" />
  </svg>
);

export const MenuTagIcon = () => (
  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2V12L13 23L23 13L12 2Z" />
    <circle cx="7" cy="7" r="2" fill="currentColor" />
  </svg>
);

export const MenuClockIcon = () => (
  <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
    <path d="M19 4L22 7" strokeWidth="1.5" />
  </svg>
);

export const MenuMembershipIcon = () => (
  <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="7" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

export const MenuCareIcon = () => (
  <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22S4 17 4 11V5L12 2L20 5V11C20 17 12 22 12 22Z" />
    <path d="M9 12L11 14L15 10" />
  </svg>
);

export const MenuVipIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18L5 8L10 13L12 6L14 13L19 8L21 18H3Z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="5" cy="7" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="19" cy="7" r="1" fill="currentColor" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const MenuBuybackIcon = () => (
  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
    <path d="M3 3V8H8" />
    <path d="M3 12A9 9 0 0 0 18 18.7L21 16" />
    <path d="M16 16H21V21" />
  </svg>
);

export const MenuInviteIcon = () => (
  <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7L12 13L2 7" />
    <path d="M18 14L15 17L12 14" strokeWidth="1.5" />
  </svg>
);

// ============================================================================
// 3. Category Feature & Product Silhouettes (슈즈, 주얼리, 의류, 트래블백 등)
// ============================================================================

/** 스니커즈 / 슈즈 */
export const LuxurySneakerIcon = ({ className = "w-8 h-8 text-neutral-800" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 34C14 34 38 34 42 34C43 34 44 33 43 31L39 19C38 16 35 15 32 16L24 19L14 23L7 28C6 29 6 32 6 34Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M6 34V37C6 38.5 7.5 40 9 40H40C41.5 40 43 38.5 43 37V34" />
    <path d="M20 20L22 27" />
    <path d="M25 19L27 26" />
    <path d="M30 18L32 25" />
  </svg>
);

/** 럭셔리 링 / 주얼리 */
export const LuxuryJewelryIcon = ({ className = "w-8 h-8 text-amber-500" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="28" r="14" fill="currentColor" fillOpacity="0.08" />
    <circle cx="24" cy="28" r="9" />
    <polygon points="24,6 29,12 24,17 19,12" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
    <path d="M20 9L28 9" />
  </svg>
);

/** 럭셔리 재킷 / 코트 */
export const LuxuryCoatIcon = ({ className = "w-8 h-8 text-neutral-700" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6L24 16L32 6H38L42 20L36 22L34 42H14L12 22L6 20L10 6H16Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M24 16V42" />
    <path d="M19 24H22" />
    <path d="M19 30H22" />
  </svg>
);

/** 럭셔리 러기지 / 트래블 백 (발렌시아가 New Arrivals) */
export const LuxuryLuggageIcon = ({ className = "w-10 h-10 text-neutral-800" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="14" width="28" height="28" rx="4" fill="currentColor" fillOpacity="0.08" />
    <path d="M19 14V8C19 6.9 19.9 6 21 6H27C28.1 6 29 6.9 29 8V14" />
    <line x1="10" y1="28" x2="38" y2="28" strokeDasharray="3 3" />
    <circle cx="15" cy="43" r="2" fill="currentColor" />
    <circle cx="33" cy="43" r="2" fill="currentColor" />
  </svg>
);

// ============================================================================
// 4. Brand Monogram Typography Badges (루이비통, 구찌, 샤넬 등)
// ============================================================================

export const BrandMonogram = ({ name, active = false }: { name: string; active?: boolean }) => {
  const getMonogram = (n: string) => {
    switch (n) {
      case '루이비통': return { code: 'LV', serif: true, font: 'font-serif' };
      case '스톤 아일랜드': return { code: 'SI', serif: false, font: 'font-mono' };
      case '구찌': return { code: 'GG', serif: true, font: 'font-serif' };
      case '샤넬': return { code: 'CC', serif: true, font: 'font-serif' };
      case 'CP 컴퍼니': return { code: 'C.P.', serif: false, font: 'font-mono' };
      case '셀린느': return { code: 'CEL', serif: false, font: 'font-sans' };
      default: return { code: n.slice(0, 2).toUpperCase(), serif: false, font: 'font-sans' };
    }
  };

  const info = getMonogram(name);

  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
      active 
        ? 'border-2 border-blue-600 bg-blue-50 shadow-sm' 
        : 'border border-gray-200 bg-gray-50/80 hover:bg-gray-100'
    }`}>
      <span className={`text-[15px] font-black tracking-wider ${info.font} ${
        active ? 'text-blue-600' : 'text-gray-800'
      }`}>
        {info.code}
      </span>
    </div>
  );
};

// ============================================================================
// 5. Product Item High-Quality Visual Placeholder
// ============================================================================

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
    <div className={`${className} bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-200/90 flex flex-col items-center justify-center relative p-4 group-hover:scale-105 transition-transform duration-300`}>
      <div className="absolute inset-2 border border-neutral-300/40 rounded-lg pointer-events-none" />
      <div className="text-neutral-400 group-hover:text-neutral-700 transition-colors">
        {category === 'shoes' && <LuxurySneakerIcon className="w-14 h-14" />}
        {category === 'jewelry' && <LuxuryJewelryIcon className="w-14 h-14" />}
        {category === 'clothing' && <LuxuryCoatIcon className="w-14 h-14" />}
        {category === 'bag' && <LuxuryBagIcon className="w-14 h-14 text-neutral-400" />}
        {category === 'wallet' && (
          <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="12" width="32" height="24" rx="3" fill="currentColor" fillOpacity="0.08" />
            <path d="M28 20H40V28H28C26 28 26 20 28 20Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="34" cy="24" r="1.5" fill="currentColor" />
          </svg>
        )}
        {category === 'watch' && (
          <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="12" fill="currentColor" fillOpacity="0.08" />
            <polyline points="24 16 24 24 28 28" />
            <path d="M19 12V6H29V12" />
            <path d="M19 36V42H29V36" />
          </svg>
        )}
      </div>
      {brand && (
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-extrabold mt-2 font-mono">
          {brand}
        </span>
      )}
    </div>
  );
};
