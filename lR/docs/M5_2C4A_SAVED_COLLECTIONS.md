# M5-2C4-A — 고객 찜·장바구니 서버 저장 및 웹 동기화

작성일: 2026-11-03 · 대상: `nalkarowndal/lR/lR` · [PR #42](https://github.com/nalkarowndal/lR/pull/42) · [후속 작업 #41](https://github.com/nalkarowndal/lR/issues/41)

## API 계약

기존 DB 인증 bearer가 있는 **테스트 계정에서만** 다음 여섯 개 REST 경로를 사용한다.

| 메서드 | 경로 | 계약 |
|---|---|---|
| GET | `/api/v1/me/wishlist` | `{data:{productIds:string[]},meta:{demo:true}}` |
| POST | `/api/v1/me/wishlist` | `{productId}`, 신규 201 / 중복 200 |
| DELETE | `/api/v1/me/wishlist/:productId` | 소유자 항목만 204, 이미 없어도 204 |
| GET | `/api/v1/me/cart` | `{data:{productIds:string[]},meta:{demo:true}}` |
| POST | `/api/v1/me/cart` | `{productId}`, 신규 201 / 중복 200 |
| DELETE | `/api/v1/me/cart/:productId` | 소유자 항목만 204 |

- URL 쿼리나 요청 본문에서 사용자 ID를 수용하지 않는다. 인증된 세션의 `userId`만 사용한다.
- `lr_user_wishlist`, `lr_user_cart`에 `(actor_id,product_id)` 복합 PK로 중복 방지. 009 마이그레이션은 기존 SQL을 변경하지 않고 `lr_test` 전용으로 실행한다.
- 공개된 시연 상품만 찜 가능. 장바구니는 추가로 활성 STORE 오퍼가 필요. 목록 최대 100개/30개. 동일 계정 행 잠금으로 경합 상태의 초과 저장 방지.
- `Cache-Control: no-store`, POST strict schema, 401 미로그인/422 잘못된 상품 및 입력/409 수량 초과; `demoMode=true`, `NODE_ENV=test`, `DB_NAME=lr_test` 중 하나라도 다르면 501.
- 회원간 기록 공유, 실주소·카드번호·결제정보 수집, 재고 상태 변경, 예약/실주문 확정, ERP/배송 외부 전송은 없다.

## 앱 상태

- Expo Web 로그인 완료 시 테스트 API에서 두 목록을 다시 불러오고, 조회 완료 후 하트·장바구니 수를 표시.
- 추가/제거는 로컬 UI에 즉시 반영하고 서버 저장 요청은 순차 처리한다. 실패 시 오류를 표시하고 계정 기준 서버 목록으로 다시 조회하며, `다시 불러오기`로 재시도한다.
- 브라우저 웹 bearer는 종전처럼 메모리에만 존재한다. 새로고침 이후 자동 로그인을 가장하지 않는다. 다시 로그인하면 기존 계정의 상품 IDs를 재조회한다.
- 로그인/로그아웃·다른 계정으로 전환 시 이전 계정의 개인 목록, 견적 입력, 브라우저 세션 모의 영수는 즉시 비운다. 비로그인/오프라인 시연 목록은 기존 메모리 동작.
- 스토어 checkout은 아직 **결제 없는 로컬 화면**이다. 이번 단계는 장바구니 내용 저장만 구현하며 서버 비금전 STORE 주문 접수는 C4-B 별도.

## 테스트 및 병합 게이트

- API MySQL: 비로그인 401, 계정별 격리, 201→200 중복, STORE 검증/extra field 422, 동시에 여러 요청 시 하나만 저장, production-like 501.
- Mobile: response contract 및 최소 payload, bearer/no-store, 실패 경계, TypeScript/Expo export.
- 브라우저 live Chromium: 실제 테스트 계정 가입/로그인, 찜 추가, 스토어 장바구니 추가, 페이지 다시 열고 재로그인 후 두 목록 복구.
- 추가로 기존 상품 탐색/렌탈 접수/browser offline·API 오류 회귀, npm 보안 인벤토리 검증. **모든 최종 커밋 체크가 성공해야 병합**.
- 실제 운영 정책 POL-01~05, PG·실기기(Android/iOS) 검수와 11건 moderate npm 보안 이슈는 그대로 미완료.

## 후속 범위

C4-B STORE 비금전 주문 접수, C4-C 수선·위탁 실제 테스트 API 화면 연결, C4-D 안전한 상품 미디어/에디토리얼. 원본 분리 저장소 `567890` 불변.
