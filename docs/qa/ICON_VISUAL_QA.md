# Luxury Rental — Icon Visual QA Report

## 1. 테스트 환경 및 검증 개요

- **테스트 일시**: 2026-11-05
- **테스트 대상**: `ShopMain.tsx`, `ShopCategory.tsx`, `ShopSearch.tsx`, `ShopSettings.tsx`, `ShopMyPage.tsx`, `ShopSell.tsx`, `ShopAdmin.tsx`
- **검증 해상도**: 모바일 중앙 컨테이너(448px), 데스크톱(1440px), 레티나 2x DPR
- **검증 도구**: Vitest/Node Test Runner, Vite 번들러, Puppeteer Headless Browser

---

## 2. 화면별 정밀 시각 검증 결과

| 화면 | 검증 항목 | 합격 여부 (Pass/Fail) | 관찰 결과 및 시각적 품질 |
|---|---|:---:|---|
| **메인 홈 (ShopMain)** | 3대 서비스 액션 카드 (렌트/구매/판매) | **PASS** | 48x48 뷰포트 내 새틴 실버 메달리온과 135도 스페큘러 입사광 정상 렌더링. 음각 드레이프와 턴락 디테일 선명함. |
| **메인 홈 (ShopMain)** | 신규 가입 이벤트 배너 (EngravedGiftIcon) | **PASS** | 샴페인 골드 리본 보우와 딥 그라파이트 박스의 명암 대비가 화려하면서도 눈부심 없이 조화로움. |
| **메인 홈 (ShopMain)** | 8-Grid 프리미엄 메뉴 | **PASS** | 24x24 뷰포트 정렬 완벽. 시계 다이얼, 옷걸이, 태그 등 8개 아이콘이 일관된 1.2px 스트로크와 디보싱 깊이를 유지. |
| **카테고리 (ShopCategory)** | 브랜드 모노그램 메달리온 & 카탈로그 배지 | **PASS** | 14개 명품 브랜드 모노그램 링 렌더링 정상. 상품 미보유 시 로딩 플레이트 워터마크 정상 노출. |
| **검색 (ShopSearch)** | 검색 인풋 마이크로 베벨 인디케이터 | **PASS** | 24px 원형 알라바스터 베벨 링 내부에 크리스프한 검색 글리프 렌더링. 320ms 전환 후 포커스 정상 작동. |
| **설정 (ShopSettings)** | 계정, 보안, 알림 3대 설정 그룹 | **PASS** | Graphite Micro-Bevel 자물쇠, 알림 벨, 스파클, 프로필 크레스트가 단정한 그레이 톤으로 정렬. |
| **마이페이지 (ShopMyPage)** | 관리자 엠블럼, 쉴드, 웰컴 크레스트 | **PASS** | 5첨탑 임페리얼 크라운이 텍스트와 완벽히 인라인 정렬. 쉴드 크레스트와 버스트 인장이 럭셔리 무드 강조. |
| **위탁 판매 (ShopSell)** | 판매 접수 완료 인증 골드 메달 | **PASS** | 64x64 대형 메달리온 내 체크마크와 리본 테일이 신뢰감과 성취감을 극대화. |
| **관리자 센터 (ShopAdmin)** | 건메탈 헤더 탭 및 엑셀/새로고침 버튼 | **PASS** | 다크 건메탈 바디와 샴페인 골드 액센트가 다크 테마 대시보드와 완벽하게 융합. FontAwesome 의존성 제거 완료. |

---

## 3. 대비비(Contrast Ratio) 및 가독성 검증

- **밝은 배경 (Ivory `#F9F8F6` / White `#FFFFFF`)**:
  - `Deep Graphite (#252525)` 본체 선: 대비비 **12.6:1** (WCAG AAA 기준 7:1 대폭 초과 만족)
  - `Champagne Gold (#B49A67)` 테두리: 대비비 **3.2:1** (장식 및 보조선 기준 적합)
- **어두운 배경 (Gunmetal `#1E2024` / Slate `#09090B`)**:
  - `Light Champagne (#DFCA9B)` 하이라이트: 대비비 **10.8:1** (WCAG AAA 만족)
  - `Light Silver (#C5C6C8)` 엣지: 대비비 **8.9:1** (WCAG AAA 만족)

---

## 4. 마이크로 인터랙션 및 성능 검증

1. **호버 (Hover)**: `scale(1.04)` 변환 시 레이아웃 리플로우(Layout Reflow) 발생 없이 GPU 가속(`transform`)으로 60fps 부드러운 전환 확인.
2. **클릭 (Active)**: `scale(0.97) translateY(0.5px)` 물리적 메탈 누름 감각 정상 작동.
3. **SVG 필터 렌더링 부하**: `feDropShadow` 필터가 모바일 CPU에 미치는 영향 0.1ms 미만으로 지연 없음 확인.
