# M6-1B5 — Expo SDK 58 native QA preflight & device evidence runbook

> **범위 변경 · 2026-11-03:** [웹 포트폴리오 QA 범위](WEB_PORTFOLIO_QA_SCOPE.md)에 따라 본 문서의 NAT-01~12는 **현재 프로젝트의 필수 단계에서 제외(SKIPPED)** 한다. 과거 준비 문서로 보존하며, 실기기 QA PASS/출시 승인 증거로 사용해서는 안 된다. 추후 Android/iOS 네이티브 배포를 결정할 때만 재개한다.

**상태:** 자동 사전검증과 실제 기기 QA를 분리한다. 2026-11-03 기준 **Android/iOS 실제 기기에서 실행·시각·접근성 테스트를 수행했다는 증거는 없다**. 이 문서는 수행 절차/체크리스트이며 실제 기기 PASS를 의미하지 않는다.

## 1. 기준선과 안전 원칙

- GitHub 소스: `nalkarowndal/lR` 의 `main/lR/`. 원본 웹 `567890` 및 운영 MySQL/실 PG/ERP는 변경하지 않는다.
- Expo SDK `58.0.22`, React Native `0.88.1`, Node.js 22, npm lockfile `lR/package-lock.json`을 유지한다.
- Expo [upstream #52735](https://github.com/expo/expo/issues/52735)의 공식 패치·호환성 여부를 검증하기 전 `glob`/`minimatch` 임의 major override, `npm audit fix --force` 금지. `npm audit` moderate **11**은 현재 미해결이다.
- 상용 출시·실제 예약 확정·PG 승인·배송/환불은 금지. 시연 코드와 테스트용 `lr_test`만 사용한다.
- 모의 결제 동작 시 방문자에게 실제 결제·실제 주문·예약 확정으로 오인될 수 있는 성공 문구를 표시하지 않는다.

## 2. GitHub CI에서 확인 가능한 부분

[Mobile UI checks](https://github.com/nalkarowndal/lR/actions/workflows/mobile-ui.yml)의 `Expo SDK 58 native project preflight` 단계:

```bash
cd lR
npm ci --include=dev --no-audit --no-fund
(cd apps/mobile && npx --yes expo-doctor@latest)
(cd apps/mobile && npx expo install --check)
git diff --exit-code -- package-lock.json package.json apps/mobile/package.json apps/mobile/app.json
npm run typecheck:mobile
npm run test:mobile
npm run build:mobile:web
```

- Expo Doctor는 Expo 구성 스키마, 의존성 중복, 지원 라이브러리, SDK 호환성 등을 *정적* 검사한다. iOS 앱 서명·Android APK 설치·물리 기기·VoiceOver/TalkBack 검증이 아니다.
- iOS/Android **JS 배포 번들** export 및 source-map 검사는 별도 [M6 security workflow](https://github.com/nalkarowndal/lR/actions/workflows/m6-security-audit.yml)에서 실행한다. `source-map` 검사는 native binary E2E와 다르다.
- 앱 구성 오류는 CI에서 실패해야 한다. 경고를 무시하거나 결과를 성공으로 가장하지 않는다.

### 최초 CI 근거 (2026-11-03)

- [Mobile UI checks #41566382082](https://github.com/nalkarowndal/lR/actions/runs/41566382082) — `expo-doctor` **20/20 PASS**, `npx expo install --check` PASS, TypeScript·도메인 테스트 **25/25** 및 Expo 웹 export 성공. 이것은 native preflight만 증명한다.
- 첫 실행에서 app config 불일치 2종(`android.edgeToEdgeEnabled`, `newArchEnabled`)을 순차로 발견해 Expo SDK 58 공식 스키마에 맞게 제거했다. 실제 앱 동작/기기 보안 검증은 여전히 별개다.

## 3. 실제 기기 준비

1. `main`의 정확한 커밋 SHA, 앱 버전 `0.1.0`, Expo 버전, 테스트 날짜를 기록한다. 가능하면 Android 실기기(또는 에뮬레이터) **1개 + iPhone 실기기(또는 macOS iOS Simulator) 1개** 이상 준비한다.
2. 저장소 체크아웃 후 `cd lR && npm ci`. 샘플 모드부터 시작한다. `apps/mobile/.env.local`의 `EXPO_PUBLIC_API_URL`을 **비워둔 상태**에서 `npm run mobile` 실행.
3. 해당 SDK를 지원하는 Expo Go 또는 적절한 개발용 테스트 빌드로 설치·실행한다. SDK 지원 문제는 미해결 QA BLOCKED로 기록한다. Android에서 EAS 내부 배포 APK를 사용할 수 있지만 앱 식별자·서명과 EAS 계정 구성이 선행되어야 한다. iOS 내부 배포는 별도 Apple 서명·기기 등록 등의 조건이 필요하다. **EAS 빌드 자체는 이번 PR에서 실행하지 않는다**.
4. Node API 모드 검증 시 **운영 DB가 아닌 오직 `lr_test`** MySQL과 TEST API만 사용한다. API 생성/마이그레이션은 [API README](../apps/api/README.md)의 격리 조건을 따른다. 환경값은 `apps/mobile/.env.example` 참조.
5. 실제 전화기의 `localhost`는 개발 PC가 아니다. 장치에서 접근 가능한 테스트 API 주소를 사용한다. 특히 계정 로그인/토큰 취급은 **검증된 HTTPS** 주소에서만 시험한다. 임의 공개 터널에 보안 없는 데모 계정/API를 개방하지 않는다.
6. 테스트 계정, 비밀번호, bearer token, 실사용자 개인정보를 GitHub Issue·스크린샷·로그에 업로드하지 않는다. 테스트용 가짜 상품/가짜 계정을 사용한다.

## 4. Device QA 체크리스트 (각 Android/iOS에서 별도 수행)

| ID | 행동 및 검증 포인트 | 기준 |
|---|---|---|
| NAT-01 | API URL 미설정 실행·홈/렌탈/스토어/수선/마이 탭 전환 | 샘플 데이터 모드; 앱 종료/흰 화면/무한 로딩 없음 |
| NAT-02 | 홈 상품→상품 상세→뒤로가기·검색/필터/빈 결과 | 터치·내비게이션·가격/상품 데이터 정합 |
| NAT-03 | 렌탈 시작·반납일 선택, 동기간/역전/경계 날짜 | 반납일 제외 규칙, 잘못된 입력 차단, 견적 일치 |
| NAT-04 | 찜/장바구니·상세 CTA·다른 탭 이동 | 정상 상태 전환; 저장 범위는 현 구현 규칙대로 |
| NAT-05 | 가로폭/노치/하단 제스처/상태바/키보드 | 탭바와 콘텐츠 겹침 없음, 버튼 터치 가능 |
| NAT-06 | 음성 읽기(TalkBack/VoiceOver), 폰트 배율, 명암 | 접근 가능한 이름·순서·초점·보이는 텍스트 검토 |
| NAT-07 | 데이터 연결 끊기/복구, 응답 지연, 뒤로 이동 | 에러·재시도 노출; 잘못된 성공/샘플 폴백 없음 |
| NAT-08 | HTTPS TEST API 연결/검색/상품 상세/가용성/견적 | `lr_test` 데이터 사용; 실패 시 명시적 에러 |
| NAT-09 | HTTPS TEST 계정 로그인·재실행·로그아웃 | `/me`로 인증 확인, native SecureStore, 토큰 미노출 |
| NAT-10 | 잘못된 권한·만료 세션·404/409/422(가능할 경우) | 보호 요청 거부·복구 UX·권한 우회 없음 |
| NAT-11 | 데모 체크아웃/주문 유사 화면 | 실결제/실주문/배송 확정이 발생하지 않고 사실을 알림 |
| NAT-12 | 상품 데이터 중첩·임시 홀드(테스트 전용) | 서버 재고 충돌 시 적절한 오류, 임의 예약 확정 없음 |

**NAT-06 접근성 결과는 실제 기기 사용자가 직접 확인한다.** 브라우저 에뮬레이터, Expo Doctor, TypeScript CI만으로 PASS로 변경하지 않는다. 지원 기기/기능이 없으면 `BLOCKED`로 남기고 누락을 드러낸다.

## 5. 증거 기록 형식

장치별 개별 보고서(민감 정보 제외)를 보관한다. 예를 들어 `QA/M6_1B5/2026-11-03/android/summary.md`, `QA/M6_1B5/2026-11-03/ios/summary.md`처럼 **별도 QA 자료 폴더**에 기록하며, 개인 계정 로그·원본 토큰을 저장소에 커밋하지 않는다.

```text
Target: Android physical / Android emulator / iOS physical / iOS Simulator
Device model / OS version / Display density:
Commit SHA / Expo SDK / Expo Go or build identifier:
API mode: offline sample / isolated lr_test HTTPS
Test ID / PASS | FAIL | BLOCKED / reproduction steps:
Screenshot or recording path (no personal data):
Observed result / expected result / severity / issue or PR:
Tester / observed date-time in Asia/Seoul:
```

- 기능 오류와 스크린샷 이슈는 GitHub Issue로 재현 단계와 비민감 증거만 남기고 수정 PR 및 **동일 기기 재검증** 후 닫는다.
- **Gate 판정:** 자동 CI PASS는 `nativePreflight=PASS`일 뿐이다. Android/iOS 각각의 실행·시각·접근성 증거 없이 `realDeviceQA=PASS` 처리 금지.
- 다음 승인 단계는 [Issue #14](https://github.com/nalkarowndal/lR/issues/14)의 렌탈 기간·보증금·취소·배송·실 PG 정책이다. **사업자/정책 담당의 실제 승인·PG 계약·테스트 키가 제공되지 않으면 승인 상태를 추정하거나 대신 서명하지 않는다**.

관련: [Issue #10](https://github.com/nalkarowndal/lR/issues/10), [M4-N 브라우저 QA](M4N_WEB_QA.md), [프로젝트 상태](PROJECT_STATUS.md), [Expo Doctor](https://docs.expo.dev/develop/tools/#expo-doctor), [Expo 내부 배포](https://docs.expo.dev/build/internal-distribution/).
