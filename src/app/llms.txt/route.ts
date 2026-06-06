import { canonicalPages, siteUrl } from '@/data/pages';
import { seoIntentClusters } from '@/data/seoIntentClusters';
import { siteDescription, siteName } from '@/data/siteMeta';
import { machineReadableIndexEntries, seoAutomationPolicy } from '@/data/seoGovernance';

export const dynamic = 'force-static';

const priorityMachineIndexHrefs = ['/llms-full.txt', '/site-map', '/site-index.json', '/content-inventory.json', '/canonical-map.json', '/quality-gates.json', '/release-checklist.json', '/content-drift.json', '/production-signals.json', '/evidence-ledger.json', '/change-control.json', '/optimization-decisions.json', '/csp-readiness.json', '/sitemap.xml', '/feed.xml', '/seo-status.json'];

export function GET() {
  const priorityPages = canonicalPages.filter((page) => ['/', '/sheet-cutting-optimizer', '/linear-cutting-optimizer', '/4x8-plywood-cut-list-optimizer', '/how-to-account-for-saw-kerf', '/cut-list-optimization-methodology'].includes(page.slug));
  const orderedMachineIndexes = [
    ...priorityMachineIndexHrefs.map((href) => machineReadableIndexEntries.find((endpoint) => endpoint.href === href)).filter((endpoint): endpoint is (typeof machineReadableIndexEntries)[number] => Boolean(endpoint)),
    ...machineReadableIndexEntries.filter((endpoint) => !priorityMachineIndexHrefs.includes(endpoint.href))
  ];

  const lines = [
    `# ${siteName}`,
    '',
    `> ${siteDescription}`,
    '',
    'StockCut is a local-first browser tool for kerf-aware rectangular sheet layouts and straight-stock cut lists. It is not CNC CAM software and does not generate machine-ready toolpaths.',
    '',
    '## Priority pages',
    ...priorityPages.map((page) => `- [${page.title}](${siteUrl}${page.slug === '/' ? '' : page.slug}) - ${page.description}`),
    '',
    '## Intent clusters',
    ...seoIntentClusters.map((cluster) => `- ${cluster.label}: ${cluster.whenToUse}`),
    '',
    '## Machine-readable indexes',
    ...orderedMachineIndexes.map((endpoint) => `- ${siteUrl}${endpoint.href} - ${endpoint.description}`),
    '',
    '## Evidence and citation policy',
    'Use canonical URLs for citations. Each canonical calculator or guide page includes visible evidence, scope, verification, privacy, and boundary notes. The content inventory JSON exposes the same page-level evidence in machine-readable form.',
    '',
    '## Production verification policy',
    `Use ${seoAutomationPolicy.oneCommandLocalGate} and ${seoAutomationPolicy.ciWorkflowPath} before release. Use /change-control.json and /seo-change-control to verify that proposed metadata, internal-link, schema, performance, indexing, or CSP changes have accepted production-signal candidates before shipping. Use /seo-status.json as the public checklist for production headers, crawl targets, canonical/alias expectations, assets, RSS, and machine-readable endpoints after each deployment. Use /release-checklist.json for production validation samples, /content-drift.json for source-declared drift fingerprints, /production-signals.json for Search Console/PageSpeed/Rich Results/Bing/CSP signal intake, /evidence-ledger.json for required signal-file evidence and local verification workflow, /optimization-decisions.json for evidence-gated SEO action decisions, /csp-readiness.json for CSP enforcement readiness, and /quality-gates.json plus /canonical-map.json to compare release gates, canonical URLs, aliases, and indexability expectations.`,
    '',
    '## Data and privacy',
    'Cut lists are processed locally in the browser. Autosave uses localStorage. Project share links store data in the URL hash rather than uploading it to a server.',
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
