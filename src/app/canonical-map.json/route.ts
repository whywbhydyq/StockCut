import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { allPageQualityRecords, canonicalAliasMap, qualityGateSummary } from '@/data/seoQualityGates';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const body = {
    name: `${siteName} canonical map`,
    url: `${siteUrl}/canonical-map.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable map of canonical URLs, legacy redirect aliases, and expected indexability behavior for StockCut.',
    canonicalPolicy: {
      canonicalPages: 'Indexable, followable, included in sitemap.xml, feed.xml, site-index.json, content-inventory.json, and llms indexes.',
      aliasPages: 'Permanent redirect only; not included in sitemap.xml, feed.xml, or canonical inventories.',
      selfCanonical: 'Each canonical HTML page should render metadata pointing to its own canonical URL.'
    },
    summary: qualityGateSummary(),
    canonicalCount: canonicalPages.length,
    aliasRedirectCount: redirectAliases.length,
    canonicalPages: allPageQualityRecords().map((page) => ({
      slug: page.slug,
      url: page.url,
      title: page.title,
      kind: page.kind,
      indexability: {
        robots: page.robotsExpected,
        sitemapExpected: page.sitemapExpected,
        feedExpected: page.feedExpected,
        canonicalExpected: page.canonicalExpected
      },
      aliases: page.aliases,
      schemaTypes: page.schemaTypes,
      evidenceScope: page.evidenceScope,
      relatedCanonicalPages: page.relatedCanonicalPages
    })),
    aliasRedirects: redirectAliases.map((alias) => ({
      sourcePath: alias.source,
      source: `${siteUrl}${alias.source}`,
      destinationPath: alias.destination,
      destination: `${siteUrl}${alias.destination}`,
      permanent: alias.permanent,
      expectedStatus: 308
    })),
    canonicalAliasMap: canonicalAliasMap()
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
