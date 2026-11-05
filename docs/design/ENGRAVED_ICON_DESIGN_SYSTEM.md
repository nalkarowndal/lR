# Luxury Rental — Luxury Engraved Metal / Satin Metal Deboss Design System

## 1. 개요 및 디자인 철학

**luxuryRental** 프리미엄 메탈 각인형(Luxury Engraved Metal / Satin Metal Deboss) 디자인 시스템은 기존의 평면적이고 투박한 범용 아이콘(Lucide, 기본 SVG, 이모지)에서 벗어나, 하이엔드 럭셔리 부티크의 아틀리에 금속 플레이트, 시계 베젤 인그레이빙, 음각 주얼리 인장을 웹·모바일 인터페이스에 완벽히 구현하는 전용 비주얼 시스템입니다.

---

## 2. 3대 핵심 소재 및 스타일 분류

| 소재 분류 (Material) | 시각적 특징 (Aesthetics) | 광원 및 명암 처리 (Lighting & Contrast) | 주요 적용 영역 (Application) |
|---|---|---|---|
| **Primary: Satin Metal Deboss** | 차분한 무광 새틴 실버/플래티넘과 샴페인 골드 에칭의 조화, 미세한 금속 브러시 질감과 얕은 음각 | 135도(좌상단) 입사각 스페큘러 하이라이트 + 우하단 소프트 드롭 섀도우 | 메인 3대 서비스 카드(렌트/구매/판매), 메인 8대 그리드 메뉴, 카테고리 대표 타일 |
| **Secondary: Graphite Micro-Bevel** | 깊이감 있는 딥 그라파이트(#252525) 베이스에 정교한 마이크로 베벨(Micro-Bevel) 절삭면 | 외곽 0.8px~1.2px 샴페인 골드 라이닝 + 내부 음각 컷아웃 | 설정, 검색, 마이페이지 프로필, 판매 신청 프로세스 |
| **Admin: Dark Gunmetal Engraving** | 고밀도 다크 건메탈(#1E2024~#2D3139)과 라이트 실버/골드 하이라이트의 조화 | 다크 모드 특화 고대비 인그레이빙 엣지 및 은은한 백라이트 림 | 최고관리자 대시보드 KPI 카드, 위탁/파트너십 관리, 채용/근무자 관리 |

---

## 3. 조형 및 구조적 원칙 (Form & Construction)

1. **실루엣 (Silhouette & Proportion)**
   - 브랜드의 기하학적 대칭성과 오뜨 꾸뛰르 아틀리에 라인을 바탕으로 간결하면서도 독보적인 실루엣 형성.
   - 각 아이콘은 24x24(메뉴/보조) 또는 48x48(서비스/카테고리) 정사각 뷰포트 그리드 시스템에 정확히 정렬.

2. **광원 방향 및 베벨 (135° Light Source & Precision Beveling)**
   - 모든 메탈 요소는 좌상단 135° 고정 가상 광원을 적용하여, 상단/좌측 면에 밝은 하이라이트(`#F5F2ED`, `#FFFFFF`), 하단/우측 면에 깊은 음영 섀도우(`rgba(0, 0, 0, 0.25)`)를 정밀 투사.

3. **음각 깊이감 (Deboss Depth)**
   - 평면 벡터가 아닌 소재 표면을 파고든 음각(Deboss) 효과를 위해 SVG `feDropShadow` 필터를 결합.
   - 얕은 깊이(Shallow: 0.5px~1px)로 모바일 작은 화면에서도 번짐이나 뭉개짐 없이 선명함 유지.

4. **선 두께 일관성 (Stroke Consistency)**
   - 24px 아이콘: 기본 스트로크 1.2px~1.4px, 정밀 보조선 0.8px.
   - 48px 아이콘: 기본 스트로크 1.6px~1.8px, 정밀 보조선 1.0px.
   - 곡선 연결부(Linejoin: round)와 마감부(Linecap: round)로 금속 모루 연마 가공 느낌 완성.

5. **마이크로 인터랙션 (Micro-Interactions)**
   - Hover: `scale(1.04)` 미세 확대와 부드러운 스페큘러 글로우.
   - Active / Click: `scale(0.97) translateY(0.5px)` 실제 물리적 금속 버튼이 눌리는 듯한 디보싱 피드백.

---

## 4. 하단 플로팅 내비게이션 불변 보존 원칙 (CRITICAL)

- **하단 내비게이션(Bottom Floating Nav: 카테고리, 내 상품 판매, 홈, 좋아요, 마이페이지)은 100% 원형 보존.**
- 신규 메탈 각인형 아이콘 시스템은 `.luxury-engraved-icon` 클래스스코프로 격리되어 있으며, 글로벌 `svg` 태그에 어떠한 스타일 오염도 유발하지 않습니다.
