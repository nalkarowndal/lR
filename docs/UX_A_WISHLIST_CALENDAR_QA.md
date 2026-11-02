# UX-A : wishlist / calendar screenshot QA and corrections

This phase addresses the user-provided screenshots, without changing the commerce or payment architecture.

## Observations and fixes
- Screenshot `32_wishlist_with_items` showed an empty list. React State is deliberately **memory-only**, so cross-refresh/browser-context screenshots cannot prove whether the add→wishlist navigation works. An automated Playwright test now runs both in the **same page/context**, asserts the selected card and count, captures the populated screenshot, removes the favorite, and asserts empty state. Explicit copy explains refresh loses the demo favorite; this phase does **not** add hidden persistence or account storage.
- `tablet_calendar` showed product-not-found. This can happen on a direct link with an invalid id; the test now explicitly checks recovery and separates it from normal product→calendar navigation. Valid product IDs must be passed through Expo Router route parameters.
- `Calendar.tsx` formerly removed the date grid when `width<384`, and sized its cells from global screen width. New responsive constrained grid works at 360,390,768px and shows return date as **exclusive**. Invalid dates show a visible alert; no new commercial date policies are inferred.
- The quotation expiry date now uses `Intl.DateTimeFormat` in `Asia/Seoul`, rather than displaying the raw ISO timestamp fragment.

## Evidence required for merge
- Expo TypeScript / unit tests / web export CI PASS.
- Chromium offline screenshots for populated wishlist, removed wishlist, valid 4-day rental calendar, invalid deep-link recovery at three viewports. API-unreachable regression CI unaffected.
- This is browser emulation only, not Android/iOS native QA.
- Browser screenshot artifacts are retained by GitHub Actions per workflow retention. **Do not claim screenshots were manually inspected unless they actually were.**

## Next phases (separate changes)
1. UX-B: product media contract with license-aware approved image sources, product detail gallery, card alt text and per-product illustrations as explicitly demo placeholders.
2. UX-C: search filters/sort, accessible responsive 2-column mobile and 3-4 column tablet grid, and visual regression.
3. Keep rental/checkout/PG and operational database unchanged, preserve original white–ink–pastel theme and five tabs.
