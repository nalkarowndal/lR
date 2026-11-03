# M5-2C4-C — 수선·위탁 신청 UI → 기존 서비스 API 연결

2026-11-03 · [PR #44](https://github.com/nalkarowndal/lR/pull/44) · [Issue #41](https://github.com/nalkarowndal/lR/issues/41)

## 변경 범위

기존 M5-3A의 Node 수선·위탁 API와 `lr_test` 데이터베이스를 그대로 재사용하며 **API/DB/결제·재고 스키마 자체는 변경하지 않는다**. 이전에 `/demo-result`로 이동하던 수선 및 3단계 위탁 신청 화면만 **서버에 접수 기록이 실제로 남는 시연 업무 흐름**으로 연결한다.

- `/repair/request`: 테스트 물품명(2~120자), 설명(10~1000자) 작성 → 로그인 상태에서 `REPAIR` 접수. 사진 업로드/접근 권한 요청 없음.
- `/my/consignment`: 브랜드 → 품목 → 테스트 등급/메모. DB에는 `CONSIGNMENT`, `itemName`, `details`로 매핑; **실제 견적·위탁 가격·민감정보 입력 없음**.
- `/service-request-result?requestId=<UUID>`: 서버 소유권 검증 후 진짜 접수번호/시연 상태·내용 재조회, `SUBMITTED` 또는 `INFO_REQUESTED`에서 고객 취소. 이전 신청의 취소도 서버에서 검증.
- `/my/service-requests`: 로그인 계정에 속한 신청만 목록·상세 재조회; 새로고침/새 로그인 후 서버 DB에서 복구. 오류 시 재시도.
- `/my/admin-service-requests`: 관리자 전용 시연 신청 목록, 서버가 허용하는 `SUBMITTED→UNDER_REVIEW→INFO_REQUESTED→UNDER_REVIEW→DEMO_CLOSED` 상태 전이. `CANCELED`·`DEMO_CLOSED`는 수정 불가. ADMIN 권한 검사는 서버가 강제.
- API 미설정의 오프라인 시연에서는 기존 `/demo-result` 유지, 서버 기록 없이 디자인 미리보기로 표시. 실주소/연락처/사진 등 데이터 수집 금지.

## 기존 API 계약 (수정 없음)

| 동작 | 메서드/경로 | 조건 |
|---|---|---|
| 서비스 접수 | `POST /api/v1/service-requests` | 계정 bearer + `Idempotency-Key: UUID`, 본문 `{kind,itemName,details}`, 201/중복 200/재사용 충돌 409 |
| 본인 신청 목록·상세 | `GET /api/v1/service-requests`, `GET /api/v1/service-requests/:id` | 로그인, 소유자가 아닌 경우 404 |
| 본인 취소 | `POST /api/v1/service-requests/:id/cancel` | SUBMITTED/INFO_REQUESTED만 가능, 반복 취소도 멱등 |
| 관리자 목록 | `GET /api/v1/admin/service-requests` | ADMIN만 허용 |
| 관리자 상태 변경 | `PATCH /api/v1/admin/service-requests/:id/status` | ADMIN + 서버 상태머신 및 로그 |

`demoMode=true` + `NODE_ENV=test` + `DB_NAME=lr_test` 외에는 모두 501이며 실제 계약/서비스가 활성화되지 않는다. 요청에 `ownerId`, 역할, 가격, 결제상태, 외부 사진 주소 등을 보내지 않고 서버 응답 `demo=true` 및 `policyVersion=demo-only`를 검증한다. `Idempotency-Key`는 신청 내용이 같을 때 네트워크 재시도를 위한 동일 값이며, 화면의 접수 상태를 성공으로 표시하려면 실제 서버 응답 및 상세 재조회를 받아야 한다.

## 검수

- 모바일 transport: `tests/service-requests.test.mjs`; API 소유권·RBAC/중복/취소 테스트: 기존 `apps/api/tests/service-request-api.test.ts`.
- 실제 Chromium→Express→MySQL: `e2e/m5-service-requests-live.spec.ts` · 360px/390px/768px에서 합성 계정 생성→수선 접수→내역·취소→위탁 접수→재로그인 조회. 기존 렌탈·스토어/찜 API 실 연동 시나리오와 함께 실행.
- 기존 offline 및 API 장애 화면 QA를 회귀로 병행. **최종 SHA의 CI가 모두 통과해야만 병합하며, 이 문서의 기재는 CI 완료를 의미하지 않는다.**

## 경계 및 남은 작업

테스트 DB에 실제 접수 기록/감사 및 *기존의 모의 ERP outbox*는 생성될 수 있지만 **실제 물품 수선·수거·배송, 위탁 계약·판매/정산·견적, 운영 ERP 전달, PG/실결제, 사진/개인정보 업로드는 하지 않는다**. 테스트 계정에서도 실제 고객 개인정보를 사용하지 않는다. C4-D 상품 미디어·에디토리얼 API/권리 검수는 후속, moderate npm 보안 권고와 운영 정책·상용 승인 미완료 유지. Android/iOS 실기기 QA는 웹 포트폴리오 범위에서 SKIPPED.
