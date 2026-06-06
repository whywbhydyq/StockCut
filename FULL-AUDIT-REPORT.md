# StockCut Full SEO Audit Report

Date: 2026-06-06  
Target: `https://stockcut.ymirtool.com`  
Audit mode: local source audit with attempted live fetch  
Skill workflow: `seo` + `seo-audit` with inline specialist tracks for technical SEO, content, schema, sitemap, performance, visual, GEO/AI search, and SXO.

## Data collection status

- Shared cache: no prior `.seo-cache/` files were present before this run; fresh findings were gathered from source code.
- Live homepage fetch: unavailable in this sandbox because `stockcut.ymirtool.com` did not resolve through local DNS.
- Live `robots.txt`, `sitemap.xml`, and `llms.txt` checks: unavailable for the same DNS reason.
- PageSpeed / CrUX / Search Console / GA4: not available; Core Web Vitals field data was not fabricated.
- Screenshots / visual crawl: not produced because no browser build or live URL was available in this run.
- Explicitly skipped: `npm run build`, all test commands, Playwright, and Vitest.

## Executive summary

StockCut is structured as a programmatic SEO SaaS/tool site for sheet-goods and linear-stock cut-list intent. The local codebase contains 37 canonical pages and 37 permanent redirect aliases. The route matrix, sitemap source, robots source, page metadata, structured data baseline, and long-tail page registry are coherent.

The main SEO limitations before this pass were weak entity-level schema, no `llms.txt` index for AI crawlers, missing security headers, stale centralized last-modified handling, and security dependency exposure. This pass implemented safe technical improvements without changing the product promise or removing functionality.

## Provisional SEO Health Score

Live crawl and CWV data were unavailable, so this score is a source-code-based provisional score rather than a production measurement.

| Category | Weight | Score | Notes |
|---|---:|---:|---|
| Technical SEO | 22% | 84 | Route matrix, robots, sitemap, redirects, metadata, and security headers are now stronger; live DNS remains unresolved in this sandbox. |
| Content quality | 23% | 76 | Strong practical tool content and long-tail guides, but several legal/about pages remain short and there is no first-party author/process page beyond basic about/contact content. |
| On-page SEO | 20% | 82 | Titles/descriptions exist for every canonical page; two titles and three descriptions are slightly long. |
| Schema / structured data | 10% | 83 | WebApplication, BreadcrumbList, Article, Organization, and WebSite JSON-LD are now present. FAQPage remains intentionally omitted. |
| Performance / CWV | 10% | 62 | No live CWV data; app is client-heavy and uses AdSense, so field validation is still required. |
| AI search readiness / GEO | 10% | 82 | Added `llms.txt` and `llms-full.txt`; content is citation-friendly, with explicit tool boundaries and privacy model. |
| Images / visual assets | 5% | 45 | The product is SVG/UI driven, but manifest icons and default OG image assets are still missing. |

**Overall provisional score: 77 / 100.**

## Changes completed in this pass

### 1. Entity and schema hardening

Added `src/data/siteMeta.ts` as a single source for site-level SEO constants:

- `siteName`
- `siteUrl`
- `siteDescription`
- `siteLastModified`
- `siteContactEmail`
- Organization JSON-LD builder
- WebSite JSON-LD builder

Updated JSON-LD output:

- Homepage now emits `Organization`, `WebSite`, `WebApplication`, and `BreadcrumbList` in one `@graph`.
- Tool pages now emit `Organization`, `WebSite`, `WebApplication`, and `BreadcrumbList`.
- Guide pages now emit `Organization`, `WebSite`, `Article`, and `BreadcrumbList`.
- Article pages now include `datePublished`, centralized `dateModified`, `inLanguage`, `isPartOf`, and publisher references.
- FAQPage schema remains omitted, matching the skill quality gate that FAQ rich results are not a reliable growth lever for ordinary commercial/tool sites.

### 2. AI search / GEO index files

Added two static text routes:

- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`

These expose:

- priority pages
- canonical URL list
- product boundary notes
- privacy model
- sitemap reference
- full AI-oriented index

This improves machine-readable context for ChatGPT, Perplexity, Claude, Gemini-adjacent retrieval systems, and other answer engines that consume `llms.txt`-style indexes.

### 3. Security response headers

Added safe global headers in `next.config.ts`:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

A full enforcing CSP was not added because this app loads Next.js runtime scripts and AdSense. A strict CSP needs production browser verification to avoid breaking monetization and client hydration.

### 4. Sitemap freshness centralization

Updated `src/app/sitemap.ts` to use `siteLastModified` from `src/data/siteMeta.ts` rather than a hard-coded local literal. This makes future date maintenance less error-prone.

### 5. Dependency security upgrade

Updated dependencies:

- `next`: `15.5.9` → `15.5.19`
- `postcss`: `8.4.49` → `8.5.10`
- `vitest`: `2.1.8` → `4.1.8`

Result:

- Critical dev vulnerability removed.
- High Next.js vulnerability removed.
- `npm audit` now reports 2 moderate issues tied to Next/PostCSS advisory metadata. No force downgrade or major framework migration was applied.

### 6. SEO cache support

Added `.seo-cache/` to `.gitignore` and wrote fresh audit cache files:

- `.seo-cache/site-meta.json`
- `.seo-cache/audit-scores.json`
- `.seo-cache/sitemap.json`
- `.seo-cache/pages/homepage/technical.json`
- `.seo-cache/pages/homepage/schema.json`
- `.seo-cache/pages/homepage/geo.json`
- `.seo-cache/pages/homepage/performance.json`

## Technical SEO findings

### Passed / improved

- Canonical pages are centralized in `src/data/pages.ts`.
- Sitemap generation reads only canonical pages.
- Redirect aliases are separated from canonical sitemap entries.
- Robots source points to the sitemap.
- AdSense script is route-gated rather than globally loaded in root layout.
- Legal pages exist: privacy, terms, disclaimer, about, contact.
- No meta keywords strategy detected.
- `dangerouslySetInnerHTML` is limited to JSON-LD generated via `JSON.stringify`.
- Security headers now exist.
- `llms.txt` and `llms-full.txt` now exist as app routes.

### Remaining issues

| Priority | Issue | Evidence | Recommended fix |
|---|---|---|---|
| Critical | Public DNS could not be resolved from this sandbox | `curl` failed with `Could not resolve host: stockcut.ymirtool.com` | Verify Vercel domain binding, DNS records, and production propagation. |
| High | No live sitemap/robots status could be verified | DNS failure blocked production fetch | After deployment, verify `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/ads.txt`. |
| High | No field CWV data available | No PageSpeed/CrUX/GSC access and no live page | Run PageSpeed Insights and Search Console after production DNS works. |
| Medium | Enforcing CSP not implemented | AdSense + Next runtime require browser-tested policy | Add CSP after production testing, starting with report-only. |
| Medium | Service Worker runtime caching remains broad | `public/sw.js` caches GET responses broadly | Restrict cache to same-origin static assets and navigation fallback only. |
| Low | `metadata.openGraph.url` on many static pages is relative | page files use `url: page.slug` | Usually resolved by `metadataBase`, but absolute URLs are cleaner. |

## On-page SEO findings

### Page inventory

| Page type | Count |
|---|---:|
| Sheet tool pages | 13 |
| Linear tool pages | 7 |
| Kerf calculators | 2 |
| Guide pages | 10 |
| Legal pages | 3 |
| About/contact pages | 2 |
| Canonical total | 37 |
| Redirect aliases | 37 |

### Title and description checks

| Issue | Affected pages |
|---|---|
| Title over ~60 characters before brand template | `/sheet-cutting-optimizer`, `/linear-cutting-optimizer` |
| Description over ~160 characters | `/`, `/sheet-cutting-optimizer`, `/4x8-plywood-cut-list-optimizer` |
| Very short support-page descriptions | `/terms`, `/about`, `/contact` |

These are not blocking issues. The titles are query-specific and understandable; shorten only after Search Console shows low CTR or truncation issues.

## Content quality / E-E-A-T findings

### Strengths

- Practical content explains kerf, offcuts, trim margins, grain direction, rotation, waste, and shop verification.
- Tool pages keep the interactive calculator above explanatory content, which matches task intent.
- Guide pages use examples and tables rather than generic filler.
- The site clearly states limitations: no CNC, no G-code, no cloud save, no certified manufacturing output.
- Privacy model is transparent: browser-side calculation, localStorage autosave, hash-only share links.

### Gaps

- About/contact content is thin. It identifies the project but not enough methodology, change history, or verification process.
- No visible changelog or methodology page explains how optimizer outputs should be validated.
- No first-party screenshots, diagrams as static image assets, or OG images for sharing.
- No Search Console evidence yet for query cannibalization decisions among plywood, sheet, and kerf pages.

## Schema report

### Current schema types

| Context | Schema | Status |
|---|---|---|
| Homepage | Organization | Implemented |
| Homepage | WebSite | Implemented |
| Homepage | WebApplication | Implemented |
| Homepage | BreadcrumbList | Implemented |
| Tool pages | Organization | Implemented |
| Tool pages | WebSite | Implemented |
| Tool pages | WebApplication | Implemented |
| Tool pages | BreadcrumbList | Implemented |
| Guide pages | Organization | Implemented |
| Guide pages | WebSite | Implemented |
| Guide pages | Article | Implemented |
| Guide pages | BreadcrumbList | Implemented |
| Commercial FAQ | FAQPage | Intentionally omitted |

### Remaining schema opportunities

- Add `SoftwareApplication` only if you want a broader app-store-like entity in addition to `WebApplication`; current WebApplication is sufficient.
- Add `ImageObject` / publisher logo after real brand icons or OG images are created.
- Add `dateModified` per page rather than a global date once content updates become page-specific.

## Sitemap report

### Source-level findings

- `src/app/sitemap.ts` enumerates canonical pages from `canonicalPages`.
- Redirect aliases are not included in sitemap generation.
- Each sitemap entry has URL, `lastModified`, `changeFrequency`, and `priority`.
- The sitemap remains under the 50,000 URL limit.

### Remaining sitemap work

- Verify production `/sitemap.xml` returns HTTP 200 once DNS resolves.
- Verify sitemap is referenced in production `/robots.txt`.
- Consider using page-specific modification dates after content starts changing independently.

## Performance / Core Web Vitals report

No field or lab measurements were available in this run. The following are source-level risks only:

- The app is interactive and client-heavy by design.
- AdSense may affect LCP, INP, and CLS depending on placement and network behavior.
- Tool pages import more export/import code than the homepage lazy-load pattern in some areas.
- Service Worker caching could return stale assets if not tightened.
- Manifest has no icons, which weakens PWA completeness but is not a direct CWV issue.

Required production checks:

- PageSpeed Insights mobile and desktop for `/`, `/sheet-cutting-optimizer`, `/4x8-plywood-cut-list-optimizer`, `/linear-cutting-optimizer`.
- Search Console Core Web Vitals after enough field data accumulates.
- Real browser check with AdSense loaded.

## Visual / image SEO findings

### Strengths

- The product’s primary diagrams are generated SVGs, which are crisp and text-readable.
- Print CSS exists.
- Layout diagrams include labels and export controls.

### Gaps

- `manifest.webmanifest` has an empty `icons` array.
- No default Open Graph image is configured.
- No static illustrative screenshots are available for SERP/social previews or AI citation cards.

## AI search / GEO findings

### Improved

- Added `llms.txt` and `llms-full.txt`.
- Added explicit AI-readable limitations and privacy model.
- Added canonical URL index for answer engines.
- Added Organization/WebSite entity graph.

### Remaining

- Build topical authority with original examples, screenshots, and methodology pages.
- Add a changelog or verification methodology page to support E-E-A-T and AI citations.
- Once production is reachable, verify AI crawler access through robots and server logs.

## SXO findings

The UX matches search task intent better than an article-only landing page: users can immediately enter stock, parts, kerf, and quantity. This is positive for search experience.

Remaining SXO improvements:

- Add a short above-fold sample action such as “Load 4x8 plywood sample” on generic pages if not already visible in the tool state.
- Add page-specific example rows on high-intent pages to reduce first-use friction.
- Add clearer “not CNC / not CAM” note near DXF export controls if users encounter it from search.

## Validation performed

Executed successfully:

```bash
npm run typecheck
node scripts/validate-site.mjs
npm audit --omit=dev
npm audit
npm outdated
```

Skipped by instruction:

```bash
npm run build
npm test
npm run e2e
vitest
playwright
```

## Final limitations

- This report is not a substitute for a live production crawl because DNS resolution failed from the sandbox.
- No Core Web Vitals numbers are claimed.
- No Google Search Console, GA4, or PageSpeed API data was available.
- No PDF report was generated because the requested task was skill execution, not a client PDF deliverable.
