import { canonicalPages, redirectAliases, siteUrl, type PageKind, type SeoPage } from '@/data/pages';
import { evidenceForPage } from '@/data/pageEvidence';
import { pageUrl, priorityIndexPages, relatedPagesFor } from '@/data/seoIntentClusters';
import { crawlVerificationTargets, expectedSecurityHeaders, machineReadableIndexEntries, publicAssetChecklist } from '@/data/seoGovernance';
import { siteLastModified, siteName, siteOgImage } from '@/data/siteMeta';

export type ReleaseCheckGroupId = 'endpoints' | 'canonical-html' | 'redirects' | 'structured-data' | 'headers' | 'assets' | 'performance' | 'search-console' | 'production-signals' | 'evidence-ledger' | 'optimization-decisions';
export type ReleaseCheckExecution = 'automatable' | 'manual' | 'external-tool';
export type ReleaseCheckSeverity = 'blocking' | 'high' | 'medium' | 'record-only';

export interface ReleaseCheck {
  id: string;
  label: string;
  execution: ReleaseCheckExecution;
  severity: ReleaseCheckSeverity;
  expected: string;
  sourceOfTruth: string;
}

export interface ReleaseCheckGroup {
  id: ReleaseCheckGroupId;
  label: string;
  summary: string;
  checks: ReleaseCheck[];
}

export interface ProductionEndpointCheck {
  path: string;
  url: string;
  expectedStatus: number;
  expectedContentType: string;
  cacheExpectation: string;
  indexability: 'indexable' | 'machine-readable' | 'policy' | 'asset';
}

export interface CanonicalHtmlCheck {
  slug: string;
  url: string;
  title: string;
  kind: PageKind;
  expectedStatus: 200;
  expectedCanonical: string;
  expectedOgImage: string;
  expectedJsonLdTypes: string[];
  relatedCanonicalSamples: string[];
}

export interface RedirectCheckSample {
  sourcePath: string;
  sourceUrl: string;
  destinationPath: string;
  destinationUrl: string;
  expectedStatus: 308;
}

export interface ContentDriftFingerprint {
  slug: string;
  url: string;
  kind: PageKind;
  fingerprint: string;
  sourceFields: string[];
  relatedCanonicalCount: number;
  evidenceBoundaryCount: number;
  verificationCheckCount: number;
}

export const releaseCheckGroups: ReleaseCheckGroup[] = [
  {
    id: 'endpoints',
    label: 'Machine-readable endpoints',
    summary: 'Public JSON, XML, TXT, and policy endpoints should resolve with expected status, content type, and cache behavior after deploy.',
    checks: [
      {
        id: 'governance-endpoints-return-200',
        label: 'Governance endpoints return HTTP 200',
        execution: 'automatable',
        severity: 'blocking',
        expected: 'Every endpoint listed in machineReadableIndexEntries returns HTTP 200 on the production host.',
        sourceOfTruth: 'src/data/seoGovernance.ts and deployed responses'
      },
      {
        id: 'content-types-match-index',
        label: 'Content types match the declared endpoint index',
        execution: 'automatable',
        severity: 'high',
        expected: 'XML, RSS, JSON, and text routes return matching Content-Type headers.',
        sourceOfTruth: 'route handlers and deployed responses'
      }
    ]
  },
  {
    id: 'canonical-html',
    label: 'Canonical HTML pages',
    summary: 'Canonical pages should render stable metadata, OG/Twitter assets, JSON-LD graphs, related links, and evidence panels.',
    checks: [
      {
        id: 'canonical-html-self-identity',
        label: 'Canonical pages expose self identity',
        execution: 'automatable',
        severity: 'blocking',
        expected: 'Sampled canonical pages return 200, include a self-canonical link, and do not emit noindex.',
        sourceOfTruth: 'rendered production HTML'
      },
      {
        id: 'json-ld-graph-present',
        label: 'Structured data graph is present',
        execution: 'external-tool',
        severity: 'high',
        expected: 'Rich Results Test can parse Organization, WebSite, WebPage, BreadcrumbList, and page-specific Article or WebApplication nodes.',
        sourceOfTruth: 'Google Rich Results Test and rendered HTML'
      }
    ]
  },
  {
    id: 'redirects',
    label: 'Permanent redirect behavior',
    summary: 'Legacy alias URLs should remain permanent redirects and should not appear in indexable inventories.',
    checks: [
      {
        id: 'alias-samples-redirect-permanently',
        label: 'Alias samples redirect permanently',
        execution: 'automatable',
        severity: 'blocking',
        expected: 'Sampled alias URLs return 308 or another permanent redirect code to the documented canonical URL.',
        sourceOfTruth: 'src/data/pages.ts and deployed responses'
      }
    ]
  },
  {
    id: 'structured-data',
    label: 'Schema and citation consistency',
    summary: 'Machine-readable summaries, visible evidence panels, and JSON-LD should describe the same page scope and limitations.',
    checks: [
      {
        id: 'content-inventory-matches-pages',
        label: 'Content inventory covers every canonical page',
        execution: 'automatable',
        severity: 'high',
        expected: 'content-inventory.json page count equals canonicalPages length and includes evidence/citation summaries.',
        sourceOfTruth: 'src/app/content-inventory.json/route.ts'
      },
      {
        id: 'content-drift-snapshot-stable',
        label: 'Content drift snapshot is available',
        execution: 'automatable',
        severity: 'medium',
        expected: 'content-drift.json exposes deterministic fingerprints for canonical page identity, evidence, and related-link inputs.',
        sourceOfTruth: 'src/app/content-drift.json/route.ts'
      }
    ]
  },
  {
    id: 'headers',
    label: 'Security and crawl headers',
    summary: 'Production responses should expose the header policy declared in source before CSP is switched from report-only to enforced.',
    checks: expectedSecurityHeaders.map((header) => ({
      id: `header-${header.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: `${header.key} response header`,
      execution: 'automatable' as const,
      severity: header.key === 'Content-Security-Policy-Report-Only' ? 'record-only' as const : 'high' as const,
      expected: header.expectedValue,
      sourceOfTruth: 'next.config.ts headers() and deployed HTTP responses'
    }))
  },
  {
    id: 'assets',
    label: 'Public assets and app metadata',
    summary: 'Icons, OG image, manifest, ads.txt, humans.txt, and security.txt should remain fetchable and referenced by metadata or governance endpoints.',
    checks: [
      {
        id: 'public-assets-return-success',
        label: 'Public assets return success responses',
        execution: 'automatable',
        severity: 'medium',
        expected: 'Every path in publicAssetChecklist is reachable on the deployed host.',
        sourceOfTruth: 'public/ assets and deployed responses'
      }
    ]
  },
  {
    id: 'performance',
    label: 'Performance recording',
    summary: 'Runtime performance must be measured on deployed pages, not inferred from source-only checks.',
    checks: [
      {
        id: 'pagespeed-core-pages-recorded',
        label: 'PageSpeed results recorded for core pages',
        execution: 'external-tool',
        severity: 'record-only',
        expected: 'Record LCP, INP, CLS, transfer size warnings, third-party script warnings, and mobile/desktop scores for the homepage and core calculators.',
        sourceOfTruth: 'PageSpeed Insights and Search Console Core Web Vitals'
      }
    ]
  },
  {
    id: 'search-console',
    label: 'Indexing and crawl follow-up',
    summary: 'Search Console and Bing Webmaster Tools should be updated after production deploy.',
    checks: [
      {
        id: 'sitemap-resubmitted',
        label: 'Sitemap resubmitted after release',
        execution: 'manual',
        severity: 'medium',
        expected: 'Submit sitemap.xml and request indexing for homepage, core tools, methodology, site map, and release checklist pages.',
        sourceOfTruth: 'Google Search Console and Bing Webmaster Tools'
      }
    ]
  },
  {
    id: 'production-signals',
    label: 'Production signal intake',
    summary: 'Real Search Console, PageSpeed, Rich Results, production crawl, Bing, and CSP observations should guide future SEO edits.',
    checks: [
      {
        id: 'production-signals-model-published',
        label: 'Production signal model is published',
        execution: 'automatable',
        severity: 'medium',
        expected: 'production-signals.json returns the declared signal sources, input formats, KPIs, intent buckets, and local analysis instructions.',
        sourceOfTruth: 'src/data/seoProductionSignals.ts and src/app/production-signals.json/route.ts'
      },
      {
        id: 'production-signals-import-reviewed',
        label: 'Production signal exports are reviewed before edits',
        execution: 'manual',
        severity: 'record-only',
        expected: 'Run scripts/analyze-production-signals.mjs on exported metrics before changing titles, descriptions, internal links, or adding pages.',
        sourceOfTruth: 'Search Console, PageSpeed Insights, Rich Results, Bing Webmaster Tools, production crawl, and CSP report-only observations'
      }
    ]
  },

  {
    id: 'evidence-ledger',
    label: 'Evidence ledger and signal-file shape verification',
    summary: 'Required production signal files should be verified before the analyzer emits candidate SEO actions.',
    checks: [
      {
        id: 'evidence-ledger-model-published',
        label: 'Evidence ledger model is published',
        execution: 'automatable',
        severity: 'medium',
        expected: 'evidence-ledger.json returns expected signal files, required fields, page ledger records, and local verification commands.',
        sourceOfTruth: 'src/data/seoEvidenceLedger.ts and src/app/evidence-ledger.json/route.ts'
      },
      {
        id: 'signal-file-shape-verified',
        label: 'Signal file shape is verified before analysis',
        execution: 'automatable',
        severity: 'high',
        expected: 'Run scripts/verify-seo-signal-files.mjs before scripts/analyze-production-signals.mjs so malformed exports do not create misleading action candidates.',
        sourceOfTruth: 'scripts/verify-seo-signal-files.mjs and seo-signals/README.md'
      }
    ]
  },

  {
    id: 'optimization-decisions',
    label: 'Optimization decision gates',
    summary: 'Metadata rewrites, internal-link edits, schema changes, indexing requests, performance work, and CSP enforcement should be backed by production signal evidence before release.',
    checks: [
      {
        id: 'optimization-decisions-model-published',
        label: 'Optimization decision model is published',
        execution: 'automatable',
        severity: 'medium',
        expected: 'optimization-decisions.json returns decision gates, action policies, page decision records, and the local analysis script reference.',
        sourceOfTruth: 'src/data/seoOptimizationDecisions.ts and src/app/optimization-decisions.json/route.ts'
      },
      {
        id: 'csp-readiness-remains-report-only-until-clean',
        label: 'CSP enforcement is blocked until report-only data is clean',
        execution: 'manual',
        severity: 'blocking',
        expected: 'csp-readiness.json documents must-pass checks and the release remains report-only until production report-only violations are reviewed.',
        sourceOfTruth: 'CSP report-only logs, production crawl headers, and src/app/csp-readiness.json/route.ts'
      }
    ]
  }

];

export function productionEndpointChecks(): ProductionEndpointCheck[] {
  const governanceEndpoints = machineReadableIndexEntries.map((endpoint) => ({
    path: endpoint.href,
    url: `${siteUrl}${endpoint.href}`,
    expectedStatus: 200,
    expectedContentType: endpoint.contentType,
    cacheExpectation: 'public cache header is acceptable for static governance endpoints',
    indexability: endpoint.href.endsWith('.json') || endpoint.href.endsWith('.txt') || endpoint.href.endsWith('.xml') ? 'machine-readable' as const : 'indexable' as const
  }));

  const assetEndpoints = publicAssetChecklist.map((path) => ({
    path,
    url: `${siteUrl}${path}`,
    expectedStatus: 200,
    expectedContentType: path.endsWith('.png') ? 'image/png' : path.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/plain',
    cacheExpectation: 'static asset caching is expected; verify stale assets after deploy only when changed',
    indexability: 'asset' as const
  }));

  return [...governanceEndpoints, ...assetEndpoints];
}

export function canonicalHtmlChecks(): CanonicalHtmlCheck[] {
  return priorityIndexPages().concat(canonicalPages.filter((page) => ['/site-map', '/seo-quality', '/seo-release-checklist', '/seo-production-signals', '/seo-optimization-decisions', '/seo-evidence-ledger'].includes(page.slug))).filter((page, index, pages) => pages.findIndex((item) => item.slug === page.slug) === index).map((page) => ({
    slug: page.slug,
    url: pageUrl(page.slug),
    title: page.title,
    kind: page.kind,
    expectedStatus: 200,
    expectedCanonical: pageUrl(page.slug),
    expectedOgImage: siteOgImage,
    expectedJsonLdTypes: page.kind === 'guide' ? ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'CreativeWork'] : ['Organization', 'WebSite', 'WebPage', 'WebApplication', 'BreadcrumbList', 'CreativeWork'],
    relatedCanonicalSamples: relatedPagesFor(page, 4).map((related) => pageUrl(related.slug))
  }));
}

export function redirectCheckSamples(limit = 12): RedirectCheckSample[] {
  const prioritySources = ['/tools/sheet-cutting-optimizer', '/tools/linear-cutting-optimizer', '/guides/cut-list-optimization-methodology', '/legal/privacy'];
  const prioritized = redirectAliases.filter((alias) => prioritySources.includes(alias.source));
  const rest = redirectAliases.filter((alias) => !prioritySources.includes(alias.source));
  return [...prioritized, ...rest].slice(0, limit).map((alias) => ({
    sourcePath: alias.source,
    sourceUrl: `${siteUrl}${alias.source}`,
    destinationPath: alias.destination,
    destinationUrl: `${siteUrl}${alias.destination}`,
    expectedStatus: 308
  }));
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function contentDriftFingerprints(): ContentDriftFingerprint[] {
  return canonicalPages.map((page) => {
    const evidence = evidenceForPage(page);
    const related = relatedPagesFor(page, 6);
    const sourcePayload = JSON.stringify({
      slug: page.slug,
      title: page.title,
      description: page.description,
      kind: page.kind,
      primaryQuery: page.primaryQuery ?? null,
      contentRole: page.contentRole ?? null,
      evidence,
      related: related.map((item) => item.slug)
    });
    return {
      slug: page.slug,
      url: pageUrl(page.slug),
      kind: page.kind,
      fingerprint: stableHash(sourcePayload),
      sourceFields: ['slug', 'title', 'description', 'kind', 'primaryQuery', 'contentRole', 'pageEvidence', 'relatedCanonicalPages'],
      relatedCanonicalCount: related.length,
      evidenceBoundaryCount: evidence.boundaries.length,
      verificationCheckCount: evidence.verificationChecklist.length
    };
  });
}

export function releaseCheckSummary() {
  const checks = releaseCheckGroups.flatMap((group) => group.checks);
  return {
    siteName,
    lastModified: siteLastModified,
    groupCount: releaseCheckGroups.length,
    checkCount: checks.length,
    automatableCheckCount: checks.filter((check) => check.execution === 'automatable').length,
    manualCheckCount: checks.filter((check) => check.execution === 'manual').length,
    externalToolCheckCount: checks.filter((check) => check.execution === 'external-tool').length,
    blockingCheckCount: checks.filter((check) => check.severity === 'blocking').length,
    endpointCheckCount: productionEndpointChecks().length,
    canonicalHtmlSampleCount: canonicalHtmlChecks().length,
    redirectSampleCount: redirectCheckSamples().length,
    contentDriftFingerprintCount: contentDriftFingerprints().length
  };
}
