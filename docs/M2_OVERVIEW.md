# M2 — luxuryRental UI/UX 상세 설계
작성 2026-11-02 (Asia/Seoul). 상태: **검토용 설계 산출물**, 사용자 시각 승인·실기기 검수와 별개.

## 기준과 산출물
M1 기준 커밋: `a0918e34bffc6c4ca77d15f5fabd41c0dc658c8a`. 원본 웹: `567890@aa790f196907ab5cf9fefd51bced9f474be87884`.
[요구사항](REQUIREMENTS.md), [IA](INFORMATION_ARCHITECTURE.md), [흐름](USER_FLOWS.md), [데이터](DATA_MODEL.md), [API](API_CONTRACT.md), [인수 기준](ACCEPTANCE_TESTS.md)을 유지한다.

- [디자인 시스템·원본 근거](DESIGN_SYSTEM.md)
- [29개 화면 와이어프레임·추적](SCREEN_WIREFRAMES.md)
- [컴포넌트 명세](COMPONENT_SPECIFICATIONS.md)
- [인터랙션·상태·API 미결 목록](INTERACTION_SPEC.md)
- [반응형·접근성·공식 근거](RESPONSIVE_ACCESSIBILITY.md)
- [Figma 사용·검증 기록](M2_VISUAL_QA.md)
- [Figma 편집 파일](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja)

## 설계 방향과 대안
요청에 따라 **기존 웹 정체성 유지 + 모바일 조작 개선**을 채택한 설계자 제안이다. 사용자 시각 승인으로 표현하지 않는다.
1. 원본의 흰색/잉크/파스텔 카드, Pretendard 계열 산세리프, LR·LUXURYRENTAL 표기를 유지하고 5탭·거래 폼을 모바일에 맞춘다. 기존 고객의 연속성과 접근성에 유리하다.
2. 로드맵의 크림/샴페인 골드 재해석은 최신 원본 소스와 불일치하므로 채택하지 않는다.
3. 플랫폼 기본 UI로 전체 교체하면 친숙하지만 서비스 카드·브랜드 연속성을 잃으므로 권한 창·키보드 등 OS 영역에 한해 적용한다.

## 범위
29개 고객 화면, 공통 상태와 모달, 홈/렌탈/구매/수선/마이 흐름. P0/P1/P2 우선순위는 M1 그대로다. P1을 그렸다는 이유로 MVP 필수 구현이 되지 않는다. 관리자 ERP/CMS와 RecruitApp은 별도 웹에 보존하며 고객 앱에는 관리자 진입을 두지 않는다. AI 스타일링(P2)은 새로 설계하지 않는다.

실제 React Native/Expo 앱·Node.js 코드, 의존성 설치, DB 작업, PG·배송 연동 및 배포는 범위 밖이다. Figma는 합성 데이터로 작동하는 디자인 프로토타입이다. 정책 POL-01~05는 승인된 것으로 취급하지 않는다.

## 인계·완료 구분
M2 문서 작성과 Figma 도형/연결 검증은 산출물 상태다. Figma에서 사용자가 주요 여정을 검토하고 시각 승인을 기록한 뒤에야 M2 승인 게이트를 닫는다. 네이티브 접근성·실기기 QA는 M4/M6에서 별도 실행한다.
[인터랙션의 GAP 목록](INTERACTION_SPEC.md)은 M1 계약에 없는 기능을 표시하며, 실행되는 API가 생긴 것처럼 서술하지 않는다.
