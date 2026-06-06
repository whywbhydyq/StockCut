# StockCut SEO Action Plan

Date: 2026-06-06

## Completed in this pass

| Priority | Action | Status |
|---|---|---|
| Critical | Remove high/critical dependency exposure by upgrading Next/Vitest chain | Completed; high/critical findings removed, 2 moderate audit findings remain |
| High | Add entity-level Organization/WebSite schema | Completed |
| High | Add `llms.txt` and full AI index | Completed |
| High | Add safe security headers | Completed |
| Medium | Centralize sitemap last-modified source | Completed |
| Medium | Add `.seo-cache/` ignore and write cache artifacts | Completed |
| Medium | Re-run local type/static validation | Completed |

## Critical next actions

### 1. Fix or verify production DNS

The sandbox could not resolve `stockcut.ymirtool.com`. Verify:

- Vercel project domain binding
- DNS CNAME/A record
- SSL issuance
- production response for `/`
- production response for `/robots.txt`
- production response for `/sitemap.xml`
- production response for `/llms.txt`
- production response for `/ads.txt`

Acceptance criteria:

```text
https://stockcut.ymirtool.com/          -> 200
https://stockcut.ymirtool.com/robots.txt -> 200
https://stockcut.ymirtool.com/sitemap.xml -> 200
https://stockcut.ymirtool.com/llms.txt -> 200
https://stockcut.ymirtool.com/ads.txt -> 200
```

### 2. Run production-only SEO checks after deployment

Do not infer these locally. Measure live pages:

- PageSpeed Insights mobile/desktop
- Search Console URL Inspection
- Search Console sitemap submission
- Search Console Core Web Vitals after field data appears
- Rich Results Test for homepage, one tool page, and one guide page

## High-priority implementation backlog

### 3. Tighten Service Worker runtime caching

Current risk: broad GET caching can grow Cache Storage and serve stale or inappropriate responses.

Recommended implementation:

- Precache only known shell assets.
- Runtime cache same-origin static assets only.
- Use navigation fallback only for `request.mode === 'navigate'`.
- Do not cache third-party AdSense or analytics resources.
- Do not return `/` for CSS/JS/image failures.

### 4. Add real brand icons and OG image

Current manifest has no icons, and metadata has no default sharing image.

Recommended assets:

- `/icon.svg`
- `/icon-192.png`
- `/icon-512.png`
- `/apple-touch-icon.png`
- `/og/stockcut-default.png`

Then wire:

- `manifest.webmanifest.icons`
- `metadata.icons`
- `metadata.openGraph.images`
- `metadata.twitter.images`

### 5. Add methodology / verification page

Add a content page explaining:

- how kerf is handled
- how guillotine-style layout differs from true industrial nesting
- why output must be verified before cutting
- how stock/offcuts are interpreted
- what DXF export does and does not represent

This strengthens E-E-A-T, AI citation quality, and user trust.

## Medium-priority backlog

### 6. Tune title and meta descriptions after GSC data

Potential candidates:

- `/sheet-cutting-optimizer` title is 61 characters before brand suffix.
- `/linear-cutting-optimizer` title is 62 characters before brand suffix.
- `/`, `/sheet-cutting-optimizer`, and `/4x8-plywood-cut-list-optimizer` descriptions are slightly long.
- `/about`, `/contact`, and `/terms` descriptions are short.

Do not shorten blindly. Use Search Console CTR and query data first.

### 7. Make OpenGraph URLs absolute on all generated page metadata

Current page files use `openGraph.url: page.slug`, relying on `metadataBase` resolution. It should work, but absolute URLs are easier to inspect and less ambiguous.

### 8. Add page-specific `dateModified`

Current update date is centralized. Once content changes independently, store a `lastModified` field in each `SeoPage` entry and use it in:

- sitemap
- Article schema
- page metadata if needed

### 9. Add screenshot-based visual acceptance

After DNS/build is available, capture:

- desktop homepage
- mobile homepage
- sheet tool result state
- linear tool result state
- 4x8 plywood page

Use screenshots to verify above-fold clarity, CLS risk, ad placement, and first-interaction friction.

## Low-priority backlog

### 10. Add static visual examples for high-intent guide pages

Good candidates:

- `/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet`
- `/how-to-account-for-saw-kerf`
- `/how-to-read-a-plywood-cutting-diagram`
- `/grain-direction-in-cut-lists`

Use original diagrams rather than stock images.

### 11. Add report-only CSP first

Start with `Content-Security-Policy-Report-Only` in production and check AdSense/hydration behavior. Do not enforce until violations are understood.

## Validation commands used

Allowed and run:

```bash
npm run typecheck
node scripts/validate-site.mjs
npm audit --omit=dev
npm audit
npm outdated
```

Explicitly not run:

```bash
npm run build
npm test
npm run e2e
```
