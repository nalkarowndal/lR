import React, { useId } from 'react';
import { EngravedDefs } from '../EngravedIconTokens';

export interface AtelierSplashCrestProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

/**
 * 24K Royal Haute Crown & Laurel Crest (스플래시 및 최고급 브랜딩 심볼)
 * 3중 기요셰(Guilloché) 메탈 링 + 건메탈 슬레이트 깊은 베벨 + 5첨탑 수공예 왕관 + 월계수 에칭
 */
export const AtelierSplashCrest: React.FC<AtelierSplashCrestProps> = ({
  size = 96,
  className = '',
  glow = true,
  ...props
}) => {
  const paintId = useId();

  return <svg
    width={size}
    height={size}
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="LuxuryRental Royal Haute Crest"
    className={`select-none ${glow ? 'drop-shadow-[0_0_35px_rgba(197,168,128,0.28)]' : ''} ${className}`}
    {...props}
  >
    <EngravedDefs prefix={paintId} />

    {/* Layer 1: 외곽 24K 샴페인 골드 헤어라인 기요셰(Guilloché) 링 */}
    <circle
      cx="48"
      cy="48"
      r="45.5"
      stroke={`url(#${paintId}-gold-grad)`}
      strokeWidth="1.2"
      strokeDasharray="3 2"
      opacity="0.65"
    />
    <circle
      cx="48"
      cy="48"
      r="42"
      stroke={`url(#${paintId}-gold-grad)`}
      strokeWidth="0.8"
      opacity="0.4"
    />

    {/* Layer 2: 건메탈 슬레이트 깊은 베벨 메달리온 베이스 */}
    <circle
      cx="48"
      cy="48"
      r="38.5"
      fill={`url(#${paintId}-gunmetal-grad)`}
      filter={`url(#${paintId}-deboss-filter)`}
    />
    <circle
      cx="48"
      cy="48"
      r="38.5"
      stroke={`url(#${paintId}-gold-grad)`}
      strokeWidth="1.4"
      opacity="0.85"
    />

    {/* Layer 3: 내부 24K 오트 로열 크라운 (Haute Royal Crown) 수공예 음각 */}
    <g filter={`url(#${paintId}-deboss-filter)`}>
      {/* 왕관 베이스 밴드 */}
      <path
        d="M26 62C26 60.9 26.9 60 28 60H68C69.1 60 70 60.9 70 62V64C70 65.1 69.1 66 68 66H28C26.9 66 26 65.1 26 64V62Z"
        fill={`url(#${paintId}-gold-grad)`}
        stroke="#7D653E"
        strokeWidth="1.2"
      />
      {/* 밴드 보석 각인 (루비 & 에메랄드 노치) */}
      <circle cx="34" cy="63" r="1.2" fill="#FFFDF8" />
      <circle cx="41" cy="63" r="1.2" fill="#DFCA9B" />
      <circle cx="48" cy="63" r="1.5" fill="#FFFDF8" />
      <circle cx="55" cy="63" r="1.2" fill="#DFCA9B" />
      <circle cx="62" cy="63" r="1.2" fill="#FFFDF8" />

      {/* 5개 첨탑 왕관 본체 곡선 */}
      <path
        d="M27 60L24 40L38 49L48 30L58 49L72 40L69 60H27Z"
        fill={`url(#${paintId}-gold-grad)`}
        stroke="#7D653E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 5개 첨탑 상단 스펙큘러 다이아몬드 비드 */}
      <circle cx="24" cy="40" r="2.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.8" />
      <circle cx="38" cy="49" r="1.8" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.8" />
      <circle cx="48" cy="30" r="3.0" fill="#FFFDF8" stroke="#B49A67" strokeWidth="1.0" />
      <circle cx="58" cy="49" r="1.8" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.8" />
      <circle cx="72" cy="40" r="2.2" fill="#FFFDF8" stroke="#B49A67" strokeWidth="0.8" />
    </g>

    {/* Layer 4: 하단 로열 월계수 가지 (Laurel Branches) 정밀 에칭 */}
    <path
      d="M32 69.5C36 73.5 42 75.5 48 75.5C54 75.5 60 73.5 64 69.5"
      stroke={`url(#${paintId}-gold-grad)`}
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.85"
    />
    {/* 월계수 잎 디테일 */}
    <path d="M36 70.5C34.5 70 33 68.5 33.5 67C35 67.5 36.5 69 36 70.5Z" fill={`url(#${paintId}-gold-grad)`} opacity="0.8" />
    <path d="M41 73C40 72 39 70.5 40 69C41.5 70 42 71.5 41 73Z" fill={`url(#${paintId}-gold-grad)`} opacity="0.8" />
    <path d="M55 73C56 72 57 70.5 56 69C54.5 70 54 71.5 55 73Z" fill={`url(#${paintId}-gold-grad)`} opacity="0.8" />
    <path d="M60 70.5C61.5 70 63 68.5 62.5 67C61 67.5 59.5 69 60 70.5Z" fill={`url(#${paintId}-gold-grad)`} opacity="0.8" />
  </svg>;
};

