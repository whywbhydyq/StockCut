import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { seoIntentClusters, pageUrl, clusterForPage, relatedPagesFor } from '@/data/seoIntentClusters';
import { evidenceForPage, pageAboutTerms } from '@/data/pageEvidence';
import { siteDescription, siteLastModified, siteName } from '@/data/siteMeta';
import { governanceSummary, seoAutomationPolicy } from '@/data/seoGovernance';
import { qualityGateSummary } from '@/data/seoQualityGates';
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
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    lastModified: siteLastModified,
    canonicalCount: canonicalPages.length,
    aliasRedirectCount: redirectAliases.length,
    localFirstPrivacy: 'Cut lists are processed in the browser. Autosave uses localStorage. Share links encode project data in the URL hash.',
    boundaries: [
      'Planning estimates only',
      'No CNC CAM or G-code output',
      'No polygon nesting or angle-cut geometry',
      'Verify stock, kerf, trim, defects, machine setup, and shop safety before cutting'
    ],
    humanReadableSiteMap: `${siteUrl}/site-map`,
    contentInventory: `${siteUrl}/content-inventory.json`,
    updateFeed: `${siteUrl}/feed.xml`,
    seoStatus: `${siteUrl}/seo-status.json`,
    canonicalMap: `${siteUrl}/canonical-map.json`,
    qualityGates: `${siteUrl}/quality-gates.json`,
    seoQuality: `${siteUrl}/seo-quality`,
    seoReleaseChecklist: `${siteUrl}/seo-release-checklist`,
    seoProductionSignals: `${siteUrl}/seo-production-signals`,
    releaseChecklist: `${siteUrl}/release-checklist.json`,
    contentDrift: `${siteUrl}/content-drift.json`,
    productionSignals: `${siteUrl}/production-signals.json`,
    evidenceLedger: `${siteUrl}/evidence-ledger.json`,
    seoEvidenceLedger: `${siteUrl}/seo-evidence-ledger`,
    changeControl: `${siteUrl}/change-control.json`,
    seoChangeControl: `${siteUrl}/seo-change-control`,
    optimizationDecisions: `${siteUrl}/optimization-decisions.json`,
    cspReadiness: `${siteUrl}/csp-readiness.json`,
    seoOptimizationDecisions: `${siteUrl}/seo-optimization-decisions`,
    qualityGateSummary: qualityGateSummary(),
    releaseCheckSummary: releaseCheckSummary(),
    productionSignalSummary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    cspReadinessSummary: cspReadinessSummary(),
    seoAutomationPolicy,
    humans: `${siteUrl}/humans.txt`,
    securityContact: `${siteUrl}/.well-known/security.txt`,
    machineReadableIndexes: governance.machineReadableIndexes.map((endpoint) => endpoint.url),
    publicAssetChecklist: governance.publicAssetChecklist,
    crawlVerificationTargets: governance.crawlVerificationTargets,
    expectedSecurityHeaders: governance.expectedSecurityHeaders,
    publicCrawlerAgents: governance.publicCrawlerAgents,
    intentClusters: seoIntentClusters.map((cluster) => ({
      id: cluster.id,
      label: cluster.label,
      summary: cluster.summary,
      whenToUse: cluster.whenToUse,
      primaryPages: cluster.primarySlugs.map((slug) => pageUrl(slug)),
      supportingPages: cluster.supportingSlugs.map((slug) => pageUrl(slug))
    })),
    canonicalPages: canonicalPages.map((page) => {
      const cluster = clusterForPage(page);
      const evidence = evidenceForPage(page);
      return {
        url: pageUrl(page.slug),
        slug: page.slug,
        title: page.title,
        description: page.description,
        kind: page.kind,
        intentCluster: cluster ? cluster.id : null,
        primaryQuery: page.primaryQuery ?? null,
        contentRole: page.contentRole ?? null,
        about: pageAboutTerms(page),
        citationSummary: evidence.citationSummary,
        relatedCanonicalPages: relatedPagesFor(page, 6).map((related) => pageUrl(related.slug))
      };
    }),
    aliases: redirectAliases.map((alias) => ({
      source: `${siteUrl}${alias.source}`,
      destination: `${siteUrl}${alias.destination}`,
      permanent: alias.permanent
    }))
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
