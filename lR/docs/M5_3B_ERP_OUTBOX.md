# M5-3B 테스트 전용 수선·위탁 ERP Outbox

## 범위
이 패키지는 `lr_test` 데이터베이스만 다룬다. **실제 ERP, 레거시 웹 567890, 외부 네트워크, 운영 DB, 고객 실사진, PG를 절대 호출하거나 변경하지 않는다.** 테스트의 `DemoErpTransport`는 호출자가 주입한 mock 함수로만 제공된다. 자동 워커/데몬이나 공개 API 경로를 만들지 않는다.

## 원자성
- `007_test_erp_outbox.sql`: 각 `lr_demo_service_audit.id`마다 단 하나의 Outbox 이벤트 `UNIQUE(audit_id)` 저장.
- 신규 시연 신청 생성 또는 관리자/고객 상태 전이에서 **동일 connection/transaction** 안에 상태 행 + 감사 행 + Outbox 행을 쓴 뒤 한 번에 COMMIT. 오작동 시 세 행 모두 ROLLBACK. 멱등 키 재전송이나 동일 상태 반복에는 새로운 감사/Outbox 이벤트를 만들지 않는다.
- 이벤트 내용은 `eventId`, `auditId`, `requestId`, `actorId`, 업무 종류, 이전/다음 상태, 버전1만. **상품 이름/설명, 이메일, 연락처, 배송지, 이미지, PG 인증정보 없음**.

## 명시적 테스트 워커 (daemon 없음)
- `dispatchOneDemoErpOutbox(db,mockTransport)`: 한 번 호출할 때 가능한 이벤트 하나만 처리한다. DB 제약에서 `NODE_ENV=test` + `DB_NAME=lr_test` 둘 다 만족해야 한다.
- READ COMMITTED + `SELECT ... FOR UPDATE SKIP LOCKED`로 한 번에 한 워커만 수신한 이벤트를 임대하고, **DB에 남는 lease_token + lease_until**을 트랜잭션으로 기록한다. 처리 중인 동일 행의 다른 워커 발송을 억제한다.
- 같은 신청의 이전 `audit_id`가 `DELIVERED` 되지 않았으면 더 높은 상태 전이는 전송하지 않는다. 다른 신청의 이벤트는 각각 처리할 수 있다.
- 최대 3회 호출 실패 후 `DEAD`로 정지, 실패 시 `2^attempt` 초 간격으로 재시도(최대 3600초). 타임아웃 기본 2.5초(임대 기본 10초). 죽은/지연된 워커는 **lease token과 만료 시각**을 모두 일치시켜야 성공 표시할 수 있다.
- 이벤트 수신 측은 `eventId`를 멱등 키로 써야 한다. **적어도 한 번(at-least-once) 전달**이며, 임대 만료 뒤 원격 측 성공/로컬 실패 시 중복 수신 가능하다. 정확히 한 번(exactly-once) 전송 보장 아님.
- 재시도/DEAD은 유한 테스트 단계이며, 인프라/운영 경고 알림과 수동 재처리 승인 기능은 별도 미구현.
- [AWS Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [MySQL InnoDB SKIP LOCKED](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html) 기준.

## 2026-11-02 최종 검증
- [PR #25 — main 병합](https://github.com/nalkarowndal/lR/pull/25)
- [Node/MySQL CI #41409390813](https://github.com/nalkarowndal/lR/actions/runs/41409390813): **102/102 PASS**, Node↔모바일 HTTP **5/5 PASS**, TypeScript 빌드 통과.
- [Expo CI #41409390982](https://github.com/nalkarowndal/lR/actions/runs/41409390982): **25/25 PASS**, Expo 웹 번들/export 통과.
- 초기 워커 테스트 2건은 다른 테스트가 만든 유효 이벤트와 임대 획득 시점에 대한 테스트 조건을 수정(`94b0c310`), 최종 전체 재검증 PASS.
- 시연 Outbox의 at-least-once 보장 경계를 테스트한 것임. 실제 ERP, 프로덕션 승인, 외부 사진/배송/수선 계약/PG는 연결/승인하지 않았음.
- 다음 [M6-0 Issue #26](https://github.com/nalkarowndal/lR/issues/26)에서 lockfile/npm ci 재현성 및 릴리스 보안·QA 수행.

## 검증·미완료
- Node 22 + MySQL 8.4의 `lr_test`에만 테스트. 신규/상태전이 이벤트 1:1, 20중 경쟁 워커와 멱등 재전송, 실패→재시도→복구, 임대 분실·토큰 fencing, 전이 순서, 과금·운영 ERP/API 차단.
- 실제 ERP 전송은 법무/업무 정책 승인 뒤 별도 구현. 인가·Outbox 데이터 파기 정책, 운영 모니터링, 교차 시스템 클라이언트 idempotency, 실제 기기/성능·보안 QA 미실행.
- 스크린샷 UI는 [Issue #19](https://github.com/nalkarowndal/lR/issues/19) 후순위. 결제 승인 미완료 [Issue #14](https://github.com/nalkarowndal/lR/issues/14).
