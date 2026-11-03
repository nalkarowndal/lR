# M5-2C4-D1 — 에디토리얼 게시 API / 이미지 권리 게이트

작성: 2026-11-03 · [PR #45](https://github.com/nalkarowndal/lR/pull/45) · [추적 #41](https://github.com/nalkarowndal/lR/issues/41) · [사용권 #19](https://github.com/nalkarowndal/lR/issues/19)

## 구현 범위 (실사 사진은 미제공)

본 PR은 **D1: 사용자용 카피/관리자 에디토리얼·권리 없는 이미지 차단의 안전한 기반**이다. 실물/브랜드 사진·파일 업로드 기능은 없음. 사용권 증빙과 승인 CDN이 준비되지 않았으므로 **상품 미디어 0장, 기존 자체 렌더링 합성 일러스트**를 의도적으로 유지한다. #19 / #41의 최종 C4-D 완료로 표시해서는 안 된다.

### 에디토리얼 (격리 `lr_test`에서만)

- `GET /api/v1/editorial/home`: 공개된 홈 배너 문구(`eyebrow/headline/description/ctaLabel/ctaTarget`)와 `revision`만 표시. 초안·관리자 식별자 미포함, `Cache-Control:no-store`.
- `GET /api/v1/admin/editorial/home`: 로그인 후 서버 세션이 검증된 `ADMIN`에게만 `draft,published,revision,publishedRevision` 노출.
- `PUT /api/v1/admin/editorial/home/draft`: `{expectedRevision,copy}` 강제, 단일 행 락과 낙관적 버전 제어, 감사 로그 `DRAFT_EDIT`; **게시 콘텐츠는 이때 변경하지 않음**.
- `POST /api/v1/admin/editorial/home/publish`: `{expectedRevision}`, 초안을 게시 스냅샷으로 원자 전환 + `PUBLISH` 감사 기록. 오래된 버전/미저장 초안 재게시 409.
- 홈은 서버에서 게시한 헤드라인/설명/CTA를 조회하며, API 실패 또는 오프라인이면 **기본 시연 문구라고 명시**하고 디자인을 유지.
- 관리 화면 `/my/admin-editorial`은 문구 입력·4개 내부 CTA 이동 위치만 허용. 임의 URL, HTML, 스크립트, 이미지·업로드 입력/사용자 제공 사진은 422.
- `demoMode=true` + `NODE_ENV=test` + `DB_NAME=lr_test` 이외 API 모두 501. 고객/익명에게 관리자 작업은 401/403. `567890` 원본 운영 웹, 실 DB, PG/재고/배송/ERP 변경 없음.

### 상품 이미지 안전 계약 (권리 미승인 시 차단)

- `lr_demo_product_media`: 상품 ID, 이미지 URL, alt, 표시 순서, `PENDING/APPROVED/REVOKED` 상태, 권리 증빙 참조, 검수자 및 검수일을 보관하는 **테스트 전용 리뷰 레지스트리**. 운영자용 이미지 등록·승인·실물 촬영/업로드 API는 **아직 없음**.
- 상품 목록/상세의 `media` 필드는 항상 존재하지만, 미승인 항목은 `[]`로 반환한다. 실제 노출은 `APPROVED` + 증빙 + 검수자 + 승인일, 서버의 `APPROVED_MEDIA_HOSTS` allowlist, HTTPS, 이미지 확장자, 안전한 alt를 **모두** 통과한 항목에 한정한다. 정렬 순서와 8장 상한 적용.
- React Native 클라이언트도 `EXPO_PUBLIC_MEDIA_HOSTS` allowlist가 없거나 불일치하면 URL을 거부한다. HTTPS가 아닌 URL, SVG, data URI, URL 계정정보·임의 포트·쿼리 토큰·외부 추적 도메인을 거부. 실물 이미지 실패 시 시연 일러스트와 접근성 alt를 유지.
- `GET /api/v1/admin/media-rights`: ADMIN만 상품별 등록/권리 승인 수와 공개 준비 여부를 읽는다. 증빙 문서 원문·검수자 ID는 공개 상품 DTO에 포함되지 않는다.
- **현재 승인된 사진과 승인된 호스트 모두 없음.** CI의 `cdn.example.invalid` + `TEST_FIXTURE_ONLY` 검사는 테스트용 가상 레코드로서 실제 사진 권리를 의미하지 않음.

## 실제 사진 도입 전 별도 승인 조건

사용권자(판매자/위탁자)의 명시적 허락, 상품 ID와 사진 일치, 이용 범위/기간/재배포 및 철회 절차, 증빙 참조 관리, 전면·측면·후면 등 사진 검수, 승인 CDN/보존 정책이 필요하다. 업로드는 [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)의 MIME 내용 검증(헤더 신뢰 금지), 확장자·크기 상한, 격리 스토리지, 악성파일 검사를 준비하기 전까지 비활성.

실제 상품 사진의 승인·호스팅·업로드/이미지 최적화와 기종별 실화면 품질 검수는 [#19](https://github.com/nalkarowndal/lR/issues/19)에 남긴다. Android/iOS 실기기 QA는 사용자 결정으로 SKIPPED (PASS가 아님).

## 테스트

- Node/MySQL `api/tests/editorial-api.test.ts`: 공개 스냅샷과 초안 비공개, 관리자 401/403, 버전 동시성, 편집/게시 감사, 입력 차단, 권한 회수.
- Node/MySQL `api/tests/media-rights-api.test.ts`: 권리·증빙·호스트 게이트, 승인되지 않은 URL 차단, 공개 DTO 정보 누설 차단, 관리자 검토 보고서.
- Mobile `tests/editorial-client.test.mjs` + `tests/api-client.test.mjs`: HTTP 안전/문구 계약, 미디어 허용 출처/alt, 외부 추적·SVG 금지.
- 실 API Chromium `e2e/m5-editorial-live.spec.ts`: 360/390/768px에서 테스트 DB ADMIN 세션 생성→초안 저장(공개 화면 변화 없음)→게시→홈 API 반영→내부 CTA 이동, 미디어 권리 화면. DB 권한 부여는 **CI 내 임시 합성 계정과 로컬 `lr_test` 전용**이고 테스트 종료 시 회수한다.
- 기존 주문/수선·위탁 E2E, 오프라인 49 시나리오와 API 장애 6 시나리오, Expo TypeScript·웹 export를 최종 PR HEAD에서 함께 검증.
