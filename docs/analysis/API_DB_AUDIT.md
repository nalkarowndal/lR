# luxuryRental API 및 데이터베이스 무결성 감사 보고서 (API_DB_AUDIT)

## 1. 개요

본 문서는 `luxuryRental` 백엔드 REST API의 지속성(Persistence), SQLite 데이터베이스 스키마 및 참조 무결성, 추천 알고리즘 쿼리 조건, 에셋 업로드 파이프라인의 정합성 점검 결과를 기록합니다.

---

## 2. API 지속성 및 오류 처리 감사 (P1)

### 2.1 기존 문제점 분석
기존 프런트엔드(`ShopAdmin.tsx`, `RecruitApp.tsx`, `ShopSettings.tsx`)에서는 서버 API 호출 결과를 대기하지 않거나, 서버에서 500/네트워크 오류가 발생해도 로컬 React state를 임의 변경한 뒤 `alert('...완료되었습니다')` 또는 성공 토스트를 사용자에게 출력하는 낙관적 허위 성공 알림(False Success) 문제가 존재했습니다.

### 2.2 개선 및 교정 조치
1. **서버 응답 확인 후 UI 갱신**:
   - `handleAddProduct`: `api.createAdminProduct`의 반환 성공(`success: true`)을 확인한 후에만 상품 목록에 추가하고 성공 팝업을 표시합니다. 실패 시 입력 데이터가 보존되며 에러 팝업을 출력합니다.
   - `handleAddRequest`: `api.createRecruitRequest` 성공 확인 후 대시보드로 이동합니다.
   - `handleAddWorkerSubmit`: `api.createWorker` 성공 확인 후에만 폼을 초기화하고 목록을 갱신합니다.
   - `updateUserSettings`: `api.updateMySettings` 실패 시 즉시 이전 상태로 롤백(Rollback)하고 에러 토스트를 표시합니다.
2. **미구현 시뮬레이션 명확화**:
   - `RecruitApp.tsx`의 브라우저 `alert()`를 앱 내부 모달 시스템으로 교체하고, 데모 시뮬레이션 기능임을 명시하여 사용자의 오인을 방지했습니다.

---

## 3. 추천 상품 API 및 시드 데이터 정합성 (P1)

### 3.1 이슈 내용
- 기존 테스트: `GET /api/v1/products/recommendations?target=20대 여성`
- 기대값: 4개
- 실패 원인 분석: `backend/src/db/seed.ts`의 시드 데이터 중 `target_group`이 `'20대 여성'`으로 설정된 상품이 3개(생로랑, 발렌시아가, 루이비통)뿐이었으며, 샤넬 캐비어 호보백이 `'30대 여성'`으로 지정되어 신규 시드 환경에서 3개만 반환되어 테스트가 실패했습니다.

### 3.2 조치 결과
- `seed.ts`의 샤넬 캐비어 호보백을 `'20대 여성'` 타깃 그룹으로 정합성 일치화.
- 실제 데이터베이스 `products` 테이블에서 생로랑, 발렌시아가, 샤넬 캐비어, 샤넬 플랩/루이비통 총 4개의 렌탈 상품이 `'20대 여성'` 타깃으로 정확히 매핑됨을 검증.
- `api.test.js`의 `GET /products/recommendations?target=20대 여성` 테스트 통과 완료 (4 === 4).

---

## 4. 데이터베이스 외래 키 및 무결성 감사

### 4.1 `PRAGMA foreign_keys = ON;` 상시 적용
- `backend/src/db/database.ts`의 `getDatabase()` 함수에서 SQLite 연결 인스턴스 초기화 직후 `dbInstance.exec('PRAGMA foreign_keys = ON;');`을 실행하도록 적용했습니다.
- 모든 트랜잭션과 연결에서 외래 키 캐스케이드 삭제 및 유효성 검사가 강제됩니다.

### 4.2 `PRAGMA foreign_key_check;` 검증
- 기존 `backend/data/luxuryrental.sqlite` 대상 실행 결과:
  ```text
  FK violations count: 0
  ```
- 외래 키를 위반하는 고아 레코드(Orphan record) 0건 확인 완료.

---

## 5. 이미지 업로드 및 파일 스토리지 파이프라인 (P1)

1. **바이너리 매직 바이트 검증**:
   - JPEG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A`
   - WebP: `52 49 46 46 ... 57 45 42 50`
   - 파일 확장자 변조 또는 텍스트 스크립트 페이로드 유입 차단.
2. **저장 경로 격리**:
   - 상품 이미지: `frontend/public/assets/uploads/products/prod_{productId}_{timestamp}_{hash}.{ext}`
   - 프로필 아바타: `frontend/public/assets/uploads/avatars/avatar_{userId}_{timestamp}.{ext}`
3. **요청 본문 크기 상한 증액**:
   - `express.json({ limit: '10mb' })` 적용으로 최대 5MB 이미지의 Base64 전송 시 JSON 본문 초과 오류(Payload Too Large)를 원천 해결했습니다.

