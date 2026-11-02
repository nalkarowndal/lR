# luxuryRental Expo Mobile — M2 implementation preview

This is the **first actual React Native / Expo UI implementation** based on `docs/m2-*` and the 33-frame Figma prototype at https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja.

## Local development

From repository root:
```bash
npm install
npm run mobile
```
Then use Expo Go or Android/iOS simulator if supported by the installed Expo SDK. For browser preview: `npm run web:mobile`. Check types: `npm run typecheck:mobile`.

Official references: [Expo SDK 58](https://expo.dev/changelog/sdk-58), [Expo Router](https://docs.expo.dev/router/installation/).

## Included

- Five-tab luxuryRental shell: 홈 / 렌탈 / 스토어 / 수선 / 마이
- Original white/ink/pastel design token values from source `567890` and M2 documentation
- Product sample visuals, search, product detail, wishlist and cart state
- Responsive calendar with full month and small-device text-input fallback
- Rental quote, clear return date, subtotal / deposit / total; purchase total and store-context result
- Repair form preview and three-step consignment form preview
- Explicit **DEMO** banners and results; no API, real payment, authentication, customer photo upload, booking or persistence

## Deliberately excluded

- Node.js API and MySQL write operations: target M3; existing live database untouched
- Actual inventory availability or hold: NEVER represent local demo selection as reserved
- Real login, file uploads, payment capture and shipping
- Admin/ERP staffing module: remains in original web project; not customer-facing navigation
- AI image/styling, commercial authenticity or approved photo rights

## Verification status

Code is committed for review but **dependencies have not been installed and device UI/typecheck/visual QA have not been run through this connector**. Do not report TEST_PASS until CI logs and screenshots exist. SDK 58 compatibility must be confirmed with `npx expo-doctor` after install.

## Next implementation gates

1. Install dependencies, run typecheck and fix any SDK 58 peer mismatches.
2. Inspect real Android/iOS navigation, safe areas, compact 360px (manual date fallback), 390px and tablet layouts.
3. Confirm design parity with Figma and fix outstanding Figma PR notes.
4. Implement Node.js + Express + TypeScript `/api/v1` and MySQL `lr_*` tables on **test DB only**.
5. Add server-side auth, availability locks, idempotent holds and payments (sandbox) before enabling any real checkout.
