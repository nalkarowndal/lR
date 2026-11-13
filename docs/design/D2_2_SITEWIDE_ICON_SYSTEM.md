# D2-2 — 럭셔리 부티크 아이콘의 나머지 6개 화면 확장

## 설계 목표
D1, D2-1에서 구축한 `Boutique Line + Atelier Engraved`를 카테고리·검색·마이페이지·설정·판매·관리자로 확장합니다. 원본 레이아웃과 기능을 보존하고, 원형 메달 형태의 추가 장식은 만들지 않습니다.

## 구현 파일
- `frontend/src/components/icons/BoutiqueD22Icons.tsx` — 공통 React 아이콘 컴포넌트. SVG 24x24, 기본 `currentColor`, 아이콘별 크기·채움·획 두께·className 전달, Atelier의 개별 `useId()` 기반 gradient.
- `D22IconShapesA.ts`, `D22IconShapesB.ts`, `D22IconShapesC.ts` — Iconoir MIT 원본 경로/도형 32종; 실제 기존 `D2_ICONOIR_PATHS`와 함께 재사용.
- 해당 페이지: `ShopCategory.tsx`, `ShopSearch.tsx`, `ShopMyPage.tsx`, `ShopSettings.tsx`, `ShopSell.tsx`, `ShopAdmin.tsx`.

## 화면별 매핑
| 화면 | 대표 아이콘 및 용도 |
|---|---|
| 카테고리 | nav-arrow-left/right, chat-bubble, cart, heart, shield-check, trash, package |
| 검색 | nav-arrow-left, search, xmark, heart, arrow-up/down, shield-check |
| 마이페이지 | arrow-left, settings, crown, edit-pencil, user-circle, heart, shopping-bag, clock, package, spark |
| 설정 | lock, bell, user-circle, crown, page, info-circle, log-out, warning-circle, nav-arrow-right |
| 판매 | search, nav-arrow-left/right, xmark, plus-circle, check, warning-circle, badge-check |
| 관리자 | shield-check, shopping-bag, user-circle, plus-circle, refresh-double, shopping-bag-arrow-up (기존 악수 대체) |

## 보존해야 할 사항
- **메인 화면 하단바 변경 금지** (버튼 5종, 아이콘, 링크, CSS).
- 상품 이미지 및 사진 중심 카테고리 타일 변경 금지; 명품/소셜 로그인 공식 로고 변경 금지.
- 접근성 라벨, 클릭·키보드 핸들러, 모달/오버레이, 찜한 상품의 `fill=currentColor`, 상태 색상, 로딩 아이콘의 `animate-spin` 유지.
- 인증이 필요한 사용자/관리자 화면은 미인증 상태에서 우회하지 않음.
- 바깥쪽 원형 메달 금지: 도형 본래에 포함된 체크/배지 형태는 UI 기능 의미가 있으므로 예외.
- D1 스플래시와 D2-1 이벤트·8개 메뉴는 변경하지 않음.

## QA 요구사항
- `npm run test:d2` 및 `node --test tests/d2-2-sitewide-icons.test.mjs`.
- `npm run build` (TypeScript + Vite), 변경 컴포넌트 oxlint.
- Noto CJK 설치 Chrome에서 **360·390·430px** 카테고리·검색·판매·설정 캡처 및 SVG 렌더링 여부.
- 인증을 요하는 마이페이지·관리자 실화면, 실제 Android/iOS 시각/터치 검수는 추후 별도 승인 필수.
- 실사용 동작/서버 E2E 테스트는 시각 검수만으로 승인하지 않음.

## 프로젝트 연속성
- D1 Draft PR #47
- D2-1 Draft PR #48
- D2-2 Draft PR #49 (D2-1 브랜치를 base로 사용)
- 모두 `main`에 자동 병합하지 않음.
