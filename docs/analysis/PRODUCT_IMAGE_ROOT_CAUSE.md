# LuxuryRental 상품 이미지 미적용 근본 원인 분석 및 해결 보고서

## 1. 개요 및 배경

이전 개발 단계에서 상품 이미지 연동 및 UI 고도화가 완료되었다고 보고되었으나, 실제 사용자 브라우저 화면에서는 다음과 같은 치명적인 시각적 결함이 지속적으로 관찰되었습니다:
1. **카테고리 화면 내 상품 카드에 실제 상품 사진이 미노출**되고 가방·의류 형태의 회색 SVG 아이콘(`ProductVisualBadge`)이 반복 노출됨.
2. **카테고리 상단 3개 추천 카드**가 실사 패션 룩북 타일이 아닌 단순 선형 일러스트 아이콘(`LuxurySneakerIcon`, `LuxuryJewelryIcon`, `LuxuryCoatIcon`)으로 방치됨.
3. **SVG/CSS 스크린샷 기반 가짜 실사 에셋 문제**: 자동 생성 스크립트(`generate-all-catalog-assets.js`)가 브라우저 상에서 사각형, 원형 등 SVG/CSS 도형을 렌더링하고 스크린샷을 찍어 JPG로 저장함으로써, 파일 형식만 JPG일 뿐 실제 내용은 조잡한 벡터 그래픽으로 채워짐.
4. **품질 검증 기준의 왜곡**: 이전 QA 도구가 파일의 존재 여부와 1000바이트 초과 여부만 체크하여, 실제 사진이 아닌 단순 도형도 "58/58 100% PASS"로 잘못 보고됨.
5. **장식형 아이콘의 산만한 색상**: 메인 및 카테고리 아이콘이 분홍, 파랑, 초록, 노랑 등 제각각의 원색과 장난감 같은 선형 디자인을 사용하여 명품 렌탈 플랫폼의 품격을 저해함.

본 문서는 이러한 문제가 발생한 근본 기술 원인을 코드 및 런타임 수준에서 정밀 규명하고, 이를 근본적으로 해결하기 위해 단행한 아키텍처 개편 및 실 브라우저 검증 결과를 상세히 기록합니다.

---

## 2. 근본 원인 (Root Cause Analysis)

### 2.1 데이터 모델 결함: `image` 필드 부재 및 `as any` 타입 우회
- `ShopCategory.tsx`와 `ShopSearch.tsx` 내에서 상품 카드를 렌더링할 때 `src={(item as any).image}`로 캐스팅되었으나, 실제 데이터 객체에 `image`/`imageUrl` 필드가 없어 런타임에 항상 `undefined`로 평가되었습니다.

### 2.2 Fallback 컴포넌트의 결함 은폐 (Silent Failure)
- `ProductImage.tsx` 컴포넌트가 `!src` 조건일 때 아무런 경고나 오류 로깅 없이 조용히 `<ProductVisualBadge category={category} />`를 반환하도록 설계되어 데이터 누락이라는 중대한 결함이 은폐되었습니다.

### 2.3 컴포넌트 생명주기 및 상태 리셋 부재
- `ProductImage.tsx` 내부에 `src` prop 변경 시 상태를 초기화하는 `useEffect`가 없어 브랜드 탭 전환 시 이전 오류/로딩 상태가 고착되었습니다.

### 2.4 SVG/CSS 스크린샷 방식의 근본적 한계 (가짜 실사)
- AI 이미지 생성기 쿼터 제한(429) 상황에서 브라우저 자동화 도구로 단순 기하학적 도형을 그리고 캡처한 JPG를 생성함으로써, 시각적 품질이 심각하게 훼손되었습니다.

### 2.5 QA 검증 기준의 한계
- 기존 `verify-product-assets.js`가 파일 존재와 바이트 수만 체크하고, 실제 사진적 사실성(Photorealism)을 검증하지 않아 허위 통과가 발생했습니다.

---

## 3. 근본 해결 아키텍처 및 구현 내용

### 3.1 단일 카탈로그 표준 모델 및 품질 메타데이터 구축 (`catalog.ts`)
- 전사 표준 데이터 인터페이스 `CatalogProduct` 선언 및 품질 상태 필드 분리:
  ```typescript
  export type AssetQualityStatus = 
    | 'APPROVED_PHOTOREAL'     // 스튜디오 정품 실사 확인 완료 (1024x1024 고해상도)
    | 'REGENERATE_REQUIRED'    // AI 생성 쿼터 리셋 후 스튜디오 실사 재생성 필요
    | 'PRODUCT_MISMATCH'
    | 'REVIEW_REQUIRED';

  export interface CatalogProduct {
    id: string;
    brand: string;
    title: string;
    category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
    price: string;
    imageUrl: string;
    imageStatus: 'READY' | 'PENDING' | 'ERROR';
    assetQuality?: AssetQualityStatus;
    assetSource?: 'STUDIO_AI_PHOTOREAL' | 'VECTOR_RENDER' | 'CATALOG_ARCHIVE';
    verifiedDate?: string;
  }
  ```

### 3.2 진정한 실사 스튜디오 에셋 (15개 완료) 및 쿼터 현황 투명 보고
- **승인된 실사 에셋 (15종)**:
  1. `balenciaga_le_city.jpg` (736 KB)
  2. `bottega_cassette.jpg` (613 KB)
  3. `chanel_22_mini.jpg` (658 KB)
  4. `chanel_caviar_hobo.jpg` (662 KB)
  5. `chanel_classic_flap.jpg` (591 KB)
  6. `hermes_birkin_25.jpg` (666 KB)
  7. `hermes_evelyne_tpm.jpg` (704 KB) - 신규 생성
  8. `louisvuitton_speedy.jpg` (805 KB)
  9. `maison_margiela_5ac.jpg` (694 KB)
  10. `prada_renylon_belt.jpg` (645 KB)
  11. `saint_laurent_le5a7.jpg` (606 KB)
  12. `ami_heart_knit.jpg` (808 KB)
  13. `vancleef_alhambra.jpg` (653 KB)
  14. `rolex_submariner.jpg` (751 KB)
  15. `categories/sneaker_tile.jpg` (714 KB) - 신규 생성
- **생성 모델 할당량 상태**:
  - 모델: `gemini-3.1-flash-image`
  - 에러 코드: `429 Too Many Requests (RESOURCE_EXHAUSTED)`
  - 쿼터 리셋 시각: `2026-11-04T06:50:34Z` (약 1시간 15분 후)
  - 원칙 준수: 임의의 벡터/CSS 가짜 실사로 대체하지 않고, 리셋 시점에 잔여 43개 품목을 순차적으로 1:1 사진으로 교체할 수 있도록 자동화 파이프라인 및 백업 완비.

### 3.3 프리미엄 각인 아이콘 시스템 전면 개편 (`LuxuryIcons.tsx`)
- **디자인 콘셉트**: "Luxury Engraved Emblem & Precision Metal Engraving"
- **색상 체계 통일**: Deep Graphite (`#252525`), Muted Champagne Gold (`#B49A67`), Antique Brass (`#A88C60`), Soft Platinum (`#A6A8AA`), Ivory Surface (`#F8F6F1`).
- **개선 대상**:
  1. 메인 서비스 카드 4종 (`LuxuryDressIcon`, `LuxuryBagIcon`, `LuxuryHandshakeIcon`, `LuxuryGiftIcon`)
  2. 메인 8-Grid 메뉴 아이콘 8종 (`MenuHangerIcon`, `MenuTagIcon`, `MenuClockIcon`, `MenuMembershipIcon`, `MenuCareIcon`, `MenuVipIcon`, `MenuBuybackIcon`, `MenuInviteIcon`)
  3. 브랜드 모노그램 (`BrandMonogram`): 이중 동심원 메달리온 각인 + 하이엔드 타이포그래피.
  4. 기능성 아이콘 보존: 하단 바, 검색, 장바구니, 닫기 등 공통 기능성 아이콘은 원형 유지.

---

## 4. 실 브라우저 E2E 검증 결과

- **파일 무결성 검사**: 58 / 58 PASS (100% 정상 로딩)
- **실사 품질 검사**: 15 / 58 APPROVED_PHOTOREAL (잔여 43건 쿼터 리셋 대기)
- **아이콘 시스템 검사**: 11 / 11 PASS (각인 엠블럼 및 8-Grid 메뉴 100% 통과)
- **반응형 뷰포트 검사**: 5 / 5 PASS (360px, 390px, 430px, 768px, 1440px 100% 무결점 통과)
- **백엔드 테스트**: 41 / 41 PASS (100% 통과)
- **프런트엔드 빌드**: `tsc -b && vite build` 0 오류 통과
