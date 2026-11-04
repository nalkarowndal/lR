# luxuryRental 모션 및 애니메이션 시스템 규격서 (MOTION_SYSTEM)

## 1. 개요 및 모션 철학

luxuryRental의 모션 시스템은 **"Discreet, Fluid, and Purposeful"** (절제되고, 유려하며, 목적이 분명한 인터랙션)을 지향합니다. 화려하고 산만한 효과 대신 사용자의 행동에 명확한 물리적 피드백을 전달하고, 자연스러운 화면 위계를 확립합니다.

---

## 2. 모션 지속 시간 및 이징 (Timing & Easing)

| 인터랙션 분류 | 권장 지속 시간 (Duration) | 이징 커브 (Easing) | 사용 대상 |
|:---|:---|:---|:---|
| **Micro (버튼 피드백)** | `100ms ~ 150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | 버튼 Press (`active:scale-[0.98]`), 토글 체크 |
| **Hover / Focus** | `150ms ~ 200ms` | `ease-out` | 상품 카드 마이크로 리프트, 인풋 포커스 링 |
| **Dialog / Modal** | `200ms ~ 260ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | 모달 열기(Scale 0.95 -> 1.0, Fade In) |
| **Toast Notification** | `220ms ~ 280ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | 토스트 Slide Down & Fade In |
| **Slide Overlay** | `260ms ~ 320ms` | `cubic-bezier(0.32, 0.72, 0, 1)` | 로그인/검색 전체화면 슬라이드 오버레이 |
| **Image Fade-In** | `250ms ~ 350ms` | `ease-in-out` | 상품 이미지 로드 완료 시 스켈레톤에서 교체 |

---

## 3. 접근성 지원 (Prefers-Reduced-Motion)

사용자가 OS 수준에서 '움직임 감소' 옵션을 활성화한 경우 불필요한 스케일링이나 슬라이딩 애니메이션을 즉시 제거하고 부드러운 불투명도(Opacity) 변화로만 대체합니다.

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. 커스텀 CSS 키프레임 정의 (`frontend/src/index.css`)

- `@keyframes fadeIn`: 0% opacity 0 -> 100% opacity 1
- `@keyframes scaleUp`: 0% opacity 0, transform scale(0.95) -> 100% opacity 1, transform scale(1)
- `@keyframes slideDown`: 0% opacity 0, transform translateY(-12px) -> 100% opacity 1, transform translateY(0)
- `@keyframes slideUp`: 0% opacity 0, transform translateY(12px) -> 100% opacity 1, transform translateY(0)
