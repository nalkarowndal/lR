# D2-4 — 잔존 아이콘 최종 통일 / 승인 게이트 (2026-11-13)

## 범위 및 기준

- 기준 브랜치: `qa/d2-3-integrated-icon-visual` (Draft PR #50), 기반: D2-2.
- UI 전체 레이아웃, 디자인 토큰, 페이지 동작, 라우팅을 유지한다.
- **사용자 합의 사항: 메인 페이지 하단 플로팅 네비게이션 5개 버튼/아이콘은 변경하지 않는다.**
- 새로운 웹폰트/CDN/아이콘 패키지 추가 없이 저장소 내 기존 Iconoir 원본 SVG 경로(MIT)와 `D22Icon` 렌더러를 사용한다.
- 출처: `docs/design/ICONOIR_LICENSE.md`, `frontend/src/components/icons/D22IconShapesD.ts`, `D22IconShapesE.ts`.

## 변경 사항

1. `ShopMain.tsx`: 검색, 장바구니, 설정 헤더 버튼을 40px 터치 영역 + 테두리/내부 하이라이트 계열로 통일. `aria-label`, 로그인 분기, 검색 오버레이 및 설정 이동 이벤트 유지.
2. 하단바를 **제외한** 메인 상품·모달·안내 유틸리티 아이콘도 같은 D22 SVG 렌더러로 변경. 좋아요 상태 색상, 장바구니 삭제, 화면 전환 이벤트 유지.
3. `ShopAdmin.tsx`: 기존 Font Awesome `<i>` 렌더러를 Iconoir SVG로 전부 치환. 조건부 매장/본사, 검색, 갤러리, 채용/근무자, 메시지, 업로드, 데이터베이스, 빈 상태 도상 유지.
4. `frontend/index.html`: Font Awesome 원격 CSS 의존성 제거. 외부 CDN 차단 환경에서도 관리자 아이콘은 로컬 번들로 렌더링 가능해야 한다.
5. SVG 원본 `D22_SHAPES_D/E`와 기존 `D22Icon`의 `useId` 고유 gradient ID를 활용해 동시 렌더 시 충돌 방지. 외부 패키지 추가·하단바 변경 없음.

## 자동 QA 절차

- `npm ci`, `npm run test:d2`.
- `node --test tests/d2-2-sitewide-icons.test.mjs tests/d2-3-integrated-icons.test.mjs tests/d2-4-icon-completion.test.mjs`.
- `npm run build` (TypeScript + Vite) 및 `oxlint` 대상 검사.
- `qa-d2-2-browser.mjs`: Chrome 프로덕션 빌드 360/390/430px 메인 헤더 3개 SVG 원본 도상·40px 버튼 크기·기존 하단바 5개 검수. 카테고리·검색·판매·설정 동선과 스크린샷 회귀.
- `qa-d2-3-integrated.mjs`: 기존 16/20/24/32/48/72px 아이콘 광학 샘플과 개발 전용 격리 마이페이지/관리자(390/1280px), SVG ID 충돌, React 예외, 관리자 탭 가독성, Font Awesome DOM 잔재 검수.
- CI 실행 및 결과: [GitHub Actions](https://github.com/nalkarowndal/lR/actions/workflows/d2-3-icon-qa.yml). **실제 최신 커밋의 성공 여부를 확인한 뒤에만 Pass로 전환한다.**

## 관리자 권한 검수 및 명시적 제외 항목

| 게이트 | 필요한 검증 | 현재 판정 |
| --- | --- | --- |
| Android Chrome 실기기 | 사용자 요청에 따른 비대상 | **검수 범위 제외 — 승인 게이트 아님** |
| iOS Safari 실기기 | 사용자 요청에 따른 비대상 | **검수 범위 제외 — 승인 게이트 아님** |
| 로그인/권한 E2E | 임시 SQLite DB와 실제 HTTP 로그인 세션을 이용한 USER/ADMIN 및 보호 API, Chrome 역할별 UI 검증 | **PASS — [D2-5 결과](./D2_5_REAL_ADMIN_ACCOUNT_E2E_2026-11-13.md)** |
| 접근성 수동 QA | VoiceOver/TalkBack, 키보드 초점 순서, 색 대비, 클릭 영역, 검색/닫기 대체 텍스트 점검 | 미완료 — 코드·자동 브라우저만 포함 |
| 최종 디자인 승인 | 실제 장비 시각 비교, 팀 검토, 확인 후 승인 기록 | 보류 |

**D2-3의 Chrome/개발 전용 가상 사용자는 실제 OS 기기 또는 운영 로그인 검증을 뜻하지 않습니다. D2-5는 별도의 실제 서버 인증 세션 기반 격리 E2E입니다. Android/iOS는 요청에 따라 검수 범위에서 제외되었습니다.**
PR #50은 Draft·미병합으로 유지한다. 운영 배포 보안 감사나 최종 디자인 승인까지 통과했다고 표기하지 않는다. 브라우저/백엔드 인증 E2E는 D2-5 결과를 따른다.
