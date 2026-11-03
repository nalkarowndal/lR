# M6-1B6 — luxuryRental 웹 포트폴리오 QA 범위 결정

**결정일:** 2026-11-03 · **근거:** 사용자 명시 요청에 따라 웹 브라우저 확인 이후 Android/iOS 실기기/시뮬레이터 검증을 생략한다. **본 문서는 작업 범위 합의이며, QA를 실행했다고 주장하지 않는다.**

## 1. 검증 대상: Web-first portfolio

- 기준 코드: GitHub `nalkarowndal/lR`의 `main/lR/`. Expo Router/React Native Web 앱 5탭은 유지하고, Node/Express API와 분리된 테스트 MySQL `lr_test`만 사용한다.
- 브라우저: Playwright Chromium의 **360, 390, 768, 1024px 등 구성된 viewport**에서 홈/렌탈/스토어/수선/마이, 상품 목록·검색·상세, 달력·견적, 찜/장바구니, 오류·빈 상태·뒤로가기 확인. 실제 지원 viewport 범위는 테스트 설정·CI 결과로만 주장한다.
- API: 격리된 테스트 서버로 인증/권한, 재고·견적·홀드, 모의 결제 원장, 상태 재대조, ERP outbox의 적합성·멱등·장애 처리를 검증한다. **브라우저 샘플 모드와 실제 API 통합 테스트는 각각 근거를 분리**하고 미검증 end-to-end를 과장하지 않는다.
- 증거: GitHub Actions 실행 URL, 테스트 수/결과, 실패 재현 방법, 민감정보가 제거된 스크린샷/로그/코드 SHA. 회귀 테스트 성공 후 PR로 main 병합.
- 현재 최신 근거(새로 실행한 것이 아님): [Chromium 40/40](https://github.com/nalkarowndal/lR/actions/runs/41566763178), [모바일 25/25+Web export](https://github.com/nalkarowndal/lR/actions/runs/41566763218), [API/MySQL 106/106 + 실제 HTTP 5/5](https://github.com/nalkarowndal/lR/actions/runs/41551925928).

## 2. 명시적으로 제외하는 QA

- Android/iOS **실기기**, 에뮬레이터, iOS Simulator, EAS 사인된 APK/IPA 내부배포 빌드.
- VoiceOver/TalkBack, 기기 전용 Safe Area/키보드/하드웨어 뒤로가기, 네이티브 SecureStore 저장·복구 검증.
- 제외된 항목은 `SKIPPED (USER SCOPE DECISION)`으로 기록하며 `PASS`, `검증 완료`, `앱스토어 출시 준비`로 표기하지 않는다.
- 기존 [M6-1B5 기기 검수 실행표](M6_1B5_DEVICE_QA_RUNBOOK.md)와 [Issue #10](https://github.com/nalkarowndal/lR/issues/10)은 이력으로 보존한다. 차후 실제 네이티브 출시를 원할 때만 다시 활성화한다.

## 3. 유지할 품질·안전 게이트

- `npm ci`, Expo Doctor·SDK 호환성, TypeScript, 모바일 도메인 테스트, Expo Web export, Playwright 브라우저 QA 및 API/MySQL·HTTP 통합 회귀.
- 보안 이슈 [#30](https://github.com/nalkarowndal/lR/issues/30)의 npm audit moderate 11개는 실제 해결될 때까지 미해결로 기록; 무리한 `--force`/major overrides 금지.
- 고객 실계정·운영 MySQL·PG 정산·배송/보증금/환불/계약 확정·ERP 실접속은 승인 전 금지. 원본 웹 저장소 `567890`은 그대로 보존.
- **웹 포트폴리오 검증 통과**는 사용자가 브라우저에서 시연 흐름을 경험할 수 있음을 나타내며, **상용 웹/네이티브 운영 안전성 승인**을 의미하지 않는다.

## 4. 다음 구현 순서: Issue #14

1. 렌탈 기간/가격/보증금/배송/취소·환불 데모 정책의 예시 값·버전·예외(만료, 중복, 재고 충돌)를 정의. **POL-01~05는 실제 영업 승인 미취득** 상태로 유지한다.
2. 사용자 여정: 상품→가용성→견적→모의 주문/결제 승인·실패/취소→내역·관리자 상태 확인. **현재 구현된 API/모의 원장 재사용**; 없는 기능은 구현 전 테스트(RED) 작성.
3. 가짜 결제 결과는 비밀정보 없는 테스트 DB에만 기록하며 실제 금전·실주문·배송 확정 없음. 전체 UI는 브랜드 톤을 유지하되 **결제 CTA/결과·계약으로 오인 가능한 화면은 데모 처리라는 사실을 명확히 전달**.
4. API/DB·브라우저 CI에서 성공/실패/중복 요청·금액 위변조·세션 만료·네트워크 장애 회귀 확인, 각 결과에 정확한 근거 기록.
5. 운영 계약·실PG 키·실사업 정책 승인/개인정보 수집·외부 배송연동은 별개 추후 작업이며 승인했다고 보고하지 않는다.

참고: [프로젝트 진행 현황](PROJECT_STATUS.md), [정책표](M5_1_POLICY_GATE.md), [Issue #14](https://github.com/nalkarowndal/lR/issues/14), [Expo Web 문서](https://docs.expo.dev/workflow/web/).

## 5. M5-2C1 브라우저 결제 시뮬레이션 구현

- [PR #38](https://github.com/nalkarowndal/lR/pull/38): 기존 견적→주문서 미리보기 다음에 세 가지 **브라우저 세션 내** 모의 결과(성공·실패·취소)와 마이페이지 모의 렌탈 내역을 추가. 브라우저 새로고침/로그아웃 시 삭제.
- [모바일 CI #41571483087](https://github.com/nalkarowndal/lR/actions/runs/41571483087): 모델 입력/만료/금액/정책 가드 포함 29/29, Expo Doctor·TypeScript·Web export 통과. [Chromium #41571483053](https://github.com/nalkarowndal/lR/actions/runs/41571483053): 기존+추가 브라우저 offline 43/43, API-disconnected 6/6 통과.
- **제한:** 모의 주문은 앱 메모리에만 저장. Node API `POST /api/v1/orders`와 `POST /api/v1/payments/confirm`의 501 차단을 해제하지 않으며, 결제 제공업체/운영 DB/관리자 시스템과 연결되지 않았다. [구체 명세](M5_2C1_BROWSER_DEMO_CHECKOUT.md) 참조.

## 6. M5-2C2 서버 `lr_test` 원장 관리자 조회 분리

- [PR #39](https://github.com/nalkarowndal/lR/pull/39): 서버 테스트 원장 `lr_demo_orders`에 저장된 **내부 모의 주문**과 `lr_demo_payment_audit` / `lr_demo_payment_events`를 ADMIN 역할로만 조회한다. [구체 명세](M5_2C2_ADMIN_LEDGER_READ.md).
- **C1 브라우저 세션 가짜 결제 결과는 관리자 원장에 합쳐지지 않는다**. `APP_MODE=demo`·`NODE_ENV=test`·`DB_NAME=lr_test`가 동시에 일치해야 조회 경로가 열리며, 실회원/PG/운영 MySQL은 연결되지 않는다.
- [API/MySQL #41574021033](https://github.com/nalkarowndal/lR/actions/runs/41574021033) 111/111+HTTP 5/5, [모바일 #41574021034](https://github.com/nalkarowndal/lR/actions/runs/41574021034) 33/33·Expo Web export PASS. [브라우저 #41574021124](https://github.com/nalkarowndal/lR/actions/runs/41574021124)에서 관리자 비로그인 접근 차단·기존 사용자 흐름을 검증. 실제 관리자 세션을 통한 브라우저/DB 연동 E2E는 아직 실시하지 않았다.

## 7. M5-2C3 서버 저장형 주문 경험

- [PR #40](https://github.com/nalkarowndal/lR/pull/40): 포트폴리오 **체험 주문을 서버가 실제 접수·저장**한다. 테스트 계정·안전한 주문 옵션·서버 금액·상태·접수번호는 유지되지만 **결제·예약/재고 확정·배송은 실행하지 않는다**.
- [Node API #41577706132](https://github.com/nalkarowndal/lR/actions/runs/41577706132) 116/116 + 실 HTTP 6/6, [Mobile #41577706051](https://github.com/nalkarowndal/lR/actions/runs/41577706051) 37/37·Web export, [실 API 연결 Chromium #41577706025](https://github.com/nalkarowndal/lR/actions/runs/41577706025) 3/3(360/390/768) PASS. 브라우저 고객/서버가 실제 연결된 흐름을 검증했다. 관리자 브라우저 실권한 전 구간은 API 역할 테스트와 구분.
- 고객용 `/my/experience-orders`는 실제 `lr_test` 체험 주문을 표시한다. 기존 `/my/demo-orders` 오프라인 메모리 시뮬레이션은 별개. [상세 명세](M5_2C3_PORTFOLIO_ORDER_INTAKE.md).
