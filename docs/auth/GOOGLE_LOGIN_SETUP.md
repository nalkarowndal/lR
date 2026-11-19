# luxuryRental — 구글 OAuth 2.0 연동 설정 가이드

본 문서는 Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 발급받고 luxuryRental 서버에 설정하는 방법을 안내합니다.

---

## 1. Google Cloud Console 설정 순서

1. **Google Cloud Console 접속**:
   - [https://console.cloud.google.com/](https://console.cloud.google.com/) 접속 및 프로젝트 선택/생성.
2. **API 및 서비스 > OAuth 동의 화면(Consent Screen)**:
   - User Type: **외부(External)** 선택 후 만들기.
   - 앱 이름: `luxuryRental`
   - 사용자 지원 이메일 / 개발자 연락처 정보 입력.
   - 범위(Scope): `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid` 추가.
   - 테스트 사용자(Test Users): 본인 구글 계정 추가.
3. **API 및 서비스 > 사용자 인증 정보(Credentials)**:
   - **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 클릭.
   - 애플리케이션 유형: **웹 애플리케이션(Web application)**
   - 이름: `luxuryRental Web Client`
   - **승인된 자바스크립트 원본(Authorized JavaScript origins)**:
     - `https://lenra-web.onrender.com`
     - `http://localhost:5173`
     - `http://localhost:4000`
   - **승인된 리디렉션 URI(Authorized redirect URIs)**:
     - `https://lenra-api.onrender.com/api/v1/auth/google/callback` (프로덕션 Render API)
     - `http://localhost:4000/api/v1/auth/google/callback` (로컬 백엔드)
     - `https://lenra-web.onrender.com/oauth/callback/google` (프런트엔드 SPA 라우트)
     - `http://localhost:5173/auth/google/callback` (로컬 프런트엔드 라우트)
4. **발급된 키 확인**:
   - **클라이언트 ID** (예: `1234567890-abcdef.apps.googleusercontent.com`)
   - **클라이언트 보안 비밀번호** (예: `GOCSPX-abcdef...`)

---

## 2. 서버 환경변수 설정 (`backend/.env` / Render Dashboard)

발급받은 키를 `backend/.env` 또는 Render 대시보드 환경변수에 기입합니다.

```dotenv
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://lenra-api.onrender.com/api/v1/auth/google/callback
FRONTEND_URL=https://lenra-web.onrender.com
CLIENT_ORIGIN=https://lenra-web.onrender.com,http://localhost:5173,http://127.0.0.1:5173
```

