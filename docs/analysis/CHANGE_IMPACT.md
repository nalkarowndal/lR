# LUXURY RENTAL 변경 영향도 및 안전성 평가 보고서 (CHANGE_IMPACT)

**작성일**: 2026-11-04  
**버전**: 1.0.0 (Phase 1 기준선 확립)  
**분석 대상**: 전체 코드베이스, 46개 기준선 캡처, 자동화 스크립트 (`capture-all.js`)

---

## 1. 변경 범위 정의 및 보존/수정 매트릭스

### 1.1 절대 변경 금지 항목 (Strict Preservation)
- 기존 5개 핵심 화면 (`ShopMain`, `ShopCategory`, `ShopSearch`, `ShopLike`, `ShopSell`, `ShopAdmin`, `RecruitApp`)의 레이아웃 구조
- 모바일 앱 형태의 중앙 정렬 컨테이너 (`max-w-md`) 및 반응형 비율
- 관리자 화면의 다크 테마, 글래스모피즘 스타일, 1800px 와이드 그리드
- 기존 모든 브랜드명, 상품명, 가격, 할인율, 뱃지, 이벤트 카피
- '리본즈'와 'LUXURYRENTAL' 혼용 텍스트 (임의 단일화 금지)
- 토스페이먼츠 에스크로 서비스 문구, 이용약관 등 법적 푸터 전문
- 하단 플로팅 알약 스타일 내비게이션 및 상단 헤더 구성
- 기존 `capture-all.js`에서 탐색하는 DOM 셀렉터 및 텍스트 레이블 (`button:has-text(...)`, `.scrollbar-hide` 등)

### 1.2 개선 허용 및 추진 항목 (Target Enhancements)
- 기본 이모지(👜, 👗, 🧳, 💍, 🤝, 🎁 등)를 럭셔리 커머스에 부합하는 벡터 아이콘 및 정밀 이미지/타이포그래피 에셋으로 교체
- 맞춤 추천 탭 선택 시 연령/성별에 맞춘 실제 추천 상품 데이터 반영
- 카테고리 뷰에서 LNB 및 상단 서브탭(여성/남성/아동) 선택 시 우측 세부 카테고리 및 상품 동기화
- 브랜드 뷰에서 브랜드 칩 클릭 시 해당 브랜드 상품 필터링
- 검색 오버레이 제어형 상태 관리, 추천 키워드 클릭 시 검색어 입력 및 Enter/버튼 검색 기능
- 검색/모달 오버레이의 키보드 접근성(ESC 키 닫기, 포커스 복귀)
- 관리자 화면에서 상품 등록 및 구인 요청 시 실제 Node.js REST API를 통한 DB 저장 및 영속성 보장
- `vite.config.ts` 문법 오류 수정, `index.html` lang 속성(`ko`) 수정, 미사용 import 정리

---

## 2. 레이어별 변경 영향도 분석

```mermaid
flowchart TD
    subgraph Frontend [프런트엔드 레이어]
        ViteConfig["vite.config.ts 수정<br/>(빈 콤마 제거)"]
        IndexHTML["index.html<br/>(lang='ko', meta 보강)"]
        Components["ShopMain / Category / Search / Admin<br/>(이모지 교체 & UI/UX 고도화)"]
        APIClient["API Service Client<br/>(src/services/api.ts 신규)"]
        AppContext["AppContext.tsx<br/>(서버 상태 동기화 & 영속성)"]
    end

    subgraph Backend [Node.js 백엔드 레이어 (신규)]
        Server["Express App (TypeScript)<br/>(backend/src/server.ts)"]
        Routes["API Routes<br/>(/api/v1/...)"]
        Controllers["Controllers & Validation<br/>(Zod 스키마 검증)"]
        Database["SQLite DB + Repository<br/>(better-sqlite3 / sqlite3)"]
    end

    Components --> APIClient
    AppContext --> APIClient
    APIClient -->|REST API 요청| Routes
    Routes --> Controllers
    Controllers --> Database
```

---

## 3. 상세 위험 요소 및 안전 대책 (Risk & Mitigation)

| 위험 요소 | 잠재 영향 | 심각도 | 안전 대책 (Mitigation Strategy) |
|---|---|---|---|
| **기존 캡처 스크립트 (`capture-all.js`) 깨짐 위험** | 버튼 텍스트나 클래스명 변경 시 Puppeteer가 요소를 찾지 못해 캡처 실패 | 높음 (High) | - 버튼 텍스트(예: `'20대 남성'`, `'30대 여성'`, `'앱으로 돌아가기'`, `'신규 상품 등록'` 등)를 100% 동일하게 유지.<br>- `.scrollbar-hide` 등 스크립트가 참조하는 주요 클래스명 보존. |
| **API 연동 중 네트워크 지연/실패 시 화면 백화 현상** | 백엔드 미구동 시 프런트 화면이 빈 상태로 표시될 위험 | 높음 (High) | - 초기 상태에 기존 시드 데이터를 기본값(Fallback)으로 장착.<br>- API 호출 실패 시에도 친절한 Toast/오류 안내 및 기존 시드 데이터 렌더링 유지. |
| **이모지 교체 시 레이아웃 틀어짐** | 이모지 폰트 크기(`text-4xl`)와 SVG/이미지 크기가 상이하여 카드 높이 변경 | 중간 (Medium) | - 기존 컨테이너의 가로세로 비율(`aspect-square`, `w-12 h-12` 등)을 엄격히 고정.<br>- `object-fit: cover` 및 Flex 정렬로 레이아웃 이동(CLS) 0 달성. |
| **관리자 화면(다크 테마)과 쇼핑몰(화이트) 스타일 충돌** | 전역 CSS 또는 Tailwind 유틸리티 오염 | 중간 (Medium) | - 공통 디자인 토큰을 체계적으로 분리하되, 관리자 화면의 네이비/슬레이트 다크 테마 클래스 분리 격리 유지. |
| **데스크톱 QR 배너 위치 깨짐** | 반응형 모니터 폭에 따라 배너가 겹치거나 화면 밖으로 이탈 | 중간 (Medium) | - `left-90` 임의 클래스를 제거하고, 뷰포트 기준 중앙 모바일 컨테이너로부터의 상대 오프셋으로 안정화. |

---

## 4. 백엔드 연동 아키텍처 및 안전성 원칙

1. **독립 실행 보장**:
   - 프런트엔드(`frontend/`)와 백엔드(`backend/`)는 별도의 `package.json`을 가지며 각각 독립적으로 빌드 및 실행 가능해야 함.
2. **시드 데이터의 완벽성**:
   - 현재 프런트엔드 컴포넌트에 하드코딩된 모든 브랜드(12개), 추천 상품(4개), 브랜드 상품(6개), 구인 요청(2건), 근무자(2명), 메시지(1건)를 백엔드 DB 초기 마이그레이션 시드로 100% 이관.
3. **Zod 기반 런타임 유효성 검증**:
   - 관리자 상품 등록, 구인 등록, 판매 신청 등 모든 쓰기 API는 Zod 스키마를 통해 서버 측에서 엄격하게 검증하여 비정상 데이터 유입 방지.
4. **CORS 및 보안 미들웨어**:
   - Express 서버에 `cors`, `helmet`, `express.json` 적용 및 에러 핸들링 미들웨어 중앙 집중화.

---

## 5. 단계별 검증 및 롤백 계획

- **Phase별 Git 커밋 분리**: 각 단계(Phase 1, Phase 2, Phase 3, Phase 4, Phase 5)마다 독립적인 Git 커밋을 생성하여 문제 발생 시 즉시 롤백 가능하도록 보장.
- **연속적 빌드 검증**: 파일 수정 시마다 `npm.cmd run build` 및 `npx.cmd oxlint src`를 실행하여 컴파일 오류 및 린트 경고 즉시 해소.
- **기준선 스크린샷 비교**: 작업 후 `capture-all.js`를 재실행하여 기존 46장 캡처와 1:1 비교를 수행, 불필요한 시각적 회귀가 발생하지 않았는지 검증.
