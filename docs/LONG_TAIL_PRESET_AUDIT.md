# StockCut priority long-tail preset audit

This matrix documents the five priority search landing pages that should be monitored before adding new long-tail URLs.

| Page | Primary query | Role | Cannibalization risk | Current status | Next action |
|---|---|---|---|---|---|
| `/4x8-plywood-cut-list-optimizer` | 4x8 plywood cut list optimizer | Exact 48 x 96 plywood preset | Medium | monitor_gsc | Confirm 4x8 queries land here, not the generic plywood page. |
| `/sheet-cutting-optimizer` | sheet cutting optimizer | Generic sheet-goods optimizer | Medium | monitor_gsc | Keep generic sheet intent here; do not target exact 4x8 wording. |
| `/linear-cutting-optimizer` | linear cutting optimizer | Generic 1D straight-stock parent page | Medium | monitor_gsc | Keep PVC, steel tube, and lumber pages material-specific. |
| `/pvc-pipe-cutting-optimizer` | pvc pipe cut list optimizer | PVC-specific preset page | Low | monitor_gsc | Keep PVC examples and wording specific. |
| `/steel-tube-cutting-optimizer` | steel tube cut list optimizer | Steel-tube-specific preset page | Low | monitor_gsc | Keep steel tube examples distinct from PVC and aluminum extrusion. |

Current limitation: these are static content and routing checks, not search performance proof. Final decisions require Google Search Console query/page data after deployment.
