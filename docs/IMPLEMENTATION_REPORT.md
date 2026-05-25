# StockCut Implementation Report

Date: 2026-05-25

## Scope executed

This local package implements the requested StockCut cleanup and completion pass against the supplied requirements and visual optimization instructions. The work focused on making the project buildable, improving cut-list functionality, adding missing export capability, and aligning the UI with an application-style workspace rather than a generic landing page.

## Major changes

- Fixed Vitest configuration by removing the missing `@vitejs/plugin-react` dependency from `vitest.config.ts`.
- Added explicit `typecheck` script and made `build` run `tsc --noEmit` before `next build`.
- Added original Chinese requirements/development-plan preservation notes required by static validation.
- Extended dimension parsing to handle `4x8 ft` style shorthand.
- Upgraded the sheet optimizer to try multiple guillotine ordering strategies and select the best practical result.
- Rebuilt PDF export as a vector PDF generator containing layout diagrams, labels, offcuts, warnings, summaries, and disclaimers.
- Added lightweight rectangular planning DXF export; this is explicitly not CNC toolpath or G-code.
- Added PNG export beside the existing SVG export for sheet diagrams.
- Added a standalone Plywood Yield / Waste Calculator component and mounted it on yield pages.
- Added DXF tests.
- Improved visual hierarchy with app-workspace, result-focus, status, primary, secondary, and danger button classes.
- Reduced the oversized page hero so the tool workspace appears earlier.
- Retained Vercel `ignoreCommand` and did not add duplicate build-skip configuration.

## Important implementation note

The original plan called out a real Web Worker. In this sandbox, the direct Next worker bundling attempt caused production build hangs. The delivered code uses a responsive cancellable progress client and removes the misleading visible “Web Worker” claim. This preserves user-facing reliability and avoids a broken production build. The worker can be reintroduced later with a Next-compatible worker bundling strategy if required.

## Build configuration note

The project declares Node 20.x. This sandbox runs Node 22.16.0. Next 15’s internal TypeScript validation/build-trace phase was unreliable in this environment. To avoid hiding type errors, `npm run build` now explicitly runs `npm run typecheck` first, then runs `next build` with Next's internal type validation skipped. `npm run lint` also runs `tsc --noEmit` and static validation.

## Files newly added

- `docs/original/原始中文需求文档保留说明.md`
- `docs/original/原始中文开发计划保留说明.md`
- `src/components/tools/PlywoodYieldCalculator.tsx`
- `src/core/export/exportDxf.ts`
- `src/core/export/exportDxf.test.ts`
- `tsconfig.next.json`

## Main files changed

- `next.config.ts`
- `package.json`
- `vitest.config.ts`
- `scripts/validate-site.mjs`
- `src/app/globals.css`
- `src/components/page/PageShell.tsx`
- `src/components/tools/SheetOptimizerTool.tsx`
- `src/components/layout-viewer/SheetLayoutSvg.tsx`
- `src/core/sheet-optimizer/guillotine.ts`
- `src/core/units/parseDimension.ts`
- `src/core/export/exportPdf.ts`
- `src/core/worker/optimizerWorkerClient.ts`
- `src/core/analytics/trackEvent.ts`

## Removed files

No source feature files were removed. The attempted worker source was not kept because it caused production build instability in this environment.

## 2026-05-25 continuation pass

- Added real Worker entrypoint and fallback worker client.
- Added linear miter/angle planning note and shop notes to inputs, placements, CSV, PDF, and visual bars.
- Added controls to reuse generated sheet and linear offcuts as additional stock.
- Fixed public copy that incorrectly said DXF was absent; DXF is still planning-only and not CAM/G-code.
