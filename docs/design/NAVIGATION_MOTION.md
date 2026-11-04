# luxuryRental 화면 전환 애니메이션 및 내비게이션 명세서 (NAVIGATION_MOTION)

## 1. 모션 디자인 철학

luxuryRental의 모션 시스템은 과도한 움직임을 지양하고, **절제된 프리미엄 명품 앱(Restrained Luxury Motion)**의 감성을 지향합니다.
모든 화면 이동은 모바일 네이티브 앱의 시각적 연속성을 제공하도록 방향성(Directional Transition)을 가집니다.

---

## 2. 화면 이동 시간 및 타이밍 함수 규격

| 동작 (Action) | 전환 방향 | 애니메이션 클래스 | 지속시간 (Duration) | 이징 (Easing) |
|:---|:---:|:---|:---:|:---|
| **카테고리 진입** | Forward (우→좌) | `animate-slideInRight` | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **내 상품 판매 진입** | Forward (우→좌) | `animate-slideInRight` | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **설정 페이지 진입** | Forward (우→좌) | `animate-slideInRight` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **마이페이지 진입** | Forward (우→좌) | `animate-slideInRight` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **뒤로 가기 (Go Back)** | Backward (좌→우) | `animate-slideInLeft` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **모달/팝업 표시** | Center Scale | `animate-scaleUp` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **토스트 알림 노출** | Slide Down | `animate-slideDown` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## 3. 연속 클릭 방지 및 접근성 (Debounce & Accessibility)

1. **중복 전환 방지 (`isNavigating` Lock)**:
   - 화면 전환이 시작되면 280ms 동안 중복 클릭이 잠겨 불필요한 다중 렌더링 및 상태 왜곡을 방지합니다.
2. **`prefers-reduced-motion` 지원**:
   - 운영체제 수준에서 움직임 줄이기를 설정한 사용자는 모든 CSS 애니메이션 duration이 0.01ms로 축소되어 즉각 화면이 렌더링됩니다.
3. **사용자 환경설정 연동 ("화면 애니메이션 효과 줄이기")**:
   - 설정 페이지에서 토글을 활성화하면 `document.body`에 `reduce-motion` 클래스가 주입되어 즉시 모션이 비활성화됩니다.
