# M1 — 요구사항 인수 기준 및 테스트 추적표 (AT) v1.0

**일자:** 2026-11-02 · **단계:** M1 검수 기준 확정(테스트 코드는 아직 미구현/미실행).
**연계:** [REQUIREMENTS](REQUIREMENTS.md), [USER_FLOWS](USER_FLOWS.md), [DATA_MODEL](DATA_MODEL.md), [API_CONTRACT](API_CONTRACT.md), [RISK_REGISTER](RISK_REGISTER.md).

## 1. 검수 증거 등급
- DESIGN_PASS: 요구사항과 기대 결과가 문서화됨.
- TEST_DEFINED: 자동화 가능한 테스트 케이스·데이터가 명시됨.
- TEST_PASS: 현재 git commit SHA 대상으로 실제 테스트 실행 로그/스크린샷/환경이 존재함.
- NOT_TESTED: 테스트 정의만 있고 미실행.
**본 단계 모든 런타임 테스트는 NOT_TESTED이다.** 과거 저장소의 QA PASS 결과를 신규 `lR`의 QA PASS로 가져오지 않는다.

## 2. P0/P1 인수 테스트

| AT ID | Req | 테스트 입력·행동 | 기대 결과 | 테스트 유형 |
|---|---|---|---|---|
| AT-NAV-01 | FR-001,013 | 5탭 네비게이션/뒤로가기/딥링크; 로그인하지 않고 둘러보기 | 탭 인디케이터가 라벨과 겹치지 않고 공개화면 정상 진입 | RN UI/E2E |
| AT-NAV-02 | FR-001~003 | 홈→검색→브랜드·카테고리→상품상세 | 이전 화면 복귀·상세 정보 유지 | RN UI/E2E |
| AT-PRD-01 | FR-002 | 브랜드 한/영 검색, 필터 조합, 페이지 요청 | 안정적 검색 결과, 중복 없는 cursor pagination | API 계약 |
| AT-PRD-02 | FR-003,018 | 단일 상품 렌탈/구매 둘 다 가능, 미인증·데모 제품 | 일 대여료·판매가 구분, 정품 근거 없으면 고지 제한 | RN UI/API |
| AT-REN-01 | FR-004 | KST 2026-11-10 시작 / 2026-11-13 반납 | `rentalDays=3`, 반납일 제외 | 단위/API |
| AT-REN-02 | FR-004 | `2026-02-30`, 시작=반납, 역순 날짜 | 422 + 필드별 `VALIDATION_ERROR` | 단위/API |
| AT-REN-03 | FR-004,006 | 실물 1개·같은 `blocked` 구간으로 병렬 예약 20건 | 유효 확정/홀드 중복 0, 409 충돌 처리, 실패 후 복구 | DB 동시성 |
| AT-REN-04 | FR-004,006 | 실물 2개 이상, 겹친 날짜/인접 반열린 구간 | 서로 다른 unit만큼만 예약; 버퍼가 0이면 인접 구간 허용 | DB 통합 |
| AT-REN-05 | FR-005 | 가격 28,000원/일 × 3일, 할인가 0, 보증금 별도 | 렌탈료 84,000원, 보증금/배송비/청구액 분리·변조 거부 | 단위/API |
| AT-REN-06 | FR-006 | 홀드 만료·취소·지연 웹훅·중복 요청 | 물품이 자동/논리적으로 해제되고 중복 예약·중복 결제 없음 | API/DB |
| AT-ORD-01 | FR-007 | 결제대기 구매 주문 생성 | `InventoryHold=ACTIVE`지만 `unit.physicalState != SOLD` | DB 통합 |
| AT-ORD-02 | FR-007 | 금액 위조 또는 다른 사용자 checkout 결제 시도 | 서버 403/404 또는 409/422, 결제 승인 거부 | 보안/API |
| AT-ORD-03 | FR-007,012 | PG 테스트 승인·거절·timeout·중복 webhook | 서버 확인 후 단 한 번 PAID/SOLD, 실패하면 차단 해제 | API/PG 샌드박스 |
| AT-ORD-04 | FR-007 | 중복 결제·환불 요청, 다른 금액 동일 멱등키 | 동일 요청 동일 결과, 다른 요청 409, 금액 원장 추적 | API/DB |
| AT-CARE-01 | FR-010 | 고객 A 사진 업로드 및 수선 신청 | 요청 ID 발급, 업로드 소유·미디어 메타 연계 | API/RN |
| AT-CARE-02 | FR-010 | 고객 B가 A 수선·사진 URL 직접 열기 | 인증 실패 또는 403/404, 유효한 사적 파일만 조회 | API 보안 |
| AT-CARE-03 | FR-010 | 파일 형식 조작, 대용량, 네트워크 단절/권한 거부 | 차단·복구 메시지·중복 제출 금지 | 업로드/E2E |
| AT-AUTH-01 | FR-008 | 미로그인으로 /me, /rentals, 관리자 접근 | 401 또는 403, UI 로그인 이동 | API |
| AT-AUTH-02 | FR-008,009 | 고객 A로 고객 B의 주문 ID 조회 | 본인 아닌 데이터 미노출 403 또는 404 | API 보안 |
| AT-AUTH-03 | FR-008 | 로그인 실패 반복/만료 토큰/로그아웃 | 속도 제한, 회전·만료 적용, 안전한 재인증 | API/RN |
| AT-ADM-01 | FR-011 | 권한 없는 상품 변경·재고 상태 PATCH | 403, DB와 이벤트 로그 변화 없음 | API |
| AT-ADM-02 | FR-011 | 반납→검수→세탁/수선→가용 재설정 | 허용 상태전이만 통과, 감사 로그 기록 | API/DB |
| AT-ADM-03 | FR-011 | 관리자 상품 등록·삭제 후 재시작 | 메모리가 아닌 MySQL 영속, DB 이력 남음 | API/DB |
| AT-CON-01 | FR-017 | 위탁 판매 3단계 작성/완료/재개 | 기존 `ShopSell` 기능을 신규 앱에서 접근 가능 | P1 UI |
| AT-CMS-01 | FR-018 | 초안·보관 글과 발행 글 고객 API 조회 | PUBLISHED만 응답, 상태 변경 감사지원 | P1 API |
| AT-OPS-01 | FR-020 | 기존 `RecruitApp` 모듈 접근 | 고객 앱의 쇼핑 메뉴 미노출, 관리자 웹에서 보존 | P2 통합 |
| AT-LEGACY-01 | NFR-05 | 기존 MySQL products 12건(합성 DB) → 신규 매핑 | id/brand/title/type/price 건수와 금액 동일 | 마이그레이션 |
| AT-LEGACY-02 | NFR-05 | 원본 테이블/컬럼에 테스트 migration 적용 | 데이터 보존, 신규 모델 분리, 복구 절차 검증 | DB |
| AT-UI-01 | FR-013,014 | Android/iOS 주요 해상도, 글꼴확대, 스크린리더 | CTA 가림/수평넘침/초점상실 없음, 에러 도움말 | 네이티브 QA |
| AT-UI-02 | FR-014 | 검색 실패/예약 충돌/결제 실패/오프라인 | 재시도/복귀, 중복 요청·중복 결제 없음 | RN E2E |

## 3. 데이터 설계에 대한 정형 불변식
- `INV-01`: 임의의 특정 `InventoryUnit`에서 동시간 유효한 `RENTAL` 홀드·확정 blocked 구간의 교집합은 없음.
- `INV-02`: 판매 checkout은 모든 기존 확정·유효 홀드와 충돌하지 않아야 함; 판매 완료 후 해당 unit을 다시 임대/판매할 수 없음.
- `INV-03`: 특정 `Idempotency-Key`와 요청 hash에 대한 성공 처리 결과는 정확히 하나.
- `INV-04`: 영수/지불 원장 금액은 서버의 해당 checkout `expectedAmountKrw`와 일치.
- `INV-05`: `Rental/Order/Repair`는 소유자 또는 명시적 관리자 권한만 읽을 수 있음.
- `INV-06`: `startDate < returnDate`이고 실제 유효 달력 날짜.
- `INV-07`: 판매/예약에 따른 재고/결제/상태/감사 로그는 실패 시 일관적 복구.
- `INV-08`: `media_assets` 원본 저장소 URL은 비공개이고 권한 있는 단기 파일 접근만 허용.

## 4. 실행 환경 및 결과 증거 형식 (M3~M6)
- 환경: Node.js/Express 버전, MySQL 버전/InnoDB isolation, OS, commit SHA, fixture seed와 business policyVersion.
- CI: `npm ci`, 타입검사, 린트, API 단위/통합, DB 동시성, 계약, 보안, Expo UI/E2E, 스크린샷/콘솔 에러.
- 결과: `analysis-artifacts/<M3|M4|M5|M6>/QA_REPORT.md`, `RESULTS.json`, 스크린샷·로그 (개인정보/시크릿 제외). 보고서·체크리스트만으로 TEST_PASS 불가.
- 회귀: 재고/기간/결제/인증/관리자/수선·언어/검색/디자인. 모든 문제에 재현 단계·심각도·수정 커밋·재검수 증거 첨부.

## 5. M1 종료/다음 단계 게이트
| 항목 | 현재 상태 |
|---|---|
| 기능 요구사항 FR/NFR와 우선순위 | **DESIGN_PASS** |
| 고객/관리자 IA 및 예외 플로우 | **DESIGN_PASS** |
| 논리 ERD·MySQL 호환 및 원본 비파괴 이전 전략 | **DESIGN_PASS** |
| API 계약·에러/멱등/보안 | **DESIGN_PASS** |
| 사업 정책 POL-01~05와 실 DB 스키마 | **미승인/미검증** |
| QA 자동 테스트 실행 및 네이티브 시각 QA | **NOT_TESTED** |
| 실제 PG·실사용자 데이터 취급·배포 | **미구현/금지** |

**M2로 넘어갈 수 있는 범위:** 명시된 설계 전제를 기반으로 Figma 와이어프레임·디자인 시스템·인터랙션 시안 작성. **M3 실 DB 마이그레이션/실 결제 구현은 미승인 정책 및 데이터 검증 항목을 통과해야 함.**
