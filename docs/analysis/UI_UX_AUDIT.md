# LUXURY RENTAL UI/UX 정밀 감사 및 46개 기준선 검수 보고서 (UI_UX_AUDIT)

**작성일**: 2026-11-04  
**버전**: 1.0.0 (Phase 1 기준선 확립)  
**검수 기준**: `docs/screenshots/01_main_desktop_view.png` ~ `46_admin_return_to_app.png` 및 실제 구동 코드

---

## 1. 46개 기준선 스크린샷 매핑 및 상태 감사

| 번호 | 파일명 | 대상 컴포넌트 | 기능 및 화면 상태 | 현재 시각적/기능적 문제점 진단 |
|---|---|---|---|---|
| **01** | `01_main_desktop_view.png` | `ShopMain.tsx` | 데스크톱 1440x950 뷰 (좌측 QR 배너 + 중앙 모바일 컨테이너) | `left-90` 임의 클래스로 인해 해상도에 따라 QR 배너가 컨테이너와 겹치거나 잘림 위험 |
| **02** | `02_main_mobile_view.png` | `ShopMain.tsx` | 모바일 440x920 뷰: 헤더, 로그인 안내, 렌트/구매/판매 카드 | 렌트(👗), 구매(👜), 판매(🤝) 기본 이모지 사용으로 럭셔리 감성 저하 |
| **03** | `03_main_services_and_menu.png` | `ShopMain.tsx` | 스크롤: 서비스 2종 & 8-Grid 바로가기 메뉴 | 8개 메뉴 아이콘(👗, 🏷️, ⏰, 👆, 🤲, 👑, 💼, 💌)이 전부 OS 기본 이모지로 렌더링 |
| **04** | `04_main_guides_and_recommendations.png` | `ShopMain.tsx` | 렌트/구독 가이드 카드 & 맞춤 추천 탭 상단 | 상품 썸네일에 회색 네모 안 `👜` 이모지 임시 배치, 인터랙션 피드백 부족 |
| **05** | `05_main_recommend_tab_20m.png` | `ShopMain.tsx` | 맞춤 추천: '20대 남성' 탭 활성화 | 탭 스타일만 변경되고 아래 4개 추천 상품 목록은 동일하게 고정됨 |
| **06** | `06_main_recommend_tab_30w.png` | `ShopMain.tsx` | 맞춤 추천: '30대 여성' 탭 활성화 | 데이터 변경 없음 (정적 하드코딩) |
| **07** | `07_main_recommend_tab_30m.png` | `ShopMain.tsx` | 맞춤 추천: '30대 남성' 탭 활성화 | 데이터 변경 없음 (정적 하드코딩) |
| **08** | `08_main_recommend_tab_40w.png` | `ShopMain.tsx` | 맞춤 추천: '40대 여성' 탭 활성화 | 데이터 변경 없음 (정적 하드코딩) |
| **09** | `09_main_rent_new_arrivals.png` | `ShopMain.tsx` | 가로 스크롤: 발렌시아가, 크리스찬 디올 | 대형 이모지(🧳, 💍)가 썸네일 대체, 실물 느낌 부재 |
| **10** | `10_main_footer_escrow.png` | `ShopMain.tsx` | 전체보기 버튼, 이용약관, 토스 에스크로 푸터 | 클릭 인터랙션 효과 부재, 텍스트 가독성 명도 대비 개선 여지 |
| **11** | `11_main_floating_bottom_nav.png` | `ShopMain.tsx` | 하단 플로팅 알약 스타일 내비게이션 바 | 활성 탭 인디케이터가 명확하지 않고 모바일 브라우저 Safe Area 대응 미흡 |
| **12** | `12_search_overlay_default.png` | `ShopSearch.tsx` | 검색 오버레이 진입 (추천어 칩, 급상승 1~10위) | 추천 키워드 클릭 시 검색창 반영 안 됨, ESC 키 닫기 미지원 |
| **13** | `13_search_overlay_typing.png` | `ShopSearch.tsx` | 검색창 '샤넬 클래식 플랩백' 타이핑 인터랙션 | React 상태(`value`)로 제어되지 않는 비제어형 input |
| **14** | `14_search_keyword_click.png` | `ShopSearch.tsx` | 추천 검색어 '까르띠에' 클릭 인터랙션 | 클릭 이벤트 미연결, 실제 검색 결과 뷰 부재 |
| **15** | `15_login_overlay_from_cart.png` | `ShopLike.tsx` | 헤더 장바구니 클릭 시 간편 로그인 오버레이 | 소셜 로그인 버튼 호버/클릭 로딩 상태 없음, 모달 포커스 트랩 부재 |
| **16** | `16_login_overlay_from_bottom_heart.png` | `ShopLike.tsx` | 바텀 네비 '좋아요' 클릭 시 간편 로그인 노출 | 동일 로그인 화면 재활용되나, 원래 화면으로의 복귀 컨텍스트 미전달 |
| **17** | `17_login_overlay_from_bottom_mypage.png` | `ShopLike.tsx` | 바텀 네비 '마이럭셔리렌탈' 클릭 시 로그인 노출 | 실제 OAuth 키 부재 상태에서의 데모 인증 플로우 정리 필요 |
| **18** | `18_category_women_bags.png` | `ShopCategory.tsx` | 카테고리 기본: 여성 > 가방/핸드백 | 상단 추천 카드 3종에 👞, 💍, 🧥 이모지 배치, 상품 연동 부재 |
| **19** | `19_category_women_clothing.png` | `ShopCategory.tsx` | 좌측 LNB '의류' 선택 상호작용 | LNB 탭만 하이라이트되고 우측 세부 카테고리는 그대로 가방 서브분류 유지 |
| **20** | `20_category_women_shoes.png` | `ShopCategory.tsx` | 좌측 LNB '슈즈' 선택 상호작용 | LNB 상태와 우측 콘텐츠 간 동기화 부재 |
| **21** | `21_category_women_wallet.png` | `ShopCategory.tsx` | 좌측 LNB '지갑' 선택 상호작용 | LNB 상태와 우측 콘텐츠 간 동기화 부재 |
| **22** | `22_category_women_watch.png` | `ShopCategory.tsx` | 좌측 LNB '시계/액세서리' 선택 상호작용 | LNB 상태와 우측 콘텐츠 간 동기화 부재 |
| **23** | `23_category_subtab_men.png` | `ShopCategory.tsx` | 상단 대상 서브탭 '남성' 클릭 상호작용 | 서브탭만 검정 밑줄로 변경되고 LNB 및 내용 동일 |
| **24** | `24_category_subtab_kids.png` | `ShopCategory.tsx` | 상단 대상 서브탭 '아동' 클릭 상호작용 | 서브탭 상태와 카테고리 데이터 비연동 |
| **25** | `25_category_main_brand_tab.png` | `ShopCategory.tsx` | 메인 탭 '브랜드' 탭 클릭 | 브랜드 아이콘(👜, 👕, 🎒, 👛, 🧥, 🛍️) 전부 이모지, 상품 썸네일도 👜 |
| **26** | `26_category_brand_select_gucci.png` | `ShopCategory.tsx` | 브랜드 칩 '구찌' 선택 인터랙션 | 브랜드명 텍스트만 바뀌고 상품 목록 및 사진은 루이비통/프라다 그대로 유지 |
| **27** | `27_category_brand_select_chanel.png` | `ShopCategory.tsx` | 브랜드 칩 '샤넬' 선택 인터랙션 | 브랜드 필터링 로직 부재 |
| **28** | `28_sell_page_initial.png` | `ShopSell.tsx` | 내 상품 판매 초기 화면 (브랜드 검색 & 리스트) | 텍스트 중심 목록 구성은 양호하나 브랜드 선택 시 다음 단계 없음 |
| **29** | `29_sell_page_search_input.png` | `ShopSell.tsx` | 브랜드 검색창 '고야드 (Goyard)' 입력 | 필터링은 동작하나 선택 후 프로세스 미정의 |
| **30** | `30_sell_page_direct_register.png` | `ShopSell.tsx` | '직접 등록해보세요' 링크 포커스 | 클릭 이벤트 핸들러 부재 |
| **31** | `31_admin_recruit_dashboard_store.png` | `ShopAdmin.tsx` | 관리자 모드: RECRUIT 대시보드 (매장 화면) | 다크 테마 글래스모피즘 완성도 우수, 데이터가 AppContext와 단절 |
| **32** | `32_admin_recruit_to_request_modal.png` | `ShopAdmin.tsx` | 매장 모드: 'TO 변경요청' 알림 팝업 모달 | 모달 키보드 포커스 트랩(ESC, Enter) 미흡 |
| **33** | `33_admin_recruit_request_form.png` | `ShopAdmin.tsx` | 신규 구인 요청 작성 폼 초기 상태 | 폼 검증(Validation) 및 필수 필드 에러 메시지 부족 |
| **34** | `34_admin_recruit_request_form_filled.png` | `ShopAdmin.tsx` | 신규 구인 폼 입력 (홍대점, 날짜, 카운터 등) | 입력값 상태 관리는 동작하나 서버 연동 없음 |
| **35** | `35_admin_recruit_request_submitted_modal.png` | `ShopAdmin.tsx` | 구인 요청 즉시 등록 제출 시 접수 모달 | 클라이언트 로컬 상태에만 추가되고 새로고침 시 초기화 |
| **36** | `36_admin_recruit_workers_db.png` | `ShopAdmin.tsx` | 근무자 DB & 단체 문자 관리 탭 | 체크박스 개별 선택 상태 미관리 (전체 defaultChecked) |
| **37** | `37_admin_recruit_sms_modal.png` | `ShopAdmin.tsx` | '선택 대상 단체 문자 발송' 알림 모달 | 실제 발송 대상 카운트 또는 템플릿 안내 보강 필요 |
| **38** | `38_admin_recruit_chat_initial.png` | `ShopAdmin.tsx` | 실시간 소통 및 채팅 초기 대화 내역 | 초기 메시지 하드코딩 |
| **39** | `39_admin_recruit_chat_sent.png` | `ShopAdmin.tsx` | 실시간 채팅 메시지 입력 및 전송 | 로컬 상태에 추가되나 새로고침 시 휘발 |
| **40** | `40_admin_role_switch_to_admin.png` | `ShopAdmin.tsx` | 역할 전환: '담당자 화면으로 전환' | 본사 관리자 모드로 토글 |
| **41** | `41_admin_role_admin_excel_modal.png` | `ShopAdmin.tsx` | 본사 관리자 모드: 엑셀 업로드 모달 | 단순 팝업 표시 |
| **42** | `42_admin_role_admin_hire_result_modal.png` | `ShopAdmin.tsx` | 본사 관리자 모드: '채용 결과 등록' 모달 | 상태 변경 없이 단순 알림만 표시 |
| **43** | `43_admin_shop_management_tab.png` | `ShopAdmin.tsx` | 메인 탭 '쇼핑몰 관리' 클릭 | 빈 상품 상태 또는 초기 상태 |
| **44** | `44_admin_shop_add_product_modal.png` | `ShopAdmin.tsx` | '신규 상품 등록' 버튼 클릭 시 완료 모달 | 고정된 가짜 데이터(`프리미엄 렌탈 상품`, 50,000원) 임의 추가 |
| **45** | `45_admin_shop_product_added_list.png` | `ShopAdmin.tsx` | 신규 렌탈 상품이 추가된 관리 리스트 | 상품 상세 입력 폼 없이 하드코딩 데이터 추가되는 한계 |
| **46** | `46_admin_return_to_app.png` | `ShopAdmin.tsx` | '앱으로 돌아가기' 클릭 후 쇼핑몰 메인 복귀 | 정상 복귀 동작 확인됨 |

---

## 2. 기본 이모지 전수 조사 및 고품질 교체 계획

| 위치 | 현재 이모지 | 용도 / 맥락 | 문제점 | 교체 방안 (Phase 2) |
|---|---|---|---|---|
| `ShopMain.tsx` (액션 카드) | 👗 | 렌트하기 카드 일러스트 | 패션 렌탈의 고급스러움 저해 | 세련된 드레스/의류 벡터 일러스트 SVG 또는 미니멀 아이콘 배지 |
| `ShopMain.tsx` (액션 카드) | 👜 | 구매하기 카드 일러스트 | 명품 가방 느낌 결여 | 미니멀 럭셔리 핸드백 라인아트 SVG 또는 정밀 아이콘 |
| `ShopMain.tsx` (액션 카드) | 🤝 | 판매하기 카드 일러스트 | 이모지가 지나치게 캐주얼함 | 프리미엄 위탁/거래를 상징하는 핸드셰이크/컨시어지 벡터 아이콘 |
| `ShopMain.tsx` (이벤트 배너) | 🎁 | 회원가입 이벤트 아이콘 | OS 기본 선물상자 이모지 | 우아한 골드/화이트 톤 기프트 박스 벡터 아이콘 |
| `ShopMain.tsx` (8-Grid 메뉴) | 👗 🏷️ ⏰ 👆 🤲 👑 💼 💌 | 렌트소개, 70%할인, 오늘입고, 베이직멤버십, 렌트잇케어, VIP, 바이백, 친구초대 | 각양각색의 OS 이모지로 시각적 통일성 전무 | 일관된 듀오톤/모노크롬 럭셔리 에셋 세트 (Lucide 기반 정밀 커스텀 아이콘) |
| `ShopMain.tsx` (맞춤추천) | 👜 | 4개 상품 썸네일 중앙 | 모든 상품에 동일 가방 이모지 노출 | 상품별 맞춤 고해상도 WebP 이미지 또는 카테고리별 정밀 실루엣 플레이스홀더 |
| `ShopMain.tsx` (New Arrivals) | 🧳, 💍 | 발렌시아가, 크리스찬 디올 | 여행가방, 반지 기본 이모지 | 고급 트래블 백 및 주얼리 미니멀 렌더 일러스트 |
| `ShopCategory.tsx` (추천) | 👞, 💍, 🧥 | 스니커즈, 액세서리, 옷장 | 굵은 기본 이모지로 앱 품질 저하 | 모던 슈즈, 링, 재킷 미니멀 벡터 아이콘 |
| `ShopCategory.tsx` (브랜드 칩) | 👜 👕 🎒 👛 🧥 🛍️ | 루이비통, 스톤아일랜드, 구찌, 샤넬, CP컴퍼니, 셀린느 | 브랜드 정체성과 무관한 이모지 | 미니멀 타이포그래피 모노그램 배지 (LV, SI, GG, CC, CP, CL)로 프리미엄 처리 |
| `ShopCategory.tsx` (상품 그리드) | 👜 | 6개 브랜드 상품 카드 이미지 | 모두 동일 이모지 | 카테고리/브랜드 매칭 프리미엄 상품 이미지 및 뱃지 |

---

## 3. 웹 접근성 (WCAG 2.2 AA) 및 반응형 검수 결과

### 3.1 웹 접근성 검토
- **명도 대비 (Contrast)**:
  - 연한 회색 텍스트(`text-gray-400`, `text-[10px]`) 중 일부가 흰색 배경 대비 3:1 미만으로 확인되어 `text-gray-500`~`text-gray-600`으로 4.5:1 이상 확보 필요.
- **키보드 접근성**:
  - `ShopSearch.tsx`의 추천 검색어 버튼, `ShopCategory.tsx`의 카테고리/브랜드 버튼이 `tabIndex`와 포커스 링(`focus-visible:ring-2`)이 누락됨.
  - 검색 오버레이 및 모달 열림 시 `Escape` 키 이벤트 리스너 부재.
- **시맨틱 마크업**:
  - 클릭 가능한 `div` 요소(`onClick` 핸들러 포함)에 `role="button"`, `tabIndex={0}`, `onKeyDown` 지원 추가 필요.
- **스크린 리더 대체 텍스트**:
  - 아이콘 버튼(돋보기, 장바구니, 설정, 닫기 등)에 `aria-label` 부여 필요.

### 3.2 해상도별 반응형 레이아웃 검수 (360px ~ 1920px)
1. **360px ~ 440px (모바일)**:
   - 가로 넘침(overflow-x)은 컨테이너에 의해 제한되나, 플로팅 바텀 바가 긴 기기 및 Safe Area에서 아래 콘텐츠를 일부 가리는 문제(패딩 하단 `pb-24` 조정 필요).
   - 상품명 `truncate` 적용은 되어 있으나 가격과 할인율 배치가 좁은 화면에서 줄바꿈되는 현상 점검.
2. **768px ~ 1024px (태블릿)**:
   - 모바일 컨테이너가 중앙 정렬되고 양옆 여백이 발생하여 안정적이나, QR 다운로드 배너가 화면 폭에 따라 어색하게 위치할 수 있음.
3. **1440px ~ 1920px (데스크톱)**:
   - `ShopMain` 데스크톱 뷰의 QR 배너 위치(`left-90`)를 뷰포트 상대 위치(`left-[calc(50%-440px)]` 등)로 정밀 고정하여 컨테이너와 일정한 간격을 유지하도록 보정 필요.
   - `ShopAdmin` 와이드 대시보드는 1920px까지 풀 스케일로 자연스럽게 확장됨을 확인.

---

## 4. 종합 평가 점수표

| 항목 | 현재 수준 | 목표 수준 (고도화 후) | 중점 조치 사항 |
|---|---|---|---|
| **콘텐츠 및 구조 보존** | 100% | 100% | 기존 46개 화면의 텍스트, 메뉴, 구조 일체 보존 |
| **비주얼 품질 (이모지 교체)** | 35% | 95% | 모든 기본 이모지를 세련된 벡터/타이포/이미지로 전면 교체 |
| **인터랙션 및 사용성** | 50% | 90% | 탭별 데이터 동기화, 검색 입력/제안 연동, 피드백 애니메이션 |
| **데이터 영속성 및 API** | 0% | 95% | Node.js + Express + SQLite 백엔드 API 완벽 구축 및 연동 |
| **접근성 (WCAG 2.2 AA)** | 55% | 90% | 포커스 링, ARIA 라벨, 키보드 네비게이션, 명도 대비 |
| **코드 아키텍처 및 무결성** | 65% | 95% | Vite 설정 오류 수정, 린트 경고 0건, 컴포넌트 정리 |
