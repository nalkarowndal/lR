# Luxury Rental — Page-by-Page Icon Application Mapping

## 1. 전체 페이지별 아이콘 적용 매핑

| 페이지/컴포넌트 | 위치 및 역할 | 이전 아이콘 | 적용된 신규 프리미엄 아이콘 | 소재 스타일 |
|---|---|---|---|---|
| **ShopMain.tsx** | 서비스 액션 카드 (렌트하기) | 기본 드레스 SVG | `EngravedDressIcon` | Satin Metal Deboss + Champagne Hook |
| **ShopMain.tsx** | 서비스 액션 카드 (구매하기) | 기본 핸드백 SVG | `EngravedBagIcon` | Satin Metal Deboss + Turn-lock Clasp |
| **ShopMain.tsx** | 서비스 액션 카드 (판매하기) | 기본 악수 SVG | `EngravedHandshakeIcon` | Satin Metal Deboss + Laurel Wreath Crest |
| **ShopMain.tsx** | 회원가입 이벤트 배너 | 단순 선물 이모지/SVG | `EngravedGiftIcon` | Faceted Champagne Gold Gift Medallion |
| **ShopMain.tsx** | 8-Grid 메뉴 1: 렌트 소개 | 일반 행거 | `EngravedHangerIcon` | Satin Deboss Brass Hanger |
| **ShopMain.tsx** | 8-Grid 메뉴 2: 70% 할인 | 기본 태그 | `EngravedTagIcon` | Engraved Price Tag & Grommet |
| **ShopMain.tsx** | 8-Grid 메뉴 3: 오늘신규입고 | Lucide Clock | `EngravedClockIcon` | High-End Watch Bezel Dial |
| **ShopMain.tsx** | 8-Grid 메뉴 4: 베이직멤버십 | 기본 신용카드 | `EngravedMembershipIcon` | Metal Membership Card & Chip |
| **ShopMain.tsx** | 8-Grid 메뉴 5: 렌트잇 케어 | 기본 방패 | `EngravedCareIcon` | Seal of Care Shield Crest |
| **ShopMain.tsx** | 8-Grid 메뉴 6: VIP | 기본 왕관 | `EngravedVipIcon` | Imperial Crest Coronet |
| **ShopMain.tsx** | 8-Grid 메뉴 7: 바이백 | 기본 리사이클 | `EngravedBuybackIcon` | Infinity Luxury Exchange |
| **ShopMain.tsx** | 8-Grid 메뉴 8: 친구 초대 | 기본 편지봉투 | `EngravedInviteIcon` | Deckle Edge Wax Seal Invite |
| **ShopCategory.tsx** | 상단 카테고리 1: 슈즈 타일 | Lucide Footprints | `EngravedSneakerIcon` | Satin Deboss Sneaker Silhouette |
| **ShopCategory.tsx** | 상단 카테고리 2: 주얼리 타일 | Lucide Sparkles | `EngravedJewelryIcon` | Faceted Solitaire Diamond Crest |
| **ShopCategory.tsx** | 상단 카테고리 3: 가방/러기지 타일 | Lucide Briefcase | `EngravedLuggageIcon` | Vintage Trunk & Corner Protectors |
| **ShopSearch.tsx** | 검색창 포커스 및 인풋 필드 | 기본 Lucide Search | `SearchIcon` with Graphite Bevel Ring | Graphite Micro-Bevel |
| **ShopSell.tsx** | 판매 완료 확인 모달 | 기본 녹색 체크 | `EngravedMedalEmblem` | Consignment Certificate Gold Medal |
| **ShopSell.tsx** | 상품 사진 업로드 영역 | Lucide Camera | `EngravedCameraIcon` | Graphite Micro-Bevel Camera |
| **ShopSettings.tsx** | 관리자 전용 배지 | 텍스트/이모지 | `EngravedCrownEmblem` | Imperial Regal Crown Engraving |
| **ShopSettings.tsx** | 보안/인증 항목 | Lucide Lock | `EngravedLockIcon` | Graphite Micro-Bevel Padlock |
| **ShopSettings.tsx** | 푸시 알림 설정 | Lucide Bell | `EngravedBellIcon` | Graphite Micro-Bevel Bell |
| **ShopMyPage.tsx** | 사용자 프로필 아바타 대체 | 기본 이모지 | `EngravedProfileCrest` | Aristocratic Engraved Bust Silhouette |
| **ShopMyPage.tsx** | 멤버십 등급 배지 | Lucide Star | `EngravedSparkleTier` | Four-Point Champagne Facet Star |
| **ShopAdmin.tsx** | 대시보드 위탁/파트너십 관리 | FontAwesome fa-handshake | `EngravedAdminHandshake` | Dark Gunmetal Engraving |
| **ShopAdmin.tsx** | 대시보드 신규 상품 등록 | FontAwesome fa-plus | `EngravedAdminPlus` | Dark Gunmetal Engraving |
| **ShopAdmin.tsx** | 대시보드 1:1 고객 문의 | FontAwesome fa-comments | `EngravedAdminChat` | Dark Gunmetal Engraving |
| **ShopAdmin.tsx** | 대시보드 회원/직원 관리 | FontAwesome fa-users | `EngravedAdminUsers` | Dark Gunmetal Engraving |
| **ShopAdmin.tsx** | 대시보드 엑셀 내보내기 | FontAwesome fa-file-excel | `EngravedAdminExcel` | Dark Gunmetal Engraving |
| **ShopAdmin.tsx** | 대시보드 목록 새로고침 | FontAwesome fa-arrows-rotate | `EngravedAdminRefresh` | Dark Gunmetal Engraving |

---

## 2. 하단 내비게이션 비변경 확인 (IMMUTABLE CONFIRMATION)

- `ShopMain.tsx` 880-935 라인에 위치한 플로팅 하단 바:
  - 카테고리 (`<List>`)
  - 내 상품 판매 (`<ShoppingBagIcon>`)
  - 홈 (`<Home>`)
  - 좋아요 (`<Heart>`)
  - 마이페이지 (`<User>`)
- 해당 5개 아이콘 및 관련 DOM/CSS는 **0% 변경(완전 보존)**되었으며, 신규 메탈 각인형 디자인 시스템은 완전히 격리된 별도의 컴포넌트와 클래스(`.luxury-engraved-icon`)를 통해 동작합니다.

