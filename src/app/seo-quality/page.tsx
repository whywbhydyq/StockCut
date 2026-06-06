import type { Metadata } from 'next';
import { canonicalPages, redirectAliases, siteUrl } from '@/data/pages';
import { organizationJsonLd, siteLastModified, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { machineReadableIndexEntries } from '@/data/seoGovernance';
import { manualProductionChecks, qualityGateSummary, seoQualityGateGroups } from '@/data/seoQualityGates';
import { releaseCheckSummary } from '@/data/seoReleaseChecks';

const title = 'StockCut SEO Quality Gates';
const description = 'Review StockCut release gates for canonical URLs, redirects, structured data, evidence panels, machine-readable indexes, security headers, performance checks, and ad-policy hygiene.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/seo-quality' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-quality`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut SEO quality gate checklist' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = qualityGateSummary();

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-quality#webpage`,
      url: `${siteUrl}/seo-quality`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-quality#quality-gates`,
      name: 'StockCut SEO quality gate groups',
      itemListElement: seoQualityGateGroups.map((group, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: group.label,
        description: group.summary
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-quality` }
      ]
    }
  ]
};

export default function SeoQualityPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Release quality gates · canonical governance · production verification</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="SEO quality summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Canonical pages</p><p className="mt-2 text-3xl font-black">{canonicalPages.length}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Redirect aliases</p><p className="mt-2 text-3xl font-black">{redirectAliases.length}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Gate groups</p><p className="mt-2 text-3xl font-black">{summary.groupCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Gate checks</p><p className="mt-2 text-3xl font-black">{summary.gateCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Release checks</p><p className="mt-2 text-3xl font-black">{releaseCheckSummary().checkCount}</p></div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="SEO quality gate groups">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Static and production gates</p>
          <h2 className="mt-2 text-2xl font-black">Quality gates by module</h2>
          <p className="mt-2 text-sm text-stock-muted">Static gates are enforced or documented in source and the local validation script. Production gates require deployed HTTP, rendered HTML, Rich Results, PageSpeed, or Search Console verification.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {seoQualityGateGroups.map((group) => (
            <section key={group.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{group.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{group.summary}</p>
              <ul className="mt-3 space-y-3 text-sm">
                {group.gates.map((gate) => (
                  <li key={gate.id} className="rounded-xl border border-stock-line bg-stock-paper p-3">
                    <span className="block font-bold text-stock-ink">{gate.label}</span>
                    <span className="block text-stock-muted">Expected: {gate.expected}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{gate.severity} · {gate.checkType}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Machine-readable SEO gate endpoints">
          <h2 className="text-2xl font-black">Machine-readable gate endpoints</h2>
          <p className="mt-2 text-sm text-stock-muted">Use these endpoints to compare source-declared expectations against deployed production behavior. The post-deploy release checklist is exposed at /seo-release-checklist and /release-checklist.json; the static drift snapshot is exposed at /content-drift.json.</p>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {machineReadableIndexEntries.filter((endpoint) => ['/quality-gates.json', '/release-checklist.json', '/content-drift.json', '/canonical-map.json', '/seo-status.json', '/content-inventory.json', '/site-index.json'].includes(endpoint.href)).map((endpoint) => (
              <li key={endpoint.href}>
                <a className="font-bold text-stock-ink underline" href={endpoint.href}>{endpoint.label}</a>
                <span className="block">{endpoint.description}</span>
                <span className="block text-xs">Content type: {endpoint.contentType}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Manual production verification checks">
          <h2 className="text-2xl font-black">Manual production checks</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stock-muted">
            {manualProductionChecks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </section>
      </section>
    </main>
  );
}
