# luxuryRental 디자인 시스템 가이드 (DESIGN_SYSTEM)

## 1. 개요 및 디자인 철학

luxuryRental의 디자인 철학은 **"Modern Luxury & Minimal Commerce"**입니다. 과장된 장식 요소와 조잡한 원색 그라데이션을 철저히 배제하고, 절제된 여백, 정교한 타이포그래피, 고해상도 패션 에디토리얼 스튜디오 제품 사진, 그리고 **"Luxury Engraved Emblem & Precision Metal Engraving"** 아이콘 시스템을 통해 최고의 품격과 신뢰감을 제공합니다.

---

## 2. 디자인 토큰 (Design Tokens)

### 2.1 색상 팔레트 (Color Palette)

| 토큰명 | HEX / Tailwind | 용도 |
|:---|:---|:---|
| `color-primary` | `#0a0a0a` (`text-gray-950`) | 로고, 주요 헤드라인, 메인 액션 버튼 |
| `color-surface` | `#ffffff` (`bg-white`) | 메인 컨테이너, 카드, 모달 표면 |
| `color-background` | `#f9fafb` (`bg-gray-50`) | 모바일 앱 백그라운드 캔버스 |
| `color-border` | `#f3f4f6` / `#e5e7eb` | 카드 테두리, 구분선, 인풋 아웃라인 |
| `color-muted` | `#6b7280` (`text-gray-500`) | 서브 텍스트, 설명문, 카테고리 라벨 |
| `color-accent-blue` | `#4C51F7` | 회원가입 이벤트 뱃지, 프로모션 강조 |
| `color-success` | `#10b981` (`emerald-500`) | 성공 토스트, 예약 가능 뱃지, 인증 완료 |
| `color-error` | `#f43f5e` (`rose-500`) | 폼 유효성 에러, 필수 항목 미입력 안내 |

### 2.2 프리미엄 각인 아이콘 전용 메탈릭 토큰 (Luxury Engraved Palette)

| 토큰명 | HEX / 코드 | 시각적 특징 및 용도 |
|:---|:---|:---|
| **Deep Graphite** | `#252525` / `#2C2B2A` | 각인 아이콘의 깊이 있는 주조 베이스 및 섀도우 라인 |
| **Muted Champagne Gold** | `#B49A67` / `#DFCA9B` | 절제된 브러시드 골드 각인 선, 턴락 잠금장치, 엠블럼 하이라이트 |
| **Antique Brass** | `#A88C60` / `#8C734B` | 버클, 핸거 후크, 워치 인덱스 음각 디테일 |
| **Soft Platinum** | `#A6A8AA` / `#D9D3C7` | 플래티넘 모노그램 링, 미세 베벨 라인 |
| **Ivory Surface** | `#F8F6F1` / `#FAF8F5` | 메달리온 배경 표면, 왁스 인장 및 엠보스 캔버스 |
| **Engraving Shadow** | `rgba(0,0,0,0.12)` | 정교한 음각 입체감을 위한 미세 접촉 그림자 |

---

## 3. 아이콘 디자인 시스템 (Precision Metal Engraved Icons)

기존의 산만한 원색(분홍, 파랑, 초록, 노랑, 보라) 선형 일러스트를 영구 배제하고, 하이엔드 오뜨 꾸뛰르와 스위스 파인 워치메이킹 각인 기법을 디지털 벡터 SVG로 구현했습니다.

### 3.1 메인 서비스 액션 카드 (4종)
1. **렌트하기 (`LuxuryDressIcon`)**: 
   - Atelier Mannequin Couture Silhouette.
   - 샴페인 골드 행거 넥 + 깊은 그라파이트 플레어 드레스 + 섬세한 이중 주름 각인선.
2. **구매하기 (`LuxuryBagIcon`)**: 
   - Structured Leather Handbag Seal.
   - 아치형 골드 탑 핸들 + 안틱 브라스 버클 + 회전식 턴락 잠금장치 + 안장 스티치 윤곽.
3. **판매하기 (`LuxuryHandshakeIcon`)**: 
   - Concierge Consignment Partnership Crest.
   - 양각 메달리온 링 + 맞잡은 손의 미니멀 양각 인장 + 상하 미세 월계수 문양 각인.
4. **회원가입 이벤트 (`LuxuryGiftIcon`)**: 
   - Faceted Diamond Gift Medallion.
   - 각도별 광택을 지닌 패싯 기프트 박스 + 양각 더블 리본 각인.

### 3.2 메인 8-Grid 메뉴 아이콘 (8종)
모든 아이콘은 24×24 viewBox 내에서 1.2px~1.6px 일관된 획 굵기와 통일된 그라파이트/골드 듀얼톤으로 렌더링됩니다:
- **렌트 소개 (`MenuHangerIcon`)**: 럭셔리 부티크 브라스 옷걸이 각인.
- **70% 할인 (`MenuTagIcon`)**: 황동 그로밋과 직조 스트링이 결합된 가격 메달리온 태그.
- **오늘신규입고 (`MenuClockIcon`)**: 플루티드 베젤과 바티칸 인덱스가 각인된 파인 워치 다이얼.
- **베이직멤버십 (`MenuMembershipIcon`)**: 마그네틱 스트립과 스마트 칩이 양각된 메탈 회원 카드.
- **렌트잇 케어 (`MenuCareIcon`)**: 보증 스타가 각인된 컨시어지 쉴드 크레스트.
- **VIP (`MenuVipIcon`)**: 5개 정점에 진주 피니얼이 놓인 미니멀 임페리얼 코로넷.
- **바이백 (`MenuBuybackIcon`)**: 중앙 패싯 다이아몬드를 감싸는 순환 인피니티 엠블럼.
- **친구 초대 (`MenuInviteIcon`)**: 왁스 실 모노그램 인장이 찍힌 데클 에지 초대장.

### 3.3 브랜드 모노그램 메달리온 (`BrandMonogram`)
- 동심원 이중 음각 링 구조의 원형 메달리온.
- 폰트 규칙: 루이비통(LV)·구찌(GG)·샤넬(CC)은 세리프(Bodoni/Playfair 계열), 스톤아일랜드(SI)·CP컴퍼니(C.P.)는 모노스페이스, 셀린느(CEL)는 모던 그로테스크 타이포그래피.
- 활성 상태: 딥 그라파이트 배경(`#252525`) + 샴페인 골드 타이포그래피(`#DFCA9B`) + 골드 링 섀도우.

---

## 4. 반응형 레이아웃 표준 규격

- **360px 모바일 (Small Mobile)**: 2열 상품 그리드 가로 간격 8px, 좌우 패딩 12px.
- **390px 모바일 (Standard Mobile)**: 2열 상품 그리드 가로 간격 12px, 좌우 패딩 16px.
- **430px 모바일 (Large Mobile)**: 최대 폭 430px 컨테이너 중앙 정렬, 상하 스크롤바 은폐.
- **768px 태블릿 (Tablet)**: 모바일 앱 캔버스(430px) 중앙 배치 + 배경 미세 질감.
- **1440px 데스크톱 (Desktop)**: 중앙 430px 뷰포트 + 좌측 고정 앱 다운로드 & QR 배너(256px) 자동 도킹.
