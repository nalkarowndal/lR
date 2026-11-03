# luxuryRental repository

The luxuryRental mobile app, Node API, development documents, workspace manifests and security scripts are located in the **[lR/](lR/README.md)** directory.

## Quick start

```bash
cd lR
npm ci
npm run typecheck:mobile
npm run test:mobile
npm run build:mobile:web
```

The backend requires an isolated `lr_test` MySQL database for its integration tests. See [API setup](lR/apps/api/README.md) and [project status](lR/docs/PROJECT_STATUS.md). Production payment and ERP remain disabled.

GitHub Actions workflows and the pull-request template intentionally remain in the repository-root `.github/` directory; each workflow runs application commands from `lR/` and caches `lR/package-lock.json`.

**Working directory:** After cloning this repository, run application npm commands inside `lR/`, not the repository root.

The original separate luxuryRental web repository is not part of this structural move.
