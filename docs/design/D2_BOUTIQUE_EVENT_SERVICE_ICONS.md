# D2-1 — 회원가입 이벤트와 프리미엄 서비스 8개 메뉴 Iconoir 전환

## 목적과 범위
D1의 `Boutique Line + Atelier Engraved` 시스템을 기존 화면 구조를 유지하면서 메인 이벤트와 8개 메뉴에 확장합니다.

- 회원가입 이벤트: Iconoir `gift`, Atelier Engraved 샴페인 골드. 원형 반투명 메달과 보라색 장식 제거.
- 렌트 소개: `shirt`, Boutique Line. 제목·클릭 영역으로 렌탈 의미 보완.
- 70% 할인: `percentage`, Boutique Line.
- 오늘신규입고: `box`, Boutique Line.
- 베이직멤버십: `credit-card`, Boutique Line.
- 렌트잇 케어: `shield-check`, Boutique Line.
- VIP: `crown`, Atelier Engraved.
- 바이백: `refresh-double`, Boutique Line.
- 친구 초대: `mail`, Boutique Line.

모든 SVG 벡터 경로는 Iconoir GitHub `icons/regular/*.svg` 원본에서 확인한 데이터를 사용합니다. 경로를 창작하지 않으며, 공통 `D2Icon` 컴포넌트에서 stroke·그라데이션만 통일합니다. `React.useId`로 각 금속 그라데이션 ID 충돌을 방지합니다.

## 디자인 준수
- 이벤트의 선물 상자 주위 원형 메달은 완전 제거.
- 8개 메뉴의 아이콘별 박스·테두리는 제거하고 48px 배치 공간을 유지.
- 메인 카드 영역, 4열 메뉴 레이아웃, 문구, 이벤트 클릭·키보드 동작과 메뉴별 핸들러 유지.
- 하단 내비게이션 5개 아이콘과 클릭 동작은 **변경하지 않음**.
- 스플래시 D1 디자인, 상품 이미지 및 브랜드 로고는 변경하지 않음.
- 이번 D2-1에서 다른 페이지(카테고리, 검색, 판매, 마이페이지, 관리자) 아이콘까지 무작위로 변경하지 않음.

## QA / 최종 승인 조건
1. `cd frontend && npm ci && npm run test:d2 && npm run build`
2. `npx oxlint src/components/icons/BoutiqueD2Icons.tsx src/components/ShopMain.tsx`
3. Chrome 360/390/430px 실화면: 이벤트 선물상자·9개 D2 아이콘 표시, 하단바 5개, 가로 넘침·pageerror 없음.
4. 각 SVG를 실제 DOM에서 추출해 24/32/48/72px 비교 보드 생성.
5. 이벤트 등록 오버레이와 8개 메뉴의 이벤트 핸들러를 코드로 검증하고, 전체 브라우저 E2E 동작도 추후 검수.
6. 실제 Android/iOS 기기의 색상·터치·화면 검수 후 디자인 승인.

## GitHub
- D1 기준 작업 브랜치: `design/d1-iconoir-boutique-atelier` (Draft PR #47, `main` 미병합).
- D2 작업 브랜치: `design/d2-boutique-event-service-icons`, D1을 기준으로 분기.
- D2는 D1에 대한 후속 PR로 관리하며, `main` 직접 반영 금지.

## 출처
- https://iconoir.com/icons
- https://github.com/iconoir-icons/iconoir
- `docs/design/ICONOIR_LICENSE.md`
