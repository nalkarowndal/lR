# M5-2B1 — Toss Payments 웹훅 서명·조회 교차 검증 경계 (구현 검증 단계)

## 목적
M5-2A는 `lr_test` 내부에만 존재하는 **모의 주문/결제 원장**이다. 본 패키지는 실제 PG 연동 전에, Toss 웹훅의 **원본 바이트 서명 확인과 PG 조회 데이터 불일치 거절**을 라이브 키·네트워크 없이 검증한다. 공급자 계약, 영업 정책, PG 실거래는 **아직 미승인·미구현**이다.

## 보안 경계: `apps/api/src/toss-webhook-boundary.ts`
- `verifyTossWebhookSignature(rawBody: Buffer, headers, signingSecrets)` — JSON 파싱/정규화 전에 **원본 byte payload + ":" + transmission-time**으로 HMAC-SHA256 계산; `v1:<base64>` 서명 목록과 `crypto.timingSafeEqual` 비교. 여러 서명·키 회전 지원. 키 누락/무효·변조·서명 형식/크기 불량은 실패 차단.
- `deriveTossEventDedupKey` — 공급자 이벤트 본문 `eventId`가 있을 때만 불투명한 키 해시 생성. **`tosspayments-webhook-transmission-id`는 매 전송마다 바뀌므로 중복 제거에 쓰지 않음**. `PAYMENT_STATUS_CHANGED`에는 `eventId`가 없을 수 있으며 이 경우 `null`을 반환한다. 이를 임의의 날짜/전송 ID로 대체하지 않고 **서버 조회 및 DB paymentKey+상태 reconciliation** 절차를 추후 구현한다.
- `inspectSignedTossSandboxEvent` — 유효한 HMAC 확인 후 이벤트 본문 파싱, `PAYMENT_STATUS_CHANGED` 식별과 orderId, paymentKey 확인. **서버 주입형 테스트 조회 어댑터**의 `mId`(상점 ID), `orderId`, `paymentKey`, `totalAmount`(KRW 정수), `status`까지 교차 검증. DONE만 `SANDBOX_MATCH_ONLY`를 반환하고 취소/실패/만료/조회 오류는 `REVIEW_REQUIRED`.
- **중요:** 이 결과는 내부 데이터 판독 결과이지 예약/결제 승인 명령이 아니다. 반환값으로 `lr_demo_orders`, 재고, `lr_rentals`, `lr_inventory_holds`를 변경하지 않는다. 공급자 조회 함수는 테스트 주입에만 존재하며 실 Toss API 호출·서명키 설정·HTTP 공개 라우트는 없다.

## 검증과 보안 취약 사례
- HMAC 원문 변경·서명 변조·타임스탬프 변조·키 교체·복수 서명·위조·크기/인코딩 제한
- 서명 오류 시 결제 조회 함수 호출 금지
- 웹훅 Order spoofing, provider lookup mId/orderId/paymentKey/amount/status 불일치
- 미완료·취소·부분 취소·조회 실패 시 주문 확정 금지
- 기존 `POST /api/v1/payments/confirm`과 `/api/v1/orders`는 501, Toss 공개 웹훅 경로는 404
- 테스트 코드는 Node.js `node:test` + TypeScript `tsx` 기반. Node/MySQL CI, Expo CI 녹색을 확인 후 `main` 병합.

## 다음 단계 (Issue #14 남음)
1. 결제 사업자·통신·개인정보 처리·약관 및 POL-01~05 **영업/법률 승인**. PG 샌드박스 test key/secret은 GitHub에 커밋하지 않음.
2. PG **서버 간 HTTPS lookup adapter** 구현 시 secret manager 사용, 요청 제한/타임아웃/재시도/에러 격리 및 전자서명 검증→조회→DB 트랜잭션 구조 분리.
3. 본문에 eventId가 없는 웹훅에 대한 영속적 멱등 기준, 서명 타임스탬프 신선도 정책, 취소/부분환불/재처리/정산 전용 상태머신과 수동 재대조 작업이 필요.
4. Android/iOS 실기기/접근성 [Issue #10](https://github.com/nalkarowndal/lR/issues/10), 기존 웹 `567890`·운영 MySQL 수정 금지.
5. 본 모듈은 `apps/api/src/app.ts`에 **마운트하지 않았다**. 운영 지원/출시를 암시하지 않는다.

공식 근거: [Toss 웹훅 이벤트](https://docs.tosspayments.com/reference/using-api/webhook-events), [Toss 보안 체크리스트](https://docs.tosspayments.com/reference/using-api/security-checklist), [Node.js crypto](https://nodejs.org/docs/latest-v22.x/api/crypto.html).
