# luxuryRental — 실시간 프로젝트 상태 기준표

**작성 기준:** 2026-11-02 · **원칙:** GitHub 커밋/PR/실행 로그로만 구현·QA 성공 판정. 이 문서는 최신 커밋에 맞춰 각 완료된 *개발 패키지*에서만 갱신하며, 나머지 상세 문서(M0~M2)는 필요할 때만 열람한다.

| 영역 | 현재 근거 | 판정 |
|---|---|---|
| M0 소스 실사 | [SOURCE_AUDIT.md](SOURCE_AUDIT.md) | 코드 정적 실사 완료; 운영 DB 실데이터 미검증 |
| M1 요구사항·데이터·API 계약 | [REQUIREMENTS.md](REQUIREMENTS.md), [DATA_MODEL.md](DATA_MODEL.md), [API_CONTRACT.md](API_CONTRACT.md) | 설계 기준선 완료, POL-01~05 영업 정책 미승인 |
| M2 고객 UI | [PR #2](https://github.com/nalkarowndal/lR/pull/2) main 병합, [모바일 CI](https://github.com/nalkarowndal/lR/actions/runs/41377221725) | Expo 5탭·시연 UI 코드 및 타입·번들 통과, Android/iOS 실기기 시각 QA 미실행 |
| M3.1 Node API·MySQL | [PR #3](https://github.com/nalkarowndal/lR/pull/3) main 병합, [CI](https://github.com/nalkarowndal/lR/actions/runs/41377221663) | Express/MySQL 읽기·시연 견적 API, 테스트 9/9 |
| M3.2 내부 재고 홀드 | [PR #4](https://github.com/nalkarowndal/lR/pull/4), [CI](https://github.com/nalkarowndal/lR/actions/runs/41378216156) | **main 병합 완료**, 격리 DB 통합 18/18 PASS. 내부 API 재사용 |
| M3.3 인증·RBAC·홀드 API | [PR #7](https://github.com/nalkarowndal/lR/pull/7), [PR #8](https://github.com/nalkarowndal/lR/pull/8), [CI](https://github.com/nalkarowndal/lR/actions/runs/41380191605), [설명](M3_3_AUTH_HOLD_API.md) | **main 병합 완료·시연 구현 통과**, MySQL/API 33/33 + Expo CI PASS. 운영회원·결제 출시 불가 |
| M4 고객 API 연결 | [PR #9](https://github.com/nalkarowndal/lR/pull/9), [Node live CI](https://github.com/nalkarowndal/lR/actions/runs/41381735806), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41381735807), [M4 문서](M4_MOBILE_API.md) | **main 병합: 상품·검색·상세·가용성·견적 API 연결**, API 34/34 + 실제 HTTP 4/4 + 모바일 14/14 PASS. Android/iOS 시각 QA 미실행 |
| M4-N Chromium 시각 QA | [PR #11](https://github.com/nalkarowndal/lR/pull/11), [CI](https://github.com/nalkarowndal/lR/actions/runs/41383695339), [스크린샷](https://github.com/nalkarowndal/lR/actions/runs/41383695339/artifacts/13114721964), [명세](M4N_WEB_QA.md) | **main 병합**, 360·390·768px Chrome 모바일 에뮬레이션 12/12 오프라인+3/3 API 실패 = 15/15 PASS. 실기기 Android/iOS·수동 시각 QA 미실시, [Issue #10](https://github.com/nalkarowndal/lR/issues/10) 계속 OPEN |
| M5-1 데모 로그인·정책 게이트 | [PR #12](https://github.com/nalkarowndal/lR/pull/12), [mobile CI](https://github.com/nalkarowndal/lR/actions/runs/41385121007), [Node/MySQL](https://github.com/nalkarowndal/lR/actions/runs/41385121036), [Chromium](https://github.com/nalkarowndal/lR/actions/runs/41385121132), [미승인 정책표](M5_1_POLICY_GATE.md) | **main 병합** · 모바일 21/21, API 35/35, HTTP 5/5, Chromium 21/21 PASS. 실사용자·실결제·네이티브 SecureStore QA 미검증 |
| M5-2A 테스트 전용 모의 결제 원장 | [PR #15](https://github.com/nalkarowndal/lR/pull/15), [API/MySQL CI](https://github.com/nalkarowndal/lR/actions/runs/41390133467), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41390133334), [설계](M5_2_SANDBOX_LEDGER.md) | **main 병합** · Node API 46/46 + 실제 HTTP 5/5 + 모바일 21/21 PASS. **내부 mock만 구현** · 실PG/환불/렌탈 확정/재고 SOLD 연결 없음 |
| M5-2B1 Toss 보안 검증 경계 | [PR #16](https://github.com/nalkarowndal/lR/pull/16), [API CI](https://github.com/nalkarowndal/lR/actions/runs/41391225316), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41391225393), [문서](M5_2B_TOSS_BOUNDARY.md) | **main 병합**, Node/MySQL **60/60**, 실제 HTTP **5/5**, 모바일 **21/21** PASS. **내부 HMAC+mock 조회 검증만**, 실 Toss API·공개 웹훅·결제 승인 미연결 |
| UX-A 찜·캘린더 QA | [PR #17](https://github.com/nalkarowndal/lR/pull/17), [Chromium CI](https://github.com/nalkarowndal/lR/actions/runs/41394900864), [문서](UX_A_WISHLIST_CALENDAR_QA.md) | **main 병합** · Chromium 오프라인 27/27 + API 장애 6/6, Expo CI PASS. 360px 달력/반납일 제외·찜 목록 검증. 메모리 찜은 새로고침 시 사라짐 |
| UX-BC 상품·검색·반응형 | [PR #18](https://github.com/nalkarowndal/lR/pull/18), [Chromium CI](https://github.com/nalkarowndal/lR/actions/runs/41396560622), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41396560623), [문서](UX_BC_PRODUCT_DISCOVERY.md) | **main 병합** · Chromium 오프라인 34/34 + API 장애 6/6, Expo CI PASS. 이미지 HTTPS+alt 표시·시연 일러스트·상세 CTA·검색 필터·태블릿 3~4열. **실제 제품 사진 미공급** |
| M5-2B2A Toss 테스트 결제 조회 어댑터 | [PR #20](https://github.com/nalkarowndal/lR/pull/20), [Node CI](https://github.com/nalkarowndal/lR/actions/runs/41404347499), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41404347557), [문서](M5_2B2_SANDBOX_LOOKUP.md) | **main 병합**, API/MySQL **71/71**, HTTP **5/5**, 모바일 **25/25** PASS. 내부 HTTPS GET 어댑터+신선도 검증, **모의 HTTP 응답만 CI 검증**·실토스 샌드박스 미연결 |
| M5-2B2B 이벤트 영속 재대조·감사 | [PR #21](https://github.com/nalkarowndal/lR/pull/21), [Node/MySQL CI](https://github.com/nalkarowndal/lR/actions/runs/41405957084), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41405957061), [문서](M5_2B2B_RECONCILIATION.md) | **main 병합** · API/MySQL **83/83**, HTTP **5/5**, 모바일 **25/25 PASS**. 서명된 모의 PG 상태 영속 기록 및 중복·동시성·감사. 결제 확정 아님 |
| M5-2C 실PG 샌드박스/사업 정책 승인 | [Issue #14](https://github.com/nalkarowndal/lR/issues/14) | **실제 PG 연결/테스트 키/운영 데이터·정산/환불 미완료**, POL-01~05 미승인. 상용 출시 차단 |
| M5-3A 수선·위탁 신청·관리자 RBAC | [PR #23](https://github.com/nalkarowndal/lR/pull/23), [Node/MySQL CI](https://github.com/nalkarowndal/lR/actions/runs/41407821483), [Expo CI](https://github.com/nalkarowndal/lR/actions/runs/41407821496), [문서](M5_3A_SERVICE_REQUESTS.md) | **main 병합** · API/MySQL **94/94**, HTTP **5/5**, 모바일 **25/25 PASS**. 고객 본인 신청/조회/취소, 관리자 RBAC/상태머신·동시 멱등·감사. **test-only**; 실물 수선/위탁·ERP 미연동 |
| M5-3B 안전한 ERP Outbox 기반 | [Issue #24](https://github.com/nalkarowndal/lR/issues/24) | **다음 작업** · 모의 이벤트 Outbox/재처리/ERP 주입형 adapter 테스트만, 운영 ERP/원본 웹 연동 금지 |
| M6 실기기·시각·성능·보안 | 없음 | 완료 주장 불가 |

## 변경하지 않는 안전 제한
- 기존 [luxuryRental 웹](https://github.com/nalkarowndal/567890) 및 운영 MySQL **수정 금지**. 모든 자동화 DB는 `lr_test` 전용.
- 인증이 없는 사용자 입력 `actorId`를 신뢰하지 않음. 예약 홀드·결제·사용자 상태 변경 API는 인증/권한/소유권/동시성 테스트 통과 전 외부 공개 금지.
- Figma 검수 및 운영 정책 미승인 상태를 앱 출시 승인으로 간주하지 않음.

## 우선순위 잠금 — 원래 개발 단계 먼저 (2026-11-02 사용자 결정)

**다음 "작업 시작/다음 단계" 요청은 스크린샷 UI 고도화가 아니라 기존 기능 로드맵에서 이어간다.**
1. **M5-2B2:** [PR #21](https://github.com/nalkarowndal/lR/pull/21)에서 격리 DB의 결제 재대조를 구현·검증. 실제 PG 테스트 키·실통신·영업 정책은 [Issue #14](https://github.com/nalkarowndal/lR/issues/14)에서 **출시 보류 게이트로 유지**, 실결제·환불 계속 차단.
2. **M5-3:** [PR #23](https://github.com/nalkarowndal/lR/pull/23)에서 테스트 수선·위탁 API/RBAC **완료**. 다음 [Issue #24](https://github.com/nalkarowndal/lR/issues/24)에서 격리 Outbox·ERP 테스트 어댑터를 작은 PR/CI 단위로 개발. 운영 ERP 연동은 별도 승인 후.
3. **M6:** 기존 서비스의 기능·보안·성능·실기기 필수 QA 및 출시 게이트를 점검하고 차단 오류 해결. 실기기 QA 미완료([Issue #10](https://github.com/nalkarowndal/lR/issues/10)).
4. **마지막에 UX-D:** 스크린샷 기반 추가 디자인/상품 사진/상세/반응형 시각 고도화([Issue #19](https://github.com/nalkarowndal/lR/issues/19))를 재개. 현재 **후순위 백로그**이며 새 UX PR을 먼저 시작하지 않음.

기존 [UX-A PR #17](https://github.com/nalkarowndal/lR/pull/17)와 [UX-BC PR #18](https://github.com/nalkarowndal/lR/pull/18)의 병합 결과는 그대로 유지. 기능 불량·접근성·보안상 필수 QA는 기존 단계 중에도 수행한다. 외부 사업 정책 승인이나 테스트/실기기 증거가 없으면 완료·출시 가능이라고 표기하지 않는다.

## 다음 연속 작업 패키지

**M5-3A 수선·위탁 시연 API 및 RBAC 병합 완료, 다음 M5-3B Outbox 안전 연계 준비:** API/MySQL 94/94, HTTP 5/5, 모바일 25/25 PASS. 실제 PG 테스트 키·운영 정책 승인은 여전히 미완료. 실제 Android/iOS 기기·접근성, 운영 계정·PG·보증금/취소/물류 정책 미승인으로 **상용 출시 Gate는 미통과**.

1. M4-N: Chromium 화면 QA를 [UX-A PR #17](https://github.com/nalkarowndal/lR/pull/17)와 [UX-BC PR #18](https://github.com/nalkarowndal/lR/pull/18)에서 확장했고 최신 브라우저 **40/40 PASS**. [Issue #10](https://github.com/nalkarowndal/lR/issues/10)의 실제 Android/iOS·VoiceOver/TalkBack·스크린샷 수동 판독 및 Expo Doctor 확인은 **계속 미완료**.
2. M5-1: 데모 계정 UI와 SecureStore 네이티브 저장 코드는 [PR #12](https://github.com/nalkarowndal/lR/pull/12)에서 구현·테스트 통과. **운영 정책은 아직 확정하지 않음**. [M5-1 정책표](M5_1_POLICY_GATE.md) 승인 전 실제 결제·회원가입 차단, 네이티브 실기기 보안 저장소 검증 필요.
3. M5-2: [PR #15](https://github.com/nalkarowndal/lR/pull/15) 모의 원장, [PR #16](https://github.com/nalkarowndal/lR/pull/16) HMAC, [PR #20](https://github.com/nalkarowndal/lR/pull/20) 읽기 전용 PG 테스트 어댑터, [PR #21](https://github.com/nalkarowndal/lR/pull/21) **영속 상태 재대조 83/83 PASS**. 실제 Toss 테스트 계정/키·사업 정책 승인은 [Issue #14](https://github.com/nalkarowndal/lR/issues/14)에서 보류. 운영 PG·환불·예약 확정 비활성 유지.
4. M5-3: [PR #23](https://github.com/nalkarowndal/lR/pull/23)에서 수선·위탁 신청/본인 조회·취소/관리자 RBAC **검증 완료**. 다음 [Issue #24](https://github.com/nalkarowndal/lR/issues/24)에서 **격리 Outbox·모의 ERP 어댑터**, 실제 운영 ERP·사진 업로드는 별도 안전 게이트로 유지하고 기존 웹 `567890` 보존.
5. UX-D: [Issue #19](https://github.com/nalkarowndal/lR/issues/19)에서 승인된 **실제 상품 사진** 사용권·공급 API·CDN/alt·관리자 검수와 Android/iOS 실기기 이미지 QA 필요. 현재 상품 사진 대신 시연용 일러스트를 표시.
6. M6: 네이티브 E2E/회귀/보안/시각/성능·접근성·운영 릴리스 게이트.

**CI 현황:** npm workspace에 현재 `package-lock.json`이 없음. 매번 의존성 버전 선택이 달라질 수 있어 **다음 인프라 패키지에서 lockfile 생성 및 `npm ci`로 이전 필수**. 현행 `npm install`+캐시는 임시 조치일 뿐 재현성 완료가 아님.

## 상태 갱신 규칙
한 패키지 종료마다 6줄만 갱신한다: 목표/변경 파일/PR·커밋/자동테스트 URL/남은 위험/다음 기능 패키지. 긴 페이즈 보고서 또는 전체 소스 재요약은 요청이 있을 때만 작성.
