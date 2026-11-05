# luxuryRental — 카카오 로그인(OAuth 2.0) 설정 가이드

본 문서는 luxuryRental 플랫폼에서 카카오 공식 계정을 통한 OAuth 2.0 간편 로그인을 활성화하기 위한 카카오 개발자 콘솔 설정 절차와 서버 환경변수 구성 지침을 안내합니다.

---

## 1. 카카오 개발자 콘솔 설정 절차

공식 가이드: [카카오 로그인 사전 준비 사항](https://developers.kakao.com/docs/ko/kakaologin/prerequisite)

### Step 1: 애플리케이션 생성
1. [Kakao Developers](https://developers.kakao.com)에 로그인합니다.
2. 상단 메뉴의 **[내 애플리케이션]** > **[애플리케이션 추가하기]**를 클릭합니다.
3. 앱 이름(예: `luxuryRental`) 및 사업자명을 입력하고 앱을 생성합니다.

### Step 2: REST API 키 확인
1. 생성된 애플리케이션의 **[앱 설정]** > **[요약 정보]**로 이동합니다.
2. **앱 키** 항목에서 **`REST API 키`**를 복사합니다.
   - 이 키가 서버 환경변수의 `KAKAO_REST_API_KEY`에 해당합니다.

### Step 3: 카카오 로그인 활성화
1. 좌측 메뉴의 **[제품 설정]** > **[카카오 로그인]**으로 이동합니다.
2. **활성화 설정**의 상태를 **`ON`**으로 변경합니다.

### Step 4: Redirect URI 등록
1. 동일한 **[카카오 로그인]** 화면 하단의 **[Redirect URI 등록]** 버튼을 클릭합니다.
2. 다음 URI를 환경별로 등록합니다:
   - **로컬 개발 환경**:
     ```text
     http://localhost:4000/api/v1/auth/kakao/callback
     ```
   - **프로덕션 운영 환경**:
     ```text
     https://api.yourdomain.com/api/v1/auth/kakao/callback
     ```
   > [!IMPORTANT]
   > 서버의 `KAKAO_REDIRECT_URI`와 카카오 개발자 콘솔에 등록된 Redirect URI는 프로토콜, 포트, 경로까지 완전히 일치해야 합니다. 불일치 시 `KOE006` 오류가 발생합니다.

### Step 5: Client Secret 생성 (보안 강화)
1. 좌측 메뉴의 **[카카오 로그인]** > **[보안]**으로 이동합니다.
2. **Client Secret** 항목에서 코드를 **[생성]**합니다.
3. 활성화 상태를 **`사용함`**으로 설정합니다.
   - 이 비밀키가 서버 환경변수의 `KAKAO_CLIENT_SECRET`에 해당합니다.

### Step 6: 동의항목(Scope) 설정
1. 좌측 메뉴의 **[카카오 로그인]** > **[동의항목]**으로 이동합니다.
2. 다음 항목을 설정합니다:
   - **닉네임**: 필수 동의 또는 이용 중 동의
   - **프로필 사진**: 필수 동의 또는 이용 중 동의
   - **카카오계정(이메일)**: 선택 동의 또는 필수 동의 (비즈앱 등록 시)
   > [!NOTE]
   > 사용자가 이메일 제공에 동의하지 않더라도 luxuryRental 서버는 안전한 고유 식별자 기반 대체 계정(`kakao_{id}@oauth.luxuryrental.com`)으로 자동 회원가입 및 로그인을 처리합니다.

---

## 2. 서버 환경변수(.env) 구성

`backend/.env` 파일에 아래와 같이 카카오 OAuth 키를 등록합니다.

```dotenv
# ==============================================================================
# LuxuryRental Server Configuration
# ==============================================================================
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/luxuryrental.sqlite
ADMIN_API_KEY=luxury_admin_secret_key_2026

# ==============================================================================
# Kakao OAuth 2.0 Credentials (서버 전용 비밀키 - 절대 Git에 커밋하지 마세요)
# ==============================================================================
KAKAO_REST_API_KEY=your_actual_kakao_rest_api_key_here
KAKAO_CLIENT_SECRET=your_actual_kakao_client_secret_here
KAKAO_REDIRECT_URI=http://localhost:4000/api/v1/auth/kakao/callback
```

---

## 3. 설정 상태 확인 API

서버 기동 후 브라우저 또는 터미널에서 카카오 연동 준비 상태를 즉시 점검할 수 있습니다:

```bash
curl.exe -s http://localhost:4000/api/v1/auth/kakao/status
```

**응답 예시 (설정 완료 상태):**
```json
{
  "success": true,
  "configured": true,
  "redirectUri": "http://localhost:4000/api/v1/auth/kakao/callback",
  "hasClientSecret": true,
  "authBaseUrl": "https://kauth.kakao.com"
}
```

- `configured: false`: `KAKAO_REST_API_KEY`가 비어있는 상태입니다. 프런트엔드에서 카카오 버튼 클릭 시 안내 토스트가 표출됩니다.
- `configured: true`: 카카오 공식 OAuth 인증 화면으로 즉시 연결됩니다.
