# Luxury Rental — Metal Material & Palette Guide

## 1. 정밀 메탈 컬러 팔레트 (Precision Metal Palette)

| 색상 명칭 (Color Token) | Hex 코드 | 용도 및 시각 효과 |
|---|---|---|
| **Deep Graphite** | `#252525` | 아이콘 본체 플레이트 베이스, 모던 럭셔리의 정제된 블랙 그레이 |
| **Dark Charcoal** | `#1C1C1C` / `#181818` | 음각 패인 안쪽 그림자 및 배경 대비 |
| **Muted Champagne Gold** | `#B49A67` | 럭셔리렌탈 브랜드 메인 골드, 아치 넥, 테두리 라이닝 |
| **Light Champagne** | `#C9B07A` / `#DFCA9B` | 금속 상단 반사면 스페큘러 하이라이트 |
| **Antique Brass** | `#A88C60` / `#7D653E` | 버클, 태그 아일릿, 정밀 기계 부속품의 묵직한 놋쇠 색상 |
| **Soft Platinum / Satin Silver** | `#E2E3E5` / `#C5C6C8` | 새틴 실버 메달리온 플레이트, 브러시 메탈 질감 |
| **Dark Gunmetal** | `#1E2024` / `#2D3139` | 관리자 다크 대시보드 전용 건메탈 바디 |
| **Gunmetal Rim / Highlight** | `#4A505C` / `#737A88` | 건메탈 아이콘의 베벨 절삭면 및 림 하이라이트 |
| **Warm Alabaster / Ivory** | `#F9F8F6` / `#F5F2ED` | 외곽 엠보싱 원형 링 배경, 눈부심 없는 프리미엄 서피스 |

---

## 2. 그라디언트 정의 (Gradients Spec)

### 1) Satin Metal Deboss Gradient (`lx-satin-grad`)
- **방향**: 135도 각도 (x1: 0, y1: 0 -> x2: 1, y2: 1)
- **Stops**:
  - `0%`: `#FFFFFF` (opacity: 0.9) — 좌상단 광원 반사
  - `35%`: `#D8D9DB` — 부드러운 새틴 실버
  - `70%`: `#A8ABB0` — 섀도우 그라데이션
  - `100%`: `#7E8187` — 우하단 절삭 베벨

### 2) Champagne Gold Etch Gradient (`lx-gold-grad`)
- **방향**: 135도 각도
- **Stops**:
  - `0%`: `#F0E2C2` — 반짝이는 골드 하이라이트
  - `30%`: `#D6BE8B` — 샴페인 골드 중간 톤
  - `70%`: `#B49A67` — 정통 브라스 골드
  - `100%`: `#7A6136` — 음각 림 섀도우

### 3) Dark Gunmetal Engraving Gradient (`lx-gunmetal-grad`)
- **방향**: 대각선
- **Stops**:
  - `0%`: `#4A505C` — 상단 베벨 반사광
  - `45%`: `#2E333D` — 묵직한 건메탈 그레이
  - `85%`: `#1C1F26` — 깊은 섀도우
  - `100%`: `#13151A` — 하단 음각 엣지

---

## 3. 음각 및 베벨 필터 (Deboss & Bevel Filters)

```xml
<filter id="lx-deboss-filter" x="-20%" y="-20%" width="140%" height="140%">
  <!-- 좌상단 135도 입사광에 의한 우하단 섀도우 -->
  <feDropShadow dx="0.5" dy="1" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.22" />
  <!-- 좌상단 미세 하이라이트 반사광 -->
  <feDropShadow dx="-0.4" dy="-0.4" stdDeviation="0.3" floodColor="#FFFFFF" floodOpacity="0.35" />
</filter>
```

