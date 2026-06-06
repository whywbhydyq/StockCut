# StockCut SEO Skill Module Execution Report

Date: 2026-06-06
Target: https://stockcut.ymirtool.com/
Project: StockCut
Execution mode: module-by-module SEO skill execution, then batch fixes

## Execution constraints

- Production was reported as verified by the user before this run.
- The current container still cannot resolve `stockcut.ymirtool.com`, so live HTML, HTTP headers, PageSpeed, CrUX, Search Console, and rich-results checks could not be independently measured from this environment.
- Source code and local static validation were used as primary evidence.
- `npm run build` was not run.
- Test suites were not run.

## Loaded SEO sub-skills

The execution followed the requested module rhythm and loaded the relevant sub-skills sequentially:

1. `seo-audit`
2. `seo-technical`
3. `seo-content`
4. `seo-schema`
5. `seo-sitemap`
6. `seo-performance`
7. `seo-visual`
8. `seo-geo`
9. `seo-images`
10. `seo-sxo`
11. `seo-programmatic`

References used:

- `shared-data-cache.md`
- `quality-gates.md`
- `cwv-thresholds.md`
- `schema-types.md`
- `eeat-framework.md`

## Module score summary

| Module | Score | Status | Notes |
|---|---:|---|---|
| seo-audit | 88 | Pass with live-data limitation | No critical source-code SEO blockers remain. |
| seo-technical | 90 | Pass | Security headers, redirects, robots, audit state improved. |
| seo-content | 84 | Pass with opportunities | Added methodology and stronger About content; external trust signals still limited. |
| seo-schema | 91 | Pass | WebPage, WebApplication, Article, Organization, WebSite, BreadcrumbList, ImageObject coverage. |
| seo-sitemap | 88 | Pass | 38 canonical URLs, 38 redirects excluded from sitemap. |
| seo-performance | 80 | Needs production measurement | No CWV data available in sandbox; AdSense impact must be measured live. |
| seo-visual | 82 | Pass with screenshot limitation | PWA/social images added; no browser screenshots captured. |
| seo-geo | 90 | Pass | llms files, methodology page, AI crawler visibility, schema graph improved. |
| seo-images | 78 | Improved | PWA icons and OG image added; original instructional diagrams still recommended. |
| seo-sxo | 84 | Pass with SERP limitation | Intent alignment is coherent; no live SERP/PAA data available. |
| seo-programmatic | 82 | Controlled | Programmatic footprint remains modest and tied to real tool presets/guides. |

Overall source-code SEO health score: 88/100.

## Batch fixes applied

### 1. Technical SEO

- Replaced alias route `redirect()` calls with `permanentRedirect()` so fallback alias pages preserve permanent redirect semantics.
- Added explicit robots rules for major search and AI crawlers while keeping all crawlers allowed.
- Added `Content-Security-Policy-Report-Only` in `next.config.ts` to start CSP hardening without breaking AdSense or worker behavior.
- Kept existing HSTS, nosniff, frame deny, referrer policy, and permissions policy.

### 2. Schema and metadata

- Added `siteOgImage`, `siteLogo`, and `siteKeywords` to centralized metadata.
- Added Organization `logo` as `ImageObject`.
- Added WebSite `about` topics.
- Enhanced homepage `WebApplication` with `isAccessibleForFree`, `softwareVersion`, `browserRequirements`, `dateModified`, and `image`.
- Enhanced tool/guide JSON-LD in `PageShell` with `WebPage` nodes.
- Tool pages now include expanded `WebApplication` feature lists and keyword fields.
- Guide pages now include enhanced `Article` metadata, image, keywords, and about topics.
- Kept FAQPage schema intentionally omitted, matching the skill rule against using FAQ schema as a growth lever for ordinary commercial/tool pages.

### 3. Visual / image SEO / PWA

- Added generated brand assets:
  - `public/icon-192.png`
  - `public/icon-512.png`
  - `public/apple-touch-icon.png`
  - `public/stockcut-og.png`
- Updated `manifest.webmanifest` with real icons.
- Added root metadata icons, Apple web app metadata, theme color viewport, Open Graph image, and Twitter large-image metadata.
- Added page-level Open Graph and Twitter image metadata across canonical pages.

### 4. Content and E-E-A-T

- Added a new canonical guide page: `/cut-list-optimization-methodology`.
- Added a matching legacy alias: `/guides/cut-list-optimization-methodology` → `/cut-list-optimization-methodology`.
- Added methodology content explaining:
  - input constraints,
  - sheet layout assumptions,
  - linear stock packing,
  - warnings and limits,
  - shop verification checklist.
- Expanded About page content with calculation boundaries, privacy model, and feedback/correction instructions.
- Added methodology links to home/page support sections and `llms.txt` priority pages.

### 5. GEO / AI search readiness

- Included methodology in `llms.txt` priority pages.
- `llms-full.txt` automatically includes the new canonical methodology page through `canonicalPages`.
- Robots now explicitly allows ChatGPT-User, GPTBot, ClaudeBot, PerplexityBot, CCBot, Googlebot, and Bingbot.
- Schema graph and image metadata now give AI crawlers clearer entity, page, and visual context.

### 6. Sitemap / programmatic SEO

- Canonical page count increased from 37 to 38.
- Redirect alias count increased from 37 to 38.
- The sitemap continues to read only `canonicalPages` and excludes aliases.
- The new page is a high-trust methodology guide, not a low-value scaled page.

## Validation performed

```bash
npm run typecheck
node scripts/validate-site.mjs
npm audit --json
npm audit --omit=dev --json
```

Results:

| Check | Result |
|---|---|
| TypeScript | Passed |
| Static site validation | Passed |
| Full npm audit | 0 vulnerabilities |
| Production dependency audit | 0 vulnerabilities |

## Explicitly skipped

- `npm run build`
- Vitest
- Playwright
- Lighthouse / PageSpeed live measurement
- Google Search Console live inspection
- Rich Results live validation

## Remaining limitations

1. Live DNS/HTTP could not be measured from the container.
2. CSP is intentionally report-only until production browser reports confirm AdSense compatibility.
3. Core Web Vitals require production PageSpeed/CrUX validation.
4. Rich Results validation should be run against deployed pages after production update.
5. Original instructional diagrams/screenshots are still recommended for stronger image SEO and E-E-A-T.
