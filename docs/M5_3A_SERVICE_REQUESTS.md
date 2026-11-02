# M5-3A — 수선/위탁 테스트 신청 API 및 ADMIN 역할 검수

## 역할·범위
- 시연 서버 전용 `NODE_ENV=test` + `DB_NAME=lr_test` + `demoMode=true`; 이외에는 기능 HTTP 501. 기존 웹 `567890`와 운영 ERP·MySQL 미접근.
- 기존 `requireAuth` / `requireRole('ADMIN')` 사용; 고객은 자신의 `owner_id`만 조회/취소할 수 있으며 **actor/owner/role을 본문에서 받지 않음**.
- `POST /api/v1/service-requests`: `kind=REPAIR|CONSIGNMENT`, `itemName`, `details`, `Idempotency-Key: UUID` 필수. 서버가 JSON 본문을 정규화, SHA-256 지문과 유니크 제약으로 동시 요청 20건을 하나의 신청으로 기록. 같은 키·다른 본문은 409.
- `GET /api/v1/service-requests`, `GET /api/v1/service-requests/:id`: 본인 소유권 조건을 SQL에 포함. 다른 사용자의 ID는 404.
- `POST /api/v1/service-requests/:id/cancel`: 고객 본인만 `SUBMITTED` 또는 `INFO_REQUESTED` 상태에서 취소. 이후 재시도는 동일 응답이며 감사 기록을 중복 생성하지 않음.
- `GET /api/v1/admin/service-requests`: ADMIN만 전체 신청을 페이지 범위(max50) 내 확인. `PATCH /api/v1/admin/service-requests/:id/status`: ADMIN만 통제된 상태 전이.
- 상태: `SUBMITTED -> UNDER_REVIEW -> INFO_REQUESTED -> UNDER_REVIEW` 또는 `UNDER_REVIEW -> DEMO_CLOSED`; `CANCELED`/`DEMO_CLOSED`는 종료 상태. 고객 취소는 위 조건에서만 가능. 동일 상태 재전송은 읽기만 수행하여 idempotent 반환.
- 감사 이력에는 행위자와 이전/다음 상태만 저장. 사진/민감 신분증/결제·배송정보, 실제 견적·정산/물품 인수는 저장하지 않음.

## 보안·품질 기준
- API1:2023 객체 수준 권한 검증: ID 추측으로 타인 신청을 조회/변경할 수 없어야 함.
- 등록은 401(비로그인), 422(본문/키 부정), 409(멱등 키 충돌), 201/200(최초/재전송).
- 관리자 경로는 401(비로그인), 403(일반 고객), 200(ADMIN); 역할을 DB에서 철회하면 세션 재검증 즉시 반영.
- DB 트랜잭션 내 행 잠금 `FOR UPDATE`와 감사 로그 삽입으로 병렬 요청 간 전이 단 한 번만 발생.
- CI: MySQL 8.4 마이그레이션 + 20중 동시 생성·중복/취소, 소유권/ROLE spoof, 잘못된 전이, 501 운영차단, 기존 API/Expo 회귀.
- **이 패키지는 실제 수선/위탁 신청 서비스 출시에 대한 승인 아님.** 실제 사진 저장 및 사용권/개인정보 약관, 수수료/물류 POL-01~05, 실기기 QA, 관리자 고급 운영 화면·ERP Outbox는 미완료.

기술 근거: [OWASP 객체 수준 권한](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/), [Express 5 비동기 에러](https://expressjs.com/en/guide/error-handling.html).
