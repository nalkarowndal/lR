# D2-3 통합 아이콘 시각 QA 보고서 (2026-11-13)

## 종합 판정: 자동화 QA 통과, 디자인 최종 승인 및 실기기 검수 보류

- GitHub Draft PR: https://github.com/nalkarowndal/lR/pull/50
- D2-3 인증화면/광학 재검수 + 관리자 모바일 개선 후 GitHub Actions: https://github.com/nalkarowndal/lR/actions/runs/43389106442
- 연결된 단계: D1 PR #47 → D2-1 PR #48 → D2-2 PR #49 → D2-3 PR #50.
- D2-3은 D2-2 브랜치에서 파생되며 `main`에 병합하지 않음.
- 정식 인증 경로/백엔드에 대한 보안·기능 E2E 결과로 해석하지 말 것.

## 범위 및 테스트 환경

- GitHub Actions Ubuntu + Chrome + 한국어 Noto CJK 설치.
- 배포 빌드 Vite Preview에서 일반 방문자 경로 카테고리·검색·판매·설정 360 / 390 / 430px **12개 뷰** 확인.
- 격리된 Vite 개발용 harness에서 실제 React SVG를 16 / 20 / 24 / 32 / 48 / 72px로 렌더링하여 **198개 표시 샘플** 생성.
- QA 전용 **가상 사용자**를 이용해 마이페이지 360 / 390 / 430px, 관리자 390 / 1280px 컴포넌트 캡처.
- 가상 세션은 로컬 테스트에만 존재하며, 서비스 인증·권한 검증·백엔드 E2E가 아님. 테스트 스크립트는 외부 네트워크 요청 차단.
- 실제 Android/iOS 하드웨어, Safari, 화면낭독기 및 터치 실제 동작은 검수하지 않음.

## 자동 판정 결과

| 검사 | 결과 | 비고 |
|---|---|---|
| D1 + D2-1 회귀 테스트 | PASS | PR #47/#48 코드 회귀 |
| D2-2 + D2-3 회귀 테스트 | PASS | 아이콘 매핑, UI 상태 및 QA 격리 |
| TypeScript / Vite production build | PASS | `npm run build` |
| 변경 컴포넌트 lint | PASS | QA 및 Iconoir wrapper |
| 일반 방문자 브라우저 4화면 × 3폭 | PASS | 360/390/430px, 가로 넘침 없음 |
| SVG 광학 크기별 실제 렌더링 | PASS | 198 샘플, D1/D2-1/D2-2 |
| SVG gradient ID 중복 | 0건 | 동일 화면 다중 인스턴스 확인 |
| JavaScript 페이지 오류 | 0건 | 검사한 각 화면 기준 |
| 마이페이지 가상 UI 렌더링 | PASS | 360/390/430px, 8개 아이콘 |
| 관리자 가상 UI 렌더링 | PASS | 390/1280px, 4개 Iconoir 아이콘 |
| 관리자 상단/채용 탭 개행 | 개선 | 모바일 텍스트 강제 줄바꿈 제거, 수평 스크롤 도입 |
| 하단바 원본 보존 | PASS | `ShopMain.tsx` D2-2 대비 변경 없음 |
| 상품 사진 / 공식 로고 보존 | PASS | D2-3에서는 변경 없음 |

### 대표 팔레트 대비 (WCAG 2.2 SC 1.4.11 참조)
아래는 **일정한 색상을 가진 팔레트 쌍의 수학적 대비**, 모든 SVG 픽셀·배경·UI 상태에 대한 전수 3:1 인증은 아님.

| 아이콘 색 / 배경 | 계산 대비 |
|---|---:|
| Boutique Graphite `#302D29` / Ivory `#F8F6F2` | 12.69:1 |
| Boutique Graphite `#302D29` / White `#FFFFFF` | 13.70:1 |
| Atelier dark Champagne `#AA8250` / Dark `#101215` | 5.38:1 |
| Atelier bright Champagne `#FFF1D2` / Dark `#101215` | 16.76:1 |

참고: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast 및 https://www.w3.org/WAI/WCAG22/Techniques/general/G207

## 이번 작업 중 실제 발견·해결한 문제

### 관리자 페이지의 390px 세로 글자 분절
- 원인: 관리자 헤더가 작은 화면에서 가로 `flex`로 밀리며 버튼 폭이 과도하게 줄고, 구인관리 하위 탭이 `flex` 축소 상태에서 한글이 글자 단위로 줄바꿈됨.
- 수정: `ShopAdmin.tsx`의 헤더를 `flex-col lg:flex-row` 반응형 배치, 3개 상단 메뉴와 구인관리 하위 탭에 `whitespace-nowrap shrink-0 overflow-x-auto` 적용, 모바일 내부 패딩 축소.
- 검증: 390px에서 상단 3개 버튼의 `wrapped=0`, 하위 4개 버튼의 `wrapped=0`, 스크롤 영역 `clientWidth=364, scrollWidth=666`; 1280px에서도 정상 배치.
- 조치 성격: 아이콘 자체를 변경한 것이 아니라, D2-3 QA에서 발견한 **가독성 회귀 문제의 최소 반응형 수정**.
- 수정 전/후 스크린샷은 각 QA 아티팩트에서 비교 가능.

## 남은 디자인 및 통합 위험

1. **잔존 아이콘 혼용**: `ShopMain.tsx` 헤더의 검색·장바구니·설정은 기존 Lucide를 유지. 하단바는 의도적으로 보존.
2. **관리자 Font Awesome**: `ShopAdmin.tsx`에 FA 클래스 패턴이 다수 남아 있고, `frontend/index.html`이 외부 CDN의 Font Awesome CSS를 불러옴. QA harness에서는 외부 HTTP 요청을 차단하므로 해당 아이콘의 실제 운영 렌더링까지 인증하지 않음. 장기적으로 Iconoir 자산으로 이관하거나 자체 번들링 검토 필요.
3. **작은 크기 의미 전달**: D1 판매 아이콘과 왕관은 16/20px에서 정밀성이 제한적. 의미가 필요한 버튼에는 텍스트 라벨을 동반하고 핵심 심볼은 24px 이상 권장.
4. **대비 검증 범위**: 위 대비는 토큰 쌍만 확인. 동적 배경·어두운 관리자 상태·비활성 요소를 포함한 전수 대비 검수 필요.
5. **인증 흐름·실기기 미검증**: QA 전용 mock 마이페이지/관리자 스크린샷은 시각 검수일 뿐, 로그인 성공·권한 부여·백엔드 데이터·실제 모바일 Safari/Android 사용성 통과를 의미하지 않음.
6. **최종 디자인 승인 미완료**: Iconoir 패밀리는 통일되었으나 기존 애플리케이션의 모든 비하단바 아이콘이 완전 교체된 상태는 아님.

## QA 증빙

- GitHub Actions workflow: `.github/workflows/d2-3-icon-qa.yml`
- 실행: `npm ci && npm run test:d2 && node --test tests/d2-2-sitewide-icons.test.mjs tests/d2-3-integrated-icons.test.mjs && npm run build`
- 브라우저: `node scripts/qa-d2-2-browser.mjs` / `node scripts/qa-d2-3-integrated.mjs`
- 결과 아티팩트: 해당 workflow run의 `d2-3-integrated-icon-qa`
- 포함: public guest screenshots 12장, isolated MyPage 3장, isolated Admin 2장, 광학 보드 1장, 2개 JSON 측정 결과.

**결론:** D2-3의 자동 검증 및 관리자 모바일 가독성 보정 통과. 남은 아이콘 혼용 문제와 수동 기기 검수 완료 전에는 Draft PR을 병합하거나 디자인을 최종 승인하지 않을 것.
