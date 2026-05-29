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
};
