# M0 위험 등록부 — luxuryRental

**Date:** 2026-11-02 · **Repo:** [nalkarowndal/lR](https://github.com/nalkarowndal/lR)  
**Evidence:** source audit pinned to legacy web `aa790f1` and mobile/ERP demo `d741fde`.  
**Status labels:** `confirmed-in-source` = verified code observation; `risk` = expected impact, not penetration-test proof; `pending` = no current independent runtime test.

| ID | Severity | Finding and concrete source | Impact | Recommended owner/action | Acceptance criterion |
|---|---|---|---|---|---|
| SEC-01 | Critical for production | Web `ShopMain.tsx` opens `SHOP_ADMIN` with state switch; `ShopAdmin.tsx` edits local state, not an authenticated backend | Admin UX access control is not authorization | Backend: RBAC middleware + API ownership checks; UI gates for usability only | Unauthorized requests get 401/403; admin writes actually persist |
| SEC-02 | High | Web `backend/db.js`: `DB_PASSWORD || '1234'`, default `root`; `backend/server.js` enables unscoped `cors()` | Misconfiguration / weak authentication / overly permissive browser origins | Backend: startup env schema, no credential fallback, explicit CORS allowlist, TLS, rate limits | Missing prod credentials fail startup; CORS tests deny unapproved origins |
| DATA-01 | Critical for rental | Web MySQL `init-db.js` creates only `products`; no current reservations or physical unit schema | Double booking/sale and availability cannot be enforced | DB: design `InventoryUnit`, holds, rental ranges, orders, audit events | Concurrent same unit conflict rejected, holds expire, sale/rental mutually exclusive |
| COM-01 | Critical for commerce | Web `ProductDetailModal.tsx` uses showToast; reference `server/db.mjs` `createOrder` marks sold while payment is `demo_not_charged` | Misleading purchase state and stock loss | API: payment intents, price validation, confirmed payments, failure rollback, idempotency | An unpaid or failed payment cannot create a completed sale |
| AUTH-01 | High | Web `ShopLike.tsx` social login only displays demo toasts; starter uses only shared admin password | Customer order/repair ownership unprotected | Backend: real customer account auth, refresh policy, secure storage, owner checks | User A cannot see User B rentals, orders or uploads |
| CARE-01 | High | `frontend/src/sub/RepairPage.tsx` returns empty fragment; starter has no repair feature | Core care journey missing | Product/API: authenticated image intake, quote/status, private file storage | Request/photo visible only to its owner or authorized agent |
| MY-01 | High | `frontend/src/sub/MyPage.tsx` empty; bottom My directs to login overlay | Customers cannot track rentals, orders or returns | Mobile: implement account domain screens connected to API | Account loads current user-only history and supports errors/empty states |
| DATA-02 | High | Web: MySQL `products`; starter: separate SQLite `products/units/rentals/orders/events`; earlier report describes different Prisma/SQLite version | Migration could overwrite data or silently mismatch product IDs | Architecture: inventory schemas + source-of-truth + backup before any migration; decide MySQL vs PostgreSQL | Documented table mapping, test import, row counts reconciled, rollback tested |
| QA-01 | High | Web `.github/workflows/qa.yml` installs Playwright but does not run `playwright test` or backend MySQL API test | Green CI does not prove customer journeys or API behavior | QA: isolated MySQL test DB; Playwright E2E + contract tests in CI | Explicit test command and uploaded result for same commit SHA |
| QA-02 | Medium | Starter QA green proves Node SQLite API + browser viewport; it is not Android/iOS native test | Native UI/keyboard/safe area and push unverified | Mobile: native device or emulator E2E + screenshot regression | Real-device test evidence for agreed Android and iOS matrix |
| PRODUCT-01 | High | `ShopAdmin.tsx` includes `RECRUIT` and `RecruitApp.tsx` store staffing; not customer hiring page | Incorrect IA, accidental feature loss or customer confusion | Product: classify as independent operational module; keep original code until decision | Explicit route/owner and preservation decision for staffing feature |
| BRAND-01 | Medium | Web pastel layout versus starter editorial cream/gold; both have branded mobile UI | Unapproved redesign can erase project identity | Design: baseline screenshots, proposed visual system, Figma compare | Approved screen-by-screen parity + design review |
| API-01 | High | Legacy `GET /api/products` returns bare array, starter returns `{products:[]}`; field names/IDs/prices differ | Integration errors and incompatible clients | Backend: versioned API + DTO/transform adapters + OpenAPI | Typed contract tests for both source adapters |
| DOC-01 | Medium | Historic phase 29 report says RELEASE_READY while code marks payment/social login/demo; earlier detailed report is different source variant | Incorrect project status or incomplete portfolio claims | Documentation: distinguish UI/CI/demo from production release | All status statements cite current commit, tests and feature scope |
| FIN-01 | High before live service | No verified production settlement/refund/deposit integration, policies are demo text | Financial/legal/customer support failure | Product/Backend: PG test integration, legal/policy requirements, refund ledger | Test provider confirms server-side and duplicate requests safely handled |
| MEDIA-01 | Medium | Product artwork is demo SVG and real luxury item authentication proofs are absent | Misleading commercial item provenance | Assets: approved image rights and authentic condition inspection workflow | Every catalog item has rights metadata/actual evidence or explicit demo labeling |

## Risk reduction order

1. **Preserve source and data**: snapshots, current database schema, UI map, workforce module ownership.
2. **Define secure backend**: Node.js/Express/TypeScript, role enforcement, product + unit inventory, booking transaction tests.
3. **Design reliable commerce**: payment state machine and inventory holds; no full payment claim until PG test passed.
4. **Fill missing user journeys**: account, care/repair, real auth, returns, order history.
5. **Extend QA**: browser and native tests, backend contract/security, performance and visual comparisons.

## Next validation commands (future implementation; NOT executed by this audit)

- Clean `npm ci`, frontend type check/lint/build.
- MySQL disposable test DB: create schema, seed, run product contract and DB-migration tests without production data.
- API tests: unauthenticated admin, cross-user access, invalid date, overlapping bookings, payment retry, file upload visibility.
- Browser Playwright: original main→search→detail, category/brand, sell workflow, admin boundary, responsive widths.
- Expo: physical Android and iOS device visual QA; accessibility; safe area and navigation.
- Capture CI run URLs, logs and screenshots; mark results PASS only after execution.

## Source links

- Existing web [server.js](https://github.com/nalkarowndal/567890/blob/aa790f1/backend/server.js), [db.js](https://github.com/nalkarowndal/567890/blob/aa790f1/backend/db.js), [init-db.js](https://github.com/nalkarowndal/567890/blob/aa790f1/backend/scripts/init-db.js)
- Existing web [main.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/main.tsx), [AppContext.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/context/AppContext.tsx), [ShopAdmin.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopAdmin.tsx), [ShopLike.tsx](https://github.com/nalkarowndal/567890/blob/aa790f1/frontend/src/components/ShopLike.tsx)
- ERP starter [db.mjs](https://github.com/nalkarowndal/1235856894/blob/d741fde/server/db.mjs), [index.mjs](https://github.com/nalkarowndal/1235856894/blob/d741fde/server/index.mjs)
- [Express official production security](https://expressjs.com/en/advanced/best-practice-security/), [Prisma adding ORM to existing MySQL](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/mysql)

**Note:** Findings are based on static inspection and GitHub CI metadata, not a production security audit.
