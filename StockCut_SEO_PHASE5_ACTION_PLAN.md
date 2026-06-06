# StockCut SEO Phase 5 Action Plan

Date: 2026-06-06
Status: Implementation complete locally; deploy to preview next.

## Completed in Phase 5

1. Added `/site-map` human-readable site map.
2. Added `/content-inventory.json` machine-readable content governance index.
3. Added reusable page evidence data and visible evidence panels.
4. Added page-level evidence JSON-LD via `CreativeWork` nodes.
5. Added `about` and `mentions` topic alignment to canonical page JSON-LD.
6. Updated `/llms.txt`, `/llms-full.txt`, and `/site-index.json` to reference the new index surfaces.
7. Added footer link to `/site-map`.
8. Extended local static validation to guard these surfaces.

## Preview validation checklist

After deploying to Vercel Preview, check:

```text
/
/site-map
/content-inventory.json
/site-index.json
/llms.txt
/llms-full.txt
/sitemap.xml
/robots.txt
/sheet-cutting-optimizer
/linear-cutting-optimizer
/how-to-account-for-saw-kerf
/cut-list-optimization-methodology
```

Verify:

- `/site-map` renders grouped canonical pages and legacy redirects.
- `/content-inventory.json` returns JSON with `pages`, `evidence`, `relatedCanonicalPages`, and `schemaTypes`.
- `/site-index.json` includes `humanReadableSiteMap`, `contentInventory`, and `citationSummary` fields.
- `/llms.txt` links `/site-map` and `/content-inventory.json`.
- `/llms-full.txt` includes page evidence summaries and citation guidance.
- Page evidence panels appear below the calculator or article body, not above the primary tool.
- Rich Results Test still recognizes valid WebApplication / Article / BreadcrumbList / WebPage graph nodes.

## Production release checklist

1. Deploy to Vercel Preview using Node 20.
2. Manually verify the preview URLs above.
3. Promote to production if preview is stable.
4. Submit `/sitemap.xml` again in Search Console and Bing Webmaster Tools.
5. Use URL Inspection for:
   - `/`
   - `/site-map`
   - `/content-inventory.json`
   - `/sheet-cutting-optimizer`
   - `/linear-cutting-optimizer`
   - `/cut-list-optimization-methodology`
6. Run Rich Results Test on homepage, one sheet page, one linear page, and one guide page.
7. Re-run PageSpeed after production deployment.
8. Observe CSP report-only logs before converting CSP to enforced mode.

## Recommended Phase 6

Move from implementation-led SEO to measured production SEO:

- Pull Search Console query data for the top 20 landing pages.
- Map queries to current intent clusters.
- Identify pages with impressions but low CTR.
- Rewrite titles/descriptions only where query evidence supports it.
- Identify pages with impressions but low position and assess content depth.
- Use PageSpeed and real-user CWV data to prioritize performance work.
- Only then consider new pages; avoid adding new long-tail pages without query evidence.
