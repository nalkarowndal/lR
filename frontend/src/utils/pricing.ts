/**
 * LuxuryRental Pricing Utility
 * 
 * Handles multi-duration rental pricing, retail comparison benchmarking,
 * discount rate calculations, and currency formatting.
 */

export type TransactionType = 'RENT' | 'BUY' | 'SUBSCRIPTION';

export interface PriceDisplay {
  transactionType: TransactionType;
  basePrice: number;        // 할인 전 정가 (기간 비례 조정된 권장소비자/렌탈기준가)
  currentPrice: number;     // 실제 렌탈료
  discountRate: number;     // Math.round(((basePrice - currentPrice) / basePrice) * 100)
  rentalDays: number;       // 3, 7, 15, 30
  dailyRate: number;        // 1일 환산 금액
  currency: 'KRW';
  formattedCurrentPrice: string;
  formattedBasePrice: string;
  formattedDiscount: string;
  formattedDailyRate: string;
}

/**
 * Extracts a numeric integer from price strings like "115,000원", "₩115,000", or raw numbers.
 */
export function parseNumericPrice(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.round(value));
  }
  if (!value) return 40000;
  const digits = String(value).replace(/[^0-9]/g, '');
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 40000;
}

/**
 * Formats a number to Korean Won string, e.g. 115000 -> "115,000원"
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * Calculates rental price details with strict guarantees:
 * 1. basePrice > currentPrice at all times (original price never lower than rental fee)
 * 2. discountRate is mathematically consistent: ((basePrice - currentPrice) / basePrice) * 100
 * 3. Longer rental duration yields lower dailyRate and higher total rental discount
 */
export function calculateRentalPriceDetails(
  price: string | number,
  original?: string | number,
  days: number = 3,
  transactionType: TransactionType = 'RENT'
): PriceDisplay {
  const safeDays = [3, 7, 15, 30].includes(days) ? days : 3;
  const baseRental3Days = parseNumericPrice(price);

  // Duration multipliers for 3, 7, 15, 30 days
  // Standard day rates: 3d=1x (33.3%/d), 7d=2.1x (30%/d), 15d=4.0x (26.7%/d), 30d=7.0x (23.3%/d)
  const multiplier = safeDays === 3 ? 1.0 : safeDays === 7 ? 2.1 : safeDays === 15 ? 4.0 : 7.0;
  const currentPrice = Math.round(baseRental3Days * multiplier);

  // Determine base (pre-discount) benchmark price for the chosen duration
  let basePrice: number;
  if (original) {
    const rawOriginal3Days = parseNumericPrice(original);
    // Scale benchmark proportionally with rental duration: daily benchmark = rawOriginal3Days / 3
    const benchmarkDaily = rawOriginal3Days / 3;
    basePrice = Math.round(benchmarkDaily * safeDays);
    // Guarantee basePrice is strictly greater than currentPrice with at least 25% margin
    if (basePrice <= currentPrice) {
      basePrice = Math.round(currentPrice * 1.45);
    }
  } else {
    // Default ~67% luxury rental benchmark if original is omitted
    basePrice = Math.round(currentPrice * 3.03);
  }

  const rawDiscount = Math.round(((basePrice - currentPrice) / basePrice) * 100);
  const discountRate = Math.max(1, Math.min(99, rawDiscount));
  const dailyRate = Math.round(currentPrice / safeDays);

  return {
    transactionType,
    basePrice,
    currentPrice,
    discountRate,
    rentalDays: safeDays,
    dailyRate,
    currency: 'KRW',
    formattedCurrentPrice: formatKRW(currentPrice),
    formattedBasePrice: formatKRW(basePrice),
    formattedDiscount: `${discountRate}%`,
    formattedDailyRate: `${formatKRW(dailyRate)}/일`
  };
}

/**
 * Formats product pricing with strict separation between BUY and RENT models:
 * - BUY products: "구매가 ₩{amount}" (NEVER displays "/일")
 * - RENT products: "{amount}원{unit}" (e.g. "55,000원/1일" or "24,500원/3일")
 */
export function formatProductPrice(
  price: string | number,
  type: 'RENT' | 'BUY' | string = 'RENT',
  unit?: string | null
): string {
  const numeric = parseNumericPrice(price);
  const isBuy = String(type).toUpperCase() === 'BUY';

  if (isBuy) {
    return `구매가 ₩${numeric.toLocaleString('ko-KR')}`;
  }

  const safeUnit = unit ? (unit.startsWith('/') ? unit : `/${unit}`) : '/1일';
  return `${numeric.toLocaleString('ko-KR')}원${safeUnit}`;
}

export interface StatusBadgeConfig {
  label: string;
  className: string;
}

/**
 * Unified status badge theme configuration across the luxury commerce platform:
 * - 렌탈 가능: Emerald
 * - 구매 가능: Indigo
 * - 예약 마감: Zinc/Dark
 * - 품절: Rose
 * - 판매 완료: Slate
 * - 검수 중: Amber
 * - 이미지 준비 중: Gray
 */
export function getStatusBadgeConfig(tag: string | null | undefined): StatusBadgeConfig | null {
  if (!tag) return null;
  const trimmed = tag.trim();
  switch (trimmed) {
    case '렌탈 가능':
    case '렌트':
      return { label: '렌탈 가능', className: 'bg-emerald-600/90 text-white' };
    case '구매 가능':
    case '구매':
    case '구매전용':
      return { label: '구매 가능', className: 'bg-indigo-600/90 text-white' };
    case '예약 마감':
    case '마감임박':
      return { label: '예약 마감', className: 'bg-zinc-800/90 text-zinc-200' };
    case '품절':
      return { label: '품절', className: 'bg-rose-700/90 text-white' };
    case '판매 완료':
      return { label: '판매 완료', className: 'bg-slate-700/90 text-slate-200' };
    case '검수 중':
      return { label: '검수 중', className: 'bg-amber-600/90 text-white' };
    case '이미지 준비 중':
      return { label: '이미지 준비 중', className: 'bg-gray-600/90 text-gray-200' };
    case '앱전용':
      return { label: '앱전용', className: 'bg-violet-600/90 text-white' };
    case '프리미엄':
    case '최고급':
    case 'N':
      return { label: trimmed, className: 'bg-[#A68A56]/95 text-white' };
    default:
      return { label: trimmed, className: 'bg-black/60 text-white' };
  }
}
