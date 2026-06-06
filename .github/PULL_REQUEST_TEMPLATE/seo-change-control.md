## SEO / GEO change-control checklist

- [ ] This PR does not run or require `npm run build`, Vitest, Playwright, or local Lighthouse.
- [ ] I ran `npm run seo:local-gates` locally, or the GitHub Actions `SEO local gates` workflow ran successfully.
- [ ] If this PR changes titles, descriptions, visible SEO copy, internal links, JSON-LD, indexing policy, performance-sensitive code, or CSP, `.seo-cache/proposed-seo-changes.json` references accepted `optimizationActionCandidates` from real production signals.
- [ ] Raw Search Console, PageSpeed, crawl, Bing, and CSP exports are not committed.
- [ ] Derived `.seo-cache` summaries are attached to the release note or archived outside the repository when needed.

### Evidence notes

List the evidence files or action candidates that justify the change. Use `npm run seo:change-template` to create a local manifest template when a protected SEO surface is touched.

### Offline SEO skill coverage

- [ ] If this PR updates strategy, cluster, backlink, Google operations, FLOW, or drift documentation, run `npm run seo:offline-skills` or `npm run seo:local-gates`.
