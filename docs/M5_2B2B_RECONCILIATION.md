# M5-2B2B — 격리 DB 기반 Toss 이벤트 멱등 기록 및 재대조

**작업 범위:** 테스트 상품/사용자/`lr_test` DB에서만 작동하는 내부 모듈. `NODE_ENV=test`, `DB_NAME=lr_test` 모두 일치해야 함. **실토스 서버 호출·운영 키·실결제 승인/환불/정산/재고 확정·외부 HTTP 라우트 없음.**

## 정합성 전략
- 새 `005_test_toss_reconciliation.sql`: `lr_demo_toss_reconciliation`(논리 상태당 하나의 수신 기록), `lr_demo_toss_payment_claims`(결제키↔주문 1:1 주장), `lr_demo_toss_reconcile_audit`(초기 및 판정 변경 감사).
- `reconcileSignedDemoTossEvent`는 **HMAC raw-body 서명+5분 전송 시각 검사 → 서버 원장 금액 조회 → 주입형 PG 조회·주문/가맹점/결제키/금액/상태 대조 → MySQL 트랜잭션 기록** 순서로 동작.
- `PAYMENT_STATUS_CHANGED`의 `eventId`가 없을 수 있으므로, **논리 상태키는 (주문ID, paymentKey, 공급자 보고 상태)**의 SHA-256 해시로 결정. `transmission-id`는 재전송마다 달라 중복키로 쓰지 않음. 다른 상태는 별도 감사 기록. 이 키는 동일 상태에 대한 독립 이벤트를 하나의 최신 검수 기록으로 모으므로 *모든 개별 전달 원문 보관*이 아니다.
- 같은 논리 상태의 동시 재전송은 **한 레코드 + 증가하는 seen_count + 판정이 변할 때만 감사 로그 1건 추가**. 재시작/타임아웃 뒤에도 DB 기록이 남아 재조회 가능.
- PG lookup 실패·주문/금액/상태 불일치·만료/해제 홀드·같은 주문에 다른 결제 ID·같은 결제 ID의 다른 주문 재사용은 `REVIEW_REQUIRED`. 조회 복구 시 `MATCHED`로 갱신되지만 *지급/예약 승인*이 아니라 읽기 전용 대조 결과일 뿐이다.
- 서명 무효·오래된 전송·모양 불량·미존재 주문은 `REJECTED`하고 데이터베이스에 오염된 수신 기록을 남기지 않는다.
- 잠금 순서는 기존 재고 서비스와 동일하게 inventory unit → order → hold → claim → receipt; MySQL InnoDB 트랜잭션을 사용한다. 실운영 확장 전 교차 주문을 포함한 데드락/장기 재처리 테스트를 추가로 해야 한다.
- **기존 `lr_demo_orders.status`, `lr_inventory_units.physical_state`, `lr_inventory_holds.status`는 어떤 경우에도 UPDATE하지 않는다.** `MATCHED`를 `PAID`나 `CONFIRMED`로 해석하지 않는다.
- 테스트에서 공급자 조회는 주입된 모의 콜백만 사용. **실제 PG 접근과 비밀키 관리·통합 QA는 [Issue #14](https://github.com/nalkarowndal/lR/issues/14) 미완료**.

## 한계와 후속
- 상용 등급의 재처리 워커, 실패 백오프, 결제 부분취소/환불, 여러 이벤트 종류, 영속 이벤트 원문 보관/접근 권한/파기 정책, HTTP 수신과 재전송 확인(200 ACK), PG 실제 샌드박스 조회는 **구현하지 않았다**.
- M5-2 전체 완료 아님. POL-01~05 영업/법률 승인과 실제 PG 시험 계정이 없으며 본 PR로 활성화하지 않음.
- 기존 원본 `567890`, 운영 MySQL, 모바일 UI, 실결제 활성화는 수정하지 않음.
- 원래 개발 로드맵 M5-3/M6를 우선하며 추가 스크린샷 고도화 [Issue #19](https://github.com/nalkarowndal/lR/issues/19)는 후순위.

공식 근거: [토스 웹훅 이벤트](https://docs.tosspayments.com/reference/using-api/webhook-events), [웹훅 재전송 정책](https://docs.tosspayments.com/en/webhooks), [MySQL 잠금 읽기](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html).
