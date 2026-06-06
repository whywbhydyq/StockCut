import { canonicalPages, redirectAliases, type PageKind, type SeoPage, siteUrl } from '@/data/pages';
import { evidenceForPage } from '@/data/pageEvidence';
import { clusterForPage, pageUrl, relatedPagesFor } from '@/data/seoIntentClusters';
import { expectedSecurityHeaders, machineReadableIndexEntries, publicAssetChecklist } from '@/data/seoGovernance';

export type SeoQualityGateArea = 'indexability' | 'redirects' | 'structured-data' | 'content-evidence' | 'machine-readability' | 'security' | 'performance' | 'ads-policy';
export type SeoQualityGateSeverity = 'blocking' | 'high' | 'medium' | 'manual';
export type SeoQualityGateCheckType = 'static' | 'production' | 'manual';

export interface SeoQualityGate {
  id: string;
  label: string;
  area: SeoQualityGateArea;
  severity: SeoQualityGateSeverity;
  checkType: SeoQualityGateCheckType;
  expected: string;
  sourceOfTruth: string;
}

export interface SeoQualityGateGroup {
  id: SeoQualityGateArea;
  label: string;
  summary: string;
  gates: SeoQualityGate[];
}

export interface PageQualityRecord {
  slug: string;
  url: string;
  title: string;
  description: string;
  kind: PageKind;
  canonicalExpected: true;
  sitemapExpected: true;
  feedExpected: true;
  robotsExpected: 'index, follow';
  aliases: string[];
  intentCluster: string | null;
  evidenceScope: string;
  schemaTypes: string[];
  relatedCanonicalPages: string[];
  localFirstPrivacy: string;
  qualitySignals: string[];
}

export const seoQualityGateGroups: SeoQualityGateGroup[] = [
  {
    id: 'indexability',
    label: 'Indexability and canonical identity',
    summary: 'Canonical pages should be the only URLs exposed in sitemap, RSS, canonical metadata, and machine-readable inventories.',
    gates: [
      {
        id: 'canonical-pages-only-in-sitemap',
        label: 'XML sitemap contains canonical pages only',
        area: 'indexability',
        severity: 'blocking',
        checkType: 'static',
        expected: 'Every sitemap URL maps to canonicalPages; redirectAliases never appear in sitemap output.',
        sourceOfTruth: 'src/app/sitemap.ts and src/data/pages.ts'
      },
      {
        id: 'canonical-pages-only-in-feed',
        label: 'RSS feed contains canonical pages only',
        area: 'indexability',
        severity: 'high',
        checkType: 'static',
        expected: 'feed.xml reads canonicalPages and does not read redirectAliases.',
        sourceOfTruth: 'src/app/feed.xml/route.ts'
      },
      {
        id: 'self-canonical-production-html',
        label: 'Production HTML exposes self-canonical URLs',
        area: 'indexability',
        severity: 'manual',
        checkType: 'production',
        expected: 'Each deployed canonical route returns HTTP 200 and a self-canonical URL in rendered metadata.',
        sourceOfTruth: 'Vercel Preview/Production rendered HTML'
      }
    ]
  },
  {
    id: 'redirects',
    label: 'Redirect hygiene',
    summary: 'Legacy /tools, /calculators, /guides, and /legal paths should resolve through permanent redirects without appearing as indexable pages.',
    gates: [
      {
        id: 'aliases-are-permanent',
        label: 'Aliases use permanent redirects',
        area: 'redirects',
        severity: 'blocking',
        checkType: 'static',
        expected: 'Every RedirectAlias has permanent: true and every alias route calls permanentRedirect().',
        sourceOfTruth: 'src/data/pages.ts and alias page.tsx files'
      },
      {
        id: 'aliases-target-canonical-slugs',
        label: 'Aliases target existing canonical slugs',
        area: 'redirects',
        severity: 'blocking',
        checkType: 'static',
        expected: 'Each redirect destination exists in canonicalPages.',
        sourceOfTruth: 'src/data/pages.ts'
      }
    ]
  },
  {
    id: 'structured-data',
    label: 'Structured data consistency',
    summary: 'Pages should expose consistent Organization, WebSite, WebPage, BreadcrumbList, and relevant Article/WebApplication schema without FAQ spam.',
    gates: [
      {
        id: 'no-faqpage-growth-hack',
        label: 'No unsupported FAQPage markup',
        area: 'structured-data',
        severity: 'high',
        checkType: 'static',
        expected: 'No generic calculator or guide page emits FAQPage schema solely for SERP expansion.',
        sourceOfTruth: 'src/app/page.tsx and src/components/page/PageShell.tsx'
      },
      {
        id: 'page-schema-about-mentions',
        label: 'Page schema includes about and mentions terms',
        area: 'structured-data',
        severity: 'medium',
        checkType: 'static',
        expected: 'Every canonical page JSON-LD has page-specific about/mentions/evidence nodes.',
        sourceOfTruth: 'src/data/pageEvidence.ts and PageShell JSON-LD'
      }
    ]
  },
  {
    id: 'content-evidence',
    label: 'Visible evidence and boundaries',
    summary: 'Each page should explain scope, source of truth, verification checks, export formats, privacy posture, and operational limits.',
    gates: [
      {
        id: 'visible-evidence-panel',
        label: 'Visible evidence panel mounted',
        area: 'content-evidence',
        severity: 'high',
        checkType: 'static',
        expected: 'Homepage, tool pages, guide pages, and policy pages render PageEvidencePanel.',
        sourceOfTruth: 'src/components/page/PageEvidencePanel.tsx and page templates'
      },
      {
        id: 'content-inventory-evidence',
        label: 'Machine-readable evidence inventory exists',
        area: 'content-evidence',
        severity: 'medium',
        checkType: 'static',
        expected: 'content-inventory.json exposes the same page evidence in machine-readable form.',
        sourceOfTruth: 'src/app/content-inventory.json/route.ts'
      }
    ]
  },
  {
    id: 'machine-readability',
    label: 'Machine-readable discovery',
    summary: 'Crawlers and AI answer engines should find canonical maps, content inventory, llms indexes, RSS, robots, sitemap, status, and quality gates.',
    gates: [
      {
        id: 'llms-indexes-governance-endpoints',
        label: 'LLM indexes list governance endpoints',
        area: 'machine-readability',
        severity: 'medium',
        checkType: 'static',
        expected: 'llms.txt and llms-full.txt link site-index, content-inventory, canonical-map, quality-gates, sitemap, RSS, and SEO status.',
        sourceOfTruth: 'src/app/llms.txt/route.ts and src/app/llms-full.txt/route.ts'
      },
      {
        id: 'canonical-map-published',
        label: 'Canonical/alias map published',
        area: 'machine-readability',
        severity: 'medium',
        checkType: 'static',
        expected: 'canonical-map.json exposes canonical URLs, aliases, and indexability expectations.',
        sourceOfTruth: 'src/app/canonical-map.json/route.ts'
      }
    ]
  },
  {
    id: 'security',
    label: 'Security headers and public policy files',
    summary: 'Production should expose expected security headers, humans.txt, security.txt, and a report-only CSP path before enforcement.',
    gates: [
      {
        id: 'expected-security-headers-present',
        label: 'Expected security headers present in production',
        area: 'security',
        severity: 'manual',
        checkType: 'production',
        expected: expectedSecurityHeaders.map((header) => header.key).join(', '),
        sourceOfTruth: 'next.config.ts headers() and deployed HTTP responses'
      },
      {
        id: 'public-policy-files',
        label: 'Public ownership and security policy files exist',
        area: 'security',
        severity: 'medium',
        checkType: 'static',
        expected: 'humans.txt and /.well-known/security.txt return text/plain and are listed in governance endpoints.',
        sourceOfTruth: 'src/app/humans.txt/route.ts and src/app/.well-known/security.txt/route.ts'
      }
    ]
  },
  {
    id: 'performance',
    label: 'Performance and runtime safety',
    summary: 'Local static checks should preserve lazy imports, worker usage, bounded inputs, and production PageSpeed should be measured after deploy.',
    gates: [
      {
        id: 'import-export-modules-lazy-loaded',
        label: 'Heavy import/export modules are lazy-loaded',
        area: 'performance',
        severity: 'high',
        checkType: 'static',
        expected: 'Workbook parser and CSV/PDF/DXF exporters are loaded on demand, not during initial page render.',
        sourceOfTruth: 'StockCutHomeWorkspace, SheetOptimizerTool, and LinearOptimizerTool'
      },
      {
        id: 'pagespeed-recorded-after-release',
        label: 'PageSpeed and CWV recorded after release',
        area: 'performance',
        severity: 'manual',
        checkType: 'production',
        expected: 'Run PageSpeed Insights for homepage, sheet optimizer, linear optimizer, and methodology page after production deploy.',
        sourceOfTruth: 'PageSpeed Insights / Search Console Core Web Vitals'
      }
    ]
  },
  {
    id: 'ads-policy',
    label: 'Ads and policy-page separation',
    summary: 'AdSense scripts should be gated away from policy/contact pages while ads.txt and publisher metadata remain discoverable.',
    gates: [
      {
        id: 'adsense-route-gate',
        label: 'AdSense route gate avoids policy pages',
        area: 'ads-policy',
        severity: 'high',
        checkType: 'static',
        expected: 'AdSense Auto Ads load only on allowed content/tool routes, not privacy, terms, disclaimer, contact, about, or not-found routes.',
        sourceOfTruth: 'src/components/ads/AdSenseAutoAds.tsx'
      },
      {
        id: 'ads-txt-publisher-record',
        label: 'ads.txt publisher record exists',
        area: 'ads-policy',
        severity: 'medium',
        checkType: 'static',
        expected: 'ads.txt contains the Google publisher record and root metadata includes google-adsense-account once.',
        sourceOfTruth: 'public/ads.txt and src/app/layout.tsx'
      }
    ]
  }
];

export const manualProductionChecks = [
  'Fetch /quality-gates.json, /canonical-map.json, /seo-status.json, /site-index.json, and /content-inventory.json in production and confirm HTTP 200 with expected content type.',
  'Fetch at least five canonical HTML pages and confirm HTTP 200, self-canonical metadata, Open Graph image, and JSON-LD graph presence.',
  'Fetch at least five legacy aliases and confirm permanent redirect to the documented canonical destination.',
  'Run Rich Results Test for the homepage, sheet optimizer, linear optimizer, methodology page, and site map.',
  'Run PageSpeed Insights for the homepage and two calculator pages; record LCP, INP, CLS, and any render-blocking third-party warnings.',
  'Export Search Console queries/pages and run scripts/analyze-production-signals.mjs before changing titles, descriptions, internal links, or adding new landing pages.',
  'Monitor CSP report-only output before changing Content-Security-Policy-Report-Only to an enforcing Content-Security-Policy header.'
];

export function schemaTypesForPageKind(kind: PageKind): string[] {
  if (kind === 'guide') return ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'CreativeWork'];
  return ['Organization', 'WebSite', 'WebPage', 'WebApplication', 'BreadcrumbList', 'CreativeWork'];
}

export function aliasesForCanonicalSlug(slug: string): string[] {
  return redirectAliases.filter((alias) => alias.destination === slug).map((alias) => alias.source);
}

export function pageQualityRecord(page: SeoPage): PageQualityRecord {
  const evidence = evidenceForPage(page);
  const cluster = clusterForPage(page);
  return {
    slug: page.slug,
    url: pageUrl(page.slug),
    title: page.title,
    description: page.description,
    kind: page.kind,
    canonicalExpected: true,
    sitemapExpected: true,
    feedExpected: true,
    robotsExpected: 'index, follow',
    aliases: aliasesForCanonicalSlug(page.slug).map((alias) => `${siteUrl}${alias}`),
    intentCluster: cluster?.id ?? null,
    evidenceScope: evidence.scopeLabel,
    schemaTypes: schemaTypesForPageKind(page.kind),
    relatedCanonicalPages: relatedPagesFor(page, 6).map((related) => pageUrl(related.slug)),
    localFirstPrivacy: evidence.privacyNote,
    qualitySignals: [
      'self-canonical expected',
      'included in XML sitemap',
      'included in RSS feed',
      'visible evidence panel expected',
      'machine-readable evidence inventory expected',
      `${evidence.exportFormats.length} export/readout formats documented`
    ]
  };
}

export function allPageQualityRecords(): PageQualityRecord[] {
  return canonicalPages.map(pageQualityRecord);
}

export function canonicalAliasMap() {
  return canonicalPages.map((page) => ({
    canonical: pageUrl(page.slug),
    slug: page.slug,
    aliases: aliasesForCanonicalSlug(page.slug).map((source) => ({
      source: `${siteUrl}${source}`,
      sourcePath: source,
      destination: pageUrl(page.slug),
      permanent: true
    }))
  }));
}

export function qualityGateSummary() {
  const gates = seoQualityGateGroups.flatMap((group) => group.gates);
  return {
    groupCount: seoQualityGateGroups.length,
    gateCount: gates.length,
    blockingGateCount: gates.filter((gate) => gate.severity === 'blocking').length,
    productionManualGateCount: gates.filter((gate) => gate.checkType === 'production' || gate.checkType === 'manual').length,
    canonicalPageCount: canonicalPages.length,
    aliasRedirectCount: redirectAliases.length,
    machineReadableEndpointCount: machineReadableIndexEntries.length,
    publicAssetCount: publicAssetChecklist.length
  };
}
