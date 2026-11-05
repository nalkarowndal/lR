import React from 'react';
import type { EngravedIconProps } from '../icons';
import {
  EngravedDressIcon,
  EngravedBagIcon,
  EngravedHandshakeIcon,
  EngravedGiftIcon,
  EngravedHangerIcon,
  EngravedTagIcon,
  EngravedClockIcon,
  EngravedMembershipIcon,
  EngravedCareIcon,
  EngravedVipIcon,
  EngravedBuybackIcon,
  EngravedInviteIcon,
  EngravedSneakerIcon,
  EngravedJewelryIcon,
  EngravedCoatIcon,
  EngravedLuggageIcon,
  EngravedWatchIcon,
  EngravedWalletIcon,
  EngravedCrownEmblem,
  EngravedShieldAdmin,
  EngravedLockIcon,
  EngravedBellIcon,
  EngravedProfileCrest,
  EngravedSparkleTier,
  EngravedMedalEmblem,
  EngravedCameraIcon,
  EngravedAdminHandshake,
  EngravedAdminPlus,
  EngravedAdminChat,
  EngravedAdminUsers,
  EngravedAdminExcel,
  EngravedAdminRefresh,
} from '../icons';

// Re-export all from icons module
export * from '../icons';

// Backwards-compatible aliases
export const LuxuryDressIcon = EngravedDressIcon;
export const LuxuryBagIcon = EngravedBagIcon;
export const LuxuryHandshakeIcon = EngravedHandshakeIcon;
export const LuxuryGiftIcon = EngravedGiftIcon;

export const MenuHangerIcon = EngravedHangerIcon;
export const MenuTagIcon = EngravedTagIcon;
export const MenuClockIcon = EngravedClockIcon;
export const MenuMembershipIcon = EngravedMembershipIcon;
export const MenuCareIcon = EngravedCareIcon;
export const MenuVipIcon = EngravedVipIcon;
export const MenuBuybackIcon = EngravedBuybackIcon;
export const MenuInviteIcon = EngravedInviteIcon;

export const LuxurySneakerIcon = EngravedSneakerIcon;
export const LuxuryJewelryIcon = EngravedJewelryIcon;
export const LuxuryCoatIcon = EngravedCoatIcon;
export const LuxuryLuggageIcon = EngravedLuggageIcon;
export const LuxuryWatchIcon = EngravedWatchIcon;
export const LuxuryWalletIcon = EngravedWalletIcon;
export const LuxuryCrownIcon = EngravedCrownEmblem;

// ----------------------------------------------------------------------------
// Refined Brand Monogram Medallion (각인형 타이포그래피 배지)
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
// Product Vault Watermark Badge (투명하고 정갈한 로딩/대체 배지)
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
        {category === 'shoes' && <EngravedSneakerIcon className="w-12 h-12" />}
        {category === 'jewelry' && <EngravedJewelryIcon className="w-12 h-12" />}
        {category === 'clothing' && <EngravedCoatIcon className="w-12 h-12" />}
        {category === 'bag' && <EngravedBagIcon className="w-12 h-12" />}
        {category === 'wallet' && <EngravedWalletIcon className="w-12 h-12" />}
        {category === 'watch' && <EngravedWatchIcon className="w-12 h-12" />}
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
