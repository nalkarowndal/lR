# M0 정밀 소스 실사 보고서 — luxuryRental

**검토일:** 2026-11-02 (Asia/Seoul)  
**작성 대상:** https://github.com/nalkarowndal/lR  
**검토 방법:** GitHub 연결을 통한 실제 저장소 트리, 소스 코드, 구성 파일, 테스트 정의 및 GitHub Actions 실행 기록의 정적 검토. **로컬 빌드·DB 연결·실기기 테스트·침투 테스트는 이번 실사에서 실행하지 않았음.**

## 1. 기준 소스와 고정 커밋

| 저장소 | 기준 커밋 SHA | 성격 | 증거 |
|---|---|---|---|
| [nalkarowndal/567890](https://github.com/nalkarowndal/567890) | `aa790f196907ab5cf9fefd51bced9f474be87884` | 기존 luxuryRental 웹 UI/백엔드의 **우선 기준 소스** | [트리](https://github.com/nalkarowndal/567890/tree/aa790f196907ab5cf9fefd51bced9f474be87884) |
| [nalkarowndal/1235856894](https://github.com/nalkarowndal/1235856894) | `d741fde0b9e6ca3ab6ec17b111aa6a5eec1d38d5` | 별도 모바일/ERP 콘셉트 스타터 **참고 소스** | [트리](https://github.com/nalkarowndal/1235856894/tree/d741fde0b9e6ca3ab6ec17b111aa6a5eec1d38d5) |
| [nalkarowndal/lR](https://github.com/nalkarowndal/lR) | 분석 시작 시 `959cc1bde26cc79f9b19daddab2c321739fb6d57` | **신규 앱·Node.js 백엔드 개발 대상** | [계획](https://github.com/nalkarowndal/lR/blob/main/docs/ROADMAP.md) |

**주의:** 과거 2026-10-22 기술 실사 문서는 당시의 별도 소스 묶음/버전(Express/Prisma/SQLite)을 설명했습니다. 현 `567890`의 실제 백엔드는 Express/MySQL로 확인되므로 기존 보고서 수치를 최신 구현 사실로 재사용하지 않습니다. 별도로 제공되었던 ZIP 파일의 바이너리/커밋 동일성은 이번 실사에서 대조하지 않았습니다.

### 증거 등급

- **A (직접 소스 검토):** 해당 SHA의 소스와 설정, 테이블 DDL, 라우트·화면 함수 직접 확인.
- **B (CI 시스템 결과):** 저장소 GitHub Actions에서 해당 SHA에 대해 `success` 또는 다른 상태 확인. 테스트 전체 범위를 뜻하지 않음.
- **C (미실행/권고):** 성능·보안·실기기/UX 추정과 제안. 직접 결과로 표현 금지.

## 2. 기존 웹: nalkarowndal/567890

### 2.1 구현 기술

- `frontend/package.json`: React 19, TypeScript ~6, Vite 8, React Router 7 패키지, Redux Toolkit, styled-components 6, Tailwind 4, Playwright.
- `frontend/src/main.tsx`: React `AppProvider` 중심의 **조건부 단일 화면 전환**; 현재 소스에서 실사용 라우팅은 `ViewState`를 통한 전환이며 React Router 패키지가 설치됐다는 이유로 사용한다고 판단하지 않음.
- `frontend/src/context/AppContext.tsx`: `SHOP_MAIN | SHOP_ADMIN | RECRUIT_APP | SHOP_CATEGORY | SHOP_SELL` 상태, 로그인·검색 오버레이, 샘플 인력/모집 상태.
- `backend/package.json`: **Node.js CommonJS + Express ^5.3.0 + mysql2**, `backend/server.js` 구현.
- `backend/scripts/init-db.js`: **MySQL products 테이블 하나**를 생성하는 DDL (`id,title,brand,type,price,created_at`).
- `backend/server.js` 확인 HTTP 라우트: `GET /`, `GET /api/health`, `GET /api/products`. 이 commit에서 인증/예약/주문/수선 API는 미확인.
- `backend/db.js`: MySQL 접속 및 풀; `DB_PASSWORD || '1234'` 약한 비밀번호 폴백이 존재하여 제거 필요. 데이터베이스는 운영 실체에 직접 접속하지 않았음.

### 2.2 실제 고객 화면

| 소스 파일 | 직접 확인된 구현 | 한계 |
|---|---|---|
| [ShopMain.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopMain.tsx) | 브랜드 홈, 검색, 구매/렌탈/판매 진입, 카탈로그, 배너·가이드 | 다수 CTA는 `showToast`로 '준비 중' 안내 |
| [ShopCategory.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopCategory.tsx) | 카테고리/브랜드 탐색, 상품 필터 | 일부 기획 컬렉션은 알림만 표시 |
| [ShopSearch.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopSearch.tsx) | `/api/products` 조회, 검색·실패/재시도, 상품 선택 | 서버 데이터와 상품 이미지·정합성 고도화 필요 |
| [ProductCatalog.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ProductCatalog.tsx) | 목록 요청, 구매/렌탈 가격 표시, 상품 상세 모달 열기 | 데이터 모델 단일 Product 단위 |
| [ProductDetailModal.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ProductDetailModal.tsx) | 렌탈 일수(3/5/7/14/30 등), 단가 × 일수, 반환 예정일, 구매 CTA | **예약/구매 API 호출 없이 데모 알림** |
| [ShopLike.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopLike.tsx) | 카카오/애플/네이버/이메일 로그인 UI | **실제 로그인 인증 미구현**; 데모 안내 |
| [ShopSell.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopSell.tsx) | 브랜드·카테고리·등급 선택 위탁 판매 폼 | **위탁 신청 시뮬레이션**, 실접수 없음 |
| [BottomNav.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/BottomNav.tsx) | 카테고리·판매·홈·좋아요·마이 5개 | 좋아요/마이는 실제 화면 대신 로그인 오버레이 |
| [RepairPage.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/sub/RepairPage.tsx) | 빈 프래그먼트 | 수선 화면 미구현 |
| [MyPage.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/sub/MyPage.tsx) | 빈 프래그먼트 | 전용 마이페이지 미구현 |

### 2.3 관리자·인력 운영

- [ShopAdmin.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopAdmin.tsx)는 상품 관리 및 `RECRUIT` 운영 탭을 제공합니다. 관리자 진입은 `ShopMain.tsx`에서 `setCurrentView('SHOP_ADMIN')` 호출이며 이 UI 진입에 대한 서버측 인증/권한 확인은 보이지 않습니다.
- 관리자 상품 생성/삭제는 `setProducts`라는 React 메모리 상태에 적용됩니다. 영속적 MySQL `INSERT/DELETE` API와 연결되어 있지 않습니다.
- `RecruitApp.tsx` 및 `ShopAdmin.tsx`의 **Recruit**는 럭셔리 브랜드 채용 공고 사이트가 아니라 **매장 구인 요청, 근무자 목록, 본사/매장 운영, 채팅** 성격의 별도 인력 운영 기능입니다. 전용 채용 페이지로 잘못 분류하지 않습니다.
- AppContext의 `role:'STORE'|'ADMIN'`은 브라우저 상태이며 실제 서버 인가 역할이 아닙니다.
- 보존 요구: Recruit 관련 코드는 독립 운영모듈로 분리할지, 데모 참고로 남길지 M1에서 결정. 기존 소스에서 임의 삭제 금지.

### 2.4 디자인 방향

- 현재 기존 웹은 흰색 모바일 셸, 파스텔 카드 및 접근 가능한 하단 내비게이션을 사용합니다.
- 기존 디자인의 화면 정보 구조/브랜드 사용 방식을 우선 보존합니다.
- 참고 스타터의 크림·잉크·샴페인·모스 팔레트는 **대안 디자인**이며 원본 스타일을 검토 없이 전면 대체하지 않습니다.

## 3. 참고 모바일/ERP 스타터: nalkarowndal/1235856894

### 3.1 기술과 실기능

- [README.md](https://github.com/nalkarowndal/1235856894/blob/d741fde/README.md): React 19 + Vite 6 + Tailwind 4 + Motion; **Node.js 내장 HTTP + `node:sqlite`** 사용. 즉 **Express 서버가 아님**.
- [server/db.mjs](https://github.com/nalkarowndal/1235856894/blob/d741fde/server/db.mjs): 실제 테이블 5개 `products, units, rentals, orders, inventory_events`; 6개 가상 제품과 개별 실물 시드.
- `createRental`: `BEGIN IMMEDIATE`, 실물별 활성 예약 날짜 중복 검사, 가격 서버 계산, 재고 이벤트 작성.
- `createOrder`: 실물 판매 상태 변경 + 데모 주문 저장. **결제 완료 전 `sold` 처리하므로 운영 결제 흐름에 그대로 사용하지 말 것**. 유효한 `InventoryHold`/결제 상태머신 필요.
- [server/index.mjs](https://github.com/nalkarowndal/1235856894/blob/d741fde/server/index.mjs): `GET /api/health`, `GET /api/products`, `GET /api/products/:productId/availability`, `POST /api/rentals`, `POST /api/orders`, 관리자 로그인/대시보드/상태 변경 등이 존재.
- 관리자 로그인: 단일 환경변수 비밀번호 + 휘발성 서버 `Map` 세션, HttpOnly 쿠키; **고객 로그인/소유권 검증은 아직 없음**. 관리용 데모 구조만 참조.
- 구매와 렌탈은 모두 `demo_not_charged` 등 명시적 데모 거래로 **실제 PG 결제가 아님**.
- [docs/ARCHITECTURE.md](https://github.com/nalkarowndal/1235856894/blob/d741fde/docs/ARCHITECTURE.md): 일별 요금, 가용성, ERP 상태 흐름 및 독립 운영 확장 과제를 기술.

### 3.2 재사용 후보

**설계/도메인에서 재사용:** 실물 ID와 일련번호, 날짜 겹침 판별 로직의 개념, 재고 이벤트 로그, 서버 가격 계산, 관리자 상태 전환, Playwright 모바일 테스트 시나리오.

**직접 코드 재사용 주의:** SQLite 고유 문법/동기 API/단일 프로세스 트랜잭션, `node:http` 단일 라우터, 익명 고객 문자열, 인메모리 관리자 세션, 결제 전 재고 `sold` 처리. 새로운 Node.js + Express 서버의 도메인 계약과 DB 트랜잭션으로 재설계해야 함.

## 4. 자동화 QA 증빙과 한계

| 원본 | 확인한 GitHub Actions | 실제 범위 한계 |
|---|---|---|
| `567890` | `aa790f1` 커밋 QA **success** (2026-10-30) | [qa.yml](https://github.com/nalkarowndal/567890/blob/aa790f1/.github/workflows/qa.yml)은 프론트 의존성 설치, TS, 상품 검색 단위 테스트, Vite 빌드 및 Playwright 브라우저 설치만 실행. **Playwright E2E 실행 단계·Node/MySQL API 통합 테스트 없음** |
| `1235856894` | `d741fde` 커밋 QA **success** (2026-10-30) | [qa.yml](https://github.com/nalkarowndal/1235856894/blob/d741fde/.github/workflows/qa.yml)은 API 테스트·빌드·Playwright 모바일 **브라우저** E2E를 실행. 네이티브 Android/iOS 실기기 검증이 아님 |
| `lR` | 설계 문서만 존재 | 앱 빌드·기능 QA 대상 코드가 아직 없음 |

`567890`에 기재된 [PHASE_29 최종 UX 보고서](https://github.com/nalkarowndal/567890/blob/aa790f1/luxuryRental_analysis/PHASE_29_UX_VALIDATION/FINAL_UX_REPORT.md)의 RELEASE_READY/PASS 문구는 **프로젝트 작성 보고서의 주장**으로 취급하며, 실제 PG·고객 인증·예약/수선 운영 완료를 증명하지 않습니다.

## 5. 백엔드·DB 통합 결정

**확정:** Node.js + TypeScript 기반 API. 기존 웹과의 친화성과 직접 검토한 Express 5 API를 고려하여 Express 기반 계층형 모듈을 기본안으로 사용.

**DB는 최종 미확정:** `567890`의 실제 MySQL `products` 테이블이 기존 데이터 소스입니다. `1235856894`의 SQLite는 별도 데모입니다. `lR`에서 PostgreSQL + Prisma는 **후보안**이며 필수 확정 사항이 아닙니다.

권고 순서:
1. 실제 MySQL 데이터 덤프 또는 스키마(비식별)를 안전하게 확인하며 운영 DB 존재 여부를 확인.
2. Product/InventoryUnit/Rental/Order/Repair/User/Payment/Editorial 모듈에 필요한 확장 관계를 설계.
3. MySQL을 유지할지 PostgreSQL로 이전할지 비용·호환성·데이터 보존을 비교.
4. Prisma 도입 시 최신 설치 버전에 맞는 **introspection + baseline** 절차를 적용하여 기존 테이블 재생성/데이터 초기화 방지.
5. 스키마와 데이터 백업·복원·충돌/실패 테스트를 완료하기 전 데이터 마이그레이션 실행 금지.

## 6. 이번 실사의 제한사항 및 후속 작업

- GitHub 저장소 버전만 검토했습니다. 사용자의 로컬 개발 DB, 미커밋 변경, 기존 업로드 ZIP 바이너리 차이는 검증하지 않았습니다.
- UI 렌더링, 시각적 품질, 실제 DB 연결 및 성능·취약점 재현 테스트는 실시하지 않았습니다.
- 모바일 앱(Expo) 또는 Node.js 신규 서버 코드는 작성/실행하지 않았습니다.
- 공개 repo에 이미 포함된 테스트·예시 개인정보와 실제 자격 증명은 구분해야 하며, 생성·시드된 데이터는 공개 공유 전에 비식별화해야 합니다.
- M0 완료 게이트는 `FEATURE_MATRIX.md`와 `RISK_REGISTER.md`를 M1 요구사항에 반영하고 DB/도메인 보존 범위가 승인될 때까지 **부분 완료**입니다.

## 공식 참고 자료

- [Express 생산환경 보안](https://expressjs.com/en/advanced/best-practice-security/)
- [Prisma: 기존 MySQL에 ORM 도입](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/mysql)
- [Prisma: 기존 DB Baseline](https://docs.prisma.io/docs/orm/prisma-migrate/workflows/baselining)
- [Expo Router](https://docs.expo.dev/router/introduction/)

**결론:** `567890`은 원본 UX·브랜드·진입 구조의 우선 참고이며, `1235856894`는 실제 실물·재고·예약 도메인 설계의 참고다. 신규 `lR`은 양쪽의 장점을 재설계하여 통합하되, 각각의 데모나 QA 문구를 상용 구현/실거래 완료로 보지 않는다.
