import { adSensePublisherId, siteContactEmail, siteName, siteUrl } from '@/data/siteMeta';

export interface GovernanceEndpoint {
  href: string;
  label: string;
  description: string;
  contentType: string;
}

export interface ExpectedSecurityHeader {
  key: string;
  expectedValue: string;
  purpose: string;
}

export const publicCrawlerAgents = [
  'Googlebot',
  'Bingbot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'CCBot',
  '*'
];

export const machineReadableIndexEntries: GovernanceEndpoint[] = [
  {
    href: '/sitemap.xml',
    label: 'XML sitemap',
    description: 'Search-engine sitemap for canonical, indexable StockCut URLs.',
    contentType: 'application/xml'
  },
  {
    href: '/feed.xml',
    label: 'RSS feed',
    description: 'Chronological update feed for canonical StockCut calculators, guides, and governance pages.',
    contentType: 'application/rss+xml'
  },
  {
    href: '/robots.txt',
    label: 'Robots policy',
    description: 'Crawler and AI-crawler access policy with sitemap declaration.',
    contentType: 'text/plain'
  },
  {
    href: '/llms.txt',
    label: 'LLM summary index',
    description: 'Short citation and AI-answer-engine index.',
    contentType: 'text/plain'
  },
  {
    href: '/llms-full.txt',
    label: 'Full LLM index',
    description: 'Expanded machine-readable page summary with intent clusters and citation guidance.',
    contentType: 'text/plain'
  },
  {
    href: '/site-index.json',
    label: 'Site index JSON',
    description: 'Canonical pages, aliases, intent clusters, boundaries, and related links.',
    contentType: 'application/json'
  },
  {
    href: '/content-inventory.json',
    label: 'Content inventory JSON',
    description: 'Page-level evidence, related links, schema types, and content roles.',
    contentType: 'application/json'
  },

  {
    href: '/canonical-map.json',
    label: 'Canonical and alias map JSON',
    description: 'Machine-readable mapping of canonical pages, legacy aliases, redirect expectations, and indexability rules.',
    contentType: 'application/json'
  },
  {
    href: '/quality-gates.json',
    label: 'SEO quality gates JSON',
    description: 'Machine-readable release gate checklist covering indexability, redirects, schema, evidence, machine readability, security, performance, and ad policy.',
    contentType: 'application/json'
  },

  {
    href: '/release-checklist.json',
    label: 'Release checklist JSON',
    description: 'Machine-readable production release checklist for endpoint, canonical HTML, redirect, header, asset, PageSpeed, and search-console verification.',
    contentType: 'application/json'
  },
  {
    href: '/content-drift.json',
    label: 'Content drift snapshot JSON',
    description: 'Deterministic source-declared fingerprints for canonical page identity, evidence, and related-link inputs.',
    contentType: 'application/json'
  },
  {
    href: '/optimization-decisions.json',
    label: 'Optimization decisions JSON',
    description: 'Machine-readable decision gates for production-signal-backed metadata, internal-link, schema, performance, indexing, and CSP optimization actions.',
    contentType: 'application/json'
  },
  {
    href: '/csp-readiness.json',
    label: 'CSP readiness JSON',
    description: 'Machine-readable readiness checklist for moving Content-Security-Policy from report-only to enforcement after production observation.',
    contentType: 'application/json'
  },
  {
    href: '/production-signals.json',
    label: 'Production signals JSON',
    description: 'Machine-readable intake model for Search Console, PageSpeed, Rich Results, production crawl, Bing, and CSP report-only observations.',
    contentType: 'application/json'
  },
  {
    href: '/evidence-ledger.json',
    label: 'SEO evidence ledger JSON',
    description: 'Machine-readable contract that maps required production signal files to allowed SEO action candidates and blocks blind optimization changes.',
    contentType: 'application/json'
  },
  {
    href: '/change-control.json',
    label: 'SEO change control JSON',
    description: 'Machine-readable gate for proposed SEO changes, matching production-signal action candidates, evidence files, and reviewer manifest requirements.',
    contentType: 'application/json'
  },
  {
    href: '/seo-status.json',
    label: 'SEO status JSON',
    description: 'Public production verification checklist for headers, indexability, assets, redirects, and machine-readable endpoints.',
    contentType: 'application/json'
  },
  {
    href: '/humans.txt',
    label: 'Humans file',
    description: 'Plain-text ownership, contact, privacy, and correction information.',
    contentType: 'text/plain'
  },
  {
    href: '/.well-known/security.txt',
    label: 'Security contact',
    description: 'Security and vulnerability disclosure contact for the site.',
    contentType: 'text/plain'
  }
];

export const expectedSecurityHeaders: ExpectedSecurityHeader[] = [
  {
    key: 'Strict-Transport-Security',
    expectedValue: 'max-age=63072000; includeSubDomains; preload',
    purpose: 'Require HTTPS and preserve secure transport expectations for production crawls.'
  },
  {
    key: 'X-Content-Type-Options',
    expectedValue: 'nosniff',
    purpose: 'Prevent MIME-type sniffing for scripts, JSON, text, and static assets.'
  },
  {
    key: 'X-Frame-Options',
    expectedValue: 'DENY',
    purpose: 'Prevent clickjacking and unintended framing of calculator pages.'
  },
  {
    key: 'Referrer-Policy',
    expectedValue: 'strict-origin-when-cross-origin',
    purpose: 'Limit cross-origin referrer leakage while preserving analytics attribution.'
  },
  {
    key: 'Permissions-Policy',
    expectedValue: 'camera=(), microphone=(), geolocation=(), payment=()',
    purpose: 'Declare that the app does not require sensitive browser capabilities.'
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    expectedValue: 'report-only mode with AdSense-compatible script, frame, image, and connect sources',
    purpose: 'Observe CSP violations before switching to an enforcing policy.'
  }
];

export const publicAssetChecklist = [
  '/stockcut-og.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
  '/ads.txt'
];

export const crawlVerificationTargets = [
  '/',
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/how-to-account-for-saw-kerf',
  '/cut-list-optimization-methodology',
  '/site-map',
  '/sitemap.xml',
  '/feed.xml',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/site-index.json',
  '/content-inventory.json',
  '/seo-status.json',
  '/canonical-map.json',
  '/quality-gates.json',
  '/seo-quality',
  '/seo-release-checklist',
  '/seo-production-signals',
  '/seo-optimization-decisions',
  '/release-checklist.json',
  '/content-drift.json',
  '/optimization-decisions.json',
  '/csp-readiness.json',
  '/production-signals.json',
  '/evidence-ledger.json',
  '/seo-evidence-ledger',
  '/change-control.json',
  '/seo-change-control',
  '/humans.txt',
  '/.well-known/security.txt'
];


export const seoAutomationPolicy = {
  oneCommandLocalGate: 'npm run seo:local-gates',
  ciWorkflowPath: '.github/workflows/seo-local-gates.yml',
  pullRequestTemplatePath: '.github/PULL_REQUEST_TEMPLATE/seo-change-control.md',
  deploymentGateDocs: 'docs/SEO_DEPLOYMENT_GATES.md',
  automationConsistencyScript: 'node scripts/check-seo-automation-consistency.mjs',
  archiveCommand: 'npm run seo:archive-run',
  proposedChangeTemplateCommand: 'npm run seo:change-template',
  offlineSkillCommand: 'npm run seo:offline-skills',
  sourceDriftBaselineCommand: 'npm run seo:drift-baseline',
  sourceDriftCompareCommand: 'npm run seo:drift-compare',
  allowedCiCommands: ['npm ci --ignore-scripts', 'npm run seo:local-gates', 'npm run seo:offline-skills', 'npm run seo:drift-baseline', 'npm run seo:drift-compare'],
  skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse'],
  rawSignalExportPolicy: 'Raw Search Console, PageSpeed, crawl, Bing, and CSP exports remain ignored under seo-signals/*; only README.md and proposed-seo-changes.example.json are committed.',
  artifactPolicy: 'CI may upload derived .seo-cache summaries as artifacts, but must not upload raw seo-signals exports.'
};

export const indexingPolicy = {
  canonicalPages: 'Indexable and followable. Canonical pages are the only URLs included in XML sitemap, RSS feed, and canonical metadata.',
  aliasPages: 'Permanent redirects only. Legacy /tools, /calculators, /guides, and /legal paths must not appear in sitemap or RSS feed.',
  robots: `Allows public search and answer-engine crawlers. Sitemap is ${siteUrl}/sitemap.xml.`,
  ads: `AdSense publisher id is ${adSensePublisherId}; Auto Ads are gated away from policy and legal pages.`
};

export function absoluteEndpoint(endpoint: GovernanceEndpoint): GovernanceEndpoint & { url: string } {
  return { ...endpoint, url: `${siteUrl}${endpoint.href}` };
}

export function governanceSummary() {
  return {
    siteName,
    siteUrl,
    contact: siteContactEmail,
    localFirstPrivacy: 'Cut lists are processed in the browser. Autosave uses localStorage. Share links encode project data in the URL hash.',
    indexingPolicy,
    publicCrawlerAgents,
    machineReadableIndexes: machineReadableIndexEntries.map(absoluteEndpoint),
    publicAssetChecklist: publicAssetChecklist.map((href) => `${siteUrl}${href}`),
    crawlVerificationTargets: crawlVerificationTargets.map((href) => `${siteUrl}${href}`),
    expectedSecurityHeaders,
    seoAutomationPolicy
  };
}
