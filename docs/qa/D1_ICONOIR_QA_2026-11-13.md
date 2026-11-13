# D1 Iconoir 핵심 아이콘 QA 보고서 — 2026-11-13

## 결론
- **D1 자동 검증 통과.** Draft PR #47은 열려 있으며 `main`에 병합되지 않음.
- 작업 브랜치: `design/d1-iconoir-boutique-atelier`.
- 적용 아이콘: Iconoir MIT 라이선스의 crown / shirt / handbag / shopping-bag-arrow-up.
- 스플래시 왕관은 Atelier Engraved, 메인 렌트/구매/판매는 Boutique Line.
- 하단바 버튼과 아이콘 로직 원본 유지.

## GitHub Actions 최종 실행
- 실행 주소: https://github.com/nalkarowndal/lR/actions/runs/43378974320
- D1 회귀 테스트: PASS
- `npm ci`: PASS
- `npm run build` (TypeScript + Vite): PASS
- `npx oxlint` (D1 컴포넌트와 SplashScreen): PASS
- Ubuntu Chrome 모바일 크기별 브라우저 QA: PASS
- 한국어 텍스트 렌더링: Ubuntu 검수 환경에 `fonts-noto-cjk` 설치 후 스크린샷 확인
- 스크린샷 아티팩트: `d1-browser-qa-screens` (실제 메인 360/390/430, 초기 HTML 스플래시 390, React 스플래시 390)
- 앱 실행 중 콘솔 JavaScript 페이지 오류: 0개 (각 화면)
- 가로 넘침: 관측하지 않음 (360/390/430px)

## Chrome 결과
| 뷰포트 폭 | 렌트 아이콘 | 구매 아이콘 | 판매 아이콘 | 하단바 버튼 | 페이지 오류 | 가로 넘침 |
|---|---:|---:|---:|---:|---:|---|
| 360px | 44×44 | 44×44 | 48×48 | 5 | 0 | 없음 |
| 390px | 44×44 | 44×44 | 48×48 | 5 | 0 | 없음 |
| 430px | 44×44 | 44×44 | 48×48 | 5 | 0 | 없음 |

## 광학 크기 QA
- Iconoir 원본 path를 D1 React 컴포넌트와 동일한 3중 스트로크(Atelier) 또는 2중 스트로크(Boutique)로 렌더링해 24 / 32 / 48 / 72px 비교.
- 24px에서도 뚜렷한 윤곽. 다만 Shirt 단독 실루엣은 렌탈 행위가 아니라 의류로 인식될 수 있어 실제 UI에서는 카드 라벨을 유지해야 함.
- 스플래시 원형 메달 제거. native splash와 React splash는 동일한 Iconoir crown geometry를 사용하며 두 화면의 실제 캡처를 생성.
- 기본 Boutique 획 `#36322C` / 밝은 바탕 `#FBF9F5`: 약 **12.11:1** 대비.
- Atelier 금색 그라데이션의 가장 어두운 획 `#B08D57` / `#111315`: 약 **6.02:1** 대비. 이 수치는 지정 팔레트의 명목 색상 대비이며 이미지의 모든 안티앨리어싱 픽셀 대비를 뜻하지 않음.
- WCAG G207 / SC 1.4.11 기준: https://www.w3.org/WAI/WCAG22/Techniques/general/G207

## 품질 위험과 후속 조치
- **실기기 테스트 미실시:** Android/iOS에서 실제 화면과 탭 반응을 확인하지 않았음. 데스크톱 Chrome의 모바일 뷰포트 시뮬레이션만 수행.
- **디자인 주관 평가:** 24px 작은 렌트 아이콘의 렌탈 의미 전달력 및 브랜드 각인 소재 표현에 대한 최종 디자인 승인은 필요.
- **전역 린트:** `npm run lint` 전체 프로젝트에 대한 검증은 이번 D1 자동 검증 범위가 아님. 변경된 아이콘·스플래시 컴포넌트를 린트했음.
- **제품 상호작용:** 메인 카드의 탐색 이벤트가 실제 백엔드와 연결된 전체 E2E 구매/렌탈/판매 흐름까지 검증된 것은 아님.
- **하단바 보존:** GitHub의 `ShopMain.tsx` 하단 네비게이션 구간 byte-for-byte 변경 없음. 브라우저에서 버튼 5개 확인.

## 후속 마일스톤
1. D1 디자인 승인 또는 아이콘 변경 의견 반영.
2. `main` 병합 전 실제 기기 검수.
3. D2로 8개 프리미엄 서비스 메뉴를 Iconoir 중심 패밀리로 확장하며 하단바 보존.
