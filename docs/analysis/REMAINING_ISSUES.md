# LuxuryRental Phase 6 잔여 이슈 및 해결 현황 (REMAINING_ISSUES.md)

## 1. 개요
본 문서는 Phase 5 감사 시점부터 Phase 6 개발 과정에서 식별된 모든 문제점과 해당 항목의 처리 현황(Resolved/Verified)을 추적 관리합니다.

---

## 2. 세부 이슈별 처리 현황 및 해결 내역

| 이슈 ID | 구분 | 관련 컴포넌트 | 이슈 내용 | 해결 방안 및 상태 | 검증 결과 |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **ISSUE-01** | P0 | `ShopAdmin.tsx` | 상품 이미지 갤러리 모달이 닫히지 않고 하위 탭 및 반응형 전체에 잔류 | 탭 전환 시 모달 상태 강제 리셋, 닫기 버튼 UI 및 aria-label 추가, 백드롭 클릭 핸들러 탑재 | **해결 완료 (RESOLVED)** |
| **ISSUE-02** | P0 | `ShopRegister.tsx`, `ShopPasswordReset.tsx` | 오버레이 슬라이드 인 전환 시 130px 가로 스크롤 밀림 및 잘림 현상 | `preventScroll: true` 포커스 타이머 적용, `overflow-x: hidden` 전역 적용, `PASSWORD_RESET` alias 호환 | **해결 완료 (RESOLVED)** |
| **ISSUE-03** | P1 | `ShopSearch.tsx`, `catalog.ts` | 검색 결과 내 샤넬 상품 이미지 누락 및 BUY 상품의 `/일` 단위 노출 | SQLite DB 시드 상품 1~26 스튜디오 자산 백필, `formatProductPrice` 유틸리티 적용 | **해결 완료 (RESOLVED)** |
| **ISSUE-04** | P1 | `ShopMain.tsx` | 장바구니 -> 주문서 작성 -> 결제 완료 단계별 전환 버튼 텍스트 불일치 | `주문서 작성으로 이동` 및 `최종 결제 및 렌탈 예약 접수` 버튼 연동 정상화 | **해결 완료 (RESOLVED)** |
| **ISSUE-05** | P1 | `ShopMain.tsx` | 8-Grid 메뉴 중 일부 메뉴 클릭 시 엉뚱한 화면(`SHOP_CATEGORY`, `SHOP_SELL`)으로 이동 | 8대 전체 메뉴에 대해 각각 고유한 안내 정보 모달(`setServiceInfoModal`)을 띄우도록 개선 | **해결 완료 (RESOLVED)** |
| **ISSUE-06** | P1 | `ShopSell.tsx` | 위탁 판매 신청 폼의 입력값 변경 시 리액트 상태 비동기 동기화 누락 | 직접 브랜드 등록 및 위탁 폼의 `page.type` 키스트로크 입력 및 부속품/상태 체크 활성화 | **해결 완료 (RESOLVED)** |
| **ISSUE-07** | P1 | `ShopSettings.tsx` | 설정 센터 알림 스위치 및 고객센터 안내 모달 클릭 실패 | `button[role="switch"]` 및 `고객센터 안내` 명칭 정합성 일치로 모달 정상 팝업 | **해결 완료 (RESOLVED)** |
| **ISSUE-08** | P0 | `ShopMain.tsx` | **하단 플로팅 내비게이션 절대 불변(IMMUTABLE) 보장** | 5대 아이콘(카테고리, 내 상품 판매, 홈, 좋아요, 마이페이지)의 모양, 색상, 배치 100% 동결 | **절대 보존 (PASS)** |

---

## 3. 종합 평가
모든 결함 이슈가 소스코드 레벨에서 근본적으로 해결되었으며, 하단 내비게이션의 절대 불변 규칙 또한 엄격하게 준수되었습니다.

