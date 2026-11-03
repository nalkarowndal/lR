# luxuryRental — Implementation Roadmap and Acceptance Gates

**Project:** [nalkarowndal/lR](https://github.com/nalkarowndal/lR)  
**Status:** M0/M1 documented; M2 design documents and wireframe prototype prepared for review. Visual approval pending; no application code implemented  
**Updated:** 2026-11-02

## Guiding constraints

- Repo: **nalkarowndal/lR** (new project)
- Brand/product: **luxuryRental** (unchanged)
- Backend runtime: **Node.js**, with TypeScript + Express baseline
- Client target: Expo/React Native Android and iOS
- Existing luxuryRental website, its page names, and associated administration features remain preserved outside this repo
- Source audit and UI/UX approval precede substantial development
- Store only authorized assets; never commit secrets/private customer photos

## M0 — Baseline inventory and source comparison (required before app implementation)

### Tasks
1. Collect current original luxuryRental website source and precise version/commit SHA.
2. Inventory all screens, routes, public API handlers, auth rules, assets, DB migrations, and tests.
3. Compare original web source with any separate luxuryRental mobile/ERP starter.
4. Classify each feature as `verified existing`, `documented only`, `planned`, or `missing`.
5. Create a preservation/migration map for named screens including ShopMain, ShopCategory, ShopSearch, ShopLike, ShopSell, ShopAdmin and RecruitApp when present in source.
6. Record runnable QA evidence independently rather than copying historical PASS claims.

**Deliverables:** `docs/SOURCE_AUDIT.md`, `docs/FEATURE_MATRIX.md`, source versions, risk log.  
**Gate:** No user-facing function omitted without written disposition; references and actual verified code clearly separated.

## M1 — Requirements and information architecture

### Tasks
1. Define personas and customer journeys for rental, purchase, repairs, favorites and account.
2. Design five main tabs: Home / Rental / Boutique / Care / My, with all ancillary original pages mapped.
3. Design financial and inventory rules: rental day counting, shipping buffers, deposits, inspection, damage, fees, cancellations, refunds, purchases.
4. Write screen requirements including error/loading/empty states and accessibility.
5. Draft API DTOs and OpenAPI contract; decide which existing server endpoints can be reused.
6. Define what demo-only use permits and what needs verification for live commerce.

**Deliverables:** `docs/REQUIREMENTS.md`, `docs/INFORMATION_ARCHITECTURE.md`, `docs/USER_FLOWS.md`, `docs/API_CONTRACT.md`.  
**Gate:** Every P0 screen has accepted user flows, data dependencies and edge-state behavior.

## M2 — UI/UX design system and interactive prototype

### Tasks
1. Establish luxuryRental logo and source-verified white/ink/pastel palette with contrast checks. M2 source inspection found that the earlier cream/champagne-gold description does not match the current original web CSS; see DESIGN_SYSTEM.md.
2. Produce real-device Android/iOS wireframes and refined Figma components.
3. Prototype Home, Rental browse, product detail, calendar, price breakdown, checkout, Store, Repair request, Account.
4. Specify safe areas, bottom tabs, sheets, keyboard behavior, screen transitions, touch areas, skeleton states, motion reduction.
5. Verify navigation and initial user journeys without implementing paid services.

**Deliverables:** approved wireframes / design tokens / component inventory / annotated interaction specs.  
**Gate:** UX review agrees service coverage; key user flows are usable in prototype, including conflicts and failures.

## M3 — Node.js backend foundation

### Tasks
1. Create `apps/api` with supported Node.js LTS + TypeScript + Express.
2. Implement configuration validation, versioned routing, structured error handling, authentication, RBAC, request validation, and health check.
3. Use the M1 **MySQL/InnoDB initial database baseline** with verified schema/backups; introduce Prisma only if selected version supports MySQL, after separate migration approval. Do not migrate real data before validation.
4. Implement product catalog, unit inventory, quote and availability transactions.
5. Generate OpenAPI and write contract/integration tests.

**Gate:** clean install/build/tests; unprivileged user cannot access private/admin data; conflicting physical-unit reservations are rejected under concurrency.

## M4 — Mobile frontend foundation

### Tasks
1. Create `apps/mobile` Expo/React Native shell.
2. Implement selected approved navigation, components and design tokens.
3. Integrate catalog/product detail, account, rental availability, order/rental status and repair request APIs.
4. Implement error, loading, accessibility and retry states.

**Gate:** initial customer flow works on physical Android and iOS test targets or clearly documented equivalent device test plan.

## M5 — Commerce/ERP/CMS integration

### Tasks
1. Add purchase and rental reservation checkout with payment provider **test** mode first.
2. Confirm payment server-side, validate amount/order and apply inventory transitions transactionally.
3. Integrate private repair uploads, admin inventory/ERP, content publication, favorites and notifications.
4. Define operational policies for returns, repair processing, customer support and settlement.

**Gate:** no double booking/double selling; payment failures release holds; customer data privacy and authenticated CMS publication tested.

## M6 — Quality, performance and delivery preparation

### QA matrix
- Build and unit/integration tests
- Device/responsive/safe-area visual regression
- Rental date boundaries, weekends, shipping buffer and simultaneous bookings
- Authentication/authorization rate-limiting and private image authorization
- Payment failure, retry, duplicate request, refund and cancellation
- Slow network, offline/empty data, failed upload, accessibility, reduced motion
- Analytics/logging, backups/restore, dependencies, CI checks
- Android/iOS store readiness and service/legal review if moving to production

**Gate:** passing logs + screenshot proof for the *current commit*, documented known issues, and sign-off for demo or production separately.

## Git and analysis artifact policy

- Commit clear, scoped source/docs modifications with meaningful messages.
- Use short-lived `feat/`, `fix/`, or `docs/` branches and PR review for future implementation.
- Keep `analysis-artifacts/<PHASE_ID>/` outside application source roots.
- Generate an independent phase ZIP only when requested, excluding `node_modules`, build outputs, `.git`, private uploads, secrets and user data.
- Report `Completed / Pending / Risk / QA evidence` at each phase boundary.
- Do **not** claim a test passed when not run or a feature exists when only documented.

## Current status (2026-11-02)

This is the historical M0–M6 scope and acceptance-gate document. **For the verified implementation/QA/PR state use [PROJECT_STATUS.md](PROJECT_STATUS.md).** For the new development cadence use [WORKFLOW_ACCELERATION.md](WORKFLOW_ACCELERATION.md).

- M2: Expo UI demo merged; Figma visual approval and physical-device QA not completed.
- M3.1: Node.js/Express 5/MySQL catalog, availability, demo quote merged and CI verified.
- M3.2: Internal idempotent unit holds implemented in [PR #4](https://github.com/nalkarowndal/lR/pull/4), 18/18 test cases passed; remains Draft and not merged or public.
- M3.3 onward: Plan authentication/RBAC plus authenticated hold API in a **single user-visible implementation package**, safely split into focused PRs and tested before opening checkout.
- No production data, real payment, authentication or commercial launch readiness claim.
