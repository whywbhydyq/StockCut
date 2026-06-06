import { canonicalPages, type PageKind, type SeoPage, siteUrl } from '@/data/pages';

export interface IntentCluster {
  id: string;
  label: string;
  summary: string;
  whenToUse: string;
  primarySlugs: string[];
  supportingSlugs: string[];
}

export const seoIntentClusters: IntentCluster[] = [
  {
    id: 'sheet-goods',
    label: 'Sheet goods and panel layouts',
    summary: 'Use these pages for plywood, MDF, acrylic, melamine, cabinet panels, shelves, drawer boxes, workbenches, and other rectangular sheet parts.',
    whenToUse: 'Choose a sheet page when every part has width and height and the result needs a printable 2D layout.',
    primarySlugs: ['/sheet-cutting-optimizer', '/4x8-plywood-cut-list-optimizer', '/plywood-cutting-layout-calculator'],
    supportingSlugs: ['/mdf-sheet-cut-calculator', '/acrylic-sheet-cutting-layout-tool', '/melamine-cut-list-optimizer', '/cabinet-cut-list-optimizer', '/bookshelf-cut-list-calculator', '/drawer-box-cut-list-calculator', '/closet-shelf-plywood-calculator', '/workbench-plywood-cut-layout']
  },
  {
    id: 'linear-stock',
    label: 'Boards, pipe, tube, bar, and rebar',
    summary: 'Use these pages for straight-stock cut sequences where each requested part is a length cut from boards, pipe, tube, extrusion, bar, or rebar.',
    whenToUse: 'Choose a linear page when each cut has one length and the goal is to pack repeated lengths into available stock lengths.',
    primarySlugs: ['/linear-cutting-optimizer', '/lumber-length-cutting-optimizer', '/pvc-pipe-cutting-optimizer'],
    supportingSlugs: ['/steel-tube-cutting-optimizer', '/aluminum-extrusion-cut-list-optimizer', '/linear-bar-cutting-list-optimizer', '/rebar-cutting-optimizer']
  },
  {
    id: 'kerf-and-fit',
    label: 'Kerf, fit, and waste checks',
    summary: 'Use these pages to understand blade-width loss, exact-fit failures, usable sheet area, and waste/yield calculations before cutting.',
    whenToUse: 'Choose a kerf or guide page when the layout fails because dimensions appear to fit mathematically but do not fit after saw width, trim, or orientation is included.',
    primarySlugs: ['/saw-kerf-calculator', '/saw-kerf-compensation-calculator', '/how-to-account-for-saw-kerf'],
    supportingSlugs: ['/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', '/plywood-yield-rate-calculator', '/reduce-plywood-waste', '/plywood-factory-edge-trim']
  },
  {
    id: 'shop-methodology',
    label: 'Methodology, diagrams, and workflow decisions',
    summary: 'Use these pages to decide whether StockCut matches a job, interpret diagrams, compare spreadsheet workflows, and understand the optimizer boundary.',
    whenToUse: 'Choose a methodology page when the searcher needs process confidence rather than a specific calculator preset.',
    primarySlugs: ['/cut-list-optimization-methodology', '/how-to-read-a-plywood-cutting-diagram', '/guillotine-cut-vs-nesting'],
    supportingSlugs: ['/cut-list-optimizer-vs-excel', '/cut-list-optimizer-vs-sketchup', '/grain-direction-in-cut-lists', '/edge-banding-in-cut-list']
  }
];

const pageMap = new Map(canonicalPages.map((page) => [page.slug, page]));

export function pageUrl(slug: string): string {
  return `${siteUrl}${slug === '/' ? '' : slug}`;
}

export function pageForSlug(slug: string): SeoPage | undefined {
  return pageMap.get(slug);
}

export function pagesForSlugs(slugs: string[]): SeoPage[] {
  return slugs.map((slug) => pageMap.get(slug)).filter((page): page is SeoPage => Boolean(page));
}

export function clusterForPage(page: SeoPage): IntentCluster | undefined {
  return seoIntentClusters.find((cluster) => [...cluster.primarySlugs, ...cluster.supportingSlugs].includes(page.slug))
    ?? clusterByKind(page.kind);
}

function clusterByKind(kind: PageKind): IntentCluster | undefined {
  if (kind === 'linear') return seoIntentClusters.find((cluster) => cluster.id === 'linear-stock');
  if (kind === 'kerf') return seoIntentClusters.find((cluster) => cluster.id === 'kerf-and-fit');
  if (kind === 'guide') return seoIntentClusters.find((cluster) => cluster.id === 'shop-methodology');
  if (kind === 'sheet') return seoIntentClusters.find((cluster) => cluster.id === 'sheet-goods');
  return undefined;
}

export function relatedPagesFor(page: SeoPage, limit = 6): SeoPage[] {
  const cluster = clusterForPage(page);
  const clustered = cluster ? pagesForSlugs([...cluster.primarySlugs, ...cluster.supportingSlugs]) : [];
  const sameKind = canonicalPages.filter((candidate) => candidate.kind === page.kind);
  const fallback = canonicalPages.filter((candidate) => ['/', '/cut-list-optimization-methodology', '/how-to-account-for-saw-kerf'].includes(candidate.slug));
  const merged = [...clustered, ...sameKind, ...fallback];
  const seen = new Set<string>([page.slug]);
  const related: SeoPage[] = [];
  for (const candidate of merged) {
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    related.push(candidate);
    if (related.length >= limit) break;
  }
  return related;
}

export function priorityIndexPages(): SeoPage[] {
  const slugs = ['/', ...seoIntentClusters.flatMap((cluster) => cluster.primarySlugs)];
  return pagesForSlugs(slugs.filter((slug, index, list) => list.indexOf(slug) === index));
}

export function intentClusterJsonLd() {
  return {
    '@type': 'ItemList',
    '@id': `${siteUrl}/#intent-clusters`,
    name: 'StockCut calculator and guide clusters',
    itemListElement: seoIntentClusters.map((cluster, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cluster.label,
      description: cluster.summary,
      item: cluster.primarySlugs.map((slug) => pageUrl(slug))
    }))
  };
}
