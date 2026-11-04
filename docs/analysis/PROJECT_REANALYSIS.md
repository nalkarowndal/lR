# luxuryRental 프로젝트 심층 재분석 보고서 (PROJECT_REANALYSIS)

## 1. 개요 및 목적

본 보고서는 `luxuryRental` 프로젝트의 현재 구현 상태를 점검하고, 실제 운영 가능한 프리미엄 커머스로의 도약을 위해 식별된 기능적 결함, 데이터 불일치, 비동기 UX 결함 및 아키텍처 개선 과제를 전수 조사한 결과입니다.

---

## 2. 영역별 상세 결함 및 취약점 분석

### 2.1 인증 및 세션 관리 (Authentication & Session)
- **현재 구현**: `ShopLike.tsx`에서 소셜 로그인 버튼(카카오, Apple 등) 클릭 시 `setTimeout` 타이머를 통해 성공 문구만 표시하고 닫힘.
- **결함 분석**:
  1. 실제 사용자 계정(User Record)이 생성되거나 세션 토큰이 발급되지 않음.
  2. 이메일/비밀번호 기반 로그인 폼 및 회원가입 전용 페이지 부재.
  3. 로그인 후에도 메인 화면 헤더에 인증 상태(사용자 이름, 로그아웃)가 연동되지 않음.
  4. 계정 찾기(비밀번호 재설정) 기능 부재.
- **개선 방향**:
  - Node.js 백엔드에 SQLite 기반 `users`, `sessions`, `password_reset_tokens` 테이블 구축.
  - PBKDF2/scrypt 기반 안전한 단방향 솔트 해싱 적용.
  - 이메일/비밀번호 로그인, 회원가입, 계정 찾기, 로그아웃 전용 API 및 화면 구현.

### 2.2 관리자 API 인가 및 보안 (Admin Authorization Security)
- **현재 구현**: `backend/src/middlewares/auth.ts`의 `requireAdmin` 미들웨어가 `x-user-role: ADMIN` 요청 헤더 또는 `nodeEnv === 'development'` 조건을 신뢰함.
- **결함 분석**:
  - 클라이언트가 임의의 헤더를 전송하거나 개발 환경일 경우 모든 관리자 라우트(`/api/v1/admin/*`)가 무조건 승인되는 중대한 보안 취약점.
  - 프런트엔드 `api.ts`에 `'x-user-role': 'ADMIN'` 헤더가 고정 하드코딩됨.
- **개선 방향**:
  - 클라이언트 임의 헤더 기반 검증 전면 폐기.
  - 서버 측 세션 토큰(`Authorization: Bearer <token>`) 검증을 통해 DB 상의 `role === 'ADMIN'`인 사용자만 접근 허용.

### 2.3 상품 비주얼 및 이미지 에셋 (Product Imagery)
- **현재 구현**: 모든 상품 카드 및 목록에서 `ProductVisualBadge` (SVG 벡터 아이콘)만을 플레이스홀더로 렌더링.
- **결함 분석**:
  - 명품 커머스의 핵심인 실물 상품 사진 및 제품 비주얼이 누락되어 커머스로서의 매력도와 구매 의사결정 신뢰도가 저하됨.
  - 이미지 로딩 실패 시 레이아웃 붕괴를 막을 Fallback 및 스켈레톤 UI 구조 부재.
- **개선 방향**:
  - 카테고리별(가방, 의류, 신발, 주얼리, 시계, 지갑) 고해상도 스튜디오 룩북 이미지 에셋 제작 및 `frontend/public/assets/products/` 배치.
  - `ProductImage` 통합 컴포넌트 구축 (고정 종횡비, 스켈레톤 로더, 이미지 에러 시 기존 `ProductVisualBadge` Fallback).
  - SQLite `product_images` 테이블 및 관리자 이미지 업로드/갤러리 관리 기능 구축.

### 2.4 데이터 모델 정합성 및 중복 (Data Consistency)
- **현재 구현**: `ShopMain.tsx`, `ShopSearch.tsx`, `ShopCategory.tsx`에 각각 다른 정적 상품 목록이 하드코딩되어 있고, 백엔드 DB의 `products` 테이블과 부분적 불일치 존재.
- **결함 분석**:
  - 동일한 명품 상품이 검색 화면과 카테고리 화면에서 다른 가격, 브랜드, 이미지로 표시될 위험.
- **개선 방향**:
  - 백엔드 DB `products` 및 `product_images`를 단일 진실 공급원(Single Source of Truth)으로 정립.
  - `AppContext`를 통해 일원화된 데이터 하이드레이션 제공.

### 2.5 비동기 처리 및 사용자 피드백 (Async UX & State Feedback)
- **현재 구현**: `ShopSell.tsx`에서 브랜드 선택 또는 직접 등록 시 서버 API 응답 완료 전에 '신청 완료' 팝업을 먼저 띄움.
- **결함 분석**:
  - 네트워크 단절이나 백엔드 에러 발생 시에도 사용자는 정상 접수된 것으로 오인.
- **개선 방향**:
  - 비동기 호출 중 버튼 로딩 스피너 및 비활성화 적용.
  - 서버 응답 상태(201 Created vs 400/500 Error)에 따라 성공 모달 또는 에러 토스트를 명확히 분기.

### 2.6 애니메이션 및 모달 시스템 일관성 (Modal & Motion Uniformity)
- **현재 구현**: `alert()`, `confirm()`과 컴포넌트별 개별 상태 모달이 혼재되어 있으며, ESC 닫기 단축키 및 모바일 바텀시트가 통일되지 않음.
- **개선 방향**:
  - 통일된 `Modal`, `ConfirmDialog`, `ToastProvider` 시스템 구축.
  - ESC 키, 배경 클릭 닫기, 스크롤 락, 모바일 세이프 에어리어 적용.
  - `prefers-reduced-motion`을 지원하는 통일된 Motion Design System 수립.

---

## 3. 결론

본 재분석에 기반하여, 기존 레이아웃과 46개 기준 스크린샷의 모든 시각적 요소를 철저히 보존하면서 실제 회원 인증, 견고한 보안, 고품질 스튜디오 상품 이미지, 통일된 모달/토스트 시스템을 단계별로 구축합니다.

