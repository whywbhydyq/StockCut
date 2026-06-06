# StockCut SEO signal exports

Keep raw Search Console, PageSpeed, Bing, CSP, and crawl exports local unless you intentionally publish aggregated summaries.

Expected files:

- `search-console-queries.csv`
- `gsc-pages.csv`
- `pagespeed-mobile.json`
- `pagespeed-desktop.json`
- `rich-results.json`
- `production-crawl.json`
- `csp-reports.json`
- `bing-indexing.csv`

Verify file shape before analysis:

```bash
node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json
```

Generate production action candidates:

```bash
node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json
```

## Change-control gate

After `verify-seo-signal-files.mjs` and `analyze-production-signals.mjs` produce a real action candidate, create `.seo-cache/proposed-seo-changes.json` with the intended action, URL, decision gate, source evidence, changed files, and reviewer note. Then run:

```bash
node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json
```

If no proposed change manifest exists, the script exits successfully with `no-proposed-changes`. If a manifest exists but lacks a matching production signal candidate, the script blocks the change.


## One-command local gate

Run the full local SEO gate chain with:

```bash
npm run seo:local-gates
```

This runs signal shape verification, production signal analysis, change-control gating, TypeScript typecheck, source-level site validation, and dependency audits. It does not run `npm run build`, Vitest, Playwright, or Lighthouse.

To include deployed production checks, pass a base URL directly to the script:

```bash
node scripts/run-seo-local-gates.mjs --base-url https://stockcut.ymirtool.com
```

## Proposed change template

Create a local proposed-change manifest with:

```bash
npm run seo:change-template
```

The generated `.seo-cache/proposed-seo-changes.json` is only a starting template. Keep a proposed change blocked until it matches a real `optimizationActionCandidate` from `.seo-cache/production-signals-summary.json`.

An example manifest is committed at `seo-signals/proposed-seo-changes.example.json`.

## Archive derived run summaries

After a release check, archive derived summaries with:

```bash
node scripts/archive-seo-signal-run.mjs
```

This copies generated summaries from `.seo-cache/` into `.seo-cache/signal-runs/<timestamp>/`. It does not copy raw private Search Console, PageSpeed, crawl, Bing, or CSP exports.

## CI and automation consistency

The repository includes a CI-safe workflow at `.github/workflows/seo-local-gates.yml`. It uses Node 20, installs with `npm ci --ignore-scripts`, then runs:

```bash
npm run seo:local-gates
```

The workflow does not run `npm run build`, Vitest, Playwright, or local Lighthouse. It uploads derived `.seo-cache` summaries as artifacts and does not upload raw `seo-signals/` exports.

Before changing the gate scripts or workflow, run:

```bash
npm run seo:automation-check
```

To archive derived summaries after a local or CI run, use:

```bash
npm run seo:archive-run
```

## When real signal export is skipped

If real Search Console, PageSpeed, Rich Results, Bing, crawl, backlink, competitor, or CSP exports are intentionally skipped, do not create placeholder data files. Run the offline skill gate instead:

```bash
npm run seo:offline-skills
```

This executes the local-only portions of `seo-plan`, `seo-flow`, `seo-cluster`, `seo-backlinks`, `seo-google`, and `seo-drift`. The full one-command gate also includes it:

```bash
npm run seo:local-gates
```
