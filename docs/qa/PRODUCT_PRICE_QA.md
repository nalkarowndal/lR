# luxuryRental — Phase 6 가격 체계, 할인율 및 장바구니/주문 프로세스 QA 보고서

## 1. 개요 및 목적

Phase 5에서 식별되었던 가격 관련 핵심 결함:
1. BUY(구매) 상품임에도 불구하고 일일 대여료 단위인 `/일`이 붙어 `구매가 ₩15,500,000/일`로 오기되는 버그.
2. 렌탈 상품의 대여 기간(3일, 7일, 15일, 30일)에 따른 할인율 및 총 대여료 계산의 불일치.
3. 장바구니에서 배송지 입력 및 모의 주문 완료로 이어지는 3단계 결제 흐름의 버튼 텍스트 비동기화.

Phase 6에서는 순수 유틸리티 모듈(`pricing.ts`), 단위 테스트(`pricing.test.mjs`), 그리고 E2E 자동 캡처를 통해 이를 완전히 검증했습니다.

---

## 2. 가격 계산 및 포맷팅 로직 (`frontend/src/utils/pricing.ts`)

### 2.1 BUY 상품과 RENT 상품의 엄격한 분기 (`formatProductPrice`)
```typescript
export function formatProductPrice(
  price: string | number,
  type?: 'BUY' | 'RENT' | string,
  unit?: string
): string {
  const numeric = typeof price === 'number' ? price : parseNumericPrice(price);
  if (numeric <= 0) return '가격 문의';

  // 1. BUY (구매) 상품: 항상 '구매가 ₩{amount}' 형식 (단위 /일 절대 미표기)
  if (type === 'BUY') {
    return `구매가 ₩${numeric.toLocaleString()}`;
  }

  // 2. RENT (렌탈) 상품: '{amount}원{unit}'
  const safeUnit = unit ? (unit.startsWith('/') ? unit : `/${unit}`) : '/일';
  return `${numeric.toLocaleString()}원${safeUnit}`;
}
```

### 2.2 렌탈 대여 기간별 할인 요율 체계 (`calculateRentalPriceDetails`)
- **3일 (기본)**: 기본 일일 요율 x 3일
- **7일**: 5% 추가 할인 적용
- **15일**: 12% 추가 할인 적용
- **30일 (장기)**: 20% 최대 할인 적용

### 2.3 단위 테스트 검증 결과
`frontend/tests/pricing.test.mjs`의 15개 단위 테스트 실행 결과:
- `formatProductPrice` BUY 상품 `/일` 제거: **PASS**
- `formatProductPrice` RENT 상품 일일 대여료 표기: **PASS**
- 7대 상태 배지 색상 매핑: **PASS**
- 대여 기간별 할인 계산: **PASS**

---

## 3. 장바구니 및 모의 주문 결제 프로세스 (3-Step Flow)

1. **Step 1: 장바구니 (`21_cart_modal_with_items.png`)**
   - 담긴 상품 목록(브랜드, 상품명, 대여 기간, 대여료) 확인.
   - 보증금 0원 (VIP 무보증 프로모션), 배송비 무료 (왕복 특송) 표시.
   - 다음 단계 이동 버튼: `'주문서 작성으로 이동'`
2. **Step 2: 배송지 및 결제 정보 입력 (`22_mock_checkout_modal.png`)**
   - 수령인 성명, 휴대폰 연락처, 배송지 주소, 배송 요청사항 입력 폼.
   - 주문 금액 총계 확인.
   - 결제 승인 버튼: `'최종 결제 및 렌탈 예약 접수'`
3. **Step 3: 주문 완료 확인 (`23_mock_order_complete_modal.png`)**
   - 고유 주문 번호(`LR-YYYYMMDD-XXXX`) 자동 생성.
   - 수령인, 배송지, 결제 대여료, 익일 오전 10시 특송 발송 예정 안내.
   - `localStorage`에 주문 내역 저장 및 장바구니 초기화 완료.
   - 닫기 버튼: `'쇼핑 계속하기'`
