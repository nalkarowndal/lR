# luxuryRental — Phase 6 프리미엄 메탈 각인형 아이콘 리파인먼트 보고서

## 1. 개요 및 설계 철학

본 문서는 **Phase 6**에서 고도화된 **Luxury Engraved Metal / Satin Metal Deboss** 디자인 시스템과 각인형 아이콘 패밀리의 시각적 밸런스, 메탈 반사광 및 음각 깊이 제어, 플랫폼 전역의 조화로운 통합 결과를 상세히 기술합니다.

### 🌟 핵심 설계 원칙
1. **Satin Metal Deboss (음각 각인 기법)**:
   - 미세 베벨(Micro-Bevel, 0.75px ~ 1.5px)과 다크 이너 섀도(`inset 0 1px 2px rgba(0,0,0,0.45)`)를 통해 금속 표면에 레이저 각인된 듯한 물리적 입체감을 구현했습니다.
2. **소재감에 따른 광원 방향의 일관성**:
   - 주 광원을 135도(좌상단 -> 우하단)로 통일하여 하이라이트 림(`border-t border-l border-white/20`)과 섀도우 베이스(`border-b border-r border-black/40`)를 정밀하게 표현했습니다.
3. **가독성 최적화 (20px ~ 48px)**:
   - 소형 모바일(360px ~ 430px) 화면에서도 아이콘 실루엣이 뭉개지지 않도록 불필요한 장식선을 배제하고 형태 본연의 기하학적 명확성을 극대화했습니다.
4. **하단 내비게이션 불변 원칙 (IMMUTABLE)**:
   - 사용자 지침에 따라 하단 플로팅 내비게이션(카테고리, 내 상품 판매, 홈, 좋아요, 마이페이지)의 5개 아이콘은 일체 수정하지 않고 100% 보존했습니다.

---

## 2. 각 영역별 각인형 메탈 아이콘 적용 명세

### 2.1 메인 서비스 액션 카드 (3대 핵심 엠블럼)
- **EngravedDressIcon (렌트하기)**:
  - 섬세한 드레스 실루엣에 샴페인 골드(`from-amber-200 via-yellow-400 to-amber-600`) 음각 그라데이션 적용.
- **EngravedBagIcon (구매하기)**:
  - 클래식 핸드백 실루엣과 새틴 실버 메탈릭 텍스처 조합으로 고급스러움 강조.
- **EngravedHandshakeIcon (판매하기)**:
  - 신뢰를 상징하는 악수 엠블럼에 다크 브론즈 음각을 적용하여 안심 위탁 판매의 가치를 전달.

### 2.2 메인 8-Grid 프리미엄 각인 메뉴
| 메뉴명 | 아이콘 컴포넌트 | 메탈 소재 및 마감 | 시각적 특징 |
| :--- | :--- | :--- | :--- |
| **렌트 소개** | `MenuHangerIcon` | Satin Gold Deboss | 옷걸이 모티프의 단정한 선형 각인 |
| **70% 할인** | `MenuTagIcon` | Rose Gold Deboss | 럭셔리 태그 형태에 음각 백분율 기호 |
| **오늘신규입고** | `MenuClockIcon` | Brushed Titanium | 정밀 시계 다이얼 형태의 메탈 림 |
| **베이직멤버십** | `MenuMembershipIcon` | Platinum Card Deboss | 멤버십 VIP 카드 형상 음각 |
| **렌트잇 케어** | `MenuCareIcon` | Emerald Bronze Shield | 안심 케어 보증 방패 엠블럼 |
| **VIP** | `MenuVipIcon` | 24K Deep Gold Crown | 정교한 3봉 크라운 각인 |
| **바이백** | `MenuBuybackIcon` | Chrome Loop Deboss | 순환 화살표와 다이아몬드 모티프 |
| **친구 초대** | `MenuInviteIcon` | Golden Gift Deboss | 리본 선물함 음각 엠블럼 |

### 2.3 브랜드 모노그램 메달리온 (14대 명품)
14대 하이엔드 럭셔리 브랜드의 고유 아이덴티티를 원형 메탈 메달리온 형태로 구현:
- **LV (루이비통)**: 다크 브라운 베이스에 샴페인 골드 LV 모노그램 양각
- **CC (샤넬)**: 옵시디언 블랙 베이스에 실버 인터로킹 더블 C
- **GG (구찌)**: 앤틱 골드 베이스에 인터로킹 G 심볼
- **PRD (프라다)**: 트라이앵글 인스파이어드 사피아노 텍스처 메달
- **CD (디올)**: 우아한 서체의 CD 오벌 카메오 메달리온
- **H (에르메스)**: 르 뒤크 마차와 H 이니셜 오렌지 골드 메달
- **BV (보테가 베네타)**: 정교한 인트레치아토 위빙 패턴 음각
- **YSL (생로랑)**: 수직 카산드라 로고 양각 메달
- **BB (발렌시아가)**: 볼드 모던 BB 심볼 건메탈 메달
- **RLX (롤렉스)**: 5포인트 크라운 롤렉스 그린 & 골드 플루티드 베젤 메달
- **CRT (까르띠에)**: 루비 레드 백그라운드 필리그리 C 모노그램
- **CEL (셀린느)**: 개선문 체인 트리옹프 아치 메달리온
- **SI (스톤 아일랜드)**: 나침반 로즈 와펜 엠블럼 윈드 로즈
- **C.P. (CP 컴퍼니)**: 밀레밀리아 고글 렌즈 실버 메탈 메달

### 2.4 설정 및 회원 마이페이지 (Graphite Micro-Bevel)
- `EngravedProfileCrest`: 고객 등급(VIP, 일반 회원)을 표기하는 가문 문장 형태의 메탈 크레스트
- `EngravedLockIcon`: 계정 보안 및 비밀번호 변경 모달용 티타늄 자물쇠
- `EngravedBellIcon`: 푸시 알림 수신 토글을 위한 새틴 브론즈 벨
- `EngravedSparkleTier`: 멤버십 적립 및 VIP 혜택 표시용 4각 스파클

### 2.5 관리자 센터 (Dark Gunmetal Engraving)
- `EngravedShieldAdmin`: 👑 최고관리자 보안 배지 및 대시보드 마스터 실드
- `EngravedAdminExcel`: 35개 지점 TO 동기화용 건메탈 엑셀 시트 엠블럼
- `EngravedAdminPlus`: 신규 명품 상품 등록용 플래티넘 플러스 버튼
- `EngravedAdminHandshake`: 위탁 판매 신청 관리용 골드 메탈 핸드셰이크

---

## 3. 하단 내비게이션 불변성 (Zero-Regression) 검증

- **파일 위치**: `frontend/src/components/ShopMain.tsx` (lines 880-935)
- **보존 항목**:
  1. `List` (카테고리)
  2. `ShoppingBagIcon` (내 상품 판매)
  3. `Home` (홈)
  4. `Heart` (좋아요)
  5. `User` (마이페이지)
- **검증 결과**: 하단바 아이콘 크기(20px), 라벨 폰트(10px), 액티브 인디고 컬러(`text-indigo-600`), 플로팅 컨테이너 그림자(`shadow-lg border-t border-gray-100`) 모두 원형 그대로 100% 보존되었습니다.
