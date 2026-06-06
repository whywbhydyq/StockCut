import { canonicalPages, siteUrl } from '@/data/pages';
import { evidenceFileSpecs, evidenceLedgerSummary, pageEvidenceLedgerRecords, type EvidenceSourceId } from '@/data/seoEvidenceLedger';
import { optimizationActionPolicies, optimizationDecisionGates, optimizationDecisionSummary, type OptimizationActionType } from '@/data/seoOptimizationDecisions';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { siteLastModified } from '@/data/siteMeta';

export type SeoChangeSurface = 'metadata' | 'visible-content' | 'internal-links' | 'structured-data' | 'performance' | 'csp' | 'indexing' | 'governance';
export type SeoChangeControlState = 'blocked-without-candidate' | 'allowed-after-candidate-review' | 'record-only';

export interface SeoChangeControlRule {
  id: string;
  surface: SeoChangeSurface;
  label: string;
  state: SeoChangeControlState;
  requiredActionCandidates: OptimizationActionType[];
  requiredEvidenceSources: EvidenceSourceId[];
  protectedFiles: string[];
  approvalRecord: string;
  blockedWithout: string;
}

export interface SeoChangeControlWorkflowStep {
  id: string;
  label: string;
  commandOrArtifact: string;
  passCondition: string;
}

export interface SeoChangeManifestExample {
  action: OptimizationActionType;
  url: string;
  decisionGate: string;
  candidateLabel: string;
  sourceEvidence: string[];
  filesChanged: string[];
  reviewerNote: string;
}

const filesForSurface: Record<SeoChangeSurface, string[]> = {
  metadata: ['src/data/pages.ts', 'src/app/**/page.tsx', 'src/app/layout.tsx'],
  'visible-content': ['src/data/guideContent.ts', 'src/data/pageEvidence.ts', 'src/components/page/**', 'src/components/home/**'],
  'internal-links': ['src/data/seoIntentClusters.ts', 'src/components/page/IntentNavigation.tsx', 'src/components/home/HomeSupportSections.tsx'],
  'structured-data': ['src/data/siteMeta.ts', 'src/components/page/PageShell.tsx', 'src/app/page.tsx', 'src/app/**/page.tsx'],
  performance: ['src/components/**', 'src/core/**', 'next.config.ts', 'public/sw.js'],
  csp: ['next.config.ts', 'src/data/seoGovernance.ts', 'src/data/seoOptimizationDecisions.ts'],
  indexing: ['src/app/sitemap.ts', 'src/app/robots.ts', 'src/data/pages.ts', 'src/data/seoQualityGates.ts'],
  governance: ['src/data/seo*.ts', 'src/app/*json/route.ts', 'scripts/*.mjs']
};

export const seoChangeControlRules: SeoChangeControlRule[] = [
  {
    id: 'metadata-change-control',
    surface: 'metadata',
    label: 'Metadata and SERP copy changes require GSC-backed candidates',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['rewrite-title-description'],
    requiredEvidenceSources: ['gsc-query-export', 'gsc-page-export'],
    protectedFiles: filesForSurface.metadata,
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted metadata record',
    blockedWithout: 'Do not change page titles, descriptions, or primary query targeting without a matching optimizationActionCandidate from real Search Console data.'
  },
  {
    id: 'internal-link-change-control',
    surface: 'internal-links',
    label: 'Internal-link strengthening requires a striking-distance candidate',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['strengthen-internal-links', 'add-visible-evidence'],
    requiredEvidenceSources: ['gsc-query-export', 'gsc-page-export'],
    protectedFiles: filesForSurface['internal-links'],
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted internal-link record',
    blockedWithout: 'Do not add links or new intent routes only because a keyword appears related; require a query/page candidate and existing canonical fit.'
  },
  {
    id: 'visible-evidence-change-control',
    surface: 'visible-content',
    label: 'Visible evidence additions require query or validation evidence',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['add-visible-evidence', 'fix-schema-rendering'],
    requiredEvidenceSources: ['gsc-query-export', 'rich-results', 'production-crawl'],
    protectedFiles: filesForSurface['visible-content'],
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted visible-evidence record',
    blockedWithout: 'Do not add explanatory blocks that dilute calculator intent unless a production signal identifies the missing evidence.'
  },
  {
    id: 'schema-change-control',
    surface: 'structured-data',
    label: 'Structured-data edits require rendered validation evidence',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['fix-schema-rendering'],
    requiredEvidenceSources: ['rich-results', 'production-crawl'],
    protectedFiles: filesForSurface['structured-data'],
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted schema record',
    blockedWithout: 'Fix rendered JSON-LD errors before adding schema coverage. Do not add FAQPage, Product, Review, or HowTo markup as a growth shortcut.'
  },
  {
    id: 'performance-change-control',
    surface: 'performance',
    label: 'Performance work requires deployed PageSpeed evidence',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['investigate-performance'],
    requiredEvidenceSources: ['pagespeed-mobile', 'pagespeed-desktop', 'production-crawl'],
    protectedFiles: filesForSurface.performance,
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted performance record',
    blockedWithout: 'Do not claim CWV improvements or change ad/loading behavior from source inspection alone.'
  },
  {
    id: 'csp-change-control',
    surface: 'csp',
    label: 'CSP enforcement requires clean report-only evidence',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['enforce-csp'],
    requiredEvidenceSources: ['csp-report-only', 'production-crawl'],
    protectedFiles: filesForSurface.csp,
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted CSP enforcement record',
    blockedWithout: 'Keep Content-Security-Policy in report-only mode until clean production report-only logs exist and rollback is documented.'
  },
  {
    id: 'indexing-change-control',
    surface: 'indexing',
    label: 'Indexing requests require canonical and sitemap evidence',
    state: 'blocked-without-candidate',
    requiredActionCandidates: ['request-indexing'],
    requiredEvidenceSources: ['production-crawl', 'gsc-page-export', 'bing-webmaster-tools'],
    protectedFiles: filesForSurface.indexing,
    approvalRecord: '.seo-cache/seo-change-control-report.json accepted indexing record',
    blockedWithout: 'Do not request indexing for redirects, duplicate-intent pages, or non-SERP JSON endpoints.'
  },
  {
    id: 'governance-change-control',
    surface: 'governance',
    label: 'Governance-only changes stay record-only but must not mutate page targeting',
    state: 'record-only',
    requiredActionCandidates: ['no-change'],
    requiredEvidenceSources: [],
    protectedFiles: filesForSurface.governance,
    approvalRecord: 'Local static validation and release notes',
    blockedWithout: 'Governance endpoints may be updated without production signal candidates only when they do not change user-facing page intent, metadata, schema claims, CSP enforcement, or indexing policy.'
  }
];

export const seoChangeControlWorkflow: SeoChangeControlWorkflowStep[] = [
  {
    id: 'verify-signal-files',
    label: 'Verify production signal file shape',
    commandOrArtifact: 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json',
    passCondition: 'Required signal files for the intended action have valid shape.'
  },
  {
    id: 'analyze-signal-files',
    label: 'Generate optimization action candidates',
    commandOrArtifact: 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json',
    passCondition: 'The summary contains optimizationActionCandidates for the intended action and URL/query context.'
  },
  {
    id: 'prepare-change-manifest',
    label: 'Prepare proposed SEO change manifest',
    commandOrArtifact: '.seo-cache/proposed-seo-changes.json',
    passCondition: 'Every proposed change references an action candidate, decision gate, source evidence, changed files, and reviewer note.'
  },
  {
    id: 'run-change-control',
    label: 'Run change-control gate',
    commandOrArtifact: 'node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json',
    passCondition: 'The report has zero blocked changes before metadata, internal-link, schema, performance, indexing, or CSP changes ship.'
  },
  {
    id: 'run-source-validation',
    label: 'Run allowed local source validation',
    commandOrArtifact: 'npm run typecheck && node scripts/validate-site.mjs && npm audit --omit=dev --json && npm audit --json',
    passCondition: 'Local source validation passes while build and tests remain skipped by execution policy.'
  }
];

export const seoChangeManifestExample: SeoChangeManifestExample[] = [
  {
    action: 'rewrite-title-description',
    url: `${siteUrl}/sheet-cutting-optimizer`,
    decisionGate: 'metadata-rewrite-requires-stable-query-evidence',
    candidateLabel: 'sheet cutting optimizer',
    sourceEvidence: ['search-console-queries.csv', 'gsc-pages.csv'],
    filesChanged: ['src/data/pages.ts'],
    reviewerNote: 'Example only. Replace with a real optimizationActionCandidate label and matching GSC evidence before making metadata edits.'
  }
];

export function seoChangeControlPageRecords() {
  const evidenceRecords = new Map(pageEvidenceLedgerRecords().map((record) => [record.slug, record]));
  return canonicalPages.map((page) => {
    const evidence = evidenceRecords.get(page.slug);
    const allowedActions = evidence?.allowedActionsAfterEvidence ?? ['no-change'];
    return {
      slug: page.slug,
      url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`,
      title: page.title,
      signalPriority: evidence?.signalPriority ?? 'supporting',
      allowedActionsAfterCandidate: allowedActions,
      requiredEvidenceSources: evidence?.requiredEvidenceSources ?? [],
      defaultDecision: allowedActions.length === 1 && allowedActions[0] === 'no-change' ? 'record-only' : 'blocked-without-candidate',
      changeControlRules: seoChangeControlRules.filter((rule) => allowedActions.some((action) => rule.requiredActionCandidates.includes(action)) || rule.state === 'record-only').map((rule) => rule.id)
    };
  });
}

export function seoChangeControlSummary() {
  const pageRecords = seoChangeControlPageRecords();
  const protectedSurfaces = new Set(seoChangeControlRules.map((rule) => rule.surface));
  const candidateActions = new Set(seoChangeControlRules.flatMap((rule) => rule.requiredActionCandidates));
  return {
    lastModified: siteLastModified,
    ruleCount: seoChangeControlRules.length,
    workflowStepCount: seoChangeControlWorkflow.length,
    protectedSurfaceCount: protectedSurfaces.size,
    candidateActionCount: candidateActions.size,
    pageRecordCount: pageRecords.length,
    blockedByDefaultCount: pageRecords.filter((record) => record.defaultDecision === 'blocked-without-candidate').length,
    evidenceFileCount: evidenceFileSpecs.length,
    optimizationGateCount: optimizationDecisionGates.length,
    actionPolicyCount: optimizationActionPolicies.length,
    productionSignalSummary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    changeControlUrl: `${siteUrl}/change-control.json`,
    humanReadablePage: `${siteUrl}/seo-change-control`,
    defaultPolicy: 'No metadata, internal-link, visible-evidence, structured-data, performance, indexing, or CSP enforcement change ships unless a verified production signal summary emits a matching optimizationActionCandidate and the change-control gate accepts the proposed change manifest.'
  };
}
