# luxuryRental M1 — 설계 결정 기록 (ADR)
**기준일:** 2026-11-02 · **상태:** 기술/기획 기준선 v1.0. 사용자 확정: 저장소 lR 및 Node.js 백엔드. 나머지 항목은 개발을 위한 **권장 설계 선택**으로 기록하며 정책·실데이터 승인과 구별한다.
**증거:** [M0 소스 실사](SOURCE_AUDIT.md), [기능 대응표](FEATURE_MATRIX.md).

| ADR | 결정 | 근거 | 변경 조건 |
|---|---|---|---|
| 001 | [lR](https://github.com/nalkarowndal/lR) 전용 신규 앱 저장소; 기존 웹 변경 금지 | 사용자 지정 | 사용자 요청 |
| 002 | Node.js + TypeScript + Express 5 (기준선) | 사용자가 Node.js 지정, 기존 웹 Express 5 | 실행 QA 후 주요 문제 확인 |
| 003 | **MySQL을 신규 API 초기 DB 선택**; 초기 mysql2 기반, Prisma ORM 선택사항 | [567890](https://github.com/nalkarowndal/567890)의 현재 `products` MySQL 및 Node/Express와 호환. 실제 운영 DB 미검증 | 운영 스키마 및 이전/운영 조건 승인 시 PostgreSQL 비교 |
| 004 | React Native + Expo + TypeScript / Expo Router | 신규 Android/iOS 앱 필요, 디자인·도메인 분리 | 네이티브 모듈 필요가 아키텍처와 충돌할 때 |
| 005 | REST `/api/v1`; 데이터·인증·결제는 서버 권위 | 기존 앱/웹 공유, API 버전 호환 | API 게이트 및 계약 검토 |
| 006 | MySQL `Product`는 마케팅 상품, `InventoryUnit`은 고유 실물. 대여/구매 모두 실물을 참조 | 중복 예약/판매 방지 | 아이템 유형별 대여정책 재설계 |
| 007 | 달력 날짜는 Asia/Seoul의 `YYYY-MM-DD`; 대여 구간 **[startDate, returnDate)**, 후자는 제외 | 반납일과 일수 모순 방지; 예: 11/10~11/13=3일 | 정책 동의 필요(현재 참고 스타터는 양 끝 포함) |
| 008 | 물류·검수 버퍼는 상품/배송정책 설정값, 임의 1일 상수 사용 금지; 예약 blocking interval 별도 계산 | 지역/주말/상품 상태에 따라 달라짐 | 운영 정책 확정 |
| 009 | 선결제 없는 판매완료 처리 금지. `InventoryHold` TTL → 주문/결제 대기 → 서버 결제 승인 → 재고 확정. 테스트 결제도 별도 표기 | 참조 스타터는 미과금 주문 즉시 sold 처리 | PG 연동 검증 |
| 010 | 내 상품 위탁 판매 `ShopSell` 유지, 고객 마이의 하위 플로우로 접근 | 기존 기능 보존 | UX 테스트 결과 |
| 011 | `RecruitApp`은 채용 공고가 아닌 매장 인력 운영. 관리자 웹의 독립 선택 모듈로 유지, 고객 하단 탭에서 제외 | M0 소스 직접 검증 | 본사 운영범위 재결정 |
| 012 | 수선/복원과 회원 마이페이지는 실제 구현 P0. 원본 `RepairPage/MyPage`는 빈 Stub | 요구사항 핵심, M0 확인 | 범위 변경 승인 |
| 013 | 찜은 고객 로그인 연계 데이터로 유지; 헤더/마이에서 접근 | 기존 5탭을 렌탈/수선 중심으로 재배치 | M2 UX 검수 |
| 014 | CMS·관리자 ERP는 기존 웹 UX를 참고하지만 서버 역할 검증을 필수화 | 기존 UI 접근은 클라이언트 상태 | 보안 게이트 |
| 015 | 에셋은 권리 확인된 사진만. 정품·품질 등급 주장은 검수 근거가 있는 상품에 한함 | 데모 SVG 및 이전 마케팅 문구 구별 | 검수·저작권 승인 |
| 016 | 돈은 KRW 정수(원) 및 부호/환불 기록 분리, 날짜/타임스탬프는 구분 저장 | 금액 변조·부동소수·시간대 오류 방지 | 해외통화 요구가 생길 때 |

## 미승인 운영 정책 (기술설계를 막지 않는 파라미터)
- **POL-01:** 상품별 최소/최대 렌탈 일수, 연장 가능 여부, 요금 할인 계단.
- **POL-02:** 렌탈과 구매 간 전환, 보증금 승인/청구/환불 방법, 보험·파손/연체.
- **POL-03:** 취소·부분 환불, 배송비·반품비·영업일, 주말/공휴일 처리, 도서산간.
- **POL-04:** 판매 위탁 시 감정·수수료·정산, 수선 견적 승인·파손 책임, 회원탈퇴/데이터 보관.
- **POL-05:** 소셜 로그인 공급자 계약, 전자상거래·개인정보 문구, PG/택배 사업자 선택.
이 값들은 `PolicyVersion`/관리자 설정 또는 버전이 있는 정책 코드로 관리하고 서버에서 최종 적용한다. **미결 상태를 임의의 실제 사업 정책으로 표시하지 않는다.**

## M1 산출물 상호 참조
- [요구사항](REQUIREMENTS.md) → [화면 IA](INFORMATION_ARCHITECTURE.md) → [사용자 플로우](USER_FLOWS.md) → [데이터 모델](DATA_MODEL.md) → [API 계약](API_CONTRACT.md) → [검수 기준](ACCEPTANCE_TESTS.md).
- 모든 문서는 **구현 전 설계**다. `/api/v1/*` 경로는 현재 작동하는 서비스 URL이 아니다.

## 라이브 데이터에 대한 원칙
기존 `567890/backend/scripts/init-db.js`는 `products(id,title,brand,type,price,created_at)` 테이블 생성만 직접 확인되었다. M1 모델은 이 스키마를 덮어쓰는 마이그레이션 파일이 아니며, 운영 DB 테이블 실존 여부/데이터/외래키가 확인되지 않았다. 실제 DB 연결·DDL 실행·데이터 삭제는 금지한다. 과거 보고서의 다른 Prisma/SQLite 모델을 현재 원본으로 착각하지 않는다.

공식 근거: [MySQL InnoDB locking reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html), [Prisma 기존 MySQL 데이터 도입](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/mysql), [Expo Router](https://docs.expo.dev/router/introduction/), [토스페이먼츠 서버 검증](https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference).
