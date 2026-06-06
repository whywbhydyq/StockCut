import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import {
  cspReadinessSummary,
  optimizationActionPolicies,
  optimizationDecisionGates,
  optimizationDecisionInputTemplate,
  optimizationDecisionSummary,
  pageOptimizationDecisionRecords
} from '@/data/seoOptimizationDecisions';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { evidenceLedgerSummary, pageEvidenceLedgerRecords } from '@/data/seoEvidenceLedger';
import { seoChangeControlRules, seoChangeControlSummary } from '@/data/seoChangeControl';

export const dynamic = 'force-static';

export function GET() {
  const body = {
    name: `${siteName} SEO optimization decisions`,
    url: `${siteUrl}/optimization-decisions.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable decision model for turning real production SEO signals into tracked title, description, internal-link, schema, performance, indexing, and CSP actions without guessing or duplicating pages.',
    status: 'source-declared decision model; use real production signal exports and .seo-cache/production-signals-summary.json before making SEO changes',
    summary: optimizationDecisionSummary(),
    productionSignalSummary: productionSignalSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    cspReadiness: `${siteUrl}/csp-readiness.json`,
    evidenceLedger: `${siteUrl}/evidence-ledger.json`,
    changeControl: `${siteUrl}/change-control.json`,
    humanReadablePage: `${siteUrl}/seo-optimization-decisions`,
    gates: optimizationDecisionGates,
    actionPolicies: optimizationActionPolicies,
    pageDecisionRecords: pageOptimizationDecisionRecords(),
    pageEvidenceLedger: pageEvidenceLedgerRecords(),
    changeControlRules: seoChangeControlRules,
    inputTemplate: optimizationDecisionInputTemplate,
    localAnalysis: {
      signalShapeScript: 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json',
      script: 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json',
      expectedOutput: '.seo-cache/production-signals-summary.json',
      changeControlScript: 'node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json',
      decisionRule: 'Only ship an optimization action when the generated action candidate is backed by the required production signal evidence and the change-control report accepts the proposed change.'
    }
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
