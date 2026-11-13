# D1 개정 — Iconoir 기반 Boutique Line + Atelier Engraved

## 디자인 정책
- 자체 아이콘 경로를 새로 그리지 않습니다. Iconoir `crown`, `shirt`, `handbag`, `shopping-bag-arrow-up`의 SVG 원본 path를 재사용합니다.
- 스플래시 왕관: Atelier Engraved. 깊은 검은 바탕 위 샴페인 골드 미세 윤곽, 원형 메달 제거.
- 렌트·구매·판매: Boutique Line. 시인성을 높인 그라파이트 선형, 불필요한 금속 배지 없음.
- 판매하기: 원래 Iconoir의 상품 가방 + 상승 화살표 단일 아이콘. 별도 조합이나 새 경로 불필요.
- 하단 고정 네비게이션, 카테고리 사진, 브랜드/결제 로고는 변경하지 않습니다.
- 초기에 보이는 native splash (`frontend/index.html`)와 React splash (`SplashScreen.tsx`)에 같은 아이콘 윤곽을 사용합니다.
- D1은 핵심 아이콘 4종만 교체합니다. D2/D3 메뉴와 유틸리티 아이콘은 추후 진행합니다.

## 구현 메모
- 라이브러리 의존성 추가 대신 MIT 라이선스 원본 SVG geometry를 벤더링해 `package-lock.json`을 변경하지 않습니다.
- 같은 컴포넌트를 반복 렌더링해도 `useId()`로 SVG gradient ID 충돌을 피합니다.
- 작은 실사용 크기에서는 지나친 효과를 억제합니다.
- 스플래시 브랜드 마크는 큰 크기에서 미세한 마감 표현을 사용합니다.
- 사진과 로고는 실물 이미지로 유지합니다.

## 검수 체크리스트
1. 24 / 32 / 48 / 72px 렌더링 확인.
2. 모바일 360 / 390 / 430px 화면에서 겹침 여부 확인.
3. native → React splash 전환 때 심볼 위치·크기 일관성 확인.
4. 렌트·구매·판매 탭 이동과 키보드 동작 확인.
5. 하단 네비게이션 diff가 없는지 확인.
6. `npm ci && npm run build && npm run lint`로 타입·빌드 검증.
7. 유의미한 UI 그래픽의 비텍스트 대비는 3:1을 참고해 검토 (WCAG 2.2 SC 1.4.11).

## 출처
- https://iconoir.com/docs/packages/iconoir-react
- https://iconoir.com/icons
- https://github.com/iconoir-icons/iconoir/blob/main/LICENSE
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast

## 현재 상태
D1 교체 작업 브랜치. 시각적 브라우저 실기기 QA 및 디자인 최종 승인은 별도 검증이 필요합니다.


## D1-Refinement — 고충실도 마감 개선 (2026-11-13)
- **Iconoir 원본 geometry 유지**. 외부에서 새 경로를 창작하지 않음.
- **Atelier Engraved**: 왕관 내부를 어두운 금속면으로 처리하고, 샴페인 골드의 6단계 색상 그라데이션·정밀한 얇은 가장자리·SVG `feComposite`의 상단 내측 절삭 음영을 적용. 원형 메달은 계속 사용하지 않음.
- **Boutique Line**: 과도한 밝은 외부 후광을 제거. 어두운 그라파이트 1.52 SVG 단위의 본선과 얕은 아래쪽 재질 엣지를 사용해 확대 시 선이 뭉치는 현상을 최소화함.
- **스플래시 일관성**: `frontend/index.html` native와 `SplashScreen.tsx`의 금색 그라데이션·필터 계수·기본 왕관 원형 동일.
- **시각 QA**: 실제 Chrome DOM에 렌더링된 SVG를 추출하여 24 / 32 / 48 / 72px 크기별 비교 보드 `d1-refinement-optical-board.png`를 자동 생성함.
- **QA 산출물**: GitHub Actions `d1-browser-qa-screens` 아티팩트의 메인 360/390/430px + 두 스플래시 + 크기별 비교 보드를 확인함.
- **품질 경계**: 마스터 SVG 형태와 코드 품질은 확인했으나, Android/iOS 실기기 및 사용자 디자인 승인은 별도. D2 메뉴 8종과 기타 페이지 아이콘은 이번 PR에 포함하지 않음.
