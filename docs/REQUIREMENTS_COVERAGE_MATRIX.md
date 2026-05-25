# Requirements Coverage Matrix

## P0 coverage

| Requirement | Status | Evidence |
|---|---|---|
| Sheet Cutting Optimizer | Implemented | Sheet optimizer, multi-stock, offcuts, rotation, grain metadata, trim, cost, warnings, layout SVG |
| Linear Cutting Optimizer | Implemented | Best-fit decreasing, multi-stock/offcut, kerf, stock bars, repeated cutting patterns |
| Saw Kerf Calculator | Implemented | Independent calculator with exact-fit 48/24 example |
| Unit system | Implemented | mm, cm, inch decimal, fractional inch, feet-inch, 4x8 ft shorthand tests |
| Kerf handling | Implemented | Shared parser and kerf-aware sheet/linear tests |
| Print output | Implemented | Print CSS and Browser Print / Save PDF buttons |
| PDF export | Implemented | Vector PDF generator with diagrams, summaries, warnings, offcuts, disclaimer |
| Result layout diagram | Implemented | SVG layout with labels, offcuts, edge banding marks, zoom controls |
| PNG/SVG export | Implemented | SVG and PNG layout downloads |
| Copy summary | Implemented | Sheet and linear result copy buttons |
| Row-level import errors | Implemented | Paste/CSV/XLSX parser errors retained without clearing data |
| Long-tail pages | Implemented | 79 static routes in build table |
| Legal pages | Implemented | Privacy, Terms, Disclaimer, About, Contact and legal aliases |
| Sitemap/robots/ads.txt | Implemented | Smoke test returns 200 for `/sitemap.xml`, `/robots.txt`, `/ads.txt` |
| No meta keywords | Implemented | Static validation and page code do not use meta keywords |
| Local-first privacy | Implemented | localStorage/share hash, no cloud save |
| Vercel ignoreCommand | Implemented | `vercel.json` keeps `node scripts/skip-old-vercel-builds.mjs` |

## P1/P2 coverage

| Requirement | Status | Evidence / boundary |
|---|---|---|
| CSV import/export | Implemented | CSV parser/exporter and import buttons |
| Excel import | Implemented | Lightweight XLSX parser and test |
| JSON save/load | Implemented | Project JSON import/export and localStorage save |
| Share link | Implemented | Hash-only share links |
| Multiple stock sizes | Implemented | Extra stock/offcut tables |
| Offcut reuse | Implemented | Offcut stock inputs and optimizer priority |
| Grain direction | Implemented | Grain lock disables rotation and metadata is rendered |
| Edge banding | Implemented | T/R/B/L fields and layout marks |
| Cost estimate | Implemented | Stock cost summary |
| Strategy toggle | Implemented | least_stock / least_waste / fewer_cuts |
| Manual drag adjustment | Implemented with browser-verification caveat | Select/drag/nudge/rotate sheet parts, clamp to usable sheet, block overlaps, block grain-locked rotation, recompute offcuts; runtime browser interaction still needs external verification |
| Grain matching groups | Partial | Grain lock exists; continuous veneer matching groups are not implemented |
| Angle cuts | Not fully implemented | Linear planner remains straight-cut only; no angular geometry calculation |
| Identical cutting layouts | Partial | Linear repeated pattern summary exists; 2D identical sheet pattern compaction is not fully implemented |
| DXF export | Implemented with boundary | Lightweight rectangular planning DXF only; not CNC toolpath or G-code |
| CNC/router mode | Not implemented | Explicitly kept out of scope beyond planning disclaimer |
| Inventory/offcut library | Implemented with local-first boundary | Sheet and linear offcuts can be saved to a browser localStorage library, loaded back into extra stock, and cleared from the UI |
| Project quote | Partial | Material cost estimate exists; formal quote system not implemented |
| Batch templates | Implemented | Multiple sheet and linear presets |
| Multi-language pages | Not implemented | English site retained; Chinese route system not added |
| Affiliate comparison pages | Partial | Affiliate slot exists; full comparison pages not added |

## Boundary note

The supplied requirements also explicitly excluded industrial nesting, G-code, ERP, cloud accounts, and production machine integration. Those remain excluded.

## 2026-05-25 continuation pass

- Added real Worker entrypoint and fallback worker client.
- Added linear miter/angle planning note and shop notes to inputs, placements, CSV, PDF, and visual bars.
- Added controls to reuse generated sheet and linear offcuts as additional stock.
- Fixed public copy that incorrectly said DXF was absent; DXF is still planning-only and not CAM/G-code.

## 2026-05-25 second continuation pass

- Added manual sheet layout adjustment with drag, nudge, rotate, overlap blocking, bounds clamping, grain-lock rotation blocking, and offcut recomputation.
- Added local sheet and linear offcut inventory libraries with load/clear UI.
- Added unit tests for manual adjustment and inventory conversion.
