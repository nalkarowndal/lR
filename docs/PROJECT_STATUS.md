# luxuryRental — 실시간 프로젝트 상태 기준표

**작성 기준:** 2026-11-02 · **원칙:** GitHub 커밋/PR/실행 로그로만 구현·QA 성공 판정. 이 문서는 최신 커밋에 맞춰 각 완료된 *개발 패키지*에서만 갱신하며, 나머지 상세 문서(M0~M2)는 필요할 때만 열람한다.

| 영역 | 현재 근거 | 판정 |
|---|---|---|
| M0 소스 실사 | [SOURCE_AUDIT.md](SOURCE_AUDIT.md) | 코드 정적 실사 완료; 운영 DB 실데이터 미검증 |
| M1 요구사항·데이터·API 계약 | [REQUIREMENTS.md](REQUIREMENTS.md), [DATA_MODEL.md](DATA_MODEL.md), [API_CONTRACT.md](API_CONTRACT.md) | 설계 기준선 완료, POL-01~05 영업 정책 미승인 |
| M2 고객 UI | [PR #2](https://github.com/nalkarowndal/lR/pull/2) main 병합, [모바일 CI](https://github.com/nalkarowndal/lR/actions/runs/41377221725) | Expo 5탭·시연 UI 코드 및 타입·번들 통과, Android/iOS 실기기 시각 QA 미실행 |
| M3.1 Node API·MySQL | [PR #3](https://github.com/nalkarowndal/lR/pull/3) main 병합, [CI](https://github.com/nalkarowndal/lR/actions/runs/41377221663) | Express/MySQL 읽기·시연 견적 API, 테스트 9/9 |
| M3.2 내부 재고 홀드 | [PR #4](https://github.com/nalkarowndal/lR/pull/4), [CI](https://github.com/nalkarowndal/lR/actions/runs/41378216156) | Draft PR, 격리 DB 통합 18/18 PASS. **main 미병합, 고객용 비공개** |
| M3.3 인증·RBAC·홀드 API | 아직 PR 없음 | 미착수; 인증 뒤 연결 필요 |
| M4 고객 API 연결 | 아직 PR 없음 | Expo 현재 샘플 데이터 사용 |
| M5 운영/PG/ERP | 아직 PR 없음 | 실제 PG·운영 데이터·ERP 미연동 |
| M6 실기기·시각·성능·보안 | 없음 | 완료 주장 불가 |

## 변경하지 않는 안전 제한
- 기존 [luxuryRental 웹](https://github.com/nalkarowndal/567890) 및 운영 MySQL **수정 금지**. 모든 자동화 DB는 `lr_test` 전용.
- 인증이 없는 사용자 입력 `actorId`를 신뢰하지 않음. 예약 홀드·결제·사용자 상태 변경 API는 인증/권한/소유권/동시성 테스트 통과 전 외부 공개 금지.
- Figma 검수 및 운영 정책 미승인 상태를 앱 출시 승인으로 간주하지 않음.

## 다음 연속 작업 패키지
**M3.3 통합 목표:** 로그인/세션 → DB 기반 역할/소유권 검증 → 인증된 사용자의 임시 렌탈 홀드 API → 401/403/409·멱등성·20건 동시성 테스트 → Expo 연결 가능 DTO 명세.
- A/인증+RBAC: 별도 PR (테스트: 잘못된 세션/권한/타 사용자 거부)
- B/홀드 API 연결: A를 기반으로 별도 PR (테스트: 현재 홀드 서비스 재사용, 재고 충돌과 멱등성)
- **이 두 PR을 하나의 사용자 요청/개발 목표로 연속 처리**하며 매번 다음 단계 착수 허락을 요구하지 않는다. 단 실제 서비스 로그인/결제 공개는 승인 게이트 적용.
- **M3.3 완료:** 두 PR 변경이 main에 안전하게 병합되고 현재 커밋의 테스트·보고가 존재할 때만 사용.
- **다음 기능 통합:** M4 Expo API client 연계 및 오류/로딩 UI, M5 샌드박스 결제/수선/관리자 작업, M6 기기 QA.

**CI 현황:** npm workspace에 현재 `package-lock.json`이 없음. 매번 의존성 버전 선택이 달라질 수 있어 **다음 인프라 패키지에서 lockfile 생성 및 `npm ci`로 이전 필수**. 현행 `npm install`+캐시는 임시 조치일 뿐 재현성 완료가 아님.

## 상태 갱신 규칙
한 패키지 종료마다 6줄만 갱신한다: 목표/변경 파일/PR·커밋/자동테스트 URL/남은 위험/다음 기능 패키지. 긴 페이즈 보고서 또는 전체 소스 재요약은 요청이 있을 때만 작성.
