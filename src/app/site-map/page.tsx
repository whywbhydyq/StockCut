import type { Metadata } from 'next';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { organizationJsonLd, siteLastModified, siteName, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { seoIntentClusters, pagesForSlugs, pageUrl } from '@/data/seoIntentClusters';
import { evidenceForPage } from '@/data/pageEvidence';
import { machineReadableIndexEntries, expectedSecurityHeaders } from '@/data/seoGovernance';
import { seoQualityGateGroups, qualityGateSummary } from '@/data/seoQualityGates';
import { releaseCheckSummary } from '@/data/seoReleaseChecks';
import { productionSignalSummary } from '@/data/seoProductionSignals';
import { evidenceLedgerSummary } from '@/data/seoEvidenceLedger';
import { seoChangeControlSummary } from '@/data/seoChangeControl';

const title = 'StockCut Site Map';
const description = 'Browse every canonical StockCut calculator, guide, policy page, machine-readable index, and redirected legacy path from one crawlable page.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/site-map' },
  openGraph: {
    title,
    description,
    url: '/site-map',
    siteName,
    type: 'website',
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: title }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const grouped = canonicalPages.reduce<Record<string, typeof canonicalPages>>((groups, page) => {
  groups[page.kind] = groups[page.kind] ?? [];
  groups[page.kind].push(page);
  return groups;
}, {});

const priorityMachineIndexHrefs = ['/sitemap.xml', '/feed.xml', '/robots.txt', '/llms.txt', '/llms-full.txt', '/site-index.json', '/content-inventory.json', '/canonical-map.json', '/quality-gates.json', '/release-checklist.json', '/content-drift.json', '/production-signals.json', '/evidence-ledger.json', '/change-control.json', '/seo-status.json', '/humans.txt', '/.well-known/security.txt'];
const machineIndexes = [
  ...priorityMachineIndexHrefs.map((href) => machineReadableIndexEntries.find((endpoint) => endpoint.href === href)).filter((endpoint): endpoint is (typeof machineReadableIndexEntries)[number] => Boolean(endpoint)),
  ...machineReadableIndexEntries.filter((endpoint) => !priorityMachineIndexHrefs.includes(endpoint.href))
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/site-map#webpage`,
      url: `${siteUrl}/site-map`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/site-map#canonical-pages`,
      name: 'StockCut canonical pages',
      itemListElement: canonicalPages.map((page, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: page.title,
        description: page.description,
        url: pageUrl(page.slug)
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/site-map` }
      ]
    }
  ]
};

export default function SiteMapPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Canonical navigation · crawl support · machine-readable indexes</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="tool-card space-y-5" aria-label="StockCut intent clusters">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Browse by intent</p>
          <h2 className="mt-2 text-2xl font-black">Calculator and guide clusters</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {seoIntentClusters.map((cluster) => (
            <section key={cluster.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{cluster.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{cluster.summary}</p>
              <p className="mt-2 rounded-xl bg-stock-paper p-3 text-sm text-stock-muted"><strong className="text-stock-ink">Use when:</strong> {cluster.whenToUse}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {pagesForSlugs([...cluster.primarySlugs, ...cluster.supportingSlugs]).map((page) => (
                  <li key={page.slug}>
                    <a className="font-bold text-stock-ink underline" href={page.slug}>{page.title}</a>
                    <span className="block text-stock-muted">{page.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="All canonical StockCut pages">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Canonical pages</p>
          <h2 className="mt-2 text-2xl font-black">All indexable pages</h2>
        </div>
        {Object.keys(grouped).sort().map((kind) => (
          <section key={kind} className="rounded-2xl border border-stock-line bg-white p-4">
            <h3 className="font-black capitalize text-stock-ink">{kind} pages</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {grouped[kind].map((page) => {
                const evidence = evidenceForPage(page);
                return (
                  <a key={page.slug} className="rounded-2xl border border-stock-line bg-stock-paper p-3 no-underline hover:border-stock-accent" href={page.slug}>
                    <span className="block text-sm font-black text-stock-ink">{page.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-stock-muted">{page.description}</span>
                    <span className="mt-2 block text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{evidence.scopeLabel}</span>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Machine-readable StockCut indexes">
          <h2 className="text-2xl font-black">Machine-readable indexes</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {machineIndexes.map((item) => (
              <li key={item.href}>
                <a className="font-bold text-stock-ink underline" href={item.href}>{item.label}</a>
                <span className="block">{item.description}</span>
                <span className="block text-xs">Content type: {item.contentType}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="SEO quality gates">
          <h2 className="text-2xl font-black">SEO quality gates</h2>
          <p className="mt-2 text-sm text-stock-muted">The release gate summary is exposed at <a className="font-bold text-stock-ink underline" href="/quality-gates.json">/quality-gates.json</a>, the release checklist is exposed at <a className="font-bold text-stock-ink underline" href="/release-checklist.json">/release-checklist.json</a>, and the canonical/alias mapping is exposed at <a className="font-bold text-stock-ink underline" href="/canonical-map.json">/canonical-map.json</a>. Current source-declared coverage: {qualityGateSummary().gateCount} quality gates, {releaseCheckSummary().checkCount} release checks, {productionSignalSummary().kpiCount} production signal KPIs, {evidenceLedgerSummary().expectedSignalFileCount} evidence file specs, and {seoChangeControlSummary().ruleCount} change-control rules. See <a className="font-bold text-stock-ink underline" href="/production-signals.json">/production-signals.json</a>, <a className="font-bold text-stock-ink underline" href="/evidence-ledger.json">/evidence-ledger.json</a>, <a className="font-bold text-stock-ink underline" href="/optimization-decisions.json">/optimization-decisions.json</a>, <a className="font-bold text-stock-ink underline" href="/csp-readiness.json">/csp-readiness.json</a>, <a className="font-bold text-stock-ink underline" href="/seo-production-signals">/seo-production-signals</a>, <a className="font-bold text-stock-ink underline" href="/seo-optimization-decisions">/seo-optimization-decisions</a>, and <a className="font-bold text-stock-ink underline" href="/seo-evidence-ledger">/seo-evidence-ledger</a>, <a className="font-bold text-stock-ink underline" href="/change-control.json">/change-control.json</a>, and <a className="font-bold text-stock-ink underline" href="/seo-change-control">/seo-change-control</a>.</p>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {seoQualityGateGroups.map((group) => (
              <li key={group.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{group.label}</span>
                <span className="block">{group.summary}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Production verification checklist">
          <h2 className="text-2xl font-black">Production verification checklist</h2>
          <p className="mt-2 text-sm text-stock-muted">After each deployment, verify these headers and public endpoints in the deployed environment. The same checklist is exposed at <a className="font-bold text-stock-ink underline" href="/seo-status.json">/seo-status.json</a>.</p>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {expectedSecurityHeaders.map((header) => (
              <li key={header.key} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{header.key}</span>
                <span className="block">{header.purpose}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="tool-card" aria-label="Legacy redirected paths">
          <h2 className="text-2xl font-black">Legacy redirected paths</h2>
          <p className="mt-2 text-sm text-stock-muted">Legacy /tools, /calculators, /guides, and /legal URLs redirect permanently to canonical pages. Use canonical URLs for links and citations.</p>
          <ul className="mt-3 max-h-96 space-y-2 overflow-auto pr-2 text-sm text-stock-muted">
            {redirectAliases.map((alias) => (
              <li key={alias.source} className="rounded-xl border border-stock-line bg-white p-2">
                <code>{alias.source}</code> → <a className="font-bold text-stock-ink underline" href={alias.destination}>{alias.destination}</a>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
