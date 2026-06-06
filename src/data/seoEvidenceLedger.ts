import { canonicalPages, siteUrl, type SeoPage } from '@/data/pages';
import { evidenceForPage } from '@/data/pageEvidence';
import { clusterForPage, pageUrl, relatedPagesFor } from '@/data/seoIntentClusters';
import { pageOptimizationDecisionRecords, type OptimizationActionType } from '@/data/seoOptimizationDecisions';
import { productionSignalKpis, productionSignalPageTargets, searchIntentBuckets } from '@/data/seoProductionSignals';
import { siteLastModified } from '@/data/siteMeta';

export type EvidenceSourceId = 'gsc-query-export' | 'gsc-page-export' | 'pagespeed-mobile' | 'pagespeed-desktop' | 'rich-results' | 'production-crawl' | 'csp-report-only' | 'bing-webmaster-tools';
export type EvidenceStatus = 'missing' | 'collected' | 'stale' | 'insufficient' | 'ready-for-review';
export type EvidenceDecisionState = 'blocked-missing-signals' | 'ready-to-analyze' | 'ready-for-manual-review' | 'safe-no-change';

export interface EvidenceFileSpec {
  id: EvidenceSourceId;
  fileName: string;
  format: 'csv' | 'json';
  requiredFor: OptimizationActionType[];
  expectedFields: string[];
  freshnessDays: number;
  privacyClassification: 'private-export' | 'public-crawl' | 'aggregated-summary';
  acceptanceRule: string;
}

export interface EvidenceLedgerRecord {
  slug: string;
  url: string;
  title: string;
  intentCluster: string | null;
  primaryQuery: string | null;
  signalPriority: 'core' | 'supporting' | 'governance';
  requiredEvidenceSources: EvidenceSourceId[];
  allowedActionsAfterEvidence: OptimizationActionType[];
  blockedActionsUntilEvidence: OptimizationActionType[];
  currentDecisionState: EvidenceDecisionState;
  visibleEvidenceSummary: string;
  relatedCanonicalPages: string[];
}

export interface EvidenceWorkflowStep {
  id: string;
  label: string;
  commandOrSource: string;
  output: string;
  blocks: string[];
}

export const evidenceFileSpecs: EvidenceFileSpec[] = [
  {
    id: 'gsc-query-export',
    fileName: 'search-console-queries.csv',
    format: 'csv',
    requiredFor: ['rewrite-title-description', 'strengthen-internal-links', 'add-visible-evidence', 'request-indexing'],
    expectedFields: ['Query', 'Page', 'Clicks', 'Impressions', 'CTR', 'Position'],
    freshnessDays: 35,
    privacyClassification: 'private-export',
    acceptanceRule: 'Export from Search Console performance data for the deployed property. Keep raw query rows out of git.'
  },
  {
    id: 'gsc-page-export',
    fileName: 'gsc-pages.csv',
    format: 'csv',
    requiredFor: ['rewrite-title-description', 'strengthen-internal-links', 'request-indexing'],
    expectedFields: ['Page', 'Clicks', 'Impressions', 'CTR', 'Position'],
    freshnessDays: 35,
    privacyClassification: 'private-export',
    acceptanceRule: 'Use page-level Search Console export to confirm that the intended canonical page receives the query cluster.'
  },
  {
    id: 'pagespeed-mobile',
    fileName: 'pagespeed-mobile.json',
    format: 'json',
    requiredFor: ['investigate-performance'],
    expectedFields: ['lighthouseResult', 'loadingExperience'],
    freshnessDays: 14,
    privacyClassification: 'public-crawl',
    acceptanceRule: 'Use deployed mobile PageSpeed JSON only; local source checks are not Core Web Vitals evidence.'
  },
  {
    id: 'pagespeed-desktop',
    fileName: 'pagespeed-desktop.json',
    format: 'json',
    requiredFor: ['investigate-performance'],
    expectedFields: ['lighthouseResult'],
    freshnessDays: 14,
    privacyClassification: 'public-crawl',
    acceptanceRule: 'Pair desktop JSON with mobile data to separate third-party script issues from mobile-only constraints.'
  },
  {
    id: 'rich-results',
    fileName: 'rich-results.json',
    format: 'json',
    requiredFor: ['fix-schema-rendering'],
    expectedFields: ['url', 'detectedTypes', 'errors', 'warnings'],
    freshnessDays: 30,
    privacyClassification: 'public-crawl',
    acceptanceRule: 'Use rendered production validation notes. Do not expand schema while parse errors remain.'
  },
  {
    id: 'production-crawl',
    fileName: 'production-crawl.json',
    format: 'json',
    requiredFor: ['request-indexing', 'fix-schema-rendering'],
    expectedFields: ['url', 'status', 'canonical', 'headers', 'jsonLdTypes'],
    freshnessDays: 14,
    privacyClassification: 'public-crawl',
    acceptanceRule: 'Confirm canonical 200 pages, alias 308 redirects, headers, and JSON-LD before requesting indexing.'
  },
  {
    id: 'csp-report-only',
    fileName: 'csp-reports.json',
    format: 'json',
    requiredFor: ['keep-csp-report-only', 'enforce-csp'],
    expectedFields: ['directive', 'blockedUri', 'documentUri', 'count'],
    freshnessDays: 14,
    privacyClassification: 'private-export',
    acceptanceRule: 'CSP stays report-only unless report-only logs are clean across calculator, AdSense, image, frame, connect, and static asset traffic.'
  },
  {
    id: 'bing-webmaster-tools',
    fileName: 'bing-indexing.csv',
    format: 'csv',
    requiredFor: ['request-indexing'],
    expectedFields: ['URL', 'Clicks', 'Impressions', 'CTR', 'Position'],
    freshnessDays: 45,
    privacyClassification: 'private-export',
    acceptanceRule: 'Use Bing as a secondary indexability and query-discovery signal; do not let it override Search Console canonical evidence.'
  }
];

export const evidenceWorkflowSteps: EvidenceWorkflowStep[] = [
  {
    id: 'collect-production-exports',
    label: 'Collect production exports',
    commandOrSource: 'Search Console, PageSpeed Insights, Rich Results Test, Bing Webmaster Tools, CSP report-only logs, and production crawl output',
    output: 'seo-signals/* files matching /evidence-ledger.json file specs',
    blocks: ['metadata rewrites', 'CSP enforcement', 'performance claims']
  },
  {
    id: 'verify-signal-files',
    label: 'Verify signal file shape before analysis',
    commandOrSource: 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json',
    output: '.seo-cache/seo-signal-files-verification.json',
    blocks: ['running analysis on malformed exports']
  },
  {
    id: 'analyze-production-signals',
    label: 'Generate candidate actions from verified inputs',
    commandOrSource: 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json',
    output: '.seo-cache/production-signals-summary.json',
    blocks: ['manual SEO edits without an action candidate']
  },
  {
    id: 'review-candidate-actions',
    label: 'Review action candidates against decision gates',
    commandOrSource: '/optimization-decisions.json and /csp-readiness.json',
    output: 'accepted, rejected, or deferred candidate list in release notes',
    blocks: ['blind title, description, internal-link, Schema, or CSP changes']
  }
];

function sourcesForPage(page: SeoPage): EvidenceSourceId[] {
  if (page.slug.includes('seo-') || page.kind === 'legal' || page.kind === 'about') {
    return ['production-crawl', 'gsc-page-export'];
  }
  if (page.kind === 'guide') {
    return ['gsc-query-export', 'gsc-page-export', 'rich-results', 'production-crawl'];
  }
  return ['gsc-query-export', 'gsc-page-export', 'pagespeed-mobile', 'pagespeed-desktop', 'rich-results', 'production-crawl'];
}

function blockedActionsForPage(page: SeoPage, actions: OptimizationActionType[]): OptimizationActionType[] {
  if (page.slug.includes('seo-') || page.kind === 'legal') return actions.filter((action) => action !== 'request-indexing' && action !== 'no-change');
  return actions.filter((action) => action !== 'no-change');
}

export function pageEvidenceLedgerRecords(): EvidenceLedgerRecord[] {
  const targetMap = new Map(productionSignalPageTargets().map((target) => [target.slug, target]));
  const decisionMap = new Map(pageOptimizationDecisionRecords().map((record) => [record.slug, record]));
  return canonicalPages.map((page) => {
    const cluster = clusterForPage(page);
    const evidence = evidenceForPage(page);
    const decisionRecord = decisionMap.get(page.slug);
    const actions = decisionRecord?.allowedOptimizationActions ?? ['no-change'];
    const signalPriority = targetMap.get(page.slug)?.signalPriority ?? 'supporting';
    return {
      slug: page.slug,
      url: pageUrl(page.slug),
      title: page.title,
      intentCluster: cluster ? cluster.id : null,
      primaryQuery: page.primaryQuery ?? null,
      signalPriority,
      requiredEvidenceSources: sourcesForPage(page),
      allowedActionsAfterEvidence: actions,
      blockedActionsUntilEvidence: blockedActionsForPage(page, actions),
      currentDecisionState: actions.length === 1 && actions[0] === 'no-change' ? 'safe-no-change' : 'blocked-missing-signals',
      visibleEvidenceSummary: evidence.citationSummary,
      relatedCanonicalPages: relatedPagesFor(page, 5).map((related) => pageUrl(related.slug))
    } satisfies EvidenceLedgerRecord;
  });
}

export function evidenceLedgerSummary() {
  const records = pageEvidenceLedgerRecords();
  const requiredSourceIds = new Set(records.flatMap((record) => record.requiredEvidenceSources));
  return {
    lastModified: siteLastModified,
    expectedSignalFileCount: evidenceFileSpecs.length,
    workflowStepCount: evidenceWorkflowSteps.length,
    pageLedgerRecordCount: records.length,
    coreRecordCount: records.filter((record) => record.signalPriority === 'core').length,
    blockedPendingSignalCount: records.filter((record) => record.currentDecisionState === 'blocked-missing-signals').length,
    requiredEvidenceSourceCount: requiredSourceIds.size,
    productionKpiCount: productionSignalKpis.length,
    intentBucketCount: searchIntentBuckets.length,
    defaultPolicy: 'Do not ship metadata, internal-link, schema, performance, indexing, or CSP changes unless the required signal files verify and produce an accepted action candidate.',
    evidenceLedgerUrl: `${siteUrl}/evidence-ledger.json`,
    humanReadablePage: `${siteUrl}/seo-evidence-ledger`
  };
}
