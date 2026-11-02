# M1 — 고객용 앱·관리자 정보 구조(IA)와 화면 요구사항
**상태:** M1 화면 설계 기준선 v1.0 (M2 Figma 시각 검수 예정) · **날짜:** 2026-11-02
**참조:** [REQUIREMENTS](REQUIREMENTS.md), [FEATURE_MATRIX](FEATURE_MATRIX.md), [USER_FLOWS](USER_FLOWS.md).

## 1. 앱 내비게이션 개요

**하단 5탭:** 홈 / 렌탈 / 스토어 / 수선 / 마이. 공통 헤더 액션: 검색, 찜, 알림. 구매·대여는 각각 명확한 거래 유형을 표시. 기존 웹 5탭(카테고리/내 상품 판매/홈/좋아요/마이페이지)과는 **새로운 모바일 재배치**로 다르며 해당 기능은 모두 아래 접근 경로에 보존한다.

```text
luxuryRental (고객 앱)
├─ (tabs)/home       : ShopMain → 기획전/추천/브랜드/서비스 선택
├─ (tabs)/rental     : 렌탈 목록 → 상세 → 날짜 → 견적 → 홀드/결제 → 내역
├─ (tabs)/store      : ShopCategory + ProductCatalog → 상세 → 장바구니/주문
├─ (tabs)/care       : RepairPage(원본 Stub) → 수선 소개/사진/접수/진행
└─ (tabs)/my         : MyPage(원본 Stub) → 프로필/예약/주문/수선/위탁
      ├─ wishlist    : ShopLike와 혼동하지 말 것; 찜은 신규 화면
      └─ consignment : ShopSell의 3단계 위탁판매 UX 보존
공통 Stack: search(ShopSearch), product/[id](ProductDetailModal),
  login/register(ShopLike 원본은 로그인 UI), notification,
  checkout/*, address, policy, support, error/empty.
별도 관리자 웹:
  ShopAdmin → products/units/rentals/orders/returns/repairs/editorials/audit
  RecruitApp → staffing dashboard/requests/workers/chat (고객 앱 밖)
```

**원본 명칭·동작 대응:** React Web 모달 `ProductDetailModal` → 모바일 상세 Stack; `ShopLike`는 원본에서 찜 서비스가 아니라 로그인 레이어; 찜 기능 자체는 별도 구현. `RecruitApp`은 매장 인력관리, 일반 구직용 채용 사이트 아님. 원본 HTML/CSS를 React Native로 그대로 복사하지 않고 데이터/텍스트와 UX 패턴만 참조.

## 2. 전체 고객 화면 인벤토리

| ID | 경로(Expo Router 설계 예시) | 화면 | 주요 요소 | 접근/원본 |
|---|---|---|---|---|
| CM-01 | /splash | 시작 | 모노그램, 세션 확인, 접근성 | 공통 |
| CM-02 | /auth/login | 로그인 | 간편 로그인/이메일, 오류, 복귀 | ShopLike |
| CM-03 | /auth/register | 가입/동의 | 필수 동의·선택 동의 분리 | 신규 |
| CM-04 | /search | 통합 검색 | 최근 검색, 정렬, 결과, 재시도 | ShopSearch |
| CM-05 | /product/[id] | 상품 상세 | 이미지, 등급, 가격, 날짜, 약관 | ProductDetailModal |
| CM-06 | /notifications | 알림 | 읽음, 상세 이동, 알림 동의 | 신규 P1 |
| HM-01 | /(tabs)/home | 브랜드 홈 | 에디토리얼·추천·카테고리 CTA | ShopMain |
| HM-02 | /collections/[id] | 기획전 | 배너, 상품 큐레이션, 필터 | 신규 P1 |
| RT-01 | /(tabs)/rental | 렌탈 목록 | 기간/브랜드/등급/가격 필터, 재고상태 | ShopCategory 보강 |
| RT-02 | /rental/availability/[id] | 기간 선택 | 달력, 차단일, 반납일, 일수 | 신규 |
| RT-03 | /rental/quote | 예약 견적 | 렌탈료/배송비/보증금/할인 구분 | 신규 |
| RT-04 | /rental/checkout | 렌탈 주문서 | 주소, 약관, 홀드/결제 | 신규 |
| RT-05 | /rental/confirmation/[id] | 예약 결과 | 상태·예약번호·마이 이동 | 신규 |
| RT-06 | /rental/[id] | 예약 상세 | 배송·이용·반납/연장 상태 | 신규 |
| RT-07 | /rental/[id]/return | 반납 신청 | 픽업·상태 안내 | 신규 P1 |
| RT-08 | /rental/[id]/extend | 기간 연장 | 가용성 재검증, 추가 요금 | 신규 P1 |
| SH-01 | /(tabs)/store | 명품 스토어 | 브랜드/카테고리/구매 필터 | ShopCategory |
| SH-02 | /store/cart | 장바구니 | 금액·수량·품절·결제 | 신규 |
| SH-03 | /store/checkout | 구매 주문서 | 배송정보·총액·결제 | 신규 |
| SH-04 | /store/orders/[id] | 주문 상세 | 결제/출고/배송/취소 | 신규 |
| RP-01 | /(tabs)/care | 수선 서비스 | 서비스 설명·예상 처리 단계 | RepairPage STUB |
| RP-02 | /care/request | 수선 신청 | 이미지 업로드·상태·설명·동의 | 신규 |
| RP-03 | /care/requests/[id] | 진행·견적 | 접수·확인·견적승인·완료 | 신규 |
| MY-01 | /(tabs)/my | 마이 | 프로필·대여·구매·수선·찜·위탁 | MyPage STUB |
| MY-02 | /my/wishlist | 찜 | 찜 목록, 삭제/입고 알림 | 신규 |
| MY-03 | /my/rentals | 내 대여 목록 | 진행·반납·완료 상태 | 신규 |
| MY-04 | /my/orders | 구매 내역 | 주문·결제·배송·환불 | 신규 |
| MY-05 | /my/consignment | 판매 위탁 | 브랜드→종류→등급/사진→접수 | ShopSell P1 |
| MY-06 | /my/settings | 계정/설정 | 주소·알림·동의·회원탈퇴 | 신규 |

**공통 모달/시트:** 검색 필터, 상품 이미지 갤러리, 날짜 picker, 결제 확인, 에러/중복예약 처리, 사진 권한, 약관, 계정 필요 알림. **경로는 확정 인터페이스가 아닌 M1 설계 경로**이며 M2/M3에서 실제 Expo Router 지원 버전을 검증해 확정한다.

## 3. 핵심 화면별 규칙

### 홈
- 첫 화면에서 **렌탈/구매/판매 위탁/수선**의 진입 링크를 숨기지 않음.
- 에디토리얼 미게시 글은 노출되지 않음; 상품 이미지/가격은 API 데이터 우선.
- 로딩 skeleton, 추천 0건, 네트워크 오류, 이미지 실패 대체 상태 지원.

### 렌탈
- 리스트에 `일 대여료`와 `대여 가능 여부`를 별도로 표시.
- 날짜 선택 후 캘린더에는 출고/반납 버퍼에 따른 예약 불가를 구분; 최종 확정 시 서버 재검증.
- `시작일=2026-11-10, 반납일=2026-11-13` → 3일, 총금액 세부 표시.
- 같은 품목이 여럿이면 이용가능 unit을 서버가 배정하며 고객에게 실물 일련번호 노출 불필요.

### 스토어
- 렌탈/구매 동시 제공 상품은 두 가격과 선택된 거래 유형을 항상 명시.
- 품절/판매완료 시 구매 CTA 비활성화, 보충 알림(가능할 때) 안내.
- 주문 상태를 결제 대기/확정/배송/취소/환불로 명확히 구분.

### 수선
- 이미지 카메라·갤러리 사용 권한을 요청 이유와 함께 설명.
- 개인 소장품과 기존 대여 상품 관리 요청은 서로 다른 유형으로 접수.
- 파일 미첨부/잘못된 이미지/용량 초과/네트워크 실패 시 복구 가능.
- 견적은 고객이 승인하기 전 과금 완료처럼 표시하지 않음.

### 마이
- 비로그인은 설명/로그인 CTA; 로그인 후 현재 사용자 소유 데이터만 표시.
- 찜·대여·구매·수선·위탁·주소·설정으로 분류.
- 주문/렌탈 상세를 앱 재시작·딥링크로 복원할 수 있게 백엔드 기반 상태 사용.

## 4. 운영 웹의 독립 IA
- ERP: 대시보드, 상품 모델, 개별 실물, 입고·출고, 예약, 판매/환불, 검수·세탁·수선, 재고 이벤트, 정산.
- CMS: 에디토리얼 초안/미리보기/발행/비공개, 추천 상품 편성, 첨부 미디어 권리 기록, 발행 로그.
- STAFFING(기존 RecruitApp): 매장 구인, 근무자, 채팅, 본사·매장 권한. **고객용 쇼핑 하단탭에 혼입하지 않음**.

## 5. M2 화면 UX 검수 게이트
- Android/iOS 안전 영역 및 360~430px 주요 화면에서 CTA/하단 탭 겹침 없음.
- 하단 탭 선택선이 라벨과 겹치지 않음; 44pt 이상 터치 목표와 스크린리더 레이블.
- 결제 전 총액, 보증금, 약관·반납일·취소 조건을 인지할 수 있음.
- 대표 이용 시나리오 [USER_FLOWS](USER_FLOWS.md)를 Figma에서 클릭 가능한 수준으로 확인.
