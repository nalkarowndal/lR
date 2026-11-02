# M5-2B2A — 서버 전용 Toss 테스트 결제 조회 어댑터

**범위:** 기존 [M5-2B1 서명 검증](M5_2B_TOSS_BOUNDARY.md)을 보완해, 토스페이먼츠의 읽기 전용 `GET /v1/payments/{paymentKey}` HTTPS 조회를 테스트 환경에서 구성할 수 있도록 함. **앱/API 공개 라우트 없음, 실제 PG 호출 CI 실행 없음, 주문 원장 미변경, 결제 승인·취소·환불 없음**.

## 신규 구현
- `apps/api/src/toss-sandbox-lookup.ts` — `createTossSandboxLookup`는 제공자 고정 호스트 `https://api.tosspayments.com`, `GET` 전용, Basic `base64(test_sk_* + ':')` 인증 사용.
- 공급자 `test_sk_` 형식의 **테스트 키**만 허용하고 `NODE_ENV=test` 및 `DB_NAME=lr_test` 아닌 실행 컨텍스트에서 즉시 차단. 실제 키 값을 소스코드나 CI에 넣지 않음. (단위 테스트에서 사용하는 `test_sk_FICTIONAL_...`은 **발급되지 않은 합성 문자열**.)
- `AbortSignal.timeout` 기본 3초(250~5000ms 제한), 자동 재시도 없음. `redirect:'error'`, GET 외 동작 없음, 민감 정보가 포함된 예외/PG 오류 본문 로깅·노출 금지.
- HTTP 실패, 잘못된 content-type, 최대 64KiB 초과 응답, JSON 구조/금액 불일치·응답 paymentKey 불일치는 실패-차단.
- `freshTossTransmissionTime`: `tosspayments-webhook-transmission-time`을 기준 시각 앞뒤 5분 이내로만 허용. `inspectFreshTossSandboxEvent`는 만료/미래 전송을 PG 조회 **전에** 거절하고, 기존 HMAC+주문/금액/가맹점·상태 교차 대조를 재사용. **시간 제한만으로 리플레이 방지가 완료된 것은 아니며 영속적 DB 멱등성/PG reconciliation도 필요**.

## CI & 테스트
Node 22, `node --import tsx --test tests/*.test.ts`와 MySQL 8.4; 테스트에서는 `fetcher`에 **합성 HTTP 응답**을 주입. 네트워크 접속·진짜 API 키·결제 트랜잭션 없음.
검증 항목: Basic 헤더 형식, URL 고정/경로 인코딩, 운영 키 차단, HTTP 실패/리디렉션, 리소스 고갈, JSON/금액 유효성, 예외에서 비밀키 비노출, 한 번의 GET만 호출, 전송시각 만료 및 실제 HMAC과 조회 교차 대조. PR CI 결과를 기록해야 완료로 표기.

## 남은 M5-2B2 및 M5-3
- **실제 테스트 환경 통신 검증은 미실행**: 공급자 계약·테스트 계정·발급받은 test key를 GitHub Actions Secrets 혹은 별도 시크릿 저장소에 주입하고, 운영/라이브 키 자동 차단 후 서버 간 HTTPS 통합 검사를 별도로 실행해야 함.
- `eventId`가 없는 이벤트, 결제 재조회 후 DB 감사/재처리, 서명키 회전/시간 동기화, 중복 웹훅 영속 처리, 데이터 보존·승인된 `PolicyVersion` 추가 필요.
- 실제 주문/렌탈 확정·실결제·환불/보증금은 [Issue #14](https://github.com/nalkarowndal/lR/issues/14)의 POL-01~05 승인 전까지 열지 않음.
- [Issue #19](https://github.com/nalkarowndal/lR/issues/19) 스크린샷/상품 이미지 고도화는 **M5-2/M5-3/M6 이후로 후순위**.

공식 문서: [Toss 인증 헤더·보안](https://docs.tosspayments.com/reference/using-api/authorization), [결제 조회](https://docs.tosspayments.com/reference), [Node AbortSignal](https://nodejs.org/docs/latest-v22.x/api/globals.html).
