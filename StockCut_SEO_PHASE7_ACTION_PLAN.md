# StockCut SEO Phase 7 Action Plan

## Immediate preview verification

Deploy the Phase 7 package to Vercel Preview and verify these URLs:

```text
/
/seo-quality
/quality-gates.json
/canonical-map.json
/seo-status.json
/site-index.json
/content-inventory.json
/site-map
/llms.txt
/llms-full.txt
/sitemap.xml
/feed.xml
/robots.txt
```

Expected results:

- `/seo-quality` returns a normal HTML page with the quality gate summary.
- `/quality-gates.json` returns JSON with `gateGroups`, `pageCoverage`, `canonicalAliasMap`, and `manualProductionChecks`.
- `/canonical-map.json` returns JSON with `canonicalPolicy`, `canonicalPages`, and `aliasRedirects`.
- `/site-index.json`, `/content-inventory.json`, `/llms.txt`, and `/llms-full.txt` reference the new quality/canonical endpoints.
- `/site-map` lists the SEO quality gate section.

## Production verification after deployment

After promoting to production:

1. Fetch five canonical pages and confirm:
   - HTTP 200.
   - Self-canonical metadata.
   - Open Graph image.
   - JSON-LD graph.
   - No `FAQPage` growth markup.

2. Fetch five legacy alias routes and confirm:
   - Permanent redirect.
   - Destination matches `/canonical-map.json`.

3. Validate machine-readable endpoints:
   - `/quality-gates.json`
   - `/canonical-map.json`
   - `/seo-status.json`
   - `/site-index.json`
   - `/content-inventory.json`

4. Run external checks:
   - Rich Results Test: homepage, sheet optimizer, linear optimizer, methodology page, `/seo-quality`.
   - PageSpeed Insights: homepage, sheet optimizer, linear optimizer.
   - Search Console URL Inspection: homepage, core calculator pages, `/site-map`, `/seo-quality`.

5. Continue observing CSP report-only output before enforcing CSP.

## Next phase candidate

Phase 8 should be data-driven rather than more endpoint expansion:

- Use Search Console queries and PageSpeed results.
- Compare actual indexed pages against `/canonical-map.json`.
- Tune title/description/copy only where production query data shows impressions without CTR or rankings.
- Consider adding a small production verification script that consumes `/quality-gates.json` and `/canonical-map.json` after deploy.
