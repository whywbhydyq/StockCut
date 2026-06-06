import { canonicalPages, siteUrl, type SeoPage } from '@/data/pages';
import { clusterForPage, pageUrl, relatedPagesFor } from '@/data/seoIntentClusters';
import { evidenceForPage } from '@/data/pageEvidence';
import { siteLastModified } from '@/data/siteMeta';

export type ProductionSignalSourceId = 'google-search-console' | 'pagespeed-insights' | 'rich-results-test' | 'bing-webmaster-tools' | 'production-crawl' | 'csp-report-only';
export type ProductionSignalCadence = 'after-each-release' | 'weekly' | 'monthly' | 'when-traffic-changes';
export type ProductionSignalSeverity = 'blocking' | 'high' | 'medium' | 'record-only';

export interface ProductionSignalSource {
  id: ProductionSignalSourceId;
  label: string;
  cadence: ProductionSignalCadence;
  ownerAction: string;
  acceptedInput: string[];
  useFor: string[];
  doNotInfer: string;
}

export interface ProductionSignalInputFormat {
  id: string;
  label: string;
  source: ProductionSignalSourceId;
  expectedFiles: string[];
  requiredFields: string[];
  optionalFields: string[];
  normalizationNotes: string;
}

export interface ProductionSignalKpi {
  id: string;
  label: string;
  source: ProductionSignalSourceId;
  severity: ProductionSignalSeverity;
  target: string;
  actionWhenMissed: string;
}

export interface SearchIntentBucket {
  id: string;
  label: string;
  queryPatterns: string[];
  preferredCanonicalSlugs: string[];
  decisionRule: string;
}

export interface ProductionSignalPageTarget {
  slug: string;
  url: string;
  title: string;
  intentCluster: string | null;
  primaryQuery: string | null;
  relatedCanonicalUrls: string[];
  evidenceSummary: string;
  signalPriority: 'core' | 'supporting' | 'governance';
  reviewSignals: string[];
}

export const productionSignalSources: ProductionSignalSource[] = [
  {
    id: 'google-search-console',
    label: 'Google Search Console performance export',
    cadence: 'weekly',
    ownerAction: 'Export queries and pages for the last 28 days and compare against the prior 28 days when enough data exists.',
    acceptedInput: ['CSV query export', 'CSV page export', 'Search Console API JSON'],
    useFor: ['query-to-page fit', 'CTR rewrite candidates', 'position 4-20 internal-link candidates', 'index coverage follow-up'],
    doNotInfer: 'Do not treat missing GSC data as proof of low demand; new pages may simply lack impressions.'
  },
  {
    id: 'pagespeed-insights',
    label: 'PageSpeed Insights / Core Web Vitals export',
    cadence: 'after-each-release',
    ownerAction: 'Record mobile and desktop results for the homepage, sheet optimizer, linear optimizer, methodology page, and one guide page.',
    acceptedInput: ['PageSpeed JSON', 'manually captured metric JSON'],
    useFor: ['LCP/INP/CLS regression detection', 'third-party script impact', 'transfer-size warnings'],
    doNotInfer: 'Do not claim CWV pass/fail from source-only checks; use deployed URL data.'
  },
  {
    id: 'rich-results-test',
    label: 'Rich Results Test / structured data validation',
    cadence: 'after-each-release',
    ownerAction: 'Validate homepage, one sheet tool, one linear tool, one guide, and SEO governance pages.',
    acceptedInput: ['manual status notes', 'structured data parser JSON'],
    useFor: ['JSON-LD parse failures', 'schema identity conflicts', 'unexpected FAQPage or duplicate entity issues'],
    doNotInfer: 'A source JSON-LD graph is not enough; rendered production HTML must parse.'
  },
  {
    id: 'bing-webmaster-tools',
    label: 'Bing Webmaster Tools follow-up',
    cadence: 'monthly',
    ownerAction: 'Check sitemap discovery, index coverage, and any URL inspection warnings for canonical pages.',
    acceptedInput: ['manual notes', 'CSV export when available'],
    useFor: ['secondary search coverage', 'sitemap submission drift', 'unexpected blocked pages'],
    doNotInfer: 'Do not assume Google and Bing indexability reports agree.'
  },
  {
    id: 'production-crawl',
    label: 'Production crawl script output',
    cadence: 'after-each-release',
    ownerAction: 'Run scripts/check-production-seo.mjs against Preview and Production from a network that can resolve the host.',
    acceptedInput: ['script stdout', 'JSON summary when redirected to a file'],
    useFor: ['HTTP status', 'headers', 'canonical HTML samples', 'redirect samples', 'endpoint content type'],
    doNotInfer: 'Do not replace real browser rendering or external structured-data validators.'
  },
  {
    id: 'csp-report-only',
    label: 'CSP report-only observation',
    cadence: 'when-traffic-changes',
    ownerAction: 'Review report-only violations before enforcing CSP, especially AdSense, static assets, fonts, images, frames, and connect destinations.',
    acceptedInput: ['report-only violation logs', 'manual browser console notes'],
    useFor: ['safe CSP hardening', 'third-party script inventory', 'blocked asset prevention'],
    doNotInfer: 'Do not switch to enforced CSP from source policy alone.'
  }
];

export const productionSignalInputFormats: ProductionSignalInputFormat[] = [
  {
    id: 'gsc-query-csv',
    label: 'Search Console queries CSV',
    source: 'google-search-console',
    expectedFiles: ['search-console-queries.csv', 'gsc-queries.csv'],
    requiredFields: ['query', 'clicks', 'impressions', 'ctr', 'position'],
    optionalFields: ['page', 'country', 'device', 'date'],
    normalizationNotes: 'CTR may be exported as a percentage string or a decimal. Position is treated as lower-is-better.'
  },
  {
    id: 'gsc-page-csv',
    label: 'Search Console pages CSV',
    source: 'google-search-console',
    expectedFiles: ['search-console-pages.csv', 'gsc-pages.csv'],
    requiredFields: ['page', 'clicks', 'impressions', 'ctr', 'position'],
    optionalFields: ['query', 'country', 'device', 'date'],
    normalizationNotes: 'Canonical URLs should be normalized to the production origin and matched to canonicalPages.'
  },
  {
    id: 'pagespeed-json',
    label: 'PageSpeed JSON export',
    source: 'pagespeed-insights',
    expectedFiles: ['pagespeed-mobile.json', 'pagespeed-desktop.json', 'psi-*.json'],
    requiredFields: ['url', 'strategy', 'performanceScore', 'lcp', 'inp', 'cls'],
    optionalFields: ['fcp', 'tbt', 'thirdPartySummary', 'diagnostics'],
    normalizationNotes: 'Accept either raw PageSpeed API JSON or a compact manually curated JSON array.'
  },
  {
    id: 'rich-results-notes',
    label: 'Rich Results validation notes',
    source: 'rich-results-test',
    expectedFiles: ['rich-results.json', 'structured-data-notes.json'],
    requiredFields: ['url', 'valid', 'detectedTypes'],
    optionalFields: ['warnings', 'errors', 'testedAt'],
    normalizationNotes: 'Record rendered production URL checks, not source-only assumptions.'
  },
  {
    id: 'production-crawl-json',
    label: 'Production crawl JSON or stdout capture',
    source: 'production-crawl',
    expectedFiles: ['production-crawl.json', 'check-production-seo.json'],
    requiredFields: ['baseUrl', 'status', 'checkedAt'],
    optionalFields: ['endpointFailures', 'headerFailures', 'redirectFailures', 'canonicalFailures'],
    normalizationNotes: 'Use scripts/check-production-seo.mjs output or a manually curated compact crawl summary from the deployed host.'
  },
  {
    id: 'csp-report-json',
    label: 'CSP report-only violation JSON',
    source: 'csp-report-only',
    expectedFiles: ['csp-reports.json', 'csp-report-only.json', 'security-policy-violations.json'],
    requiredFields: ['violated-directive', 'blocked-uri'],
    optionalFields: ['document-uri', 'effective-directive', 'source-file', 'disposition'],
    normalizationNotes: 'Accept browser Reporting API objects, csp-report envelopes, or a compact array of violation records.'
  },

];

export const productionSignalKpis: ProductionSignalKpi[] = [
  {
    id: 'gsc-high-impression-low-ctr',
    label: 'High-impression queries with weak CTR',
    source: 'google-search-console',
    severity: 'high',
    target: 'Review queries with at least 100 impressions and CTR below 2%.',
    actionWhenMissed: 'Rewrite title/meta description only after confirming the query maps to the page intent.'
  },
  {
    id: 'gsc-striking-distance',
    label: 'Queries ranking in positions 4-20',
    source: 'google-search-console',
    severity: 'medium',
    target: 'Identify queries with average position from 4 through 20 and route them to the best canonical page.',
    actionWhenMissed: 'Strengthen internal links, visible evidence, examples, or page intro; do not create duplicate intent pages.'
  },
  {
    id: 'psi-mobile-cwv',
    label: 'Mobile Core Web Vitals record',
    source: 'pagespeed-insights',
    severity: 'record-only',
    target: 'Record LCP, INP, CLS, performance score, and third-party warnings for priority pages.',
    actionWhenMissed: 'Treat missing PSI data as an incomplete release artifact, not as a pass.'
  },
  {
    id: 'rich-results-parseable',
    label: 'Rendered JSON-LD parseability',
    source: 'rich-results-test',
    severity: 'high',
    target: 'Rendered HTML should parse Organization, WebSite, WebPage, BreadcrumbList, and page-specific Article or WebApplication nodes.',
    actionWhenMissed: 'Fix rendered JSON-LD graph before adding more schema types.'
  },

  {
    id: 'optimization-action-candidates-reviewed',
    label: 'Optimization action candidates are evidence-backed',
    source: 'google-search-console',
    severity: 'medium',
    target: 'Every metadata, internal-link, or content evidence action should reference a generated production signal candidate and matching canonical page intent.',
    actionWhenMissed: 'Keep the page unchanged and collect more production data instead of guessing.'
  },
  {
    id: 'csp-report-clean',
    label: 'CSP report-only readiness',
    source: 'csp-report-only',
    severity: 'record-only',
    target: 'No unexpected first-party asset, AdSense, image, frame, or connect violations before enforcing CSP.',
    actionWhenMissed: 'Keep CSP report-only and update the source allowlist with verified production destinations.'
  }
];

export const searchIntentBuckets: SearchIntentBucket[] = [
  {
    id: 'generic-cut-list',
    label: 'Generic cut-list optimizer intent',
    queryPatterns: ['cut list optimizer', 'cutlist optimizer', 'cut optimizer', 'cutting list optimizer'],
    preferredCanonicalSlugs: ['/', '/sheet-cutting-optimizer', '/linear-cutting-optimizer'],
    decisionRule: 'Keep the homepage as the broad intent page, then route sheet or straight-stock modifiers to the specialized pages.'
  },
  {
    id: 'sheet-goods',
    label: 'Sheet goods and panel layout intent',
    queryPatterns: ['sheet cutting optimizer', 'plywood cutting layout', '4x8 plywood cut list', 'mdf sheet cut calculator', 'melamine cut list'],
    preferredCanonicalSlugs: ['/sheet-cutting-optimizer', '/plywood-cutting-layout-calculator', '/4x8-plywood-cut-list-optimizer', '/mdf-sheet-cut-calculator', '/melamine-cut-list-optimizer'],
    decisionRule: 'Route material-specific queries to preset pages; keep generic rectangular sheet queries on /sheet-cutting-optimizer.'
  },
  {
    id: 'linear-stock',
    label: 'Linear stock cutting intent',
    queryPatterns: ['linear cutting optimizer', 'pipe cutting optimizer', 'tube cut list', 'lumber length cutting', 'rebar cutting optimizer'],
    preferredCanonicalSlugs: ['/linear-cutting-optimizer', '/pvc-pipe-cutting-optimizer', '/steel-tube-cutting-optimizer', '/lumber-length-cutting-optimizer', '/rebar-cutting-optimizer'],
    decisionRule: 'Route material-specific straight-stock queries to preset pages; keep general length-packing terms on /linear-cutting-optimizer.'
  },
  {
    id: 'kerf-fit',
    label: 'Kerf, fit, and waste explanation intent',
    queryPatterns: ['saw kerf calculator', 'how to account for saw kerf', 'why two 24 inch panels do not fit', 'reduce plywood waste'],
    preferredCanonicalSlugs: ['/saw-kerf-calculator', '/how-to-account-for-saw-kerf', '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', '/reduce-plywood-waste'],
    decisionRule: 'Use explanatory pages when the query is educational; keep calculator pages for direct measurement or fit checks.'
  },
  {
    id: 'trust-methodology',
    label: 'Methodology, verification, and governance intent',
    queryPatterns: ['cut list optimization methodology', 'stockcut site map', 'seo release checklist', 'content inventory'],
    preferredCanonicalSlugs: ['/cut-list-optimization-methodology', '/site-map', '/seo-quality', '/seo-release-checklist', '/seo-production-signals'],
    decisionRule: 'Use governance pages for citation, release verification, and algorithm-boundary questions rather than adding commercial landing pages.'
  }
];

export const productionSignalDecisionRules = [
  'Do not create a new landing page from one query export unless the query has sustained impressions and does not fit an existing canonical page.',
  'Prefer strengthening the best matching canonical page before adding another programmatic variant.',
  'Treat CTR changes as directional unless impressions are stable enough for comparison.',
  'Keep legal, governance, and machine-readable pages indexable only when they help transparency, citation, or release verification.',
  'Use PageSpeed and Rich Results as production measurements; source-only checks can only prove readiness, not real-world pass status.',
  'Keep CSP report-only until production violations are reviewed after AdSense and crawler traffic are present.'
];

const coreSignalSlugs = new Set(['/', '/sheet-cutting-optimizer', '/linear-cutting-optimizer', '/4x8-plywood-cut-list-optimizer', '/how-to-account-for-saw-kerf', '/cut-list-optimization-methodology']);
const governanceSignalSlugs = new Set(['/site-map', '/seo-quality', '/seo-release-checklist', '/seo-production-signals']);

export function productionSignalPageTargets(): ProductionSignalPageTarget[] {
  return canonicalPages.map((page: SeoPage) => {
    const cluster = clusterForPage(page);
    const evidence = evidenceForPage(page);
    return {
      slug: page.slug,
      url: pageUrl(page.slug),
      title: page.title,
      intentCluster: cluster ? cluster.id : null,
      primaryQuery: page.primaryQuery ?? null,
      relatedCanonicalUrls: relatedPagesFor(page, 5).map((related) => pageUrl(related.slug)),
      evidenceSummary: evidence.citationSummary,
      signalPriority: coreSignalSlugs.has(page.slug) ? 'core' : governanceSignalSlugs.has(page.slug) ? 'governance' : 'supporting',
      reviewSignals: [
        'query impressions and CTR',
        'average position movement',
        'canonical page fit',
        'PageSpeed mobile/desktop metrics',
        'structured-data parseability'
      ]
    };
  });
}

export function productionSignalPayloadTemplate() {
  return {
    site: siteUrl,
    lastModified: siteLastModified,
    status: 'no production metrics are embedded in source; import Search Console, PageSpeed, Rich Results, crawl, and CSP observations after deployment',
    inputs: productionSignalInputFormats,
    kpis: productionSignalKpis,
    intentBuckets: searchIntentBuckets,
    decisionRules: productionSignalDecisionRules,
    priorityPages: productionSignalPageTargets().filter((page) => page.signalPriority !== 'supporting')
  };
}

export function productionSignalSummary() {
  const pageTargets = productionSignalPageTargets();
  return {
    sourceCount: productionSignalSources.length,
    inputFormatCount: productionSignalInputFormats.length,
    kpiCount: productionSignalKpis.length,
    intentBucketCount: searchIntentBuckets.length,
    pageTargetCount: pageTargets.length,
    corePageTargetCount: pageTargets.filter((page) => page.signalPriority === 'core').length,
    governancePageTargetCount: pageTargets.filter((page) => page.signalPriority === 'governance').length,
    supportingPageTargetCount: pageTargets.filter((page) => page.signalPriority === 'supporting').length
  };
}
