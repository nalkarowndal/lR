# M6-1B — Expo SDK 58 전이 의존성 권고 분류 및 수정 게이트

작성 기준: 2026-11-03, `main/lR/` 프로젝트 기준, Issue #30. **릴리스 보안 승인 아님.**

경로 규칙: GitHub 저장소 루트는 CI 워크플로 경로용이며, 코드·패키지·문서는 `lR/` 아래에 존재한다. `npm ci`, `npm audit`, `npx expo` 명령은 `cd lR` 후 실행한다. `.github/workflows/`는 저장소 루트에 남고 `working-directory: lR`를 설정한다.

## 1. 확인된 범위와 실제 잠금 파일

- Node 22 / npm 10 workspace, package-lock.json v3, Expo 58.0.22, React Native 0.88.1, React 19.3.0.
- 설치 버전: glob **13.0.6**; minimatch **10.2.6**.
- 다음 Expo 빌드 도구가 glob ^13.0.0을 요구한다: @expo/cli 58.1.18, @expo/config 58.0.10, @expo/config-plugins 58.0.11, @expo/fingerprint 0.21.8, @expo/metro-config 58.0.20.
- @expo/fingerprint 0.21.8은 minimatch ^10.2.2도 직접 요구한다. glob 13.0.6 역시 minimatch ^10.2.2를 요구한다.
- [M6-1A 감사 CI](https://github.com/nalkarowndal/lR/actions/runs/41412864760)에서는 운영/전체 의존성 모두 critical 0 / high 0 / moderate **11** / low 0이었다. 11개는 영향 **패키지** 수이며 서로 다른 CVE 11개라는 뜻이 아니다.

## 2. 공개 권고 및 호환성 위험

| 패키지 | 확인된 공개 보안 권고 | 확인된 수정 릴리스 | 현재 설치 |
| --- | --- | --- | --- |
| glob | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), 취소 이후 파일 탐색 | 14.0.2 이상 | 13.0.6 |
| minimatch | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), globparts 패턴 증폭/DoS | 11.0.1 이상 | 10.2.6 |

[Expo 상위 프로젝트 이슈 #52735](https://github.com/expo/expo/issues/52735)는 Expo SDK 58의 glob ^13 및 minimatch ^10 버전 제약을 보고한다. 2026-11-03 확인 시 해당 이슈는 열려 있으며 공식적으로 SDK 58 패치 배포와 본 프로젝트의 호환성 테스트 결과는 확인되지 않았다. Expo 유지관리자 댓글(2026-11-02)은 이 라이브러리들이 개발 시 도구에서 실행되고 사용자 앱 번들로 들어가지 않으며, 이 문제를 낮은 우선순위로 판단한다고 설명했다. 이는 *상위 프로젝트의 의견*이고, 본 프로젝트 자체의 번들·입력 노출 검증 증거는 아니다. [원본 이슈 및 유지관리자 댓글](https://github.com/expo/expo/issues/52735) 위 표는 **공개 권고 기준**이며 실제 npm audit 원시 JSON에서 발견한 모든 권고 ID의 최종 목록으로 간주하지 않는다.

- 현 상태에서 같은 major 범위 내 npm update만으로 두 권고를 제거할 수 있다는 근거가 없다.
- glob 14, minimatch 11은 의존 범위를 넘어가는 major 변경이다. 빌드 도구 및 glob 매칭 동작, Expo 호환성을 확인하지 않고 npm overrides 또는 npm audit fix --force를 적용하지 않는다.
- Expo 공식 CLI의 npx expo install --check는 호환 버전 검사용이며, npx expo install --fix는 호환되지 않는 **직접** Expo 의존성 수정용이다. 이들 명령이 상위 Expo 패키지의 전이 의존성 문제를 자동 해결한다는 보장은 없다.
- [Expo CLI 문서](https://docs.expo.dev/more/expo-cli/)

## 3. 추가한 검증 기능

- `lR/scripts/security/audit-triage-lib.mjs` — npm audit 성공/오류를 엄격히 구분하여 lockfile의 영향받는 패키지별 설치 경로·정확한 버전, 상위 선언 버전 범위, npm via 패키지, GHSA ID를 추출한다. npm 데이터가 없는 경우에도 증거 부족을 표시한다.
- `lR/scripts/security/audit-triage.mjs` — production 및 all의 별도 JSON/Markdown 출력; GitHub CI 요약에 반영.
- `lR/scripts/security/audit-triage-lib.test.mjs` — 정상 버전/권고 분류, 레지스트리 오류 fail-closed, 잘못된 패키지명/범위 입력, lockfile 누락 경로 검사.
- .github/workflows/m6-security-audit.yml — 매 PR 보안 인벤토리에 triage 증거 파일 생성 추가. 기존 npm audit 원본 JSON과 보고서가 같이 업로드된다.

**주의:** lockfile에 존재하거나 npm audit --omit=dev에 포함되어도 모바일 실제 JS 번들 또는 외부 사용자 입력에 노출되었다는 증거는 아니다. 따라서 triage 출력은 runtimeExposure=NOT_ESTABLISHED 및 releaseApproved=false를 유지한다. 도구 실행 경로에서 외부 업로드/악성 glob 패턴 노출 여부, 실제 번들 포함 여부는 별도 검수한다.

## 4. 병합·출시 게이트

1. npm ci, Node/MySQL API **106+**, HTTP **5+**, Expo 테스트 **25+**, Expo TypeScript 및 web export, Chromium **40+** 성공 기록.
2. 감사 CI의 실제 advisory IDs 및 영향 경로가 triage.json/triage.md에 출력되는지 확인. 기존 11 moderate와 비교하고 추가 심각도/발견을 빠짐없이 기록.
3. 공식 수정 패치가 나오면 Expo 58/React Native 0.88.1 범위 유지 여부를 검증하고 별도 최소 변경 PR을 생성해 npm audit 및 모든 CI를 다시 검증한다.
4. 권고가 해소되지 않으면 보류 사유와 노출 검토 결과를 Issue #30에 남기고 **출시 차단을 유지**한다.
5. Android/iOS 실기기 검수 Issue #10, POL-01~05 및 실제 PG 승인 Issue #14, 마지막 UI 개선 Issue #19는 별도 게이트. 운영 MySQL·실 PG·실 ERP·원본 luxuryRental 웹 567890을 변경하지 않는다.

**이 PR 범위:** 증거 자동화 및 문서화. 위험한 메이저 강제 업그레이드나 운영 기능 활성화는 포함하지 않는다.

## 5. M6-1B2 — iOS 배포 JS 소스맵 기반 범위 확인 (2026-11-03)

- Expo SDK 58 공식 `expo export --platform ios --source-maps --no-bytecode`로 iOS **배포용 JS**를 CI에서 별도 export한다. **네이티브 앱 빌드/실기기 QA는 아님.**
- `lR/scripts/security/native-bundle-surface.mjs`가 생성된 `.map`의 `sources` 경로에 포함된 `glob`, `minimatch` 및 관련 Expo CLI/config 빌드 도구를 검사한다. 중첩 node_modules 및 Windows 경로도 지원하고 원본 코드와 전체 경로는 저장하지 않는다.
- `@expo/cli/build/metro-require/require.js`는 Expo 런타임 로더로 구분한다. 다른 CLI 모듈은 검토 대상으로 남긴다.
- 소스맵 누락·손상·빈 sources는 **검사 실패**; 관련 패키지 경로 발견도 **검토가 필요한 실패**로 처리한다.
- `lR/security-reports/native-bundle-surface.json` 및 `.md`에는 수량/패키지만 저장하고 **소스맵 원본은 아티팩트로 업로드하지 않는다**. 결과는 `releaseApproved:false`로 유지한다.
- **판정 한계:** iOS JS 소스맵에 나타나지 않았다고 해서 안드로이드·웹·네이티브 바이너리·업데이트 번들·외부 입력 공격 표면 전체가 안전하다고 증명되는 것은 아니다.
- [Expo 공식 번들 분석 문서](https://docs.expo.dev/guides/analyzing-bundles/)에 근거. Expo 유지관리자는 [upstream 이슈](https://github.com/expo/expo/issues/52735)에서 빌드 도구 쪽 권고라고 설명했으나 본 프로젝트의 iOS 증거와 분리해서 기록한다.

## 6. M6-1B3 — Android 배포 JavaScript 보안 범위·Expo SDK 호환성 (2026-11-03)

- [PR #34](https://github.com/nalkarowndal/lR/pull/34)에서 기존 iOS 검사기에 Android 플랫폼 인식·형식 오류·대상 구분 회귀 테스트를 추가했다. 검사기는 `platform='ios'|'android'`만 허용하며 다른 대상은 `INVALID_PLATFORM`으로 종료한다.
- [보안 CI #41559865818](https://github.com/nalkarowndal/lR/actions/runs/41559865818): Node 보안 파서+소스맵 **16/16 PASS**, `npx expo install --check` 통과 및 원본 manifest/lockfile 변경 없음. 실제 Expo SDK58 iOS/Android 배포 JS를 각각 `--source-maps --no-bytecode`로 생성하여 검사한다.
- 동일 CI의 **iOS 1개 소스맵/1,215 sources**, **Android 1개 소스맵/1,209 sources**에서 추적 중인 `glob`·`minimatch`·Expo 빌드 전용 패키지 모듈 **각 0건**. 이는 검사한 소스맵의 모듈 이름 검사 결과로, 네이티브 바이너리·실기기 보안 검증이 아니다.
- [모바일 CI #41559865778](https://github.com/nalkarowndal/lR/actions/runs/41559865778): 타입 검사·도메인 25/25·Expo 웹 번들 통과. 이전의 MySQL/API 106/106·실HTTP 5/5·Chromium 40/40은 이번 PR 재실행 결과가 아님.
- iOS와 Android의 원본 소스맵·생성 JS는 `lR/apps/mobile/dist/` 아래에서 생성되며 아티팩트에 포함하지 않는다. `lR/security-reports/`에 패키지 이름·모듈 수량만 별도로 기록한다.
- SDK 58의 공식 수정이 npm으로 배포되지 않았으므로 `glob 13.0.6`·`minimatch 10.2.6` 잠금 유지; npm audit **moderate 11** 잔존. 확인 기준 [Expo #52735](https://github.com/expo/expo/issues/52735) 및 [Expo GitHub Releases](https://github.com/expo/expo/releases). 강제 메이저 올림·`npm audit fix --force` 금지.
- **남은 단계:** SDK58 의존성 패치가 공식 릴리스되면 최소 업데이트/회귀 검증. 웹 번들·OTA·네이티브 바이너리/실기기·외부 입력 경로 검증, [Issue #10](https://github.com/nalkarowndal/lR/issues/10) 및 [Issue #14](https://github.com/nalkarowndal/lR/issues/14) 이행 전까지 출시 불가. 관리자 ERP·실 PG·운영 DB에 손대지 않음.

## 7. M6-1B4 — Expo 웹 배포용 JS 보안 검사 (2026-11-03)

- [PR #35](https://github.com/nalkarowndal/lR/pull/35): 기존 iOS·Android 검사기에 `web`을 추가하고 플랫폼별 판정·누락/손상 소스맵 실패·인덱스형 소스맵 취약 패키지 탐지를 검증한다. `ios`/`android`/`web` 외 플랫폼은 거부한다.
- [보안 CI #41563342668](https://github.com/nalkarowndal/lR/actions/runs/41563342668) **PASS**: 보안 테스트 **19/19**, `npx expo install --check` 성공, 웹 배포 JS를 `expo export --platform web --source-maps --output-dir dist/security-web`로 생성했다.
- **실측:** iOS **1개 map / 1,215 source entries**, Android **1개 / 1,209**, 웹 **22개 / 858**를 검사했다. 추적하는 `glob`, `minimatch`, Expo 빌드 도구의 `node_modules` 패키지 경로는 각 플랫폼 **0건**이었다.
- [모바일 CI #41563342730](https://github.com/nalkarowndal/lR/actions/runs/41563342730) **PASS**: TypeScript·모바일 테스트·웹 번들 빌드. 이번 PR에서 API/MySQL 및 Chromium 브라우저 QA를 신규 실행한 결과는 아니다.
- 소스맵 원본과 JS 번들은 아티팩트에 올리지 않는다. `lR/security-reports/native-bundle-surface-{ios,android,web}.{json,md}`로 요약 수치·패키지명만 저장한다. `releaseApproved:false`는 유지한다.
- **검증 한계:** 생성한 프로덕션 웹/iOS/Android JS 출력물의 *source-map에 표기된 모듈 목록*만 검사한다. 실제 런타임 실행·외부 입력 경로·OTA·네이티브 바이너리·기기 취약성·서버 API 보안까지 입증하지 않는다.
- 공식 Expo 릴리스의 [`expo@58.0.22`](https://github.com/expo/expo/releases/tag/expo%4058.0.22)는 2026-10-31 게시되었고, [upstream #52735](https://github.com/expo/expo/issues/52735)는 2026-11-03 확인 기준 **열림** 상태였다. 본 프로젝트의 lockfile은 바꾸지 않았으며 npm audit production/all **moderate 11**개 영향 패키지가 남아 있다. 강제 overrides/major 업그레이드를 하지 않는다.
- **다음 우선순위:** Expo SDK58 패치 발행 시 실제 설치 버전과 `npm audit` 영향 검증, 최소 의존성 변경, 전체 API/MySQL·Chromium·Expo/보안 CI 재검증. 실제 Android/iOS 기기 QA([Issue #10](https://github.com/nalkarowndal/lR/issues/10))·사업 정책/PG 승인([Issue #14](https://github.com/nalkarowndal/lR/issues/14)) 전까지 출시 불가.
