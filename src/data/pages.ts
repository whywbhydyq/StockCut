import type { LinearPresetKey, SheetPresetKey } from '@/data/presets';

export type PageKind = 'sheet' | 'linear' | 'kerf' | 'guide' | 'legal' | 'about';

export interface SeoPage {
  slug: string;
  title: string;
  description: string;
  kind: PageKind;
  preset?: SheetPresetKey | LinearPresetKey;
}

export const siteUrl = 'https://stockcut.ymirtool.com';

export const pages: SeoPage[] = [
  { slug: '/', title: 'Free Cut List Optimizer with Kerf', description: 'Optimize sheet and linear stock cuts with kerf, labels, waste, offcuts, and printable layouts. Works locally for plywood, MDF, lumber, tube, and pipe.', kind: 'sheet', preset: 'imperial-sheet' },
  { slug: '/sheet-cutting-optimizer', title: 'Sheet Cutting Optimizer with Kerf', description: 'Optimize plywood, MDF, acrylic, melamine, and sheet stock cut layouts with kerf, labels, waste, offcuts, and printable diagrams.', kind: 'sheet', preset: 'imperial-sheet' },
  { slug: '/linear-cutting-optimizer', title: 'Linear Cutting Optimizer with Kerf', description: 'Optimize lumber, steel tube, aluminum extrusion, PVC pipe, and bar stock lengths with kerf, cut sequence, waste, and offcuts.', kind: 'linear', preset: 'imperial-linear' },
  { slug: '/saw-kerf-calculator', title: 'Saw Kerf Calculator for Cut Lists', description: 'Calculate blade kerf loss, finished part fit, raw stock length, and why exact-fit cuts fail when saw width is included.', kind: 'kerf' },
  { slug: '/plywood-cutting-layout-calculator', title: 'Plywood Cutting Layout Calculator', description: 'Generate practical plywood cutting layouts with labels, kerf spacing, waste, and printable sheet diagrams.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/4x8-plywood-cut-list-optimizer', title: '4x8 Plywood Cut List Optimizer with Kerf', description: 'Optimize 48 x 96 inch plywood cut lists with fractional inch dimensions, 1/8 inch kerf, labels, waste, and printable layouts.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/mdf-sheet-cut-calculator', title: 'MDF Sheet Cut Calculator', description: 'Plan MDF panel cuts using 2440 × 1220 mm stock, metric units, kerf, and printable layouts.', kind: 'sheet', preset: 'mdf-metric' },
  { slug: '/acrylic-sheet-cutting-layout-tool', title: 'Acrylic Sheet Cutting Layout Tool', description: 'Arrange rectangular acrylic panels with kerf-aware spacing, labels, offcuts, and printable results.', kind: 'sheet', preset: 'acrylic-metric' },
  { slug: '/melamine-cut-list-optimizer', title: 'Melamine Cut List Optimizer', description: 'Plan melamine cabinet panels with rotation control, metric stock, kerf spacing, and printable layouts.', kind: 'sheet', preset: 'melamine-cabinet' },
  { slug: '/cabinet-cut-list-optimizer', title: 'Cabinet Cut List Optimizer', description: 'Create a practical cabinet cut list layout for rectangular panels with quantity, labels, rotation control, and kerf.', kind: 'sheet', preset: 'cabinet' },
  { slug: '/bookshelf-cut-list-calculator', title: 'Bookshelf Cut List Calculator', description: 'Calculate bookshelf shelves, sides, tops, and backs from sheet stock with printable cut diagrams.', kind: 'sheet', preset: 'bookshelf' },
  { slug: '/drawer-box-cut-list-calculator', title: 'Drawer Box Cut List Calculator', description: 'Lay out repeated drawer side, front, back, and bottom panels from plywood or Baltic birch sheet stock.', kind: 'sheet', preset: 'drawer-box' },
  { slug: '/closet-shelf-plywood-calculator', title: 'Closet Shelf Plywood Calculator', description: 'Estimate closet shelves and dividers from plywood sheet stock with labels, waste, and printable diagrams.', kind: 'sheet', preset: 'closet-shelf' },
  { slug: '/workbench-plywood-cut-layout', title: 'Workbench Plywood Cut Layout', description: 'Generate a practical workbench plywood cut layout with top layers, shelves, gussets, kerf, and offcuts.', kind: 'sheet', preset: 'workbench' },
  { slug: '/linear-bar-cutting-list-optimizer', title: 'Linear Bar Cutting List Optimizer', description: 'Optimize straight bar stock cuts with kerf, sequence, used length, and offcut output.', kind: 'linear', preset: 'linear-bar' },
  { slug: '/steel-tube-cutting-optimizer', title: 'Steel Tube Cutting Optimizer with Kerf', description: 'Optimize steel tube cut lists from standard stock lengths with kerf, cut sequences, offcuts, and printable shop output.', kind: 'linear', preset: 'steel-tube' },
  { slug: '/aluminum-extrusion-cut-list-optimizer', title: 'Aluminum Extrusion Cut List Optimizer', description: 'Plan aluminum extrusion cuts using metric stock length, saw kerf, and best-fit decreasing optimization.', kind: 'linear', preset: 'aluminum-extrusion' },
  { slug: '/pvc-pipe-cutting-optimizer', title: 'PVC Pipe Cutting Optimizer', description: 'Optimize PVC pipe cut lists with stock length, kerf, sequence, and remaining offcuts.', kind: 'linear', preset: 'pvc-pipe' },
  { slug: '/lumber-length-cutting-optimizer', title: 'Lumber Length Cutting Optimizer', description: 'Plan lumber length cuts from common boards with kerf, repeated parts, and printable stock sequences.', kind: 'linear', preset: 'lumber-length' },
  { slug: '/how-to-account-for-saw-kerf', title: 'How to Account for Saw Kerf', description: 'Learn how blade thickness affects finished part sizes and why kerf must be included in cut lists.', kind: 'guide' },
  { slug: '/guillotine-cut-vs-nesting', title: 'Guillotine Cut vs Nesting', description: 'Understand the difference between straight-line sheet cutting layouts and industrial nesting software.', kind: 'guide' },
  { slug: '/cut-list-optimizer-vs-excel', title: 'Cut List Optimizer vs Excel', description: 'Compare spreadsheet cut lists with a kerf-aware visual optimizer that can produce printable layouts.', kind: 'guide' },
  { slug: '/how-to-read-a-plywood-cutting-diagram', title: 'How to Read a Plywood Cutting Diagram', description: 'Read labels, part orientation, kerf spacing, and offcut regions in a printable plywood cutting diagram.', kind: 'guide' },
  { slug: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', title: 'Why Two 24 Inch Panels Do Not Fit on a 48 Inch Sheet', description: 'A kerf-focused explanation of why two exact 24 inch panels exceed a 48 inch sheet once the saw cut is included.', kind: 'guide' },

  { slug: '/saw-kerf-compensation-calculator', title: 'Saw Kerf Compensation Calculator', description: 'Calculate how much extra raw stock is required after blade kerf is included in a finished cut list.', kind: 'kerf' },
  { slug: '/rebar-cutting-optimizer', title: 'Rebar Cutting Optimizer', description: 'Optimize rebar cuts from standard lengths with kerf, material grouping, offcuts, and printable cutting sequences.', kind: 'linear', preset: 'rebar' },
  { slug: '/plywood-yield-rate-calculator', title: 'Plywood Yield Rate Calculator', description: 'Calculate plywood sheet usage, finished part area, yield rate, waste rate, offcuts, and printable layouts.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/saw-kerf-explained', title: 'Saw Kerf Explained', description: 'A practical guide to blade thickness, cut loss, finished part sizes, and kerf-aware cut lists.', kind: 'guide' },
  { slug: '/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet', title: 'Why Two 24 Inch Panels Do Not Fit on a 48 Inch Sheet', description: 'A kerf-focused explanation of exact-fit plywood cuts and why 24 + 24 can exceed 48 inches.', kind: 'guide' },
  { slug: '/cut-list-optimizer-vs-sketchup', title: 'Cut List Optimizer vs SketchUp', description: 'Compare drawing a project in SketchUp with generating a kerf-aware printable cut layout from a cut list.', kind: 'guide' },
  { slug: '/plywood-factory-edge-trim', title: 'Plywood Factory Edge Trim Guide', description: 'Learn when to trim plywood factory edges and how trim margins affect usable sheet area and layout results.', kind: 'guide' },
  { slug: '/grain-direction-in-cut-lists', title: 'Grain Direction in Cut Lists', description: 'Understand rotation locks, grain direction, cabinet panels, and how grain affects sheet cutting layouts.', kind: 'guide' },
  { slug: '/edge-banding-in-cut-list', title: 'Edge Banding in a Cut List', description: 'Track top, right, bottom, and left edge banding marks in printable cabinet and melamine cut lists.', kind: 'guide' },
  { slug: '/reduce-plywood-waste', title: 'How to Reduce Plywood Waste', description: 'Use kerf, rotation, offcuts, stock sizes, and practical layout checks to reduce plywood waste.', kind: 'guide' },
  { slug: '/tools/sheet-cutting-optimizer', title: 'Sheet Cutting Optimizer Tool', description: 'Tool-path alias for the kerf-aware 2D sheet cutting optimizer with printable layouts.', kind: 'sheet', preset: 'imperial-sheet' },
  { slug: '/tools/linear-cutting-optimizer', title: 'Linear Cutting Optimizer Tool', description: 'Tool-path alias for straight-stock cutting optimization with kerf and offcut output.', kind: 'linear', preset: 'imperial-linear' },
  { slug: '/tools/saw-kerf-calculator', title: 'Saw Kerf Calculator Tool', description: 'Tool-path alias for the saw kerf loss and compensation calculator.', kind: 'kerf' },
  { slug: '/tools/plywood-yield-calculator', title: 'Plywood Yield Calculator', description: 'Calculate plywood yield, waste, sheet count, and printable layout output from your cut list.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/calculators/4x8-plywood-cut-list-optimizer', title: '4×8 Plywood Cut List Optimizer', description: 'Calculator-path page for optimizing 48 × 96 inch plywood cut lists with kerf.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/calculators/mdf-sheet-cut-calculator', title: 'MDF Sheet Cut Calculator', description: 'Calculator-path page for metric MDF sheet cutting layouts.', kind: 'sheet', preset: 'mdf-metric' },
  { slug: '/calculators/acrylic-sheet-cutting-layout-tool', title: 'Acrylic Sheet Cutting Layout Tool', description: 'Calculator-path page for acrylic sheet cutting layouts with kerf.', kind: 'sheet', preset: 'acrylic-metric' },
  { slug: '/calculators/cabinet-cut-list-optimizer', title: 'Cabinet Cut List Optimizer', description: 'Calculator-path page for cabinet panel cut lists with labels, grain, and edge banding.', kind: 'sheet', preset: 'cabinet' },
  { slug: '/calculators/bookshelf-cut-list-calculator', title: 'Bookshelf Cut List Calculator', description: 'Calculator-path page for bookshelf plywood cut lists.', kind: 'sheet', preset: 'bookshelf' },
  { slug: '/calculators/steel-tube-cutting-optimizer', title: 'Steel Tube Cutting Optimizer', description: 'Calculator-path page for steel tube cutting optimization.', kind: 'linear', preset: 'steel-tube' },
  { slug: '/calculators/aluminum-extrusion-cut-list-optimizer', title: 'Aluminum Extrusion Cut List Optimizer', description: 'Calculator-path page for aluminum extrusion cut list optimization.', kind: 'linear', preset: 'aluminum-extrusion' },
  { slug: '/guides/saw-kerf-explained', title: 'Saw Kerf Explained', description: 'Guide-path explanation of saw kerf and blade cut loss.', kind: 'guide' },
  { slug: '/guides/guillotine-cut-vs-nesting', title: 'Guillotine Cut vs Nesting', description: 'Guide-path explanation of guillotine cutting and nesting.', kind: 'guide' },
  { slug: '/guides/how-to-read-a-plywood-cutting-diagram', title: 'How to Read a Plywood Cutting Diagram', description: 'Guide-path explanation of sheet diagrams, labels, kerf spacing, and offcuts.', kind: 'guide' },
  { slug: '/guides/cut-list-optimizer-vs-excel', title: 'Cut List Optimizer vs Excel', description: 'Guide-path comparison of visual cut optimization and spreadsheets.', kind: 'guide' },
  { slug: '/guides/cut-list-optimizer-vs-sketchup', title: 'Cut List Optimizer vs SketchUp', description: 'Guide-path comparison of SketchUp drawings and cut list optimization.', kind: 'guide' },
  { slug: '/legal/privacy', title: 'Privacy Policy', description: 'Legal-path privacy page explaining local browser processing and advertising cookies.', kind: 'legal' },
  { slug: '/legal/terms', title: 'Terms of Use', description: 'Legal-path terms for using StockCut as an estimation tool.', kind: 'legal' },
  { slug: '/legal/disclaimer', title: 'Disclaimer', description: 'Legal-path disclaimer for planning estimates and shop safety.', kind: 'legal' },
  { slug: '/privacy', title: 'Privacy Policy', description: 'StockCut processes cut lists locally in your browser and does not upload or cloud-save project data.', kind: 'legal' },
  { slug: '/terms', title: 'Terms of Use', description: 'Terms for using StockCut as a free planning tool for estimated cutting layouts.', kind: 'legal' },
  { slug: '/disclaimer', title: 'Disclaimer', description: 'StockCut provides planning estimates only. Verify dimensions, tool settings, and safety before cutting.', kind: 'legal' },
  { slug: '/about', title: 'About StockCut', description: 'About the StockCut local-first cut list optimizer project.', kind: 'about' },
  { slug: '/contact', title: 'Contact and Feedback', description: 'How to send feedback about StockCut layouts, unit parsing, or page presets.', kind: 'about' },
  { slug: '/calculators/plywood-cutting-layout-calculator', title: 'Plywood Cutting Layout Calculator', description: 'Calculator-path page for plywood cutting layouts with labels, kerf, waste, offcuts, and printable diagrams.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/calculators/saw-kerf-compensation-calculator', title: 'Saw Kerf Compensation Calculator', description: 'Calculator-path page for saw kerf compensation, total kerf loss, and raw stock required.', kind: 'kerf' },
  { slug: '/calculators/melamine-cut-list-optimizer', title: 'Melamine Cut List Optimizer', description: 'Calculator-path page for melamine panels with grain, edge banding, kerf, and printable cut lists.', kind: 'sheet', preset: 'melamine-cabinet' },
  { slug: '/calculators/drawer-box-cut-list-calculator', title: 'Drawer Box Cut List Calculator', description: 'Calculator-path page for drawer box side, front, back, and bottom panel layouts.', kind: 'sheet', preset: 'drawer-box' },
  { slug: '/calculators/closet-shelf-plywood-calculator', title: 'Closet Shelf Plywood Calculator', description: 'Calculator-path page for closet shelves and dividers using plywood stock.', kind: 'sheet', preset: 'closet-shelf' },
  { slug: '/calculators/workbench-plywood-cut-layout', title: 'Workbench Plywood Cut Layout', description: 'Calculator-path page for workbench plywood panels, top layers, and shop shelves.', kind: 'sheet', preset: 'workbench' },
  { slug: '/calculators/pvc-pipe-cutting-optimizer', title: 'PVC Pipe Cutting Optimizer', description: 'Calculator-path page for PVC pipe cutting sequences with kerf and offcuts.', kind: 'linear', preset: 'pvc-pipe' },
  { slug: '/calculators/lumber-length-cutting-optimizer', title: 'Lumber Length Cutting Optimizer', description: 'Calculator-path page for lumber length cutting, stock cost, reusable offcuts, and waste.', kind: 'linear', preset: 'lumber-length' },
  { slug: '/calculators/rebar-cutting-optimizer', title: 'Rebar Cutting Optimizer', description: 'Calculator-path page for rebar cutting optimization from standard stock lengths.', kind: 'linear', preset: 'rebar' },
  { slug: '/calculators/plywood-yield-rate-calculator', title: 'Plywood Yield Rate Calculator', description: 'Calculator-path page for plywood yield, sheet count, waste, and offcuts.', kind: 'sheet', preset: 'plywood-4x8' },
  { slug: '/guides/how-to-account-for-saw-kerf', title: 'How to Account for Saw Kerf', description: 'Guide-path page explaining blade kerf, finished sizes, and why exact-fit cut lists fail.', kind: 'guide' },
  { slug: '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', title: 'Why Two 24 Inch Panels Do Not Fit on a 48 Inch Sheet', description: 'Guide-path page explaining why 24 + kerf + 24 can exceed a 48 inch sheet.', kind: 'guide' },
  { slug: '/guides/plywood-factory-edge-trim', title: 'Plywood Factory Edge Trim Guide', description: 'Guide-path page explaining factory edge trim and how trim margins reduce usable sheet area.', kind: 'guide' },
  { slug: '/guides/grain-direction-in-cut-lists', title: 'Grain Direction in Cut Lists', description: 'Guide-path page explaining grain locks, rotation, and visible panel orientation.', kind: 'guide' },
  { slug: '/guides/edge-banding-in-cut-list', title: 'Edge Banding in a Cut List', description: 'Guide-path page explaining edge banding marks on cabinet and melamine cut lists.', kind: 'guide' },
  { slug: '/guides/reduce-plywood-waste', title: 'How to Reduce Plywood Waste', description: 'Guide-path page explaining stock choice, offcut reuse, rotation, strategy, and kerf.', kind: 'guide' },
];

export function pageBySlug(slug: string): SeoPage {
  return pages.find((page) => page.slug === slug) ?? pages[0];
}
