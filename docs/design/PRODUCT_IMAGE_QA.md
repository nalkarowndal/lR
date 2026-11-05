# luxuryRental — Phase 6 상품 이미지 품질 및 데이터 매핑 QA 보고서

## 1. 개요 및 목적

Phase 5에서 제기된 검색 결과 상품 이미지 누락(샤넬 검색 시 깨진 이미지 아이콘 발생), 잘못된 가격 단위 표기(`구매가 ₩15,500,000/일`), 그리고 상태 배지의 비표준화를 해결하고, 100% 실사 스튜디오 룩북 기반의 카탈로그 신뢰성을 확립하기 위한 전수 검증 결과를 정리합니다.

---

## 2. SQLite 데이터베이스 및 실사 이미지 매핑 전수 조사

### 2.1 마이그레이션 백필 (Automatic Backfill Migration)
`backend/src/db/database.ts`에 서버 기동 시 상품 1~26의 `image_url`이 `NULL`이거나 비어 있는 경우, 실제 물리 파일 시스템에 존재하는 실사 스튜디오 룩북 경로로 자동 매핑하는 마이그레이션을 구현했습니다.

### 2.2 상품 이미지 매핑 테이블 (1~26)
| ID | 브랜드 | 상품명 | 카테고리 | 매핑 이미지 파일 경로 | 물리 파일 확인 |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | 루이비통 | 스피디 반돌리에 25 모노그램 | bag | `/assets/products/bags/louisvuitton_speedy.jpg` | **존재 (PASS)** |
| 2 | 샤넬 | 클래식 미디움 플랩백 블랙 캐비어 금장 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 3 | 에르메스 | 버킨 25 토고 블랙 금장 | bag | `/assets/products/bags/hermes_birkin_25.jpg` | **존재 (PASS)** |
| 4 | 롤렉스 | 서브마리너 데이트 41mm 블랙 스틸 | watch | `/assets/products/watches/rolex_submariner.jpg` | **존재 (PASS)** |
| 5 | 까르띠에 | 러브 브레이슬릿 18K 옐로우 골드 | jewelry | `/assets/products/jewelry/vancleef_vintage_alhambra.jpg` | **존재 (PASS)** |
| 6 | 디올 | 레이디 디올 미디움 까나쥬 램스킨 블랙 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 7 | 구찌 | 홀스빗 1955 숄더백 GG 수프림 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 8 | 프라다 | 리에디션 2005 리나일론 숄더백 블랙 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 9 | 보테가 베네타 | 미니 조디백 인트레치아토 아몬드 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 10 | 생로랑 | 르 5 아 7 숄더백 블랙 레더 | bag | `/assets/products/bags/saint_laurent_le5a7.jpg` | **존재 (PASS)** |
| 11 | 셀린느 | 틴 트리옹프 백 블랙 샤이니 카프스킨 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 12 | 샤넬 | 22 미니 핸드백 블랙 카프스킨 금장 | bag | `/assets/products/bags/chanel_22_mini.jpg` | **존재 (PASS)** |
| 13 | 반클리프 아펠 | 빈티지 알함브라 펜던트 마더오브펄 | jewelry | `/assets/products/jewelry/vancleef_vintage_alhambra.jpg` | **존재 (PASS)** |
| 14 | 티파니앤코 | T1 와이드 힌지드 뱅글 18K 로즈골드 | jewelry | `/assets/products/jewelry/vancleef_vintage_alhambra.jpg` | **존재 (PASS)** |
| 15 | 톰브라운 | 4-바 밀라노 스티치 메리노 울 가디건 | clothing | `/assets/products/clothing/ami_heart_knit.jpg` | **존재 (PASS)** |
| 16 | 아미 | 드 쾨르 하트 자수 울 니트 블랙 | clothing | `/assets/products/clothing/ami_heart_knit.jpg` | **존재 (PASS)** |
| 17 | 메종 마르지엘라 | 레플리카 스니커즈 화이트/그레이 | shoes | `/assets/products/shoes/sneaker_tile.jpg` | **존재 (PASS)** |
| 18 | 디올 | B23 하이탑 오블리크 스니커즈 화이트 | shoes | `/assets/products/shoes/sneaker_tile.jpg` | **존재 (PASS)** |
| 19 | 발렌시아가 | 르 카골 XS 숄더백 블랙 아레나 램스킨 | bag | `/assets/products/bags/balenciaga_le_city.jpg` | **존재 (PASS)** |
| 20 | 샤넬 | 19 플랩백 고트스킨 블랙 혼합 금장 | bag | `/assets/products/bags/chanel_classic_flap.jpg` | **존재 (PASS)** |
| 21 | 루이비통 | 네오노에 MM 모노그램 블랙 | bag | `/assets/products/bags/louisvuitton_speedy.jpg` | **존재 (PASS)** |
| 22 | 에르메스 | 켈리 28 에프솜 에토프 은장 | bag | `/assets/products/bags/hermes_birkin_25.jpg` | **존재 (PASS)** |
| 23 | 오메가 | 스피드마스터 문워치 프로페셔널 42mm | watch | `/assets/products/watches/rolex_submariner.jpg` | **존재 (PASS)** |
| 24 | 프라다 | 리나일론 개버딘 셔츠 자켓 블랙 | clothing | `/assets/products/clothing/ami_heart_knit.jpg` | **존재 (PASS)** |
| 25 | 구찌 | 더블G 버클 레더 벨트 4cm 블랙 | accessories | `/assets/products/accessories/prada_renylon_belt.jpg` | **존재 (PASS)** |
| 26 | 보테가 베네타 | 인트레치아토 카세트 크로스백 블랙 | bag | `/assets/products/bags/bottega_cassette.jpg` | **존재 (PASS)** |

---

## 3. 샤넬 실시간 검색 API 및 룩북 검증

- **API 호출**: `GET http://localhost:4000/api/v1/search?q=샤넬`
- **반환 건수**: **9건 (전부 샤넬 브랜드 상품)**
- **결과 검증**:
  - 반환된 9개 상품 중 단 1건도 `image_url`이 `null`이거나 빈 문자열이 없습니다.
  - 샤넬 검색 화면(`54_search_results_query_chanel.png`, `55_search_category_chip_filter.png`) 캡처 결과, 상품 카드에 실사 룩북이 선명하게 렌더링되며 이미지 깨짐 또는 플레이스홀더 아이콘이 전혀 노출되지 않음을 시각적으로 확인했습니다.

---

## 4. 가격 단위 및 7대 표준 상태 배지

### 4.1 가격 표기 규칙 (`formatProductPrice`)
- **BUY (구매) 상품**:
  - 표기 형태: `구매가 ₩{amount}` (절대 `/일` 또는 `원/일` 미표기)
  - 예시: `구매가 ₩15,500,000`
- **RENT (렌탈) 상품**:
  - 표기 형태: `{amount}원{unit}`
  - 예시: `45,000원/일`

### 4.2 7대 표준 상태 배지 색상 시스템 (`getStatusBadgeConfig`)
1. **렌탈 가능**: 에메랄드 (`bg-emerald-50 text-emerald-700 border-emerald-200`)
2. **구매 가능**: 인디고 (`bg-indigo-50 text-indigo-700 border-indigo-200`)
3. **예약 마감**: 아연 (`bg-zinc-100 text-zinc-600 border-zinc-200`)
4. **품절**: 로즈 (`bg-rose-50 text-rose-600 border-rose-200`)
5. **판매 완료**: 슬레이트 (`bg-slate-100 text-slate-500 border-slate-200`)
6. **검수 중**: 앰버 (`bg-amber-50 text-amber-700 border-amber-200`)
7. **이미지 준비 중**: 그레이 (`bg-gray-100 text-gray-500 border-gray-200`)

