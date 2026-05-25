# StockCut Continuation Report

Date: 2026-05-25

## Scope completed in this continuation pass

1. Added a real browser Worker entrypoint at `src/core/worker/optimizer.worker.ts`.
   - Sheet and linear optimization can now execute through `new Worker(new URL('./optimizer.worker.ts', import.meta.url), { type: 'module' })` when the browser/build supports it.
   - The client keeps a responsive fallback path for environments where Workers are unavailable.
   - Cancel now terminates the Worker instead of only clearing a timer.

2. Added linear miter / angle planning metadata.
   - `LinearPartInput` now supports `miterAngle` and `notes`.
   - Optimizer placements preserve those fields.
   - CSV import/paste can read the extra columns.
   - CSV export, PDF export, and visual stock bars include angle/note metadata.
   - This is explicitly planning metadata only; it does not model true angled-cut geometry or change stock length consumption.

3. Added result-to-inventory reuse controls.
   - Sheet results can send the largest rectangular offcuts back into extra stock.
   - Linear results can send leftover straight-stock offcuts back into extra stock.
   - The project autosave/localStorage path then preserves those offcut stock records.

4. Fixed contradictory content around DXF and angle scope.
   - Public guide/support copy now says DXF is a lightweight rectangular planning outline, not machine-ready CAM.
   - Angle fields are planning notes, not true angle geometry.

## Verification run

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test`: passed, 8 test files / 31 tests.
- `npm run build`: reached successful optimized production compile, then timed out in this sandbox during Next.js `Collecting page data ...` on Node v22.16.0. The project package declares Node 20.x. This is recorded as an environment-limited build verification, not a business-logic test failure.

## Still not fully implemented

- Manual drag adjustment of sheet placements with offcut recomputation.
- True angled-cut geometry for linear cuts.
- Machine-ready CNC/router mode or G-code.
- Full separate inventory management UI beyond result-to-extra-stock reuse.
- Formal Chinese route set.
- Affiliate comparison page set.
