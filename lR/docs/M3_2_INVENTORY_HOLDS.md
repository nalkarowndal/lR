# M3.2 — 재고 홀드 트랜잭션/동시성 구현

**대상:** [PR #4](https://github.com/nalkarowndal/lR/pull/4) · 코드 범위는 `apps/api/src/holds.ts`와 `lr_test` 테스트 DB 및 QA.

## 이번 변경의 경계

- Node.js + mysql2/promise 기반 **내부(비공개) 재고 홀드 서비스**를 추가했다. `POST /api/v1/rentals`는 아직 501이며, 고객 API에서 이 함수를 호출하지 않는다.
- 기존 상품, 단일 실물/복수 실물, 대여 구간 `[startDate,returnDate)`, SALE 홀드 간 충돌 검사를 수행한다.
- 인벤토리 실물 `SELECT ... FOR UPDATE`와 READ COMMITTED 트랜잭션을 조합해 동일 실물의 재고 배정을 직렬화한다.
- 10분 홀드 만료시간은 **테스트용 임시값**이며 운영 요금·반납·물류 정책이 아니다. 만료된 홀드는 가용성 검사에서 제외하며 새 요청으로 재할당 가능하다.
- `lr_hold_requests(actor_id,idempotency_key)` 고유 키와 요청 해시를 동일 트랜잭션에서 처리해 **동일 사용자·동일 키**의 재시도를 단 한 건의 홀드로 귀결한다. 다른 본문이면 오류.
- `releaseInventoryHold`도 unit-row를 잠근 뒤 상태 변경한다. 단 이 메서드는 **내부에서 검증된 소유자 및 상태 전이 정책을 넣기 전**에는 공개 API로 노출하면 안 된다.
- DB 신규 스키마 `002_test_hold_requests.sql`은 독립 `lr_test`에서만 실행한다. 기존 웹 MySQL은 건드리지 않는다.

## 안전성 전제

1. **모든 쓰기 경로**(홀드·확정 렌탈·판매·수선 재고 차단)가 반드시 같은 InventoryUnit 행을 먼저 잠그고 상태를 확인해야 한다. 개별 경로의 잠금만으로는 보장을 완성할 수 없다.
2. 실제 고객 신원은 검증된 로그인 세션에서만 획득해야 한다. 코드의 `actorId`는 내부 서비스의 인터페이스이며 클라이언트가 넘긴 값을 그대로 사용하면 안 된다.
3. 홀드가 존재한다고 결제가 승인되거나 주문이 확정된 것은 아니다. 운영 결제 전에는 상태머신/PG 확인/웹훅 멱등 처리/감사 로그가 필요하다.
4. MySQL 격리 수준, lock wait, retry, 에러 로그, 홀드 데이터 보존, 타임존과 정책 버전은 운영 데이터 검증 후 확정한다.
5. 테스트가 통과하더라도 **프로덕션 서비스 준비 완료라고 표현할 수 없다**.

## 목표 테스트
- 실물 1개 vs 동시 20건 → 성공 1건
- 실물 2개 vs 동시 20건 → 성공 2건
- 동일 키 20건 재시도 → 동일 hold ID
- 서로 다른 본문에 같은 idempotency key → 거절
- 서로 접하는 `[start,return)` 날짜는 버퍼가 없을 때 공존
- SALE 홀드는 날짜와 무관하게 RENTAL 홀드와 충돌
- 만료/해제 시 재고 복구, 수선 중/기확정 렌탈 우선 차단
- 잘못된 날짜, 잘못된 actor ID 차단

**검수 방법:** GitHub Actions의 별도 MySQL 8.4 `lr_test` 서비스에서 `npm run api:build` 및 `npm run api:test`. 결과가 나오기 전에는 TEST_PASS로 표기하지 않는다.

참고:
- [MySQL 8.4 locking reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)
- [OWASP API1:2023 object-level authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
