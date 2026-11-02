# M4-N: Mobile browser emulation and real-device QA

## 2026-11-02 implementation scope
- **Playwright Chromium responsive web checks** added for Expo Router at 360×780, 390×844, and tablet 768×1024. Touch/mobile browser emulation is **not** equivalent to Android or iOS runtime validation.
- Screenshot artifacts of tab navigation, rental flow, wishlist and isolated connection failure are attached to CI run.
- An independent `api-unreachable` build uses a public `EXPO_PUBLIC_API_URL` set to an unreachable loopback server. Test must show an explicit network error, retry, and no silent switch to local demo goods.
- Interactive control accessible-name smoke check added to the web suite. This is **not WCAG AA conformance**; contrast, voiceover, focus order and native screen reader need separate assessment.
- Tab bar consumes bottom safe-area inset on supported native devices rather than hardcoded height alone. This is a preventive code change, **not a claim of native QA PASS**.

## CI
- New `.github/workflows/m4n-visual.yml` invokes the Expo web development server, Playwright Chromium and stores HTML reports/screenshots/traces (14 days).
- The existing Expo TypeScript/Node API/MySQL CI remains unchanged. Browser visual QA may reveal further bugs; only record PASS after the actual GitHub run confirms it.
- Review captured screenshots manually for clipped text, overlaps, responsive grid, calendar & keyboard focus. Automation detects only selected regressions.

## Not yet verified / native acceptance gate
- [ ] Android real hardware or emulator on representative resolution, OS and physical keyboard
- [ ] iOS simulator or physical iPhone (Mac/iOS environment) and accessibility VoiceOver
- [ ] TalkBack/screen reader name, hierarchy, touch size, keyboard dismissal, color contrast
- [ ] 360px/390px/tablet true native safe area and portrait/landscape support
- [ ] Sample vs real Node API from device Wi-Fi, timeout/offline, 401/403/409 behavior
- [ ] Figma artwork and user-journey inspection of actual screenshots, license-approved product visuals
- [ ] `npx expo-doctor` and Expo Native SDK dependency compatibility
- [ ] UI issue triage and fixes with rerun logs

This is a **pre-M5 QA package**, not commercial release approval. Order/booking/payments are not active. Existing `567890` web and operational database remain untouched.

References: [Playwright Test configuration](https://playwright.dev/docs/test-configuration), [Expo CLI CI](https://docs.expo.dev/more/expo-cli/), [Issue #10](https://github.com/nalkarowndal/lR/issues/10).
