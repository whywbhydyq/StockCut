# StockCut SEO Phase 4 Action Plan

## Immediate deployment checklist

1. Deploy the Phase 4 package to Vercel Preview using Node 20.
2. Verify these URLs return expected status/content:
   - `/`
   - `/sheet-cutting-optimizer`
   - `/linear-cutting-optimizer`
   - `/how-to-account-for-saw-kerf`
   - `/cut-list-optimization-methodology`
   - `/llms.txt`
   - `/llms-full.txt`
   - `/site-index.json`
   - `/sitemap.xml`
   - `/robots.txt`
3. Inspect one sheet page and one linear page to confirm the new intent navigation appears below the main content and before ads/support sections.
4. Validate JSON-LD on homepage and one tool page.
5. If Preview is normal, deploy to production.

## Search Console follow-up

After production deploy:

1. Request indexing for:
   - `/`
   - `/sheet-cutting-optimizer`
   - `/linear-cutting-optimizer`
   - `/4x8-plywood-cut-list-optimizer`
   - `/cut-list-optimization-methodology`
2. Submit or resubmit `/sitemap.xml`.
3. After 7-14 days, review query data by page group:
   - sheet-goods pages
   - linear-stock pages
   - kerf-and-fit pages
   - methodology/guide pages
4. Use impressions-without-clicks to refine titles and first-screen copy.
5. Use indexed-but-low-query pages to improve internal linking or consolidate intent.

## PageSpeed / CWV follow-up

1. Run PageSpeed Insights on homepage, sheet page, linear page, and methodology page.
2. Track mobile LCP, INP, and CLS.
3. If LCP is weak, inspect first-screen CSS and any blocking third-party scripts.
4. If INP is weak, profile optimizer interactions and large table updates.
5. If CLS is weak, inspect ad slots, SVG layout area, and late-loaded content.

## CSP follow-up

1. Keep current CSP as `Content-Security-Policy-Report-Only`.
2. Observe AdSense and analytics report-only violations.
3. If clean, convert a narrow subset of directives to enforced CSP first.
4. Avoid forcing a strict CSP until ad scripts and frames are verified in production.

## Next optimization batch

Recommended Phase 5 focus:

1. Add real Search Console query buckets once data exists.
2. Improve pages with high impressions and low CTR.
3. Add measured examples only where they support a real search intent.
4. Avoid creating programmatic pages without unique preset, calculator state, or decision content.
5. Continue validating locally with typecheck and `scripts/validate-site.mjs`; do not use build/tests unless explicitly allowed.
