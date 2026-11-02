# luxuryRental — Premium Rental & Luxury Boutique App

> Status: **M1 baseline documented; M2 design artifacts ready for review, visual approval pending** · Updated: 2026-11-02  
> Repository: **nalkarowndal/lR**  
> This repository is for the **new mobile app and its Node.js backend**. It is not a replacement for the original luxuryRental website.

## Vision

Build a mobile-first premium experience that combines luxury goods **rental**, **shopping**, and **repair/restoration** while preserving the established **luxuryRental** brand, service names, and core journeys. UX should combine an editorial luxury boutique aesthetic with clear rental availability, prices, and trustworthy item condition information.

## Decisions

| Area | Decision |
| --- | --- |
| Repository | `https://github.com/nalkarowndal/lR` |
| Product name | `luxuryRental` (preserve existing branding) |
| Mobile | React Native + Expo + TypeScript (planned) |
| Backend | **Node.js + TypeScript + Express** (selected baseline; not yet implemented) |
| Database | **MySQL/InnoDB selected for initial API development** to preserve legacy compatibility; current data not migrated. Prisma optional after version verification |
| API | Versioned REST API, planned `/api/v1` |
| Admin | Preserve and integrate with existing luxuryRental web/ERP/CMS where feasible |
| Development phase | Requirements, UI/UX, architecture, and technical verification **before implementing app code** |

## Scope

- Home: editorial hero, brands, curated collections, featured products
- Rental: browse, availability calendar, quotation, booking, shipping, extension and returns
- Boutique: search, categories, item details, cart and purchases
- Care: photo-based repair/restoration request, quotation, status tracking
- Account: authentication, favorites, bookings, orders, returns, care requests
- Admin integration: products, individual units, inventory statuses, rentals/orders, editorials and audits
- Existing ancillary modules (including consignment and store **staffing management**, not a public hiring page) must be mapped before final IA is approved

## M2 UI/UX design review

M2 design documentation and an editable Figma wireframe prototype are prepared for review. Final visual approval remains pending; see the explicit Figma limitations and native QA status below. No app or Node.js code has been started.

- [M2 design overview and deliverable index](docs/M2_OVERVIEW.md)
- [Design system and source identity](docs/DESIGN_SYSTEM.md)
- [29-screen wireframes](docs/SCREEN_WIREFRAMES.md)
- [Component specifications](docs/COMPONENT_SPECIFICATIONS.md)
- [Interactions and API gaps](docs/INTERACTION_SPEC.md)
- [Responsive and accessibility guidance](docs/RESPONSIVE_ACCESSIBILITY.md)
- [Figma prototype, visual QA and remaining work](docs/M2_VISUAL_QA.md)
- [Editable Figma design](https://www.figma.com/design/6mmceyHRPsWoR1JxUAnMja)

## Planning documents

- [Architecture and Node.js API plan](docs/ARCHITECTURE.md)
- [Development roadmap and acceptance gates](docs/ROADMAP.md)
- [M0 source audit — pinned commits and verified architecture](docs/SOURCE_AUDIT.md)
- [M0 feature matrix — UI/API/demo/missing](docs/FEATURE_MATRIX.md)
- [M0 risk register — security, booking, payment and QA](docs/RISK_REGISTER.md)
- [M1 architectural decisions and policy gaps](docs/DECISIONS_M1.md)
- [M1 functional and nonfunctional requirements](docs/REQUIREMENTS.md)
- [M1 mobile information architecture](docs/INFORMATION_ARCHITECTURE.md)
- [M1 user journeys and error states](docs/USER_FLOWS.md)
- [M1 MySQL logical ERD and migrations strategy](docs/DATA_MODEL.md)
- [M1 Node.js versioned REST API contract](docs/API_CONTRACT.md)
- [M1 acceptance and QA gate matrix](docs/ACCEPTANCE_TESTS.md)

## Source-of-truth and preservation policy

1. The latest **original luxuryRental** source and screen inventory must be reviewed before migrating functionality.
2. Prior design reports, separate starter projects and screenshots are **references**, not proof that their code is already included here.
3. Preserve existing service names, pages and flows unless a documented change is approved.
4. Never silently overwrite, delete or rename original functionality.
5. Build the mobile client in this repository and integrate via documented API contracts; do not copy browser-only UI code into React Native unchanged.
6. Separate demo/mock payment and data from live operations.
7. Do not commit `.env`, credentials, customer information, private uploads, build outputs or analysis ZIP archives.

## Proposed repository structure (NOT YET CREATED)

```text
lR/
├── apps/
│   ├── mobile/                 # React Native / Expo
│   └── api/                    # Node.js / Express / TypeScript
├── packages/
│   ├── shared-types/           # DTOs / enums / shared contracts
│   └── api-client/             # Typed API client
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── SOURCE_AUDIT.md
│   ├── FEATURE_MATRIX.md
│   ├── RISK_REGISTER.md
│   ├── DECISIONS_M1.md
│   ├── REQUIREMENTS.md
│   ├── INFORMATION_ARCHITECTURE.md
│   ├── USER_FLOWS.md
│   ├── DATA_MODEL.md
│   ├── API_CONTRACT.md
│   └── ACCEPTANCE_TESTS.md
├── analysis-artifacts/         # Phase-scoped reports; do not commit archives/secrets
└── README.md
```

> **Current state:** planning documents only. No claim of a working API, database migration, build, or QA pass.
