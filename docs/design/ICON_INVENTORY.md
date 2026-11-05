# LuxuryRental 아이콘 전수 조사 및 인벤토리 (Phase D1)

본 문서는 luxuryRental 애플리케이션의 전 페이지에서 사용되는 모든 아이콘, 엠블럼, 심볼을 전수 조사하고, **Luxury Engraved Metal Design System** 적용을 위한 세부 분류 및 교체 기준을 정의합니다.

---

## 1. 아이콘 분류 체계 (Classification)

| 등급 | 정의 | 적용 스타일 | 대상 요소 |
| :---: | :--- | :--- | :--- |
| **A** | **프리미엄 각인형 아이콘 (메이저)** | Satin Metal Deboss & Champagne Gold | 메인 3대 서비스 카드, 8-Grid 메뉴, 회원 혜택, 카테고리 대표 엠블럼, 완료 메달 |
| **B** | **절제된 마이크로 각인형 (마이너/기능)** | Graphite Micro-Bevel | 검색창, 설정 메뉴, 폼 인풋(이메일/비밀번호), 필터 칩, 액션 버튼 |
| **Admin** | **다크 건메탈 각인형 (관리자)** | Dark Gunmetal Engraving | 관리자 대시보드 KPI 카드, 구인 관리, 근무자 DB, 상품 테이블, 상태 배지 |
| **C** | **변경 금지 대상 (Immutable)** | 원본 100% 유지 | **하단 플로팅 내비게이션 5대 아이콘**, 공식 브랜드 로고(LV, 구찌 등), 소셜 로그인 심볼, 실제 상품 룩북 사진 |

---

## 2. 전수 조사 인벤토리 테이블

| Icon ID | Page | Component | Current Asset | Purpose | Current Size | Current Color | Issue | Replacement Style | Replacement Asset | Implementation Status | Visual QA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ACT-01` | `ShopMain` | `LuxuryDressIcon` | Custom SVG | 렌트하기 액션 카드 | 40x40 | #252525 / #B49A67 | 평면적인 선 위주 구성 | A (Satin Metal Deboss) | `EngravedDressEmblem` | Complete | Pass |
| `ACT-02` | `ShopMain` | `LuxuryBagIcon` | Custom SVG | 구매하기 액션 카드 | 40x40 | #252525 / #B49A67 | 단순 사각 백 형태 | A (Satin Metal Deboss) | `EngravedBagEmblem` | Complete | Pass |
| `ACT-03` | `ShopMain` | `LuxuryHandshakeIcon` | Custom SVG | 판매하기 액션 카드 | 44x44 | #252525 / #B49A67 | 선명도 및 입체감 부족 | A (Satin Metal Deboss) | `EngravedHandshakeEmblem` | Complete | Pass |
| `ACT-04` | `ShopMain` | `LuxuryGiftIcon` | Custom SVG | 회원가입 이벤트 카드 | 28x28 | #DFCA9B / #B49A67 | 모바일 명암 대비 부족 | A (Champagne Accent) | `EngravedGiftEmblem` | Complete | Pass |
| `MNU-01` | `ShopMain` | `MenuHangerIcon` | Custom SVG | 8-Grid: 렌트 소개 | 20x20 | #B49A67 / #DFCA9B | 단순 행거 선형 | A (Satin Metal Deboss) | `EngravedMenuHanger` | Complete | Pass |
| `MNU-02` | `ShopMain` | `MenuTagIcon` | Custom SVG | 8-Grid: 70% 할인 | 20x20 | #B49A67 / #DFCA9B | 폰트/심볼 작음 | A (Satin Metal Deboss) | `EngravedMenuTag` | Complete | Pass |
| `MNU-03` | `ShopMain` | `MenuClockIcon` | Custom SVG | 8-Grid: 오늘신규입고 | 20x20 | #B49A67 / #DFCA9B | 일반 시계 외형 | A (Satin Metal Deboss) | `EngravedMenuClock` | Complete | Pass |
| `MNU-04` | `ShopMain` | `MenuMembershipIcon`| Custom SVG | 8-Grid: 베이직멤버십 | 20x20 | #B49A67 / #DFCA9B | 평면 카드 형태 | A (Satin Metal Deboss) | `EngravedMenuMembership`| Complete | Pass |
| `MNU-05` | `ShopMain` | `MenuCareIcon` | Custom SVG | 8-Grid: 렌트잇 케어 | 20x20 | #B49A67 / #DFCA9B | 쉴드 라인 얇음 | A (Satin Metal Deboss) | `EngravedMenuCare` | Complete | Pass |
| `MNU-06` | `ShopMain` | `MenuVipIcon` | Custom SVG | 8-Grid: VIP | 20x20 | #B49A67 / #DFCA9B | 크라운 입체감 부족 | A (Champagne Accent) | `EngravedMenuVip` | Complete | Pass |
| `MNU-07` | `ShopMain` | `MenuBuybackIcon` | Custom SVG | 8-Grid: 바이백 | 20x20 | #B49A67 / #DFCA9B | 화살표 대비 낮음 | A (Satin Metal Deboss) | `EngravedMenuBuyback` | Complete | Pass |
| `MNU-08` | `ShopMain` | `MenuInviteIcon` | Custom SVG | 8-Grid: 친구 초대 | 20x20 | #B49A67 / #DFCA9B | 봉투 디테일 흐림 | A (Satin Metal Deboss) | `EngravedMenuInvite` | Complete | Pass |
| `NAV-01` | `ShopMain` | `List` | Lucide | 하단바: 카테고리 | 22x22 | #27272a | 변경 금지 | **C (Immutable)** | 원본 유지 | Keep Unchanged | Pass |
| `NAV-02` | `ShopMain` | `ShoppingBagIcon` | Custom SVG | 하단바: 내 상품 판매 | 22x22 | #27272a | 변경 금지 | **C (Immutable)** | 원본 유지 | Keep Unchanged | Pass |
| `NAV-03` | `ShopMain` | `Home` | Lucide | 하단바: 홈 | 22x22 | #000000 | 변경 금지 | **C (Immutable)** | 원본 유지 | Keep Unchanged | Pass |
| `NAV-04` | `ShopMain` | `Heart` | Lucide | 하단바: 좋아요 | 22x22 | #27272a | 변경 금지 | **C (Immutable)** | 원본 유지 | Keep Unchanged | Pass |
| `NAV-05` | `ShopMain` | `User` | Lucide | 하단바: 마이페이지 | 22x22 | #27272a | 변경 금지 | **C (Immutable)** | 원본 유지 | Keep Unchanged | Pass |
| `SET-01` | `ShopSettings` | `ShieldCheck` | Lucide | 관리자 대시보드 CTA | 24x24 | #4f46e5 | 일반 시스템 아이콘 | B (Graphite Bevel/Gunmetal)| `EngravedShieldAdmin` | Complete | Pass |
| `SET-02` | `ShopSettings` | `Bell` | Lucide | 푸시 알림 설정 | 20x20 | #4b5563 | 평면 선형 아이콘 | B (Graphite Micro-Bevel) | `EngravedBellIcon` | Complete | Pass |
| `SET-03` | `ShopSettings` | `Sparkles` | Lucide | 애니메이션 감축 | 20x20 | #4b5563 | 평면 선형 아이콘 | B (Graphite Micro-Bevel) | `EngravedSparkleIcon` | Complete | Pass |
| `SET-04` | `ShopSettings` | `Lock` | Lucide | 비밀번호 변경 | 20x20 | #4b5563 | 평면 자물쇠 | B (Graphite Micro-Bevel) | `EngravedLockIcon` | Complete | Pass |
| `SET-05` | `ShopSettings` | `HelpCircle` | Lucide | FAQ / 고객지원 | 20x20 | #4b5563 | 평면 물음표 | B (Graphite Micro-Bevel) | `EngravedHelpIcon` | Complete | Pass |
| `SET-06` | `ShopSettings` | `FileText` | Lucide | 약관 및 법적 공시 | 20x20 | #4b5563 | 평면 문서 | B (Graphite Micro-Bevel) | `EngravedDocumentIcon` | Complete | Pass |
| `SET-07` | `ShopSettings` | `LogOut` | Lucide | 로그아웃 버튼 | 20x20 | #dc2626 | 붉은색 단순 선형 | B (Graphite Micro-Bevel) | `EngravedLogOutIcon` | Complete | Pass |
| `MYP-01` | `ShopMyPage` | `User` | Lucide | 기본 아바타 프로필 | 48x48 | #9ca3af | 밋밋한 회색 원형 | A (Satin Silver Crest) | `EngravedProfileCrest` | Complete | Pass |
| `MYP-02` | `ShopMyPage` | `LuxuryCrownIcon` | Custom SVG | 관리자 계정 배지 | 16x16 | #DFCA8D / #B49A67 | 텍스트 대비 약함 | A (Champagne Accent) | `EngravedCrownEmblem` | Complete | Pass |
| `MYP-03` | `ShopMyPage` | `Heart` | Lucide | 마이페이지 찜 탭 | 20x20 | #111827 | 일반 하트 | B (Graphite Micro-Bevel) | `EngravedHeartIcon` | Complete | Pass |
| `MYP-04` | `ShopMyPage` | `ShoppingBag` | Lucide | 마이페이지 주문 탭 | 20x20 | #111827 | 일반 쇼핑백 | B (Graphite Micro-Bevel) | `EngravedBagSmall` | Complete | Pass |
| `MYP-05` | `ShopMyPage` | `RotateCcw` | Lucide | 마이페이지 판매신청 | 20x20 | #111827 | 일반 회전 화살표 | B (Graphite Micro-Bevel) | `EngravedRotateIcon` | Complete | Pass |
| `MYP-06` | `ShopMyPage` | `Edit3` | Lucide | 프로필 수정 버튼 | 16x16 | #6b7280 | 단순 연필 아이콘 | B (Graphite Micro-Bevel) | `EngravedPencilIcon` | Complete | Pass |
| `SRH-01` | `ShopSearch` | `SearchIcon` | Lucide | 검색 입력창 아이콘 | 18x18 | #9ca3af | 평면 돋보기 | B (Graphite Micro-Bevel) | `EngravedSearchIcon` | Complete | Pass |
| `SEL-01` | `ShopSell` | `PlusCircle` | Lucide | 직접 브랜드 등록 | 20x20 | #4f46e5 | 단순 원형 플러스 | B (Graphite Micro-Bevel) | `EngravedPlusCrest` | Complete | Pass |
| `SEL-02` | `ShopSell` | `Check` | Lucide | 감정 신청 완료 | 24x24 | #10b981 | 평면 체크 | A (Satin Metal Medal) | `EngravedSuccessMedal` | Complete | Pass |
| `ADM-01` | `ShopAdmin` | `<i class="plus">` | FontAwesome | 신규 상품 등록 | 16x16 | #000000 | 외부 웹폰트 종속 | Admin (Dark Gunmetal) | `EngravedAdminPlus` | Complete | Pass |
| `ADM-02` | `ShopAdmin` | `<i class="chat">` | FontAwesome | 실시간 소통 및 채팅 | 16x16 | #ffffff | 외부 웹폰트 종속 | Admin (Dark Gunmetal) | `EngravedAdminChat` | Complete | Pass |
| `ADM-03` | `ShopAdmin` | `<i class="users">` | FontAwesome | 근무자 DB 및 SMS | 16x16 | #ffffff | 외부 웹폰트 종속 | Admin (Dark Gunmetal) | `EngravedAdminUsers` | Complete | Pass |
| `ADM-04` | `ShopAdmin` | `<i class="handshake">` | FontAwesome | 위탁 판매 관리 | 16x16 | #ffffff | 외부 웹폰트 종속 | Admin (Dark Gunmetal) | `EngravedAdminHandshake`| Complete | Pass |
| `ADM-05` | `ShopAdmin` | `<i class="excel">` | FontAwesome | 엑셀 일괄 업로드 | 16x16 | #ffffff | 외부 웹폰트 종속 | Admin (Dark Gunmetal) | `EngravedAdminExcel` | Complete | Pass |
| `ADM-06` | `ShopAdmin` | `Send` / `Upload` | Lucide | 구인 요청 등록/발송 | 16x16 | #ffffff | 일반 루시드 아이콘 | Admin (Dark Gunmetal) | `EngravedAdminSend` | Complete | Pass |

