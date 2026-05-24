import { AdSlot } from '@/components/common/AdSlot';
import { AffiliateSlot } from '@/components/common/AffiliateSlot';
import { ShopModeToggle } from '@/components/common/ShopModeToggle';
import { SheetOptimizerTool } from '@/components/tools/SheetOptimizerTool';
import { LinearOptimizerTool } from '@/components/tools/LinearOptimizerTool';
import { KerfCalculator } from '@/components/tools/KerfCalculator';
import { siteUrl, type SeoPage } from '@/data/pages';
import type { LinearPresetKey, SheetPresetKey } from '@/data/presets';

const sheetPresetKeys = new Set<SheetPresetKey>(['imperial-sheet', 'metric-sheet', 'plywood-4x8', 'mdf-metric', 'acrylic-metric', 'melamine-cabinet', 'cabinet', 'bookshelf', 'drawer-box', 'closet-shelf', 'workbench']);
const linearPresetKeys = new Set<LinearPresetKey>(['imperial-linear', 'metric-linear', 'linear-bar', 'steel-tube', 'aluminum-extrusion', 'pvc-pipe', 'lumber-length', 'rebar']);

function jsonLd(page: SeoPage) {
  const url = `${siteUrl}${page.slug === '/' ? '' : page.slug}`;
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'StockCut',
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: page.description
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Does StockCut upload my cut list?', acceptedAnswer: { '@type': 'Answer', text: 'No. StockCut calculates and autosaves in your browser and does not cloud-save cut lists.' } },
      { '@type': 'Question', name: 'Does StockCut guarantee a mathematically optimal layout?', acceptedAnswer: { '@type': 'Answer', text: 'No. It creates practical kerf-aware layouts for planning and printing; verify before cutting.' } },
      { '@type': 'Question', name: 'Can I print or save a PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the print button and choose Save as PDF in your browser.' } }
    ]
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: page.title, item: url }
    ]
  };
  return JSON.stringify([app, faq, breadcrumb]);
}

export function PageShell({ page }: { page: SeoPage }) {
  const sheetPreset = sheetPresetKeys.has(page.preset as SheetPresetKey) ? page.preset as SheetPresetKey : 'imperial-sheet';
  const linearPreset = linearPresetKeys.has(page.preset as LinearPresetKey) ? page.preset as LinearPresetKey : 'imperial-linear';
  return <main className="mx-auto max-w-7xl px-4 py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(page) }} />
    <ShopModeToggle />
    <section className="mb-8">
      <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Local-first · kerf-aware · printable</p>
      <h1 className="print-title max-w-5xl text-4xl font-black tracking-tight md:text-7xl">{page.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-stock-muted">{page.description}</p>
    </section>
    {page.kind === 'sheet' && <SheetOptimizerTool preset={sheetPreset} />}
    {page.kind === 'linear' && <LinearOptimizerTool preset={linearPreset} />}
    {page.kind === 'kerf' && <KerfCalculator />}
    {page.kind === 'guide' && <GuideContent page={page} />}
    {(page.kind === 'legal' || page.kind === 'about') && <LegalContent page={page} />}
    <AdSlot />
    <AffiliateSlot />
    <section className="guide-card grid gap-4 md:grid-cols-3">
      <div className="tool-card"><h2 className="font-black">What StockCut does</h2><p className="text-sm text-stock-muted">It creates practical rectangular sheet and straight-stock layouts with kerf, labels, waste, offcuts, cut sequence tables, and print-friendly output.</p></div>
      <div className="tool-card"><h2 className="font-black">What it does not do</h2><p className="text-sm text-stock-muted">No accounts, cloud save, CNC, DXF, G-code, angle cutting, circular parts, triangle parts, polygon nesting, enterprise inventory, or AI cabinet design.</p></div>
      <div className="tool-card"><h2 className="font-black">Privacy model</h2><p className="text-sm text-stock-muted">Cut lists are processed in the browser. Autosave uses localStorage. The tool does not upload or cloud-save your project data.</p></div>
    </section>
  </main>;
}

function GuideContent({ page }: { page: SeoPage }) {
  const guideBlocks: Record<string, { lead: string; bullets: string[] }> = {
    '/how-to-account-for-saw-kerf': { lead: 'Kerf is the material removed by the saw blade. Include blade width between adjacent finished parts or exact-fit layouts can fail.', bullets: ['A 1/8 in kerf between two pieces consumes 0.125 in of stock.', 'Two 24 in panels need more than 48 in when a center cut removes material.', 'StockCut treats 2D kerf as spacing between rectangular parts and 1D kerf as loss between consecutive cuts.'] },
    '/saw-kerf-explained': { lead: 'Saw kerf is blade thickness plus any side clearance. It changes the raw size required for a set of finished parts.', bullets: ['Finished dimensions remain the target part size; kerf is added between separated parts.', 'Use the same kerf rule across sheet and linear work.', 'When in doubt, cut test pieces and verify the blade setup before cutting expensive stock.'] },
    '/guides/saw-kerf-explained': { lead: 'Saw kerf is blade thickness plus any side clearance. It changes the raw size required for a set of finished parts.', bullets: ['Finished dimensions remain the target part size; kerf is added between separated parts.', 'Use the same kerf rule across sheet and linear work.', 'When in doubt, cut test pieces and verify the blade setup before cutting expensive stock.'] },
    '/guillotine-cut-vs-nesting': { lead: 'Guillotine-friendly layouts favor straight cuts across remaining rectangular areas. Industrial nesting may pack parts more tightly but is harder to execute without CNC workflows.', bullets: ['StockCut uses practical rectangular layouts, not industrial nesting guarantees.', 'This MVP intentionally avoids irregular shapes, DXF, G-code, and CNC post-processing.', 'The result is intended as a shop-readable plan that can be printed and checked.'] },
    '/guides/guillotine-cut-vs-nesting': { lead: 'Guillotine-friendly layouts favor straight cuts across remaining rectangular areas. Industrial nesting may pack parts more tightly but is harder to execute without CNC workflows.', bullets: ['StockCut uses practical rectangular layouts, not industrial nesting guarantees.', 'This MVP intentionally avoids irregular shapes, DXF, G-code, and CNC post-processing.', 'The result is intended as a shop-readable plan that can be printed and checked.'] },
    '/cut-list-optimizer-vs-excel': { lead: 'Excel is useful for quantities, but spreadsheets do not visualize part placement, kerf spacing, offcuts, or sheet-level waste without manual drawing.', bullets: ['Paste your spreadsheet rows into StockCut instead of retyping them.', 'CSV export gives you a structured result after optimization.', 'The layout diagram makes unplaced parts and waste visible.'] },
    '/guides/cut-list-optimizer-vs-excel': { lead: 'Excel is useful for quantities, but spreadsheets do not visualize part placement, kerf spacing, offcuts, or sheet-level waste without manual drawing.', bullets: ['Paste your spreadsheet rows into StockCut instead of retyping them.', 'CSV export gives you a structured result after optimization.', 'The layout diagram makes unplaced parts and waste visible.'] },
    '/cut-list-optimizer-vs-sketchup': { lead: 'SketchUp is strong for design visualization, while a cut list optimizer turns known dimensions into a kerf-aware sheet or stock layout.', bullets: ['Use SketchUp to design the project and StockCut to plan material cutting.', 'StockCut focuses on sheet count, offcuts, waste, and printable shop output.', 'It does not replace CAD or CNC workflows.'] },
    '/guides/cut-list-optimizer-vs-sketchup': { lead: 'SketchUp is strong for design visualization, while a cut list optimizer turns known dimensions into a kerf-aware sheet or stock layout.', bullets: ['Use SketchUp to design the project and StockCut to plan material cutting.', 'StockCut focuses on sheet count, offcuts, waste, and printable shop output.', 'It does not replace CAD or CNC workflows.'] },
    '/how-to-read-a-plywood-cutting-diagram': { lead: 'A plywood cutting diagram shows each sheet, placed part labels, rotated parts, empty offcut regions, and a top-left to bottom-right cut sequence checklist.', bullets: ['Labels identify part names and instance numbers.', 'The R marker means the part was rotated during placement.', 'Shaded regions are remaining offcuts; verify that any offcut is large enough before planning reuse.'] },
    '/guides/how-to-read-a-plywood-cutting-diagram': { lead: 'A plywood cutting diagram shows each sheet, placed part labels, rotated parts, empty offcut regions, and a top-left to bottom-right cut sequence checklist.', bullets: ['Labels identify part names and instance numbers.', 'The R marker means the part was rotated during placement.', 'Shaded regions are remaining offcuts; verify that any offcut is large enough before planning reuse.'] },
    '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet': { lead: 'Two exact 24 inch panels sound like they should fit on a 48 inch sheet, but the cut between them removes material. With a 1/8 inch blade, the total need is 48 1/8 inches.', bullets: ['Finished part widths plus kerf must be less than or equal to stock width.', 'Exact-fit arithmetic without kerf is a common source of first-cut mistakes.', 'Use the saw kerf calculator or set kerf in the sheet optimizer before buying material.'] },
    '/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet': { lead: 'Two exact 24 inch panels sound like they should fit on a 48 inch sheet, but the cut between them removes material. With a 1/8 inch blade, the total need is 48 1/8 inches.', bullets: ['Finished part widths plus kerf must be less than or equal to stock width.', 'Exact-fit arithmetic without kerf is a common source of first-cut mistakes.', 'Use the saw kerf calculator or set kerf in the sheet optimizer before buying material.'] },
    '/plywood-factory-edge-trim': { lead: 'Factory edges may be damaged, out of square, or unsuitable as a finished reference edge. Trim margins reduce usable sheet area before layout.', bullets: ['Set trim when you need to clean or square edges before cutting parts.', 'Large trim values can make otherwise valid parts unplaceable.', 'Print the layout and mark trimmed boundaries clearly before cutting.'] },
    '/grain-direction-in-cut-lists': { lead: 'Grain direction matters when a panel face must run vertically or horizontally. Rotation locks prevent the optimizer from turning those parts.', bullets: ['Use grain lock for cabinet sides, doors, and visible face panels.', 'Rotation can improve yield, but it may make grain direction wrong.', 'StockCut keeps grain-locked parts in their entered orientation.'] },
    '/edge-banding-in-cut-list': { lead: 'Edge banding marks identify which sides of a part need banding after cutting. This is useful for melamine, cabinet, and shelf projects.', bullets: ['Track top, right, bottom, and left edges separately.', 'Banding marks are shown on the layout for visual review.', 'Export CSV to preserve edge banding instructions for a shop checklist.'] },
    '/reduce-plywood-waste': { lead: 'Reducing plywood waste depends on kerf, orientation, stock size, reusable offcuts, and whether you prioritize few sheets or low waste.', bullets: ['Try least waste for smaller offcuts and least stock for fewer full sheets.', 'Allow rotation only when grain direction and part appearance allow it.', 'Use reusable offcuts before buying another full sheet.'] },

    '/guides/how-to-account-for-saw-kerf': { lead: 'Kerf is the material removed by the saw blade. Include blade width between adjacent finished parts or exact-fit layouts can fail.', bullets: ['A 1/8 in kerf between two pieces consumes 0.125 in of stock.', 'Two 24 in panels need more than 48 in when a center cut removes material.', 'StockCut treats 2D kerf as spacing between rectangular parts and 1D kerf as loss between consecutive cuts.'] },
    '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet': { lead: 'Two exact 24 inch panels sound like they should fit on a 48 inch sheet, but the cut between them removes material. With a 1/8 inch blade, the total need is 48 1/8 inches.', bullets: ['Finished part widths plus kerf must be less than or equal to stock width.', 'Exact-fit arithmetic without kerf is a common source of first-cut mistakes.', 'Use the saw kerf calculator or set kerf in the sheet optimizer before buying material.'] },
    '/guides/plywood-factory-edge-trim': { lead: 'Factory edges may be damaged, out of square, or unsuitable as a finished reference edge. Trim margins reduce usable sheet area before layout.', bullets: ['Set trim when you need to clean or square edges before cutting parts.', 'Large trim values can make otherwise valid parts unplaceable.', 'Print the layout and mark trimmed boundaries clearly before cutting.'] },
    '/guides/grain-direction-in-cut-lists': { lead: 'Grain direction matters when a panel face must run vertically or horizontally. Rotation locks prevent the optimizer from turning those parts.', bullets: ['Use grain lock for cabinet sides, doors, and visible face panels.', 'Rotation can improve yield, but it may make grain direction wrong.', 'StockCut keeps grain-locked parts in their entered orientation.'] },
    '/guides/edge-banding-in-cut-list': { lead: 'Edge banding marks identify which sides of a part need banding after cutting. This is useful for melamine, cabinet, and shelf projects.', bullets: ['Track top, right, bottom, and left edges separately.', 'Banding marks are shown on the layout for visual review.', 'Export CSV to preserve edge banding instructions for a shop checklist.'] },
    '/guides/reduce-plywood-waste': { lead: 'Reducing plywood waste depends on kerf, orientation, stock size, reusable offcuts, and whether you prioritize few sheets or low waste.', bullets: ['Try least waste for smaller offcuts and least stock for fewer full sheets.', 'Allow rotation only when grain direction and part appearance allow it.', 'Use reusable offcuts before buying another full sheet.'] },
  };
  const block = guideBlocks[page.slug] ?? guideBlocks['/how-to-account-for-saw-kerf'];
  return <section className="tool-card"><h2 className="text-2xl font-black">{page.title}</h2><p className="mt-3 text-stock-muted">{block.lead}</p><ul className="mt-4 list-disc space-y-2 pl-5 text-stock-muted">{block.bullets.map((item) => <li key={item}>{item}</li>)}</ul><div className="mt-5 rounded-2xl border border-stock-line bg-white p-4"><h3 className="font-bold">Small interactive example</h3><p className="mt-1 text-sm text-stock-muted">Use the kerf calculator below to test the guide's exact-fit example before switching to a full layout optimizer.</p><div className="mt-4"><KerfCalculator /></div></div><p className="mt-4 text-sm text-stock-muted">Use the live StockCut tools to test the same assumptions with your own dimensions, unit system, stock size, strategy, and kerf.</p></section>;
}

function LegalContent({ page }: { page: SeoPage }) {
  const privacy = page.slug.includes('privacy');
  return <section className="tool-card"><h2 className="text-2xl font-black">{page.title}</h2><p className="mt-3 text-stock-muted">StockCut is a free planning tool. All calculations are estimates and should be verified before cutting material. {privacy ? 'Cut lists, dimensions, and project drafts are processed locally in your browser and are not uploaded or cloud-saved by this app. Analytics, advertising cookies, or affiliate links may be used only for standard site operation and monetization.' : 'You are responsible for safe tool operation, measurement verification, material decisions, and compliance with your shop process.'}</p></section>;
}
