import React from 'react';
import type { EngravedMenuIconProps } from '../EngravedIcon.types';
import { EngravedDefs } from '../EngravedIconTokens';

/** 1. 렌트 소개: 부티크 샴페인 브라스 옷걸이 각인 */
export const EngravedHangerIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-hanger" />
    <path
      d="M12 4.5C12 3.4 12.8 2.5 13.8 2.5C14.8 2.5 15.5 3.2 15.5 4C15.5 5.2 14 6.2 12 7.2V9.5"
      stroke="url(#mnu-hanger-gold-grad)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M12 9.5L3.8 15.2C3.2 15.6 3.5 16.5 4.2 16.5H19.8C20.5 16.5 20.8 15.6 20.2 15.2L12 9.5Z"
      fill="#252525"
      stroke="url(#mnu-hanger-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#mnu-hanger-deboss-filter)"
    />
    <path d="M6 16.5H18" stroke="#DFCA9B" strokeWidth="1" strokeLinecap="round" />
    <circle cx="12" cy="13" r="0.8" fill="url(#mnu-hanger-gold-grad)" />
  </svg>
);

/** 2. 70% 할인: 정교한 프리미엄 각인 가격 태그 */
export const EngravedTagIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-tag" />
    <path
      d="M11.8 2.8H4.2C3.4 2.8 2.8 3.4 2.8 4.2V11.8C2.8 12.2 3 12.6 3.3 12.9L12.5 22.1C13.1 22.7 14.1 22.7 14.7 22.1L22.1 14.7C22.7 14.1 22.7 13.1 22.1 12.5L12.9 3.3C12.6 3 12.2 2.8 11.8 2.8Z"
      fill="#252525"
      stroke="url(#mnu-tag-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#mnu-tag-deboss-filter)"
    />
    {/* Brass Grommet */}
    <circle cx="7" cy="7" r="1.8" fill="#F8F6F1" stroke="url(#mnu-tag-gold-grad)" strokeWidth="1.2" />
    {/* Inner % Engraving Symbol */}
    <circle cx="12.5" cy="12.5" r="0.8" fill="#DFCA9B" />
    <line x1="16.5" y1="10.5" x2="11.5" y2="15.5" stroke="#DFCA9B" strokeWidth="1" strokeLinecap="round" />
    <circle cx="15.5" cy="13.5" r="0.8" fill="#DFCA9B" />
  </svg>
);

/** 3. 오늘신규입고: 하이엔드 워치 다이얼 각인 */
export const EngravedClockIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-clock" />
    {/* Watch Bezel Outer Ring */}
    <circle
      cx="12"
      cy="12"
      r="9.2"
      fill="#252525"
      stroke="url(#mnu-clock-gold-grad)"
      strokeWidth="1.4"
      filter="url(#mnu-clock-deboss-filter)"
    />
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
export const EngravedMembershipIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-membership" />
    <rect
      x="2.5"
      y="5.2"
      width="19"
      height="13.6"
      rx="2"
      fill="#252525"
      stroke="url(#mnu-membership-gold-grad)"
      strokeWidth="1.2"
      filter="url(#mnu-membership-deboss-filter)"
    />
    {/* Magnetic Strip */}
    <line x1="2.5" y1="9" x2="21.5" y2="9" stroke="#161616" strokeWidth="1.6" />
    {/* Smart Chip Engraving */}
    <rect x="5.5" y="11.5" width="3.2" height="2.6" rx="0.5" fill="#DFCA9B" stroke="#8C734B" strokeWidth="0.5" />
    {/* Subtle Card Embossed Number Lines */}
    <line x1="11" y1="13.5" x2="18.5" y2="13.5" stroke="url(#mnu-membership-gold-grad)" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="14" y1="15.5" x2="18.5" y2="15.5" stroke="url(#mnu-membership-gold-grad)" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

/** 5. 렌트잇 케어: 금속 보증 엠블럼 & 쉴드 크레스트 */
export const EngravedCareIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-care" />
    {/* Shield Crest */}
    <path
      d="M12 21.5C12 21.5 19.5 17.5 19.5 10.5V5.2L12 2.5L4.5 5.2V10.5C4.5 17.5 12 21.5 12 21.5Z"
      fill="#252525"
      stroke="url(#mnu-care-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#mnu-care-deboss-filter)"
    />
    {/* Inner Concentric Shield */}
    <path
      d="M12 18.5C12 18.5 17 15.5 17 10.8V6.8L12 5L7 6.8V10.8C7 15.5 12 18.5 12 18.5Z"
      stroke="#A88C60"
      strokeWidth="0.7"
      strokeOpacity="0.6"
    />
    {/* Center Authentication Star */}
    <path
      d="M12 8L13 10.5H15.5L13.5 12L14.2 14.5L12 13L9.8 14.5L10.5 12L8.5 10.5H11L12 8Z"
      fill="#DFCA9B"
      stroke="#8C734B"
      strokeWidth="0.4"
    />
  </svg>
);

/** 6. VIP: 미니멀 임페리얼 크레스트 코로넷 문양 */
export const EngravedVipIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-vip" />
    {/* Crown Base */}
    <path
      d="M3.5 17.8C8 17.2 16 17.2 20.5 17.8L19.2 19.5H4.8L3.5 17.8Z"
      fill="url(#mnu-vip-gold-grad)"
      stroke="#8C734B"
      strokeWidth="0.6"
    />
    {/* Crown Body with 5 Refined Peaks */}
    <path
      d="M4 17L5.5 9L9.5 13.5L12 6.5L14.5 13.5L18.5 9L20 17H4Z"
      fill="#252525"
      stroke="url(#mnu-vip-gold-grad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#mnu-vip-deboss-filter)"
    />
    {/* Pearl Finials on Peaks */}
    <circle cx="5.5" cy="8.2" r="1.1" fill="#DFCA9B" />
    <circle cx="12" cy="5.5" r="1.3" fill="#DFCA9B" />
    <circle cx="18.5" cy="8.2" r="1.1" fill="#DFCA9B" />
    {/* Center Diamond Emboss */}
    <polygon points="12,11 13.5,13.5 12,16 10.5,13.5" fill="#DFCA9B" stroke="#6E5630" strokeWidth="0.4" />
  </svg>
);

/** 7. 바이백: 순환·교환 인피니티 럭셔리 엠블럼 */
export const EngravedBuybackIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-buyback" />
    {/* Top Clockwise Arch */}
    <path
      d="M19.5 11C19.2 7 15.8 4 12 4C9.5 4 7.2 5.2 5.8 7.2L3.5 9.5"
      stroke="url(#mnu-buyback-gold-grad)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <polyline points="3.5 5.5 3.5 9.5 7.5 9.5" stroke="#DFCA9B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom Counter-clockwise Arch */}
    <path
      d="M4.5 13C4.8 17 8.2 20 12 20C14.5 20 16.8 18.8 18.2 16.8L20.5 14.5"
      stroke="url(#mnu-buyback-gold-grad)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <polyline points="20.5 18.5 20.5 14.5 16.5 14.5" stroke="#DFCA9B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Center Faceted Diamond */}
    <polygon points="12,9.2 14.5,12 12,14.8 9.5,12" fill="#252525" stroke="#DFCA9B" strokeWidth="1" filter="url(#mnu-buyback-deboss-filter)" />
  </svg>
);

/** 8. 친구 초대: 각인된 왁스 실 초대장 문양 */
export const EngravedInviteIcon: React.FC<EngravedMenuIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`luxury-engraved-icon luxury-engraved-menu ${active ? 'is-active' : ''} ${className}`}
  >
    <EngravedDefs prefix="mnu-invite" />
    {/* Deckle Edge Envelope */}
    <rect
      x="3"
      y="5.5"
      width="18"
      height="13"
      rx="1.5"
      fill="#252525"
      stroke="url(#mnu-invite-gold-grad)"
      strokeWidth="1.2"
      filter="url(#mnu-invite-deboss-filter)"
    />
    {/* Flap Fold */}
    <path d="M3.5 6.2L12 12.8L20.5 6.2" stroke="url(#mnu-invite-gold-grad)" strokeWidth="1.2" strokeLinecap="round" />
    {/* Wax Seal Medallion */}
    <circle cx="12" cy="12.8" r="2.8" fill="url(#mnu-invite-gold-grad)" stroke="#6E5630" strokeWidth="0.6" />
    <circle cx="12" cy="12.8" r="1.8" fill="#DFCA9B" />
    {/* Monogram Diamond Point */}
    <path d="M11.3 12.8L12 11.8L12.7 12.8L12 13.8L11.3 12.8Z" fill="#252525" />
  </svg>
);
