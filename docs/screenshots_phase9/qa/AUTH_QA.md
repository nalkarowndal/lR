# luxuryRental 회원 인증 QA 검증 보고서 (AUTH_QA)

## 1. 개요

본 문서는 `luxuryRental` 서비스의 회원가입, 로그인, 세션 유지, 비밀번호 복구 및 관리자 권한 제어에 대한 자동화 및 기능 검증 결과입니다.

---

## 2. 테스트 케이스 및 검증 매트릭스

| 번호 | 테스트 시나리오 | 테스트 입력값 | 기대 결과 | 실제 결과 | 판정 |
|:---:|:---|:---|:---|:---|:---:|
| TC-AUTH-01 | 신규 정상 회원가입 | `newuser@test.com`, `Password123!`, 이름 `신규고객`, 필수 약관 동의 `true` | HTTP 201 Created, 유효한 세션 토큰 및 유저 객체 반환 | 201 반환, 토큰 발급 및 `users` 테이블 저장 확인 | **PASS** |
| TC-AUTH-02 | 이메일 중복 가입 방지 | 기존 등록 이메일 `customer@luxuryrental.com` | HTTP 409 Conflict, "이미 등록된 이메일..." 에러 반환 | 409 반환, 중복 계정 생성 차단 확인 | **PASS** |
| TC-AUTH-03 | 비밀번호 길이 유효성 | `short` (6자 미만) | HTTP 400 Bad Request, Zod 유효성 에러 | 400 반환, 클라이언트 및 서버 이중 방어 | **PASS** |
| TC-AUTH-04 | 잘못된 비밀번호 로그인 | `admin@luxuryrental.com`, `wrong_password` | HTTP 401 Unauthorized, "이메일 또는 비밀번호가..." | 401 반환, 인증 실패 메시지 노출 | **PASS** |
| TC-AUTH-05 | 관리자 정상 로그인 | `admin@luxuryrental.com`, `admin1234!` | HTTP 200 OK, `role: 'ADMIN'` 및 세션 토큰 반환 | 200 반환, 관리자 권한 확인 | **PASS** |
| TC-AUTH-06 | 일반 고객 정상 로그인 | `customer@luxuryrental.com`, `luxury1234!` | HTTP 200 OK, `role: 'USER'` 및 세션 토큰 반환 | 200 반환, 고객 권한 확인 | **PASS** |
| TC-AUTH-07 | 현재 세션 사용자 조회 | `Authorization: Bearer <token>` | HTTP 200 OK, 토큰 소유자 프로필 반환 | 200 반환, 세션 복원 완료 | **PASS** |
| TC-AUTH-08 | 비밀번호 재설정 토큰 발급 | `POST /auth/forgot-password` (`customer@luxuryrental.com`) | HTTP 200 OK, 일회용 1시간 만료 토큰 생성 | 200 반환, `password_reset_tokens` 저장 확인 | **PASS** |
| TC-AUTH-09 | 새 비밀번호 변경 적용 | 유효 토큰 + `newLuxuryPassword999!` | HTTP 200 OK, 기존 세션 전부 삭제 및 비밀번호 업데이트 | 200 반환, 변경된 비밀번호로 로그인 성공 확인 | **PASS** |
| TC-AUTH-10 | 이미 사용된 토큰 재사용 차단 | 사용 완료된 토큰으로 재시도 | HTTP 400 Bad Request ("만료되었거나 이미 사용된...") | 400 반환, 재생 공격(Replay Attack) 차단 | **PASS** |
| TC-AUTH-11 | 비인가 관리자 API 접근 차단 | 토큰 없이 `GET /admin/products` 호출 | HTTP 403 Forbidden | 403 차단 확인 | **PASS** |
| TC-AUTH-12 | 일반 고객의 관리자 API 접근 차단 | `role: 'USER'` 토큰으로 `GET /admin/products` 호출 | HTTP 403 Forbidden | 403 차단 확인 | **PASS** |

---

## 3. 결론

모든 인증 및 인가 시나리오 12건이 100% 통과하였으며, 클라이언트 헤더 스푸핑 취약점이 완전히 제거되고 안전한 서버 측 세션 인가 체계가 확립되었습니다.

