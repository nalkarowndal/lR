# luxuryRental 사용자 인증 및 세션 아키텍처 흐름도 (AUTH_FLOW)

## 1. 개요

luxuryRental의 인증 시스템은 **이메일/비밀번호 기반의 세션 인증(Bearer Token)**을 핵심으로 하며, 소셜 로그인 연동 인터페이스 및 안전한 비밀번호 복구 흐름을 지원합니다.

---

## 2. 인증 시퀀스 다이어그램 (Authentication Sequences)

### 2.1 회원가입 흐름 (User Registration)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Frontend as React 프런트엔드 (ShopRegister)
    participant API as Express 백엔드 (/api/v1/auth)
    participant DB as SQLite (users, sessions)

    User->>Frontend: 이메일, 비밀번호, 이름, 약관동의 입력 후 '가입하기' 클릭
    Frontend->>Frontend: 클라이언트 유효성 검증 (형식, 일치 여부)
    Frontend->>API: POST /api/v1/auth/register
    API->>DB: SELECT id FROM users WHERE email = ?
    alt 이메일 이미 존재
        DB-->>API: 기존 레코드 반환
        API-->>Frontend: 409 Conflict ('이미 등록된 이메일')
        Frontend-->>User: 에러 피드백 표시
    else 이메일 중복 없음
        API->>API: scryptSync + random salt 해싱
        API->>DB: INSERT INTO users ...
        API->>API: crypto.randomBytes(32) 세션 토큰 생성
        API->>DB: INSERT INTO sessions (token, user_id, expires_at)
        API-->>Frontend: 201 Created (user, token)
        Frontend->>Frontend: localStorage.setItem('lr_token', token)
        Frontend-->>User: 가입 완료 축하 모달 & 환영 토스트
    end
```

---

### 2.2 로그인 및 권한 인가 흐름 (Login & Role Authorization)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 / 관리자
    participant Frontend as React 프런트엔드
    participant API as Express 백엔드
    participant DB as SQLite

    User->>Frontend: 이메일 / 비밀번호 입력 후 로그인
    Frontend->>API: POST /api/v1/auth/login
    API->>DB: SELECT * FROM users WHERE email = ?
    API->>API: timingSafeEqual 비밀번호 검증
    alt 인증 실패
        API-->>Frontend: 401 Unauthorized
        Frontend-->>User: "이메일 또는 비밀번호가 일치하지 않습니다"
    else 인증 성공
        API->>DB: INSERT INTO sessions (token, user_id, expires_at)
        API-->>Frontend: 200 OK (token, user: { role: 'ADMIN' | 'USER' })
        Frontend->>Frontend: 토큰 저장 & AppContext.user 갱신
        Frontend-->>User: 로그인 완료 토스트 & 이전 화면 복귀
    end

    opt 관리자 API 요청 시
        Frontend->>API: GET /api/v1/admin/products (Authorization: Bearer <token>)
        API->>DB: SELECT u.role FROM sessions JOIN users WHERE token = ?
        alt role === 'ADMIN'
            API-->>Frontend: 200 OK (관리자 데이터 반환)
        else role !== 'ADMIN'
            API-->>Frontend: 403 Forbidden ('관리자 권한 필요')
        end
    end
```

---

### 2.3 비밀번호 재설정 흐름 (Password Recovery)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Frontend as React 프런트엔드 (ShopPasswordReset)
    participant API as Express 백엔드
    participant DB as SQLite (password_reset_tokens)

    User->>Frontend: 가입 이메일 입력 후 '재설정 요청'
    Frontend->>API: POST /api/v1/auth/forgot-password { email }
    API->>DB: SELECT id FROM users WHERE email = ?
    API->>DB: INSERT INTO password_reset_tokens (token, 1시간 유효)
    API-->>Frontend: 200 OK (resetToken)
    User->>Frontend: 재설정 토큰 & 새 비밀번호 입력
    Frontend->>API: POST /api/v1/auth/reset-password { token, newPassword }
    API->>DB: SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0
    API->>DB: UPDATE users SET password_hash = ...
    API->>DB: UPDATE password_reset_tokens SET used = 1
    API->>DB: DELETE FROM sessions WHERE user_id = ... (모든 세션 무효화)
    API-->>Frontend: 200 OK
    Frontend-->>User: 변경 완료 모달 -> 로그인 창 전환
```
