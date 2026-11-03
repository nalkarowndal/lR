# M5-2C1 — 브라우저 렌탈 결제 시뮬레이션

2026-11-03 · 대상: `nalkarowndal/lR` / `main/lR/` · 포트폴리오용 **Web-first** 작은 기능 단위. [이슈 #14](https://github.com/nalkarowndal/lR/issues/14).

## 구현한 사용자 여정

1. 상품 상세에서 대여 시작/반납 날짜를 선택 → 기존 Node TEST API 또는 오프라인 샘플 견적 확인.
2. 견적에서 주문서 미리보기 이동 → 서버/샘플이 계산한 렌탈료·보증금·합계 및 정책/기간 확인.
3. 실제 카드번호·배송지·계좌정보를 입력하지 않고 '시연 조건 확인' 후 **모의 결제 성공/실패/취소** 중 하나 선택.
4. `DEMO-...` 참조번호와 결과·상품·날짜·금액을 브라우저의 **현재 React 상태**에만 기록 → 결과 화면 → 마이페이지 '모의 렌탈 이용 내역'에서 다시 확인.
5. 새로고침 또는 로그아웃 시 모의 내역은 사라진다. 이 과정은 가짜 사용자 경험을 보여주지만 실제 주문/예약/결제 승인·재고 홀드를 발생시키지 않는다.

## 무결성·오남용 경계

- 프런트 도메인 `makeDemoRentalReceipt`는 `demo=true`, `policyVersionId='demo-only'|'local-demo'`, 유효한 대여 날짜와 반납일 제외 기간, 견적 만료시간, 안전한 KRW 정수 및 대여료/할인/배송비/보증금 합계 일치를 검사한다. 검사를 통과하지 못하면 결과가 기록되지 않는다.
- 결과는 `SIMULATED_PAID`, `SIMULATED_FAILED`, `SIMULATED_CANCELED`. 이 명칭은 **PG 승인이나 계좌/카드 거래를 의미하지 않는다**.
- URL의 참조번호만으로 내역을 복원하지 않는다. 실제 `AppState`에 해당 기록이 없으면 결과 화면에 누락 안내를 표시한다. 임시 참조번호는 인증/PG/상거래 식별자로 쓰지 않는다.
- `AppState.resetPrivateState`는 모의 내역과 기존 임시 찜/장바구니/대여 초안을 함께 지운다.
- 실제 `/api/v1/orders`, `/api/v1/payments/confirm` 501 차단 **유지**. 서버 코드를 바꾸지 않았고 `lr_test` 및 운영 DB에 모의 주문 기록을 쓰지 않는다. **실거래 처리 안전성은 이 테스트에서 검증되지 않았다.**
- 일반 화면은 luxuryRental 기본 UI를 유지하지만 결제 동작/결과에서는 실제 결제·주문·예약이 없다는 안내를 반드시 표시한다.

## 테스트/CI 근거

- TDD RED: [테스트 추가 후 모바일 CI #41570128229](https://github.com/nalkarowndal/lR/actions/runs/41570128229)가 빠진 `demo-rental.ts`를 확인하고 실패. 구현 후 Node ESM/TypeScript 설정 호환성 오류를 수정했다.
- GREEN: [모바일 CI #41571483087](https://github.com/nalkarowndal/lR/actions/runs/41571483087): Expo Doctor 20/20, SDK 호환성, TypeScript, **모바일 29/29** (기존 25+새 4), Expo Web export 통과.
- GREEN: [Playwright #41571483053](https://github.com/nalkarowndal/lR/actions/runs/41571483053): offline **43/43**, api-unreachable **6/6**. 신규 3개 결과×360/390/768px = **9개** 경로에서 결과·내역·새로고침 삭제를 검증. 스크린샷은 GitHub Actions 아티팩트에 포함.
- Android/iOS native QA는 사용자 결정으로 생략. 이 브라우저 시연 테스트를 네이티브 실기기 QA로 부르지 않는다.

## 다음 패키지

- 도메인·DB 안전을 선행하여 관리자용 **격리 테스트 데이터**의 모의 주문 이벤트·상태 조회를 별도 개발할 수 있다. 기존 서버 내부 `demo-payment.ts`의 원장 보호/멱등성/가격 검증을 재사용할지 실사한 뒤 TDD.
- 운영 POL-01~05 정책 승인, Toss 실제 테스트 키/PG 계약, 실거래 예약 및 환불, 실 ERP/배송·고객 개인정보 수집은 **별도 미승인**. 기존 운영 웹 `567890` 보존.
