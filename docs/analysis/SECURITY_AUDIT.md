# luxuryRental 보안 감사 및 개선 보고서 (SECURITY_AUDIT)

## 1. 보안 개요

본 문서는 `luxuryRental` 시스템의 인증, 인가, 데이터베이스, API 통신 전반에 걸친 보안 점검 결과와 조치 사항을 기술합니다.

---

## 2. 식별된 보안 취약점 및 개선 계획

| 번호 | 취약점 항목 | 심각도 | 현재 상태 및 위험도 | 개선 및 조치 방안 |
|:---:|:---|:---:|:---|:---|
| SEC-01 | **관리자 권한 헤더 스푸핑** | **Critical** | `x-user-role: ADMIN` 헤더를 클라이언트가 임의 전송 시 관리자 API 접근 허용 | 클라이언트 헤더 신뢰 제거, DB 세션 토큰 검증 및 `role === 'ADMIN'` 사용자만 인가 |
| SEC-02 | **개발 모드 관리자 무조건 허용** | **Critical** | `NODE_ENV === 'development'`일 때 모든 관리자 API가 인증 없이 열림 | 환경 변수 우회 로직 전면 제거, 개발 환경에서도 유효한 관리자 토큰 필수 |
| SEC-03 | **인증 없는 클라이언트 통신** | **High** | 프런트엔드 API 클라이언트(`api.ts`)에 고정 헤더 하드코딩 | `localStorage` 기반 베어러 토큰(`Authorization: Bearer <token>`) 주입 구조로 전환 |
| SEC-04 | **비밀번호 단방향 해싱 부재** | **Critical** | 기존 사용자 인증 테이블 부재로 자격 증명 관리 미비 | Node.js `node:crypto`의 강력한 `scrypt` 알고리즘 및 16바이트 솔트 기반 해싱 적용 |
| SEC-05 | **세션 만료 및 무효화 정책 부재** | **Medium** | 세션 토큰 생명주기 관리 체계 없음 | SQLite `sessions` 테이블에 `expires_at` (기본 7일) 설정 및 로그아웃 시 즉시 삭제 |
| SEC-06 | **비밀번호 재설정 일회용 토큰** | **High** | 계정 복구 체계 부재 | 32바이트 보안 난수 토큰 생성, 1시간 유효기간, 1회 사용 즉시 폐기(`used = 1`) |
| SEC-07 | **입력값 검증 및 인젝션 방어** | **Medium** | API 파라미터 유효성 검증 | Zod 런타임 스키마 적용 및 `node:sqlite` Prepared Statement 바인딩으로 SQL 인젝션 완전 차단 |
| SEC-08 | **MIME 타입 및 파일 업로드 보안** | **Medium** | 관리자 상품 이미지 등록 기능 신규 도입 시 파일 검증 | 허용 확장자(`.jpg`, `.jpeg`, `.png`, `.webp`), MIME 검증, 5MB 용량 제한 및 경로 난수화 |

---

## 3. 인증 및 권한 모델 구조

```text
[HTTP Request]
       |
       v
[Helmet / CORS / JSON Parser]
       |
       v
[Optional / Required Auth Middleware]
  - Extract: Authorization: Bearer <token>
  - Query: SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')
  - Join: users ON users.id = sessions.user_id
  - Reject (401 Unauthorized) if token invalid or expired
       |
       v
[requireAdmin Middleware]
  - Check: req.user && req.user.role === 'ADMIN'
  - Reject (403 Forbidden) if not admin
       |
       v
[Protected Controller / Business Logic]
```

---

## 4. 비밀번호 암호화 표준

Node.js 내장 `node:crypto` 모듈의 `scrypt`를 사용하여 C++ 빌드 도구 의존성 없이 네이티브 수준의 최고 강도 해싱을 수행합니다.

- **Salt**: `crypto.randomBytes(16).toString('hex')` (32자 hex)
- **Key Length**: 64바이트
- **Storage Format**: `salt:derivedKeyHex` (DB 단일 컬럼 보관)
- **비밀번호 검증**: 입력된 비밀번호와 저장된 salt로 `scryptSync`를 재연산한 뒤 `crypto.timingSafeEqual`을 사용하여 타이밍 공격 방어.

---

## 5. 결론

위 보안 아키텍처를 적용함으로써, 프런트엔드와 백엔드 간의 모든 통신이 검증된 사용자 세션 기반으로 안전하게 보호되며 관리자 시스템에 대한 비인가 접근이 원천 차단됩니다.
