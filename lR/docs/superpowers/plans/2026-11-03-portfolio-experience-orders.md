# M5-2C3 포트폴리오 주문 접수 API + 웹 주문 완료
작성일: 2026-11-03. 범위: `main/lR/` 전용. 기존 웹 `567890` 불변.

## 목표
사용자가 상품·날짜·결제수단(선택만)·수령 방식·예시 수령지를 확인하고 **주문 접수**를 누르면 API가 서버가 재계산한 가격으로 `lr_test`에 주문을 저장한다. 이후 완료 페이지와 **내 주문 내역**에서 같은 접수를 확인한다. 이 기록은 포트폴리오의 사용자 경험을 위한 **비금전·비이행 주문 접수**이다. 실제 PG, 계좌/카드번호, 실제 배송지·휴대폰, 계약, 재고 홀드/예약 확정, 배송/ERP/환불 트랜잭션은 실행하지 않는다.

## 안전한 API 설계
- 고객 인증 필수: 기존 Bearer/DB 세션만 사용, 사용자 ID를 클라이언트에서 받지 않음.
- 새 `POST /api/v1/experience/orders` HTTP 201/200 replay, `GET /api/v1/experience/orders`, `GET /api/v1/experience/orders/:id`; `GET /api/v1/admin/experience/orders` 관리자 읽기 전용 추가 예정. 기존 `/api/v1/orders`, `/api/v1/payments/confirm` 501 불변.
- 독립 `lr_portfolio_orders` 합성 전용 테이블: customer user id, product, dates, payment option enum, delivery option enum, example preset, **server-computed rental/deposit/payable**, idempotency key + immutable request fingerprint, status=`RECEIVED`, paymentStatus=`NOT_CHARGED`. 실제 결제원장 `lr_demo_orders`·재고 상태와 무관. 배송 이름/주소/연락처/실카드 정보 컬럼 없음.
- 생성/조회 gate: APP_MODE=demo, NODE_ENV=test, DB_NAME=lr_test; 그 외 501. SQL script 역시 오직 test+lr_test만 허용, additive schema. 샘플 상품만 허용, 서버 가격/가용성 검증. 외부에서 결제합계나 상태를 보내면 422.
- UUID Idempotency-Key per authenticated user, 동일 입력 재시도 200, 다른 입력 동일 키 409. 정합성은 트랜잭션 및 고유 DB 인덱스로 보호.
- `Cache-Control: no-store`; 401/403/404 분리, 타인 주문은 404, 개인정보 요구 금지. 수령지는 가상의 선택지. 요청 본문은 allowlist 및 strict schema.

## 프런트엔드
- API 연결 + 로그인 경우 기존 주문서에서 선택형 결제방법·배송방법·예시 수령지를 입력하고 `주문 접수` 버튼. 제출 중 중복 탭 금지, 동일 idempotency UUID 재시도, 서버 오류 시 완료로 이동 금지.
- 성공 시 `/experience-order-result?orderId=UUID`에서 **서버 조회로 검증된 접수 내용**을 표시, 새로고침해도 서버 기록이 남는다. 고객 주문 내역 `/my/experience-orders` 연동. 관리자 API 조회 화면에서 같은 주문의 접수 상태 확인 가능.
- 비로그인/오프라인인 경우 기존 C1 3가지 **세션 한정 시뮬레이션**은 유지하되 이를 서버 주문으로 가장하지 않는다. 가입/로그인 CTA는 명확히 분리한다.
- 확인 버튼과 완료 페이지 주변에 단일 명확한 공지: **체험 주문으로 결제·예약 확정·실제 배송이 발생하지 않습니다.** 디자인의 모든 문구를 '시연용'으로 반복하지 않는다.

## TDD/릴리스 게이트
1. **RED** HTTP 통합 테스트: 성공 201, 재조회, 서버 금액, 20 중복, 키-본문 충돌, 타인 접근 404, 비회원 401, 관리자 조회 403/200, disabled mode 501, POST 실주문/PG 501, 카드·개인정보 필드 422, 재고/기존 원장 불변. 모바일 client parser/post+list 계약도 RED.
2. **GREEN** 독립 SQL 마이그레이션, 도메인+Express 라우트, 앱 SessionProvider Bearer 호출, UI 연결, 기존 C1 유지.
3. Browser Chromium 360/390/768 기본 경로 및 무자격 거절, API/MySQL·Mobile/TS/export·보안 CI. 실제 로그인+DB 연동 브라우저 E2E는 같은 작업 또는 후속 별도 CI 환경에서 수행하고 검증하지 않은 항목은 명시.
4. PR diff allowlist·최종 SHA에서만 merge. 문서·API 누락 목록을 별도로 갱신.

## 이전 API 기능 현황/후속
기존 **구현**: 상품 목록/상세/가용성/견적, 임시 테스트 홀드, demo auth+RBAC, 수선·위탁 신청/관리, 내부 모의 결제원장·관리자 읽기/ERP Outbox. **새로 구현**: 서버 저장형 비금전 주문·본인 조회·관리자 조회. **별도 후속**: 장바구니/찜 영속 API, 상품 실이미지/에디토리얼, 배송추적/실주소, 쿠폰/환불/정산, 운영 서비스 계약·PG 승인, 실운영 계정. 일부 기능은 의도적으로 포트폴리오 범위 밖.
