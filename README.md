# StockCut

StockCut is a Next.js App Router + TypeScript implementation of the MVP described in the repository planning documents.

It includes:

- 2D Sheet Cutting Optimizer
- 1D Linear Cutting Optimizer
- Saw Kerf Calculator
- mm, cm, decimal inch, fractional inch, and feet-inch parsing
- Kerf-aware rectangular sheet layouts
- Best-fit decreasing linear cutting
- SVG sheet diagrams and stock bars
- CSV / JSON export
- Browser Print / Save as PDF workflow
- localStorage autosave with corrupted-data recovery
- SEO preset pages
- Privacy / Terms / Disclaimer
- sitemap / robots
- Vercel ignoreCommand build protection

Intentionally excluded:

- Accounts
- Cloud save
- CNC, DXF, G-code
- Non-rectangular nesting
- Circular, triangular, or polygonal parts
- Enterprise inventory
- Order scheduling
- AI cabinet design
- Angle cutting

## Commands

```bash
npm install
npm run lint
npm test
npm run build
```

## Upload

Use this directory as the repository root. Do not upload `node_modules`, `.next`, or `.vercel`.

## Verified in this package

The package was checked with:

```bash
npm install
npm run lint
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Latest build output prerenders 78 static app routes including sitemap.xml and robots.txt. The build uses `experimental.cpus = 1` in `next.config.ts` to avoid excessive local build worker fan-out.


## Additional P1 features included

- Multiple stock sheet sizes and reusable rectangular offcuts for 2D layouts.
- Multiple stock lengths and reusable straight offcuts for 1D layouts.
- Stock cost estimates.
- Grain lock metadata for sheet parts.
- Edge banding markers for top/right/bottom/left sides.
- Extended paste import and CSV export metadata.
- Playwright E2E test files for mobile and print workflow checks.


## Latest completion notes

This package includes the completed P1 feasible backlog: full SEO route matrix aliases, rebar and plywood-yield pages, strategy toggle, CSV file import, JSON project import, FAQ/Breadcrumb JSON-LD, and expanded tests. See `docs/COMPLETION_REPORT.md`.


## Final all-feasible completion pass

This package now also includes:

- Complete `/calculators/*`, `/guides/*`, `/tools/*`, and `/legal/*` alias route coverage for the documented information architecture.
- PWA manifest and service worker shell for basic offline return visits.
- Shop mode toggle for larger controls in workshop use.
- Hash-only share links for sheet and linear projects.
- Privacy-safe event hooks for core interactions without recording cut-list dimensions.
- Affiliate-safe information block separate from inputs, Optimize, exports, and diagrams.
- SVG layout export.
- Repeated 1D cutting pattern summaries.
- Expanded unit, algorithm, route, share, and static validation tests.

Still intentionally excluded: accounts, cloud save, CNC, DXF, G-code, non-rectangular nesting, circular/triangular/polygonal parts, angle cutting, enterprise inventory, team collaboration, and AI cabinet design.
