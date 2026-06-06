# StockCut SEO Phase 9 Module Execution Report

## Phase scope

Phase 9 continued the SEO skill module flow after Phase 8. The objective was production data-driven optimization readiness: declare how Search Console, PageSpeed, Rich Results, Bing Webmaster Tools, production crawl output, and CSP report-only observations should be imported and used before future SEO edits.

This phase does not embed private analytics data and does not claim PageSpeed, Search Console, or Rich Results outcomes without real production exports.

## Module execution order

Executed as module-level work, not isolated one-off fixes:

1. `seo-audit` — reviewed Phase 8 governance endpoints and release checklist state.
2. `seo-technical` — added production signal endpoint and integration with governance, release, and status endpoints.
3. `seo-content` — added query-to-page intent bucket rules to avoid duplicate landing-page drift.
4. `seo-schema` — added WebPage / ItemList JSON-LD for the production signals page.
5. `seo-sitemap` — added the production signals page as a canonical page and added the JSON endpoint to machine-readable indexes.
6. `seo-performance` — added PageSpeed/CWV import model and KPI gates, without fabricating metric values.
7. `seo-geo` — added machine-readable production-signal intake for AI/search citation governance.
8. `seo-sxo` — added human-readable signal routing and decision rules.
9. `seo-programmatic` — added guardrails to prevent creating new programmatic pages from weak one-off query evidence.

## Implemented changes

### New data layer

- Added `src/data/seoProductionSignals.ts`
  - `productionSignalSources`
  - `productionSignalInputFormats`
  - `productionSignalKpis`
  - `searchIntentBuckets`
  - `productionSignalDecisionRules`
  - `productionSignalPageTargets()`
  - `productionSignalPayloadTemplate()`
  - `productionSignalSummary()`

### New public routes

- Added `/production-signals.json`
  - Machine-readable signal intake model.
  - Declares accepted exports and decision rules.
  - Does not publish private analytics rows.

- Added `/seo-production-signals`
  - Human-readable page for production-signal sources, KPIs, intent buckets, page targets, and local analysis workflow.

### New local analysis script

- Added `scripts/analyze-production-signals.mjs`
  - Reads optional `seo-signals/` exports.
  - Supports Search Console query/page CSVs.
  - Supports PageSpeed JSON or compact JSON.
  - Supports Rich Results / structured-data notes JSON.
  - Emits `.seo-cache/production-signals-summary.json`.
  - Handles no-input mode by producing a missing-input checklist.
  - Does not run a build or test suite.

### Integration updates

Updated these files to include Phase 9 outputs:

- `src/data/pages.ts`
- `src/data/seoGovernance.ts`
- `src/data/seoReleaseChecks.ts`
- `src/data/seoQualityGates.ts`
- `src/app/layout.tsx`
- `src/app/site-index.json/route.ts`
- `src/app/content-inventory.json/route.ts`
- `src/app/seo-status.json/route.ts`
- `src/app/release-checklist.json/route.ts`
- `src/app/site-map/page.tsx`
- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`
- `scripts/validate-site.mjs`

## Local script verification

Executed:

```bash
node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json
```

Result:

- Status: `no-inputs`
- Total input files: `0`
- Missing inputs:
  - Search Console query CSV
  - Search Console page CSV
  - PageSpeed JSON
  - Rich Results structured-data notes

This is expected because real production exports were not provided in the working directory.

## Local validation

Executed:

```bash
npm ci --ignore-scripts
npm run typecheck
node scripts/validate-site.mjs
npm audit --omit=dev --json
npm audit --json
```

Results:

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | Passed; Node engine warning remains because container uses Node 22 and project requires Node 20.x |
| TypeScript | Passed |
| Static site validation | Passed |
| Production dependency audit | 0 vulnerabilities |
| Full dependency audit | 0 vulnerabilities |

Skipped by policy:

- `npm run build`
- Vitest
- Playwright
- Lighthouse / PageSpeed local execution

## Notes

The Phase 9 implementation intentionally separates public governance from private metrics. The site now exposes how production data should be interpreted, but it does not expose Search Console rows, PageSpeed raw files, CSP logs, or private analytics exports.
