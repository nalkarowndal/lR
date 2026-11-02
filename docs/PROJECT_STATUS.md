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
| M4 고객 API 연결 | 아직 PR 없음 | Expo 현재 샘플 데이터 사용 |
| M5 운영/PG/ERP | 아직 PR 없음 | 실제 PG·운영 데이터·ERP 미연동 |
| M6 실기기·시각·성능·보안 | 없음 | 완료 주장 불가 |

## 변경하지 않는 안전 제한
- 기존 [luxuryRental 웹](https://github.com/nalkarowndal/567890) 및 운영 MySQL **수정 금지**. 모든 자동화 DB는 `lr_test` 전용.
- 인증이 없는 사용자 입력 `actorId`를 신뢰하지 않음. 예약 홀드·결제·사용자 상태 변경 API는 인증/권한/소유권/동시성 테스트 통과 전 외부 공개 금지.
- Figma 검수 및 운영 정책 미승인 상태를 앱 출시 승인으로 간주하지 않음.

## 다음 연속 작업 패키지

**M4 통합 목표:** Expo의 로컬 시연 상품·견적 화면을 **Node API의 실제 조회 응답**과 연결. 구성 가능한 API Base URL, 로딩/빈 목록/오류/재시도, 테스트 환경 구분, 토큰 저장소 보안 가이드 및 계약 테스트를 우선한다.
- A/공통 API 클라이언트 + 상품 상세·검색·가용성: API 계약, 시연 데이터 격리
- B/견적/임시 홀드 UI는 **별도의 동의·정책 결정과 안전한 세션 저장 방법 검증** 후 연동; 실제 주문/PG는 여전히 501
- **M4 완료 조건:** 고객 화면에서 테스트용 Node API로 읽기/견적 흐름 검증 + Android/iOS 시각 검수 증거(또는 미실시 명시)
- **운영/출시 차단:** 이메일 본인 확인, 분산 로그인 레이트 리밋, 승인된 개인정보 처리·보증금·물류/취소 정책, PG, 운영 DB 마이그레이션/감사로그, 원본 앱 데이터 검증.

**CI 현황:** npm workspace에 현재 `package-lock.json`이 없음. 매번 의존성 버전 선택이 달라질 수 있어 **다음 인프라 패키지에서 lockfile 생성 및 `npm ci`로 이전 필수**. 현행 `npm install`+캐시는 임시 조치일 뿐 재현성 완료가 아님.

## 상태 갱신 규칙
한 패키지 종료마다 6줄만 갱신한다: 목표/변경 파일/PR·커밋/자동테스트 URL/남은 위험/다음 기능 패키지. 긴 페이즈 보고서 또는 전체 소스 재요약은 요청이 있을 때만 작성.
