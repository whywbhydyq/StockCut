import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { seoIntentClusters } from '@/data/seoIntentClusters';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { governanceSummary, seoAutomationPolicy } from '@/data/seoGovernance';
import { manualProductionChecks, qualityGateSummary } from '@/data/seoQualityGates';
import { releaseCheckSummary } from '@/data/seoReleaseChecks';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { cspReadinessSummary, optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { evidenceLedgerSummary } from '@/data/seoEvidenceLedger';
import { seoChangeControlSummary } from '@/data/seoChangeControl';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const governance = governanceSummary();
  const body = {
    name: `${siteName} SEO status`,
    url: `${siteUrl}/seo-status.json`,
    lastModified: siteLastModified,
    purpose: 'Public verification checklist for production SEO, crawlability, headers, assets, redirects, and AI/search index endpoints.',
    status: 'source-declared; verify deployed HTTP status, headers, redirects, and rendered HTML in production after each release',
    counts: {
      canonicalPages: canonicalPages.length,
      redirectAliases: redirectAliases.length,
      intentClusters: seoIntentClusters.length,
      machineReadableIndexes: governance.machineReadableIndexes.length,
      publicAssets: governance.publicAssetChecklist.length
    },
    verification: {
      allowedLocalCommands: ['npm run typecheck', 'node scripts/validate-site.mjs', 'npm audit --omit=dev --json', 'npm audit --json', 'npm run seo:local-gates', 'npm run seo:automation-check'],
      skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'Lighthouse in this local execution environment'],
      productionChecks: [
        'Each canonical page returns HTTP 200 with a self-canonical URL.',
        'Each legacy alias returns a permanent redirect to its canonical destination.',
        'robots.txt declares the XML sitemap and allows listed public crawlers.',
        'sitemap.xml contains canonical pages only, not alias paths.',
        'feed.xml contains canonical pages only, not alias paths.',
        'JSON-LD parses without FAQPage spam or conflicting page identity.',
        'Security headers are present on HTML and machine-readable endpoints.',
        'CSP remains report-only until AdSense and analytics violations are clean.'
      ],
      crawlTargets: governance.crawlVerificationTargets,
      expectedSecurityHeaders: governance.expectedSecurityHeaders,
      publicAssets: governance.publicAssetChecklist,
      qualityGateSummary: qualityGateSummary(),
      releaseCheckSummary: releaseCheckSummary(),
      productionSignalSummary: productionSignalSummary(),
      optimizationDecisionSummary: optimizationDecisionSummary(),
      evidenceLedgerSummary: evidenceLedgerSummary(),
      seoChangeControlSummary: seoChangeControlSummary(),
      cspReadinessSummary: cspReadinessSummary(),
      releaseChecklist: `${siteUrl}/release-checklist.json`,
      contentDrift: `${siteUrl}/content-drift.json`,
      manualProductionChecks,
      seoAutomationPolicy
    },
    indexingPolicy: governance.indexingPolicy,
    canonicalMap: `${siteUrl}/canonical-map.json`,
    qualityGates: `${siteUrl}/quality-gates.json`,
    releaseChecklist: `${siteUrl}/release-checklist.json`,
    contentDrift: `${siteUrl}/content-drift.json`,
    productionSignals: `${siteUrl}/production-signals.json`,
    evidenceLedger: `${siteUrl}/evidence-ledger.json`,
    changeControl: `${siteUrl}/change-control.json`,
    seoChangeControl: `${siteUrl}/seo-change-control`,
    optimizationDecisions: `${siteUrl}/optimization-decisions.json`,
    cspReadiness: `${siteUrl}/csp-readiness.json`,
    seoOptimizationDecisions: `${siteUrl}/seo-optimization-decisions`,
    seoEvidenceLedger: `${siteUrl}/seo-evidence-ledger`,
    seoQuality: `${siteUrl}/seo-quality`,
    seoReleaseChecklist: `${siteUrl}/seo-release-checklist`,
    seoProductionSignals: `${siteUrl}/seo-production-signals`,
    machineReadableIndexes: governance.machineReadableIndexes,
    publicCrawlerAgents: governance.publicCrawlerAgents
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
