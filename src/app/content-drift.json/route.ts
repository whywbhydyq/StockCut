import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { seoIntentClusters } from '@/data/seoIntentClusters';
import { machineReadableIndexEntries } from '@/data/seoGovernance';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { contentDriftFingerprints, releaseCheckSummary } from '@/data/seoReleaseChecks';
import { qualityGateSummary } from '@/data/seoQualityGates';

export const dynamic = 'force-static';

export function GET() {
  const body = {
    name: `${siteName} content drift snapshot`,
    url: `${siteUrl}/content-drift.json`,
    lastModified: siteLastModified,
    purpose: 'Deterministic source-declared fingerprints for canonical page identity, evidence notes, related-link inputs, and governance counts. Use after releases to notice unintended content or metadata drift.',
    counts: {
      canonicalPages: canonicalPages.length,
      redirectAliases: redirectAliases.length,
      intentClusters: seoIntentClusters.length,
      machineReadableEndpoints: machineReadableIndexEntries.length,
      qualityGateGroups: qualityGateSummary().groupCount,
      releaseCheckGroups: releaseCheckSummary().groupCount
    },
    driftPolicy: {
      expectedChange: 'Fingerprints may change when page titles, descriptions, page evidence, content roles, or related-link inputs intentionally change.',
      investigateWhen: 'Fingerprint changes without a release note, canonical count changes, alias count changes, or evidence/verification counts drop for a canonical page.',
      excludedSignals: 'Rendered bundle hashes, runtime ad output, Search Console data, and PageSpeed measurements are not included in this static snapshot.'
    },
    fingerprints: contentDriftFingerprints()
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
