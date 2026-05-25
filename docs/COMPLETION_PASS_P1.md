# StockCut Additional Completion Pass

This pass finished the remaining feasible items from the previous development-plan audit without adding prohibited features.

## Completed in this pass

- Multiple stock sheet sizes for the 2D optimizer through additional stock/offcut rows.
- Rectangular offcut reuse for 2D sheet cutting through the same additional stock/offcut table.
- Multiple stock lengths for the 1D optimizer through additional stock/offcut rows.
- Straight offcut reuse for the 1D optimizer.
- Stock cost fields and estimated stock cost summaries for sheet and linear optimizers.
- Grain direction metadata on stock and grain lock per sheet part. Grain-locked parts are treated as non-rotating.
- Edge banding flags for top/right/bottom/left edges, carried into placements, CSV export, and SVG visualization.
- Extended paste import columns for material, grain lock, and edge banding.
- CSV export now includes stock label, material, grain lock, and edge banding where applicable.
- Added Playwright browser E2E test files for 375px mobile sheet optimization, print media visibility, and linear optimization.

## Still intentionally not implemented

The project still does not include accounts, cloud save, CNC, DXF, G-code, non-rectangular nesting, circular/triangular/polygonal parts, enterprise inventory, order scheduling, automatic quoting, team collaboration, AI cabinet design, or angle cutting.

## Validation results in this environment

Passed:

- `npm install`
- `npm run lint`
- `npm test`
- `NEXT_TELEMETRY_DISABLED=1 npm run build`

Browser E2E status:

- `npm run e2e` is included, but the current execution container blocks Chromium navigation to local HTTP URLs with `net::ERR_BLOCKED_BY_ADMINISTRATOR`.
- The E2E test files remain in the package and should run in a normal local/Vercel-compatible environment with Chromium access.
