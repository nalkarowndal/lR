import React, { useId } from 'react';
import { EngravedDefs } from '../EngravedIconTokens';

export interface AtelierBadgeProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * 1. Atelier 100% Authentic Appraisal Seal (명품 감정 보증 씰)
 * 파리·밀라노 공인 명품 감정원 왁스 실링 & 24K 골드 베벨 엠블럼
 */
export const AtelierAuthenticSeal: React.FC<AtelierBadgeProps> = ({
  size = 48,
  className = '',
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="100% Authentic Certified"
    className={`select-none drop-shadow-[0_2px_8px_rgba(180,154,103,0.25)] ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    {/* 외곽 톱니/실링 왁스 테두리 */}
    <circle cx="24" cy="24" r="22" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" strokeDasharray="2 1.5" />
    <circle cx="24" cy="24" r="20" fill={`url(#${paintId}-graphite-grad)`} filter={`url(#${paintId}-deboss-filter)`} />
    <circle cx="24" cy="24" r="20" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1" opacity="0.8" />

    {/* 내부 월계수 링 & 방패/체크 */}
    <g filter={`url(#${paintId}-deboss-filter)`}>
      {/* 중앙 미니 실드 */}
      <path
        d="M24 12L31 15V22C31 26.5 28 30.5 24 32C20 30.5 17 26.5 17 22V15L24 12Z"
        fill={`url(#${paintId}-gold-grad)`}
        stroke="#7D653E"
        strokeWidth="0.8"
      />
      {/* 실드 내부 정밀 체크 마크 */}
      <path
        d="M21 21.5L23.5 24L27.5 19.5"
        stroke="#1A1A1A"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* 상단 스펙큘러 비드 */}
    <circle cx="24" cy="9" r="1" fill="#FFFDF8" />
  </svg>;
};

/**
 * 2. Atelier Order Complete Crest (주문/결제 완료 축하 크레스트)
 */
export const AtelierOrderCompleteCrest: React.FC<AtelierBadgeProps> = ({
  size = 64,
  className = '',
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Order Completed Successfully"
    className={`select-none drop-shadow-[0_4px_16px_rgba(180,154,103,0.3)] ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    {/* 베이스 골드 링 */}
    <circle cx="32" cy="32" r="29" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" strokeDasharray="3 2" />
    <circle cx="32" cy="32" r="26" fill={`url(#${paintId}-graphite-grad)`} filter={`url(#${paintId}-deboss-filter)`} />
    <circle cx="32" cy="32" r="26" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" />

    {/* 로열 체크 & 월계수 가지 */}
    <g filter={`url(#${paintId}-deboss-filter)`}>
      <circle cx="32" cy="32" r="18" fill={`url(#${paintId}-gold-grad)`} />
      <path
        d="M24 32L29.5 37.5L40 26.5"
        stroke="#252525"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* 상단 다이아몬드 비드 */}
    <circle cx="32" cy="10" r="1.5" fill="#FFFDF8" />
  </svg>;
};

/**
 * 3. Atelier Condition Grade Medal (S급 / A급 / B급 상태 등급 메달)
 */
export const AtelierGradeMedal: React.FC<AtelierBadgeProps & { grade?: 'S' | 'A' | 'B' }> = ({
  size = 36,
  grade = 'S',
  className = '',
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={`Grade ${grade}`}
    className={`select-none ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    <circle cx="18" cy="18" r="16.5" fill={`url(#${paintId}-gunmetal-grad)`} filter={`url(#${paintId}-deboss-filter)`} />
    <circle cx="18" cy="18" r="16.5" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" />
    <circle cx="18" cy="18" r="14" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.6" />

    <text
      x="18"
      y="23"
      textAnchor="middle"
      fill={`url(#${paintId}-gold-grad)`}
      fontSize="15"
      fontWeight="900"
      fontFamily="serif"
      letterSpacing="1"
    >
      {grade}
    </text>
  </svg>;
};

/**
 * 4. Atelier VIP Crest (마이페이지 VIP 등급 크레스트)
 */
export const AtelierVipCrest: React.FC<AtelierBadgeProps & { tier?: string }> = ({
  size = 56,
  tier = 'BLACK VIP',
  className = '',
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={`VIP Tier: ${tier}`}
    className={`select-none drop-shadow-[0_2px_12px_rgba(180,154,103,0.35)] ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    <circle cx="28" cy="28" r="26" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" strokeDasharray="3 2" />
    <circle cx="28" cy="28" r="23" fill={`url(#${paintId}-gunmetal-grad)`} filter={`url(#${paintId}-deboss-filter)`} />
    <circle cx="28" cy="28" r="23" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" />

    {/* 미니 골드 크라운 */}
    <g filter={`url(#${paintId}-deboss-filter)`}>
      <path
        d="M17 34L15 23L23 28L28 17L33 28L41 23L39 34H17Z"
        fill={`url(#${paintId}-gold-grad)`}
        stroke="#7D653E"
        strokeWidth="1"
      />
      <circle cx="28" cy="17" r="1.8" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.6" />
      <circle cx="15" cy="23" r="1.2" fill="#FFFDF8" />
      <circle cx="41" cy="23" r="1.2" fill="#FFFDF8" />
    </g>

    {/* 하단 에칭 텍스트 리본 */}
    <path d="M19 37H37" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1" strokeLinecap="round" />
  </svg>;
};

/**
 * 5. Atelier Admin Shield Emblem (관리자 센터 실드)
 */
export const AtelierAdminShieldEmblem: React.FC<AtelierBadgeProps> = ({
  size = 48,
  className = '',
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Admin Security Shield"
    className={`select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    <path
      d="M24 4L39 9.5V22C39 31.5 32.5 40 24 44C15.5 40 9 31.5 9 22V9.5L24 4Z"
      fill={`url(#${paintId}-gunmetal-grad)`}
      stroke={`url(#${paintId}-gold-grad)`}
      strokeWidth="1.4"
      filter={`url(#${paintId}-deboss-filter)`}
    />

    {/* 내부 골드 잠금장치 에칭 */}
    <g filter={`url(#${paintId}-deboss-filter)`}>
      <rect x="18" y="21" width="12" height="10" rx="2" fill={`url(#${paintId}-gold-grad)`} stroke="#7D653E" strokeWidth="0.8" />
      <path d="M21 21V17C21 15.3431 22.3431 14 24 14C25.6569 14 27 15.3431 27 17V21" stroke={`url(#${paintId}-gold-grad)`} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="25" r="1.2" fill="#1A1A1A" />
      <path d="M24 26.2V28" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>;
};

