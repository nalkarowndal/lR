# M5-2C3 — 서버 저장형 포트폴리오 주문 접수 (비금전)

2026-11-03 · Repo `nalkarowndal/lR` / `main/lR/` · [PR #40](https://github.com/nalkarowndal/lR/pull/40) · [이슈 #14](https://github.com/nalkarowndal/lR/issues/14)

## 구현한 사용자 경험

1. 테스트 계정 가입·로그인(기존 Argon2id, 불투명 Bearer, DB 확인·회전) → 렌탈 상품 선택, 날짜/가용성·견적.
2. 주문서에서 **카드/간편결제/계좌이체 중 한 가지를 선택**한다(거래는 진행하지 않으며 카드번호와 PG 인증 정보는 수집하지 않음).
3. 택배(가상 샘플 주소) 또는 매장 방문(가상 쇼룸) 수령을 선택하고 조건 확인 → `주문 접수`. API가 리스크·금액·이용 가능성을 다시 검증한다.
4. 성공한 HTTP 201/동일 요청 200 이후에만 `/experience-order-result?orderId=<UUID>`로 이동. **주문이 접수되었습니다** 화면은 `GET .../:id`를 통해 소유자 서버 기록을 조회하고, 상품·기간·예시 합계·결제수단·접수상태 `RECEIVED`·미결제 `NOT_CHARGED`를 보여준다.
5. `/my/experience-orders`에 동일 로그인 소유자의 **서버 저장 주문 목록**이 존재. 로그인 세션이 끊긴 경우 안전하게 로그인 화면을 요청하며, 다른 사용자의 주문은 404.
6. DB ADMIN 테스트 세션에서는 `GET /api/v1/admin/experience/orders` 읽기 전용으로 접수 목록을 본다. **M5-2C2의 별도 내부 모의 결제 원장과는 구분**한다.

## API/DB 구현

- `apps/api/sql/008_portfolio_experience_orders.sql`: `lr_portfolio_orders` additive schema. 모든 마이그레이션은 **테스트 환경 `lr_test`만**. 생성을 위한 `status=RECEIVED`, `payment_status=NOT_CHARGED` 고정, UNIQUE (actor_id, idempotency_key), server-computed safe KRW 금액, FK user/product. 실주소·전화·카드/계좌/PG transaction 컬럼 없음.
- `apps/api/src/portfolio-orders.ts` 및 `portfolio-order-routes.ts`: 본인/ADMIN 읽기, 엄격한 request schema(그 외 금액/카드번호/상태/임의 주소 422), 동일 주문 idempotency 200, 다른 입력/동일 키 409, 소유자 검증 404, 미로그인 401/일반 사용자 관리자 403. 출시 게이트에서 501.
- GET/POST `Cache-Control: no-store`; API는 포트폴리오 접수 기록 외 재고·`lr_rentals`·`lr_demo_orders`·ERP/PG/배송 테이블을 수정하지 않는다. 재고 가용성은 조회 시점의 참고 값이고 해당 접수는 실제 예약이 아님.
- 원본 `POST /api/v1/orders`, `POST /api/v1/payments/confirm`은 계속 **501**. 앱 UI의 결제수단 선택은 진짜 토스/카드/은행 API를 호출하지 않는다.
- Demo만 허용하는 3중 차단 `demoMode` + `NODE_ENV=test` + `DB_NAME=lr_test`; 실제 회원/PG·운영 서버용으로 이 경로를 열지 않는다.

## 검증 증거

- **RED:** [API #41575990811](https://github.com/nalkarowndal/lR/actions/runs/41575990811) 신규 HTTP/DB 5개 테스트에서 미존재 엔드포인트 404, 기존 111개 PASS.
- **GREEN API:** [Node API/MySQL #41577706132](https://github.com/nalkarowndal/lR/actions/runs/41577706132) **116/116**, 실제 모바일 TypeScript HTTP 클라이언트 통합 **6/6**; 로그인→주문 접수→중복 재전송→본인 목록/상세→타인 404.
- **GREEN 모바일:** [Mobile #41577706051](https://github.com/nalkarowndal/lR/actions/runs/41577706051) Expo Doctor, TypeScript, 신규 파싱/요청 포함 도메인 **37/37**, Expo Web export.
- **GREEN 브라우저↔진짜 API:** [Portfolio live Chromium #41577706025](https://github.com/nalkarowndal/lR/actions/runs/41577706025) **3/3** (360/390/768) 계정 생성/로그인→상품→기간→결제/수령 선택→서버 주문 접수→완료/내역 조회. [기존 Chromium #41577706003](https://github.com/nalkarowndal/lR/actions/runs/41577706003)에서 오프라인 UI·API 장애 회귀와 신규 비로그인 경계 실행.
- **범위 밖:** 실제 ADMIN 브라우저 권한 변경·결제/정산, 실PG, 재고 확정, 운영 데이터·실배송; Android/iOS 실기기 검증 사용자 결정 SKIPPED, npm audit Moderate 11건은 #30 별도 추적.

## 다른 누락·미연결 API 실사

| 영역 | 지금 상태 | 다음 개선 제안 |
|---|---|---|
| 렌탈 접수·내역 | **이번 단계 서버 저장 + 브라우저 연동** | 예시 주문 상태 단계/감사 이력·고객 취소 요청을 *비금전 이벤트*로 추가 |
| 상품 목록·상세·가용성·견적 | **기존 API 연결됨** | 적법한 실제 상품 미디어/에디토리얼 공급 경계 |
| 고객 찜·장바구니 | 현재 React 메모리 전용 | 로그인 사용자별 wishlist/cart API, 소유권·동시성 검증 |
| 스토어 구매 접수 | 주문서 데모 결과 페이지 전용 | STORE 채널 비금전 주문 접수·내역 API, 렌탈과 상품 재고 분리 |
| 수선·위탁 신청 | 서버 test-only request API/RBAC **있으나** 웹 전체 폼이 API 연동된 것은 아님 | 기존 service-request 경로에 양식 연결·고객 접수 번호 표시 |
| 결제·환불/배송 | 상용 비활성(미승인) | 실제 사업자/PG/배송 계약 후 별도 개발. 포트폴리오에서는 영업 확정으로 가장하지 않음 |
| ERP Outbox | `lr_test` 내부 테스트로 구현됨 | 운영 ERP 실연동 없이 모의 이벤트 재현/관리자 현황만 노출 |
| UI/사진 | 기본 UI·반응형/시각 QA | 안전한 라이선스 이미지·상품 검수·UI 고도화(이슈 #19) |

## 시연 실행 기준

로컬/격리 CI: MySQL `lr_test`, `NODE_ENV=test`, `APP_MODE=demo`, `DB_NAME=lr_test`, CORS에 올바른 웹 origin 지정, Expo `EXPO_PUBLIC_API_URL`에 테스트 API 주소 지정. 실제 개인정보·카드/주소/계약 정보를 입력하지 않는다. `POST /experience/orders`는 이 격리 조건에서만 접수 레코드를 저장한다.

실제로 호스팅된 **공개 포트폴리오 사이트**가 이미 배포되었다는 의미는 아니다. 사용자가 결제 사실을 오해하지 않도록 **주문 제출·결과 화면에만 정확한 안내**를 배치하며, 수령 주소는 샘플 선택지만 제공한다. 출시를 위한 운영 정책 POL-01~05, PG·운영 보안 승인 별도.
