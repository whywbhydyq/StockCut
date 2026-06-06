# StockCut SEO deployment gates

This project uses evidence-gated SEO release checks. The default gate is local and CI-safe:

```bash
npm ci --ignore-scripts
npm run seo:local-gates
```

The gate intentionally skips:

- `npm run build`
- Vitest
- Playwright
- local Lighthouse

## Required sequence

1. Place real production exports in `seo-signals/` only on the local machine or secure CI workspace.
2. Run `npm run seo:local-gates`.
3. If changing a protected SEO surface, create a manifest with `npm run seo:change-template` and replace the example values with a real accepted action candidate.
4. Re-run `npm run seo:local-gates`.
5. Archive derived summaries with `node scripts/archive-seo-signal-run.mjs --label <release-label>` when needed.

## Protected surfaces

Protected SEO surfaces include metadata, visible SEO copy, internal links, JSON-LD, indexing policy, performance-sensitive user paths, and CSP. These must not change unless the change-control report accepts the proposed change.

## CI behavior

The GitHub Actions workflow at `.github/workflows/seo-local-gates.yml` runs the same gate on Node 20 with `npm ci --ignore-scripts`. It uploads derived `.seo-cache` summaries as artifacts but does not upload raw production exports.

## Offline SEO skill coverage

When real `seo-signals/` exports are intentionally skipped, run the offline skill gate instead of inventing metrics:

```bash
npm run seo:offline-skills
```

This local gate covers the source-level portions of `seo-plan`, `seo-flow`, `seo-cluster`, `seo-backlinks`, `seo-google`, and `seo-drift`. It creates source drift snapshots under `.seo-cache/` and verifies the corresponding documentation exists. It does not export Search Console, PageSpeed, Bing, backlink, competitor, or CSP data.

The full deployment gate remains:

```bash
npm run seo:local-gates
```

`seo:local-gates` includes `seo:offline-skills` and still skips `npm run build`, Vitest, Playwright, and local Lighthouse.
