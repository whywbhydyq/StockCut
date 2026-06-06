# StockCut SEO Phase 4 Module Execution Report

Date: 2026-06-06
Project: StockCut (`stockcut.ymirtool.com`)
Execution mode: module-level SEO/GEO/SXO follow-up after Phase 3 validation

## Scope

Phase 4 continued the previously loaded SEO skill route and focused on production-verification follow-up that can be completed locally without Search Console, PageSpeed, CrUX, or live DNS access from the container.

Modules covered:

- `seo-audit`
- `seo-technical`
- `seo-content`
- `seo-schema`
- `seo-sitemap`
- `seo-performance`
- `seo-visual`
- `seo-geo`
- `seo-images`
- `seo-sxo`
- `seo-programmatic`

## Constraints

- `npm run build` was not executed.
- Vitest, Playwright, and other tests were not executed.
- The container could not resolve `stockcut.ymirtool.com` by DNS, so live HTML/header/CWV checks remain production-side verification tasks.
- The user reported the previous Phase 3 validation as normal, so Phase 4 starts from the Phase 3 package.

## Implemented changes

### 1. Intent cluster data layer

Added `src/data/seoIntentClusters.ts`.

The file defines four canonical search-intent clusters:

1. Sheet goods and panel layouts
2. Boards, pipe, tube, bar, and rebar
3. Kerf, fit, and waste checks
4. Methodology, diagrams, and workflow decisions

Each cluster includes:

- label
- summary
- when-to-use guidance
- primary canonical pages
- supporting canonical pages
- helper functions for related pages and priority index pages

### 2. Contextual internal linking module

Added `src/components/page/IntentNavigation.tsx`.

Each canonical tool/guide page now gets a contextual internal-link section that explains the current intent cluster and links to related calculators/guides. This improves crawl paths, query disambiguation, and searcher next-step navigation without creating new thin pages.

Mounted in `src/components/page/PageShell.tsx` before ads and generic support sections.

### 3. Structured data enhancement

Updated `src/components/page/PageShell.tsx` and `src/app/page.tsx`.

Enhancements:

- Added intent-cluster `ItemList` JSON-LD.
- Added homepage priority-page `ItemList` JSON-LD.
- Added page-level `relatedLink` values for contextual canonical links.
- Kept existing `Organization`, `WebSite`, `WebApplication`, `WebPage`, `Article`, and `BreadcrumbList` structure.
- Continued to avoid using `FAQPage` as a growth lever.

### 4. GEO / AI crawler surface

Added `src/app/site-index.json/route.ts`.

The route returns a machine-readable canonical index with:

- site name, URL, description, last modified date
- canonical page count
- alias redirect count
- local-first privacy statement
- technical boundaries
- intent clusters
- canonical pages
- redirect aliases

Updated:

- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`

Both files now reference intent clusters and `site-index.json`.

### 5. Homepage support links aligned to data layer

Updated `src/components/home/HomeSupportSections.tsx`.

Popular calculator links now come from the shared SEO intent cluster data instead of being a separate hardcoded list. The FAQ also now includes a page-selection answer for sheet vs linear vs kerf intent.

### 6. Static validation coverage

Updated `scripts/validate-site.mjs` to assert:

- intent cluster data exists
- machine-readable site index route exists
- `llms.txt` links `/site-index.json`
- `llms-full.txt` describes intent clusters
- homepage emits intent cluster JSON-LD
- homepage emits priority ItemList JSON-LD
- page shell mounts contextual intent navigation
- page shell exposes related canonical links in JSON-LD

## Files changed

- `src/data/seoIntentClusters.ts`
- `src/components/page/IntentNavigation.tsx`
- `src/app/site-index.json/route.ts`
- `src/components/page/PageShell.tsx`
- `src/app/page.tsx`
- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`
- `src/components/home/HomeSupportSections.tsx`
- `scripts/validate-site.mjs`

## Local verification

Commands executed:

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
| Dependency install | Passed with Node engine warning |
| TypeScript | Passed |
| Static site validation | Passed |
| Production dependency audit | 0 vulnerabilities |
| Full npm audit | 0 vulnerabilities |

Node warning:

- Project engine requires Node `20.x`.
- Container is Node `22.16.0`.
- Use Node 20 on Vercel/CI.

## Not executed

- `npm run build`
- Vitest
- Playwright
- Lighthouse / PageSpeed
- Search Console URL Inspection
- Rich Results Test

## Production verification still required

After deployment, verify:

- `/site-index.json`
- `/llms.txt`
- `/llms-full.txt`
- a high-priority tool page with the new related links
- homepage JSON-LD with Rich Results Test or schema validator
- CSP report-only status after the new route is deployed

