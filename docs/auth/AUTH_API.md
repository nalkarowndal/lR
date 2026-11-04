# luxuryRental 인증 REST API 명세서 (AUTH_API)

## 1. 개요

모든 인증 API는 Base URL `/api/v1/auth` 하위에 위치하며, JSON 요청 본문 및 표준 HTTP 상태 코드를 사용합니다.

---

## 2. 엔드포인트 명세

### 2.1 회원가입
- **Endpoint**: `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "termsAgreed": true,
    "marketingConsent": false
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "회원가입이 완료되었습니다. 환영합니다!",
    "token": "7f9a8b1c2d3e4f...",
    "user": {
      "id": 3,
      "email": "user@example.com",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "role": "USER"
    }
  }
  ```
- **Error (409 Conflict)**: `{"success": false, "error": "이미 등록된 이메일 주소입니다..."}`

---

### 2.2 로그인
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "홍길동님, 환영합니다!",
    "token": "7f9a8b1c2d3e4f...",
    "user": {
      "id": 3,
      "email": "user@example.com",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "role": "USER"
    }
  }
  ```
- **Error (401 Unauthorized)**: `{"success": false, "error": "이메일 또는 비밀번호가 일치하지 않습니다."}`

---

### 2.3 현재 사용자 세션 확인
- **Endpoint**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 3,
      "email": "user@example.com",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "role": "USER"
    }
  }
  ```

---

### 2.4 로그아웃
- **Endpoint**: `POST /api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "로그아웃되었습니다."
  }
  ```

---

### 2.5 비밀번호 재설정 요청
- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Request Body**: `{"email": "user@example.com"}`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "비밀번호 재설정 토큰이 생성되었습니다.",
    "resetToken": "a1b2c3d4..."
  }
  ```

---

### 2.6 비밀번호 재설정 실행
- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Request Body**:
  ```json
  {
    "token": "a1b2c3d4...",
    "newPassword": "NewPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요."
  }
  ```

