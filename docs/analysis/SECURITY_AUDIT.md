# luxuryRental 보안 감사 및 개선 보고서 (SECURITY_AUDIT)

## 1. 보안 개요

본 문서는 `luxuryRental` 시스템의 인증, 인가, 데이터베이스 무결성, 개인정보 보호(P0), API 통신 및 에셋 업로드 전반에 걸친 보안 점검 결과와 조치 사항을 체계적으로 기술합니다.

---

## 2. 식별된 보안 취약점 및 개선 완료 내역

| 번호 | 취약점 항목 | 심각도 | 기존 문제점 및 위험도 | 적용된 보안 조치 및 해결 상태 |
|:---:|:---|:---:|:---|:---|
| **SEC-01** | **판매 신청 목록 공개 노출 (P0)** | **Critical** | `GET /api/v1/sell-requests`가 비인증 상태로 전체 판매 신청자 및 브랜드 목록을 전면 반환 | `authenticate` 미들웨어 적용: 비인증 요청 401 차단, 일반 사용자는 본인 신청 건만 반환, 관리자 전용 `GET /api/v1/admin/sell-requests` 분리 (해결 완료) |
| **SEC-02** | **동명이인 데이터 혼합 및 IDOR (P0)** | **Critical** | `WHERE user_id = ? OR user_name = ?` 쿼리로 인해 동명이인 간 타인 판매 신청 내역 열람 위험 | 이름 기반 조회 완전 제거, 오직 세션에서 검증된 `user_id = ?`로만 격리 조회. 타인 데이터 접근 원천 차단 (해결 완료) |
| **SEC-03** | **SQLite 외래 키 제약조건 비활성화** | **High** | SQLite 기본 연결에서 외래 키 검사가 비활성화되어 고아 레코드 발생 가능 | DB 인스턴스 초기화 시 `PRAGMA foreign_keys = ON;` 상시 강제 활성화 및 `PRAGMA foreign_key_check;` 0건 무결성 검증 (해결 완료) |
| **SEC-04** | **관리자 권한 헤더 스푸핑 차단** | **Critical** | 클라이언트 임의 헤더(`x-user-role`) 기반 권한 부여 위험 | 클라이언트 헤더 신뢰 제거, DB 세션 토큰 검증 및 `role === 'ADMIN'` 사용자만 인가 (해결 완료) |
| **SEC-05** | **오류 정보 및 SQL 스택 노출** | **Medium** | 500 오류 응답 시 DB 내부 에러 메시지 노출 위험 | 중앙 집중 에러 핸들러에서 SQL/SQLite/문법 에러 감지 시 표준 안전 메시지로 마스킹 (해결 완료) |
| **SEC-06** | **비밀번호 단방향 암호화** | **Critical** | 비밀번호 평문 저장 위험 | Node.js `node:crypto`의 강력한 `scrypt` 알고리즘 및 16바이트 솔트 기반 해싱 적용 (해결 완료) |
| **SEC-07** | **세션 만료 및 단일 세션 무효화** | **Medium** | 세션 토큰 재사용 위험 | SQLite `sessions` 테이블에 `expires_at` (기본 7일) 설정 및 비밀번호 변경 시 전체 세션 일괄 폐기 (해결 완료) |
| **SEC-08** | **비밀번호 재설정 일회용 토큰** | **High** | 계정 탈취 위험 | 32바이트 보안 난수 토큰 생성, 1시간 유효기간, 1회 사용 즉시 폐기(`used = 1`), 세션 자동 초기화 (해결 완료) |
| **SEC-09** | **실제 이미지 업로드 매직 바이트 검증** | **High** | 확장자만 검사하는 경우 웹셸 등 악성 파일 업로드 위험 | 버퍼 헤더의 매직 바이트(JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `52 49 46 46...`) 실시간 검증 및 5MB 크기 제한 적용 (해결 완료) |
| **SEC-10** | **입력값 스키마 검증 및 SQL 인젝션 방어** | **High** | 비정상 요청 파라미터 유입 위험 | Zod 런타임 스키마 적용 및 `node:sqlite` Prepared Statement 바인딩으로 SQL 인젝션 원천 차단 (해결 완료) |

---

## 3. 개인정보 보호 및 접근 통제 구조 (P0)

```text
[HTTP Request: GET /api/v1/sell-requests]
       │
       ▼
[authenticate Middleware]
  ├── Bearer 토큰 없음 ─────────► [401 Unauthorized: "로그인이 필요한 서비스입니다."]
  └── 유효한 토큰 확인 ─────────► req.user 객체 주입
                                         │
                                         ▼
                     [Role 기반 접근 제어 분기]
                     ├── role === 'ADMIN'
                     │     └── SELECT s.*, u.email, u.phone FROM sell_requests s ...
                     │           (관리자 전용 연락처/신청내역 반환)
                     │
                     └── role === 'USER'
                           └── SELECT id, brand_name, status, created_at 
                               FROM sell_requests WHERE user_id = ?
                                 (본인 데이터만 제한된 필드로 반환, 타인 정보 노출 없음)
```

---

## 4. 데이터베이스 참조 무결성 점검 결과

- **외래 키 활성화**: `PRAGMA foreign_keys = ON;` (모든 DatabaseSync 인스턴스 생성 시 실행)
- **무결성 점검 실행**: `PRAGMA foreign_key_check;`
- **점검 결과**: **0건 (외래 키 위반 레코드 없음, 참조 무결성 100% 충족)**
- **주요 관계**:
  - `sessions` → `users.id` (ON DELETE CASCADE)
  - `password_reset_tokens` → `users.id` (ON DELETE CASCADE)
  - `product_images` → `products.id` (ON DELETE CASCADE)
  - `user_settings` → `users.id` (ON DELETE CASCADE)
  - `favorites` → `users.id`, `products.id` (ON DELETE CASCADE)
  - `user_consents` → `users.id` (ON DELETE CASCADE)

---

## 5. 보안 회귀 테스트 결과

Node.js 내장 테스트 러너(`node --test`)를 통해 전체 46개 테스트 케이스 실행 및 100% 통과 검증:
1. `GET /sell-requests` 비인증 호출 시 401 차단 통과
2. `GET /admin/sell-requests` 일반 회원 호출 시 403 차단 통과
3. `GET /admin/sell-requests` 관리자 인증 시 200 통과
4. 동일한 이름('김명품')을 가진 사용자 A와 사용자 B 간의 판매 신청 내역 상호 조회 차단(IDOR 방어) 검증 통과
5. 프로필 이미지 업로드 매직 바이트 검증 및 악성 페이로드 400 차단 통과
