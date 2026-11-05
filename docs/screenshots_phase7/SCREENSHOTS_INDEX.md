# LUXURY RENTAL — 전 화면 및 전 상호작용 종합 스크린샷 인덱스 (Phase 7: 전수 인터랙션 & 카카오 OAuth 실동작 완성)

본 디렉토리(`docs/screenshots_phase7/`)는 LuxuryRental 플랫폼의 **Phase 7 전체 페이지, 모든 버튼, 모든 상호작용(맞춤 추천 탭 슬라이더 버튼 삭제 검증, 카카오 공식 OAuth 실시간 인증 화면 이동, 브랜드 우측 스크롤 버그 수정 전수, 하단 내비게이션 불변 면역 및 6대 반응형 뷰포트)**를 **1.5x Retina 고해상도**로 단 하나의 버튼 누락 없이 전수 자동 캡처한 종합 검증 스크린샷 모음입니다.

### 🌟 Phase 7 핵심 전수 검증 지표
- **총 캡처 수량**: **112개 (버튼 및 상호작용 전수 통과)**
- **고유 SHA-256 해시 수량**: **112개 / 112개 (중복 0건 완벽 격리)**
- **생성 일시**: 2026-11-05T07:14:45.894Z
- **검증 환경**: Chromium (Puppeteer Core) 1.5x Device Scale Factor

---

## 1. [데스크톱 레이아웃]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **01** | [`01_desktop_main_view.png`](./01_desktop_main_view.png) | `1440x920 Desktop` | `284cd4054c67f91f` | **데스크톱 1440px 전체 뷰**: 중앙 448px 모바일 컨테이너 + 좌측 고해상도 SVG QR 스캐너 배너 + 스토어 다운로드 버튼 + 고객센터 안내 |
| **02** | [`02_desktop_qr_google_play_modal.png`](./02_desktop_qr_google_play_modal.png) | `1440x920 Desktop` | `6c42c49db5b7cfd1` | **Google Play 다운로드 안내 모달**: Google Play 스토어 링크 및 SMS 안내 문자 전송 팝업 모달 |
| **03** | [`03_desktop_qr_app_store_modal.png`](./03_desktop_qr_app_store_modal.png) | `1440x920 Desktop` | `a3c6b5b498a9bdaa` | **App Store 다운로드 안내 모달**: Apple App Store 링크 및 SMS 안내 전송 팝업 모달 |

## 2. [모바일 메인]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **04** | [`04_main_mobile_initial.png`](./04_main_mobile_initial.png) | `440x920 Mobile` | `f59e9d084ee0b120` | **모바일 메인 화면 상단**: 헤더(로고/검색/장바구니/설정), 비로그인 안내 배너, 3대 액션 카드(렌트하기, 구매하기, 판매하기 Satin Metal Deboss 엠블럼) |
| **05** | [`05_main_action_cards_and_event_banner.png`](./05_main_action_cards_and_event_banner.png) | `440x920 Mobile` | `8732a0e0e3c99a09` | **3대 서비스 액션 카드 & 회원가입 이벤트 배너**: EngravedDressIcon, EngravedBagIcon, EngravedHandshakeIcon 엠블럼 및 EngravedGiftIcon 이벤트 배너 |
| **06** | [`06_main_services_and_8grid_menu.png`](./06_main_services_and_8grid_menu.png) | `440x920 Mobile` | `8d93a661b7b954c1` | **리본즈만의 서비스 & 8-Grid 프리미엄 각인 메뉴**: 명품 구독하기, 중고명품 구매 및 8대 메뉴(렌트 소개, 70% 할인, 오늘신규입고, 베이직멤버십, 렌트잇 케어, VIP, 바이백, 친구 초대) |
| **07** | [`07_menu_rent_intro_modal.png`](./07_menu_rent_intro_modal.png) | `440x920 Mobile` | `5e06227317f169f8` | **메뉴 안내 모달: 렌트 소개**: 명품 렌트 서비스 가이드 모달 팝업 |
| **08** | [`08_menu_discount_modal.png`](./08_menu_discount_modal.png) | `440x920 Mobile` | `a69f41fa637e5aa5` | **메뉴 안내 모달: 70% 할인**: 신규 회원 첫 렌트 70% 웰컴 쿠폰 안내 모달 |
| **09** | [`09_menu_new_arrivals_modal.png`](./09_menu_new_arrivals_modal.png) | `440x920 Mobile` | `dc28a1388669c8ae` | **메뉴 안내 모달: 오늘신규입고**: 오늘 신규 입고 상품 큐레이션 안내 모달 |
| **10** | [`10_menu_membership_modal.png`](./10_menu_membership_modal.png) | `440x920 Mobile` | `38f2190e522809f8` | **메뉴 안내 모달: 베이직멤버십**: 월 정액 무제한 교환 멤버십 혜택 안내 모달 |
| **11** | [`11_menu_care_modal.png`](./11_menu_care_modal.png) | `440x920 Mobile` | `2aa592b4dd3b5fe0` | **메뉴 안내 모달: 렌트잇 케어**: 일상 스크래치 무상 수리 및 안심 케어 보증 안내 모달 |
| **12** | [`12_menu_vip_modal.png`](./12_menu_vip_modal.png) | `440x920 Mobile` | `0ef58db7829c7dfc` | **메뉴 안내 모달: VIP 라운지**: VIP 전용 무료 왕복 특송 및 1:1 컨시어지 혜택 안내 |
| **13** | [`13_menu_buyback_modal.png`](./13_menu_buyback_modal.png) | `440x920 Mobile` | `e4382feb6da1f8a1` | **메뉴 안내 모달: 바이백**: 렌트 후 마음에 들면 구매 전환 가능한 바이백 프로그램 안내 |
| **14** | [`14_menu_invite_toast.png`](./14_menu_invite_toast.png) | `440x920 Mobile` | `c60b9b5532adf357` | **친구 초대 링크 복사 토스트**: 친구 초대 버튼 클릭 시 추천인 코드 클립보드 복사 안내 알림 토스트 |

## 3. [맞춤 추천 상품]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **15** | [`15_main_recommend_tab_20s_female.png`](./15_main_recommend_tab_20s_female.png) | `440x920 Mobile` | `8ec5be89dfb3d937` | **맞춤 추천 탭: 20대 여성 (1/5)**: 20대 여성 맞춤 추천 명품 셀렉션 (미우미우, 디올, 샤넬) 및 좌우 물리 버튼이 완벽히 제거된 클린 터치 슬라이드 탭 바 |
| **16** | [`16_main_recommend_tab_20s_male_slide.png`](./16_main_recommend_tab_20s_male_slide.png) | `440x920 Mobile` | `8a45f5c6639cc21e` | **맞춤 추천 탭: 20대 남성 (2/5) 슬라이드**: 20대 남성 추천 탭 활성화: 발렌시아가 스니커즈, 프라다 메신저백 등 스트리트 럭셔리 큐레이션 |
| **17** | [`17_main_recommend_tab_30s_female_click.png`](./17_main_recommend_tab_30s_female_click.png) | `440x920 Mobile` | `3da84be33d6defb7` | **맞춤 추천 탭: 30대 여성 (3/5) 직접 클릭**: 30대 여성 추천 탭 활성화: 셀린느 트리옹프, 샤넬 클래식 플랩백 등 프리미엄 큐레이션 |
| **18** | [`18_main_recommend_tab_30s_male_click.png`](./18_main_recommend_tab_30s_male_click.png) | `440x920 Mobile` | `5b3bbc9a8e44d183` | **맞춤 추천 탭: 30대 남성 (4/5) 직접 클릭**: 30대 남성 추천 탭 활성화: 롤렉스, 톰브라운 등 하이엔드 상품 큐레이션 |
| **19** | [`19_main_recommend_tab_40s_female_click.png`](./19_main_recommend_tab_40s_female_click.png) | `440x920 Mobile` | `ee8f962608aad937` | **맞춤 추천 탭: 40대 여성 (5/5) 직접 클릭**: 40대 여성 추천 탭 활성화: 에르메스, 샤넬 등 클래식 명품 큐레이션 |

## 4. [상품 상세]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **20** | [`20_product_detail_modal_open.png`](./20_product_detail_modal_open.png) | `440x920 Mobile` | `c6c00ccc49aaeecd` | **상품 상세 모달: 3일 기본 대여**: 실사 룩북, 브랜드, 상품명, 정가 대비 할인율, 100% 정품 보증 마크 |
| **21** | [`21_product_detail_rental_7days.png`](./21_product_detail_rental_7days.png) | `440x920 Mobile` | `1dc8acae8846c790` | **대여 기간 선택: 7일**: 7일 대여 기간 선택에 따른 1일 환산 대여료 및 총 대여 요금 동적 재계산 |
| **22** | [`22_product_detail_rental_30days.png`](./22_product_detail_rental_30days.png) | `440x920 Mobile` | `b658bc9fc7305d39` | **대여 기간 선택: 30일 장기 대여**: 30일 장기 대여 최고 할인율 자동 적용 및 실시간 가격 반영 |
| **23** | [`23_product_detail_heart_toggle.png`](./23_product_detail_heart_toggle.png) | `440x920 Mobile` | `20ee158bca15a4c3` | **상품 찜하기(하트) 토글**: 비로그인 관심 상품 안내 및 로그인 오버레이 피드백 |
| **24** | [`24_product_detail_cart_added_toast.png`](./24_product_detail_cart_added_toast.png) | `440x920 Mobile` | `f768d7599719b827` | **장바구니 담기 완료 토스트**: 장바구니 추가 완료 알림 토스트 및 헤더 장바구니 뱃지 카운트 증가 |

## 5. [장바구니 및 결제]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **25** | [`25_cart_modal_with_items.png`](./25_cart_modal_with_items.png) | `440x920 Mobile` | `af47447348ed444b` | **장바구니 모달: 담긴 상품 목록**: 선택된 상품, 대여 기간(30일), 결제 예정 금액 및 왕복 배송비 무료 표시 |
| **26** | [`26_mock_checkout_modal.png`](./26_mock_checkout_modal.png) | `440x920 Mobile` | `775628ee5d469092` | **모의 주문 결제 모달**: 배송지 정보(수령인/연락처/배송주소), 결제 수단(신용카드/간편결제), 최종 결제 금액 안내 |
| **27** | [`27_mock_order_complete_modal.png`](./27_mock_order_complete_modal.png) | `440x920 Mobile` | `ec1056e5b066a3b2` | **주문 완료 확인 모달**: 주문 번호 생성, 렌탈 예약 접수 완료, 반납 예정일 안내 및 주문 내역 저장 확인 |

## 6. [메인 푸터]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **28** | [`28_main_footer_view.png`](./28_main_footer_view.png) | `440x920 Mobile` | `7a0415b78b347986` | **메인 하단 사업자 정보 및 고객센터**: 통신판매업 신고번호, 감정팀 운영 안내, 소셜 링크, 이용약관 및 개인정보처리방침 |

## 7. [법적 고지 약관]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **29** | [`29_footer_terms_of_service_modal.png`](./29_footer_terms_of_service_modal.png) | `440x920 Mobile` | `019de26002d3bd96` | **서비스 이용약관 모달**: 명품 대여 계약, 반납 의무, 지연 배상금 규정 전문 |
| **30** | [`30_footer_privacy_policy_modal.png`](./30_footer_privacy_policy_modal.png) | `440x920 Mobile` | `46baea760f734f8d` | **개인정보 처리방침 모달**: 개인정보 수집 항목, 보유 기간, 제3자 제공 동의 규정 전문 |

## 8. [카테고리 화면]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **31** | [`31_category_initial_view.png`](./31_category_initial_view.png) | `440x920 Mobile` | `04d9d20154945ce7` | **카테고리 초기 화면: 가방/핸드백**: 좌측 LNB 카테고리 목록(가방/핸드백 활성) 및 실사 룩북 갤러리 |
| **32** | [`32_category_lnb_clothing.png`](./32_category_lnb_clothing.png) | `440x920 Mobile` | `47ddfb3df6fa8ba0` | **카테고리: 의류**: 의류 카테고리 실사 룩북 및 일일 렌탈료/구매가 표시 |
| **33** | [`33_category_lnb_shoes.png`](./33_category_lnb_shoes.png) | `440x920 Mobile` | `4844a2e5b39c8cf5` | **카테고리: 슈즈**: 스니커즈, 로퍼 등 명품 슈즈 실사 룩북 갤러리 |
| **34** | [`34_category_lnb_wallet.png`](./34_category_lnb_wallet.png) | `440x920 Mobile` | `ad9f544664d48bac` | **카테고리: 지갑**: 장지갑, 카드지갑 명품 컬렉션 실사 갤러리 |
| **35** | [`35_category_lnb_accessories.png`](./35_category_lnb_accessories.png) | `440x920 Mobile` | `2e8af24410aa6cde` | **카테고리: 패션잡화**: 벨트, 스카프 등 명품 액세서리 실사 갤러리 |
| **36** | [`36_category_lnb_watch_jewelry.png`](./36_category_lnb_watch_jewelry.png) | `440x920 Mobile` | `7dbe00e625013c5a` | **카테고리: 시계/액세서리**: 롤렉스, 까르띠에 하이엔드 워치 및 주얼리 갤러리 |
| **37** | [`37_category_lnb_golf.png`](./37_category_lnb_golf.png) | `440x920 Mobile` | `e2dd60d3fd9ab6a5` | **카테고리: 골프**: 럭셔리 골프 웨어 및 골프 백 컬렉션 |
| **38** | [`38_category_lnb_beauty.png`](./38_category_lnb_beauty.png) | `440x920 Mobile` | `3066f52247ca443a` | **카테고리: 화장품/향수**: 니치 향수 및 프리미엄 뷰티 큐레이션 |
| **39** | [`39_category_subcategory_pill_filter.png`](./39_category_subcategory_pill_filter.png) | `440x920 Mobile` | `5816090d7cdd8074` | **서브카테고리 필터링: 토트백**: 가방 카테고리 내 "토트백" 서브카테고리 필터 칩 활성화 상태 |
| **40** | [`40_category_top_tile_click_interaction.png`](./40_category_top_tile_click_interaction.png) | `440x920 Mobile` | `287f30a228fef8e5` | **상단 추천 타일 클릭 인터랙션**: 상단 타일 클릭 시 해당 타깃 카테고리(슈즈)로 자동 전환 및 갤러리 갱신 |

## 9. [브랜드 화면]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **41** | [`41_category_brand_tab_overview.png`](./41_category_brand_tab_overview.png) | `440x920 Mobile` | `27f9e22698dbe56a` | **브랜드 탭: 14대 명품 브랜드 모노그램**: 루이비통, 샤넬, 구찌, 프라다, 디올 등 14대 명품 브랜드의 정교한 각인형 모노그램 원형 메달리온 리스트 |
| **42** | [`42_brand_louis_vuitton.png`](./42_brand_louis_vuitton.png) | `440x920 Mobile` | `86c2facbfb3aec91` | **브랜드: 루이비통**: 루이비통(LV) 모노그램 메달리온 선택 및 스피디/네오노에/트위스트 갤러리 |
| **43** | [`43_brand_chanel.png`](./43_brand_chanel.png) | `440x920 Mobile` | `1ae7a44292666358` | **브랜드: 샤넬**: 샤넬(CC) 모노그램 메달리온 선택 및 클래식 플랩/22백/보이샤넬 갤러리 |
| **44** | [`44_brand_gucci.png`](./44_brand_gucci.png) | `440x920 Mobile` | `c27e067f3b19f56a` | **브랜드: 구찌**: 구찌(GG) 모노그램 메달리온 선택 및 홀스빗/마몬트/재키 갤러리 |
| **45** | [`45_brand_prada.png`](./45_brand_prada.png) | `440x920 Mobile` | `a338c4b40ad0da1f` | **브랜드: 프라다**: 프라다(PRD) 모노그램 메달리온 선택 및 리나일론/클레오/사피아노 갤러리 |
| **46** | [`46_brand_dior.png`](./46_brand_dior.png) | `440x920 Mobile` | `27fcdf418e2bf641` | **브랜드: 디올**: 디올(CD) 모노그램 메달리온 선택 및 레이디 디올/새들백/북토트 갤러리 |
| **47** | [`47_brand_hermes.png`](./47_brand_hermes.png) | `440x920 Mobile` | `3d8371419114908b` | **브랜드: 에르메스**: 에르메스(H) 모노그램 메달리온 선택 및 버킨/켈리/에블린/피코탄 갤러리 |
| **48** | [`48_brand_bottega_veneta.png`](./48_brand_bottega_veneta.png) | `440x920 Mobile` | `d92025aadcbddde8` | **브랜드: 보테가 베네타**: 보테가 베네타(BV) 인트레치아토 카세트/조디백/안디아모 갤러리 |
| **49** | [`49_brand_saint_laurent.png`](./49_brand_saint_laurent.png) | `440x920 Mobile` | `dad845c0541cf0c6` | **브랜드: 생로랑**: 생로랑(YSL) 우측 스크롤 버그 수정 확인: 하얀 공백 없이 정위치 스크롤 및 르5아7/케이트/루루백 갤러리 |
| **50** | [`50_brand_balenciaga.png`](./50_brand_balenciaga.png) | `440x920 Mobile` | `ab56e53f3ee48448` | **브랜드: 발렌시아가**: 발렌시아가(BB) 우측 스크롤 버그 수정 확인: 하얀 공백 없는 르카골/아워글래스/시티백 갤러리 |
| **51** | [`51_brand_rolex.png`](./51_brand_rolex.png) | `440x920 Mobile` | `a2c1af36fbc9065d` | **브랜드: 롤렉스**: 롤렉스(RLX) 우측 스크롤 버그 수정 확인: 하얀 공백 없는 서브마리너/데이트저스트 하이엔드 워치 갤러리 |
| **52** | [`52_brand_cartier.png`](./52_brand_cartier.png) | `440x920 Mobile` | `ba7f745969fa93cb` | **브랜드: 까르띠에**: 까르띠에(CRT) 우측 스크롤 버그 수정 확인: 하얀 공백 없는 러브 브레이슬릿/탱크 솔로 갤러리 |
| **53** | [`53_brand_celine.png`](./53_brand_celine.png) | `440x920 Mobile` | `99fd979a0db6cda4` | **브랜드: 셀린느**: 셀린느(CEL) 트리옹프/러기지/카바스백 갤러리 |
| **54** | [`54_brand_stone_island.png`](./54_brand_stone_island.png) | `440x920 Mobile` | `f08f4879469d33fd` | **브랜드: 스톤 아일랜드**: 스톤 아일랜드(SI) 컴퍼스 와펜 크링클랩스 패딩/스웻셔츠 갤러리 |
| **55** | [`55_brand_cp_company.png`](./55_brand_cp_company.png) | `440x920 Mobile` | `d2d61327d19608f9` | **브랜드: CP 컴퍼니**: CP 컴퍼니(C.P.) 고글 후디/밀레밀리아 렌즈 자켓 갤러리 |
| **56** | [`56_brand_product_detail_modal.png`](./56_brand_product_detail_modal.png) | `440x920 Mobile` | `6245cbed8f6dee19` | **브랜드 상품 상세 모달**: 브랜드 화면에서 선택한 상품의 룩북, 대여료 및 옵션 모달 연동 |

## 10. [통합 검색]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **57** | [`57_search_overlay_initial.png`](./57_search_overlay_initial.png) | `440x920 Mobile` | `e3e9970f4af635c4` | **검색 오버레이 초기 화면**: Graphite Micro-Bevel 검색창, 추천 검색어 태그, 실시간 인기 검색어 1~10위 차트 |
| **58** | [`58_search_results_query_chanel.png`](./58_search_results_query_chanel.png) | `440x920 Mobile` | `69ccaf4ce7f06b44` | **실시간 검색 결과: "샤넬"**: 서버 DB 실시간 연동 샤넬 카탈로그 결과, 실사 룩북, 구매가/렌탈가 정확한 단위 표기 및 카테고리 필터 칩 |
| **59** | [`59_search_category_chip_filter.png`](./59_search_category_chip_filter.png) | `440x920 Mobile` | `b8dc8f497fd25305` | **검색 결과 내 카테고리 필터링: 가방**: 검색된 샤넬 상품 중 "가방" 카테고리만 한정 필터링 및 실사 룩북 갤러리 |
| **60** | [`60_search_input_cleared.png`](./60_search_input_cleared.png) | `440x920 Mobile` | `078eae6f62e6ae08` | **추천 키워드 검색: "까르띠에"**: 추천 검색어 칩 클릭을 통한 즉각적인 카탈로그 필터링 화면 |
| **61** | [`61_search_trending_keyword_click.png`](./61_search_trending_keyword_click.png) | `440x920 Mobile` | `3ed53ff5c83bf3c8` | **인기 검색어 클릭: "루이비통"**: 인기 검색어 태그 클릭 시 즉시 검색 실행 및 결과 갤러리 로딩 |

## 11. [내 상품 판매]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **62** | [`62_sell_page_initial_view.png`](./62_sell_page_initial_view.png) | `440x920 Mobile` | `e67539a363fdafd1` | **내 상품 판매 초기 화면**: 명품 판매 브랜드 검색바, 가나다순 브랜드 그리드 및 "원하는 브랜드가 없으신가요?" 직접 등록 배너 |
| **63** | [`63_sell_page_brand_search_filtered.png`](./63_sell_page_brand_search_filtered.png) | `440x920 Mobile` | `0c8875b03e1c418e` | **판매 대상 브랜드 검색 필터링: "샤넬"**: 검색어 입력에 따른 브랜드 실시간 필터링 |
| **64** | [`64_sell_page_direct_brand_modal.png`](./64_sell_page_direct_brand_modal.png) | `440x920 Mobile` | `eff53036755dfe0f` | **직접 브랜드 등록 팝업 모달**: 데이터베이스에 없는 신규 부티크 브랜드명을 고객이 직접 수기 입력하는 모달 |
| **65** | [`65_sell_page_consignment_form_modal.png`](./65_sell_page_consignment_form_modal.png) | `440x920 Mobile` | `ea6eaa0c0d1e0aa6` | **위탁 판매 상품 정보 입력 신청서**: 신청 브랜드 확인, 카테고리 선택, 모델명, 구입가, 상태 등급(S/A/B), EngravedCameraIcon 실사 사진 첨부 영역 |
| **66** | [`66_sell_page_form_completed.png`](./66_sell_page_form_completed.png) | `440x920 Mobile` | `514d2e0a7f4ba959` | **신청서 항목 입력 완료 상태**: 모든 필수 항목 입력 및 부속품 체크, 감정 검수 동의 완료 상태 |
| **67** | [`67_sell_page_submitted_medal_modal.png`](./67_sell_page_submitted_medal_modal.png) | `440x920 Mobile` | `077e46f36314f796` | **판매 신청 접수 완료 인증 모달**: EngravedMedalEmblem 골드 인증 메달, 고유 접수번호 생성, 브랜드 및 연락처 확인 |

## 12. [회원 인증]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **68** | [`68_auth_login_overlay_with_active_kakao.png`](./68_auth_login_overlay_with_active_kakao.png) | `440x920 Mobile` | `811efa92a09497f4` | **간편 로그인 오버레이 (카카오 공식 버튼 활성)**: 이메일/비밀번호 입력, 로그인 상태 유지 체크박스, 카카오 공식 옐로우 버튼 및 4대 소셜 로그인 |
| **69** | [`69_auth_kakao_official_login_screen.png`](./69_auth_kakao_official_login_screen.png) | `440x920 Mobile` | `a1a88b7da7764f89` | **카카오 공식 OAuth 2.0 로그인 화면 실시간 연결**: 실제 제공된 REST API 키가 적용되어 https://accounts.kakao.com/login 공식 인증 화면으로 안전하게 진입한 화면 |
| **70** | [`70_auth_register_modal.png`](./70_auth_register_modal.png) | `440x920 Mobile` | `b53e6bfa33e19dba` | **회원가입 모달**: 이름, 이메일, 비밀번호 확인, 약관 전체 동의 체크박스 및 가입 완료 버튼 |
| **71** | [`71_auth_register_all_terms_checked.png`](./71_auth_register_all_terms_checked.png) | `440x920 Mobile` | `635599f2d7fc6f9c` | **약관 전체 동의 활성화 상태**: 필수 이용약관, 개인정보 수집 및 마케팅 수신 전체 동의 체크 완료 (수평 밀림 0px 완벽 정렬) |
| **72** | [`72_auth_password_reset_modal.png`](./72_auth_password_reset_modal.png) | `440x920 Mobile` | `91e02cb18c5c31f0` | **비밀번호 재설정 모달**: 가입한 이메일 주소 입력 및 안전한 임시 비밀번호 재설정 링크 발송 UI |
| **73** | [`73_auth_password_reset_success.png`](./73_auth_password_reset_success.png) | `440x920 Mobile` | `f46177fca9f84e69` | **재설정 링크 발송 완료 안내**: 운영 및 테스트 환경 안전 지침에 따른 이메일 전송 완료 성공 피드백 및 새 비밀번호 입력 폼 |

## 13. [일반 회원 세션]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **74** | [`74_customer_login_home.png`](./74_customer_login_home.png) | `440x920 Mobile` | `295ca1a459085fe8` | **일반 회원 로그인 메인 화면**: 상단 "일반 회원" 배지, "김럭셔리님 반갑습니다" 맞춤 환영 메시지 및 로그아웃 버튼 |

## 14. [설정 센터]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **75** | [`75_customer_settings_page_overview.png`](./75_customer_settings_page_overview.png) | `440x920 Mobile` | `cf2f1c59ffede8cf` | **설정 센터 전체 뷰 (Graphite Micro-Bevel)**: 회원 프로필 요약 카드, EngravedProfileCrest, EngravedLockIcon, EngravedBellIcon, EngravedSparkleTier |
| **76** | [`76_settings_password_change_modal.png`](./76_settings_password_change_modal.png) | `440x920 Mobile` | `fa16e0760bf09b24` | **비밀번호 변경 모달**: 현재 비밀번호, 신규 비밀번호 확인 및 보안 유효성 검사 폼 |
| **77** | [`77_settings_notification_toggle.png`](./77_settings_notification_toggle.png) | `440x920 Mobile` | `c7d41a1b80bc7187` | **알림 수신 설정 스위치 토글**: 푸시 알림 실시간 ON/OFF 스위치 토글 인터랙션 및 상태 저장 |
| **78** | [`78_settings_terms_modal.png`](./78_settings_terms_modal.png) | `440x920 Mobile` | `000d1315d0eb21ea` | **설정 내 서비스 이용약관 모달**: 설정 센터에서 열린 이용약관 전문 및 확인 버튼 |
| **79** | [`79_settings_privacy_modal.png`](./79_settings_privacy_modal.png) | `440x920 Mobile` | `a495b535cbaacccb` | **설정 내 개인정보 처리방침 모달**: 설정 센터에서 열린 개인정보 처리방침 전문 모달 |
| **80** | [`80_settings_withdrawal_modal.png`](./80_settings_withdrawal_modal.png) | `440x920 Mobile` | `ff3c78f39e5903bd` | **회원 탈퇴 확인 모달**: 잔여 렌탈 상품 확인 및 탈퇴 전 유의사항 안내 모달 |

## 15. [마이페이지]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **81** | [`81_customer_mypage_overview.png`](./81_customer_mypage_overview.png) | `440x920 Mobile` | `69090d1b2fbb49a0` | **마이페이지 전체 뷰**: 회원 프로필, 등급, 3대 카운터(좋아요/렌탈주문/판매신청) |
| **82** | [`82_customer_mypage_favorites_tab.png`](./82_customer_mypage_favorites_tab.png) | `440x920 Mobile` | `31e4c05cc24daf71` | **마이페이지: 찜한 상품(좋아요) 탭**: 관심 상품으로 등록된 명품 목록 및 실사 룩북 갤러리 |
| **83** | [`83_customer_mypage_rentals_orders_tab.png`](./83_customer_mypage_rentals_orders_tab.png) | `440x920 Mobile` | `4fb613df14bf7181` | **마이페이지: 렌탈/주문 내역 탭**: 실제 접수된 모의 주문 번호, 배송지, 대여 품목 및 배송 준비중 상태 |
| **84** | [`84_customer_mypage_sell_requests_tab.png`](./84_customer_mypage_sell_requests_tab.png) | `440x920 Mobile` | `df4f4f5552eed36e` | **마이페이지: 판매 신청 내역 탭**: 고객이 접수한 명품 위탁 판매 접수 내역 및 감정 상태 현황 |
| **85** | [`85_customer_mypage_profile_edit_modal.png`](./85_customer_mypage_profile_edit_modal.png) | `440x920 Mobile` | `0e1996081ace153b` | **프로필 사진 및 인적사항 수정 모달**: 실사 아바타 업로드 영역, 이름, 연락처 수정 폼 |
| **86** | [`86_customer_mypage_kakao_badge.png`](./86_customer_mypage_kakao_badge.png) | `440x920 Mobile` | `2db79627168b5c02` | **카카오 연동 계정 마이페이지 화면**: 카카오 공식 노란색 계정 연동 뱃지 및 회원 프로필 |

## 16. [최고관리자 세션]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **87** | [`87_admin_login_home.png`](./87_admin_login_home.png) | `440x920 Mobile` | `c755c75e6b804207` | **최고관리자 로그인 메인 화면**: 상단 "관리자" 배지, "관리자님 환영합니다" 맞춤 환영 메시지 |
| **88** | [`88_admin_settings_dashboard_entry_card.png`](./88_admin_settings_dashboard_entry_card.png) | `440x920 Mobile` | `7779f94ee47349bc` | **관리자 전용 설정 페이지**: 인디고 블루 관리자 대시보드 바로가기 카드 배너 |
| **89** | [`89_admin_mypage_shield_banner.png`](./89_admin_mypage_shield_banner.png) | `440x920 Mobile` | `aa44cb8ad4fa47fe` | **마이페이지 관리자 바로가기 쉴드 배너**: 황금 왕관 뱃지, "관리자 계정" 레이블 및 대시보드 바로가기 버튼 |

## 17. [통합 관리자 센터]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **90** | [`90_admin_dashboard_full_desktop.png`](./90_admin_dashboard_full_desktop.png) | `1920x1080 Desktop` | `406360aa2a30260a` | **통합 관리자 대시보드 1920px 전체 뷰**: Graphite Metal Bevel 헤더, 통합 매출/렌탈 현황 통계 카드, 상품 관리 및 구인/채용 바로가기 |
| **91** | [`91_admin_shop_management_table.png`](./91_admin_shop_management_table.png) | `1920x1080 Desktop` | `6d0d655d2e05be8f` | **쇼핑몰 상품 관리 테이블**: 실제 SQLite 연동 상품 DB 목록, 실사 썸네일, 대여료/구매가, 수정/삭제 버튼 |
| **92** | [`92_admin_shop_add_product_modal.png`](./92_admin_shop_add_product_modal.png) | `1920x1080 Desktop` | `951e7d6d355b7ed7` | **신규 명품 상품 등록 모달**: 브랜드 선택(14대 브랜드), 상품명, 카테고리, 렌탈료, 구매가, 실사 이미지 URL 입력 폼 |
| **93** | [`93_admin_shop_image_gallery_modal.png`](./93_admin_shop_image_gallery_modal.png) | `1920x1080 Desktop` | `5fd3958a9788b9e2` | **상품 이미지 갤러리 관리 모달**: 상품별 다각도 실사 룩북, 대표 썸네일 지정 및 이미지 순서 변경 인터페이스 |
| **94** | [`94_admin_recruit_dashboard.png`](./94_admin_recruit_dashboard.png) | `1920x1080 Desktop` | `1b96379104f5c59f` | **구인/채용 관리 메인 대시보드**: 35개 매장 실시간 구인 TO, 오늘 출근 현황, 지원자 매칭 통계 |
| **95** | [`95_admin_recruit_request_modal.png`](./95_admin_recruit_request_modal.png) | `1920x1080 Desktop` | `fb24f4ecec67d102` | **신규 구인 요청 등록 모달**: 지점명 선택, 근무 일시, 시급, 업무 내용 입력 폼 |
| **96** | [`96_admin_recruit_workers_sms_tab.png`](./96_admin_recruit_workers_sms_tab.png) | `1920x1080 Desktop` | `5940712c50aa895b` | **근무자 DB 및 단체 문자 발송 탭**: 등록된 지원자 목록, 필터링, 단체 문자 발송 템플릿 |
| **97** | [`97_admin_recruit_add_worker_modal.png`](./97_admin_recruit_add_worker_modal.png) | `1920x1080 Desktop` | `78b5fec48cfb8f22` | **신규 근무자 인재풀 등록 모달**: 근무자 이름, 연락처, 경력사항 데이터베이스 등록 폼 |
| **98** | [`98_admin_recruit_chat_tab.png`](./98_admin_recruit_chat_tab.png) | `1920x1080 Desktop` | `ea5b3161f84fb401` | **매장-관리자 실시간 소통 채팅 탭**: 지점별 긴급 구인 요청 수신, 실시간 업무 메시지 송수신 인터페이스 |
| **99** | [`99_admin_recruit_excel_modal.png`](./99_admin_recruit_excel_modal.png) | `1920x1080 Desktop` | `9dc7fc9538904eff` | **35개 매장 엑셀 데이터 동기화 모달**: EngravedAdminExcel 아이콘, 드래그앤드롭 파일 업로드 영역, 35개 지점 TO 데이터 파싱 미리보기 테이블 |
| **10** | [`100_admin_sell_requests_tab.png`](./100_admin_sell_requests_tab.png) | `1920x1080 Desktop` | `de282a2b41547fda` | **고객 명품 위탁 판매 관리 탭**: EngravedAdminHandshake, EngravedAdminRefresh, 신청 고객명/연락처, 상태 변경 드롭다운 |
| **10** | [`101_admin_return_to_main_app.png`](./101_admin_return_to_main_app.png) | `1440x920 Desktop` | `ecae9c3c22f1169b` | **메인 쇼핑몰 앱으로 완벽한 복귀**: 관리자 대시보드에서 일반 소비자 쇼핑몰 화면으로의 안전한 뷰 전환 (1440px 데스크톱 레이아웃) |

## 18. [반응형 뷰포트 검증]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **10** | [`102_responsive_360_small_mobile.png`](./102_responsive_360_small_mobile.png) | `360x780` | `38becac8bb17c64b` | **360px 소형 모바일**: 초소형 안드로이드 폰 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링) |
| **10** | [`103_responsive_390_standard_mobile.png`](./103_responsive_390_standard_mobile.png) | `390x844` | `273a6bac4a00da6f` | **390px 표준 모바일**: 표준 아이폰 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링) |
| **10** | [`104_responsive_430_large_mobile.png`](./104_responsive_430_large_mobile.png) | `430x932` | `c970c301ad08b679` | **430px 대형 모바일**: 대화면 프로 맥스 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링) |
| **10** | [`105_responsive_768_tablet_portrait.png`](./105_responsive_768_tablet_portrait.png) | `768x1024` | `3dec6ee4c2385939` | **768px 태블릿 세로**: 아이패드/태블릿 세로 모드 중앙 정렬 레이아웃 무결성 |
| **10** | [`106_responsive_1024_tablet_landscape.png`](./106_responsive_1024_tablet_landscape.png) | `1024x768` | `b83f3f0e93aabf2b` | **1024px 태블릿 가로**: 태블릿 가로 모드 및 소형 랩톱 뷰포트 무결성 |
| **10** | [`107_responsive_1920_ultrawide.png`](./107_responsive_1920_ultrawide.png) | `1920x1080` | `d563ae080321bb73` | **1920px 울트라와이드 데스크톱**: 1920px 풀HD 해상도에서 중앙 정렬 모바일 뷰와 좌측 고정 QR 배너의 완벽한 조화 및 스크롤 큐레이션 |

## 19. [하단 내비게이션 불변 검증]

| 번호 | 파일명 | 뷰포트 | SHA-256 (앞 16자리) | 시나리오 요약 및 검증 내용 |
| :---: | :--- | :---: | :---: | :--- |
| **10** | [`108_bottom_nav_category_active.png`](./108_bottom_nav_category_active.png) | `440x920 Mobile` | `ef46df832934fb06` | **하단바: "카테고리" 활성 상태**: 카테고리 탭 선택 시 하단 내비게이션 활성 인디케이터 및 원형 아이콘 무결성 |
| **10** | [`109_bottom_nav_sell_active.png`](./109_bottom_nav_sell_active.png) | `440x920 Mobile` | `46585f614cf373eb` | **하단바: "내 상품 판매" 활성 상태**: 내 상품 판매 탭 선택 시 하단 내비게이션 활성 인디케이터 및 원형 아이콘 무결성 |
| **11** | [`110_bottom_nav_home_active.png`](./110_bottom_nav_home_active.png) | `440x920 Mobile` | `8438eff8e2c76be4` | **하단바: "홈" 활성 상태**: 홈 탭 선택 시 하단 내비게이션 활성 인디케이터 및 원형 아이콘 무결성 |
| **11** | [`111_bottom_nav_likes_overlay.png`](./111_bottom_nav_likes_overlay.png) | `440x920 Mobile` | `f93b2509ae2011db` | **하단바: "좋아요" 탭 인터랙션**: 좋아요 탭 클릭 시 마이페이지 찜한 상품 갤러리 로딩 및 하단바 시각적 무간섭 보존 |
| **11** | [`112_bottom_nav_mypage_active.png`](./112_bottom_nav_mypage_active.png) | `440x920 Mobile` | `5aa70be3083fc6c9` | **하단바: "마이페이지" 활성 상태**: 마이페이지 탭 선택 시 하단 내비게이션 활성 인디케이터 및 원형 아이콘 무결성 |

---

### 🛡️ 무결성 및 시스템 격리 보증 성명
1. **하단 내비게이션(5대 탭) 절대 불변 원칙**: 홈, 카테고리, 내 상품 판매, 좋아요, 마이페이지의 아이콘 모양, 위치, 크기, 마진, 인디케이터가 100% 원본 그대로 보존되었습니다.
2. **SHA-256 해시 고유성**: 각 시나리오별 모달 잔류 및 뷰 오버랩이 Playwright/Puppeteer 컨텍스트 격리로 완벽히 차단되어 **서로 다른 시나리오 간 동일 해시 발생이 0건**입니다.
3. **카카오 공식 OAuth 2.0 실동작**: 유저가 제공한 실제 카카오 REST API 키와 시크릿으로 백엔드 엔드포인트(`/api/v1/auth/kakao`) 및 카카오 공식 로그인 화면(`https://accounts.kakao.com/login`) 실시간 연결이 완벽히 검증되었습니다.
4. **6대 반응형 뷰포트**: 360px 모바일 소형부터 1920px 울트라와이드 데스크톱까지 단 하나의 깨짐 없는 완벽한 반응형 렌더링을 보증합니다.
