# Luxury Rental — Engraved Icon Component Specifications

## 1. 컴포넌트 아키텍처 (Component Architecture)

모든 각인형 메탈 아이콘은 TypeScript 엄격 모드(`verbatimModuleSyntax`)와 접근성 표준(WAI-ARIA)을 준수하도록 설계되었습니다.

```
frontend/src/components/icons/
├── EngravedIcon.types.ts           # 타입 정의 (MetalVariant, IconSize, Props)
├── EngravedIconTokens.tsx          # 색상 토큰, 공통 SVG Defs (그라디언트 & 필터)
├── EngravedIcon.tsx                # 베이스 컨테이너 SVG 컴포넌트
├── services/
│   ├── EngravedServiceIcons.tsx    # 렌트, 구매, 판매, 이벤트 배너 아이콘
│   └── EngravedMenuIcons.tsx       # 메인 8대 그리드 메뉴 아이콘
├── categories/
│   └── EngravedCategoryIcons.tsx   # 신발, 주얼리, 의류, 가방/러기지, 시계, 지갑
├── account/
│   └── EngravedAccountIcons.tsx    # 프로필 크레스트, 로열 크라운, 쉴드, 자물쇠, 알림 벨
├── admin/
│   └── EngravedAdminIcons.tsx      # 관리자 파트너십, 등록, 채팅, 유저, 엑셀, 새로고침
└── index.ts                        # 배럴 익스포트
```

---

## 2. 인터페이스 명세 (Type Definitions)

```typescript
export type MetalVariant = 'satin' | 'graphite' | 'gunmetal' | 'champagne' | 'silver';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface EngravedIconBaseProps extends React.SVGProps<SVGSVGElement> {
  variant?: MetalVariant;
  size?: IconSize;
  className?: string;
  title?: string;
  ariaLabel?: string;
  active?: boolean;
  depth?: 'shallow' | 'medium' | 'deep';
  glow?: boolean;
}

export interface EngravedMenuIconProps {
  className?: string;
  size?: number;
  variant?: MetalVariant;
  active?: boolean;
}
```

---

## 3. SVG ID 충돌 방지 아키텍처 (Deterministic Prefixes)

웹 애플리케이션 내에서 복수의 SVG 그래디언트 및 필터가 사용될 때 발생할 수 있는 ID 충돌(ID Clashing) 문제를 원천 차단하기 위해, 각 아이콘 모듈은 고유한 네임스페이스 프리픽스(`prefix="dress"`, `prefix="bag"`, `prefix="mnu-tag"`, `prefix="adm-hs"` 등)를 부여받아 렌더링됩니다.

---

## 4. 접근성 및 키보드 지원 (Accessibility Compliance)

- 장식용 아이콘: `title` 및 `ariaLabel`이 생략된 경우 `role="presentation"` 및 `aria-hidden="true"` 자동 부여.
- 의미형 아이콘: `title` 또는 `ariaLabel` 제공 시 `role="img"` 및 `<title>` 태그 자동 삽입.
- 포커스 시: 부모 인터랙티브 요소의 포커스 링과 연동되어 뭉개짐 없이 선명한 외곽선 유지.

