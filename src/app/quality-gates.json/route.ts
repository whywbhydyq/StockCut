import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { governanceSummary } from '@/data/seoGovernance';
import { allPageQualityRecords, canonicalAliasMap, manualProductionChecks, qualityGateSummary, seoQualityGateGroups } from '@/data/seoQualityGates';
import { releaseCheckSummary } from '@/data/seoReleaseChecks';
import { optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { evidenceLedgerSummary } from '@/data/seoEvidenceLedger';
import { seoChangeControlSummary } from '@/data/seoChangeControl';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const governance = governanceSummary();
  const body = {
    name: `${siteName} SEO quality gates`,
    url: `${siteUrl}/quality-gates.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable release gate checklist for StockCut SEO, GEO, indexability, redirects, schema, visible evidence, security, performance, and ad-policy hygiene.',
    status: 'source-declared; production-only gates must be verified on the deployed Vercel URL after each release',
    summary: qualityGateSummary(),
    releaseCheckSummary: releaseCheckSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    optimizationDecisions: `${siteUrl}/optimization-decisions.json`,
    evidenceLedger: `${siteUrl}/evidence-ledger.json`,
    changeControl: `${siteUrl}/change-control.json`,
    cspReadiness: `${siteUrl}/csp-readiness.json`,
    releaseChecklist: `${siteUrl}/release-checklist.json`,
    contentDrift: `${siteUrl}/content-drift.json`,
    counts: {
      canonicalPages: canonicalPages.length,
      redirectAliases: redirectAliases.length,
      machineReadableIndexes: governance.machineReadableIndexes.length,
      expectedSecurityHeaders: governance.expectedSecurityHeaders.length
    },
    gateGroups: seoQualityGateGroups,
    manualProductionChecks,
    canonicalAliasMap: canonicalAliasMap(),
    pageCoverage: allPageQualityRecords(),
    relatedGovernanceEndpoints: governance.machineReadableIndexes,
    skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse during this execution']
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
