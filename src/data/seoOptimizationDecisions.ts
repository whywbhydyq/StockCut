import { canonicalPages, siteUrl, type SeoPage } from '@/data/pages';
import { evidenceForPage } from '@/data/pageEvidence';
import { clusterForPage, pageUrl, relatedPagesFor } from '@/data/seoIntentClusters';
import { productionSignalKpis, productionSignalPageTargets, searchIntentBuckets } from '@/data/seoProductionSignals';
import { siteLastModified } from '@/data/siteMeta';

export type OptimizationDecisionArea = 'metadata' | 'internal-links' | 'content-evidence' | 'performance' | 'structured-data' | 'csp' | 'indexing';
export type OptimizationDecisionSeverity = 'blocking' | 'high' | 'medium' | 'record-only';
export type OptimizationActionType = 'rewrite-title-description' | 'strengthen-internal-links' | 'add-visible-evidence' | 'fix-schema-rendering' | 'investigate-performance' | 'keep-csp-report-only' | 'enforce-csp' | 'request-indexing' | 'no-change';

export interface OptimizationDecisionGate {
  id: string;
  area: OptimizationDecisionArea;
  label: string;
  severity: OptimizationDecisionSeverity;
  requiredSignals: string[];
  threshold: string;
  allowedActions: OptimizationActionType[];
  blockedActions: string[];
  evidenceRequiredBeforeChange: string;
}

export interface OptimizationActionPolicy {
  action: OptimizationActionType;
  whenAllowed: string;
  requiredInputs: string[];
  outputArtifact: string;
  rollbackSignal: string;
}

export interface CspReadinessCheck {
  id: string;
  label: string;
  status: 'must-observe' | 'must-pass-before-enforce' | 'source-declared';
  requiredEvidence: string;
  blockingFailure: string;
}

export interface PageOptimizationDecisionRecord {
  slug: string;
  url: string;
  title: string;
  intentCluster: string | null;
  signalPriority: 'core' | 'supporting' | 'governance';
  primaryQuery: string | null;
  relatedCanonicalUrls: string[];
  visibleEvidence: string;
  allowedOptimizationActions: OptimizationActionType[];
  blockedWithoutProductionSignals: string[];
}

export const optimizationDecisionGates: OptimizationDecisionGate[] = [
  {
    id: 'metadata-rewrite-requires-stable-query-evidence',
    area: 'metadata',
    label: 'Title and description rewrites require stable query evidence',
    severity: 'high',
    requiredSignals: ['Search Console query export', 'Search Console page export', 'canonical page intent match'],
    threshold: 'At least 100 impressions and CTR below 2% for a query that clearly maps to the canonical page, or a sustained position 4-20 opportunity with stable intent.',
    allowedActions: ['rewrite-title-description'],
    blockedActions: ['Do not rewrite metadata because a keyword sounds attractive without GSC evidence.', 'Do not create another near-duplicate landing page for the same query cluster.'],
    evidenceRequiredBeforeChange: 'Attach the query, page URL, impressions, CTR, position, and matching intent bucket in the production signal summary.'
  },
  {
    id: 'internal-link-strengthening-before-page-sprawl',
    area: 'internal-links',
    label: 'Strengthen internal links before creating new pages',
    severity: 'medium',
    requiredSignals: ['Search Console striking-distance query', 'matching intent bucket', 'existing canonical page with related evidence'],
    threshold: 'Average position 4-20 with at least 50 impressions, and the query belongs to an existing intent bucket.',
    allowedActions: ['strengthen-internal-links', 'add-visible-evidence'],
    blockedActions: ['Do not add a new programmatic page until existing canonical coverage is proven insufficient.'],
    evidenceRequiredBeforeChange: 'Record the target canonical page, related pages to link from, and page evidence gap being strengthened.'
  },
  {
    id: 'schema-fixes-before-schema-expansion',
    area: 'structured-data',
    label: 'Fix rendered structured-data errors before expanding schema',
    severity: 'high',
    requiredSignals: ['Rich Results rendered production validation', 'JSON-LD detected types', 'error/warning notes'],
    threshold: 'Any rendered production JSON-LD parse error blocks additional schema expansion.',
    allowedActions: ['fix-schema-rendering'],
    blockedActions: ['Do not add FAQPage, HowTo, Product, or Review markup as a growth tactic without content and eligibility evidence.'],
    evidenceRequiredBeforeChange: 'Store the failing URL, detected types, and rendered validation error in the production signal summary.'
  },
  {
    id: 'performance-work-requires-deployed-measurement',
    area: 'performance',
    label: 'Performance work requires deployed PageSpeed/CWV measurement',
    severity: 'record-only',
    requiredSignals: ['PageSpeed mobile JSON', 'PageSpeed desktop JSON', 'production URL crawl result'],
    threshold: 'Prioritize pages with poor mobile score, LCP/INP/CLS warnings, or third-party script diagnostics in real deployed measurements.',
    allowedActions: ['investigate-performance'],
    blockedActions: ['Do not claim CWV pass/fail from local source checks or from missing PSI data.'],
    evidenceRequiredBeforeChange: 'Record the measured URL, strategy, score, LCP, INP, CLS, and third-party diagnostics.'
  },
  {
    id: 'csp-enforcement-requires-clean-report-only-window',
    area: 'csp',
    label: 'CSP enforcement requires a clean report-only observation window',
    severity: 'blocking',
    requiredSignals: ['CSP report-only logs', 'production crawl headers', 'AdSense route verification'],
    threshold: 'No unexpected first-party, AdSense, image, frame, script, style, or connect violations after live traffic and ad loading have been observed.',
    allowedActions: ['keep-csp-report-only', 'enforce-csp'],
    blockedActions: ['Do not switch to enforced CSP from source policy alone.'],
    evidenceRequiredBeforeChange: 'Record report-only violation counts by directive and list any new third-party destinations before enforcement.'
  },
  {
    id: 'indexing-actions-require-url-inspection-context',
    area: 'indexing',
    label: 'Indexing actions require URL inspection context',
    severity: 'medium',
    requiredSignals: ['Search Console URL Inspection', 'sitemap submission status', 'canonical map'],
    threshold: 'Use request-indexing for canonical pages after sitemap submission, rendered validation, and canonical identity are confirmed.',
    allowedActions: ['request-indexing'],
    blockedActions: ['Do not request indexing for redirect aliases, JSON endpoints that do not need SERP inclusion, or duplicated intent pages.'],
    evidenceRequiredBeforeChange: 'Record inspected URL, Google-selected canonical if available, crawl status, and sitemap inclusion status.'
  }
];

export const optimizationActionPolicies: OptimizationActionPolicy[] = [
  {
    action: 'rewrite-title-description',
    whenAllowed: 'A real query/page export shows high impressions with weak CTR or sustained striking-distance ranking and the query maps to the page intent.',
    requiredInputs: ['GSC query CSV', 'GSC page CSV', 'intent bucket match', 'current metadata'],
    outputArtifact: '.seo-cache/production-signals-summary.json metadata action candidate',
    rollbackSignal: 'CTR falls or query/page fit worsens over the next comparable 28-day period.'
  },
  {
    action: 'strengthen-internal-links',
    whenAllowed: 'A query ranks 4-20 and the best canonical page already exists but needs stronger related-page support.',
    requiredInputs: ['GSC query or page row', 'related canonical pages', 'page evidence gap'],
    outputArtifact: 'tracked internal-link candidate tied to source and destination pages',
    rollbackSignal: 'No improvement after sufficient impressions, or Search Console shows a different canonical page receiving the query.'
  },
  {
    action: 'add-visible-evidence',
    whenAllowed: 'A page receives impressions for boundary, methodology, kerf, fit, export, or verification queries not yet answered visibly enough.',
    requiredInputs: ['query evidence', 'page evidence panel', 'content inventory record'],
    outputArtifact: 'visible evidence copy plus matching content-inventory and JSON-LD updates',
    rollbackSignal: 'The added evidence duplicates another page or dilutes the primary calculator intent.'
  },
  {
    action: 'fix-schema-rendering',
    whenAllowed: 'Rendered Rich Results or structured-data validation reports parse errors or conflicting entity identity.',
    requiredInputs: ['rendered production URL', 'detected schema types', 'validation errors'],
    outputArtifact: 'schema fix tied to the failing rendered URL',
    rollbackSignal: 'Rich Results still fails or introduces unsupported schema types.'
  },
  {
    action: 'investigate-performance',
    whenAllowed: 'PageSpeed or CrUX data shows a deployed regression, poor mobile score, or unstable third-party impact.',
    requiredInputs: ['PageSpeed mobile JSON', 'PageSpeed desktop JSON', 'affected URL'],
    outputArtifact: 'performance investigation record scoped to measured URLs',
    rollbackSignal: 'Measured metrics regress after the change.'
  },
  {
    action: 'keep-csp-report-only',
    whenAllowed: 'Any unknown report-only violation exists or ad/asset traffic has not been observed yet.',
    requiredInputs: ['CSP report-only logs', 'production crawl headers'],
    outputArtifact: 'CSP readiness state remains report-only',
    rollbackSignal: 'N/A; this is the safe default.'
  },
  {
    action: 'enforce-csp',
    whenAllowed: 'Report-only data is clean across first-party app traffic, AdSense, images, fonts, frames, and connect destinations.',
    requiredInputs: ['clean report-only window', 'known third-party allowlist', 'rollback plan'],
    outputArtifact: 'CSP enforcing policy change with monitoring window',
    rollbackSignal: 'Any production asset, ad, frame, script, or connect request is blocked unexpectedly.'
  }
];

export const cspReadinessChecks: CspReadinessCheck[] = [
  {
    id: 'report-only-header-present',
    label: 'Report-only CSP header is present in production',
    status: 'source-declared',
    requiredEvidence: 'Production crawl confirms Content-Security-Policy-Report-Only is returned on HTML responses.',
    blockingFailure: 'Missing report-only header means enforcement readiness cannot be evaluated.'
  },
  {
    id: 'adsense-observed-cleanly',
    label: 'AdSense traffic observed without unexpected blocks',
    status: 'must-pass-before-enforce',
    requiredEvidence: 'Report-only logs or browser console checks show no unexpected AdSense script, frame, image, or connect violations on calculator pages.',
    blockingFailure: 'Any unknown pagead, doubleclick, googlesyndication, googleusercontent, image, frame, or connect violation keeps CSP in report-only mode.'
  },
  {
    id: 'first-party-assets-clean',
    label: 'First-party scripts, styles, images, manifest, and worker assets are clean',
    status: 'must-pass-before-enforce',
    requiredEvidence: 'Production navigation across homepage, tool pages, governance pages, icons, manifest, and service worker produces no first-party CSP report-only violations.',
    blockingFailure: 'Any blocked first-party asset would break the app if CSP were enforced.'
  },
  {
    id: 'connect-and-frame-destinations-reviewed',
    label: 'Connect and frame destinations are reviewed',
    status: 'must-observe',
    requiredEvidence: 'Known destinations are documented before switching from report-only to enforced CSP.',
    blockingFailure: 'Unknown connect-src or frame-src reports indicate the allowlist is incomplete.'
  },
  {
    id: 'rollback-plan-documented',
    label: 'CSP rollback plan is documented',
    status: 'must-pass-before-enforce',
    requiredEvidence: 'The release checklist records how to revert to report-only if production blocks are observed.',
    blockingFailure: 'No rollback path means CSP should not be enforced.'
  }
];

export const optimizationDecisionInputTemplate = {
  generatedAt: 'replace-with-analysis-timestamp',
  sources: ['Search Console query CSV', 'Search Console page CSV', 'PageSpeed JSON', 'Rich Results notes', 'production crawl output', 'CSP report-only logs'],
  actionCandidates: [
    {
      action: 'rewrite-title-description',
      url: `${siteUrl}/sheet-cutting-optimizer`,
      sourceSignal: 'example only; replace with real GSC row',
      minimumEvidence: '100+ impressions, CTR < 2%, clear intent match, no duplicate canonical page',
      status: 'candidate | blocked | shipped | rolled-back'
    }
  ],
  cspReadiness: {
    recommendation: 'keep-report-only | enforce-after-clean-window',
    unexpectedViolationCount: 0,
    blockedBy: ['replace with report-only findings']
  }
};

function actionListForPage(page: SeoPage): OptimizationActionType[] {
  if (page.kind === 'legal') return ['no-change'];
  if (page.kind === 'about') return ['add-visible-evidence', 'request-indexing'];
  if (page.slug.includes('seo-')) return ['no-change', 'request-indexing'];
  if (page.kind === 'guide') return ['rewrite-title-description', 'strengthen-internal-links', 'add-visible-evidence', 'request-indexing'];
  return ['rewrite-title-description', 'strengthen-internal-links', 'add-visible-evidence', 'investigate-performance', 'request-indexing'];
}

export function pageOptimizationDecisionRecords(): PageOptimizationDecisionRecord[] {
  const productionTargets = new Map(productionSignalPageTargets().map((target) => [target.slug, target]));
  return canonicalPages.map((page) => {
    const target = productionTargets.get(page.slug);
    const cluster = clusterForPage(page);
    const evidence = evidenceForPage(page);
    return {
      slug: page.slug,
      url: pageUrl(page.slug),
      title: page.title,
      intentCluster: cluster ? cluster.id : null,
      signalPriority: target?.signalPriority ?? 'supporting',
      primaryQuery: page.primaryQuery ?? null,
      relatedCanonicalUrls: relatedPagesFor(page, 5).map((related) => pageUrl(related.slug)),
      visibleEvidence: evidence.citationSummary,
      allowedOptimizationActions: actionListForPage(page),
      blockedWithoutProductionSignals: [
        'metadata rewrites',
        'new programmatic pages',
        'CSP enforcement',
        'claims of Core Web Vitals pass/fail'
      ]
    };
  });
}

export function cspReadinessSummary() {
  return {
    status: 'report-only-until-production-logs-are-clean',
    checkCount: cspReadinessChecks.length,
    mustPassBeforeEnforce: cspReadinessChecks.filter((check) => check.status === 'must-pass-before-enforce').length,
    mustObserve: cspReadinessChecks.filter((check) => check.status === 'must-observe').length,
    sourceDeclared: cspReadinessChecks.filter((check) => check.status === 'source-declared').length,
    defaultAction: 'keep-csp-report-only'
  };
}

export function optimizationDecisionSummary() {
  const records = pageOptimizationDecisionRecords();
  return {
    lastModified: siteLastModified,
    gateCount: optimizationDecisionGates.length,
    actionPolicyCount: optimizationActionPolicies.length,
    cspReadinessCheckCount: cspReadinessChecks.length,
    pageDecisionRecordCount: records.length,
    coreDecisionRecordCount: records.filter((record) => record.signalPriority === 'core').length,
    governanceDecisionRecordCount: records.filter((record) => record.signalPriority === 'governance').length,
    productionKpiCount: productionSignalKpis.length,
    intentBucketCount: searchIntentBuckets.length
  };
}
