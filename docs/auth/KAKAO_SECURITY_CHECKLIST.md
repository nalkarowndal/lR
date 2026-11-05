# luxuryRental — 카카오 OAuth 2.0 보안 점검 체크리스트

본 문서는 luxuryRental 카카오 OAuth 2.0 연동 개발에 적용된 12대 핵심 보안 통제 항목 및 준수 현황을 기술합니다.

---

## 보안 통제 항목 및 이행 현황

| 번호 | 보안 통제 항목 | 위험 요인 | luxuryRental 적용 구현 및 방어 기제 | 상태 |
|:---:|:---|:---|:---|:---:|
| **1** | **암호학적 CSRF State 검증** | 교차 사이트 요청 위조, 로그인 세션 주입 | `crypto.randomBytes(32).toString('hex')`로 64자리 난수 생성. SQLite `oauth_states` 테이블에 10분 만료로 저장 후 콜백 시 엄격 검증 | **완료** |
| **2** | **State 1회성 소비 (Anti-Replay)** | State 재사용 공격, 가로채기 | 콜백 수신 즉시 DB에서 단 1회 조회 후 원자적 삭제(`DELETE`). 동일 State 재호출 시 즉시 302 `?oauth=invalid_state` 거부 | **완료** |
| **3** | **Client Secret 서버 전용 보관** | 토큰 발급 위조, 비인가 앱 호출 | `KAKAO_CLIENT_SECRET`은 서버 환경변수(`backend/.env`)에만 보관. 프런트엔드 번들에 절대 노출되지 않음 | **완료** |
| **4** | **Zero-Token URL Policy** | 브라우저 히스토리, Referer 헤더 노출 | 카카오 액세스 토큰, 인가 코드, 서비스 세션 토큰을 URL 파라미터로 절대 전달하지 않음. URL에는 `?oauth=success` 결과 플래그만 포함 | **완료** |
| **5** | **HttpOnly 세션 쿠키** | XSS 공격을 통한 세션 탈취 | 세션 토큰은 `HttpOnly`, `SameSite=Lax`, `Path=/`, 7일 만료의 `lr_session` 쿠키로 전송되어 브라우저 JS(document.cookie)에서 접근 불가 | **완료** |
| **6** | **Redirect URI 고정 검증** | 오픈 리다이렉트, 피싱 사이트 유도 | 카카오 개발자 콘솔과 서버의 `KAKAO_REDIRECT_URI`를 절대 경로로 고정. 인가 요청 시에도 화이트리스트된 URI만 사용 | **완료** |
| **7** | **관리자 권한 상승 차단** | OAuth를 통한 ADMIN 탈취 | 카카오로 신규 가입한 계정의 역할은 반드시 `role = 'USER'`로 고정. `ProtectedAdminView` 및 `requireAdmin` 미들웨어에서 403 차단 | **완료** |
| **8** | **이메일 충돌 및 계정 탈취 방어** | 동일 이메일을 통한 타인 계정 탈취 | 카카오 이메일이 기존 DB 이메일과 일치할 경우 무단 자동 병합을 차단하고 `?oauth=email_conflict`로 안내 | **완료** |
| **9** | **외부 식별자 고유성 보장** | 동명이인 충돌, 데이터 오염 | 카카오 고유 ID(`provider_user_id`) 기준 `UNIQUE(provider, provider_user_id)` 제약조건 적용 | **완료** |
| **10** | **서비스 로그아웃 시 세션 무효화** | 잔존 세션 악용 | `POST /auth/logout` 시 DB `sessions` 테이블에서 토큰을 즉각 삭제하고 `lr_session` 쿠키를 무효화(`clearCookie`) | **완료** |
| **11** | **URL 주소창 청결 소거** | 쿼리 파라미터 노출 | 프런트엔드 마운트 즉시 `window.history.replaceState`를 호출하여 주소창에서 `?oauth=...` 파라미터를 즉시 지움 | **완료** |
| **12** | **하단 내비게이션 불변 격리** | UI 간섭, 레이아웃 오염 | 카카오 로그인 오버레이 및 인증 모달은 플로팅 네비게이션과 격리되어 하단바 5개 아이콘의 형태, 색상, 애니메이션 100% 보존 | **완료** |

---

## OWASP 권고 사항 준수 검증

- **CORS 설정**: `http://localhost:5173` 및 허용된 오리진에 대해서만 `credentials: true` 적용
- **Helmet 적용**: `Content-Security-Policy`, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff` 기본 적용
- **최소 개인정보 수집**: 카카오 프로필 닉네임과 썸네일 이미지 외에 주민등록번호, 계좌번호 등 민감정보는 수집하지 않음
