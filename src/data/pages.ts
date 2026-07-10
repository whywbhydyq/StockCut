import type { LinearPresetKey, SheetPresetKey } from './presets';
import { siteUrl } from './siteMeta';

export type PageKind = 'sheet' | 'linear' | 'kerf' | 'guide' | 'legal' | 'about';

export interface SeoPage {
  slug: string;
  title: string;
  description: string;
  kind: PageKind;
  preset?: SheetPresetKey | LinearPresetKey;
  primaryQuery?: string;
  contentRole?: string;
}

export interface RedirectAlias {
  source: string;
  destination: string;
  permanent: true;
}

export { siteUrl };

export const canonicalPages: SeoPage[] = [
  { slug: '/', title: 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube', description: 'Enter stock size, parts, kerf, and quantity to generate a browser-based cut layout, cutting sequence, waste estimate, and printable cut list for sheet goods, lumber, pipe, and tube.', kind: 'sheet', preset: 'imperial-sheet', primaryQuery: 'cut list optimizer', contentRole: 'Primary homepage workbench for broad sheet and linear cut-list intent.' },
  { slug: '/sheet-cutting-optimizer', title: 'Sheet Cutting Optimizer for Plywood, MDF, Acrylic, and Panels', description: 'Optimize rectangular sheet goods with custom stock sizes, kerf, rotation controls, labels, offcuts, and printable diagrams for plywood, MDF, acrylic, melamine, and panels.', kind: 'sheet', preset: 'imperial-sheet', primaryQuery: 'sheet cutting optimizer', contentRole: 'Generic sheet-goods optimizer; avoid competing with the 4x8 plywood preset page.' },
  { slug: '/linear-cutting-optimizer', title: 'Linear Cutting Optimizer for Boards, Pipe, Tube, and Bar Stock', description: 'Optimize straight-stock cuts for lumber, pipe, tube, extrusion, rebar, and bar stock with kerf, cut sequence, waste, offcuts, and printable shop output.', kind: 'linear', preset: 'imperial-linear', primaryQuery: 'linear cutting optimizer', contentRole: 'Generic 1D straight-stock optimizer; parent page for lumber, PVC, steel tube, and bar presets.' },
  { slug: '/saw-kerf-calculator', title: 'Saw Kerf Calculator for Cut Lists', description: 'Calculate blade kerf loss, finished part fit, raw stock length, and why exact-fit cuts fail when saw width is included.', kind: 'kerf' },
  { slug: '/plywood-cutting-layout-calculator', title: 'Plywood Cutting Layout Calculator for Custom Sheet Sizes', description: 'Generate plywood cutting layouts for custom sheet dimensions, labels, kerf spacing, waste, offcuts, and printable diagrams when a 4x8 preset is not enough.', kind: 'sheet', preset: 'plywood-4x8', primaryQuery: 'plywood cutting layout calculator', contentRole: 'Generic plywood layout page for custom stock sizes; do not target the exact 4x8 query.' },
  { slug: '/4x8-plywood-cut-list-optimizer', title: '4x8 Plywood Cut List Optimizer with Kerf', description: 'Load a 48 x 96 inch plywood preset, enter rectangular parts, include kerf, and generate a printable 4x8 plywood cut layout with waste and unplaced-part warnings.', kind: 'sheet', preset: 'plywood-4x8', primaryQuery: '4x8 plywood cut list optimizer', contentRole: 'Specific 48 x 96 plywood preset page; this is the canonical 4x8 page.' },
  { slug: '/mdf-sheet-cut-calculator', title: 'MDF Sheet Cut Calculator', description: 'Plan MDF panel cuts using 2440 × 1220 mm stock, metric units, kerf, and printable layouts.', kind: 'sheet', preset: 'mdf-metric' },
  { slug: '/acrylic-sheet-cutting-layout-tool', title: 'Acrylic Sheet Cutting Layout Tool', description: 'Arrange rectangular acrylic panels with kerf-aware spacing, labels, offcuts, and printable results.', kind: 'sheet', preset: 'acrylic-metric' },
  { slug: '/melamine-cut-list-optimizer', title: 'Melamine Cut List Optimizer', description: 'Plan melamine cabinet panels with rotation control, metric stock, kerf spacing, and printable layouts.', kind: 'sheet', preset: 'melamine-cabinet' },
  { slug: '/cabinet-cut-list-optimizer', title: 'Cabinet Cut List Optimizer', description: 'Create a practical cabinet cut list layout for rectangular panels with quantity, labels, rotation control, and kerf.', kind: 'sheet', preset: 'cabinet' },
  { slug: '/bookshelf-cut-list-calculator', title: 'Bookshelf Cut List Calculator', description: 'Calculate bookshelf shelves, sides, tops, and backs from sheet stock with printable cut diagrams.', kind: 'sheet', preset: 'bookshelf' },
  { slug: '/drawer-box-cut-list-calculator', title: 'Drawer Box Cut List Calculator', description: 'Lay out repeated drawer side, front, back, and bottom panels from plywood or Baltic birch sheet stock.', kind: 'sheet', preset: 'drawer-box' },
  { slug: '/closet-shelf-plywood-calculator', title: 'Closet Shelf Plywood Calculator', description: 'Estimate closet shelves and dividers from plywood sheet stock with labels, waste, and printable diagrams.', kind: 'sheet', preset: 'closet-shelf' },
  { slug: '/workbench-plywood-cut-layout', title: 'Workbench Plywood Cut Layout', description: 'Generate a practical workbench plywood cut layout with top layers, shelves, gussets, kerf, and offcuts.', kind: 'sheet', preset: 'workbench' },
  { slug: '/linear-bar-cutting-list-optimizer', title: 'Linear Bar Cutting List Optimizer', description: 'Optimize straight bar stock cuts with kerf, sequence, used length, and offcut output.', kind: 'linear', preset: 'linear-bar' },
  { slug: '/steel-tube-cutting-optimizer', title: 'Steel Tube Cut List Optimizer with Kerf', description: 'Optimize straight steel tube cut lists from standard stock lengths with kerf, cut sequences, offcuts, waste, and printable partial-report warnings.', kind: 'linear', preset: 'steel-tube', primaryQuery: 'steel tube cut list optimizer', contentRole: 'Steel tube preset page; distinct from PVC pipe and generic linear optimizer.' },
  { slug: '/aluminum-extrusion-cut-list-optimizer', title: 'Aluminum Extrusion Cut List Optimizer', description: 'Plan aluminum extrusion cuts using metric stock length, saw kerf, and best-fit decreasing optimization.', kind: 'linear', preset: 'aluminum-extrusion' },
  { slug: '/pvc-pipe-cutting-optimizer', title: 'PVC Pipe Cut List Optimizer with Kerf', description: 'Plan PVC pipe cuts from standard stock lengths with kerf, segment quantities, cutting sequence, remaining offcuts, and clearly marked unplaced cuts.', kind: 'linear', preset: 'pvc-pipe', primaryQuery: 'pvc pipe cut list optimizer', contentRole: 'PVC-specific straight-stock preset; do not target generic linear cutting terms.' },
  { slug: '/lumber-length-cutting-optimizer', title: 'Lumber Length Cutting Optimizer', description: 'Plan lumber length cuts from common boards with kerf, repeated parts, and printable stock sequences.', kind: 'linear', preset: 'lumber-length' },
  { slug: '/how-to-account-for-saw-kerf', title: 'How to Account for Saw Kerf', description: 'Learn how blade thickness affects finished part sizes and why kerf must be included in cut lists.', kind: 'guide' },
  { slug: '/guillotine-cut-vs-nesting', title: 'Guillotine Cut vs Nesting', description: 'Understand the difference between straight-line sheet cutting layouts and industrial nesting software.', kind: 'guide' },
  { slug: '/cut-list-optimizer-vs-excel', title: 'Cut List Optimizer vs Excel', description: 'Compare spreadsheet cut lists with a kerf-aware visual optimizer that can produce printable layouts.', kind: 'guide' },
  { slug: '/how-to-read-a-plywood-cutting-diagram', title: 'How to Read a Plywood Cutting Diagram', description: 'Read labels, part orientation, kerf spacing, and offcut regions in a printable plywood cutting diagram.', kind: 'guide' },
  { slug: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', title: 'Why Two 24 Inch Panels Do Not Fit on a 48 Inch Sheet', description: 'A kerf-focused explanation of why two exact 24 inch panels exceed a 48 inch sheet once the saw cut is included.', kind: 'guide' },
  { slug: '/saw-kerf-compensation-calculator', title: 'Saw Kerf Compensation Calculator', description: 'Calculate how much extra raw stock is required after blade kerf is included in a finished cut list.', kind: 'kerf' },
  { slug: '/rebar-cutting-optimizer', title: 'Rebar Cutting Optimizer', description: 'Optimize rebar cuts from standard lengths with kerf, material grouping, offcuts, and printable cutting sequences.', kind: 'linear', preset: 'rebar' },
  { slug: '/plywood-yield-rate-calculator', title: 'Plywood Yield Rate Calculator', description: 'Calculate plywood sheet usage, finished part area, yield rate, waste rate, offcuts, and printable planning output from a rectangular cut list.', kind: 'sheet', preset: 'plywood-4x8', primaryQuery: 'plywood yield rate calculator', contentRole: 'Yield and waste explanation page; secondary to sheet and 4x8 optimizer pages.' },
  { slug: '/cut-list-optimizer-vs-sketchup', title: 'Cut List Optimizer vs SketchUp', description: 'Compare drawing a project in SketchUp with generating a kerf-aware printable cut layout from a cut list.', kind: 'guide' },
  { slug: '/plywood-factory-edge-trim', title: 'Plywood Factory Edge Trim Guide', description: 'Learn when to trim plywood factory edges and how trim margins affect usable sheet area and layout results.', kind: 'guide' },
  { slug: '/grain-direction-in-cut-lists', title: 'Grain Direction in Cut Lists', description: 'Understand rotation locks, grain direction, cabinet panels, and how grain affects sheet cutting layouts.', kind: 'guide' },
  { slug: '/edge-banding-in-cut-list', title: 'Edge Banding in a Cut List', description: 'Track top, right, bottom, and left edge banding marks in printable cabinet and melamine cut lists.', kind: 'guide' },
  { slug: '/reduce-plywood-waste', title: 'How to Reduce Plywood Waste', description: 'Use kerf, rotation, offcuts, stock sizes, and practical layout checks to reduce plywood waste.', kind: 'guide' },
  { slug: '/cut-list-optimization-methodology', title: 'Cut List Optimization Methodology', description: 'Review how StockCut handles kerf, rectangular sheet placement, linear stock packing, offcuts, limits, and shop verification before cutting material.', kind: 'guide', primaryQuery: 'cut list optimization methodology', contentRole: 'Methodology and trust page explaining algorithm boundaries, validation checks, and practical shop review.' },
  { slug: '/privacy', title: 'Privacy Policy', description: 'StockCut processes cut lists locally in your browser and does not upload or cloud-save project data.', kind: 'legal' },
  { slug: '/terms', title: 'Terms of Use', description: 'Terms for using StockCut as a free planning tool for estimated cutting layouts.', kind: 'legal' },
  { slug: '/disclaimer', title: 'Disclaimer', description: 'StockCut provides planning estimates only. Verify dimensions, tool settings, and safety before cutting.', kind: 'legal' },
  { slug: '/about', title: 'About StockCut', description: 'About the StockCut local-first cut list optimizer project.', kind: 'about' },
  { slug: '/contact', title: 'Contact and Feedback', description: 'How to send feedback about StockCut layouts, unit parsing, or page presets.', kind: 'about' },
  { slug: '/site-map', title: 'StockCut Site Map', description: 'Browse StockCut calculators, material presets, cutting guides, and policy pages from one human-readable directory.', kind: 'guide', primaryQuery: 'StockCut site map', contentRole: 'Human-readable navigation directory for public StockCut pages.' },
];

export const redirectAliases: RedirectAlias[] = [
  { source: '/tools/sheet-cutting-optimizer', destination: '/sheet-cutting-optimizer', permanent: true },
  { source: '/tools/linear-cutting-optimizer', destination: '/linear-cutting-optimizer', permanent: true },
  { source: '/tools/saw-kerf-calculator', destination: '/saw-kerf-calculator', permanent: true },
  { source: '/calculators/4x8-plywood-cut-list-optimizer', destination: '/4x8-plywood-cut-list-optimizer', permanent: true },
  { source: '/calculators/plywood-cutting-layout-calculator', destination: '/plywood-cutting-layout-calculator', permanent: true },
  { source: '/guides/saw-kerf-explained', destination: '/how-to-account-for-saw-kerf', permanent: true },
  { source: '/saw-kerf-explained', destination: '/how-to-account-for-saw-kerf', permanent: true },
  { source: '/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet', destination: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', permanent: true },
  { source: '/calculators/mdf-sheet-cut-calculator', destination: '/mdf-sheet-cut-calculator', permanent: true },
  { source: '/calculators/acrylic-sheet-cutting-layout-tool', destination: '/acrylic-sheet-cutting-layout-tool', permanent: true },
  { source: '/calculators/cabinet-cut-list-optimizer', destination: '/cabinet-cut-list-optimizer', permanent: true },
  { source: '/calculators/bookshelf-cut-list-calculator', destination: '/bookshelf-cut-list-calculator', permanent: true },
  { source: '/calculators/drawer-box-cut-list-calculator', destination: '/drawer-box-cut-list-calculator', permanent: true },
  { source: '/calculators/closet-shelf-plywood-calculator', destination: '/closet-shelf-plywood-calculator', permanent: true },
  { source: '/calculators/workbench-plywood-cut-layout', destination: '/workbench-plywood-cut-layout', permanent: true },
  { source: '/calculators/steel-tube-cutting-optimizer', destination: '/steel-tube-cutting-optimizer', permanent: true },
  { source: '/calculators/aluminum-extrusion-cut-list-optimizer', destination: '/aluminum-extrusion-cut-list-optimizer', permanent: true },
  { source: '/calculators/pvc-pipe-cutting-optimizer', destination: '/pvc-pipe-cutting-optimizer', permanent: true },
  { source: '/calculators/lumber-length-cutting-optimizer', destination: '/lumber-length-cutting-optimizer', permanent: true },
  { source: '/calculators/rebar-cutting-optimizer', destination: '/rebar-cutting-optimizer', permanent: true },
  { source: '/calculators/melamine-cut-list-optimizer', destination: '/melamine-cut-list-optimizer', permanent: true },
  { source: '/calculators/saw-kerf-compensation-calculator', destination: '/saw-kerf-compensation-calculator', permanent: true },
  { source: '/calculators/plywood-yield-rate-calculator', destination: '/plywood-yield-rate-calculator', permanent: true },
  { source: '/tools/plywood-yield-calculator', destination: '/plywood-yield-rate-calculator', permanent: true },
  { source: '/guides/how-to-account-for-saw-kerf', destination: '/how-to-account-for-saw-kerf', permanent: true },
  { source: '/guides/how-to-read-a-plywood-cutting-diagram', destination: '/how-to-read-a-plywood-cutting-diagram', permanent: true },
  { source: '/guides/cut-list-optimizer-vs-excel', destination: '/cut-list-optimizer-vs-excel', permanent: true },
  { source: '/guides/cut-list-optimizer-vs-sketchup', destination: '/cut-list-optimizer-vs-sketchup', permanent: true },
  { source: '/guides/guillotine-cut-vs-nesting', destination: '/guillotine-cut-vs-nesting', permanent: true },
  { source: '/guides/plywood-factory-edge-trim', destination: '/plywood-factory-edge-trim', permanent: true },
  { source: '/guides/grain-direction-in-cut-lists', destination: '/grain-direction-in-cut-lists', permanent: true },
  { source: '/guides/edge-banding-in-cut-list', destination: '/edge-banding-in-cut-list', permanent: true },
  { source: '/guides/reduce-plywood-waste', destination: '/reduce-plywood-waste', permanent: true },
  { source: '/guides/cut-list-optimization-methodology', destination: '/cut-list-optimization-methodology', permanent: true },
  { source: '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', destination: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', permanent: true },
  { source: '/legal/privacy', destination: '/privacy', permanent: true },
  { source: '/legal/terms', destination: '/terms', permanent: true },
  { source: '/legal/disclaimer', destination: '/disclaimer', permanent: true }
];

// Backward-compatible alias for older imports. Keep this canonical-only.
export const pages: SeoPage[] = canonicalPages;

export const canonicalSlugs = new Set(canonicalPages.map((page) => page.slug));

export function pageBySlug(slug: string): SeoPage {
  return canonicalPages.find((page) => page.slug === slug) ?? canonicalPages[0];
}
