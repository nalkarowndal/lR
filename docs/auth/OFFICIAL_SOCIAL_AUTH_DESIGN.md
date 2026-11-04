# [인증 시스템 디자인 명세] 공식 소셜 로그인 및 보안 클린 이메일 인증

**작성일**: 2026-11-04  
**버전**: v3.0  
**컴포넌트**: `ShopLike.tsx`, `AuthSymbols.tsx`, `auth.controller.ts`  

---

## 1. 개요

`luxuryRental`의 로그인 화면(`ShopLike.tsx`)은 프리미엄 럭셔리 플랫폼에 걸맞은 단정하고 정돈된 인터페이스를 제공해야 합니다.
이를 위해 글로벌/국내 주요 소셜 플랫폼의 공식 브랜드 가이드를 엄격히 준수하고, 프로덕션 환경에 부적합한 데모 자동 입력 기능을 제거하였습니다.

---

## 2. 공식 소셜 로그인 플랫폼 디자인 규격

### 2.1 카카오 로그인 (Kakao Sync)
- **심볼 규격**: 24x24 viewBox 공식 말풍선 벡터
- **버튼 배경색**: `#FEE500` (Kakao Official Yellow)
- **심볼 색상**: `#000000` (Kakao Black)
- **텍스트**: `카카오로 3초만에 계속하기` (Noto Sans KR 15px ExtraBold, `#000000`)
- **패딩 및 곡률**: `py-3.5`, `rounded-xl`, `active:scale-[0.99]`

### 2.2 Apple로 로그인 (Sign in with Apple)
- **심볼 규격**: 170x170 viewBox 공식 사과 로고 벡터
- **버튼 스타일**: 화이트 배경 (`#FFFFFF`) + 다크 보더 (`border-gray-900`)
- **심볼 색상**: `#000000`
- **텍스트**: `APPLE로 계속하기` (15px ExtraBold, `#000000`)
- **패딩 및 곡률**: `py-3.5`, `rounded-xl`

### 2.3 네이버 로그인 (Naver Login)
- **형태**: 원형 48x48 (`w-12 h-12 rounded-full`)
- **버튼 배경색**: `#03C75A` (Naver Green)
- **심볼 색상**: `#FFFFFF` (공식 비율 24x24 viewBox N 로고)
- **인터랙션**: 호버 시 `#02b350`, 클릭 시 `scale-95`

### 2.4 PAYCO 간편결제/로그인
- **형태**: 원형 48x48 (`w-12 h-12 rounded-full`)
- **버튼 배경색**: `#EA3323` (PAYCO Red)
- **심볼 색상**: `#FFFFFF` (공식 P 심볼)
- **인터랙션**: 호버 시 `#d82a1b`, 클릭 시 `scale-95`

---

## 3. 이메일 로그인 보안 강화 및 빠른 테스트 제거

### 3.1 하드코딩 제거
- 기존 `handleFillDemo('ADMIN' | 'USER')` 함수 및 테스트 버튼 완전 삭제.
- 운영 데이터베이스의 보안 수준을 보장하며, 관리자 및 고객 비밀번호가 클라이언트 브라우저의 소스코드나 네트워크 디버거에 노출되지 않음.

### 3.2 로그인 상태 유지 (Remember Me)
- `rememberMe` 토글이 활성화된 경우: `localStorage`에 세션 토큰 유지 (지속 로그인).
- `rememberMe`가 비활성화된 경우: `sessionStorage` 세션 플래그 설정으로 브라우저 종료 시 세션 만료 유도.

---

## 4. 시각적 검증 결과
- 스크린샷: `docs/screenshots_phase2/53_login_official_social_buttons.png`
- 스크린샷: `docs/screenshots_phase2/53_1_login_clean_email_no_quick_test.png`
