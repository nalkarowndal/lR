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
