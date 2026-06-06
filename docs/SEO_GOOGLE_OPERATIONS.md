# Google Search Operations — Offline `seo-google` Execution

This document covers Google-facing operations that can be prepared without Search Console access. It does not claim live indexing, ranking, or Core Web Vitals results.

## Search Console setup checklist

- Verify the domain property for `stockcut.ymirtool.com`.
- Submit `https://stockcut.ymirtool.com/sitemap.xml`.
- Inspect these URLs after each production deployment:
  - `/`
  - `/sheet-cutting-optimizer`
  - `/linear-cutting-optimizer`
  - `/cut-list-optimization-methodology`
  - `/site-map`
- Export query and page data only when needed for evidence-backed changes.

## Rich Results workflow

Validate one representative page from each group:

- home page
- sheet optimizer page
- linear optimizer page
- guide page
- methodology page

If Rich Results reports a structured-data issue, create `.seo-cache/proposed-seo-changes.json` and run `npm run seo:local-gates` before changing Schema.

## PageSpeed workflow

Run PageSpeed externally against production URLs. Save JSON exports locally under `seo-signals/` only when a performance change is being proposed. Raw exports are ignored by git.

## Indexing workflow

Use `/canonical-map.json` to confirm alias paths are not submitted and canonical pages are included in sitemap/feed. Use `/quality-gates.json` and `/release-checklist.json` before requesting indexing.

## Privacy and repository policy

Do not commit raw GSC, PageSpeed, Bing, crawl, or CSP exports. Derived `.seo-cache` summaries may be archived as release artifacts when they contain no private account data.
