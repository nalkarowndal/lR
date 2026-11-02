# luxuryRental Expo Mobile — M5.1 demo account UI and M4 API integration

Expo SDK 58 + React Native + Expo Router. Preserves the original luxuryRental white/ink/pastel M2 UI and 5 customer tabs (홈/렌탈/스토어/수선/마이).

## Data modes (explicit)
- **Offline demo:** No `EXPO_PUBLIC_API_URL`. Screens use bundled synthetic M2 sample products and an explicitly fake rental quote. No server, booking, personal information or payment.
- **Node TEST API:** Set `EXPO_PUBLIC_API_URL` to the reachable Node API origin. Catalog, search, product detail, favorites/cart product lookups, date availability and quote request use the **real HTTP response** backed by the isolated `lr_test` MySQL database.
- **API failure means error**, not an invisible fallback to synthetic products. Retry and empty/loading/network errors are handled by the UI.
- The **checkout and cart are visual demonstrations only**; no order/rental, payment or authenticated hold is sent from the mobile client. **M5.1 test accounts**: native iOS/Android uses `expo-secure-store` for opaque access token, while the browser keeps the token **in memory only** and forgets it after refresh. Do not use real user emails or passwords.

## M5.1 demo account / session (not production)
- My tab → **테스트 계정 로그인** → separate test-only registration or login. `GET /api/v1/me` must verify session before rendering user identity/roles.
- Native: SecureStore encrypted session persistence; web: memory only, no localStorage or AsyncStorage. `logout` clears the app's temporary wishlist/cart/draft and attempts server revocation.
- **Passwords and bearer tokens cannot travel over cleartext LAN HTTP.** The auth client accepts `https://` origins or same-device `http://localhost` / `http://127.0.0.1`; for device tests configure an HTTPS reachable API. Expo public URL is not an API secret.
- [Full policy and missing business approvals](../../docs/M5_1_POLICY_GATE.md). Real user verification, distributed abuse defense, native device QA, payment and actual account-based wishlist are not completed.

## Run
```sh
npm install
# (optional) copy apps/mobile/.env.example into apps/mobile/.env.local and set EXPO_PUBLIC_API_URL
npm run mobile
npm run web:mobile
npm run typecheck:mobile
npm run test:mobile
npm run build:mobile:web
```

For testing against a local backend see [M4 mobile/API setup](../../docs/M4_MOBILE_API.md). On physical devices, `localhost` refers to the device itself, **not** the development PC: configure the PC's private LAN IP and use a trusted test Wi-Fi only. Expo public environment values are visible inside bundles; do not include keys or credentials.

Backend setup: [API README](../api/README.md). Exact web browser CORS origins need `API_CORS_ORIGINS` in the Node environment.

## CI evidence
- [M5.1 mobile #41385121007](https://github.com/nalkarowndal/lR/actions/runs/41385121007): 21/21 PASS + TypeScript + Expo web build.
- [M5.1 Node/MySQL + live mobile auth #41385121036](https://github.com/nalkarowndal/lR/actions/runs/41385121036): API 35/35 PASS, real HTTP 5/5 PASS.
- [M5.1 Playwright #41385121132](https://github.com/nalkarowndal/lR/actions/runs/41385121132): 360/390/768px web emulation 21/21 PASS (offline 15, API disconnected 6).
- [Mobile checks #41381735807](https://github.com/nalkarowndal/lR/actions/runs/41381735807): TypeScript, **14/14 unit/DTO/network contract tests**, Expo web export PASS
- [Node/MySQL + real mobile client #41381735806](https://github.com/nalkarowndal/lR/actions/runs/41381735806): **34/34 API tests** and **4/4 real HTTP client integration tests** PASS (isolated MySQL 8.4)
- **Not tested:** actual Android/iOS devices, keyboard/screen reader visual QA, production HTTPS and distribution builds.

## Preserved but not implemented
- Real images/licensing and exact editorial Figma parity approval
- Real **production** account signup/login and email verification (M5.1 provides only isolated demo account UI)
- Payment, order, saved wishlist, address, upload, repair ticket, ERP/CMS sync
- Existing web's staff RecruitApp is separate from customer mobile tabs

Reference: [M4 contract and limitations](../../docs/M4_MOBILE_API.md).
