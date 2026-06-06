# StockCut SEO Phase 3 Action Plan

## Completed in this batch

- Permanent redirect semantics for alias pages.
- CSP hardening started with report-only policy.
- AI crawler robots visibility made explicit.
- PWA icons and OG image added.
- Root and page-level social metadata improved.
- WebPage / WebApplication / Article / Organization / WebSite schema graph expanded.
- Methodology guide added and linked.
- About page trust content expanded.
- llms priority pages updated.
- `.seo-cache` refreshed with module results.
- TypeScript, static site validation, and npm audit passed.

## Critical

No source-code critical SEO blockers remain after this batch.

## High priority: after deploying this package

1. Verify these production URLs return HTTP 200 or expected 308 redirects:
   - `/`
   - `/sitemap.xml`
   - `/robots.txt`
   - `/llms.txt`
   - `/llms-full.txt`
   - `/manifest.webmanifest`
   - `/stockcut-og.png`
   - `/icon-192.png`
   - `/cut-list-optimization-methodology`
   - `/guides/cut-list-optimization-methodology`

2. Run PageSpeed Insights on:
   - homepage,
   - `/sheet-cutting-optimizer`,
   - `/linear-cutting-optimizer`,
   - `/4x8-plywood-cut-list-optimizer`,
   - `/cut-list-optimization-methodology`.

3. Run Rich Results Test on:
   - homepage,
   - one tool page,
   - one guide page,
   - the new methodology page.

4. In Google Search Console:
   - resubmit sitemap,
   - request indexing for the methodology page,
   - inspect the top tool pages,
   - monitor Core Web Vitals and Page Indexing.

## Medium priority

1. Review CSP report-only behavior in production browser console and Vercel logs. If clean, convert it from `Content-Security-Policy-Report-Only` to enforcing `Content-Security-Policy`.
2. Add original diagrams/screenshots for top pages:
   - 4x8 plywood layout example,
   - kerf failure example,
   - sheet vs linear mode explanation,
   - offcut reuse example,
   - grain/rotation example.
3. Add page-level `lastModified` values once content updates diverge by URL.
4. Consider IndexNow support for Bing/Naver/Yandex after production release.
5. Add a short changelog or update note to methodology/about pages when algorithm behavior changes.

## Low priority

1. Add RSL or other AI licensing metadata only after deciding whether to permit or restrict model-training use.
2. Add external citations or public release notes for trust signals if the project becomes more widely distributed.
3. Build a lightweight screenshot gallery for the methodology and guide pages.

## Validation command set for the next local pass

```bash
npm run typecheck
node scripts/validate-site.mjs
npm audit --omit=dev --json
npm audit --json
```

Do not run `npm run build` or tests unless the project instruction changes.
