# M6-1B — Expo SDK 58 전이 의존성 권고 분류 및 수정 게이트

작성 기준: 2026-11-02, GitHub main 5fc62d9, Issue #30. **릴리스 보안 승인 아님.**

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

[Expo 상위 프로젝트 이슈 #52735](https://github.com/expo/expo/issues/52735)는 Expo SDK 58의 glob ^13 및 minimatch ^10 버전 제약을 보고한다. 이 문서 작성 시 해당 이슈는 열려 있으며 공식적으로 수정된 SDK 58 패치 및 본 프로젝트의 호환성 테스트 결과는 확인되지 않았다. 위 표는 **공개 권고 기준**이며 실제 npm audit 원시 JSON에서 발견한 모든 권고 ID의 최종 목록으로 간주하지 않는다.

- 현 상태에서 같은 major 범위 내 npm update만으로 두 권고를 제거할 수 있다는 근거가 없다.
- glob 14, minimatch 11은 의존 범위를 넘어가는 major 변경이다. 빌드 도구 및 glob 매칭 동작, Expo 호환성을 확인하지 않고 npm overrides 또는 npm audit fix --force를 적용하지 않는다.
- Expo 공식 CLI의 npx expo install --check는 호환 버전 검사용이며, npx expo install --fix는 호환되지 않는 **직접** Expo 의존성 수정용이다. 이들 명령이 상위 Expo 패키지의 전이 의존성 문제를 자동 해결한다는 보장은 없다.
- [Expo CLI 문서](https://docs.expo.dev/more/expo-cli/)

## 3. 추가한 검증 기능

- scripts/security/audit-triage-lib.mjs — npm audit 성공/오류를 엄격히 구분하여 lockfile의 영향받는 패키지별 설치 경로·정확한 버전, 상위 선언 버전 범위, npm via 패키지, GHSA ID를 추출한다. npm 데이터가 없는 경우에도 증거 부족을 표시한다.
- scripts/security/audit-triage.mjs — production 및 all의 별도 JSON/Markdown 출력; GitHub CI 요약에 반영.
- scripts/security/audit-triage-lib.test.mjs — 정상 버전/권고 분류, 레지스트리 오류 fail-closed, 잘못된 패키지명/범위 입력, lockfile 누락 경로 검사.
- .github/workflows/m6-security-audit.yml — 매 PR 보안 인벤토리에 triage 증거 파일 생성 추가. 기존 npm audit 원본 JSON과 보고서가 같이 업로드된다.

**주의:** lockfile에 존재하거나 npm audit --omit=dev에 포함되어도 모바일 실제 JS 번들 또는 외부 사용자 입력에 노출되었다는 증거는 아니다. 따라서 triage 출력은 runtimeExposure=NOT_ESTABLISHED 및 releaseApproved=false를 유지한다. 도구 실행 경로에서 외부 업로드/악성 glob 패턴 노출 여부, 실제 번들 포함 여부는 별도 검수한다.

## 4. 병합·출시 게이트

1. npm ci, Node/MySQL API **106+**, HTTP **5+**, Expo 테스트 **25+**, Expo TypeScript 및 web export, Chromium **40+** 성공 기록.
2. 감사 CI의 실제 advisory IDs 및 영향 경로가 triage.json/triage.md에 출력되는지 확인. 기존 11 moderate와 비교하고 추가 심각도/발견을 빠짐없이 기록.
3. 공식 수정 패치가 나오면 Expo 58/React Native 0.88.1 범위 유지 여부를 검증하고 별도 최소 변경 PR을 생성해 npm audit 및 모든 CI를 다시 검증한다.
4. 권고가 해소되지 않으면 보류 사유와 노출 검토 결과를 Issue #30에 남기고 **출시 차단을 유지**한다.
5. Android/iOS 실기기 검수 Issue #10, POL-01~05 및 실제 PG 승인 Issue #14, 마지막 UI 개선 Issue #19는 별도 게이트. 운영 MySQL·실 PG·실 ERP·원본 luxuryRental 웹 567890을 변경하지 않는다.

**이 PR 범위:** 증거 자동화 및 문서화. 위험한 메이저 강제 업그레이드나 운영 기능 활성화는 포함하지 않는다.
