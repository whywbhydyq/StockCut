# SEO Drift Baseline — Offline `seo-drift` Execution

This document defines how StockCut captures source-level SEO drift without live crawling and without private production exports.

## Captured surfaces

The local baseline scripts hash and summarize:

- package and Next config.
- SEO data files under `src/data/`.
- app routes under `src/app/`.
- public PWA/social assets.
- SEO automation scripts.
- SEO operating docs.

## Commands

```bash
npm run seo:drift-baseline
npm run seo:drift-compare
```

`seo:drift-baseline` writes `.seo-cache/seo-source-baseline.json`. `seo:drift-compare` compares the current source tree to that baseline and writes `.seo-cache/seo-source-drift-report.json`.

## Interpretation

- Changed hashes are not automatically failures.
- Protected SEO changes still require change-control approval.
- Drift reports are useful for release notes and rollback review.
- Live drift still requires production crawling or Search Console data, which is intentionally skipped unless explicitly provided.
