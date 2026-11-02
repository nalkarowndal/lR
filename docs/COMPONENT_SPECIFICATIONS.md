# M2 — 컴포넌트 명세
[토큰](DESIGN_SYSTEM.md) · [화면](SCREEN_WIREFRAMES.md). 모든 치수는 논리 단위, 최소 크기는 글꼴 확대 시 증가한다.

## 상태 계약
모든 조작 컴포넌트는 default / pressed / focused / disabled, 비동기 조작은 loading / error를 가진다. disabled 이유를 주변 문구로 제공한다. loading에서 라벨을 유지하고 busy 상태를 전달한다. 중요 메시지는 자동 사라지는 toast만으로 전달하지 않는다.

| ID / 이름 | 구성·입력 | 치수·변형 | 상호작용·검수 |
|---|---|---|---|
| C01 AppHeader | title, back, actions | 최소 높이 56; 타이틀 20/30; 액션 각 48 | 뒤로는 stack pop; 긴 제목 줄바꿈; 화면 진입 시 제목 초점 |
| C02 BottomTabs | 5 고정 라벨, selected | 좌우 12, 내부 6; 각 48 이상; 가변 높이 | 선택 배경/라벨 무게; 인디케이터가 텍스트와 겹치지 않음; tab/selected 읽기 |
| C03 ActionButton | label, variant, state | primary ink/white, secondary white/ink, destructive error; 높이 ≥48, 좌우16, radius12 | 한 번 실행 중 중복 차단; 라벨 줄바꿈 시 높이 확장; 2단계 제출도 서버 멱등성 필요 |
| C04 IconAction | icon, accessibleLabel, badge | 아이콘 20~24, 터치 48 | ‘찜 추가/해제’ 등 목적 명시; 뱃지 숫자만 읽지 않음 |
| C05 ServiceCard | title, description, destination | rental/store/sell/care, padding16, radius16 | 전체 카드 1 링크, 장식 이미지 읽기 제외; 서비스명은 색과 독립 |
| C06 ProductCard | id,title,brand,image,condition,offers | 이미지 4:3, 가격 16, 제목 최대2줄, grid/list | rental/store 명시; 찜은 독립 액션; 가격 미정은 0원 대신 ‘가격 확인 필요’ |
| C07 FormField | label,value,required,hint,error | 입력 최소52, body16, 외곽 border | 영구 라벨; placeholder만으로 설명 금지; 오류는 필드 아래+요약, 첫 오류 초점 |
| C08 ChoiceChip | label, selected, enabled | 높이48, padding12 | 색+체크/텍스트; 다중/단일 선택 구분; 해제 가능 여부 명시 |
| C09 DateRange | KST start, return, availability | 달력 7열×48 + 열 간격2×6 = 가용폭348 필요; 그 미만 또는 큰 글꼴은 입력형 대안 | 시작/반납 레이블, 선택 범위와 불가 이유; 차단된 시작일과 반납 경계 허용 여부 구별 |
| C10 PriceBreakdown | rentalDays, fee,discount,shipping,deposit,payableNow | label/value 행, 금액 우측; 큰 글꼴은 위아래 | 서버 값 표시; 보증금 별도; 견적 변경 강조·재동의; 합계에 demo 표기 |
| C11 CheckoutBar | payableNow,label,busy | 총액+48 CTA, safe bottom | 본문 바닥에 바 높이만큼 여유; 키보드 열리면 입력을 가리지 않게 스크롤 |
| C12 StatusBadge/Timeline | domain,state,updatedAt | 텍스트+아이콘, 완료/진행/대기 구분 | 색만으로 의미 전달 금지; rental/order/repair 상태 혼용 금지 |
| C13 UploadTile | local/file id, progress,error | 목표96 이상, 제거 버튼48 | pending/uploading/success/error; 파일별 재시도; 사진 내용 읽기는 설명 기반 |
| C14 Sheet/Dialog | title,body,actions,invoker | 최대 안전영역90%, 내용 스크롤 | 초점 시트 내부, 닫기48, 배경 조작 차단, 닫은 뒤 호출자 초점 |
| C15 FeedbackPanel | loading/empty/error/offline/conflict | heading20, body16, CTA48 | 장애 원인·다음 행동; requestId는 지원 상세에만 |
| C16 ConsentRow | label,required,checked,policyVersion | 행 전체48, 약관 링크 별도 | 필수/선택 구분, 기본 미선택; ‘전체 동의’가 선택 동의를 은폐하지 않음 |
| C17 HoldNotice | expiresAt,server status | 항상 보이는 문구+선택적 잔여시간 | 만료 임박/만료만 낭독; 백그라운드 복귀 시 재조회; 카운터만으로 결제 실패 판정 금지 |
| C18 Stepper | current,total,labels | 위탁 3단계, 가로/세로 | ‘2/3 제품 종류’ 읽기; 완료한 단계만 복귀; 폼 유지 |

## 입력과 제출
주소·연락처·회원 정보의 정확한 필수/최대 길이, 사진 수/크기/형식은 M1에 모두 확정되지 않았다. 서버 정책을 받아 표기하고 [GAP](INTERACTION_SPEC.md)에 따라 구현 전 계약을 보완한다. UI가 임의 제한을 실제 운영 기준으로 만들지 않는다.
키보드 유형은 필드에 적합하게 선택하되 국제 전화번호·우편번호 등을 수치 연산 값으로 취급하지 않는다. 완료 키는 다음 필드 또는 키보드 닫기, 최종 결제를 직접 실행하지 않는다.

## Figma 표현 범위
공통 반복 요소는 편집 가능한 로컬 컴포넌트/인스턴스로 구성한다. 토큰과 텍스트 스타일을 연결한다. 실제 컴포넌트 제작 수·인스턴스 수는 [QA](M2_VISUAL_QA.md)에 기록한다. 위 표의 모든 상태 조합을 Figma에 구현했다고 해석하지 않는다. OS 권한창, 이미지 선택, PG 창은 별도 명시된 시연 단계이며 실제 시스템 UI가 아니다.
