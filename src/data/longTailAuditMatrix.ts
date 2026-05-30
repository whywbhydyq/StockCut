export type LongTailAuditStatus = 'pass' | 'needs_data' | 'needs_content' | 'monitor_gsc';
export type CannibalizationRisk = 'low' | 'medium' | 'high';

export interface LongTailAuditItem {
  slug: string;
  primaryQuery: string;
  contentRole: string;
  canonical: string;
  searchIntent: 'tool' | 'preset_tool' | 'calculator' | 'guide';
  presetParametersClear: boolean;
  toolEmbeddedOrLinked: boolean;
  exampleInputPresent: boolean;
  exampleOutputExplained: boolean;
  commonMistakesPresent: boolean;
  canonicalInternalLinksOnly: boolean;
  cannibalizationRisk: CannibalizationRisk;
  status: LongTailAuditStatus;
  nextAction: string;
}

export const priorityLongTailAudit: LongTailAuditItem[] = [
  {
    slug: '/4x8-plywood-cut-list-optimizer',
    primaryQuery: '4x8 plywood cut list optimizer',
    contentRole: 'Specific 48 x 96 plywood preset page; should own exact 4x8 intent.',
    canonical: '/4x8-plywood-cut-list-optimizer',
    searchIntent: 'preset_tool',
    presetParametersClear: true,
    toolEmbeddedOrLinked: true,
    exampleInputPresent: true,
    exampleOutputExplained: true,
    commonMistakesPresent: true,
    canonicalInternalLinksOnly: true,
    cannibalizationRisk: 'medium',
    status: 'monitor_gsc',
    nextAction: 'Monitor whether 4x8 queries land here rather than the generic plywood layout page.'
  },
  {
    slug: '/sheet-cutting-optimizer',
    primaryQuery: 'sheet cutting optimizer',
    contentRole: 'Generic sheet-goods optimizer for plywood, MDF, acrylic, melamine, and custom sheet sizes.',
    canonical: '/sheet-cutting-optimizer',
    searchIntent: 'tool',
    presetParametersClear: true,
    toolEmbeddedOrLinked: true,
    exampleInputPresent: true,
    exampleOutputExplained: true,
    commonMistakesPresent: true,
    canonicalInternalLinksOnly: true,
    cannibalizationRisk: 'medium',
    status: 'monitor_gsc',
    nextAction: 'Keep generic sheet intent here; do not retarget this page to exact 4x8 plywood wording.'
  },
  {
    slug: '/linear-cutting-optimizer',
    primaryQuery: 'linear cutting optimizer',
    contentRole: 'Generic 1D straight-stock parent page for boards, lumber, pipe, tube, extrusion, rebar, and bar stock.',
    canonical: '/linear-cutting-optimizer',
    searchIntent: 'tool',
    presetParametersClear: true,
    toolEmbeddedOrLinked: true,
    exampleInputPresent: true,
    exampleOutputExplained: true,
    commonMistakesPresent: true,
    canonicalInternalLinksOnly: true,
    cannibalizationRisk: 'medium',
    status: 'monitor_gsc',
    nextAction: 'Use this as the generic parent page; keep PVC and steel tube pages material-specific.'
  },
  {
    slug: '/pvc-pipe-cutting-optimizer',
    primaryQuery: 'pvc pipe cut list optimizer',
    contentRole: 'PVC-specific straight-stock preset page with pipe-oriented examples and warnings.',
    canonical: '/pvc-pipe-cutting-optimizer',
    searchIntent: 'preset_tool',
    presetParametersClear: true,
    toolEmbeddedOrLinked: true,
    exampleInputPresent: true,
    exampleOutputExplained: true,
    commonMistakesPresent: true,
    canonicalInternalLinksOnly: true,
    cannibalizationRisk: 'low',
    status: 'monitor_gsc',
    nextAction: 'Keep PVC wording specific; do not use this page for generic linear cutting terms.'
  },
  {
    slug: '/steel-tube-cutting-optimizer',
    primaryQuery: 'steel tube cut list optimizer',
    contentRole: 'Steel-tube-specific straight-stock preset page distinct from PVC pipe and generic linear cutting.',
    canonical: '/steel-tube-cutting-optimizer',
    searchIntent: 'preset_tool',
    presetParametersClear: true,
    toolEmbeddedOrLinked: true,
    exampleInputPresent: true,
    exampleOutputExplained: true,
    commonMistakesPresent: true,
    canonicalInternalLinksOnly: true,
    cannibalizationRisk: 'low',
    status: 'monitor_gsc',
    nextAction: 'Keep steel tube wording and examples distinct from PVC and aluminum extrusion pages.'
  }
];
