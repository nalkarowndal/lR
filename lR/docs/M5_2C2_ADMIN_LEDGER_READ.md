# M5-2C2 — 테스트 전용 모의 결제 원장 관리자 조회

2026-11-03 · [Issue #14](https://github.com/nalkarowndal/lR/issues/14) · [PR #39](https://github.com/nalkarowndal/lR/pull/39)

## 1. 무엇을 구현했는가

- 기존 서버 내부 `demo-payment.ts`의 격리 MySQL 원장을 **읽기만 하는** 관리자 API와 Expo 웹 조회 화면을 추가했다.
- `GET /api/v1/admin/demo-orders?orderId=<UUID>&status=SIMULATED_PAID&limit=20&offset=0`: 내부 모의 주문 목록. `orderId`, `status` 필터·`limit 1..50`·`offset 0..1000` 지원.
- `GET /api/v1/admin/demo-orders/:id`: 특정 테스트 원장의 상품명, 대여 기간, 서버 계산된 렌탈료/보증금/모의 청구액, 상태, 최대 100개 감사 action + 최대 100개 결제 이벤트 요약. 제공업체 payment ID, event ID, 테스트 계정 이메일/암호/토큰은 API 응답에 포함하지 않는다.
- 마이페이지에 **DB 역할이 ADMIN인 테스트 세션에서만** '테스트 결제 원장 검수' 메뉴가 나타난다. 상세 화면에는 감사 이력과 결과 상태를 읽기 전용으로 표시한다. 권한이 없는 직접 URL 접근은 서버 정보를 요청하지 않고 거절하며, 서버 401/403/501/연결 실패 시 샘플 데이터로 대체하지 않는다.
- `Cache-Control: no-store`, 서버 `requireAuth` + `requireRole('ADMIN')`, 상태/UUID/페이지 매개변수 검증(422), 실재하지 않는 ID 404, 비활성 모드 501. **POST/PATCH 상태 변경 라우트는 없음**.

## 2. 데이터 및 배포 안전 경계

1. **3중 게이트:** `APP_MODE=demo`(서버 `createApp`의 `demoMode=true`), `NODE_ENV=test`, `DB_NAME=lr_test`. 어느 하나라도 만족하지 않으면 원장 API 501. 내부 SQL 조회 함수에도 `NODE_ENV=test` 및 `DB_NAME=lr_test` 확인이 있다.
2. 정상 고객의 실제 결제/예약/환불, 배송, 재고 SOLD, 실 ERP, PG 제공업체 호출은 **발생하지 않음**. `POST /api/v1/orders`와 `POST /api/v1/payments/confirm`의 501 경계는 유지한다.
3. **혼동 금지:** [M5-2C1](M5_2C1_BROWSER_DEMO_CHECKOUT.md) 고객 페이지에서 성공·실패·취소를 눌러 만든 결과는 브라우저 **React 메모리**에만 기록되며, 이 관리자 API가 읽는 **`lr_test` 데이터베이스 원장**으로 전송되지 않는다. 두 데이터의 거래번호·상태를 연동하거나 같은 주문이라고 주장하지 않는다.
4. 테스트용 계정에 ADMIN을 부여하려면 `lr_test`의 테스트 전용 `lr_users`·`lr_user_roles` 레코드를 사용한다. 기본 관리자 비밀번호 또는 자동 관리자 승격은 제공하지 않는다. 운영 계정과 구분된 이메일(`example.invalid` 등)만 사용.
5. 로컬 API는 `127.0.0.1` 또는 접근이 제어된 HTTPS 테스트 오리진만 사용. 브라우저에서 자격 증명 전송은 `requireSecureDemoBaseUrl`에 따라 원격 HTTP에서 차단한다. 공개 운영 서버·실제 개인정보·PG 시크릿은 투입하지 않는다.
6. 감사/이벤트 조회는 현재 건별 최대 100개로 제한되므로, 장기간의 실제 재무 감사·정산용 완전한 기록 조회가 아니다. DB에 저장된 원시 이벤트의 변경·중복 보호는 기존 내부 테스트 로직에서 검증한다.

## 3. 개발용 시연

- 로컬 분리 MySQL 8.4에서 `lr_test` 생성 후 [API README](../apps/api/README.md)의 `NODE_ENV=test`, `APP_MODE=demo`, `DB_NAME=lr_test` 환경으로 마이그레이션 및 **합성 데이터** 테스트를 진행한다.
- 합성 테스트 계정 등록 후 **수동으로 오직 `lr_test`에 ADMIN 역할을 부여**하고 로그인하면 마이페이지 관리자 메뉴가 나타난다. 자동 시드는 샘플 상품·홀드만 생성하며 주문/결제 원장까지 자동 생성하지 않는다. 내부 테스트에서 생성한 모의 원장이 없으면 빈 목록이 정상이다.
- `EXPO_PUBLIC_API_URL`로 개인 로컬 API를 연결하고 `API_CORS_ORIGINS`에 Expo 웹 원본을 정확히 등록한다. 브라우저에서 테스트 계정/패스워드 또는 운영 정보를 공개 저장소에 기록하지 않는다.

## 4. 검증 근거와 남은 범위

- TDD RED: [API CI #41573175930](https://github.com/nalkarowndal/lR/actions/runs/41573175930)는 5개 새 관리자 조회 검사에서 **404** 발생, 기존 106개 PASS. [Mobile CI #41573635315](https://github.com/nalkarowndal/lR/actions/runs/41573635315)는 새 클라이언트 모듈 부재로 실패.
- TDD GREEN: [Node API/MySQL #41574021033](https://github.com/nalkarowndal/lR/actions/runs/41574021033) 111/111 + HTTP 5/5, [모바일 #41574021034](https://github.com/nalkarowndal/lR/actions/runs/41574021034) Expo Doctor 20/20, 33/33 도메인 테스트·TypeScript·웹 export PASS.
- [Chromium #41574021124](https://github.com/nalkarowndal/lR/actions/runs/41574021124)에서 직접 URL 접근시 ADMIN 아닌 브라우저의 차단 및 기존 화면 회귀를 실행한다. 이 브라우저 테스트는 **실제 관리자 로그인+DB 연결 종단 E2E가 아님**.
- **다음 단계:** 안전한 테스트 원장 시드/관리자 웹 통합 QA 및 선택적인 검수 확인 액션(읽기/쓰기 분리·감사 로그), 정책 검토. 실제 결제·주문/예약·환불·배송·운영 PG는 승인 전 금지.
