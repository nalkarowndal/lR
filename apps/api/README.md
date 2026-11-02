# luxuryRental Node API — M3.3 demo foundation

**Current implementation:** Node.js + Express 5 + TypeScript + mysql2/promise and standalone MySQL **test-only** schema. M3.3 adds **demo-only** Argon2id user authentication, DB roles and verified session-bound rental holds. This is *not* production identity verification, real booking, payment or order fulfillment.

## Existing M1 contracts
- [API CONTRACT](../../docs/API_CONTRACT.md)
- [MySQL DATA MODEL](../../docs/DATA_MODEL.md)
- [Functional REQUIREMENTS](../../docs/REQUIREMENTS.md)
- [M3 risk and QA](../../docs/ACCEPTANCE_TESTS.md)

## API routes (implemented)
```
GET  /health
GET  /ready                            # requires DB access
GET  /api/v1/products                  # filter q,brand,category,channel,cursor,limit
GET  /api/v1/products/:id
GET  /api/v1/products/:id/availability?startDate=YYYY-MM-DD&returnDate=YYYY-MM-DD
POST /api/v1/rentals/quote             # demo quotation, no payment
POST /api/v1/auth/register             # demo account; no real email verification
POST /api/v1/auth/login                # Argon2id password + opaque bearer session
POST /api/v1/auth/refresh              # rotate and revoke prior session
POST /api/v1/auth/logout               # revoke token
GET  /api/v1/me                        # session-derived customer profile/roles
GET  /api/v1/admin/me                  # DB RBAC ADMIN only
POST /api/v1/rental-holds              # authenticated, idempotent TEMPORARY demo unit hold
GET  /api/v1/rental-holds/:id          # owning user only
DELETE /api/v1/rental-holds/:id        # owning user only
```
`POST /api/v1/rentals`, `POST /api/v1/orders`, and `POST /api/v1/payments/confirm` deliberately return **501 NOT_IMPLEMENTED**. They never turn a mock UI event into a paid order. Test-only auth/RBAC and temporary rental-hold API are implemented. **Production account verification, private file storage, confirmed reservations and PG are NOT implemented.**

## MySQL security boundary
- **Do not point** `db:migrate:test` or `db:seed:test` at the existing luxuryRental database.
- Both scripts reject any `DB_NAME` other than the exact literal `lr_test` and `NODE_ENV=production`.
- Scripts use only additive `CREATE TABLE IF NOT EXISTS lr_*` statements and synthetic DEMO fixture rows.
- They contain no `DROP` / `TRUNCATE` / `DELETE` statements.
- There is no production migration mechanism, and no live MySQL data has been accessed or migrated.
- `GET availability` is **advisory**: it may change before checkout, and must not be treated as a reservation. The seeded test hold is synthetic.

## Running locally (requires isolated local MySQL 8.4)

From repository root:
```sh
npm install
# Create an empty local MySQL database called lr_test, then export the DB_* fields below.
export NODE_ENV=test APP_MODE=demo DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=your_local_password DB_NAME=lr_test
npm run db:migrate:test --workspace @luxuryrental/api
npm run db:seed:test --workspace @luxuryrental/api
npm run api:build
npm run api:test
npm run api:dev
```
Local Windows PowerShell users should set each environment variable via `$env:NAME='value'` rather than `export`. For configuration names see [`.env.example`](.env.example) (the file is informational; variables are not auto-read).

## Verified via GitHub Actions
See `.github/workflows/api-ci.yml`: MySQL 8.4 Docker service, schema/fixture, TS build and HTTP integration tests. [M3.3 Node API CI #41380191605](https://github.com/nalkarowndal/lR/actions/runs/41380191605): **33/33 tests PASS**; [Expo CI #41380191580](https://github.com/nalkarowndal/lR/actions/runs/41380191580): PASS. This CI does not test physical mobile apps, pen testing or production data.

## Important M3 gaps
- The **physical** DB tables are only a minimal test subset of the [logical ERD](../../docs/DATA_MODEL.md). payment ledger, repairs, inventory event log, full policy versions, audit logs and real admin workflows are not implemented. Demo-only `lr_users`, `lr_user_roles`, `lr_sessions` are implemented.
- `SELECT ... FOR UPDATE` physical-unit holds and 20-request concurrency tests are implemented. Actual confirmed rental/checkout, approved quote/hold policies, PG, production identity verification and release gate are not implemented.
- Policies POL-01~POL-05, user account and business signoff remain unapproved.
- Connect mobile client using a configurable API base URL and security/authorization gates in a later PR; current mobile app still uses explicit DEMO state.

## M3.3 account/hold hardening
- Authentication and role verification use server-issued opaque bearer tokens, stored **hashed** in MySQL; `actorId` is always resolved from the session, never from client JSON.
- Strict Zod schemas, Argon2id hashed demo passwords, token revocation and rotation, admin role checks and 404 ownership boundaries are tested.
- **Not production-ready:** no email verification/forgot-password/MFA, in-memory rather than distributed login throttling, no Expo secure native token store, no legal approval or TLS deployment evidence. All registration/hold write routes are gated by `APP_MODE=demo`.
- [M3.3 protocol and limitations](../../docs/M3_3_AUTH_HOLD_API.md).
