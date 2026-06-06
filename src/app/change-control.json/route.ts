import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { seoChangeControlPageRecords, seoChangeControlRules, seoChangeControlSummary, seoChangeControlWorkflow, seoChangeManifestExample } from '@/data/seoChangeControl';
import { seoAutomationPolicy } from '@/data/seoGovernance';

export const dynamic = 'force-static';

export function GET() {
  const body = {
    name: `${siteName} SEO change control`,
    url: `${siteUrl}/change-control.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable gate for evidence-backed SEO changes. It prevents title, description, internal-link, visible evidence, structured-data, performance, indexing, or CSP changes from shipping without a matching production-signal action candidate.',
    status: 'source-declared change-control policy; run scripts/check-seo-change-control.mjs with a proposed change manifest before shipping production-signal-backed SEO changes',
    summary: seoChangeControlSummary(),
    rules: seoChangeControlRules,
    workflow: seoChangeControlWorkflow,
    pageRecords: seoChangeControlPageRecords(),
    proposedChangeManifestExample: seoChangeManifestExample,
    seoAutomationPolicy,
    localGate: {
      command: 'node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json',
      oneCommandGate: 'npm run seo:local-gates',
      proposedChangeTemplate: 'npm run seo:change-template',
      archiveCommand: 'node scripts/archive-seo-signal-run.mjs',
      automationConsistencyScript: seoAutomationPolicy.automationConsistencyScript,
      offlineSkillScript: seoAutomationPolicy.offlineSkillCommand,
      sourceDriftBaselineScript: seoAutomationPolicy.sourceDriftBaselineCommand,
      sourceDriftCompareScript: seoAutomationPolicy.sourceDriftCompareCommand,
      ciWorkflow: seoAutomationPolicy.ciWorkflowPath,
      noChangeBehavior: 'If no proposed change manifest exists, the script exits successfully and records that no SEO action was requested.',
      blockingBehavior: 'If a proposed metadata, internal-link, evidence, schema, performance, indexing, or CSP change lacks a matching optimizationActionCandidate, the script reports the change as blocked.'
    }
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
