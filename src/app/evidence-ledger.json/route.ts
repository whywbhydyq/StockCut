import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { evidenceFileSpecs, evidenceLedgerSummary, evidenceWorkflowSteps, pageEvidenceLedgerRecords } from '@/data/seoEvidenceLedger';
import { optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { seoChangeControlSummary } from '@/data/seoChangeControl';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { seoAutomationPolicy } from '@/data/seoGovernance';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const body = {
    name: `${siteName} SEO evidence ledger`,
    url: `${siteUrl}/evidence-ledger.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable evidence ledger that maps production signal files to allowed SEO optimization actions and blocks blind metadata, internal-link, schema, performance, indexing, or CSP changes until verified production evidence exists.',
    status: 'source-declared evidence requirements; raw Search Console, PageSpeed, CSP, and Bing exports remain local unless intentionally published as aggregated summaries',
    summary: evidenceLedgerSummary(),
    productionSignalSummary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    changeControl: `${siteUrl}/change-control.json`,
    signalFiles: evidenceFileSpecs,
    workflow: evidenceWorkflowSteps,
    pageLedger: pageEvidenceLedgerRecords(),
    seoAutomationPolicy,
    localVerification: {
      signalShapeScript: 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json',
      analysisScript: 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json',
      changeControlScript: 'node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json',
      localGateScript: 'npm run seo:local-gates',
      proposedChangeTemplateScript: 'npm run seo:change-template',
      archiveScript: 'node scripts/archive-seo-signal-run.mjs',
      automationConsistencyScript: seoAutomationPolicy.automationConsistencyScript,
      offlineSkillScript: seoAutomationPolicy.offlineSkillCommand,
      sourceDriftBaselineScript: seoAutomationPolicy.sourceDriftBaselineCommand,
      sourceDriftCompareScript: seoAutomationPolicy.sourceDriftCompareCommand,
      ciWorkflow: seoAutomationPolicy.ciWorkflowPath,
      defaultInputDirectory: 'seo-signals',
      defaultVerificationOutput: '.seo-cache/seo-signal-files-verification.json',
      defaultAnalysisOutput: '.seo-cache/production-signals-summary.json'
    }
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
