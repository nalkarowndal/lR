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
| M5-2B 실PG 샌드박스/정책·정산/ERP | [Issue #14](https://github.com/nalkarowndal/lR/issues/14) | 실제 PG·운영 데이터·정산/ERP 미연동; **POL-01~05 미승인**, 상용 출시 차단 |
| M6 실기기·시각·성능·보안 | 없음 | 완료 주장 불가 |

## 변경하지 않는 안전 제한
- 기존 [luxuryRental 웹](https://github.com/nalkarowndal/567890) 및 운영 MySQL **수정 금지**. 모든 자동화 DB는 `lr_test` 전용.
- 인증이 없는 사용자 입력 `actorId`를 신뢰하지 않음. 예약 홀드·결제·사용자 상태 변경 API는 인증/권한/소유권/동시성 테스트 통과 전 외부 공개 금지.
- Figma 검수 및 운영 정책 미승인 상태를 앱 출시 승인으로 간주하지 않음.

## 다음 연속 작업 패키지

**M5-2A 테스트 주문/모의 이벤트 원장 검증 완료, M5-2B 운영·샌드박스 게이트 준비:** M4~M5-2A 자동 검증 완료. 실제 Android/iOS 기기·접근성, 운영 계정·PG·보증금/취소/물류 정책 미승인으로 **상용 출시 Gate는 미통과**.

1. M4-N: Chromium **웹 에뮬레이션 QA 15/15 PASS, PR #11 병합**. [Issue #10](https://github.com/nalkarowndal/lR/issues/10)의 실제 Android/iOS·VoiceOver/TalkBack·스크린샷 수동 판독 및 Expo Doctor 확인은 **계속 미완료**.
2. M5-1: 데모 계정 UI와 SecureStore 네이티브 저장 코드는 [PR #12](https://github.com/nalkarowndal/lR/pull/12)에서 구현·테스트 통과. **운영 정책은 아직 확정하지 않음**. [M5-1 정책표](M5_1_POLICY_GATE.md) 승인 전 실제 결제·회원가입 차단, 네이티브 실기기 보안 저장소 검증 필요.
3. M5-2: [PR #15](https://github.com/nalkarowndal/lR/pull/15)에서 **테스트 내부 주문 원장·서버 재계산·멱등성·감사 로그 46/46 PASS**. 다음 M5-2B는 [Issue #14](https://github.com/nalkarowndal/lR/issues/14)의 정책 승인·실제 PG **샌드박스 연동 보안 게이트**이며, 운영 결제/재고 확정은 미활성 유지.
4. M5-3: 수선 사진/위탁/관리자·원본 ERP 연계는 API·권한·모바일 UX를 각각 검증하며 기존 원본 RecruitApp을 보존.
5. M6: 네이티브 E2E/회귀/보안/시각/성능·접근성·운영 릴리스 게이트.

**CI 현황:** npm workspace에 현재 `package-lock.json`이 없음. 매번 의존성 버전 선택이 달라질 수 있어 **다음 인프라 패키지에서 lockfile 생성 및 `npm ci`로 이전 필수**. 현행 `npm install`+캐시는 임시 조치일 뿐 재현성 완료가 아님.

## 상태 갱신 규칙
한 패키지 종료마다 6줄만 갱신한다: 목표/변경 파일/PR·커밋/자동테스트 URL/남은 위험/다음 기능 패키지. 긴 페이즈 보고서 또는 전체 소스 재요약은 요청이 있을 때만 작성.
