# StockCut completion report

This package continues the audited P1 implementation and fills the remaining feasible requirement gaps from the demand document audit.

## Newly completed in this package

- Added missing SEO matrix pages and requirement aliases:
  - `/saw-kerf-compensation-calculator`
  - `/rebar-cutting-optimizer`
  - `/plywood-yield-rate-calculator`
  - `/saw-kerf-explained`
  - `/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet`
  - `/cut-list-optimizer-vs-sketchup`
  - `/plywood-factory-edge-trim`
  - `/grain-direction-in-cut-lists`
  - `/edge-banding-in-cut-list`
  - `/reduce-plywood-waste`
  - `/tools/*`, `/calculators/*`, `/guides/*`, and `/legal/*` aliases matching the original information architecture.
- Added rebar preset and route using the 1D optimizer.
- Added plywood yield calculator route using real sheet optimizer output.
- Added `strategy` to project data and UI:
  - `least_waste`
  - `least_stock`
  - `fewer_cuts`
- Wired strategy into 2D and 1D optimizer selection rules and algorithm output labels.
- Added CSV file import for sheet and linear tools. Import errors do not replace current rows.
- Added JSON project import for sheet and linear tools. Invalid JSON does not clear the current project.
- Added FAQPage and BreadcrumbList JSON-LD in addition to WebApplication schema.
- Extended static validation to require remaining pages, strategy toggle, CSV/JSON import, schema, and optimizer strategy reporting.
- Added Vitest coverage for strategy output and SEO page matrix completion.

## Verified commands

```bash
npm install
npm run lint
npm test -- --run
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run e2e
```

Results:

- `npm install`: successful; npm audit still reports 2 moderate vulnerabilities in dependency chain. Not force-fixed to avoid breaking Next/Playwright versions.
- `npm run lint`: successful.
- `npm test -- --run`: successful; 5 test files, 20 tests passed.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: successful; 62 static pages generated including `robots.txt` and `sitemap.xml`.
- `npm run e2e`: blocked by the current container policy (`net::ERR_BLOCKED_BY_ADMINISTRATOR` when Chromium accesses localhost). The Playwright tests remain in the package for normal local/CI environments.

## Still intentionally not implemented

- Accounts, cloud save, CNC, DXF, G-code, polygon/circle/triangle nesting, enterprise inventory, ERP, order scheduling, AI cabinet design, angle cutting.
- Web Worker progress/cancel for very large projects; current MVP remains client-side and synchronous.
- Manual drag adjustment and industrial nesting.
- Dedicated jsPDF renderer; PDF export remains browser Print / Save as PDF as allowed by the development plan.
