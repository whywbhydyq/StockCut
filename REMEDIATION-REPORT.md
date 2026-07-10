# StockCut remediation

- Removed internal SEO governance pages from the public canonical inventory, sitemap, footer, public site map, `humans.txt`, and LLM indexes.
- Internal human-readable governance routes now return `404` by default; internal machine-readable governance endpoints return `410 Gone` with `X-Robots-Tag: noindex, nofollow, noarchive`.
- Internal governance views can only be re-enabled deliberately with `ENABLE_INTERNAL_SEO_ENDPOINTS=1`; the production-safe default is disabled.
- Changed calculator pages to render the live optimizer before descriptive content.
- Replaced broad automatic advertising with an explicit high-value route allowlist.
- Removed empty ad, affiliate, and generic filler blocks from the shared page shell.
- Limited detailed evidence panels to core calculator routes and corrected schema types for policy/about pages.
- Kept `/site-map` as a clean human-facing directory of public calculators, guides, and policy pages only.

Validation: TypeScript passed, 38 unit tests passed, source policy validation passed, the production Next.js build completed successfully, public calculator routes returned `200`, internal governance pages returned `404`, and machine governance endpoints returned `410`.
