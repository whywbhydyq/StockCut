# StockCut SEO Phase 8 Action Plan

## Immediate next step

Deploy Phase 8 to Vercel Preview and verify the new release-governance endpoints and page.

## Preview URLs to verify

```text
/seo-release-checklist
/release-checklist.json
/content-drift.json
/seo-status.json
/quality-gates.json
/canonical-map.json
/site-index.json
/content-inventory.json
/site-map
/llms.txt
/llms-full.txt
/sitemap.xml
/feed.xml
/robots.txt
```

## Optional production script after deploy

From a network that can resolve the production host:

```bash
node scripts/check-production-seo.mjs https://stockcut.ymirtool.com
```

Expected result:

```text
Production SEO checks passed for https://stockcut.ymirtool.com
```

## Manual production checks

- Confirm `/release-checklist.json` returns JSON and exposes endpoint, canonical HTML, redirect, header, asset, PageSpeed, and Search Console groups.
- Confirm `/content-drift.json` returns one fingerprint per canonical page.
- Confirm `/seo-release-checklist` renders and links the JSON endpoints.
- Confirm sampled canonical pages return 200 and show JSON-LD in rendered HTML.
- Confirm sampled aliases return permanent redirects to canonical pages.
- Confirm expected security headers are present in production.
- Run Rich Results Test on homepage, sheet optimizer, linear optimizer, methodology page, and release checklist page.
- Run PageSpeed Insights on homepage, sheet optimizer, and linear optimizer.
- Submit sitemap in Google Search Console and Bing Webmaster Tools after production deploy.

## Next phase recommendation

Phase 9 should be production-data driven. Use Search Console, PageSpeed, Rich Results Test, and crawl logs to decide whether to:

1. tighten CSP from report-only to enforcing,
2. adjust titles/descriptions based on actual queries,
3. refine internal links where Search Console shows impressions without clicks,
4. remove or consolidate governance pages if they are crawled but not useful,
5. improve calculator UX based on real PageSpeed and interaction bottlenecks.
