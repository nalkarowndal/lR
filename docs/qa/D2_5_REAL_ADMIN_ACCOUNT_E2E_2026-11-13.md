# D2-5 — 테스트 계정 관리자 접근 제어 E2E 검수 (2026-11-13)

## 범위 / 제외

- 대상: `nalkarowndal/lR`, Draft PR #50, `qa/d2-3-integrated-icon-visual`.
- **Android/iOS 실기기 및 모바일 OS 전용 QA는 사용자 요청으로 검수 범위에서 제외**한다. 최종 승인 필수 게이트로도 취급하지 않는다.
- 운영 서비스 도메인, 기존 계정, 실고객 DB, OAuth 공급자 계정, 실제 이메일/문자 발송을 사용하지 않는다.
- 각 검수마다 OS 임시 디렉터리에 별도의 SQLite DB를 생성한다. 서버는 127.0.0.1에 바인딩하며, 검수 종료 시 DB를 삭제한다.
- 브라우저 계정은 랜덤 임시 비밀번호를 사용한다. 테스트 토큰/비밀번호를 로그, 스크린샷 및 GitHub 아티팩트에 기록하지 않는다.

## 접근 제어 모델

| Actor | 수단 | /api/v1/admin/* | 관리자 화면 |
| --- | --- | --- | --- |
| 비로그인 | 요청/직접 화면 이동 | 403 | 차단 |
| 일반 사용자 (USER) | 실제 등록 또는 이메일 로그인 API 세션 | 403 | 메뉴 숨김 / 직접 진입 차단 |
| 관리자 (ADMIN) | 테스트 DB에만 생성한 관리자 + 실제 이메일 로그인 API 세션 | 허용 (정상 입력 시 200/201) | 메뉴 노출 / 대시보드 표시 |
| 위조 토큰·권한 헤더 | 잘못된 Bearer, x-user-role=ADMIN, 잘못된 x-admin-key | 403 | 실제 서버 권한을 획득하지 못함 |
| 권한 회수/세션 만료/로그아웃 | 기존 ADMIN 세션 | 403 | 이후 보호 API 접근 불가 |

실제 세션 권한은 React UI 표시나 클라이언트 헤더가 아닌 SQLite `users.role`을 기반으로 `requireAdmin`에서 검사한다.

## 검증 내용과 결과

### 백엔드 실제 HTTP 인증·인가

- `backend/tests/admin-role-e2e.test.js`: 독립 SQLite 사용자/관리자 생성 및 실제 POST `/auth/register`, `/auth/login`.
- USER 가입 요청에 `role: ADMIN` 필드를 주입해도 생성 역할이 USER인지 확인.
- 틀린 관리자 비밀번호 401, 올바른 사용자/관리자 로그인 200 및 역할 확인.
- `admin/products`, `admin/recruit/requests`, `admin/workers`, `admin/messages`, `admin/sell-requests` GET: 비로그인 / USER / 헤더 위조 / 임의 토큰 차단, ADMIN 허용.
- 관리자 전용 상품 POST/DELETE: USER 및 비로그인 차단, ADMIN만 실행.
- 서버 DB에서 ADMIN을 USER로 강등했을 때 기존 관리자 토큰도 즉시 차단됨을 검증.
- 만료 세션, 로그아웃으로 삭제된 세션으로 재접근 시 403 확인.
- **결과: PASS.** 증빙: [D2-5 인증 E2E Actions](https://github.com/nalkarowndal/lR/actions/runs/43395786153).

### 실제 Chrome 사용자/관리자 화면 인가

- `frontend/scripts/qa-auth-admin-real-e2e.mjs`: 임시 DB를 사용하는 실제 Express API 서버 + Vite 프로덕션 빌드 + Headless Chrome.
- 백엔드의 **실제 이메일 로그인 API에서 발급한 토큰**을 브라우저 로컬 세션에 적용하고 `/users/me` 기반 역할을 새로 읽음. React 가상 사용자 하네스/권한 상태 조작은 사용하지 않음.
- 비로그인 직접 관리자 화면 이동: 차단.
- USER 로그인 세션: 설정에서 관리자 진입 메뉴 숨김, 직접 화면 이동 시 접근 거절.
- ADMIN 로그인 세션: 설정에서 관리자 진입 메뉴 노출, 버튼 클릭 후 통합 관리자 센터 정상 표시.
- 자동 브라우저 스크린샷 및 결과 JSON은 해당 Actions 실행의 `d2-5-isolated-admin-role-e2e` 아티팩트에서 확인.
- **결과: PASS.** 증빙: [동일 Actions 실행](https://github.com/nalkarowndal/lR/actions/runs/43395786153).

> **검증 경계:** 이 브라우저 시나리오는 실제 발급된 서버 토큰을 세션에 적용해 화면 접근 제어를 검증한다. 자동화 도중 이메일 로그인 폼 자체의 입력/제출 단계는 불안정하여 성공으로 판정하지 않는다. 카카오/구글 OAuth 실제 인증, 운영 배포 설정 및 생산 데이터 권한은 이 테스트 범위가 아니다.

## 추가 보안 조치

- `backend/.env.example`의 기존 고정 `ADMIN_API_KEY` 예시값을 빈 값으로 변경했다. 빈 값이면 API 키를 이용한 관리자 우회 경로가 비활성화된다.
- 실제 배포 환경에서 과거 예시값을 사용한 적이 있다면 해당 키는 교체해야 한다. 운영 환경 변수/비밀 저장소는 이번 CI에서 조회하거나 변경하지 않았다.
- `requireAdmin`의 별도 서버-서버 API 키 기능 자체는 유지된다. 필요할 때만 예측 불가능한 키를 비밀 관리 체계에 저장한다.

## 검수 결론

**테스트 환경에서 관리자·일반 회원의 실제 세션 기반 백엔드 권한 및 브라우저 인가 흐름 PASS.** 실기기 QA는 범위 제외로 최종 승인 장애 항목이 아니다. 운영 배포 보안 감사를 통과했다고 주장하지 않는다. PR #50은 디자인/코드 리뷰가 끝날 때까지 Draft 및 미병합 상태 유지.

참고: [OWASP Authorization Regression Testing](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Regression_Testing_Cheat_Sheet.html)
