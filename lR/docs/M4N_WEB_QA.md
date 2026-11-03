# M4-N: Mobile browser emulation and real-device QA

## 2026-11-02 implementation scope
- **Playwright Chromium responsive web checks** added for Expo Router at 360×780, 390×844, and tablet 768×1024. Touch/mobile browser emulation is **not** equivalent to Android or iOS runtime validation.
- Screenshot artifacts of tab navigation, rental flow, wishlist and isolated connection failure are attached to CI run.
- An independent `api-unreachable` build uses a public `EXPO_PUBLIC_API_URL` set to an unreachable loopback server. Test must show an explicit network error, retry, and no silent switch to local demo goods.
- Interactive control accessible-name smoke check added to the web suite. This is **not WCAG AA conformance**; contrast, voiceover, focus order and native screen reader need separate assessment.
- Tab bar consumes bottom safe-area inset on supported native devices rather than hardcoded height alone. This is a preventive code change, **not a claim of native QA PASS**.

## CI
- New `.github/workflows/m4n-visual.yml` invokes the Expo web development server, Playwright Chromium and stores HTML reports/screenshots/traces (14 days).
- The existing Expo TypeScript/Node API/MySQL CI remains unchanged. Browser test assertions **PASS** on [run #41383695339](https://github.com/nalkarowndal/lR/actions/runs/41383695339): offline 12/12 (3 viewport projects), API-unreachable 3/3; mobile TypeScript/domain/export [run #41383695435](https://github.com/nalkarowndal/lR/actions/runs/41383695435): PASS.
- Review captured screenshots manually for clipped text, overlaps, responsive grid, calendar & keyboard focus. Automation detects only selected regressions.

## Verified CI evidence (2026-11-02)
- [Playwright Chromium CI](https://github.com/nalkarowndal/lR/actions/runs/41383695339): **15 tests PASS**, failure 0; [Expo mobile CI](https://github.com/nalkarowndal/lR/actions/runs/41383695435): PASS.
- [Offline responsive screenshots and HTML report (14 days)](https://github.com/nalkarowndal/lR/actions/runs/41383695339/artifacts/13114721964) — tabs, demo quotation and wishlist.
- [Unreachable API screenshots / report (14 days)](https://github.com/nalkarowndal/lR/actions/runs/41383695339/artifacts/13114786569) — network error / retry, no fixture fallback.
- Earlier test failures were **locator issues** where an inactive Expo Router view retained hidden copies of product titles. Fixed selectors to use accessible, currently visible product-card controls. Existing app code wasn't modified for these test-only failures.
- **Not independently inspected:** attached screenshots' visual fidelity, specific color contrast, keyboard, Android/iOS native app.

## Not yet verified / native acceptance gate
- [ ] Android real hardware or emulator on representative resolution, OS and physical keyboard
- [ ] iOS simulator or physical iPhone (Mac/iOS environment) and accessibility VoiceOver
- [ ] TalkBack/screen reader name, hierarchy, touch size, keyboard dismissal, color contrast
- [ ] 360px/390px/tablet true native safe area and portrait/landscape support
- [ ] Sample vs real Node API from device Wi-Fi, timeout/offline, 401/403/409 behavior
- [ ] Figma artwork and user-journey inspection of actual screenshots, license-approved product visuals
- [x] Expo Doctor **20/20** and `npx expo install --check` compatibility **PASS** on [CI #41566382082](https://github.com/nalkarowndal/lR/actions/runs/41566382082); this is static preflight, not real-device QA
- [ ] UI issue triage and fixes with rerun logs

This is a **pre-M5 QA package**, not commercial release approval. Order/booking/payments are not active. Existing `567890` web and operational database remain untouched.

References: [Playwright Test configuration](https://playwright.dev/docs/test-configuration), [Expo CLI CI](https://docs.expo.dev/more/expo-cli/), [Issue #10](https://github.com/nalkarowndal/lR/issues/10).

## M6-1B5 native project preflight (2026-11-03)

- [PR #36](https://github.com/nalkarowndal/lR/pull/36) runs Expo Doctor within mobile CI and removes obsolete `android.edgeToEdgeEnabled` and `newArchEnabled` options from SDK 58 app config. Android edge-to-edge and React Native New Architecture remain platform defaults.
- [CI #41566382082](https://github.com/nalkarowndal/lR/actions/runs/41566382082): **20/20 Expo Doctor**, `expo install --check` compatible, mobile **25/25** and Expo web export. Actual native device/simulator and VoiceOver/TalkBack are still **NOT RUN**.
- Device test IDs, OS/device/build evidence rules, offline vs TEST HTTPS scenarios: [M6-1B5 runbook](M6_1B5_DEVICE_QA_RUNBOOK.md). Open [Issue #10](https://github.com/nalkarowndal/lR/issues/10) until real native evidence is supplied.
