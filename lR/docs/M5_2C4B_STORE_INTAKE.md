# M5-2C4-B — 스토어 서버 저장형 비금전 주문 접수

2026-11-03 · [PR #43](https://github.com/nalkarowndal/lR/pull/43) · [Issue #41](https://github.com/nalkarowndal/lR/issues/41)

## 사용자 여정과 경계

1. 테스트 계정 로그인 → 스토어 상품 → 기존 영속 장바구니(C4-A).
2. `/store/checkout`에서 판매 **예시** 금액과 상품 구성을 확인하고 결제 *방법* 및 가상 수령방식을 선택한다. 카드번호·계좌번호·전화번호·실주소는 입력하지 않는다.
3. `스토어 주문 접수` 시 Node Express가 모든 STORE 상품의 게시/시연 여부, 활성 판매 오퍼, READY 재고와 유효한 홀드/진행 중 대여 충돌 여부를 **서버에서 다시 검증**한다.
4. 접수는 최대 **서로 다른 상품 10개, 각 수량 1개**의 **전체 성공 또는 전체 실패**. 부분 주문 생성은 없으며 가격을 포함한 모든 항목은 서버가 계산한다.
5. HTTP 201 또는 동일 요청 재전송 200을 확인한 뒤에만 서버 조회 `/store-order-result?orderId=<UUID>`로 이동. `/my/store-orders`에서 같은 테스트 계정의 접수 기록을 재조회한다.
6. ADMIN 권한에서는 `/my/admin-store-orders`에서 별도 **읽기 전용** 접수 요약을 조회한다. 판매 승인/배송/정산·환불 변경 버튼은 없다. 연결되지 않은 오프라인 모드의 기존 구매 시연은 브라우저 세션 내 데모 화면으로 유지한다.

## API 계약

기존 DB-backed bearer 토큰을 검증한다. URL의 actor ID, 클라이언트 합계·결제 결과·배송정보는 받지 않는다.

| 메서드 | 경로 | 기능 |
|---|---|---|
| POST | `/api/v1/experience/store-orders` | `Idempotency-Key: <UUID>`, 신규 201 / 동일 입력 재전송 200 / 키 재사용·동일 상품 경합 409 |
| GET | `/api/v1/experience/store-orders?limit=20&offset=0` | 로그인 소유자의 스토어 접수 목록 |
| GET | `/api/v1/experience/store-orders/:id` | 본인 기록만 조회, 타인은 404 |
| GET | `/api/v1/admin/experience/store-orders?limit=20&offset=0` | ADMIN 읽기 전용, 일반 사용자 403 |

POST 예시: `{"productIds":["demo-bag-01"],"paymentMethod":"EASY_PAY","deliveryMethod":"PICKUP","deliveryPreset":"SHOWROOM"}`.
결제방법: `CARD`/`TRANSFER`/`EASY_PAY`; 수령: `COURIER+SAMPLE_SEOUL` 또는 `PICKUP+SHOWROOM`만 허용. 불필요한 필드, 금액·고객 주소·상태/카드값은 모두 422.

응답: `orderId`, `channel:"STORE"`, `items:[{productId,title,unitPriceKrw,quantity:1,lineTotalKrw}]`, `totalKrw`, `paymentMethod`, `deliveryMethod`, `deliveryPreset`, `status:"RECEIVED"`, `paymentStatus:"NOT_CHARGED"`, `createdAt`, `demo:true`.

## 영속화/안전

- `010_portfolio_store_orders.sql`은 오직 `lr_test`의 가산 마이그레이션. `lr_portfolio_store_orders`(사용자/금액/멱등 키), `lr_portfolio_store_order_items`(상품·제목/가격 스냅샷) 별도 테이블.
- 헤더의 `(actor_id,idempotency_key)` 유니크 인덱스 및 계정 row lock으로 같은 요청 중복을 하나로 축소. 상품 ID를 정렬해 지문을 계산하므로 순서만 바꾼 요청은 같은 주문이다. 서로 다른 본문에 같은 키를 쓰면 409.
- 모든 라인의 활성 STORE offer/READY unit을 트랜잭션 내 검증, 단 하나라도 무효·홀드 중이면 접수 전체 롤백. 거래 성공이 실제 재고 점유를 의미하지 않으며 **접수마다 unit 소진·상태 변경은 전혀 하지 않는다**.
- 오직 `demoMode=true` + `NODE_ENV=test` + `DB_NAME=lr_test`의 세 조건이 만족될 때만 노출. 다른 경우 501. `Cache-Control:no-store`, strict body, 소유권 404, 관리자 RBAC.
- 기존 `POST /api/v1/orders`와 `POST /api/v1/payments/confirm`는 501 유지. 실제 PG, 배송대행, 결제원장, `lr_rentals`, 상품 `SOLD` 전환, 실제 ERP, 사용자 민감정보 저장은 없음.

## 품질 검증

테스트는 `apps/api/tests/store-intake.test.ts` 및 `apps/mobile/tests/store-orders.test.mjs`; 실 Chromium 테스트는 `apps/mobile/e2e/m5-store-intake-live.spec.ts`를 기존 `experience-checkout-e2e.yml`의 360/390/768 환경에서 실행한다. 주문·내역·권한/중복·보존성·부분 실패·실결제 차단 등은 각 단계 CI에서 검증한다. **승인/병합은 최종 PR SHA의 성공한 GitHub Actions 증거가 있어야만 한다.**

미완료: C4-C 수선·위탁 UI 연결, C4-D 적법 미디어/에디토리얼, 실 PG·정산/배송·운영 보안·영업 정책 및 기존 npm moderate 이슈. Android/iOS 실기기 QA는 포트폴리오 웹 QA 결정에 따라 SKIPPED이다.
