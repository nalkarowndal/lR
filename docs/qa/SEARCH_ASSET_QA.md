# luxuryRental — Phase 6 실시간 검색, 에셋 무결성 및 내 상품 판매 QA 보고서

## 1. 실시간 통합 검색 (Search Overlay) 검증

Phase 5에서 발생했던 문제점:
- 검색창에서 '샤넬' 키워드 검색 시, 반환된 상품 카드의 이미지가 깨져 보이거나 엑스박스 아이콘으로 렌더링되는 결함 (`54_search_results_query_chanel.png`, `55_search_category_chip_filter.png`).
- BUY 상품에 `/일` 가격 단위가 오기되는 문제.

Phase 6 개선 및 검증 결과:
1. **백엔드 검색 API 검증**:
   - `GET /api/v1/search?q=샤넬` 요청 시 SQLite DB에 저장된 9건의 샤넬 상품(가방, 의류, 지갑) 반환.
   - 모든 반환 항목의 `image_url` 필드가 유효한 물리 파일 경로(`/assets/products/bags/chanel_classic_flap.jpg`, `/assets/products/bags/chanel_22_mini.jpg` 등)를 포함함.
2. **시각적 렌더링 확인**:
   - `53_search_overlay_initial.png`: Graphite Micro-Bevel 검색창, 추천 검색어 태그(샤넬, 루이비통, 롤렉스, 에르메스 등), 실시간 인기 검색어 1~10위 차트.
   - `54_search_results_query_chanel.png`: 샤넬 실사 룩북 갤러리 정상 출력 (이미지 깨짐 0건).
   - `55_search_category_chip_filter.png`: "가방" 카테고리 필터 칩 클릭 시 해당 품목만 즉각 필터링.
   - `56_search_input_cleared.png`: 추천 검색어 태그("까르띠에") 클릭 즉각 연동.
   - `57_search_trending_keyword_click.png`: 실시간 1위 태그("루이비통") 클릭 즉각 연동.

---

## 2. 내 상품 판매 (ShopSell) & 위탁 신청 플로우 검증

### 2.1 주요 기능 흐름
1. **판매 초기 화면 (`58_sell_page_initial_view.png`)**:
   - 명품 판매 브랜드 검색바, 가나다순 브랜드 그리드 및 "원하는 브랜드가 없으신가요?" 직접 등록 배너.
2. **브랜드 검색 필터링 (`59_sell_page_brand_search_filtered.png`)**:
   - 검색창에 '샤넬' 입력 시 즉시 필터링.
3. **직접 브랜드 등록 모달 (`60_sell_page_direct_brand_modal.png`)**:
   - 미등록 부티크 브랜드 수기 입력 모달 정상 오픈.
4. **위탁 판매 상품 정보 입력 신청서 (`61_sell_page_consignment_form_modal.png`)**:
   - 신청 브랜드 확인, 카테고리 선택, 모델명, 구입가, 상태 등급(S/A/B), EngravedCameraIcon 실사 사진 첨부.
5. **신청서 작성 완료 (`62_sell_page_form_completed.png`)**:
   - 모든 필수 입력값 및 부속품 체크, 감정 동의 완료.
6. **골드 인증 메달 접수 완료 모달 (`63_sell_page_submitted_medal_modal.png`)**:
   - '위탁 신청 완료' 클릭 시 백엔드 API 호출 및 `EngravedMedalEmblem` 황금 메달 엠블럼과 고유 접수번호(`SELL-YYYYMMDD-XXXX`) 발행 모달 노출.
   - 신청서 모달이 백그라운드에 중첩되지 않고 깔끔하게 접수 모달로 전환됨을 확인.

---

## 3. 검증 상태 요약

| 화면 ID | 검증 화면 | 판정 |
| :---: | :--- | :---: |
| `53` | 검색 오버레이 초기 화면 | **PASS** |
| `54` | 실시간 샤넬 검색 결과 (실사 룩북) | **PASS** |
| `55` | 검색 내 카테고리 필터 (가방) | **PASS** |
| `56` | 추천 검색어 (까르띠에) | **PASS** |
| `57` | 실시간 인기 검색어 (루이비통) | **PASS** |
| `58` | 내 상품 판매 초기 화면 | **PASS** |
| `59` | 판매 브랜드 검색 (샤넬) | **PASS** |
| `60` | 직접 브랜드 등록 모달 | **PASS** |
| `61` | 위탁 판매 정보 입력 폼 | **PASS** |
| `62` | 신청서 입력 완료 상태 | **PASS** |
| `63` | 골드 메달 접수 완료 모달 | **PASS** |

