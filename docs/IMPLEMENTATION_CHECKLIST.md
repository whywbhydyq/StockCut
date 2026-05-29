# StockCut Implementation Checklist

This checklist audits the repository against the two project documents and records the remaining work completed in this pass.

## Phase 0: Repository and infrastructure

- [x] Next.js App Router project created.
- [x] TypeScript strict mode enabled.
- [x] Tailwind CSS configured.
- [x] Vercel ignoreCommand configured.
- [x] sitemap and robots implemented.
- [x] privacy, terms, disclaimer, about, contact pages implemented.

## Phase 1: Data model and units

- [x] Project, sheet stock, sheet part, linear stock, linear part, optimization result types implemented.
- [x] Unit parsing supports mm, cm, decimal inch, fractional inch, hyphenated fractional inch, and feet-inch.
- [x] Internal values use integer micrometers.
- [x] Field-level invalid values return structured warnings.

## Phase 2: 2D Sheet Cutting Optimizer

- [x] Stock sheet input implemented.
- [x] Part table implemented.
- [x] Material fields included.
- [x] Stock trim margins implemented.
- [x] Kerf implemented as spacing between parts.
- [x] Rotation lock implemented.
- [x] Guillotine-style practical layout implemented.
- [x] SVG layout, labels, offcuts, yield, waste, warnings, and unplaced parts implemented.
- [x] Zoom in / zoom out / fit-to-screen controls added for SVG layouts.
- [x] Basic shop-readable cut sequence table added.

## Phase 3: 1D Linear Cutting Optimizer

- [x] Stock length input implemented.
- [x] Cut list input implemented.
- [x] Material field implemented.
- [x] Trim start / trim end implemented.
- [x] Kerf implemented between consecutive cuts.
- [x] Best-fit decreasing implemented.
- [x] Cut sequence, offcut, waste, warnings, and unplaced cuts implemented.

## Phase 4: Import, export, save

- [x] Excel / Google Sheets paste import implemented.
- [x] Paste preview confirmation implemented for sheet and linear tools.
- [x] Import failure does not clear existing user input.
- [x] CSV export implemented.
- [x] JSON export implemented.
- [x] localStorage autosave implemented.
- [x] Corrupted localStorage recovery implemented.

## Phase 5: Print and PDF

- [x] Print CSS implemented.
- [x] Browser Save as PDF supported through print workflow.
- [x] Layout diagrams are marked print-safe and avoid page breaks.
- [x] Print output includes result summary, diagrams, warnings, unplaced parts, and sequence tables when present.

## Phase 6: SEO page matrix

Required by the user prompt:

- [x] /
- [x] /sheet-cutting-optimizer
- [x] /linear-cutting-optimizer
- [x] /saw-kerf-calculator
- [x] /plywood-cutting-layout-calculator
- [x] /4x8-plywood-cut-list-optimizer
- [x] /mdf-sheet-cut-calculator
- [x] /acrylic-sheet-cutting-layout-tool
- [x] /cabinet-cut-list-optimizer
- [x] /bookshelf-cut-list-calculator
- [x] /steel-tube-cutting-optimizer
- [x] /aluminum-extrusion-cut-list-optimizer
- [x] /how-to-account-for-saw-kerf
- [x] /guillotine-cut-vs-nesting
- [x] /cut-list-optimizer-vs-excel
- [x] /privacy
- [x] /terms
- [x] /disclaimer

Additional first-batch pages from the development plan:

- [x] /melamine-cut-list-optimizer
- [x] /drawer-box-cut-list-calculator
- [x] /closet-shelf-plywood-calculator
- [x] /workbench-plywood-cut-layout
- [x] /linear-bar-cutting-list-optimizer
- [x] /pvc-pipe-cutting-optimizer
- [x] /lumber-length-cutting-optimizer
- [x] /how-to-read-a-plywood-cutting-diagram
- [x] /why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet

## Phase 7: AdSense and compliance

- [x] Advertisement placeholder component implemented.
- [x] Ads are not inside input tables.
- [x] Ads are not adjacent to Optimize or Export controls.
- [x] Ads do not cover SVG or bar results.
- [x] Privacy text states local processing and no upload/cloud save.
- [x] Out-of-scope features are explicitly excluded in UI copy.

## Phase 8: Validation

- [x] Unit tests cover unit parsing, kerf difference, metric stock, oversized parts, rotation, 1D feasibility, paste errors.
- [x] Static validation covers all required routes, added development-plan routes, print CSS, mobile CSS, localStorage, Vercel ignoreCommand, ad slot, zoom controls, cut sequence, and paste preview.

## Explicitly not implemented because the documents prohibit or defer them

- Accounts, cloud save, CNC, DXF, G-code, non-rectangular nesting, circular/triangular/polygon parts, enterprise inventory, order scheduling, automatic quoting, team collaboration, AI cabinet design, and angle cutting.


## Additional feasible completion pass

- [x] Multiple stock sizes / additional stock rows added for 2D sheet optimizer.
- [x] Rectangular offcut reuse added for 2D via reusable offcut stock rows.
- [x] Multiple stock lengths / additional stock rows added for 1D linear optimizer.
- [x] Straight offcut reuse added for 1D via reusable offcut stock rows.
- [x] Stock cost fields and estimated stock cost summaries added.
- [x] Grain direction metadata and per-part grain lock added.
- [x] Edge banding flags added and rendered in SVG layouts.
- [x] Paste import supports optional material, grain, and edge banding columns.
- [x] CSV export includes stock label, material, grain, and edge banding fields.
- [x] Playwright E2E tests added for 375px mobile workflow and print-media visibility.
- [!] Browser E2E could not be executed in this container because Chromium local HTTP navigation is blocked by administrator policy. Core lint, unit/static tests, and production build pass.

## Final all-feasible development-plan completion pass

- [x] Full `/calculators/*` aliases added for the 30-page requirements matrix.
- [x] Full `/guides/*` aliases added for guide and explanatory pages.
- [x] PWA/offline shell added through `manifest.webmanifest`, `sw.js`, and client service-worker registration.
- [x] Shop mode toggle added for larger controls in workshop/mobile use.
- [x] Shareable encoded URL hash added for sheet and linear projects. Project data stays in the URL fragment, not query params or server storage.
- [x] Privacy-safe event hooks added for optimize, sample, paste/import/export, print, unit, kerf, and share events. Hooks never send cut-list dimensions by default.
- [x] Affiliate-safe information block added outside tool operation areas.
- [x] SVG download added for sheet layout diagrams.
- [x] Repeated 1D cutting pattern summary added.
- [x] Guide pages now include a small interactive kerf example, not only static text.
- [x] Unit, 2D, 1D, storage/share, page matrix, and static validation tests expanded.

## Still intentionally not implemented

These items are in P2 or conflict with the plan's explicit do-not-do scope, so they remain excluded: DXF export, CNC/G-code, non-rectangular nesting, angle cuts, account system, cloud save, enterprise inventory, order scheduling, team permissions, AI cabinet design, and professional engineering/safety guarantees.
