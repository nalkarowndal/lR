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
