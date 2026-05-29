export type PresetContentBlock = {
  title: string;
  body: string[];
  bullets?: string[];
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
};

export type StockCutPresetContent = {
  eyebrow: string;
  title: string;
  lead: string;
  presetTable: {
    headers: string[];
    rows: string[][];
  };
  blocks: PresetContentBlock[];
  mistakes: string[];
  related: { href: string; label: string; purpose: string }[];
};

export const presetContentBySlug: Record<string, StockCutPresetContent> = {
  '/4x8-plywood-cut-list-optimizer': {
    eyebrow: 'Preset guide',
    title: '4x8 plywood cut list preset',
    lead: 'This page is meant for a common 48 × 96 inch sheet workflow. Use the tool above for the actual layout, then use this module to check the assumptions before you print or cut.',
    presetTable: {
      headers: ['Setting', 'Default / example', 'Why it matters'],
      rows: [
        ['Stock size', '48 × 96 in sheet', 'Matches the common plywood planning size used by this preset.'],
        ['Kerf', '1/8 in example', 'The blade-width gap can make exact-fit layouts fail.'],
        ['Parts', 'Cabinet sides, shelves, top / bottom', 'The default parts show how repeated rectangles are packed.'],
        ['Output', 'Sheet count, yield, waste, printable diagram', 'These are planning outputs; verify dimensions before cutting.']
      ]
    },
    blocks: [
      {
        title: 'Worked example: why the sample is useful',
        body: ['Start with the 4×8 sample if you only want to see how a plywood layout behaves. Change one part size at a time, regenerate, and watch the sheet count, yield, and unplaced count.'],
        table: {
          caption: 'Example review sequence',
          headers: ['Step', 'What to change', 'What to check'],
          rows: [
            ['1', 'Set real blade kerf', 'The layout reserves cut loss between parts.'],
            ['2', 'Enter finished part sizes', 'Do not inflate dimensions for kerf.'],
            ['3', 'Generate the layout', 'Check whether any parts are unplaced.'],
            ['4', 'Review offcuts', 'Decide whether large offcuts are worth saving.']
          ]
        }
      },
      {
        title: 'When a 4x8 layout is not enough',
        body: ['A 4×8 preset does not know about sheet defects, bowed material, shop handling limits, or whether a factory edge must be trimmed. Add trim margins or split the project into more realistic stock groups when those issues matter.']
      }
    ],
    mistakes: [
      'Using 0 kerf for a saw-cut plywood job.',
      'Treating the generated diagram as a machine-ready CNC toolpath.',
      'Forgetting grain direction on visible cabinet or furniture parts.',
      'Assuming every offcut shown in the diagram will be square and reusable.'
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use a blank sheet workflow.' },
      { href: '/how-to-account-for-saw-kerf', label: 'How to account for saw kerf', purpose: 'Fix exact-fit layout mistakes.' },
      { href: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', label: '24 + 24 does not fit guide', purpose: 'Understand the most common kerf trap.' }
    ]
  },
  '/sheet-cutting-optimizer': {
    eyebrow: 'Tool guide',
    title: 'Sheet cutting optimizer workflow',
    lead: 'Use this page when your stock is a rectangular sheet: plywood, MDF, acrylic, melamine, or similar panel material. The tool above should stay first; this guide only explains how to review the result.',
    presetTable: {
      headers: ['Input', 'Use it for', 'Check before cutting'],
      rows: [
        ['Stock width / height', 'Sheet dimensions and usable panel area', 'Confirm orientation and units.'],
        ['Kerf', 'Blade-width spacing between cuts', 'Measure the saw or cutting process.'],
        ['Rotation / grain lock', 'Parts that can or cannot rotate', 'Lock visible grain when needed.'],
        ['Trim margin', 'Factory edge cleanup or unusable border', 'Do not confuse trim with kerf.']
      ]
    },
    blocks: [
      { title: 'What the result means', body: ['A good sheet layout is not only a high yield percentage. Also check whether the parts are safe to cut, labels are readable, and offcuts are large enough to keep.'] },
      { title: 'Use the result as a shop plan', body: ['Print the diagram, mark stock orientation, and verify the first sheet physically. For expensive materials, run a small subset or sample project before committing to a full batch.'] }
    ],
    mistakes: [
      'Letting visible grain rotate on doors, shelves, or finished faces.',
      'Ignoring trim margins on damaged or out-of-square sheet edges.',
      'Comparing only waste percentage without checking unplaced parts.',
      'Using a sheet optimizer for non-rectangular or angled parts.'
    ],
    related: [
      { href: '/4x8-plywood-cut-list-optimizer', label: '4x8 plywood preset', purpose: 'Start from a common sheet size.' },
      { href: '/grain-direction-in-cut-lists', label: 'Grain direction guide', purpose: 'Decide when rotation is unsafe.' },
      { href: '/plywood-factory-edge-trim', label: 'Factory edge trim guide', purpose: 'Account for unusable sheet edges.' }
    ]
  },
  '/linear-cutting-optimizer': {
    eyebrow: 'Tool guide',
    title: 'Linear cut list workflow',
    lead: 'Use this page for straight stock: boards, rails, bars, pipe, tube, extrusion, or rebar. Enter stock length, finished cut lengths, quantity, and kerf, then generate a sequence.',
    presetTable: {
      headers: ['Input', 'Example', 'Result to review'],
      rows: [
        ['Stock length', '96 in board or 120 in pipe', 'How many sticks are needed.'],
        ['Cut length', 'Finished shelf, rail, or pipe segment', 'Which stick each piece comes from.'],
        ['Kerf', 'Blade or wheel width', 'Total cut loss across repeated pieces.'],
        ['Material group', 'Optional', 'Avoid mixing unlike stock if you use material labels.']
      ]
    },
    blocks: [
      { title: 'Worked example: repeated cuts', body: ['Ten equal cuts do not simply equal ten finished lengths. The cuts between them consume kerf, and the last offcut may or may not be reusable.'] },
      { title: 'How to read the sequence', body: ['Review each stock bar in order, then mark the physical stick before cutting. If the first stick leaves a useful offcut, decide whether to keep it as future stock.'] }
    ],
    mistakes: [
      'Entering rough cut sizes when the project needs finished sizes.',
      'Ignoring cleanup cuts on pipe, tube, or rough lumber.',
      'Mixing materials without labels when different stock should not be combined.',
      'Assuming the displayed order is the only safe shop sequence.'
    ],
    related: [
      { href: '/lumber-length-cutting-optimizer', label: 'Lumber length optimizer', purpose: 'Use board-specific sample values.' },
      { href: '/pvc-pipe-cutting-optimizer', label: 'PVC pipe cutting optimizer', purpose: 'Use pipe-oriented sample values.' },
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator', purpose: 'Estimate cut loss before optimizing.' }
    ]
  },
  '/pvc-pipe-cutting-optimizer': {
    eyebrow: 'Preset guide',
    title: 'PVC pipe cutting preset',
    lead: 'This preset uses straight-stock logic for pipe segments. It helps plan cuts and offcuts, but it does not replace fitting allowance, deburring, socket depth, or jobsite measurements.',
    presetTable: {
      headers: ['Setting', 'Default / example', 'What to verify'],
      rows: [
        ['Stock length', '120 in pipe example', 'Use the actual pipe length you will buy or cut.'],
        ['Cut list', 'Pipe segment lengths and quantities', 'Measure finished segment length based on your assembly method.'],
        ['Kerf / cleanup', 'Saw or wheel width', 'Add extra allowance for cleanup if needed.'],
        ['Output', 'Pipe count, sequence, offcuts', 'Check whether offcuts are useful or scrap.']
      ]
    },
    blocks: [
      { title: 'Pipe-specific caution', body: ['Pipe projects often involve fittings and socket depth. StockCut only plans straight segment lengths. Keep assembly rules and fitting allowances outside the optimizer unless you intentionally include them in each finished cut length.'] },
      { title: 'Best use case', body: ['Use this preset for repeated straight pieces: irrigation lines, shop jigs, shelving frames, mockups, or other projects where pipe sections are cut to known finished lengths.'] }
    ],
    mistakes: [
      'Using outside project length when the finished pipe segment should account for fittings.',
      'Ignoring deburring or cleanup allowance.',
      'Using a wood blade kerf value for an abrasive wheel cut.',
      'Treating PVC output as plumbing design advice.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use the generic straight-stock workflow.' },
      { href: '/steel-tube-cutting-optimizer', label: 'Steel tube cutting optimizer', purpose: 'Plan metal tube cuts separately.' },
      { href: '/how-to-account-for-saw-kerf', label: 'Kerf accounting guide', purpose: 'Understand cut loss between pieces.' }
    ]
  },
  '/lumber-length-cutting-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Lumber length cutting preset',
    lead: 'Use this page for 1D board and rail cuts. It is best for repeated lengths, shelves, rails, cleats, and straight lumber parts where width is already chosen.',
    presetTable: {
      headers: ['Setting', 'Example', 'Reason'],
      rows: [
        ['Stock length', '8 ft / 96 in example', 'Controls how many boards are required.'],
        ['Cut lengths', 'Shelf or rail lengths', 'Finished sizes should stay separate from kerf.'],
        ['Quantity', 'Repeated pieces', 'Repeated cuts compound kerf loss.'],
        ['Cost', 'Optional', 'Enables estimated stock cost if entered.']
      ]
    },
    blocks: [
      { title: 'Worked example: board count', body: ['If repeated parts nearly fill a board, one additional kerf can push the last part onto another stock length. Generate the sequence before buying material.'] },
      { title: 'What StockCut does not know', body: ['It does not grade lumber, avoid knots, account for bowed boards, or choose the safest cutting order. Use the output as a planning list and mark physical boards before cutting.'] }
    ],
    mistakes: [
      'Forgetting to leave room for squaring the end of rough boards.',
      'Ignoring defects that make part of a board unusable.',
      'Letting the optimizer mix boards that should be separated by material or grade.',
      'Using nominal board names as exact dimensions without checking actual stock.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use a blank straight-stock workflow.' },
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator', purpose: 'Estimate loss across repeated cuts.' },
      { href: '/cut-list-optimizer-vs-excel', label: 'Cut list optimizer vs Excel', purpose: 'Compare spreadsheet planning with generated sequences.' }
    ]
  },
  '/steel-tube-cutting-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Steel tube cutting preset',
    lead: 'Use this preset for straight tube or bar lengths. It can plan lengths and offcuts, but it does not model miter cuts, weld prep, bending, coping, or structural design.',
    presetTable: {
      headers: ['Setting', 'Example', 'What to verify'],
      rows: [
        ['Stock length', 'Tube or bar stock length', 'Use the actual purchased length.'],
        ['Cut list', 'Finished tube segments', 'Keep miter or coping allowances outside this simple 1D optimizer.'],
        ['Kerf', 'Saw blade or abrasive wheel width', 'Measure the real process.'],
        ['Output', 'Tube count, waste, offcuts', 'Check safety and fabrication sequence yourself.']
      ]
    },
    blocks: [
      { title: 'Scope boundary', body: ['This page is not a structural calculator and not a fabrication safety plan. It only organizes straight cut lengths by available stock length.'] },
      { title: 'When to use separate material groups', body: ['If wall thickness, alloy, coating, or finish matters, label materials separately so unlike stock is not mixed in the same cutting list.'] }
    ],
    mistakes: [
      'Using straight-cut output for angled or mitered tube without separate allowance.',
      'Ignoring cleanup, deburring, or weld-prep length loss.',
      'Mixing different wall thicknesses under the same material label.',
      'Treating the cut sequence as safety advice.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use generic bar-stock logic.' },
      { href: '/aluminum-extrusion-cut-list-optimizer', label: 'Aluminum extrusion optimizer', purpose: 'Plan extrusion lengths.' },
      { href: '/pvc-pipe-cutting-optimizer', label: 'PVC pipe optimizer', purpose: 'Plan non-metal pipe separately.' }
    ]
  },
  '/cabinet-cut-list-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Cabinet panel cut list preset',
    lead: 'This preset is for rectangular cabinet parts such as sides, shelves, tops, bottoms, backs, and drawer parts. It helps plan sheet usage but does not design the cabinet for you.',
    presetTable: {
      headers: ['Setting', 'Example', 'Check'],
      rows: [
        ['Stock', 'Plywood, MDF, melamine, or panel stock', 'Confirm thickness and sheet dimensions.'],
        ['Parts', 'Sides, shelves, tops, bottoms', 'Enter finished rectangular dimensions.'],
        ['Rotation', 'Often limited by grain or finished face', 'Lock rotation where grain direction matters.'],
        ['Edge banding', 'Planning note only', 'Verify banded edges manually before cutting.']
      ]
    },
    blocks: [
      { title: 'Cabinet workflow', body: ['Create the cut list from your design, verify part labels, decide which faces need grain direction, then generate the layout. Print the result and mark finished faces before cutting.'] },
      { title: 'What to verify manually', body: ['StockCut does not validate joinery, hardware clearances, finished cabinet dimensions, or structural design. Use it after those decisions are already made.'] }
    ],
    mistakes: [
      'Letting visible side panels rotate when grain must align.',
      'Forgetting backs, stretchers, shelves, or repeated drawer parts.',
      'Using the optimizer as a cabinet design tool instead of a cutting plan.',
      'Not checking edge-banding orientation before printing.'
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use the blank sheet workflow.' },
      { href: '/grain-direction-in-cut-lists', label: 'Grain direction guide', purpose: 'Lock panel orientation correctly.' },
      { href: '/edge-banding-in-cut-list', label: 'Edge banding guide', purpose: 'Review finished edge notes.' }
    ]
  },
  '/saw-kerf-calculator': {
    eyebrow: 'Tool guide',
    title: 'Saw kerf calculator quick guide',
    lead: 'Use the kerf calculator when you need the raw stock allowance for repeated cuts. It is a planning helper, not a substitute for measuring the blade or wheel.',
    presetTable: {
      headers: ['Input', 'Meaning', 'Common mistake'],
      rows: [
        ['Finished length', 'The size you need after cutting', 'Adding kerf into the finished dimension.'],
        ['Cut count', 'Number of separating cuts', 'Counting parts instead of cuts.'],
        ['Kerf', 'Actual material removed by the cutting process', 'Assuming every blade removes exactly the same amount.'],
        ['Result', 'Raw allowance / cut loss', 'Using it without measuring a test cut.']
      ]
    },
    blocks: [
      { title: 'How to use the number', body: ['Add the kerf allowance to the raw material planning step, not to the finished part size. If you later clean up edges, account for that as a separate trim or cleanup allowance.'] },
      { title: 'Where it connects to optimizers', body: ['The sheet and linear optimizers use kerf as spacing between pieces or cut loss between consecutive cuts. If kerf is wrong here, every generated layout can become over-optimistic.'] }
    ],
    mistakes: [
      'Counting one kerf per part instead of one kerf per separating cut.',
      'Using a nominal blade thickness without test cutting.',
      'Mixing cleanup allowance, trim margin, and kerf into one number without understanding it.',
      'Forgetting that repeated cuts compound small errors.'
    ],
    related: [
      { href: '/how-to-account-for-saw-kerf', label: 'How to account for saw kerf', purpose: 'Understand the rule before optimizing.' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use kerf in a panel layout.' },
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use kerf in a straight-stock sequence.' }
    ]
  }

,
  '/plywood-cutting-layout-calculator': {
    eyebrow: 'Preset guide',
    title: 'Plywood cutting layout calculator preset',
    lead: 'Use this page when the material is plywood but the project is not specifically a 4×8 cabinet sample. The calculator above should create the layout; this module explains the assumptions to review before printing.',
    presetTable: {
      headers: ['Setting', 'Typical value', 'Review before cutting'],
      rows: [
        ['Stock size', '48 × 96 in or your actual sheet', 'Use the sheet size you will physically cut, not only the nominal product name.'],
        ['Kerf', 'Blade-width allowance', 'A small kerf error can decide whether a tight row fits.'],
        ['Part rotation', 'Allowed unless grain matters', 'Lock visible grain, veneer direction, or textured faces.'],
        ['Result', 'Sheet count, placements, offcuts', 'Review labels and offcuts before buying material.']
      ]
    },
    blocks: [
      { title: 'How this differs from a plain cut list', body: ['A written cut list tells you what parts exist. A layout calculator shows whether those rectangles can fit on actual sheet stock after kerf and rotation rules are included.'], table: { caption: 'Plywood layout review', headers: ['Check', 'Why it matters'], rows: [['Unplaced parts', 'Shows whether part size, quantity, or rotation prevents a fit.'], ['Large offcuts', 'May be reusable for shelves, cleats, or another project.'], ['Rotation', 'Can improve yield but may be wrong for visible grain.'], ['Trim margin', 'Accounts for unusable factory edges.']] } },
      { title: 'Best workflow', body: ['Start with the default layout, enter your real sheet size and kerf, generate once, then adjust part order or rotation only after you understand which pieces are difficult to place.'] }
    ],
    mistakes: [
      'Using nominal plywood size when the actual sheet is smaller or edge-trimmed.',
      'Letting finished faces rotate when grain direction matters.',
      'Ignoring a part that is technically placed but awkward to cut safely.',
      'Treating the diagram as CNC output instead of a shop planning diagram.'
    ],
    related: [
      { href: '/4x8-plywood-cut-list-optimizer', label: '4×8 plywood cut list optimizer', purpose: 'Start from the most common sheet preset.' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use the general panel workflow.' },
      { href: '/how-to-read-a-plywood-cutting-diagram', label: 'How to read a cutting diagram', purpose: 'Understand labels, offcuts, and kerf spacing.' }
    ]
  },
  '/mdf-sheet-cut-calculator': {
    eyebrow: 'Preset guide',
    title: 'MDF sheet cut calculator preset',
    lead: 'This preset is for MDF panels, often in metric stock sizes. It helps plan rectangular parts and waste, but it does not account for dust control, tool selection, edge finishing, or structural design.',
    presetTable: {
      headers: ['Setting', 'Default / example', 'Why it matters'],
      rows: [
        ['Stock size', '2440 × 1220 mm example', 'Metric sheet stock differs from 4×8 inch planning.'],
        ['Kerf', '3 mm example', 'Router, track saw, and panel saw kerf values differ.'],
        ['Parts', 'Shelves, doors, panels, backs', 'Enter finished rectangular dimensions.'],
        ['Output', 'Sheet count and waste', 'Use as a buying and shop planning estimate.']
      ]
    },
    blocks: [
      { title: 'Metric MDF workflow', body: ['Use millimeter dimensions consistently. Mixing inch-style part names with metric stock values can make the result harder to check.'], table: { caption: 'MDF review checklist', headers: ['Review point', 'Reason'], rows: [['Units', 'Keep stock, parts, and kerf in one unit system.'], ['Edge quality', 'MDF edges may need trimming or finishing.'], ['Panel handling', 'Large MDF sheets are heavy and fragile at corners.'], ['Dust and safety', 'Plan cuts separately from dust control and PPE decisions.']] } },
      { title: 'When to add trim margin', body: ['Add a trim margin or reduce usable stock size if the factory edge is chipped, swollen, dirty, or not square enough for finished parts.'] }
    ],
    mistakes: [
      'Mixing millimeters and inches in the same cut list.',
      'Assuming every MDF sheet is exactly the nominal size.',
      'Ignoring edge finishing or oversize trimming needs.',
      'Using zero kerf for saw-cut MDF layouts.'
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use a blank panel workflow.' },
      { href: '/plywood-factory-edge-trim', label: 'Factory edge trim guide', purpose: 'Account for unusable edges.' },
      { href: '/melamine-cut-list-optimizer', label: 'Melamine cut list optimizer', purpose: 'Plan another sheet material workflow.' }
    ]
  },
  '/acrylic-sheet-cutting-layout-tool': {
    eyebrow: 'Preset guide',
    title: 'Acrylic sheet cutting layout preset',
    lead: 'Use this page to arrange rectangular acrylic pieces and estimate waste. Acrylic cutting quality depends heavily on tool, feed rate, support, masking, and edge finishing, so treat the layout as planning output only.',
    presetTable: {
      headers: ['Setting', 'Example', 'Review before cutting'],
      rows: [
        ['Stock size', 'Metric acrylic sheet example', 'Use the exact supplier sheet size.'],
        ['Kerf', 'Saw, laser, or router allowance', 'Cutting process changes the material removed.'],
        ['Parts', 'Panels, windows, guards, inserts', 'Confirm finished dimensions and edge quality needs.'],
        ['Output', 'Layout and offcuts', 'Verify handling and support before cutting.']
      ]
    },
    blocks: [
      { title: 'Acrylic-specific boundary', body: ['StockCut does not decide laser settings, chip control, melting risk, masking, or polishing allowance. Include any extra finishing allowance in your entered part sizes if your process requires it.'], table: { caption: 'Process-related assumptions', headers: ['Issue', 'Handled by layout?', 'What to do'], rows: [['Kerf spacing', 'Yes, as entered', 'Measure your process.'], ['Melted edge allowance', 'No', 'Add separate finishing allowance if needed.'], ['Masking and scratches', 'No', 'Plan handling outside the optimizer.'], ['Crack/chip risk', 'No', 'Use proper cutting setup.']] } },
      { title: 'Use case', body: ['This page is best for simple rectangular acrylic panels where you already know finished sizes and want to reduce sheet waste before cutting or ordering material.'] }
    ],
    mistakes: [
      'Using a wood saw kerf value for laser or router cutting.',
      'Ignoring polishing or cleanup allowance.',
      'Forgetting protective film and scratch-sensitive handling.',
      'Treating rectangular layout output as process advice.'
    ],
    related: [
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use the generic rectangular panel workflow.' },
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator', purpose: 'Estimate cut loss before layout.' },
      { href: '/mdf-sheet-cut-calculator', label: 'MDF sheet calculator', purpose: 'Compare another metric panel preset.' }
    ]
  },
  '/melamine-cut-list-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Melamine cut list preset',
    lead: 'This preset is for cabinet and shelf panels where finished faces, edge banding, and chip-prone cuts matter. Use the optimizer for layout, then manually verify orientation and finished edges.',
    presetTable: {
      headers: ['Setting', 'Example', 'Why it matters'],
      rows: [
        ['Stock', 'Melamine sheet or panel stock', 'Confirm sheet size, thickness, and face direction.'],
        ['Rotation', 'Often locked for visible panels', 'Texture, grain, or face orientation can matter.'],
        ['Kerf', 'Blade-width allowance', 'Chipping and cleanup may require more than nominal kerf.'],
        ['Edge banding', 'Planning note', 'Check visible front edges before printing.']
      ]
    },
    blocks: [
      { title: 'Melamine review checklist', body: ['Before printing, check that each visible panel is oriented correctly and that edge-banding notes still make sense if any part is rotated.'], table: { caption: 'Common melamine decisions', headers: ['Decision', 'Recommended handling'], rows: [['Visible grain or texture', 'Lock rotation.'], ['Hidden stretchers', 'Allow rotation if material permits.'], ['Finished front edge', 'Track edge-banding note manually.'], ['Chip-sensitive cuts', 'Allow cleanup or verify saw setup.']] } },
      { title: 'Scope boundary', body: ['StockCut does not choose blade type, score cuts, banding thickness, or cabinet joinery. It only places rectangles on stock according to the values you enter.'] }
    ],
    mistakes: [
      'Letting visible textured panels rotate freely.',
      'Forgetting edge-banding direction after rotation.',
      'Entering oversized parts without explaining trimming workflow.',
      'Assuming layout optimization solves chipout or finish quality.'
    ],
    related: [
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer', purpose: 'Plan cabinet panels with labels.' },
      { href: '/edge-banding-in-cut-list', label: 'Edge banding guide', purpose: 'Record visible edges correctly.' },
      { href: '/grain-direction-in-cut-lists', label: 'Grain direction guide', purpose: 'Decide when rotation should be locked.' }
    ]
  },
  '/bookshelf-cut-list-calculator': {
    eyebrow: 'Preset guide',
    title: 'Bookshelf cut list preset',
    lead: 'Use this page when a project is mostly shelves, sides, tops, bottoms, and backs. The tool can plan rectangular cuts, but it does not validate shelf span, joinery, load rating, or hardware.',
    presetTable: {
      headers: ['Part group', 'Example', 'Review'],
      rows: [
        ['Sides', 'Tall vertical panels', 'Check grain or visible face orientation.'],
        ['Shelves', 'Repeated horizontal panels', 'Confirm quantity and finished depth.'],
        ['Top / bottom', 'Case parts', 'Check joinery allowance separately.'],
        ['Back panel', 'Thin sheet or separate material', 'Do not mix unlike stock unless intended.']
      ]
    },
    blocks: [
      { title: 'Worked example: repeated shelves', body: ['Repeated shelves can improve yield because they give the optimizer similar rectangles to pack. But one size typo can multiply across every shelf, so verify dimensions before generating a final printout.'], table: { caption: 'Bookshelf checks', headers: ['Check', 'Reason'], rows: [['Shelf count', 'Repeated quantities drive sheet usage.'], ['Shelf depth', 'Often determines whether a row fits.'], ['Back material', 'May be different thickness or stock.'], ['Finished edge', 'May need banding or sanding.']] } },
      { title: 'What to do next', body: ['After generating the layout, print it and mark shelves as a group. Check whether large offcuts can become cleats, stretchers, or smaller shelves.'] }
    ],
    mistakes: [
      'Using the optimizer as a shelf strength calculator.',
      'Forgetting the back panel or toe-kick pieces.',
      'Mixing different material thicknesses without labels.',
      'Letting finished faces rotate when grain alignment matters.'
    ],
    related: [
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer', purpose: 'Use a broader casework workflow.' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use the blank sheet workflow.' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste', purpose: 'Improve material usage after the first result.' }
    ]
  },
  '/drawer-box-cut-list-calculator': {
    eyebrow: 'Preset guide',
    title: 'Drawer box cut list preset',
    lead: 'This preset is for repeated drawer sides, fronts, backs, and bottoms. It helps lay out rectangles, but it does not calculate drawer slide clearances, joinery, groove depth, or box construction details.',
    presetTable: {
      headers: ['Part', 'Example use', 'Manual check'],
      rows: [
        ['Drawer sides', 'Repeated long parts', 'Confirm left/right pair quantity.'],
        ['Front / back', 'Repeated short parts', 'Check joinery and finished width separately.'],
        ['Bottoms', 'Panel inserts', 'May be a different material or thickness.'],
        ['Kerf', 'Blade loss between repeated pieces', 'Repeated drawers compound small errors.']
      ]
    },
    blocks: [
      { title: 'Why repeated drawer parts need care', body: ['Drawer projects often create many identical rectangles. This is good for yield, but a wrong quantity or length can affect the whole batch.'], table: { caption: 'Drawer batch review', headers: ['Before generating', 'After generating'], rows: [['Check one full drawer part list', 'Confirm every part appears in the printout.'], ['Separate material thicknesses', 'Review sheets by material group.'], ['Confirm kerf', 'Check whether rows are tight or comfortable.'], ['Confirm labels', 'Avoid mixing side/front/back parts.']] } },
      { title: 'Construction boundary', body: ['StockCut does not decide drawer clearances, rabbet/dado details, inset/overlay, slide type, or finished box dimensions. Enter part sizes after those design choices are made.'] }
    ],
    mistakes: [
      'Entering drawer opening size instead of finished part size.',
      'Forgetting that bottoms may use a different sheet material.',
      'Multiplying the wrong quantity across a batch.',
      'Using labels that make repeated parts hard to distinguish.'
    ],
    related: [
      { href: '/cabinet-cut-list-optimizer', label: 'Cabinet cut list optimizer', purpose: 'Plan casework panels and drawer parts together.' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Use a general sheet layout.' },
      { href: '/cut-list-optimizer-vs-excel', label: 'Cut list optimizer vs Excel', purpose: 'Use spreadsheets plus layout output.' }
    ]
  },
  '/closet-shelf-plywood-calculator': {
    eyebrow: 'Preset guide',
    title: 'Closet shelf plywood preset',
    lead: 'Use this page for shelves, dividers, cleats, and closet panels cut from plywood or sheet stock. It plans material usage, not wall attachment, span safety, or installation details.',
    presetTable: {
      headers: ['Input', 'Example', 'Check'],
      rows: [
        ['Shelf lengths', 'Repeated shelf boards', 'Measure installed opening carefully.'],
        ['Shelf depth', 'Common repeated dimension', 'Depth strongly affects sheet yield.'],
        ['Dividers', 'Vertical panels', 'Check visible face orientation if needed.'],
        ['Cleats', 'Small strips', 'Consider whether offcuts can be used.']
      ]
    },
    blocks: [
      { title: 'Closet project workflow', body: ['Enter finished shelf dimensions after measuring the actual opening. Generate once, then look for offcuts that can become cleats, small shelves, or test pieces.'], table: { caption: 'Closet layout review', headers: ['Review', 'Reason'], rows: [['Actual opening width', 'Walls may not be square or parallel.'], ['Shelf depth', 'Repeats across the project.'], ['Support method', 'Outside the optimizer scope.'], ['Offcut reuse', 'Can reduce new sheet needs.']] } },
      { title: 'Installation boundary', body: ['StockCut does not validate load capacity, wall fastening, brackets, anchors, or building conditions. Treat the output as a cutting plan only.'] }
    ],
    mistakes: [
      'Using nominal closet width instead of measured opening width.',
      'Ignoring walls that are out of square.',
      'Forgetting support cleats or divider panels.',
      'Treating layout output as shelf load advice.'
    ],
    related: [
      { href: '/bookshelf-cut-list-calculator', label: 'Bookshelf cut list calculator', purpose: 'Plan a similar shelf-heavy project.' },
      { href: '/4x8-plywood-cut-list-optimizer', label: '4×8 plywood optimizer', purpose: 'Start from common plywood sheet stock.' },
      { href: '/plywood-factory-edge-trim', label: 'Factory edge trim guide', purpose: 'Account for unusable edges.' }
    ]
  },
  '/workbench-plywood-cut-layout': {
    eyebrow: 'Preset guide',
    title: 'Workbench plywood cut layout preset',
    lead: 'Use this page for workbench tops, shelves, gussets, and shop panels. It helps plan sheet usage, but it does not validate structural strength, fastening, or load capacity.',
    presetTable: {
      headers: ['Part type', 'Example', 'Review'],
      rows: [
        ['Top layers', 'Repeated large panels', 'Confirm exact top size and lamination plan.'],
        ['Shelf panels', 'Lower storage or stretchers', 'Check finished dimensions.'],
        ['Gussets / braces', 'Rectangular planning only', 'Angle cuts are outside scope.'],
        ['Offcuts', 'Shop jigs or cleats', 'Decide what is worth saving.']
      ]
    },
    blocks: [
      { title: 'Workshop planning use case', body: ['A workbench layout usually has a few large rectangles and many small utility pieces. Generate the layout to see whether small parts can fit in offcuts after the large top and shelf pieces are placed.'], table: { caption: 'Workbench review checklist', headers: ['Check', 'Why'], rows: [['Large top panels', 'They drive sheet count.'], ['Thickness / lamination', 'May require duplicate layers.'], ['Gusset shape', 'Rectangular optimizer does not model angles.'], ['Shop offcuts', 'Can become jigs, cleats, or test cuts.']] } },
      { title: 'Scope boundary', body: ['StockCut does not calculate bench stiffness, joinery, racking resistance, or safe load. Use it only after the design and part sizes are known.'] }
    ],
    mistakes: [
      'Expecting angled braces to be optimized as triangles.',
      'Forgetting duplicate top layers or shelf panels.',
      'Ignoring sheet handling and safe cutting order for large pieces.',
      'Treating the cutting plan as a structural design.'
    ],
    related: [
      { href: '/4x8-plywood-cut-list-optimizer', label: '4×8 plywood cut list optimizer', purpose: 'Use the main plywood preset.' },
      { href: '/sheet-cutting-optimizer', label: 'Sheet cutting optimizer', purpose: 'Start from custom sheet values.' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste', purpose: 'Improve layout after first result.' }
    ]
  },
  '/linear-bar-cutting-list-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Linear bar cutting preset',
    lead: 'Use this page for straight bars, rods, rails, and stock lengths where each part is a finished length. It does not model angle cuts, bending, threading, machining allowances, or structural requirements.',
    presetTable: {
      headers: ['Setting', 'Example', 'Review'],
      rows: [
        ['Stock length', 'Bar or rail length', 'Use the purchased or usable length.'],
        ['Cut lengths', 'Finished straight parts', 'Keep machining allowance separate if needed.'],
        ['Kerf', 'Saw or cutoff wheel width', 'Measure the actual process.'],
        ['Output', 'Stock count, sequence, offcuts', 'Use for planning and labeling.']
      ]
    },
    blocks: [
      { title: 'Generic bar-stock workflow', body: ['Use material labels when bars differ by alloy, thickness, finish, or supplier. The optimizer should not mix unlike stock unless you intentionally label it the same.'], table: { caption: 'Bar-stock review', headers: ['Issue', 'How to handle'], rows: [['Different materials', 'Use material labels or separate runs.'], ['Cleanup cuts', 'Include separate allowance if required.'], ['Reusable offcuts', 'Save only lengths your shop will actually use.'], ['Angle cuts', 'Handle outside this 1D optimizer.']] } },
      { title: 'When to use a more specific page', body: ['Use the steel tube, aluminum extrusion, PVC pipe, or lumber preset when the material has special review concerns. Use this page for generic straight stock.'] }
    ],
    mistakes: [
      'Mixing unlike bars under one material label.',
      'Ignoring cleanup or machining allowance.',
      'Using the result for angled or bent parts.',
      'Assuming every offcut is worth keeping.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use the general straight-stock workflow.' },
      { href: '/steel-tube-cutting-optimizer', label: 'Steel tube cutting optimizer', purpose: 'Plan tube stock.' },
      { href: '/aluminum-extrusion-cut-list-optimizer', label: 'Aluminum extrusion optimizer', purpose: 'Plan extrusion lengths.' }
    ]
  },
  '/aluminum-extrusion-cut-list-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Aluminum extrusion cut list preset',
    lead: 'Use this page for straight aluminum extrusion lengths. It plans stock usage and offcuts, but it does not validate slot orientation, end machining, tapping, deburring, or assembly design.',
    presetTable: {
      headers: ['Setting', 'Example', 'Review'],
      rows: [
        ['Stock length', 'Metric extrusion length', 'Use the usable supplier length.'],
        ['Cut lengths', 'Frame rails and posts', 'Confirm finished assembly dimensions.'],
        ['Kerf', 'Blade width or cutoff loss', 'Measure your saw setup.'],
        ['Material label', 'Profile / series / finish', 'Avoid mixing different profiles.']
      ]
    },
    blocks: [
      { title: 'Extrusion-specific review', body: ['Profiles that look similar can be different series, slot size, finish, or wall thickness. Use material labels to keep incompatible stock separated.'], table: { caption: 'Extrusion checks', headers: ['Check', 'Reason'], rows: [['Profile series', 'Do not mix incompatible extrusion.'], ['Finish', 'Visible pieces may need separate stock.'], ['End machining', 'Outside optimizer scope.'], ['Reusable offcuts', 'Useful only if long enough for future frames.']] } },
      { title: 'Scope boundary', body: ['StockCut does not model tapped holes, brackets, corner connectors, end caps, or assembly clearance. Enter cut lengths after those decisions are made.'] }
    ],
    mistakes: [
      'Mixing different extrusion profiles in one run.',
      'Forgetting end machining or cleanup allowance.',
      'Using nominal frame outside dimensions as cut lengths without accounting for connectors.',
      'Treating the cutting sequence as assembly instructions.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use a blank 1D workflow.' },
      { href: '/steel-tube-cutting-optimizer', label: 'Steel tube cutting optimizer', purpose: 'Plan another metal stock type.' },
      { href: '/linear-bar-cutting-list-optimizer', label: 'Linear bar cutting optimizer', purpose: 'Use a generic bar-stock page.' }
    ]
  },
  '/rebar-cutting-optimizer': {
    eyebrow: 'Preset guide',
    title: 'Rebar cutting preset',
    lead: 'Use this page only for straight rebar length planning. It does not provide structural engineering, code compliance, bending schedules, lap splice rules, or site safety instructions.',
    presetTable: {
      headers: ['Setting', 'Example', 'Important boundary'],
      rows: [
        ['Stock length', 'Standard straight bar length', 'Use actual available stock length.'],
        ['Cut lengths', 'Straight segment list', 'Do not use for bent shapes.'],
        ['Kerf / cutoff loss', 'Saw or shear allowance', 'Use your actual process.'],
        ['Output', 'Bar count and offcuts', 'Planning only; verify with project documents.']
      ]
    },
    blocks: [
      { title: 'Safety and engineering boundary', body: ['This page is not structural advice. Rebar size, spacing, lap, bend, hook, grade, and code requirements must come from qualified project documents or professionals.'], table: { caption: 'What the optimizer does and does not do', headers: ['Item', 'Handled by StockCut?'], rows: [['Straight length grouping', 'Yes, as a planning calculation.'], ['Bending schedule', 'No.'], ['Structural design', 'No.'], ['Code compliance', 'No.']] } },
      { title: 'Practical use', body: ['Use this only after the straight cut lengths are already known. If bars have different grades or diameters, run them separately or label materials so they are not mixed.'] }
    ],
    mistakes: [
      'Using the tool to create engineering dimensions.',
      'Mixing bar diameters, grades, or coatings.',
      'Ignoring bending, hook, or lap requirements.',
      'Treating offcut reuse as structurally acceptable without approval.'
    ],
    related: [
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Use the generic 1D workflow.' },
      { href: '/linear-bar-cutting-list-optimizer', label: 'Linear bar cutting optimizer', purpose: 'Use a lower-risk generic bar planning page.' },
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator', purpose: 'Estimate cut loss only.' }
    ]
  },
  '/plywood-yield-rate-calculator': {
    eyebrow: 'Tool guide',
    title: 'Plywood yield rate preset',
    lead: 'Use this page to estimate sheet yield, waste rate, used area, and offcuts for rectangular plywood parts. Yield is a planning signal, not the only measure of a good shop layout.',
    presetTable: {
      headers: ['Metric', 'Meaning', 'How to use it'],
      rows: [
        ['Yield rate', 'Finished part area divided by stock area used', 'Compare layout efficiency, not safety.'],
        ['Waste rate', 'Unused stock area after placed parts', 'Look for large reusable offcuts.'],
        ['Sheet count', 'Number of sheets required', 'Use for buying estimates.'],
        ['Unplaced parts', 'Parts that did not fit', 'Fix before trusting yield.']
      ]
    },
    blocks: [
      { title: 'Yield is not the whole decision', body: ['A very high yield can still be hard to cut if parts are too tight, labels are confusing, or offcuts are not useful. Use yield together with the preview and unplaced count.'], table: { caption: 'Yield interpretation', headers: ['Result', 'What it may mean'], rows: [['High yield, no unplaced parts', 'Efficient layout, still review cut order.'], ['High yield, warnings', 'May be fragile or too tight.'], ['Low yield, useful offcuts', 'May still be acceptable if offcuts are reusable.'], ['Any unplaced parts', 'Do not treat the result as complete.']] } },
      { title: 'When to compare multiple layouts', body: ['Try alternate stock sizes, rotation rules, and trim margins. Compare sheet count, yield, waste, offcuts, and manual cut practicality, not just the highest percentage.'] }
    ],
    mistakes: [
      'Optimizing for yield while ignoring cut practicality.',
      'Counting unplaced parts as if they were included.',
      'Treating tiny slivers as useful offcuts.',
      'Ignoring trim margins and factory edge cleanup.'
    ],
    related: [
      { href: '/4x8-plywood-cut-list-optimizer', label: '4×8 plywood cut list optimizer', purpose: 'Generate a layout before judging yield.' },
      { href: '/reduce-plywood-waste', label: 'Reduce plywood waste', purpose: 'Improve layout decisions.' },
      { href: '/plywood-factory-edge-trim', label: 'Factory edge trim guide', purpose: 'Adjust usable sheet size.' }
    ]
  },
  '/saw-kerf-compensation-calculator': {
    eyebrow: 'Tool guide',
    title: 'Saw kerf compensation preset',
    lead: 'Use this page to plan extra raw length or spacing needed because every separating cut removes material. It is most useful before buying stock or when a near-exact fit keeps failing.',
    presetTable: {
      headers: ['Input', 'Example meaning', 'Common check'],
      rows: [
        ['Finished part count', 'How many pieces you need', 'Do not confuse parts with cuts.'],
        ['Kerf', 'Blade or process width', 'Measure from a test cut when possible.'],
        ['Cleanup trim', 'Separate allowance if needed', 'Do not merge with kerf unless intentional.'],
        ['Raw requirement', 'Finished length plus cut loss', 'Use as planning allowance.']
      ]
    },
    blocks: [
      { title: 'How compensation differs from finished size', body: ['Kerf compensation belongs in the raw stock allowance, not inside the finished part dimension. Finished parts remain the sizes you need after cutting.'], table: { caption: 'Kerf compensation examples', headers: ['Scenario', 'What to add'], rows: [['Two pieces from one board', 'One separating kerf between them.'], ['Three pieces in sequence', 'Two separating kerfs if cut from one run.'], ['Edge cleanup before first part', 'Add cleanup trim separately.'], ['Sheet rows with multiple panels', 'Kerf spacing between adjacent panels.']] } },
      { title: 'Use with optimizers', body: ['After estimating kerf, use the sheet or linear optimizer to place parts. The optimizer handles kerf spacing or cut loss based on the value you enter.'] }
    ],
    mistakes: [
      'Adding kerf to every finished part dimension.',
      'Counting the same kerf twice.',
      'Ignoring cleanup or squaring cuts that happen before layout.',
      'Using a nominal blade number without measuring the real cut.'
    ],
    related: [
      { href: '/saw-kerf-calculator', label: 'Saw kerf calculator', purpose: 'Use the main kerf tool.' },
      { href: '/how-to-account-for-saw-kerf', label: 'How to account for saw kerf', purpose: 'Read the practical explanation.' },
      { href: '/linear-cutting-optimizer', label: 'Linear cutting optimizer', purpose: 'Apply kerf to a stock sequence.' }
    ]
  }

};
