# M1 API_CONTRACT — luxuryRental Node.js REST API v1.0

**상태:** M1 설계 기준선(일부 구현 완료). 실제 실행된 기능·검증 증거는 아래 M5-2C3 현황 및 [프로젝트 상태](PROJECT_STATUS.md)에서 확인한다. **일자:** 2026-11-02.  
**런타임:** Node.js + Express 5 + TypeScript, MySQL/InnoDB 우선, JSON REST. `/api/v1`는 향후 기본 URL prefix.  
**고정 근거:** [REQUIREMENTS](REQUIREMENTS.md) / [DATA_MODEL](DATA_MODEL.md) / [USER_FLOWS](USER_FLOWS.md).

## 1. 전역 계약

- HTTPS/JSON. 모든 응답은 서버 `requestId`로 추적 가능, 고객 PII/토큰/서버 비밀키 로그 금지.
- 성공 객체: `{ "data": {...}, "meta": { "requestId": "..." } }`, 컬렉션은 `data:[]`, `meta.page={cursor,hasNext}` (cursor 기반 페이지네이션).
- 오류: HTTP 4xx/5xx, `Content-Type: application/problem+json` (RFC 9457), `type,title,status,detail,instance,code,requestId`. 클라이언트는 `code`와 HTTP 상태 사용, 인간용 `detail`의 문자열 패턴 파싱 금지.
- 금액: `amountKrw`, `dayRateKrw` 등 원화 **정수** (소수/부호 불허, 환불 별도 유형). `depositKrw`는 임대료와 별도 안내. 상품 가격은 서버 최종값.
- 대여 날짜: KST `YYYY-MM-DD`; 시작일 포함/반납일 제외 `[startDate,returnDate)`; 달력 3일 예시 `2026-11-10` → `2026-11-13`.
- 시간 정보: `createdAt`·`expiresAt`은 UTC ISO8601(`Z`).
- 쓰기 `POST`/상태 변경 중 재시도 가능한 거래에 `Idempotency-Key: <UUID>` 필수. 같은 키+요청 동일하면 이전 결과; 같은 키+다른 본문은 409.
- 보호된 API는 회원 액세스 자격증명 필요. 네이티브는 안전하게 보관·회전되는 토큰 전략, 웹 관리자는 HttpOnly Secure SameSite 쿠키+CSRF 등 별도 세션 권장. 권한은 모든 요청마다 서버 검사.
- 민감 리소스 조회는 authenticated user ID 소유권 확인. 리소스 존재를 숨겨야 하는 경우 404 반환 가능.
- `/api/products` (옛 웹)의 **bare array**와 스타터의 `{products:[...]}`는 호환되지 않음; 신규 `/api/v1/products`는 `{data:[],meta:{...}}` 계약을 단일화하고 변환 어댑터 필요.

## 2. 고객·공개 API

| Method | Endpoint | 권한 | 요청 / 주요 응답 | 오류 코드 / 비고 |
|---|---|---|---|---|
| GET | `/health` | 공개 | `{status:"ok"}` (운영 상세 제거) | 503 |
| GET | `/api/v1/products` | 공개 | `q,brand,category,channel,sort,cursor,limit` → `data:[ProductSummary]` | 400 |
| GET | `/api/v1/products/:id` | 공개 | `ProductDetail`, `offers`, condition, signed media | 404 |
| GET | `/api/v1/products/:id/availability` | 공개 | `startDate,returnDate` → `available,eligibleUnitCount,unavailableReasons` (실물 serial 비노출) | 422,404 |
| GET | `/api/v1/editorials` | 공개 | PUBLISHED만, cursor | 400 |
| GET | `/api/v1/editorials/:slug` | 공개 | 공개된 에디토리얼 | 404 |
| POST | `/api/v1/auth/register` | 공개 | `email,...` 동의별 검증 → 가입 또는 인증 시작 | 409,422 |
| POST | `/api/v1/auth/login` | 공개 | 자격 검증, 세션 발급 | 401,429 |
| POST | `/api/v1/auth/refresh` | 세션 | 토큰 회전 | 401 |
| POST | `/api/v1/auth/logout` | 로그인 | 세션 폐기 | 204 |
| GET | `/api/v1/me` | 고객 | 현재 사용자 프로필 | 401 |
| POST | `/api/v1/rentals/quote` | 공개 | `productId,startDate,returnDate,shippingOption` → `RentalQuote` 및 `quoteExpiresAt` | 422,409 |
| POST | `/api/v1/rentals` | 고객 | `quoteId,addressId,policyAcceptance` + 멱등키 → `RentalCheckout`(PENDING_PAYMENT,holdExpiresAt) | 401,409,422 |
| GET | `/api/v1/rentals` | 고객 | 내 렌탈 목록/상태 | 401 |
| GET | `/api/v1/rentals/:id` | 고객/운영자 | 소유권 검사된 예약·상태·비용 | 401,404 |
| POST | `/api/v1/rentals/:id/cancel` | 고객 | 취소 가능 상태 검사 → 취소 상태 | 409,422 |
| POST | `/api/v1/rentals/:id/extension-quote` | 고객 | `newReturnDate` → 새 요금/가용성 | 409,422, P1 |
| POST | `/api/v1/rentals/:id/return-request` | 고객 | 반납 신청(검수 전) | 409, P1 |
| POST | `/api/v1/orders` | 고객 | `items:[{productId,quantity}],addressId` → 미결제 주문/실물홀드 | 409,422 |
| GET | `/api/v1/orders` | 고객 | 내 주문 목록 | 401 |
| GET | `/api/v1/orders/:id` | 고객/운영자 | 본인 주문·결제·배송 상태 | 404 |
| POST | `/api/v1/orders/:id/cancel` | 고객 | 서버 정책 검사·결제 환불 분기 | 409 |
| POST | `/api/v1/payments/confirm` | 고객·검증된 결제 맥락 | `checkoutId,orderId,paymentKey` → 서버 PG 조회·승인·전환 | 409,422,502; PG 키 서버 전용 |
| GET | `/api/v1/payments/status/:checkoutId` | 고객 | 소유권 확인 후 최종/대기 상태 | 404 |
| POST | `/api/v1/repairs/uploads` | 고객 | 미디어 메타/업로드 권한 발급 (파일 크기/형식 검사) | 413,422 |
| POST | `/api/v1/repairs` | 고객 | `itemDescription,issueDescription,uploadIds` → request | 422,403 |
| GET | `/api/v1/repairs` | 고객 | 본인 신청 내역 | 401 |
| GET | `/api/v1/repairs/:id` | 고객/운영자 | 본인 접수/견적/상태 | 404 |
| POST | `/api/v1/repairs/:id/quotes/:quoteId/decision` | 고객 | 수락/거부, 동의 기록 | 409,422 |
| GET | `/api/v1/favorites` | 고객 | 사용자 찜 목록 | 401, P1 |
| PUT | `/api/v1/favorites/:productId` | 고객 | 유일 멤버십 보장 | 200/201, P1 |
| DELETE | `/api/v1/favorites/:productId` | 고객 | 중복 삭제 안전 | 204, P1 |
| POST | `/api/v1/consignments` | 고객 | 위탁 신청서/사진 → 접수 | P1 |

## 3. 관리자 API
기본 prefix `/api/v1/admin`; 모든 API는 서버의 인증·RBAC 및 필요한 대상 데이터 접근 권한을 검사한다.

| Method | Endpoint | 기능 |
|---|---|---|
| GET | `/dashboard` | 요약 KPI (실/데모 금액 구분) |
| GET/POST/PATCH | `/products[/:id]` | 상품 모델·가격 정책(발행 전 검수) |
| GET/POST/PATCH | `/units[/:id]` | 실물 등록·등급·관리 상태 |
| GET/PATCH | `/rentals[/:id]` | 예약/출고/반납/검수 상태 전이 |
| GET/PATCH | `/orders[/:id]` | 주문·배송·환불 워크플로 |
| GET/PATCH | `/repairs[/:id]` | 견적·수선 진행 |
| GET/POST/PATCH | `/editorials[/:id]` | 콘텐츠 초안·발행·보관 |
| GET | `/audit-logs` | 수정/접근 감사, 권한 분리 |

기존 RecruitApp `/admin/staffing/*` 별도 API/경로는 P2 범위로 설계하며, 초기 고객용 API에서 직접 접근 불가.

## 4. DTO 예시 (설계 예시, 활성 API 결과 아님)

### 상품 요약
```json
{
  "data": [
    {
      "id": "uuid-product",
      "title": "Demo Leather Bag",
      "brand": "DEMO",
      "channels": ["RENTAL", "STORE"],
      "dayRateKrw": 28000,
      "salePriceKrw": 900000,
      "condition": "A",
      "available": true,
      "media": [{"url": "https://cdn.example.invalid/authorized-image"}]
    }
  ],
  "meta": { "requestId": "req-example", "page": { "cursor": null, "hasNext": false } }
}
```
실물 `serial`과 저장소 `storageKey`는 공개하지 않는다.

### 렌탈 견적
```json
{
  "data": {
    "quoteId": "quote-uuid",
    "productId": "uuid-product",
    "startDate": "2026-11-10",
    "returnDate": "2026-11-13",
    "rentalDays": 3,
    "dayRateKrw": 28000,
    "rentalFeeKrw": 84000,
    "discountKrw": 0,
    "shippingFeeKrw": 0,
    "depositKrw": 100000,
    "payableNowKrw": 184000,
    "policyVersionId": "policy-demo",
    "quoteExpiresAt": "2026-11-02T02:30:00Z",
    "demo": true
  }
}
```
여기서 배송비 0원 및 보증금 100,000원은 **단순 테스트 값이며 사업 정책이 아니다**. `payableNowKrw`는 보증금 정책에 따라 변하므로 운영 정책에서 실제 청구 시점을 결정해야 한다. 견적은 **재고 확보가 아니며**, 이후 트랜잭션에서 재검증한다.

### 예약 대기
```json
{
  "data": {
    "rentalId": "rent-uuid",
    "checkoutId": "checkout-uuid",
    "status": "PENDING_PAYMENT",
    "holdExpiresAt": "2026-11-02T02:35:00Z",
    "paymentStatus": "NOT_CONFIRMED",
    "demo": true
  }
}
```

### 오류 예시
```http
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://api.example.invalid/problems/inventory-conflict",
  "title": "선택한 기간에 대여할 수 없습니다",
  "status": 409,
  "detail": "다른 기간을 선택해 주세요.",
  "code": "INVENTORY_CONFLICT",
  "instance": "/api/v1/rentals",
  "requestId": "req-example"
}
```
`example.invalid`는 실제 서비스 도메인이 아닌 예시이며 구현 시 실제 소유 도메인으로 교체한다.

## 5. 결제·트랜잭션 보안

- `POST rentals/orders`: 서버 DB 트랜잭션에서 unit lock, 구간 겹침/홀드 확인, 견적 재계산, 인벤토리 홀드 생성 후 커밋.
- 결제 서버는 **클라이언트의 amount/status 값을 신뢰하지 않음**. 서버에서 원래 `expectedAmountKrw`와 체크아웃·고객·상품·홀드 만료 확인 후 토스페이먼츠 같은 PG 서버 API 승인 수행. PG 오류/응답 유실에 대비해 provider status 조회와 webhook 재처리 필요.
- 서버에 idempotent 상태 전이; DB 업데이트와 외부 PG 호출 사이의 크래시 복구를 위한 상태 머신/재조정 작업 설계. 클라이언트 성공 URL만으로 주문 완료 표시 금지.
- 공급자 webhook은 서명/검증·중복 이벤트 제거 후 DB 적용. 인증·감사 로그가 필요.
- 운영 판매완료는 결제 확정 이후에만 기록. 모의 결제는 `demo=true`·명확한 배지; 실제 청구·정산과 구별.
- 모든 업로드는 파일 소유권, 이미지 형식/실제 바이트 검사, 저장소 비공개, 만료 URL·삭제 정책 적용.
- `GET /api/v1/me` 등 민감 정보는 필요한 필드만. 로그 민감정보 마스킹, 관리자 세션/권한 분리.

## 6. Legacy API 호환·위험

| 원본 | 기존 응답/의미 | 신규 변환 |
|---|---|---|
| `567890 GET /api/products` | 배열 `[{id:number,title,brand,type,price}]` | 새 `data[]`, 가격/렌탈 채널 분리, UUID 매핑, 기존 numeric id 유지 |
| `1235856894 GET /api/products` | `{products:[...]}`, 판매·렌탈 가격/보증금 | 내부 어댑터에서 DTO 통일; SQLite 직접 사용 금지 |
| `1235856894 POST /api/rentals` | 즉시 confirmed, 결제 `demo_not_charged` | 신규 PENDING_PAYMENT → 확인 후 CONFIRMED |
| `1235856894 POST /api/orders` | 미결제 주문 생성 후 unit sold | 결제 전 hold, 성공 후 sold |

M3 작업 전 OpenAPI 3.1 문서를 생성하고 이 표의 DTO 차이에 대한 계약 테스트를 정의. API 명칭 및 필수 필드가 변경되면 `DECISIONS_M1.md`, 요구사항, 기능 추적표 함께 갱신한다.

## 7. 공식 근거
- [Express 5 라우팅/에러](https://expressjs.com/en/guide/error-handling.html)
- [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
- [TossPayments 금액 검증과 서버 최종 승인](https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference)
- [MySQL InnoDB locking reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)

**위 M1 설계 계약은 향후 목표도 포함하며 전체가 구현됐다는 뜻이 아니다.** 아래 M5-2C3는 실제 `lr_test` 실행 API 계약을 따로 기록한다.

## 8. M5-2C3 구현 완료 — 비금전 체험 주문 접수 API

**API가 저장하는 실체는 `lr_portfolio_orders`의 주문 접수 기록이다.** 상용 주문·예약/재고 홀드·PG 승인·배송 처리는 아니다. `APP_MODE=demo` + `NODE_ENV=test` + `DB_NAME=lr_test`가 모두 일치해야 라우트가 열리고 DB 세션에서 인증된 actor ID만 사용한다.

| Method & path | RBAC | 내용 |
|---|---|---|
| `POST /api/v1/experience/orders` | 로그인 | `Idempotency-Key: <UUID>` 필수. 허용된 상품/날짜·옵션을 서버에서 검사하고 가격 재계산 후 접수 201, 동일 재전송 200, 키 충돌 409 |
| `GET /api/v1/experience/orders?limit=20&offset=0` | 로그인 | 로그인한 사용자의 접수 목록만 조회 |
| `GET /api/v1/experience/orders/:id` | 소유자 | 서버 저장 주문 상세, 타인 주문은 404 |
| `GET /api/v1/admin/experience/orders?limit=20&offset=0` | ADMIN | 내부 접수 전체 목록(읽기 전용), 고객 이메일·비밀번호·실주소/전화 미포함 |

생성 요청 본문 예시는 `{ "productId":"demo-bag-01","startDate":"2026-11-10","returnDate":"2026-11-13","paymentMethod":"CARD","deliveryMethod":"COURIER","deliveryPreset":"SAMPLE_SEOUL" }` 이며 결제수단은 `CARD|TRANSFER|EASY_PAY`, 수령방식은 `COURIER+SAMPLE_SEOUL|PICKUP+SHOWROOM`만 허용한다. 카드번호·실주소·금액·결제상태/주문상태 입력은 스키마에 없으므로 422. 금액은 서버의 유효한 RENTAL offer로 계산하고 재고 가능성만 확인하며 **예약/재고 할당은 하지 않는다**.

응답 `data`의 `orderId`·`productId`·`title`·`startDate`·`returnDate`·`rentalDays`·`paymentMethod`·`deliveryMethod`·`deliveryPreset`·`rentalFeeKrw`·`depositKrw`·`payableKrw`·`status:RECEIVED`·`paymentStatus:NOT_CHARGED`·`demo:true`·`createdAt`는 실제 서버 DB 접수 결과를 나타낸다. 결제·배송 상태가 변경되었다고 해석하면 안 된다. 요청·응답 모두 서버 ACL 검증 및 `Cache-Control: no-store`를 따른다.

**차단 유지:** `POST /api/v1/orders`, `POST /api/v1/payments/confirm` → 501. 판매완료, 실대여 계약, 보증금 청구/환불, PG 키 연결, 고객 실주소 수집은 여전히 미구현·미승인. [코드·CI·차이 상세](M5_2C3_PORTFOLIO_ORDER_INTAKE.md).

