# luxuryRental 계정 보안 및 인가 보안 검증 보고서 (AUTH_SECURITY_REPORT)

## 1. 보안 감사 대상 및 위험 완화 결과

| 식별 항목 | 보안 위협 내용 | 적용된 방어 조치 | 상태 |
|:---|:---|:---|:---:|
| **SEC-01** | 클라이언트 임의 헤더 위조 (`x-user-role: ADMIN`) | 프런트엔드 헤더 신뢰 로직 전면 제거, DB `sessions` 테이블과 결합된 서버 세션 역할만 인가 | **완전 해결** |
| **SEC-02** | 기본 관리자 API 키 하드코딩 노출 | `backend/src/config/env.ts` 기본값 제거, 미설정 시 키 인증 차단 | **완전 해결** |
| **SEC-03** | 회원 프로필 수정 시 권한 상승 공격 (`role: ADMIN` 주입) | `updateProfileSchema`에서 `role` 필드 배제, SQL UPDATE문에서 `role` 변경 원천 차단 | **완전 해결** |
| **SEC-04** | 비밀번호 변경 시 무단 변경 위험 | `changePasswordSchema`에서 `currentPassword` 필수 입력 및 `verifyPassword` 검증 | **완전 해결** |
| **SEC-05** | 비밀번호 재설정 시 세션 탈취 위험 | 비밀번호 재설정 완료 즉시 해당 사용자의 모든 기존 `sessions` 일괄 파기 (Session Invalidation) | **완전 해결** |
| **SEC-06** | 비밀번호 재설정 토큰 운영 노출 | `NODE_ENV === 'production'`일 때 응답 본문에서 토큰 제거, 개발 환경에서만 `devResetToken` 제공 | **완전 해결** |
| **SEC-07** | 신규 회원가입 시 권한 상승 | `register` 컨트롤러에서 `role: 'USER'`로 고정 INSERT | **완전 해결** |
| **SEC-08** | 화면 깜빡임 시 관리자 UI 임의 노출 | `isAuthLoading` 상태 지원 및 `ProtectedAdminView` 가드로 미인가 노출 100% 차단 | **완전 해결** |

---

## 2. 암호화 알고리즘 규격

- **알고리즘**: Node.js 내장 `scryptSync` (C++ 네이티브 모듈 의존성 없음, 크로스 플랫폼 완벽 호환)
- **솔트(Salt)**: 사용자별 16바이트 암호학적 난수 (`crypto.randomBytes(16)`)
- **저장 포맷**: `salt:hash` (솔트와 해시가 안전하게 결합되어 단방향 검증)
- **세션 토큰**: 32바이트 암호학적 난수 Hex 스트링 (총 64자 엔트로피)

