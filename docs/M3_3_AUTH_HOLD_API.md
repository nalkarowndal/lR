# M3.3 — 인증·RBAC + 테스트용 렌탈 홀드 API

- Auth: POST /api/v1/auth/register, /login, /logout, /refresh; GET /api/v1/me; GET /api/v1/admin/me (RBAC)
- Hold: POST /api/v1/rental-holds (Bearer + Idempotency-Key UUID + productId/startDate/returnDate), GET /api/v1/rental-holds/:id, DELETE /api/v1/rental-holds/:id (same owner only)
- POST /api/v1/rentals, orders, payments/confirm **remain 501**. A hold is NOT a rental booking, sale, price guarantee or charge.
- Demo-only `APP_MODE=demo`: self-registration, opaque bearer sessions (SHA256 hashed in MySQL), Argon2id hashes, DB role checks. Not enabled for real user or production service.
- The client must never supply or choose actorId. It derives from the verified session. Body uses strict schema and rejects impersonation fields. Another user's hold returns 404, even if its UUID is known.
- All DB writes/test fixtures target `lr_test`, preserving the original web production MySQL.
- Known gaps: email verification, distributed rate limiting, recovery/MFA policy, approved terms, mobile secure-token storage, real payment/order/return lifecycle, provider-backed production sessions, operational monitoring, proof of native-device QA.
- GitHub CI uses MySQL 8.4 to test credential checks, session expiry/revocation/rotation, RBAC, idempotency, ownership, and competing reservations. CI success is not equivalent to production security approval.

## Endpoint examples (TEST ONLY)
```http
POST /api/v1/rental-holds
Authorization: Bearer <demo-access-token>
Idempotency-Key: <UUID>
Content-Type: application/json

{"productId":"demo-bag-01","startDate":"2026-11-10","returnDate":"2026-11-13"}
```
HTTP 201 for new hold, 200 for identical replay; body: `{data:{holdId,checkoutId,productId,startDate,returnDate,status,expiresAt,demo:true,replayed,...},meta:{requestId}}`. Response never exposes the physical unit serial.
`GET /:id` and `DELETE /:id` require the hold's owning authenticated user. A hold automatically expires for availability when `expiresAt` passes; no stale hold must confirm payment.

**Security references:** [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [MySQL 8.4 locking reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html).
