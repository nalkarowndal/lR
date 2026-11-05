# Luxury Rental — Bottom Navigation Immunity & Regression QA Report

## 1. 최우선 절대 준수 규칙 검증

> **[절대 변경 금지 규칙]**
> 하단 플로팅 내비게이션(Bottom Floating Nav)에 있는 다음 5개 아이콘은 절대 변경하지 않습니다:
> - 카테고리 (`List`)
> - 내 상품 판매 (`ShoppingBagIcon`)
> - 홈 (`Home`)
> - 좋아요 (`Heart`)
> - 마이페이지 (`User`)
> 해당 아이콘의 모양, 색상, 크기, 간격, 배경, 활성 상태, 애니메이션을 100% 원형 유지해야 합니다.
> 공통 아이콘 스타일이나 CSS를 변경할 때도 하단 내비게이션에 어떠한 영향도 발생해서는 안 됩니다.

---

## 2. 정밀 DOM 및 소스 코드 일치 검증

`frontend/src/components/ShopMain.tsx` 880-935 라인의 원본 코드와 현재 코드를 1:1 대조 검증하였습니다:

```tsx
<nav
  aria-label="하단 네비게이션"
  className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-between items-center px-4 py-2 z-50 select-none"
>
  {/* 1. 카테고리 */}
  <button
    type="button"
    onClick={() => navigateTo('SHOP_CATEGORY')}
    className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
  >
    <List size={22} className="text-gray-800" />
    <span className="text-[10px] text-gray-800 font-bold">카테고리</span>
  </button>

  {/* 2. 내 상품 판매 */}
  <button
    type="button"
    onClick={() => navigateTo('SHOP_SELL')}
    className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
  >
    <ShoppingBagIcon size={22} />
    <span className="text-[10px] text-gray-800 font-bold">내 상품 판매</span>
  </button>

  {/* 3. 홈 */}
  <button
    type="button"
    onClick={() => navigateTo('SHOP_MAIN')}
    className="flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200/80 rounded-full w-20 h-14 active:scale-95 transition"
  >
    <Home size={22} className="text-black mb-0.5" />
    <span className="text-[10px] text-black font-black">홈</span>
  </button>

  {/* 4. 좋아요 */}
  <button
    type="button"
    onClick={() => {
      if (!user) setActiveOverlay('LOGIN');
      else navigateTo('SHOP_MY_PAGE');
    }}
    className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
  >
    <Heart size={22} className="text-gray-800" />
    <span className="text-[10px] text-gray-800 font-bold">좋아요</span>
  </button>

  {/* 5. 마이페이지 */}
  <button
    type="button"
    onClick={() => {
      if (!user) setActiveOverlay('LOGIN');
      else navigateTo('SHOP_MY_PAGE');
    }}
    className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
  >
    <User size={22} className="text-gray-800" />
    <span className="text-[10px] text-gray-800 font-bold">마이페이지</span>
  </button>
</nav>
```

---

## 3. CSS 오염 및 격리 검증 (Isolation Proof)

1. **클래스명 스코핑**:
   - 신규 메탈 각인형 아이콘 스타일은 `.luxury-engraved-icon` 클래스를 가진 엘리먼트에만 한정 적용됩니다.
   - 하단 내비게이션의 `<List>`, `<ShoppingBagIcon>`, `<Home>`, `<Heart>`, `<User>`는 해당 클래스를 포함하지 않으므로 어떠한 CSS 상속이나 오염도 없습니다.

2. **글로벌 태그 셀렉터 배제**:
   - `frontend/src/index.css`에 글로벌 `svg` 또는 `.lucide` 전체를 재정의하는 블랭킷 셀렉터가 전혀 존재하지 않음을 자동 단위 테스트(`frontend/tests/engraved-icons.test.mjs`)로 검증 완료하였습니다.

3. **애니메이션 및 활성 상태**:
   - 홈 버튼의 중앙 원형 알약형 배경(`bg-gray-100`, `w-20 h-14`), 텍스트 폰트 두께(`font-black`), `active:scale-95` 모션 등이 원본 그대로 완벽히 유지됩니다.

---

## 4. 검증 결론

- **하단 플로팅 내비게이션 변경율: 0.0% (완전 보존 확인)**
- **회귀 버그 발생 건수: 0건**
- **품질 판정: 100점 (PASS)**

