import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { canonicalHtmlChecks, productionEndpointChecks, redirectCheckSamples, releaseCheckGroups, releaseCheckSummary } from '@/data/seoReleaseChecks';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { cspReadinessSummary, optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { evidenceLedgerSummary } from '@/data/seoEvidenceLedger';
import { seoChangeControlSummary } from '@/data/seoChangeControl';
import { manualProductionChecks } from '@/data/seoQualityGates';
import { seoAutomationPolicy } from '@/data/seoGovernance';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const body = {
    name: `${siteName} release checklist`,
    url: `${siteUrl}/release-checklist.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable production release checklist for SEO, GEO, canonical identity, redirects, headers, public assets, and external search validation.',
    status: 'source-declared; run production checks against the deployed Vercel Preview or Production host after each release',
    summary: releaseCheckSummary(),
    productionSignalSummary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    cspReadinessSummary: cspReadinessSummary(),
    checkGroups: releaseCheckGroups,
    productionEndpointChecks: productionEndpointChecks(),
    canonicalHtmlChecks: canonicalHtmlChecks(),
    redirectCheckSamples: redirectCheckSamples(),
    manualProductionChecks,
    seoAutomationPolicy,
    allowedLocalCommands: ['npm run typecheck', 'node scripts/validate-site.mjs', 'npm audit --omit=dev --json', 'npm audit --json', 'npm run seo:verify-signals', 'npm run seo:analyze-signals', 'npm run seo:change-control', 'npm run seo:local-gates', 'node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json', 'node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json', 'node scripts/check-seo-change-control.mjs --summary .seo-cache/production-signals-summary.json --verification .seo-cache/seo-signal-files-verification.json --changes .seo-cache/proposed-seo-changes.json --out .seo-cache/seo-change-control-report.json', 'node scripts/check-production-seo.mjs https://stockcut.ymirtool.com', 'node scripts/archive-seo-signal-run.mjs', 'npm run seo:automation-check', 'npm run seo:archive-run', 'npm run seo:offline-skills', 'npm run seo:drift-baseline', 'npm run seo:drift-compare'],
    skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse during this execution']
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
