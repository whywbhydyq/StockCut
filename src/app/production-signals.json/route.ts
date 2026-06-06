import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { evidenceFileSpecs, evidenceLedgerSummary } from '@/data/seoEvidenceLedger';
import { seoChangeControlSummary } from '@/data/seoChangeControl';
import { seoAutomationPolicy } from '@/data/seoGovernance';
import {
  productionSignalDecisionRules,
  productionSignalInputFormats,
  productionSignalKpis,
  productionSignalPageTargets,
  productionSignalPayloadTemplate,
  productionSignalSources,
  productionSignalSummary,
  searchIntentBuckets
} from '@/data/seoProductionSignals';

export const dynamic = 'force-static';

export function GET() {
  const body = {
    name: `${siteName} production signals plan`,
    url: `${siteUrl}/production-signals.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable intake plan for Search Console, PageSpeed, Rich Results, production crawl, Bing Webmaster Tools, and CSP report-only signals. This endpoint declares how real production data should drive SEO decisions without embedding private analytics data.',
    status: 'source-declared signal model; import real production exports after deployment and analyze them locally with scripts/analyze-production-signals.mjs',
    summary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    optimizationDecisions: `${siteUrl}/optimization-decisions.json`,
    evidenceLedger: `${siteUrl}/evidence-ledger.json`,
    changeControl: `${siteUrl}/change-control.json`,
    sources: productionSignalSources,
    inputFormats: productionSignalInputFormats,
    evidenceFileSpecs,
    kpis: productionSignalKpis,
    intentBuckets: searchIntentBuckets,
    decisionRules: productionSignalDecisionRules,
    pageTargets: productionSignalPageTargets(),
    importTemplate: productionSignalPayloadTemplate(),
    seoAutomationPolicy,
    localAnalysis: {
      signalShapeScript: 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json',
      script: 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json',
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
      defaultOutput: '.seo-cache/production-signals-summary.json',
      privacy: 'Keep Search Console and PageSpeed exports out of git unless intentionally publishing aggregated, non-sensitive summaries.'
    }
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
