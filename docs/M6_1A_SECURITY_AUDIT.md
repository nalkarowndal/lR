# M6-1A — 의존성 취약점 인벤토리 및 API 릴리스 차단 회귀

## 작업 범위
- Node 22/npm 10, 루트 lockfile 고정 상태를 유지하며 `npm audit --json`을 **프로덕션 의존성과 전체 의존성에 각각** 실행한다.
- GitHub Actions에서 의존성 트리를 변경하지 않고 `npm ci` 이후 감사 보고서 생성. 취약점이 있더라도 **조회 성공과 취약점 없음은 다르므로**, 메타데이터의 critical/high/moderate/low를 분리하고, 크리티컬/하이 프로덕션 취약점은 `BLOCKED_REVIEW_REQUIRED`로 표시한다.
- 네트워크/레지스트리 오류 또는 잘못된 보고서는 **감사 실패**로 처리한다. `npm audit`의 exit 1 자체는 취약점일 수 있으므로 단순 `|| true`를 쓰되 검증 스크립트가 결과 필수 구조를 엄격히 검사한다.
- 스냅샷/HTML/서버 로그에는 인증 토큰·비밀번호·운영 DB 키를 넣지 않는다. 테스트 비밀값은 합성 문자열만 사용한다.
- 현재 검증 범위는 **자동 취약점 인벤토리 + 기존 API 안전 게이트 회귀**이며, 취약점을 자동 고치거나 운영 PG/ERP를 활성화하지 않는다. 실제 npm advisory 수치는 [Actions 기록](https://github.com/nalkarowndal/lR/actions/workflows/m6-security-audit.yml)에서 확인한다.
- 새로운 회귀 테스트로 운영 모드 실결제/주문/렌탈/수선/인증 요청 501, CORS 허용 출처 일치, Helmet과 DB 오류 응답 개인정보 미노출을 검증한다.

## 완료/릴리스 게이트
- Audit report의 **inventory 성공은 보안 합격이 아니다**. 취약점별 실제 영향 패키지/전이 의존성/상위 버전/Expo SDK 58 호환성과 수정 가능성을 분석해야 한다. 발견된 고위험 항목은 개별 Issue/PR로 등록한다.
- 릴리스 필수 외부 조건: [Issue #10](https://github.com/nalkarowndal/lR/issues/10) Android/iOS 실기기 QA, [Issue #14](https://github.com/nalkarowndal/lR/issues/14) POL-01~05/실 토스 샌드박스, 운영 ERP 승인, 실상품 사진 권리.
- [Issue #19](https://github.com/nalkarowndal/lR/issues/19) 추가 스크린샷 디자인 고도화는 본래 개발·보안 안정화 이후.
- 프로젝트 상태: [docs/PROJECT_STATUS.md](PROJECT_STATUS.md). 첫 감사 실행 실제 결과 및 재현 가능한 CI 이력은 **PR CI 통과 후 추가**한다.

근거: [npm audit CLI v10](https://docs.npmjs.com/cli/v10/commands/npm-audit), [npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci), [OWASP API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/).
