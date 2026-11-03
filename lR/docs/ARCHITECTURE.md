# Architecture Baseline — luxuryRental (M0–M2)

**Status:** M1 logical architecture approved as design baseline; not implemented  
**Updated:** 2026-11-02  
**Project:** [nalkarowndal/lR](https://github.com/nalkarowndal/lR)

## 1. System boundary

```text
[React Native + Expo customer mobile app]      [Existing luxuryRental web / admin / ERP]
                      \                          /
                       \    versioned HTTP API   /
                        [Node.js + TypeScript API]
                                     |
          +--------------------------+---------------------------+
          |                          |                           |
     [MySQL/InnoDB]       [Private media storage]      [Payments/Shipping]
```

- **Backend runtime: Node.js.** Baseline web framework: **Express + TypeScript** to align with the previously documented Express codebase. Verify the actual original source before reusing modules.
- Keep the customer mobile frontend and Node.js backend as separate deployable applications.
- Maintain existing luxuryRental branding; do not silently rename or omit web functionality.
- All inventory assignment, amount calculations and access-control decisions belong on the server.
- Preserve the existing website as a separate product surface unless a later approved migration plan changes this.

## 2. Proposed monorepo boundaries

```text
apps/mobile/               Expo / React Native / TypeScript (future)
apps/api/src/
  app.ts                   Express app composition (future)
  server.ts                Runtime entrypoint (future)
  config/                  Env validation; server-only secrets
  middleware/              Auth, validation, logging, errors, rate limits
  modules/
    auth/
    users/
    products/
    inventory/
    rentals/
    orders/
    payments/
    repairs/
    media/
    editorials/
    favorites/
    notifications/
    admin/
  db/                      MySQL repositories, verified migrations, Prisma optional
packages/shared-types/     API DTO contracts (no runtime secrets)
packages/api-client/       Mobile/web API client
docs/                      Product/architecture/QA design
analysis-artifacts/         Per-phase analysis bundles outside the code root
```

These paths are **planning targets**; only the files currently committed to GitHub exist.

## 3. Customer capabilities and ownership

| Capability | Mobile | Node.js API | Operational authority |
| --- | --- | --- | --- |
| Home / editorial | Display | Published content read | CMS/admin |
| Brand/category search | Browse/filter | Queries, pagination | Product catalog |
| Item detail | Images and conditions | Item and unit metadata | Product + InventoryUnit |
| Rental calendar | Date selection | Availability with buffers | InventoryUnit / Rental |
| Rental quote | Explain amount | Authoritative calculation | Pricing policy |
| Checkout | Intent/confirmation | Payment verification, idempotency | Order / Payment |
| Rental lifecycle | Status and extension | Reservation state transitions | ERP inventory |
| Store purchases | Cart and checkout | Order/stock transactions | Order / InventoryUnit |
| Repair/care | Photo capture/status | Private upload and requests | RepairRequest |
| Account & wishlist | UX state | Authentication/ownership | User / Favorite |
| Notifications | Consent and display | Event-triggered delivery | NotificationEvent |

## 4. REST API contract sketch — not implemented

All illustrative routes use `/api/v1`. Final URLs must be reconciled with the current legacy API before implementation.

| Method | Path | Intent |
| --- | --- | --- |
| GET | `/health` | Health readiness / connectivity |
| POST | `/api/v1/auth/login` | Authentication |
| GET | `/api/v1/me` | Current user summary |
| GET | `/api/v1/products` | Search/filter/paginate |
| GET | `/api/v1/products/:id` | Product + condition summary |
| GET | `/api/v1/products/:id/availability` | Date-range availability |
| POST | `/api/v1/rentals/quote` | Server-calculated rental price/deposit |
| POST | `/api/v1/rentals` | Transactional rental intent/booking |
| GET | `/api/v1/rentals/:id` | Authenticated rental detail |
| POST | `/api/v1/rentals/:id/extension-quote` | Extension pricing and availability |
| POST | `/api/v1/rentals/:id/return-request` | Return process request |
| POST | `/api/v1/orders` | Purchase intent / inventory hold |
| POST | `/api/v1/payments/confirm` | Server-side provider verification |
| POST | `/api/v1/repairs` | Repair application |
| POST | `/api/v1/media/upload` | Authenticated private upload |
| GET | `/api/v1/editorials` | Published editorial content |
| GET | `/api/v1/favorites` | User wishlist |
| GET | `/api/v1/admin/inventory` | Authorized operational inventory |

**Contract rules:** document authorization, request schema, response shape, pagination, errors, ownership checks and idempotency for each operation. Generate OpenAPI when routes are implemented; do not claim the sketch is an existing endpoint.

## 5. Core relational data model — proposal

- **User** — accounts and roles; customer/admin scope
- **Product** — brand, model, marketing content, category, pricing policies
- **ProductImage** — photo asset metadata, usage rights
- **InventoryUnit** — individually identifiable physical item (serial/SKU, condition, custody and availability state)
- **InventoryEvent** — immutable inventory audit/transition record
- **Rental** — dates, buffers, rates, security deposit, lifecycle, assigned InventoryUnit
- **InventoryHold** — temporary exclusive reservation with expiration
- **Order** / **OrderItem** — purchase transaction and assigned item
- **Payment** / **Refund** / **DepositTransaction** — validated financial records
- **Shipment** / **ReturnInspection** — delivery and return evidence
- **RepairRequest** / **RepairAttachment** — private customer care files
- **Favorite** — customer product saving
- **Editorial** / **FeaturedProduct** — published merchandising, CMS
- **AuditLog** — administrator and sensitive state-change history

### Inventory invariants

1. One physical `InventoryUnit` must not be simultaneously committed to overlapping rentals.
2. An item sold/retired is not rentable or sellable again as the same unit.
3. Booking availability covers cleaning, shipping and return inspection buffers.
4. Amounts, discounts and deposits are recalculated by the server using trusted catalog/pricing rules.
5. Payment succeeds only after server-side confirmation with the provider.
6. Inventory holds expire and release cleanly after payment cancellation/failure.
7. Rental state changes generate an auditable inventory event; operations are transactional.
8. Administrators may view customer data only as required by authenticated roles.

### State machine sketch

- Unit: `ready -> held -> reserved -> shipped -> returned -> inspection -> cleaning/repair -> ready`; alternatives: `sold`, `retired`.
- Rental: `draft -> awaiting_payment -> confirmed -> shipped -> active -> return_requested -> returned -> completed`; alternate `cancelled`.
- Payment: `pending -> confirmed / failed / cancelled / refunded`.

These are **draft states**, not a declaration of current legacy database enums.

## 6. Node.js security and operational baseline

- **Framework:** evaluate currently supported stable Express release and Node.js LTS at implementation. TypeScript strict mode.
- Validate `process.env` at startup; keep provider secrets/server keys outside mobile/web bundles.
- Use TLS, security headers (Helmet), carefully scoped CORS, structured logs, request IDs, body-size limits, role enforcement, and standard error responses.
- Rate limit logins and sensitive endpoints; ensure server-side authorization of each customer resource.
- On mobile, design short-lived access credentials and refresh/rotation policy, using platform secure storage where appropriate; do not port browser `localStorage` JWT patterns unchanged.
- Store customer-uploaded repair photos privately, verify upload ownership and issue short-lived authorized download links.
- Database migration, transactional booking conflict tests and audit guarantees are release-blocking tasks.
- Payment: use provider's server confirmation endpoint and idempotency. Mock/test payments must be clearly distinguished from real payment operations.
- Add observability, backups, restore tests, privacy retention rules, and deployment runbooks before live production use.

## 7. UI/UX integration

- Bottom tabs (proposed): Home / Rental / Boutique / Care / My.
- Preserve wishlist through top-level accessible action + account page; map legacy page names rather than dropping features.
- Admin/ERP/CMS remains web-first, not a customer bottom tab.
- Use existing luxuryRental light cream/ink/champagne brand direction, re-evaluate type scale, touch targets, and safe areas for real Android/iOS screens.
- Server error codes must map to understandable mobile UX states: out of stock, invalid dates, conflicting reservation, payment pending, upload failed, authentication expired.

## 8. Existing source audit needed

M0 direct source audit verified the current legacy repository [567890](https://github.com/nalkarowndal/567890) is Node.js + Express 5 + **MySQL**, with a limited `products` schema and GET API, distinct from a previous 2026-10-22 report describing another Express/Prisma/SQLite variant. See [SOURCE_AUDIT.md](SOURCE_AUDIT.md), [DATA_MODEL.md](DATA_MODEL.md). Verify the live instance before migration:
- Existing routes and API response fields
- Actual MySQL table definitions, indexes, real data and migration history
- Service functionality and all legacy screen names
- Auth/session strategies and administrator roles
- Media URLs, privacy and image licensing
- Payment vs demo order behavior
- Existing tests and actual reproducible pass/fail evidence

## 9. References

- Express production security: https://expressjs.com/en/advanced/best-practice-security/
- Express repository / router: https://github.com/expressjs/express
- Expo Router: https://docs.expo.dev/router/introduction/
- React Native security: https://reactnative.dev/docs/security
- Toss Payments server-authoritative integration: https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference

> **M1 supersession:** Exact requirements, rental date interval, MySQL logical ERD, checkout state transitions, and API contracts are defined in [DECISIONS_M1.md](DECISIONS_M1.md), [REQUIREMENTS.md](REQUIREMENTS.md), [DATA_MODEL.md](DATA_MODEL.md), and [API_CONTRACT.md](API_CONTRACT.md). These M1 documents take precedence where the older architecture sketch differs. No backend service, DB schema migration, or native app has been implemented, run, or deployed.
