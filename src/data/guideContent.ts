export type GuideSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
};

export type StockCutGuideContent = {
  lead: string;
  sections: GuideSection[];
  faq: { question: string; answer: string }[];
  related: { href: string; label: string }[];
};

const kerfTable = {
  caption: 'Common kerf planning values',
  headers: ['Cut type', 'Typical planning kerf', 'What to verify'],
  rows: [
    ['Table saw / circular saw plywood cuts', '1/8 in is a common starting point', 'Measure your blade plate and test cut.'],
    ['Track saw sheet breakdown', 'Use the actual blade kerf', 'Confirm whether splinter guard alignment changes the waste side.'],
    ['Miter saw lumber cuts', 'Blade kerf between consecutive pieces', 'Include one kerf for each cut between finished parts.'],
    ['Tube / pipe saw cuts', 'Saw blade or abrasive wheel width', 'Verify burr cleanup and end trimming separately.']
  ]
};

export const guideContentBySlug: Record<string, StockCutGuideContent> = {
  '/how-to-account-for-saw-kerf': {
    lead: 'Kerf is the material removed by the blade or cutting wheel. A cut list that ignores kerf can look correct on paper and still fail at the saw because finished parts plus cut loss exceed the stock size.',
    sections: [
      {
        heading: 'The rule to use before optimizing',
        body: ['Add kerf between separate finished parts, not inside the finished part dimension. If two parts are placed side by side, the optimizer must reserve one blade-width gap between them. In linear stock, every cut between pieces consumes one kerf length.'],
        bullets: ['Enter finished part dimensions as the size you need after cutting.', 'Enter kerf as the real blade or wheel width.', 'For exact-fit designs, leave a small practical margin for squareness, cleanup, and measurement error.']
      },
      {
        heading: 'Worked example: two 24 inch panels on a 48 inch sheet',
        body: ['Two 24 in finished panels total exactly 48 in before cutting. With a 1/8 in blade cut between them, the raw width needed is 24 + 0.125 + 24 = 48.125 in, so the pair does not fit across a 48 in sheet.'],
        table: { caption: 'Exact-fit kerf example', headers: ['Item', 'Width'], rows: [['Panel A', '24 in'], ['Kerf between panels', '0.125 in'], ['Panel B', '24 in'], ['Raw width required', '48.125 in']] }
      },
      { heading: 'When to override the calculator', body: ['Use the calculator as a planning aid, then verify the first cut on real stock. If a factory edge must be trimmed, if a cut will be cleaned up on a jointer, or if the saw leaves a rough edge, add that extra allowance separately.'] }
    ],
    faq: [
      { question: 'Should kerf be added to every part size?', answer: 'No. Keep finished part dimensions unchanged and add kerf between separate cuts.' },
      { question: 'Why does a 24 + 24 layout fail on a 48 inch sheet?', answer: 'The middle cut removes material, so the total raw width is finished part A + kerf + finished part B.' },
      { question: 'Can I use 1/8 inch as a default?', answer: 'It is a common planning value, but the correct kerf is the measured width of your blade or cutting wheel.' }
    ],
    related: [
      { href: '/saw-kerf-calculator', label: 'Open the saw kerf calculator' },
      { href: '/4x8-plywood-cut-list-optimizer', label: 'Try a 4x8 plywood cut layout' },
      { href: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', label: 'Read the exact-fit plywood example' }
    ]
  },
  '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet': {
    lead: 'The common 24 + 24 = 48 mistake happens because the arithmetic ignores the blade-width cut between finished pieces. This guide explains the failure before material is bought or cut.',
    sections: [
      { heading: 'The failing layout', body: ['A 48 in sheet can contain one 24 in panel, but the second panel needs a separating saw cut. That cut consumes material. The two finished panels plus one kerf require more than the sheet width.'], table: { caption: 'Why the layout exceeds 48 in', headers: ['Component', 'Width'], rows: [['First finished panel', '24 in'], ['Saw kerf', '1/8 in'], ['Second finished panel', '24 in'], ['Total required', '48 1/8 in']] } },
      { heading: 'Practical fixes', body: ['Use one of these fixes before cutting: reduce the finished panel width, rotate the parts if the sheet height has room, use a wider sheet, cut one piece from another sheet, or redesign the layout so the exact-fit pair is not adjacent.'], bullets: ['Try 23 15/16 in panels if the project allows a small size change.', 'Use trim margins only when you intentionally clean up a factory edge.', 'Do not assume a printed diagram is cut-ready until kerf is set correctly.'] },
      { heading: 'How StockCut handles it', body: ['StockCut treats kerf as spacing between rectangular parts. If the pair cannot fit, the result should place one part elsewhere, use another sheet, or mark a part unplaced depending on your stock and strategy.'] }
    ],
    faq: [
      { question: 'Can two 24 inch panels fit on a 48 inch sheet if I cut perfectly?', answer: 'No, not side by side with a saw cut between them. The cut removes material.' },
      { question: 'Does this apply to metric sheets too?', answer: 'Yes. Any exact-fit layout can fail when the blade width is added.' },
      { question: 'What is the safest correction?', answer: 'Set the real kerf and run the layout before cutting. If the design allows it, reduce one dimension slightly.' }
    ],
    related: [
      { href: '/how-to-account-for-saw-kerf', label: 'How to account for saw kerf' },
      { href: '/sheet-cutting-optimizer', label: 'Use the sheet cutting optimizer' },
      { href: '/saw-kerf-calculator', label: 'Calculate kerf allowance' }
    ]
  },
  '/saw-kerf-explained': {
    lead: 'Saw kerf is blade thickness plus any practical cut loss caused by tooth set, wobble, abrasive wheels, cleanup, or rough edges. It is small, but it compounds across repeated cuts.',
    sections: [
      { heading: 'What kerf changes', body: ['Kerf changes material usage, not the finished part size. A 20 in shelf remains a 20 in shelf; the stock must also provide enough material for the cuts around it.'], table: kerfTable },
      { heading: 'How to measure it', body: ['Make a test cut in scrap stock, measure the removed slot or compare stock before and after the cut, then enter that value in the optimizer. For higher-value material, make a fresh test cut using the same blade, feed rate, and setup you plan to use.'] },
      { heading: 'Why it matters more in repeated cuts', body: ['A single 1/8 in cut is easy to ignore. Twenty cuts consume 2.5 in of material. In a long cut list, that can be the difference between one extra board and a complete layout.'] }
    ],
    faq: [
      { question: 'Is kerf the same as blade thickness?', answer: 'Not always. Tooth set and cut behavior can make the actual slot wider than the blade plate.' },
      { question: 'Does CNC routing have kerf?', answer: 'It has tool diameter and toolpath offset rather than saw kerf. StockCut is not a CNC CAM tool.' },
      { question: 'Should I add extra waste for cleanup?', answer: 'Yes, if you plan to joint, sand, or square the cut after rough cutting.' }
    ],
    related: [
      { href: '/how-to-account-for-saw-kerf', label: 'Kerf accounting guide' },
      { href: '/linear-cutting-optimizer', label: 'Linear cut optimizer' },
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator' }
    ]
  },
  '/how-to-read-a-plywood-cutting-diagram': {
    lead: 'A plywood cutting diagram is a shop map. It shows each sheet, placed part labels, rotation, trim area, and remaining offcuts so you can verify the plan before cutting.',
    sections: [
      { heading: 'What each mark means', body: ['Read the diagram before you print or cut. Confirm sheet orientation, part labels, grain-locked parts, and any unplaced pieces. A rotated part may be valid mathematically but wrong for visible grain.'], table: { caption: 'Diagram elements', headers: ['Element', 'Meaning'], rows: [['Part rectangle', 'A finished piece to cut.'], ['Label', 'Part name and repeated instance.'], ['R marker or rotated shape', 'The part was rotated during placement.'], ['Offcut area', 'Remaining material that may be reusable.'], ['Trim / safe boundary', 'Usable area after margins or factory-edge cleanup.']] } },
      { heading: 'Shop review checklist', body: ['Before cutting, compare the diagram with the physical material. Check sheet dimensions, defect areas, factory edges, grain direction, and whether offcuts are large enough to be useful.'], bullets: ['Mark sheet orientation with painter tape or pencil.', 'Cut oversized rough parts first only if your shop process calls for cleanup.', 'Print the cut list and write actual offcut dimensions after cutting.'] }
    ],
    faq: [
      { question: 'Can I cut in the exact order shown?', answer: 'Use the diagram as a planning sequence, then adapt for your saw setup, support, and safe handling.' },
      { question: 'What does an unplaced part mean?', answer: 'It means the optimizer could not fit all requested parts in the available stock under current constraints.' },
      { question: 'Are offcuts guaranteed reusable?', answer: 'No. Verify actual size, squareness, defects, and grain before saving an offcut.' }
    ],
    related: [
      { href: '/4x8-plywood-cut-list-optimizer', label: 'Generate a 4x8 plywood diagram' },
      { href: '/grain-direction-in-cut-lists', label: 'Understand grain direction' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste' }
    ]
  },
  '/reduce-plywood-waste': {
    lead: 'Waste reduction is not only packing parts tighter. Practical sheet cutting also depends on grain direction, kerf, trim margins, offcut reuse, and whether the cutting sequence is safe to execute.',
    sections: [
      { heading: 'Levers that actually reduce waste', body: ['Start by checking inputs rather than chasing a perfect-looking layout. A wrong kerf value or unnecessary rotation lock can waste more material than a small packing inefficiency.'], bullets: ['Allow rotation only when grain and appearance permit it.', 'Use reusable offcuts before buying another full sheet.', 'Group similar materials and thicknesses separately.', 'Compare least-stock and least-waste strategies when available.'] },
      { heading: 'Waste trade-offs', body: ['A layout with the lowest waste percentage may create awkward offcuts. A layout with one more sheet may create larger reusable offcuts and be easier to cut safely.'], table: { caption: 'Waste decisions', headers: ['Choice', 'Benefit', 'Risk'], rows: [['Allow rotation', 'May fit more parts', 'Can break grain direction.'], ['Use smaller offcuts', 'Reduces full-sheet use', 'May increase handling complexity.'], ['Trim factory edges', 'Cleaner reference edges', 'Reduces usable sheet area.'], ['Minimize sheet count', 'Uses fewer sheets', 'May create difficult cuts or small scrap.']] } }
    ],
    faq: [
      { question: 'Is the lowest waste layout always best?', answer: 'No. Ease of cutting, grain direction, defect avoidance, and reusable offcuts can matter more.' },
      { question: 'Should I save every offcut?', answer: 'Only save offcuts that are large, square, labeled, and likely to be reused.' },
      { question: 'Does kerf affect waste percentage?', answer: 'Yes. More cuts and wider kerf consume more stock.' }
    ],
    related: [
      { href: '/plywood-yield-rate-calculator', label: 'Plywood yield rate calculator' },
      { href: '/plywood-factory-edge-trim', label: 'Factory edge trim guide' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer' }
    ]
  },
  '/grain-direction-in-cut-lists': {
    lead: 'Grain direction controls whether a part can rotate in the optimizer. Cabinet sides, doors, visible shelves, and matching panels often need a fixed orientation even when rotation would save material.',
    sections: [
      { heading: 'When to lock rotation', body: ['Lock rotation when the visible face needs a consistent grain direction, when edge banding orientation matters, or when a manufactured panel has a directional texture.'], table: { caption: 'Rotation decision examples', headers: ['Part', 'Typical rotation setting', 'Reason'], rows: [['Cabinet side', 'Locked', 'Vertical grain and matching sides.'], ['Hidden stretcher', 'Can rotate', 'Appearance usually less important.'], ['Door or drawer front', 'Locked', 'Visible grain alignment.'], ['Shop jig part', 'Can rotate', 'Utility part, not visible.']] } },
      { heading: 'How to use it in StockCut', body: ['Enter the part in the orientation you want, then lock rotation if that direction must be preserved. Review every rotated part in the diagram before cutting.'] }
    ],
    faq: [
      { question: 'Does locking grain increase waste?', answer: 'Often yes, because the optimizer loses one packing option.' },
      { question: 'Can MDF rotate freely?', answer: 'Plain MDF usually can, but melamine, veneer, textured panels, and printed panels may have direction.' },
      { question: 'Should I lock every visible part?', answer: 'Only when the project requires matching direction. Over-locking can waste material.' }
    ],
    related: [
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer' },
      { href: '/melamine-cut-list-optimizer', label: 'Melamine cut list optimizer' },
      { href: '/edge-banding-in-cut-list', label: 'Edge banding guide' }
    ]
  },
  '/edge-banding-in-cut-list': {
    lead: 'Edge banding instructions tell the shop which sides of a panel need banding after cutting. For melamine and cabinet projects, losing these marks can cause assembly and finish errors.',
    sections: [
      { heading: 'What to record', body: ['Record edge banding per side: top, right, bottom, and left relative to the finished part orientation. Do this before optimizing so rotated parts can still be reviewed correctly.'], table: { caption: 'Example banding notes', headers: ['Part', 'Edges to band', 'Why'], rows: [['Shelf', 'Front edge', 'Visible opening edge.'], ['Cabinet side', 'Front vertical edge', 'Visible face frame or frameless front.'], ['Drawer front', 'All four edges', 'Finished visible panel.'], ['Back panel', 'None or hidden edges', 'Usually not visible.']] } },
      { heading: 'Mistakes to avoid', body: ['Do not treat edge banding as material thickness in the optimizer unless you intentionally oversize parts before trimming. It is usually a shop note, not a reason to change the rectangle size.'] }
    ],
    faq: [
      { question: 'Does edge banding change cut size?', answer: 'Usually no. Cut size remains the finished panel size unless your shop intentionally cuts oversized and trims after banding.' },
      { question: 'What happens when a part rotates?', answer: 'Review the printed labels and edge marks so top/right/bottom/left still match the finished orientation.' },
      { question: 'Is this only for melamine?', answer: 'No. It also applies to veneer plywood, cabinet parts, shelves, and finished panels.' }
    ],
    related: [
      { href: '/melamine-cut-list-optimizer', label: 'Melamine cut list optimizer' },
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer' },
      { href: '/grain-direction-in-cut-lists', label: 'Grain direction guide' }
    ]
  },
  '/guillotine-cut-vs-nesting': {
    lead: 'Guillotine-style layouts favor straight cuts across rectangular stock. Nesting software can pack irregular shapes more tightly, but it may require CNC or more complex cutting processes.',
    sections: [
      { heading: 'The practical difference', body: ['A guillotine cut splits a remaining rectangle into smaller rectangles. That style is easier to execute with panel saws, table saws, track saws, and shop notes. Nesting tries to arrange parts for material yield and can include irregular geometry.'], table: { caption: 'Guillotine vs nesting', headers: ['Approach', 'Best for', 'Limitation'], rows: [['Guillotine-style rectangular layout', 'Shop-readable panel cutting', 'May waste more than advanced nesting.'], ['2D rectangular packing', 'Cabinet and sheet goods planning', 'Does not handle curves or polygons.'], ['Industrial nesting', 'CNC and production workflows', 'Needs more setup and machine-specific output.']] } },
      { heading: 'What StockCut is built for', body: ['StockCut is a practical planning tool for rectangular sheet parts and straight stock. It does not claim CNC-grade nesting, G-code, polygon packing, or angle-cut geometry.'] }
    ],
    faq: [
      { question: 'Is StockCut nesting software?', answer: 'No. It is a practical rectangular cut list optimizer, not industrial nesting CAM.' },
      { question: 'Why not always use nesting?', answer: 'For simple shop cutting, a readable rectangular plan may be more useful than a dense machine-style nest.' },
      { question: 'Can StockCut handle angled cuts?', answer: 'No. It focuses on rectangular sheet parts and straight linear cuts.' }
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer' },
      { href: '/how-to-read-a-plywood-cutting-diagram', label: 'Read a cutting diagram' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste' }
    ]
  },
  '/cut-list-optimizer-vs-excel': {
    lead: 'A spreadsheet is good for listing parts, but it does not show whether parts fit in stock after kerf, orientation, stock quantity, and offcuts are included.',
    sections: [
      { heading: 'When Excel is enough', body: ['Excel is useful for part names, quantities, materials, and estimating total area or length. It becomes weak when you need a visual layout, a cut sequence, or an unplaced-parts warning.'], table: { caption: 'Excel vs StockCut', headers: ['Need', 'Spreadsheet', 'StockCut'], rows: [['Part list storage', 'Good', 'Good'], ['Kerf-aware layout', 'Manual', 'Built in'], ['Printable cutting diagram', 'Manual drawing', 'Generated'], ['Unplaced warnings', 'Manual formulas', 'Shown in result'], ['CSV import/export', 'Native', 'Supported']] } },
      { heading: 'Best workflow', body: ['Keep your master cut list in a spreadsheet if that is convenient, then paste or import rows into StockCut when you need a layout and printable shop output.'] }
    ],
    faq: [
      { question: 'Should I stop using Excel?', answer: 'No. Use Excel for planning and StockCut for kerf-aware layout and output.' },
      { question: 'Can I paste spreadsheet rows?', answer: 'Yes. Use the paste/import flow and confirm parsed rows before replacing the current list.' },
      { question: 'Can I export results back to CSV?', answer: 'Yes. Export CSV after generating a layout.' }
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer' },
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer' },
      { href: '/cut-list-optimizer-vs-sketchup', label: 'Compare with SketchUp' }
    ]
  },
  '/cut-list-optimizer-vs-sketchup': {
    lead: 'SketchUp is strong for designing and visualizing a project. A cut list optimizer is better for turning known part dimensions into stock usage, kerf-aware layout, and printed cutting output.',
    sections: [
      { heading: 'Use the tools together', body: ['Design in SketchUp or another CAD tool, extract or write the part list, then use StockCut to test stock sizes, kerf, waste, and cutting order. Do not treat an optimizer as a replacement for project design.'], table: { caption: 'Design tool vs cutting optimizer', headers: ['Task', 'SketchUp / CAD', 'StockCut'], rows: [['Project design', 'Strong', 'Not intended'], ['3D assembly review', 'Strong', 'Not intended'], ['Kerf-aware stock layout', 'Manual / plugin-dependent', 'Built in'], ['Shop cutting diagram', 'Manual export', 'Generated'], ['Pipe/lumber sequence', 'Manual', 'Built in linear mode']] } },
      { heading: 'What to verify after export', body: ['Check material thickness, grain direction, edge banding, duplicate quantities, and whether any parts should be oversized for trimming or joinery.'] }
    ],
    faq: [
      { question: 'Does StockCut import SketchUp files?', answer: 'No. Use a part list or spreadsheet-style dimensions.' },
      { question: 'Can StockCut replace CAD?', answer: 'No. It plans cuts after you already know the part sizes.' },
      { question: 'What is the best workflow?', answer: 'Design first, export or write part dimensions, then optimize the cut list.' }
    ],
    related: [
      { href: '/cut-list-optimizer-vs-excel', label: 'Compare with Excel' },
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer' },
      { href: '/4x8-plywood-cut-list-optimizer', label: '4x8 plywood cut list optimizer' }
    ]
  },
  '/plywood-factory-edge-trim': {
    lead: 'Factory edges are not always clean, square, or usable as a finished reference edge. Trimming them improves quality but reduces the usable sheet area before layout.',
    sections: [
      { heading: 'When to trim a factory edge', body: ['Trim factory edges when the edge is damaged, out of square, dirty, chipped, or when the first visible reference edge needs to be cleaner than the raw sheet.'], table: { caption: 'Trim margin effects on a 48 x 96 sheet', headers: ['Trim each side', 'Usable width', 'Usable length'], rows: [['0 in', '48 in', '96 in'], ['1/8 in', '47.75 in', '95.75 in'], ['1/4 in', '47.5 in', '95.5 in'], ['1/2 in', '47 in', '95 in']] } },
      { heading: 'How it affects the optimizer', body: ['A part that fits on the nominal sheet may fail after trim margins. Enter the usable size or trim margin before trusting the layout.'] }
    ],
    faq: [
      { question: 'Should I always trim factory edges?', answer: 'No. Trim only when edge quality or squareness matters for the project.' },
      { question: 'Does trim margin count as kerf?', answer: 'No. Kerf is cut loss between parts. Trim margin is stock removed from the sheet boundary.' },
      { question: 'Can trim make parts unplaceable?', answer: 'Yes. It reduces usable width and height.' }
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer' },
      { href: '/4x8-plywood-cut-list-optimizer', label: '4x8 plywood cut list optimizer' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste' }
    ]
  }
};

for (const [alias, target] of [
  ['/guides/how-to-account-for-saw-kerf', '/how-to-account-for-saw-kerf'],
  ['/guides/saw-kerf-explained', '/saw-kerf-explained'],
  ['/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet'],
  ['/guides/how-to-read-a-plywood-cutting-diagram', '/how-to-read-a-plywood-cutting-diagram'],
  ['/guides/reduce-plywood-waste', '/reduce-plywood-waste'],
  ['/guides/grain-direction-in-cut-lists', '/grain-direction-in-cut-lists'],
  ['/guides/edge-banding-in-cut-list', '/edge-banding-in-cut-list'],
  ['/guides/guillotine-cut-vs-nesting', '/guillotine-cut-vs-nesting'],
  ['/guides/cut-list-optimizer-vs-excel', '/cut-list-optimizer-vs-excel'],
  ['/guides/cut-list-optimizer-vs-sketchup', '/cut-list-optimizer-vs-sketchup'],
  ['/guides/plywood-factory-edge-trim', '/plywood-factory-edge-trim']
] as const) {
  guideContentBySlug[alias] = guideContentBySlug[target];
}
