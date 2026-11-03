# M4 — Expo mobile ↔ Node API integration

## Scope delivered by M4 PR

- Explicit `EXPO_PUBLIC_API_URL` **build-time public setting** selects TEST API mode; if unset, keep the M2 local UI demonstration. **No silent demo fallback after an HTTP, network or DTO failure.**
- Typed catalog adapter follows the real M3 responses, not old local product object fields. Network DTOs contain `condition`, `demo`, `channels`, nullable offer prices and `meta.page.cursor`; mobile maps them to stable placeholder art (no licensed brand imagery).
- Home, Rental, Store, Search (300ms debounced), Product Detail, Wishlist, Cart resolve catalog via API. Shared list supports cursor pagination and explicit error/retry/empty/loading feedback.
- Rental calendar requests `GET /api/v1/products/:id/availability` for selected `[startDate,returnDate)`, and **disables Continue** if server says unavailable or connectivity fails.
- Quote requests `POST /api/v1/rentals/quote`. The server's amount, discount, shipping, deposit, expiry and demo disclaimer are source of truth; no client-invented final total in API mode. Checkout is still a non-persistent **visual preview**; auth, real hold and PG not invoked by this client.
- Web CORS can permit specific Expo browser origins through Node config `API_CORS_ORIGINS`; never wildcard credentials.
- Node and mobile domain/contract CI; **actual Android/iOS screenshots, E2E device tests and operational network performance remain unverified**.

## Local network / environment

1. Use isolated local MySQL `lr_test` and the test-only migrations and seed documented in `apps/api/README.md`.
2. Start backend with `APP_MODE=demo API_HOST=127.0.0.1 API_PORT=4000` and `API_CORS_ORIGINS=http://localhost:8081,http://127.0.0.1:8081` for Expo **web** origins. Restart the backend after changes.
3. Add `apps/mobile/.env.local` with `EXPO_PUBLIC_API_URL=http://127.0.0.1:4000` for same-machine web. **Physical phone:** replace host with the PC's reachable private LAN IP; use `API_HOST=0.0.0.0` only on trusted development Wi-Fi and configure the firewall. Avoid open/public unencrypted HTTP.
4. Run Expo via `npm run mobile` or `npm run web:mobile`, and verify **source badge** says TEST Node API. An absent environment URL switches to explicit offline/sample mode.
5. **Production:** require HTTPS, origin restrictions, authenticated sessions, domain validation and approved data policies. `EXPO_PUBLIC_` values are embedded in the app bundle and are NOT secrets.

## Reproducible checks

- `npm run typecheck:mobile`, `npm run test:mobile`, `npm run build:mobile:web` (GitHub Actions)
- `npm run api:build`, `npm run api:test` against `lr_test` (MySQL 8.4 CI)
- Source contract test covers catalog DTO, cursor, query encoding, null channel price, 404, network failures, availability and server-side quote, API failures must not be replaced by sample prices.

## Out of scope / risk register

- Existing web `567890` and its MySQL remain untouched.
- Actual rental booking, inventory hold confirmation, checkout/PG, personal address entry, authentication UI and secure native credential storage are **not enabled**.
- Cart/wishlist are app-memory demonstration features; they are not persisted or synchronized with accounts.
- Product images remain placeholders; real inventory/photo rights and pricing must be approved before commercial display.
- The M3 schema, server CORS origin and LAN firewall must be correctly configured to test Expo web. GitHub's standalone frontend build does not by itself prove end-to-end live connectivity.
- Keep `package-lock.json` generation and `npm ci` migration as technical debt before a production release.

References: [Expo public environment variables](https://docs.expo.dev/guides/environment-variables/), [M1 API contract](API_CONTRACT.md), [M3.3 security](M3_3_AUTH_HOLD_API.md).
