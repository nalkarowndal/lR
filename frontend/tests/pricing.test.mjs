import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation directly with ESM
function parseNumericPrice(value) {
  if (typeof value === 'number') {
    return Math.max(0, Math.round(value));
  }
  if (!value) return 40000;
  const digits = String(value).replace(/[^0-9]/g, '');
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 40000;
}

function calculateRentalPriceDetails(price, original, days = 3, transactionType = 'RENT') {
  const safeDays = [3, 7, 15, 30].includes(days) ? days : 3;
  const baseRental3Days = parseNumericPrice(price);

  const multiplier = safeDays === 3 ? 1.0 : safeDays === 7 ? 2.1 : safeDays === 15 ? 4.0 : 7.0;
  const currentPrice = Math.round(baseRental3Days * multiplier);

  let basePrice;
  if (original) {
    const rawOriginal3Days = parseNumericPrice(original);
    const benchmarkDaily = rawOriginal3Days / 3;
    basePrice = Math.round(benchmarkDaily * safeDays);
    if (basePrice <= currentPrice) {
      basePrice = Math.round(currentPrice * 1.45);
    }
  } else {
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
    formattedCurrentPrice: `${currentPrice.toLocaleString('ko-KR')}원`,
    formattedBasePrice: `${basePrice.toLocaleString('ko-KR')}원`,
    formattedDiscount: `${discountRate}%`,
    formattedDailyRate: `${dailyRate.toLocaleString('ko-KR')}원/일`
  };
}

function formatProductPrice(price, type = 'RENT', unit) {
  const numeric = parseNumericPrice(price);
  const isBuy = String(type).toUpperCase() === 'BUY';

  if (isBuy) {
    return `구매가 ₩${numeric.toLocaleString('ko-KR')}`;
  }

  const safeUnit = unit ? (unit.startsWith('/') ? unit : `/${unit}`) : '/1일';
  return `${numeric.toLocaleString('ko-KR')}원${safeUnit}`;
}

function getStatusBadgeConfig(tag) {
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

test('Pricing - 3-day calculation with original price', () => {
  const res = calculateRentalPriceDetails('115,000원', '350,000원', 3);
  assert.equal(res.rentalDays, 3);
  assert.equal(res.currentPrice, 115000);
  assert.equal(res.basePrice, 350000);
  assert.equal(res.discountRate, 67);
  assert.ok(res.basePrice > res.currentPrice, 'basePrice must be strictly higher than currentPrice');
});

test('Pricing - 30-day calculation scaling: basePrice strictly exceeds currentPrice', () => {
  const res = calculateRentalPriceDetails('115,000원', '350,000원', 30);
  assert.equal(res.rentalDays, 30);
  assert.equal(res.currentPrice, 805000); // 115000 * 7
  assert.equal(res.basePrice, 3500000);   // (350000 / 3) * 30
  assert.ok(res.basePrice > res.currentPrice, '30-day basePrice must be greater than currentPrice');
  assert.equal(res.discountRate, 77);      // ((3500000 - 805000) / 3500000) * 100 = 77%
  assert.ok(res.dailyRate < 30000, '30-day daily rate must be cheaper than 3-day daily rate');
});

test('Pricing - Daily rate monotonicity (longer period = cheaper daily rate)', () => {
  const p3 = calculateRentalPriceDetails('100,000원', '300,000원', 3);
  const p7 = calculateRentalPriceDetails('100,000원', '300,000원', 7);
  const p15 = calculateRentalPriceDetails('100,000원', '300,000원', 15);
  const p30 = calculateRentalPriceDetails('100,000원', '300,000원', 30);

  assert.ok(p3.dailyRate > p7.dailyRate);
  assert.ok(p7.dailyRate > p15.dailyRate);
  assert.ok(p15.dailyRate > p30.dailyRate);
});

test('Pricing - Edge case: missing original price auto-generates consistent basePrice', () => {
  const res = calculateRentalPriceDetails('100,000원', null, 7);
  assert.ok(res.basePrice > res.currentPrice);
  assert.ok(res.discountRate > 0 && res.discountRate < 100);
});

test('Pricing - BUY transactions strictly format as "구매가 ₩{price}" and NEVER include "/일"', () => {
  const buyChanel = formatProductPrice(8400000, 'BUY');
  assert.equal(buyChanel, '구매가 ₩8,400,000');
  assert.ok(!buyChanel.includes('/일'), 'BUY format must never include daily rental unit');

  const buyAmi = formatProductPrice('420,000원', 'BUY', '');
  assert.equal(buyAmi, '구매가 ₩420,000');
  assert.ok(!buyAmi.includes('/일'), 'BUY format must never include daily rental unit');
});

test('Pricing - RENT transactions format with rental unit', () => {
  const rentChanel = formatProductPrice(55000, 'RENT', '/1일');
  assert.equal(rentChanel, '55,000원/1일');

  const rent3Days = formatProductPrice(24500, 'RENT', '3일');
  assert.equal(rent3Days, '24,500원/3일');
});

test('Status Badges - Unified color scheme across all 7 required statuses', () => {
  const rentAvailable = getStatusBadgeConfig('렌탈 가능');
  assert.ok(rentAvailable.className.includes('bg-emerald-600'), '렌탈 가능 must be emerald');

  const buyAvailable = getStatusBadgeConfig('구매 가능');
  assert.ok(buyAvailable.className.includes('bg-indigo-600'), '구매 가능 must be indigo');

  const deadline = getStatusBadgeConfig('예약 마감');
  assert.ok(deadline.className.includes('bg-zinc-800'), '예약 마감 must be zinc');

  const soldOut = getStatusBadgeConfig('품절');
  assert.ok(soldOut.className.includes('bg-rose-700'), '품절 must be rose');

  const sold = getStatusBadgeConfig('판매 완료');
  assert.ok(sold.className.includes('bg-slate-700'), '판매 완료 must be slate');

  const inspecting = getStatusBadgeConfig('검수 중');
  assert.ok(inspecting.className.includes('bg-amber-600'), '검수 중 must be amber');

  const imgPending = getStatusBadgeConfig('이미지 준비 중');
  assert.ok(imgPending.className.includes('bg-gray-600'), '이미지 준비 중 must be gray');
});
