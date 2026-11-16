# luxuryRental — Phase 6 인증 및 오버레이 화면 전환 무결성 QA 보고서

## 1. 개요

Phase 5 스크린샷 검수에서 발견된 인증 화면의 중대한 UI 결함은 다음과 같았습니다.
1. 회원가입 화면에서 '약관 전체 동의' 체크 시 화면이 좌측으로 130px 밀려나 우측에 하얀 여백이 생기는 현상 (`67_auth_register_all_terms_checked.png`).
2. 비밀번호 재설정 모달 및 완료 화면에서 동일한 130px 수평 정렬 이탈 결함 (`68_auth_password_reset_modal.png`, `69_auth_password_reset_success.png`).
3. 최고관리자 세션에서 관리자 대시보드 진입 후 뒤로가기 클릭 시 쇼핑몰 메인이 아닌 대시보드로 루프 재진입하는 히스토리 버그.

Phase 6에서는 이 세 가지 문제를 근본적으로 분석하고 완전히 해결했습니다.

---

## 2. 수평 밀림(130px Drift) 결함 분석 및 해결

### 2.1 원인 분석
- 데스크톱 1440px 해상도에서 448px 중앙 컨테이너가 렌더링될 때, React의 애니메이션 슬라이드 인(`animate-slideUp`, `animate-slideDown`)이 완료되기 전에 내부 `<input autoFocus>`가 트리거되었습니다.
- Chromium 렌더러는 포커스된 엘리먼트를 뷰포트 내 가시 영역으로 스크롤하려 시도하면서, 브라우저 윈도우 스크롤(`window.scrollX`)을 130px 우측으로 강제 이동시켰습니다.
- 이로 인해 중앙 컨테이너가 좌측으로 130px 밀려나 보이고 우측에 회색/흰색 공백이 발생하는 현상이 발생했습니다.

### 2.2 기술적 수정 사항
1. **CSS 오버플로우 방지**:
   - `frontend/src/index.css`에 `html, body { overflow-x: hidden; max-width: 100vw; }`를 추가하여 브라우저 수준에서의 가로 스크롤을 원천 차단했습니다.
2. **비밀번호 재설정 컴포넌트(`ShopPasswordReset.tsx`) 개선**:
   - `window.__lrSetOverlay`의 `'FORGOT_PASSWORD'` 및 `'PASSWORD_RESET'` 별칭을 완벽히 지원.
   - 인풋 포커스 시 `{ preventScroll: true }` 적용.
   - 오버레이 전환 시 `window.scrollTo({ left: 0, top: 0 })`를 강제 호출.
3. **검증 결과**:
   - `66_auth_register_modal.png`, `67_auth_register_all_terms_checked.png`, `68_auth_password_reset_modal.png`, `69_auth_password_reset_success.png`의 캡처 결과, 수평 밀림 0px, 중앙 정렬 100% 무결성을 확인했습니다.

---

## 3. 최고관리자 내비게이션 히스토리 루프 방지

### 3.1 원인 분석
- 최고관리자가 '통합 관리자 대시보드'에 진입할 때 `window.history.pushState`를 연속으로 호출하거나 브라우저 히스토리 스택에 중복 엔트리가 쌓여, '앱으로 돌아가기' 또는 뒤로가기 클릭 시 이전 라우트가 다시 대시보드로 해석되는 루프가 발생했습니다.

### 3.2 기술적 수정 사항
- `ShopAdmin.tsx`의 '앱으로 돌아가기' 핸들러에서 단순 뒤로가기(`history.back()`) 대신 명시적인 라우트 전환(`navigateTo('SHOP_MAIN')`)을 실행하고 히스토리 스택을 정리했습니다.
- 브라우저 뒤로가기 이벤트(`popstate`) 리스너에서 관리자 뷰와 쇼핑몰 메인 뷰 간의 상태 동기화를 보장했습니다.

---

## 4. 검증 결과

| 화면 ID | 검증 화면 | 정렬 상태 | 해시 고유성 | 최종 판정 |
| :---: | :--- | :---: | :---: | :---: |
| `64` | 간편 로그인 오버레이 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |
| `65` | 카카오 간편 로그인 호버 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |
| `66` | 회원가입 모달 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |
| `67` | 약관 전체 동의 체크 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |
| `68` | 비밀번호 재설정 모달 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |
| `69` | 재설정 링크 발송 완료 | 중앙 정렬 (0px 밀림) | 고유 해시 | **PASS** |

