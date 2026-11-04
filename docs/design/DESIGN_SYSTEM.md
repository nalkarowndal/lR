# luxuryRental 디자인 시스템 가이드 (DESIGN_SYSTEM)

## 1. 개요 및 디자인 철학

luxuryRental의 디자인 철학은 **"Modern Luxury & Minimal Commerce"**입니다. 과장된 장식 요소를 배제하고, 여백과 정교한 타이포그래피, 고해상도 스튜디오 제품 사진, 그리고 직관적이고 부드러운 반응형 인터랙션을 통해 신뢰감 있는 하이엔드 쇼핑 경험을 전달합니다.

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
| `admin-dark-bg` | `#0f172a` (`bg-slate-900`) | 관리자 대시보드 딥 다크 캔버스 |
| `admin-glass-surface`| `rgba(30, 41, 59, 0.7)` | 관리자 글래스모피즘 카드 및 헤더 |

### 2.2 타이포그래피 (Typography)

| 레벨 | 폰트 크기 / 줄간격 | 굵기 | 주요 사용처 |
|:---|:---|:---|:---|
| **Display** | 24px ~ 28px (`text-2xl ~ text-3xl`) | Black (`font-black`) | 앱 로고 (`LUXURYRENTAL`), 메인 타이틀 |
| **Headline** | 18px ~ 20px (`text-lg ~ text-xl`) | Extrabold (`font-extrabold`) | 모달 헤더, 섹션 제목, 상품 상세명 |
| **Title** | 15px ~ 16px (`text-[15px] ~ text-base`) | Bold (`font-bold`) | 브랜드명, 상품 카드 제목, 탭 라벨 |
| **Body** | 13px ~ 14px (`text-[13px] ~ text-sm`) | Medium / Regular | 본문, 폼 입력 필드, 설명 텍스트 |
| **Caption** | 11px ~ 12px (`text-[11px] ~ text-xs`) | SemiBold / Bold | 배지 텍스트, 할인율, 날짜, 푸터 |

### 2.3 곡률 및 그림자 (Border Radius & Shadows)

- `rounded-lg`: 8px (작은 뱃지, 태그, 인풋 내부 요소)
- `rounded-xl`: 12px (버튼, 폼 인풋 필드, 작은 카드)
- `rounded-2xl`: 16px (모달 창, 상품 카드, 컨테이너 카드)
- `shadow-xs`: 0 1px 2px rgba(0,0,0,0.05) (부드러운 버튼 그림자)
- `shadow-sm`: 0 2px 4px rgba(0,0,0,0.05) (상품 카드 호버/포커스)
- `shadow-xl`: 0 20px 25px -5px rgba(0,0,0,0.1) (플로팅 모달, 바텀시트)

---

## 3. 공통 컴포넌트 규격

### 3.1 폼 인풋 (`Input`)
- 높이: 48px ~ 52px (모바일 터치 타겟 44px 이상 준수)
- 기본 상태: 테두리 `border-gray-200`, 배경 `bg-white`
- 포커스 상태: 테두리 `border-gray-950`, 외곽선 부드러운 링 `ring-1 ring-gray-950`
- 에러 상태: 테두리 `border-rose-500`, 에러 문구 `text-rose-500 text-xs`

### 3.2 버튼 (`Button`)
- 주 액션: `bg-gray-950 text-white hover:bg-black active:scale-[0.98] rounded-xl font-bold`
- 보조 액션: `border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] rounded-xl font-bold`
- 비활성화: `opacity-40 cursor-not-allowed`

### 3.3 상품 비주얼 (`ProductImage`)
- 종횡비: 1:1 정방형 (`aspect-square`) 유지
- 배경: `bg-gray-50`
- 로딩: `animate-pulse bg-gray-200`
- 에러 처리: `ProductVisualBadge` SVG 자동 대체

