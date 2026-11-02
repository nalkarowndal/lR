# M6-0 — npm 잠금 파일 기반 재현 가능한 CI

## 변경 및 재현성
- 루트 `package-lock.json`(lockfileVersion 3)을 **Node 22 / npm 10**의 GitHub Actions에서 `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`로 실제 생성했다. `@luxuryrental/api`, `@luxuryrental/mobile` 두 npm workspaces를 포함한다.
- 임시 [PR #27](https://github.com/nalkarowndal/lR/pull/27) 잠금 파일 생성 workflow는 파일 커밋 후 **삭제**했고, 최종 main에는 남기지 않는다. 외부 PR을 자동으로 수정하는 워크플로를 상시 두지 않는다.
- API/MySQL, Expo/웹 export, Playwright Chromium(offline/API-unreachable) 세 GitHub Actions 모두 `npm ci --include=dev --no-audit --no-fund`로 설치한다. node_modules를 깨끗하게 설치하고 package manifest와 잠금 파일이 다르면 실패한다.
- `actions/setup-node@v4` npm 캐시는 루트 **package-lock.json**을 캐시 키로 참조한다. API와 Chromium workflow의 `paths` 트리거에도 package-lock 변경을 추가한다.
- `npm ci`에서는 보안 검사를 건너뛴다(`--no-audit`는 성능·재현성용). 따라서 **취약점 스캔 완료가 아니다.** Dependabot/npm audit 및 라이선스 검사, 비밀 노출 점검은 별도 M6 QA 게이트가 필요하다.

## 검증 게이트
- API GitHub CI는 MySQL 8.4 `lr_test`에서 마이그레이션, 테스트 102건 이상, 살아있는 Node↔모바일 HTTP 5건을 검증.
- Mobile CI는 TS, Node unit tests 25건 이상, Expo SDK 58 웹 export 검증.
- Visual CI는 Chromium Playwright의 360/390/768/1024px 해상도 및 offline/API 단절 회귀를 검증. 스크린샷은 아티팩트지만 **실제 Android/iOS 기기 QA와 동일하지 않다**.
- 잠금 파일 변경만 포함된 PR도 API/Visual CI가 다시 실행되도록 한다.
- 로컬 개발: `node --version`(22 이상) 확인 후 저장소 루트에서 `npm ci --include=dev`, 이후 `npm run api:build`, `npm run typecheck:mobile`, `npm run test:mobile` 및 격리 테스트 DB가 있을 때만 API 테스트. manifest 변경 시 정상적으로 `npm install` 실행하여 lockfile을 갱신하고 두 파일을 함께 커밋.

## 릴리스 차단 항목
- 테스트용 결제/ERP 수신 모의 구현은 실결제·운영 ERP와 연결되지 않음. `POL-01..05` 미승인, PG 샌드박스 실키 미공급.
- 실제 상품 사진/저작권·스크린샷 추가 고도화는 [Issue #19](https://github.com/nalkarowndal/lR/issues/19) 후순위 유지.
- 실기기 Android/iOS 시각·접근성/기능 QA는 [Issue #10](https://github.com/nalkarowndal/lR/issues/10) 계속 OPEN. 보안 스캔/성능 임계값/운영 데이터 보호·백업 별도 검토 필요.
- 다음 M6-1은 실기기를 사용할 수 있는 환경 확보, 접근성·네트워크 단절 시나리오, lockfile+CI 다회 실행과 취약점 스캔, 실제 출시 차단 조건 수치화부터 시작.

참고: [npm ci 공식 문서](https://docs.npmjs.com/cli/v10/commands/npm-ci), [npm package-lock 설명](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json).
