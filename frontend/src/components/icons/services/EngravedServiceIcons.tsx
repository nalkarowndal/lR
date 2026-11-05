import React from 'react';
import type { EngravedIconBaseProps } from '../EngravedIcon.types';
import { EngravedDefs } from '../EngravedIconTokens';

/**
 * 렌트하기 (Haute Couture Atelier Satin Metal Deboss)
 * 48x48 뷰포트 기반 정밀 음각 꾸뛰르 드레스 & 샴페인 아치 행거
 */
export const EngravedDressIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-11 h-11',
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
    <EngravedDefs prefix="dress" />
    
    {/* Satin Outer Medallion Plate */}
    <circle cx="24" cy="24" r="22" fill="#F8F7F4" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="19" fill="url(#dress-radial-halo)" stroke="url(#dress-gold-grad)" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />

    {/* Atelier Hanger Hook */}
    <path
      d="M24 7.5C24 6.2 24.9 5.5 25.8 5.5C26.8 5.5 27.5 6.3 27.5 7.2C27.5 8.5 25.8 9.5 24 10.5V12.5"
      stroke="url(#dress-gold-grad)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Bodice & Shoulders Deboss */}
    <path
      d="M18 13.5L24 15.5L30 13.5L32.5 17L30 21.5H18L15.5 17L18 13.5Z"
      fill="#252525"
      stroke="#1C1C1C"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#dress-deboss-filter)"
    />

    {/* Inner Chiffon V-Neck Specular Etch */}
    <path d="M21 13.8L24 18L27 13.8" stroke="url(#dress-gold-grad)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />

    {/* Flared Gown Silhouette with Micro-Bevel */}
    <path
      d="M18.5 21.5L13.5 39.5C18.5 38 29.5 38 34.5 39.5L29.5 21.5H18.5Z"
      fill="#252525"
      fillOpacity="0.92"
      stroke="#1C1C1C"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#dress-deboss-filter)"
    />

    {/* Precision Drapery Incisions */}
    <path d="M21.5 22L19.5 38.5" stroke="#B49A67" strokeWidth="0.85" strokeOpacity="0.8" />
    <path d="M24 21.5V38.2" stroke="#E6D3A3" strokeWidth="0.9" />
    <path d="M26.5 22L28.5 38.5" stroke="#B49A67" strokeWidth="0.85" strokeOpacity="0.8" />

    {/* Satin Gold Waistline Belt Seal */}
    <rect x="18" y="20.5" width="12" height="2" rx="1" fill="url(#dress-gold-grad)" stroke="#8C734B" strokeWidth="0.4" />
  </svg>
);

/**
 * 구매하기 (Structured Handbag Satin Metal Deboss)
 * 48x48 뷰포트 기반 턴락 잠금장치, 사각 가죽 스티치, 아치 핸들
 */
export const EngravedBagIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-11 h-11',
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
    <EngravedDefs prefix="bag" />

    {/* Satin Outer Medallion Plate */}
    <circle cx="24" cy="24" r="22" fill="#F8F7F4" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="19" fill="url(#bag-radial-halo)" stroke="url(#bag-gold-grad)" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />

    {/* Rigid Arch Handle */}
    <path
      d="M18.5 16.5V11.5C18.5 8.46 20.96 6 24 6C27.04 6 29.5 8.46 29.5 11.5V16.5"
      stroke="url(#bag-gold-grad)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Handle Attach Buckles */}
    <rect x="17.2" y="15.2" width="2.6" height="3" rx="0.6" fill="#A88C60" stroke="#7A6136" strokeWidth="0.4" />
    <rect x="28.2" y="15.2" width="2.6" height="3" rx="0.6" fill="#A88C60" stroke="#7A6136" strokeWidth="0.4" />

    {/* Structured Trapezoid Bag Body */}
    <path
      d="M12 18H36L38.5 38.5C38.5 39.6 37.6 40.5 36.5 40.5H11.5C10.4 40.5 9.5 39.6 9.5 38.5L12 18Z"
      fill="#252525"
      stroke="#1C1C1C"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#bag-deboss-filter)"
    />

    {/* Flap & Saddle Stitch Contour */}
    <path
      d="M12 18L13.8 29.2C14 30.2 14.8 31 15.8 31H32.2C33.2 31 34 30.2 34.2 29.2L36 18"
      fill="#2E2C2A"
      stroke="url(#bag-gold-grad)"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />

    {/* Center Turn-lock Clasp */}
    <ellipse cx="24" cy="29.2" rx="3.4" ry="2.3" fill="url(#bag-gold-grad)" stroke="#7A6136" strokeWidth="0.6" />
    <rect x="23.2" y="28.1" width="1.6" height="2.2" rx="0.4" fill="#252525" />

    {/* Base Stud Feet */}
    <circle cx="14" cy="39.2" r="0.9" fill="url(#bag-gold-grad)" />
    <circle cx="34" cy="39.2" r="0.9" fill="url(#bag-gold-grad)" />
  </svg>
);

/**
 * 판매하기 (Consignment Concierge Partnership Crest)
 * 48x48 뷰포트 기반 파트너십 악수 & 월계수 금속 인장
 */
export const EngravedHandshakeIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-11 h-11',
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
    <EngravedDefs prefix="consignment" />

    {/* Satin Outer Medallion Plate */}
    <circle cx="24" cy="24" r="22" fill="#F8F7F4" stroke="#E6E0D4" strokeWidth="1" />
    <circle cx="24" cy="24" r="19" fill="url(#consignment-radial-halo)" stroke="url(#consignment-gold-grad)" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />

    {/* Inner Concentric Gunmetal Medal */}
    <circle cx="24" cy="24" r="15.5" fill="#252525" stroke="url(#consignment-gold-grad)" strokeWidth="1.1" filter="url(#consignment-deboss-filter)" />

    {/* Left Hand Cuff */}
    <path d="M13.5 26.5L17.5 22.5L20.5 25L17 29.5L13.5 26.5Z" fill="url(#consignment-gold-grad)" stroke="#7A6136" strokeWidth="0.4" />
    {/* Right Hand Cuff */}
    <path d="M34.5 21.5L30.5 25.5L27 23L31 18.5L34.5 21.5Z" fill="url(#consignment-gold-grad)" stroke="#7A6136" strokeWidth="0.4" />

    {/* Interlocking Clasped Hands */}
    <path
      d="M18.8 23.8L23.5 20C24.5 19.2 25.8 19.5 26.5 20.5L28 22.5L25 25.5L22.5 24L18.8 23.8Z"
      fill="#E6D3A3"
      stroke="#1C1C1C"
      strokeWidth="0.5"
    />
    <path
      d="M22.5 24.5L25 27.5C25.8 28.5 27.2 28.8 28.2 28L30 26.5L28 23.5L25 25.5L22.5 24.5Z"
      fill="url(#consignment-gold-grad)"
      stroke="#1C1C1C"
      strokeWidth="0.5"
    />

    {/* Laurel Leaf Wreath Engravings */}
    <path
      d="M15.5 16C17.8 14.2 20.8 13.8 24 13.8C27.2 13.8 30.2 14.2 32.5 16"
      stroke="url(#consignment-gold-grad)"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeDasharray="1.2 2"
    />
    <path
      d="M15.5 32C17.8 33.8 20.8 34.2 24 34.2C27.2 34.2 30.2 33.8 32.5 32"
      stroke="url(#consignment-gold-grad)"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeDasharray="1.2 2"
    />
  </svg>
);

/**
 * 회원가입 이벤트 (Faceted Diamond Gift Medallion)
 * 24x24 뷰포트 기반 기하학적 패싯 기프트 박스 & 양각 리본
 */
export const EngravedGiftIcon: React.FC<EngravedIconBaseProps> = ({
  className = 'w-7 h-7',
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
    <EngravedDefs prefix="gift" />

    {/* Bow Loops with Precision Facets */}
    <path
      d="M12 7.2C10.8 5 8 4 6.8 5.2C5.5 6.5 6.8 8.8 12 7.8Z"
      fill="url(#gift-gold-grad)"
      stroke="#6E5630"
      strokeWidth="0.5"
    />
    <path
      d="M12 7.2C13.2 5 16 4 17.2 5.2C18.5 6.5 17.2 8.8 12 7.8Z"
      fill="url(#gift-gold-grad)"
      stroke="#6E5630"
      strokeWidth="0.5"
    />
    <circle cx="12" cy="7.5" r="1.3" fill="#EADBB8" stroke="#8C734B" strokeWidth="0.4" />

    {/* Gift Box Lid with Deboss Bevel */}
    <rect
      x="3.5"
      y="8"
      width="17"
      height="3.5"
      rx="0.8"
      fill="#252525"
      stroke="url(#gift-gold-grad)"
      strokeWidth="0.8"
      filter="url(#gift-deboss-filter)"
    />
    {/* Lid Center Ribbon */}
    <rect x="10.8" y="8" width="2.4" height="3.5" fill="url(#gift-gold-grad)" />

    {/* Gift Box Body */}
    <path
      d="M4.5 11.5H19.5V19.2C19.5 20 18.8 20.7 18 20.7H6C5.2 20.7 4.5 20 4.5 19.2V11.5Z"
      fill="#252525"
      stroke="url(#gift-gold-grad)"
      strokeWidth="0.8"
      filter="url(#gift-deboss-filter)"
    />
    {/* Vertical Body Ribbon */}
    <rect x="10.8" y="11.5" width="2.4" height="9.2" fill="url(#gift-gold-grad)" />

    {/* Delicate Micro Highlight Line */}
    <line x1="5.5" y1="13.2" x2="9.8" y2="13.2" stroke="url(#gift-gold-grad)" strokeWidth="0.6" strokeOpacity="0.5" />
  </svg>
);
