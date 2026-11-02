# luxuryRental Node API — M3.1 foundation

**Current implementation:** Node.js + Express 5 + TypeScript + mysql2/promise and standalone MySQL **test-only** schema. This is *not* production booking, payment or user authentication.

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
POST /api/v1/rentals/quote             # demo=true, no inventory hold, no payment
```
`POST /api/v1/rentals`, `POST /api/v1/orders`, and `POST /api/v1/payments/confirm` deliberately return **501 NOT_IMPLEMENTED**. They never turn a mock UI event into a paid order. Auth, RBAC, private file storage, reservations and PG are not implemented.

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
See `.github/workflows/api-ci.yml`: MySQL 8.4 Docker service, schema/fixture, TS build and HTTP integration tests. **Do not claim PASS until the action has completed successfully**. This CI does not test physical mobile apps or production data.

## Important M3 gaps
- The **physical** DB tables are only a minimal test subset of the [logical ERD](../../docs/DATA_MODEL.md). `lr_users`, payment ledger, repairs, inventory event log, full policy versions, audit logs and admin are not implemented.
- No locking `SELECT ... FOR UPDATE` booking hold creation yet; no concurrency PASS, no PG and no production launch.
- Policies POL-01~POL-05, user account and business signoff remain unapproved.
- Connect mobile client using a configurable API base URL and security/authorization gates in a later PR; current mobile app still uses explicit DEMO state.
