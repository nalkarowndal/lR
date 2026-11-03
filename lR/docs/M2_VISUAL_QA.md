# M2 — Figma·시각 QA와 인계
2026-11-02 (Asia/Seoul). **문서·와이어프레임 검토용 산출물. M2 최종 시각 승인과 런타임 TEST_PASS는 미완료.**

## 파일과 프로토타입
- [편집 가능한 Figma 파일](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja)
- [홈·렌탈 시작](https://www.figma.com/proto/6mmceyHRPsWoR1JxUAnMja?node-id=4-104)
- [구매 시작](https://www.figma.com/proto/6mmceyHRPsWoR1JxUAnMja?node-id=4-344)
- [수선 시작](https://www.figma.com/proto/6mmceyHRPsWoR1JxUAnMja?node-id=4-425)

페이지: M2 · Screens & prototype. Foundations에 원본 색상/서체 폴백과 공통 컴포넌트가 있다. 기준 프레임 390×844. 모든 입력·가격·성공 상태는 합성 시연이며 API·권한·PG·사진 업로드가 동작하지 않는다. 와이어프레임의 설명 카드가 실제 입력 컨트롤 구현을 의미하지 않는다.

F01: 홈→렌탈→상품→기간→견적→로그인→주문서→결과 확인 중→‘시연: 렌탈 승인 응답’→예약 결과→상세.
F02: 스토어→상품→‘구매 선택·장바구니’→주문서→결과 확인 중→‘시연: 구매 승인 응답’→주문 상세.
F03: 수선→신청→접수/견적 화면. 업로드 실패 버튼은 실패 예외로 이동.
예외: 기간선택→예약 충돌→기간 복귀, 결제 확인 중→실패→렌탈 주문서, 수선 신청→실패→신청 복귀. 공통 결제 대기 분기에서 구매 실패를 렌탈 주문서로 돌려보내는 시연 제약이 있으므로 구매 실패의 실제 복귀는 [인터랙션](INTERACTION_SPEC.md)대로 구매 context를 보존해야 한다.

## 실행한 검증과 증거
| 검증 | 실제 결과 | 한계 |
|---|---|---|
| 문서 정적 검증 | 변경 Markdown 9개, 내부 링크 누락0, 중복 화면ID0, 코드블록 짝 오류0, 앱 코드 파일0 | 저장소의 기존 파일 목록과 대조 |
| M1 IA ID 대조 | 29/29 화면 ID 일치, 별도 EX-01~04 추가 | P1 승인/구현을 뜻하지 않음 |
| Figma 구조 읽기 | 33개 화면, 642개 하위 노드: FRAME124 / TEXT352 / INSTANCE166 | 마지막 성공 구조 조회 기준 |
| 편집 가능성 | 이미지로 평탄화된 UI 0개, 편집 텍스트·오토레이아웃·인스턴스 사용 | 실제 상품 사진은 와이어프레임 대체 |
| 공통 시스템 | 로컬 컴포넌트7, 텍스트 스타일5, 변수42(원시14+의미14+간격9+반경5) | 18개 컴포넌트 명세의 모든 상태를 Figma로 만든 것은 아님 |
| 서체 읽기 | 모든 화면 텍스트 Noto Sans KR | 원본 Pretendard의 선언된 폴백; 앱 글꼴 적용 미검증 |
| 배치 읽기 | 33개 화면의 본문/푸터 영역 겹침0 | 모든 텍스트·모든 기기의 시각 PASS는 아님 |
| 연결 그래프 | 72개 화면 이동 연결; 홈+시작 화면에서 33개 모두 도달 가능 | Figma 플레이어를 실제 터치로 순회한 테스트는 미실행 |
| 스크린샷 시각 확인 | 홈, 기간 선택, 렌탈 주문서, 수선 신청 확인 | 모든 화면별 스크린샷 검수 미실행 |
| 수정 확인 | 제목 한글 자동 높이 잘림 수정 후 홈 렌더 확인; 탭 라벨 중앙 정렬 | 이후 아래 잔여 항목 발견 |
| 독립 설계 검토 | 29 ID·금액·날짜·서버확정 일관성 확인; 360폭 달력 이슈 수정 | 문서 검토, 네이티브 테스트 아님 |

초기 Figma 자기 탭 연결은 도구가 거부하여 같은 화면으로의 이동을 제외하고 다시 생성했다. 최종 파일의 기본 화면은 29개이며 실패한 시도의 중복 프레임은 구조 조회에서 발견되지 않았다.

## 남은 Figma 시각 보완 — 명세는 문서가 우선
마지막 보완 호출에서 **Starter 플랜 Figma MCP 호출 한도** 응답이 발생하여 적용되지 않았다. 파일 생성·33개 화면·프로토타입 연결은 그 전에 성공했고 구조를 읽어 검증했다. 결제 총액/반납일 강조와 월간 달력 보완을 요청했지만 성공했다고 표시하지 않는다.

| 항목 | 현 Figma 상태 | 요구된 최종 설계 / 영향 |
|---|---|---|
| RT-02 월간 달력 | 11월8~21일 선택 예시만 그려짐 | 월 전체·이전/다음 제어 필요; 작은 폭은 입력형 대안. 현재는 날짜 선택을 자유롭게 실행하는 달력 아님 |
| RT-04 주문서 | 대여료84,000 + 보증금100,000 문구 | 총액184,000원과 11/13 반납일을 명시적으로 함께 노출해야 함; 문서와 RT-03에는 존재 |
| SH-03 주문서 | 총액900,000원 텍스트 존재 | 하단 결제 액션 근처 합계 반복 강조 필요 |
| 결제 실패 분기 | 공통 EX-03→렌탈 주문서 | 구매 context일 때 SH-03 복귀로 분리 필요 |
| P1 연장/위탁·설정 | 개념 와이어프레임과 기본 연결 | 실제 확정·저장 동작 아님; API GAP 해결 전 준비 중 표시 |
| 양식·모달·반응형 | 화면 구성과 문서에 정의 | 실제 입력·모달 트랩·업로드·360/430·큰 글꼴 프레임 검증 미실행 |

위 항목을 해결하기 전 **M2 시각 승인 완료/개발 시작 승인으로 간주하지 않는다**. 도구 한도 복구 후 보완하거나 Figma에서 수동 수정 가능하다. 런타임을 만들기 위해 이 제한을 우회하지 않는다.

## 대비 계산 기록
sRGB 각 채널을 선형화하고 상대휘도 L=0.2126R+0.7152G+0.0722B, (L밝음+0.05)/(L어두움+0.05)로 계산했다. 불투명 토큰 조합 기준이다.

| 조합 | 계산 대비 |
|---|---|
| ink/surface | 17.74:1 |
| sub/surface | 7.56:1 |
| accent/surface | 6.29:1 |
| error/surface | 6.47:1 |
| success/surface | 7.13:1 |
| warning/surface | 7.09:1 |
| border/surface | 4.83:1 |
| ink/rental | 16.25:1 |
| ink/store | 16.30:1 |
| ink/sell | 16.95:1 |
| old muted/surface | 2.54:1 |

새 본문/보조/링크/오류/성공/주의는 흰색에서4.5:1 이상. 입력 경계4.83:1은 UI3:1 목표를 넘는다. 원본 muted는2.54:1이므로 필수 텍스트에서 제외. 렌더링된 OS 상태바/사진 위 텍스트/비활성 상태는 별도 검증 대상이다.

## 인수 기준 추적과 미실행
AT-NAV-01/02, AT-PRD-02, AT-REN-01/05/06, AT-ORD-01~04, AT-CARE-01~03, AT-CON-01, AT-UI-01/02를 [화면](SCREEN_WIREFRAMES.md)·[인터랙션](INTERACTION_SPEC.md)에 대응했다. 기존 AT ID와 수락 조건은 변경하지 않았다.
모든 네이티브·API·DB·결제·보안·실기기·스크린리더 테스트는 **NOT_TESTED**. 이 문서의 구조/대비 계산을 TEST_PASS로 승격하지 않는다. M2 사용자 검토 후 승인자·날짜·파일/노드·수정 이력을 기록한다.

## 화면 노드 인덱스
| ID | 화면 | Figma |
|---|---|---|
| CM-01 | 시작 | [4:2](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-2) |
| CM-02 | 로그인 | [4:17](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-17) |
| CM-03 | 가입 / 동의 | [4:34](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-34) |
| CM-04 | 통합 검색 | [4:51](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-51) |
| CM-05 | 상품 상세 | [4:68](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-68) |
| CM-06 | 알림 | [4:87](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-87) |
| HM-01 | LUXURYRENTAL | [4:104](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-104) |
| HM-02 | 기획전 | [4:133](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-133) |
| RT-01 | 렌탈 | [4:150](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-150) |
| RT-02 | 기간 선택 | [4:178](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-178) |
| RT-03 | 렌탈 견적 | [4:238](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-238) |
| RT-04 | 렌탈 주문서 | [4:255](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-255) |
| RT-05 | 예약 결과 | [4:274](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-274) |
| RT-06 | 예약 상세 | [4:291](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-291) |
| RT-07 | 반납 신청 | [4:310](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-310) |
| RT-08 | 기간 연장 | [4:327](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-327) |
| SH-01 | 스토어 | [4:344](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-344) |
| SH-02 | 장바구니 | [4:372](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-372) |
| SH-03 | 구매 주문서 | [4:389](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-389) |
| SH-04 | 주문 상세 | [4:406](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-406) |
| RP-01 | 수선·복원 | [4:425](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-425) |
| RP-02 | 수선 신청 | [4:453](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-453) |
| RP-03 | 수선 진행 / 견적 | [4:474](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-474) |
| MY-01 | 마이 | [4:493](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-493) |
| MY-02 | 찜 | [4:527](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-527) |
| MY-03 | 내 대여 | [4:544](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-544) |
| MY-04 | 구매 내역 | [4:561](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-561) |
| MY-05 | 판매 위탁 | [4:578](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-578) |
| MY-06 | 계정 / 설정 | [4:595](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-595) |
| EX-01 | 기간을 다시 선택해 주세요 | [4:612](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-612) |
| EX-02 | 결제 결과 확인 중 | [4:627](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-627) |
| EX-03 | 결제가 완료되지 않았어요 | [4:646](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-646) |
| EX-04 | 사진 업로드를 다시 확인 | [4:661](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja?node-id=4-661) |

## 인계 체크
- [x] 원본 소스 고정·색상 불일치 기록·M1 기능 우선순위 보존
- [x] 화면29개·공통 컴포넌트18종 명세·주요 흐름·API 미결10건 기록
- [x] 구조/연결/색상 대비 계산·독립 문서 검토
- [ ] 위 Figma 잔여 보완·플레이어 실제 순회·사용자 시각 승인
- [ ] M4/M6 네이티브 접근성·실기기 테스트
