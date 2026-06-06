# FLOW Operating Model for StockCut

This document applies the `seo-flow` skill locally, without live SERP, GSC, or backlink exports. FLOW is used here as an operating workflow: Find → Leverage → Optimize → Win.

## Find

Use existing source-declared assets to identify opportunities:

- `src/data/seoIntentClusters.ts` for query families.
- `/content-inventory.json` for canonical content roles.
- `/content-drift.json` for deterministic source fingerprints.
- `/production-signals.json` for required real data inputs.

Outputs: candidate hypotheses only. No title, description, Schema, or CSP changes are allowed at this stage.

## Leverage

Use authority assets that are already defensible:

- methodology page for algorithm and workflow explanation.
- evidence ledger for citation and trust boundaries.
- quality gates for release governance.
- content inventory and site index for machine-readable discovery.

Outputs: outreach targets and documentation assets, not fabricated links or testimonials.

## Optimize

Only optimize protected surfaces when all conditions are true:

1. Real production files exist in `seo-signals/`.
2. `npm run seo:local-gates` passes.
3. `.seo-cache/production-signals-summary.json` contains matching `optimizationActionCandidates`.
4. `.seo-cache/proposed-seo-changes.json` references those candidates.
5. `seo-change-control-report.json` accepts the proposal.

## Win

Measure the effect after deployment:

- Search Console page/query changes.
- Rich Results validity.
- PageSpeed regressions.
- Canonical/alias status.
- CSP readiness state.

If the effect cannot be measured, archive the run but do not claim a ranking or traffic win.

## Default command sequence

```bash
npm run seo:local-gates
npm run seo:archive-run -- --label <release-label>
```

The command sequence intentionally skips `npm run build`, Vitest, Playwright, and local Lighthouse.
