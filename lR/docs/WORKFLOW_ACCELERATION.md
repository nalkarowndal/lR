# luxuryRental 개발 작업 가속화 운영 규칙 (Lean Delivery v1)

**적용 대상:** M3.3부터 M6까지, `nalkarowndal/lR`와 기존 web `567890`의 기능 보존. **상세 구현 상태는 [PROJECT_STATUS.md](PROJECT_STATUS.md)가 우선**.

## 핵심 목표
개발 페이즈를 더 잘게 나누는 대신, **고객 가치가 있는 세로 기능 조각(vertical slice)** 단위로 요청 → 설계 차이 확인 → 구현 → 테스트 → PR 검수 → 병합을 연속 실행한다. 이전에 확인한 원본과 결과를 매번 다시 전체 분석하지 않고 SHA별 변경 부분만 파악한다.

### 요청·진행 운영
1. 사용자가 `다음 단계 시작`이라고 하면 최초 1회 GitHub `main` HEAD, 열린 PR, CI 상태, 이 `PROJECT_STATUS`를 확인.
2. 열린 PR에 **녹색 테스트와 안전 검수 근거**가 있을 때만 다음 기능의 기반으로 병합 또는 같은 브랜치에서 연속 작업. 보안/결제/운영DB/고객 데이터 변경은 추가 게이트와 승인 필수.
3. 기능당 **하나의 사용자-visible 목표**와 필요 시 2개 내외의 작은 PR을 사용한다. 권장 순서: DB/보안 계약 → 실제 API → 모바일 UI 연결. 코드/테스트/간결한 문서를 같은 PR로 묶는다.
4. 각 PR에서 `Changed Files`와 해당 Contract/Tests만 읽고, Exa/Context7 자료는 **라이브러리·API 버전 또는 새 요구사항이 바뀐 경우**에 집중 확인.
5. 매 테스트 실패마다 원인·수정·재실행을 **같은 PR에서 처리**하고 결과 링크만 보고. 다음 단계 시작을 위한 별도 메시지를 매번 요구하지 않는다.
6. PR당 무관한 변경을 혼합하지 말고 **WIP 기능 PR을 1개, 공통 인프라 PR을 1개 이하**로 제한. 사용자 승인/외부 계약이 필요한 작업은 차단 사유 기록 후 다음 안전 작업으로 진행.
7. 단계 보고는 `Completed / QA evidence / Blockers / Next` 네 필드만. 업무 중간의 결과 수치나 진행 상태는 사실 확인 전 PASS로 표기 금지.

### 우선 구현 패키지

| 패키지 | 구현 단위 | 필수 검증·Gate | 수행 방식 |
|---|---|---|---|
| M3.3 | 계정 인증·세션·RBAC 및 인증된 렌탈 홀드 API 연결 | 401/403/404, 사용자 ID 위조 차단, 같은 유닛 20건 동시성, 멱등, 세션 만료 | 작은 PR 2개로 분리하되 **연속 작업** |
| M3.4 | 상품·예약·마이 DTO 공유 / API 계약 자동화 | Node contract/schema·백워드 호환·입력검증 | 공유 타입과 서비스 테스트 함께 구현 |
| M4 | Expo 상품·가용성·견적 실 API 연결 | 로딩/오류/오프라인 상태, 본인 소유 데이터, 네이티브 QA 체크 | 1개 고객 여정 완성 단위 |
| M5 | PG 샌드박스/취소·환불·ERP/수선 | 서버 영수금액 확인, 중복 웹훅, 결제 실패→재고 복구 | 거래/관리 기능별 독립 PR, 출시 게이트 분리 |
| M6 | 회귀·보안·성능·기기/접근성 검수 | 현 HEAD 로그/스크린샷, 취약점·장애 복구, 백업·개인정보 | 위험도 기반 결함 우선 처리 |

### CI 가속 적용 원칙
- PR의 커밋을 빠르게 연속 갱신할 때 GitHub Actions `concurrency`로 같은 PR의 **이전 실행만 취소**한다. 서로 다른 PR/워크플로는 충돌시키지 않는다.
- `setup-node` npm 다운로드 캐시·`--prefer-offline`로 반복 설치 부담 완화. **npm cache는 `node_modules` 캐시가 아니며 실행시간 단축 수치를 보장하지 않는다.**
- 현재 모바일 CI는 모든 PR에 실행되어 백엔드 전용 변경도 검증함. **즉시 path 필터로 바꾸지 않음:** 필수 체크 지정 시 스킵된 워크플로가 Pending으로 남을 수 있다. GitHub 보호규칙/required-check 설정 확인 후 `changes` job + 조건부 스텝, 또는 빠른 공통 체크/모듈별 전체 체크로 통합할 것.
- **잠금 파일 부재:** `package-lock.json` 생성·커밋 후 `npm ci` 도입을 다음 기술부채 개선항목으로 지정한다. Lockfile 없이 고정 재현성을 주장하지 않는다.
- 현재 MySQL CI는 오직 합성 fixture로 `lr_test`에서만 실행. 실제 운영 DB의 스키마 변경, 테스트 계정 수집, 자동 프로덕션 배포는 절대 하지 않는다.
- 보안·금융·개인정보 관련 PR은 CI PASS만으로 자동 병합하지 않고 API·권한·복구 기준 검토를 완료해야 한다.

### 체크포인트/자동 QA
- **PR 생성 시** 템플릿에 범위, 변경 근거, 테스트 명령·실제 URL, 운영위험 및 롤백 내용을 첨부.
- **PR 마무리 시** 빌드/유닛/통합 CI, 영향받는 사용자 흐름, 주요 예외 테스트와 메모를 검토.
- **패키지 완료 시** `PROJECT_STATUS`의 링크/다음 작업만 수정. ZIP·대형 검수 보고서는 명시적으로 요청되거나 릴리스 QA일 때만 생성.
- **실제 웹/모바일 출시 전** 기기 검수, 접근성, 운영 정책, PG, 법률, 보안 확인 별도.

### 사용할 수 있는 작업 지시 예시
`lR main과 열린 PR을 확인하고 PROJECT_STATUS/WORKFLOW_ACCELERATION에 따라 다음 안전한 구현 패키지를 연속 완료하세요. 필요한 코드·테스트·GitHub PR·CI 오류수정까지 진행하고, 운영DB와 실거래는 건드리지 마세요. 완료 결과는 PR/커밋·CI 링크, 위험, 다음 작업으로 간단히 보고하세요.`

### 참고 자료
- [GitHub Actions workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub Actions workflow skip / required checks](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
- [Google: In Praise of Small Pull Requests](https://testing.googleblog.com/2024/07/in-praise-of-small-pull-requests.html)
- [Google: Software Engineering at Google — Code Review](https://abseil.io/resources/swe-book/html/ch09.html)

