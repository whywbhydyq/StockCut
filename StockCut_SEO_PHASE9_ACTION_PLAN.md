# StockCut SEO Phase 9 Action Plan

## Immediate deployment validation

Deploy the Phase 9 package to Vercel Preview and verify these new/updated URLs:

```text
/seo-production-signals
/production-signals.json
/seo-status.json
/release-checklist.json
/content-inventory.json
/site-index.json
/site-map
/llms.txt
/llms-full.txt
/sitemap.xml
/feed.xml
/robots.txt
```

Expected results:

- `/seo-production-signals` renders a human-readable production-signal plan.
- `/production-signals.json` returns JSON with sources, input formats, KPIs, intent buckets, decision rules, page targets, and script instructions.
- `/site-map`, `/site-index.json`, `/content-inventory.json`, `/seo-status.json`, `/llms.txt`, and `/llms-full.txt` all reference the production signals endpoint.
- Footer contains a `Production signals` link.

## Production metrics intake

After production deployment, create a local ignored directory:

```bash
mkdir -p seo-signals
```

Add available exports using any of these names:

```text
seo-signals/search-console-queries.csv
seo-signals/search-console-pages.csv
seo-signals/pagespeed-mobile.json
seo-signals/pagespeed-desktop.json
seo-signals/rich-results.json
seo-signals/structured-data-notes.json
```

Then run:

```bash
node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json
```

Review the generated summary before changing titles, descriptions, internal links, or creating new pages.

## Decision rules for the next content iteration

Use these rules before editing content:

1. Do not create a new landing page from a single query unless it has sustained impressions and does not fit an existing canonical page.
2. For high-impression / low-CTR queries, first verify whether the query maps to the current page intent.
3. For average position 4–20 queries, prefer strengthening internal links, intro copy, evidence, and examples on the existing canonical page.
4. Treat missing Search Console data as incomplete evidence, not as proof of low demand.
5. Use PageSpeed and Rich Results from deployed production URLs only; source-only checks are not CWV proof.
6. Keep CSP report-only until real violation logs are reviewed after AdSense and crawler traffic are present.

## Next phase recommendation

Phase 10 should be driven by actual exported data from Phase 9:

- If GSC shows high-impression low-CTR queries: revise page titles and meta descriptions for the matching canonical pages.
- If GSC shows position 4–20 opportunities: strengthen internal links and evidence sections.
- If PageSpeed shows LCP or INP issues: optimize runtime JS, worker usage, and third-party script loading.
- If Rich Results shows parse failures: fix rendered JSON-LD before adding any new schema type.
- If CSP reports are clean: consider moving selected directives from report-only to enforcing CSP.
