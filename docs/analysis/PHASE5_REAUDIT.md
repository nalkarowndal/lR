# LuxuryRental Phase 5 재감사 및 원인 분석 보고서 (PHASE5_REAUDIT.md)

## 1. 개요 및 목적
본 문서는 Phase 5에서 캡처된 102개 전체 스크린샷 및 소스코드에 대한 전수 정밀 감사를 수행하여, SHA-256 해시 중복 및 화면 렌더링 결함의 근본 원인(Root Causes)을 규명하고 Phase 6에서 구현된 최종 해결책을 체계적으로 기록합니다.

---

## 2. 발견된 핵심 결함 및 심층 원인 분석

### 2.1 관리자 대시보드 갤러리 모달 잔류 버그 (P0)
- **증상**: 스크린샷 `88_admin_shop_image_gallery_modal.png` 캡처 후, 모달이 닫히지 않고 `89`~`96` 관리자 전 화면과 `97`~`102` 반응형 뷰포트 전체에 걸쳐 잔류하여 동일 화면을 반복 캡처하는 치명적 오류 발생.
- **근본 원인**:
  1. `ShopAdmin.tsx`의 갤러리 모달 상단 닫기 버튼이 텍스트 `'닫기'`가 아닌 FontAwesome 아이콘 `<i className="fa-solid fa-xmark"></i>`으로만 구성되어 있었음.
  2. 자동 QA 스크립트에서 `b.textContent.trim() === '닫기'` 조건으로 검색하여 닫기 버튼을 찾지 못하고 클릭이 실패함.
  3. `mainTab` (쇼핑몰/구인/위탁) 전환 시 모달 상태(`galleryProduct`)가 자동 초기화되지 않아 백드롭 오버레이가 최상단 z-index에 계속 고정됨.
- **Phase 6 해결책**:
  1. `ShopAdmin.tsx`에 탭 변경 시 모든 모달을 초기화하는 `useEffect` 리셋 훅 구현.
  2. 갤러리 모달 하단에 명시적인 `닫기` 텍스트 버튼 및 상단 버튼에 `aria-label="갤러리 닫기"` 추가.
  3. 모달 백드롭 클릭 시 닫기 핸들러 및 글로벌 테스팅 리셋 헬퍼(`window.__lrCloseAdminModals`) 탑재.

### 2.2 회원 인증 오버레이 화면 전환 및 수평 밀림(Clipping) 버그 (P0)
- **증상**: `67_auth_register_all_terms_checked.png`, `68_auth_password_reset_modal.png`, `69_auth_password_reset_success.png`에서 수평으로 약 130px 밀리는 현상 및 모달 미전환 발생.
- **근본 원인**:
  1. `AppContext.tsx`의 `OverlayState` 타입에 `'PASSWORD_RESET'`이 누락되고 `'FORGOT_PASSWORD'`로만 정의되어 있어, `__lrSetOverlay('PASSWORD_RESET')` 호출 시 모달이 열리지 않음.
  2. 슬라이드 애니메이션(300ms) 완료 전 조기 초점 이동(Focus) 시 브라우저가 1440px 데스크톱 뷰포트에서 448px 중앙 모바일 컨테이너를 가로로 스크롤함.
  3. `ShopPasswordReset.tsx`의 제출 버튼 텍스트가 `'재설정 안내 받기'`로 구현되어 테스트 스크립트의 `'재설정 링크 받기'` 클릭과 불일치.
- **Phase 6 해결책**:
  1. `AppContext.tsx` 및 `ShopPasswordReset.tsx`에서 `'FORGOT_PASSWORD'`와 `'PASSWORD_RESET'`을 모두 지원하도록 상호 호환 alias 적용.
  2. 모든 인풋 자동 포커스 타이머에 `{ preventScroll: true }` 적용 및 `window.scrollTo({ left: 0 })` 보장.
  3. `index.css`에 `html, body { overflow-x: hidden; max-width: 100vw; }` 선언으로 가로 스크롤 원천 차단.
  4. 비밀번호 재설정 제출 버튼 텍스트를 `'재설정 링크 받기'`로 통일하고 이메일 발송 성공 피드백 및 토큰 입력 폼 표시 확인.

### 2.3 검색 결과 샤넬 상품 이미지 누락 및 가격 단위 오류 (P1)
- **증상**: `54_search_results_query_chanel.png`, `55_search_category_chip_filter.png`에서 샤넬 일부 상품 이미지가 로딩되지 않고, BUY 상품에 `/일` 단위가 노출됨.
- **근본 원인**:
  1. SQLite 백엔드 데이터베이스의 초기 상품 시드 데이터 중 일부 샤넬 상품의 `image_url` 필드가 `NULL` 상태였음.
  2. `ShopSearch.tsx`에서 서버 검색 결과를 매핑할 때 BUY/RENT 구분 없이 일괄적으로 `/일` 단위를 부착함.
- **Phase 6 해결책**:
  1. `backend/src/db/database.ts`에 시드 상품 1~26에 대한 실제 고해상도 스튜디오 자산(`/assets/products/...`) 자동 백필 마이그레이션 적용.
  2. `frontend/src/utils/pricing.ts`에 `formatProductPrice` 유틸리티를 신설하여 `type === 'BUY'`인 경우 `'구매가 ₩{price}'` 형식으로 고정하고 `/일` 단위를 엄격히 제거.
  3. 7대 상태 배지(렌탈 가능, 구매 가능, 예약 마감, 품절, 판매 완료, 검수 중, 이미지 준비 중)의 컬러 시스템 표준화.

### 2.4 장바구니 및 모의 주문 결제 프로세스 버튼 텍스트 불일치 (P1)
- **증상**: `21_cart_modal_with_items.png`, `22_mock_checkout_modal.png`, `23_mock_order_complete_modal.png`가 모두 동일한 장바구니 초기 모달로 중복 캡처됨.
- **근본 원인**:
  - `ShopMain.tsx`의 실제 버튼 텍스트는 `주문서 작성으로 이동`과 `최종 결제 및 렌탈 예약 접수`였으나, 테스트 스크립트가 `모의 주문 결제하기`, `결제 승인 (모의 주문)`을 탐색하여 클릭이 무효화됨.
- **Phase 6 해결책**:
  - 실제 UI 텍스트와 100% 일치하도록 스크립트를 동기화하여 장바구니 목록 -> 배송지 및 결제 폼(SHIPPING) -> 예약 완료 모달(ORDER_COMPLETE)의 3단계 완전한 플로우 캡처 달성.

---

## 3. 결론
Phase 5 감사에서 발견된 4대 핵심 결함(관리자 모달 잔류, 인증 오버레이 수평 밀림, 검색 상품 이미지 및 BUY 단위 오류, 장바구니 단계 전환 오류)은 모두 명확한 원인이 규명되었으며, Phase 6를 통해 소스코드 레벨에서 근본적으로 수정되었습니다.
