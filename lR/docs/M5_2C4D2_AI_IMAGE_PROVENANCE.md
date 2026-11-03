# M5-2C4-D2 — AI 생성 가상 상품 사진 4종/8장, 로컬 갤러리 및 서버 카탈로그

**작성 기준:** 2026-11-03 · [PR #46](https://github.com/nalkarowndal/lR/pull/46) · [C4-D 추적 #41](https://github.com/nalkarowndal/lR/issues/41) · [실물 사진 권리/품질 #19](https://github.com/nalkarowndal/lR/issues/19)

## 사진의 정체 및 권리 경계

이번 이미지 8장은 Adobe Firefly `image_generate`로 제작한 **독자적인 가상 DEMO 디자인** 4종의 대표 컷과, 각 대표 컷을 Adobe `image_crop_and_resize`로 자세히 보여 주는 확대 컷이다. **브랜드 로고·모노그램·특정 회사의 실물 제품·재고·정품 사진이 아니며, 상품 상태·실제 소재·검수 기록을 증빙하지 않는다.** 이미지 2번째 컷은 별도 시점에서 촬영된 실사 사진이 아니라 같은 생성 컷의 확대 변형이다.

[Adobe Firefly FAQ](https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/adobe-firefly-faq.html)는 베타 제한이 없는 Firefly 결과물의 상업 프로젝트 사용을 허용한다. **이 안내는 AI 결과의 저작권 등록/독점적 권리 보유나 타인 디자인권 비침해를 보증하지 않는다.** 이번 파일은 외부 사진을 다운받거나 브랜드 상표를 복제한 것이 아니라 시연용으로 직접 생성했다. 실제 사업에 활용하려면 최종 결과의 시각적 유사성·권리·약관 검토가 별도로 필요하다.

각 자산은 2026-11-03 Adobe Firefly에서 생성했고, JPEG 1024px 전후의 압축 정적 파일로 저장. 모든 미디어가 [GitHub `lR/apps/mobile/assets/catalog`](https://github.com/nalkarowndal/lR/tree/main/lR/apps/mobile/assets/catalog)에 포함되어 링크 소멸/무료 CDN·외부 추적 의존을 피한다. 원본 Adobe 이미지의 단기 URL은 생성 파일 원본 보존이나 영구 CDN 서비스가 아니다.

| DEMO ID | UI 상품명 | 제작 이미지 | 시각 디자인 | 소스 Git blob (대표 / 확대) |
|---|---|---|---|---|
| demo-bag-01 | The Sera Top Handle | front, detail | 분홍색 구조적 탑핸들, 로고 없는 금속 장식 | `c82ae2b2` / `72b5c4ca` |
| demo-bag-02 | The Lune Shoulder Bag | front, detail | 옅은 청색 초승달형 숄더백 | `428609c8` / `6b8e2dc9` |
| demo-bag-03 | The Marais Mini | front, detail | 세이지 그린 미니 플랩 크로스백 | `7cfc9f65` / `572082b4` |
| demo-bag-04 | The Atelier Bucket | front, detail | 토프색 둥근 버킷백 | `2464d02b` / `392f2876` |

### 통합 동작

- 백엔드 `src/generated-demo-media.ts`가 **확정된 상품 ID와 이미지 경로 8개만** 화이트리스트한다. `NODE_ENV=test` + `DB_NAME=lr_test`에서만 `is_demo=1`인 식별된 상품에 별도 AI 생성 미디어를 제공한다. 제3자 사진의 기존 `APPROVED`+권리 증빙+검수자+허용 URL 호스트 확인은 **그대로 유지**한다. 사람 검수 승인을 사칭하여 `lr_demo_product_media`에 가짜 승인/담당자를 등록하지 않는다.
- `seed-test.ts`에서 시연용 4개 제품과 STORE/RENTAL 예시 오퍼 및 격리 테스트 재고를 맞춘다. 대여/구매 접수는 이전 그대로 **서버 기록·미결제 시연 전용**, 실결제·재고 판매 확정 불가.
- 모바일 `domain/generated-media.ts`는 API와 동일한 상품 ID/URL/alt를 선언하고 오프라인 기본 상품에도 이미지 2장을 부여한다. `components/generated-photo-sources.ts`는 정적 `require()`로 JPEG 8개를 Expo Web/Native에 번들링한다. **원격 GitHub 이미지 로딩이나 임의 상품 사진 URL 신뢰에 의존하지 않는다**.
- 기존 일반 외부 미디어 URL은 여전히 `EXPO_PUBLIC_MEDIA_HOSTS`가 허용한 HTTPS 이미지 출처만 통과하고, 임의 `raw.githubusercontent.com` 경로는 차단한다. AI 이미지는 이 프로젝트가 소유한 정확한 8개 URL만 예외 허용하며 제품 ID/alt 일치까지 검증한다.
- 상품 카드: 포트폴리오용 AI 이미지 + “AI 생성 · 실물 아님” 표시. 상세: 2개 썸네일 선택, 확대 모달, alt 및 시연 이미지 안내. 360/390/768/1024px Chromium, 로딩 실패 폴백과 오프라인 환경 QA.
- 관리자: 생성 이미지 수와 실제 사진의 권리 검수 수는 **분리 기록**한다. AI 이미지 수는 사용권 승인된 실물 사진 수를 증가시키지 않는다.

## 유지되는 미완료 범위

이 프로젝트가 **실제 제품 사진 4종의 공급·사진별 사용허가·정품 식별·실배송/재고 검증**을 완료했다는 뜻이 아니다. [Issue #19](https://github.com/nalkarowndal/lR/issues/19)의 실사 사진·정품 인증·이미지 사용권 검증 게이트는 계속 **OPEN**으로 둔다. 업로드/API 관리·다각도 촬영·손상 사진·멀티사이즈 WebP/AVIF·CDN 캐시 철회·실기기 VoiceOver/TalkBack은 별도 범위. 포트폴리오 웹 QA는 Chromium에 한정하며 Android/iOS 실기기 QA는 SKIPPED (PASS 아님).

## CI 수용 기준

- 모든 8개의 실제 JPEG 파일/크기·이름·서명 검사.
- API `brand=DEMO` → 4개 ID, 각 채널 예시 가격 일치, 두 장씩 URL/alt/순서 동일.
- 허용되지 않은 GitHub repo/path/query/실사진 URL 차단, DB 수동 권리 승인/출처 검증 유지.
- 타입·테스트·Expo 웹 export; 실제 Chromium에서 목록 4장 로딩 완료, 대표/확대 전환, 확대 모달 및 닫기, 360/390/768/1024 반응형, 기존 checkout/수선/위탁 라이브 API 회귀.
- GitHub Actions 전체 녹색 전까지 PR draft, 실패 수정 후 동일 SHA의 최종 실행 근거 기록.

## 프롬프트 출처 메모

모든 이미지에는 로고/워터마크/상표·실물 복제를 금지하는 negative prompt를 사용했다. Sera: 분홍색 구조적 가죽 탑핸들/금색 장식. Lune: 연하늘색 반달형 가죽 숄더백/은색 스트랩 부속. Marais: 세이지색 미니 크로스백/플랩·단추. Atelier: 토프색 버킷백/스트랩·조임끈. 상세 컷은 각 대표 컷의 동일 디자인을 확대했다. 이 메타데이터는 **생성 출처 기록이지 실물 촬영/상품 검수 증거가 아니다**.
