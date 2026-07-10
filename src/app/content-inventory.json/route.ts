import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { canonicalPages, siteUrl } from '@/data/pages';
import { clusterForPage, pageUrl, relatedPagesFor } from '@/data/seoIntentClusters';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { evidenceForPage, pageAboutTerms, pageMentions } from '@/data/pageEvidence';
import { governanceSummary, seoAutomationPolicy } from '@/data/seoGovernance';
import { pageQualityRecord, qualityGateSummary } from '@/data/seoQualityGates';
import { contentDriftFingerprints, releaseCheckSummary } from '@/data/seoReleaseChecks';
import { productionSignalPageTargets, productionSignalSummary } from '@/data/seoProductionSignals';
import { optimizationDecisionSummary, pageOptimizationDecisionRecords } from '@/data/seoOptimizationDecisions';
import { evidenceLedgerSummary, pageEvidenceLedgerRecords } from '@/data/seoEvidenceLedger';
import { seoChangeControlPageRecords, seoChangeControlSummary } from '@/data/seoChangeControl';

export const dynamic = 'force-static';

function schemaTypesForKind(kind: string) {
  if (kind === 'guide') return ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'CreativeWork'];
  if (kind === 'legal' || kind === 'about') return ['Organization', 'WebSite', 'WebPage', 'WebApplication', 'BreadcrumbList', 'CreativeWork'];
  return ['Organization', 'WebSite', 'WebPage', 'WebApplication', 'BreadcrumbList', 'CreativeWork'];
}

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const governance = governanceSummary();
  const body = {
    name: `${siteName} content inventory`,
    url: `${siteUrl}/content-inventory.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable governance inventory for canonical StockCut pages, intent clusters, evidence notes, boundaries, related links, and schema coverage.',
    canonicalPageCount: canonicalPages.length,
    governanceEndpoints: governance.machineReadableIndexes,
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
    seoProductionSignals: `${siteUrl}/seo-production-signals`,
    qualityGateSummary: qualityGateSummary(),
    releaseCheckSummary: releaseCheckSummary(),
    productionSignalSummary: productionSignalSummary(),
    optimizationDecisionSummary: optimizationDecisionSummary(),
    evidenceLedgerSummary: evidenceLedgerSummary(),
    seoChangeControlSummary: seoChangeControlSummary(),
    seoAutomationPolicy,
    crawlVerificationTargets: governance.crawlVerificationTargets,
    contentDriftFingerprints: contentDriftFingerprints().map((item) => ({ slug: item.slug, url: item.url, fingerprint: item.fingerprint })),
    productionSignalTargets: productionSignalPageTargets().map((item) => ({ slug: item.slug, url: item.url, signalPriority: item.signalPriority, primaryQuery: item.primaryQuery })),
    optimizationDecisionTargets: pageOptimizationDecisionRecords().map((item) => ({ slug: item.slug, url: item.url, signalPriority: item.signalPriority, allowedOptimizationActions: item.allowedOptimizationActions })),
    evidenceLedgerTargets: pageEvidenceLedgerRecords().map((item) => ({ slug: item.slug, url: item.url, currentDecisionState: item.currentDecisionState, requiredEvidenceSources: item.requiredEvidenceSources })),
    changeControlTargets: seoChangeControlPageRecords().map((item) => ({ slug: item.slug, url: item.url, defaultDecision: item.defaultDecision, allowedActionsAfterCandidate: item.allowedActionsAfterCandidate })),
    pages: canonicalPages.map((page) => {
      const cluster = clusterForPage(page);
      const evidence = evidenceForPage(page);
      return {
        slug: page.slug,
        url: pageUrl(page.slug),
        title: page.title,
        description: page.description,
        kind: page.kind,
        intentCluster: cluster ? { id: cluster.id, label: cluster.label, whenToUse: cluster.whenToUse } : null,
        primaryQuery: page.primaryQuery ?? null,
        contentRole: page.contentRole ?? null,
        about: pageAboutTerms(page),
        mentions: pageMentions(page),
        evidence: {
          scopeLabel: evidence.scopeLabel,
          calculationScope: evidence.calculationScope,
          sourceOfTruth: evidence.sourceOfTruth,
          verificationChecklist: evidence.verificationChecklist,
          boundaries: evidence.boundaries,
          exportFormats: evidence.exportFormats,
          privacyNote: evidence.privacyNote,
          citationSummary: evidence.citationSummary
        },
        relatedCanonicalPages: relatedPagesFor(page, 6).map((related) => ({
          slug: related.slug,
          url: pageUrl(related.slug),
          title: related.title
        })),
        schemaTypes: schemaTypesForKind(page.kind),
        qualityGateCoverage: pageQualityRecord(page),
        lastModified: siteLastModified
      };
    })
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
