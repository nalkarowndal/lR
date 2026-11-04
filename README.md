# luxuryRental — 프리미엄 명품 렌탈·구매·판매 플랫폼

본 프로젝트는 `luxuryRental`의 기존 모바일 중심 커머스 및 구인·관리자 시스템을 바탕으로, **기존의 모든 화면 구조와 콘텐츠, 46개 기준선 레이아웃을 100% 보존**하면서 프리미엄 럭셔리 벡터 그래픽으로 UI/UX를 고도화하고, 별도의 **Node.js (Express + TypeScript + SQLite) REST API 백엔드**를 구축하여 연동한 완성형 프로젝트입니다.

---

## 📁 프로젝트 구조

```text
IIL/
├── backend/                       # Node.js REST API 백엔드
│   ├── src/
│   │   ├── config/env.ts          # 환경 설정
│   │   ├── controllers/           # API 컨트롤러 (상품, 카테고리, 검색, 판매, 관리자)
│   │   ├── db/
│   │   │   ├── database.ts        # SQLite DB 초기화 및 커넥션 풀 ('node:sqlite')
│   │   │   └── seed.ts            # 초기 시드 데이터 (브랜드, 카테고리, 상품, 구인, 채팅)
│   │   ├── docs/openapi.json      # OpenAPI 3.0 사양 문서
│   │   ├── middlewares/           # 인증, 로깅, 유효성 검증, 에러 핸들러
│   │   ├── routes/                # Express 라우터 모음
│   │   ├── schemas/api.schemas.ts # Zod 유효성 검증 스키마
│   │   ├── app.ts                 # Express 애플리케이션
│   │   └── server.ts              # 서버 엔트리포인트 (포트 4000)
│   ├── tests/api.test.js          # 백엔드 단위/통합 테스트 (15/15 Pass)
│   └── package.json
│
├── frontend/                      # React 19 + TypeScript + Vite 프런트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/LuxuryIcons.tsx # 프리미엄 럭셔리 벡터 SVG & 모노그램 아이콘
│   │   │   ├── ShopMain.tsx       # 메인 화면 (8-Grid, 추천탭, QR 배너)
│   │   │   ├── ShopCategory.tsx   # 카테고리/브랜드 LNB & 서브카테고리
│   │   │   ├── ShopSearch.tsx     # 실시간 검색 오버레이 & 추천 태그
│   │   │   ├── ShopSell.tsx       # 내 상품 판매 및 브랜드 직접 등록
│   │   │   ├── ShopLike.tsx       # 간편 소셜 로그인 & 찜하기
│   │   │   ├── ShopAdmin.tsx      # 글래스모피즘 다크테마 관리자 대시보드
│   │   │   └── RecruitApp.tsx     # 구인 관리 앱
│   │   ├── context/AppContext.tsx # 전역 상태 허브 & 백엔드 자동 동기화
│   │   ├── services/api.ts        # REST API 클라이언트 & Graceful Fallback
│   │   ├── index.css
│   │   └── main.tsx
│   ├── scripts/
│   │   └── capture-all.js         # Puppeteer 기반 46개 전체 인터랙션 자동 캡처
│   └── package.json
│
└── docs/
    ├── analysis/                  # 분석 및 검증 보고서
    │   ├── PROJECT_ANALYSIS.md    # 프로젝트 초기 구조 및 컴포넌트 의존성 분석
    │   ├── UI_UX_AUDIT.md         # 46개 기준선 캡처 1:1 감사 및 이모지 전수 조사
    │   ├── CHANGE_IMPACT.md       # 보존/수정 매트릭스 및 롤백 전략
    │   ├── PHASE4_INTEGRATION_REPORT.md # 통합 아키텍처 및 E2E 연동 보고서
    │   └── FINAL_QA_REPORT.md     # 14대 성공 기준 최종 달성 및 회귀 검수 보고서
    ├── screenshots/               # [보존] 기준선 원본 캡처 46종
    └── screenshots_phase2/        # [고도화] UI 고도화 & 백엔드 연동 캡처 46종
```

---

## 🚀 빠른 시작 가이드 (Quick Start)

> **참고**: Windows 환경에서는 `npm` 대신 `npm.cmd`를 사용하십시오.

### 1. 백엔드 실행 및 테스트
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치 및 빌드
npm.cmd install
npm.cmd run build

# 단위/통합 테스트 실행 (15/15 전체 통과)
npm.cmd test

# 서버 실행 (기본 포트: 4000)
npm.cmd start
```
- 서버 상태 확인: `http://localhost:4000/api/v1/health`
- OpenAPI 스펙: `backend/src/docs/openapi.json`

---

### 2. 프런트엔드 실행
```bash
# 프런트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm.cmd install

# 개발 서버 실행 (기본 포트: 5173)
npm.cmd run dev
```
- 로컬 접속: `http://localhost:5173/`

---

### 3. 전체 화면 자동 캡처 및 회귀 테스트 (E2E)
```bash
cd frontend

# 백엔드(포트 4000)와 프런트엔드(포트 5173)가 실행된 상태에서 실행
npm.cmd run test:capture
```
- 46개 스크린샷이 `docs/screenshots_phase2/`에 자동으로 저장됩니다.
- 원본 기준선(`docs/screenshots/`)과 비교 검증할 수 있습니다.

---

## ✨ 핵심 개선 사항

1. **디자인 및 콘텐츠 100% 보존**:
   - 기존의 모든 텍스트, 브랜드명, 상품명, 가격, 할인율, 버튼명(`button:has-text`), 이용약관 문구 완벽 유지.
   - 모바일 뷰 컨테이너(`max-w-md`)와 데스크톱 고정 QR 배너 레이아웃 정밀 보정.
   - 관리자 화면의 글래스모피즘 딥 다크 테마 온전한 보존.
2. **저품질 기본 OS 이모지 전면 교체**:
   - 8-Grid 메뉴(가방, 의류, 슈즈, 주얼리 등), 3대 추천 탭, 6대 인기 브랜드, 위탁판매 악수 이모지 등 24종 이상의 이모지를 모던 럭셔리 벡터 SVG 및 모노그램 그래픽으로 전면 교체.
3. **인터랙션 및 상태 제어 강화**:
   - 맞춤 추천 탭(20대 여성 ~ 40대 여성)별 고유 상품 데이터 연동.
   - 카테고리 LNB 8개 대분류 선택 시 우측 세부 카테고리 실시간 동기화.
   - 브랜드 선택 시 해당 브랜드 상품 그리드 필터링.
   - 검색창 실시간 바인딩, 지우기, 추천 검색어 클릭 즉시 검색, ESC 닫기 단축키 지원.
   - 간편 로그인 소셜 버튼 터치/로딩 피드백.
   - 관리자 근무자 신규 등록 폼 모달 및 실시간 채팅 전송.
4. **견고한 백엔드 아키텍처 및 내결함성**:
   - Node.js 24 내장 `node:sqlite`를 활용하여 C++ 빌드 도구 의존성 없이 즉시 작동.
   - Zod 기반 런타임 유효성 검증 및 표준 RESTful 응답 구조.
   - 백엔드가 오프라인일 때도 프런트엔드가 로컬 시드로 무중단 작동하는 Graceful Fallback 구현.
