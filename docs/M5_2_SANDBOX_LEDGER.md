# M5-2A — 테스트 주문·모의 PG 이벤트 원장 (2026-11-02)

**구현 상태:** PR/CI 통과 여부에 따라 갱신. 본 파일의 코드는 **`NODE_ENV=test` + `DB_NAME=lr_test`** 에서만 작동하며, Express 공개 라우트에 연결되지 않았다. PG 사업자의 테스트 API를 호출하거나 정식 결제를 승인하지 않는다.

## 구현 범위
- `lr_demo_orders`: 기존 고객의 **서버 소유 확인된 활성 RENTAL hold 1개 ↔ 테스트 주문 1개**. 별도 주문/가격을 신뢰하지 않음.
- 원단위 정수 계산: server rental offer daily rate × `[startDate,returnDate)` 일수 + server deposit; 현재 shipping/discount는 **임의 정책으로 적용하지 않음**.
- `lr_demo_payment_events`: 내부 전용 `applyVerifiedMockEvent` 테스트. 웹훅에서 주장한 금액·상태·주문번호를 그대로 신뢰하지 않고, **주입된 trusted mock PG 조회 함수의 결제 데이터**와 금액/주문/가맹점/상태를 비교한다.
- `lr_demo_payment_audit`: 상태 전이 기록. 복수 전달된 동일 `eventId`는 중복 기록/중복 상태 전이가 되지 않음.
- 결제 성공 시 `SIMULATED_PAID` 기록만 남김. **real rental/order 미생성, inventory hold CONSUMED 처리 없음, physical unit SOLD 처리 없음, 입금/환불 불가.**
- 만료 홀드, 승인 후 취소 이벤트, 실패 후 완료 이벤트는 `REVIEW_REQUIRED` 또는 실패로 처리하며 자동 환불을 시도하지 않음.
- 20중 동시 요청 / 20개 중복 모의 이벤트 / 금액 변조·위조 상태 / 소유권 / 유효기간 / 역순 이벤트 / 501 출시 차단 API 검증.

## 신뢰 경계와 금지 항목
- 이 함수는 내부 **mock adapter** 만 사용. 실제 PG의 콜백 서명 검증·실결제 조회·상태 취소·재처리·보안 로그 등의 운영 모듈은 **구현되지 않았다.**
- 실제 결제 처리는 인증과 멱등성 외에도 PG **서명 검증 + 조회 API의 orderId·amount·mId·status 교차 확인**이 필수다. [토스 공식 보안 체크리스트](https://docs.tosspayments.com/reference/using-api/security-checklist)와 [이벤트 사양](https://docs.tosspayments.com/reference/using-api/webhook-events) 참조. **모의 구현을 실제 토스 PG 웹훅 검증이라고 주장하지 않음.**
- `lr_test` 외에서 코드 호출 실패-차단. 데모 물품/`demo-only` 정책만 허용. 운영 정책 POL-01~05는 [M5-1 승인표](M5_1_POLICY_GATE.md) 기준 모두 **미승인**.
- 기존 웹 `nalkarowndal/567890`, 운영 MySQL, 실제 카드/은행·개인정보, 모바일 결제 UI는 변경하지 않음.
- 네이티브 실기기 검수 [Issue #10](https://github.com/nalkarowndal/lR/issues/10) 여전히 필요.

## 다음 패키지 M5-2B (승인 전)
- 먼저 실거래가 불가능한 상태에서 `PolicyVersion` 승인 워크플로·별도 가상 PG adapter 설계, 교차 주문 이벤트 충돌·리컨실리에이션·롤백·락 순서 고도화.
- Toss 또는 승인된 공급자의 샌드박스 테스트 키/서명/승인 흐름은 별도 보안 연결에서 검증. **GitHub 저장소에 키 하드코딩 금지**.
- 취소·환불·보증금·물류 수수료 및 고객 고지는 사용자/영업·법률 책임자 승인 이후만 실제 구현·오픈.
- CI에서 `npm ci` 및 잠금 파일 도입·실기기 E2E도 별도 확인해야 한다.

## 검증
GitHub Actions MySQL 8.4 테스트 환경 `npm run db:migrate:test`, `npm run api:build`, `npm run api:test`, `node --experimental-strip-types --test ...` 로 검증하며 PR에 실행 URL을 남긴다.
