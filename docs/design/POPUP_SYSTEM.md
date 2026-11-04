# luxuryRental 팝업·모달·토스트 시스템 설계서 (POPUP_SYSTEM)

## 1. 개요 및 설계 원칙

기존 프로젝트의 브라우저 기본 `alert()`, `confirm()` 및 각 화면에 개별 구현되었던 팝업 구조를 단일화된 공통 UI 컴포넌트 라이브러리와 컨텍스트 시스템으로 전면 개선합니다.

---

## 2. 팝업 유형별 규격 및 동작

| 유형 | 컴포넌트 | 용도 및 시각 표현 | 인터랙션 특징 |
|:---|:---|:---|:---|
| **Alert Modal** | `AlertDialog` | 시스템 공지, 오류 안내 (단일 '확인' 버튼) | ESC 닫기, 배경 클릭 닫기, 포커스 트랩 |
| **Confirm Modal** | `ConfirmDialog` | 삭제, 로그아웃, 접수 취소 등 ('취소', '확인' 버튼) | 파괴적 액션 시 Rose 색상 버튼, ESC 닫기 |
| **Success Modal** | `SuccessDialog` | 회원가입 완료, 상품 등록 완료, 위탁 신청 성공 | 에메랄드 체크 애니메이션, 확인 클릭 시 리다이렉트 |
| **Toast Notification** | `Toast` | 일시적 피드백 (로그인 성공, 찜 등록, 네트워크 안내) | 화면 상단/하단 부드러운 Slide-in, 3초 후 자동 소멸 |
| **Bottom Sheet** | `BottomSheet` | 모바일 친화적 필터, 옵션 선택, 약관 전문 보기 | 하단에서 부드럽게 Slide-up, 드래그/배경 클릭 닫기 |

---

## 3. 접근성 및 UX 원칙 (WCAG 2.1 준수)

1. **키보드 접근성 (ESC & Focus Trap)**:
   - 모달이 열리면 포커스가 첫 번째 상호작용 요소(입력창 또는 확인 버튼)로 자동 이동합니다.
   - Tab 키로 모달 내부에서만 포커스가 순환(Focus Trap)합니다.
   - `ESC` 키 입력 시 즉시 모달이 닫히며 직전 트리거 요소로 포커스가 복원됩니다.
2. **배경 스크롤 방지 (Body Scroll Lock)**:
   - 모달이 활성화된 동안 `document.body.style.overflow = 'hidden'`을 적용하여 모달 뒤 배경 컨텐츠의 스크롤을 방지합니다.
3. **모바일 컨테이너 세이프티**:
   - 모바일 뷰(`max-w-md`) 안에서 모달이 이탈하거나 잘리지 않도록 정밀한 z-index 레이어(`z-[100]`) 및 absolute/fixed 오버레이를 지원합니다.
4. **다중 팝업 방지**:
   - 동일 시점 복수 모달 스택 오버플로우 방지 및 우선순위 큐 관리.

---

## 4. ToastProvider 아키텍처

```tsx
// 사용 예시
const { showToast } = useToast();

showToast({
  message: '성공적으로 로그인되었습니다.',
  type: 'success', // 'success' | 'error' | 'info'
  duration: 3000
});
```
