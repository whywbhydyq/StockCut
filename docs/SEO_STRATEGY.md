# StockCut SEO Strategy — Offline Skill Execution

This document records the local execution of `seo-plan` without private Search Console, PageSpeed, Bing, or CSP exports. It is a source-level strategy document, not a claim about live rankings or traffic.

## Business and audience

StockCut is a browser-based cut-list planning tool for sheet goods and linear materials. The primary audience is makers, cabinet builders, contractors, shop owners, and technical buyers who need a fast estimate before committing material or machine time.

## Strategic positioning

StockCut should compete on four durable strengths:

1. **Local-first privacy** — project dimensions stay in the browser unless the user explicitly exports or shares a hash link.
2. **Practical shop constraints** — kerf, trim, offcuts, stock cost, grain direction, and export formats are first-class content and UI concerns.
3. **Transparent boundaries** — the site should keep explaining that it is not CNC CAM, G-code generation, polygon nesting, or a substitute for shop verification.
4. **Machine-readable governance** — sitemap, RSS, llms files, content inventory, canonical map, release gates, evidence ledger, and change-control endpoints make the site easier to audit.

## Content pillars

| Pillar | Purpose | Primary pages |
|---|---|---|
| Sheet optimization | Capture plywood, MDF, acrylic, melamine, cabinet, shelving, and layout intent | `/sheet-cutting-optimizer`, `/4x8-plywood-cut-list-optimizer`, `/plywood-cutting-layout-calculator` |
| Linear optimization | Capture boards, pipe, tube, extrusion, rebar, and lumber intent | `/linear-cutting-optimizer`, `/pvc-pipe-cutting-optimizer`, `/steel-tube-cutting-optimizer` |
| Kerf and fit education | Explain why mathematical dimensions fail in shop reality | `/how-to-account-for-saw-kerf`, `/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet` |
| Methodology and trust | Explain algorithms, evidence, boundaries, and release quality gates | `/cut-list-optimization-methodology`, `/seo-quality`, `/seo-change-control` |

## Twelve-month roadmap

| Horizon | Focus | Output | Guardrail |
|---|---|---|---|
| 0–30 days | Deployment stability | Keep `npm run seo:local-gates` green | No protected SEO change without accepted candidate |
| 31–90 days | Query evidence | Import real GSC/PageSpeed/Rich Results/CSP data locally | Do not publish raw `seo-signals/` exports |
| 91–180 days | Targeted optimization | Change metadata/internal links only where production signals justify it | Use `.seo-cache/proposed-seo-changes.json` |
| 181–365 days | Authority | Publish external references, comparison assets, and outreach material | Keep outreach factual; no fake benchmarks |

## KPIs to measure only after real data import

- Indexed canonical pages.
- Search Console query impressions and CTR by canonical page.
- PageSpeed field/lab indicators for the top entry pages.
- Rich Results validity for representative tool and guide pages.
- CSP report-only violation stability before enforcement.

## Explicit non-goals

- Do not create thin location pages.
- Do not create product or ecommerce schema unless the site starts selling products.
- Do not create FAQPage markup just to chase rich results.
- Do not rewrite metadata based on guesses.
