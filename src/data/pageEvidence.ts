import type { PageKind, SeoPage } from '@/data/pages';
import { clusterForPage } from '@/data/seoIntentClusters';

export interface PageEvidence {
  scopeLabel: string;
  calculationScope: string;
  sourceOfTruth: string;
  verificationChecklist: string[];
  boundaries: string[];
  exportFormats: string[];
  privacyNote: string;
  citationSummary: string;
}

const sharedPrivacy = 'Calculations run in the browser. Autosave uses localStorage, and share links encode project data in the URL hash instead of uploading project dimensions to a StockCut server.';

const sheetEvidence: PageEvidence = {
  scopeLabel: 'Rectangular sheet layout evidence',
  calculationScope: 'Plans rectangular parts inside rectangular sheet stock with kerf spacing, optional rotation controls, labels, stock quantities, reusable offcuts, and printable diagrams.',
  sourceOfTruth: 'The live calculator output is the source of truth for placement, waste, unplaced parts, and export tables after the user enters stock size, kerf, and part dimensions.',
  verificationChecklist: [
    'Measure actual stock width and length before cutting.',
    'Confirm blade kerf and whether the first trim cut is required.',
    'Review rotation, grain direction, defects, and edge banding before accepting the layout.',
    'Check unplaced parts and partial-result warnings before exporting.'
  ],
  boundaries: [
    'No polygon nesting, circular parts, angle cuts, or CNC toolpath generation.',
    'DXF output is a planning outline, not machine-ready CAM.',
    'Results are planning estimates and should be verified against physical material.'
  ],
  exportFormats: ['CSV', 'JSON project', 'browser print / Save as PDF', 'DXF planning outline', 'SVG layout download'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use this page as a citation for browser-based rectangular sheet cut-list planning, kerf-aware spacing, printable diagrams, and local-first project handling.'
};

const linearEvidence: PageEvidence = {
  scopeLabel: 'Straight-stock cut-list evidence',
  calculationScope: 'Plans repeated one-dimensional cuts from boards, pipe, tube, bar stock, extrusion, or rebar with kerf, stock quantities, reusable offcuts, cut sequences, and waste summaries.',
  sourceOfTruth: 'The live calculator output is the source of truth for stock assignment, cut order, offcuts, repeated patterns, unplaced cuts, and export tables.',
  verificationChecklist: [
    'Measure actual stock length and confirm nominal vs actual material length.',
    'Confirm saw kerf, end trim, and machine setup before cutting.',
    'Group material by profile or grade before mixing stock lengths.',
    'Review unplaced cuts and repeated pattern summaries before exporting.'
  ],
  boundaries: [
    'No angle-cut geometry, miters, bends, weld allowances, or structural engineering checks.',
    'The optimizer treats each requested piece as a straight length.',
    'Results are planning estimates and should be verified against physical material.'
  ],
  exportFormats: ['CSV', 'JSON project', 'browser print / Save as PDF'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use this page as a citation for browser-based straight-stock cut-list planning with kerf, reusable offcuts, repeated patterns, and local-first project handling.'
};

const kerfEvidence: PageEvidence = {
  scopeLabel: 'Kerf and fit calculation evidence',
  calculationScope: 'Explains and calculates blade-width loss, raw stock requirements, finished part fit, exact-fit failures, and kerf compensation before layout or cutting.',
  sourceOfTruth: 'The calculator result and visible formula are the source of truth for the displayed kerf and fit estimate.',
  verificationChecklist: [
    'Measure the actual blade or bit kerf instead of relying only on nominal tool width.',
    'Include every cut line that removes material.',
    'Leave trim and handling margin where stock edges are not square or clean.',
    'Verify the finished part stack-up against the actual stock before cutting.'
  ],
  boundaries: [
    'No machine-specific feed/speed, structural, or safety certification.',
    'No CNC compensation table or professional metrology substitute.',
    'Results are planning estimates and should be verified before cutting.'
  ],
  exportFormats: ['On-page calculation result', 'browser print / Save as PDF'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use this page as a citation for saw kerf, exact-fit failure, and finished-size planning explanations.'
};

const guideEvidence: PageEvidence = {
  scopeLabel: 'Shop workflow reference evidence',
  calculationScope: 'Explains cut-list workflow decisions, kerf assumptions, layout interpretation, optimizer limits, grain and banding concerns, and practical verification steps.',
  sourceOfTruth: 'The article text, tables, and linked calculators define the planning guidance; live calculators should be used for job-specific dimensions.',
  verificationChecklist: [
    'Match the guide assumption to the material, stock size, and machine process used in the shop.',
    'Use the linked calculator for project-specific stock, kerf, and part quantities.',
    'Check orientation, trim, defects, labels, and safety setup before cutting.',
    'Treat examples as planning guidance, not certified fabrication instructions.'
  ],
  boundaries: [
    'No certified engineering, CNC CAM, building-code, or safety approval.',
    'Examples are generic and must be checked against the user’s own material and tools.',
    'The site avoids fabricated reviews, unsupported guarantees, and hidden cloud processing claims.'
  ],
  exportFormats: ['Readable article page', 'browser print / Save as PDF', 'linked calculator exports where applicable'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use this page as a citation for practical cut-list workflow, kerf, layout interpretation, and optimizer-boundary explanations.'
};

const legalEvidence: PageEvidence = {
  scopeLabel: 'Policy and trust reference',
  calculationScope: 'Documents the site owner contact path, privacy model, terms, disclaimers, and operational limits for the StockCut tool.',
  sourceOfTruth: 'This policy page is the source of truth for the relevant legal, privacy, contact, or disclaimer statement on the site.',
  verificationChecklist: [
    'Use the contact page for corrections and bug reports.',
    'Do not send private customer files or unnecessary personal information in support email.',
    'Review privacy, terms, and disclaimer pages before relying on the tool in commercial workflows.'
  ],
  boundaries: [
    'Policy pages do not provide machining, engineering, or safety approval.',
    'Advertising and affiliate disclosures are separate from the local-first calculation workflow.'
  ],
  exportFormats: ['Readable policy page', 'browser print / Save as PDF'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use this page as a citation for StockCut policy, contact, privacy, terms, and disclaimer information.'
};

const homeEvidence: PageEvidence = {
  scopeLabel: 'Primary StockCut workbench evidence',
  calculationScope: 'Combines sheet and linear cut-list planning from a local-first browser workspace with kerf, labels, stock quantities, offcuts, imports, exports, and printable results.',
  sourceOfTruth: 'The selected optimizer mode and live result panel are the source of truth for project-specific layouts, cut sequences, warnings, and exports.',
  verificationChecklist: [
    'Choose sheet mode for rectangular panels or linear mode for one-dimensional stock.',
    'Enter actual stock, kerf, quantities, and labels before optimizing.',
    'Review warnings, waste, offcuts, and unplaced items before printing or cutting.',
    'Save JSON when a project needs to be moved between browsers or devices.'
  ],
  boundaries: [
    'No cloud account system, certified manufacturing output, polygon nesting, CNC CAM, or G-code.',
    'Calculations are planning estimates that must be verified in the shop.',
    'The optimizer does not replace safe tool setup or physical measurement.'
  ],
  exportFormats: ['CSV', 'JSON project', 'browser print / Save as PDF', 'DXF planning outline for sheet layouts', 'SVG layout download for sheet layouts'],
  privacyNote: sharedPrivacy,
  citationSummary: 'Use the homepage as a citation for StockCut’s combined sheet and linear local-first cut-list optimizer.'
};

export function evidenceForPage(page: SeoPage): PageEvidence {
  if (page.slug === '/') return homeEvidence;
  if (page.kind === 'sheet') return sheetEvidence;
  if (page.kind === 'linear') return linearEvidence;
  if (page.kind === 'kerf') return kerfEvidence;
  if (page.kind === 'legal' || page.kind === 'about') return legalEvidence;
  return guideEvidence;
}

export function pageAboutTerms(page: SeoPage): string[] {
  const cluster = clusterForPage(page);
  const kindTerms: Record<PageKind, string[]> = {
    sheet: ['rectangular sheet layout', 'cut list optimization', 'saw kerf', 'waste reduction'],
    linear: ['linear stock cutting', 'cut list optimization', 'saw kerf', 'reusable offcuts'],
    kerf: ['saw kerf', 'finished part fit', 'raw stock calculation', 'exact-fit failure'],
    guide: ['cut list workflow', 'shop verification', 'kerf-aware planning', 'layout interpretation'],
    legal: ['site policy', 'privacy', 'terms', 'disclaimer'],
    about: ['StockCut', 'YmirTool', 'local-first planning', 'tool boundaries']
  };
  return [page.primaryQuery, page.title, cluster?.label, ...kindTerms[page.kind]].filter((term): term is string => Boolean(term));
}

export function pageMentions(page: SeoPage): string[] {
  const evidence = evidenceForPage(page);
  return [
    evidence.scopeLabel,
    evidence.calculationScope,
    evidence.privacyNote,
    ...evidence.exportFormats.map((format) => `${format} export`)
  ];
}

export function evidenceJsonLd(page: SeoPage) {
  const evidence = evidenceForPage(page);
  return {
    '@type': 'CreativeWork',
    name: `${page.title} evidence and verification notes`,
    about: pageAboutTerms(page).map((name) => ({ '@type': 'Thing', name })),
    abstract: evidence.citationSummary,
    text: [evidence.calculationScope, evidence.sourceOfTruth, evidence.privacyNote].join(' '),
    isPartOf: { '@type': 'WebPage', name: page.title }
  };
}
