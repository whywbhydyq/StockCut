import type { Metadata } from 'next';
import { organizationJsonLd, siteLastModified, siteName, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { canonicalHtmlChecks, productionEndpointChecks, redirectCheckSamples, releaseCheckGroups, releaseCheckSummary } from '@/data/seoReleaseChecks';

const title = 'StockCut SEO Release Checklist';
const description = 'Use the StockCut release checklist to verify production endpoints, canonical HTML pages, redirect samples, headers, assets, PageSpeed, and Search Console follow-up after deployment.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/seo-release-checklist' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-release-checklist`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut SEO release checklist for production validation' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = releaseCheckSummary();

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-release-checklist#webpage`,
      url: `${siteUrl}/seo-release-checklist`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage,
      about: ['SEO release validation', 'canonical URL governance', 'production crawl verification', 'content drift monitoring'],
      mentions: ['release-checklist.json', 'content-drift.json', 'quality-gates.json', 'canonical-map.json']
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-release-checklist#release-checks`,
      name: 'StockCut release check groups',
      itemListElement: releaseCheckGroups.map((group, index) => ({
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
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-release-checklist` }
      ]
    }
  ]
};

export default function SeoReleaseChecklistPage() {
  const endpoints = productionEndpointChecks();
  const canonicalSamples = canonicalHtmlChecks();
  const redirectSamples = redirectCheckSamples();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Production release checklist · drift snapshot · endpoint validation</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="Release checklist summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Check groups</p><p className="mt-2 text-3xl font-black">{summary.groupCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Checks</p><p className="mt-2 text-3xl font-black">{summary.checkCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Endpoint checks</p><p className="mt-2 text-3xl font-black">{summary.endpointCheckCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Drift fingerprints</p><p className="mt-2 text-3xl font-black">{summary.contentDriftFingerprintCount}</p></div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="Release check groups">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Module-level release gates</p>
          <h2 className="mt-2 text-2xl font-black">What to verify after deployment</h2>
          <p className="mt-2 text-sm text-stock-muted">The same checklist is available as JSON at <a className="font-bold text-stock-ink underline" href="/release-checklist.json">/release-checklist.json</a>. Static source drift is available at <a className="font-bold text-stock-ink underline" href="/content-drift.json">/content-drift.json</a>.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {releaseCheckGroups.map((group) => (
            <section key={group.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{group.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{group.summary}</p>
              <ul className="mt-3 space-y-3 text-sm">
                {group.checks.map((check) => (
                  <li key={check.id} className="rounded-xl border border-stock-line bg-stock-paper p-3">
                    <span className="block font-bold text-stock-ink">{check.label}</span>
                    <span className="block text-stock-muted">Expected: {check.expected}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{check.severity} · {check.execution}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="tool-card" aria-label="Endpoint validation samples">
          <h2 className="text-2xl font-black">Endpoint checks</h2>
          <p className="mt-2 text-sm text-stock-muted">Fetch these after release and compare status and content type.</p>
          <ul className="mt-3 max-h-96 space-y-2 overflow-auto pr-2 text-sm text-stock-muted">
            {endpoints.map((endpoint) => (
              <li key={endpoint.path} className="rounded-xl border border-stock-line bg-white p-2">
                <a className="font-bold text-stock-ink underline" href={endpoint.path}>{endpoint.path}</a>
                <span className="block text-xs">{endpoint.expectedStatus} · {endpoint.expectedContentType}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Canonical HTML validation samples">
          <h2 className="text-2xl font-black">Canonical HTML samples</h2>
          <p className="mt-2 text-sm text-stock-muted">Verify these pages for self-canonical metadata, OG image, and JSON-LD graph presence.</p>
          <ul className="mt-3 max-h-96 space-y-2 overflow-auto pr-2 text-sm text-stock-muted">
            {canonicalSamples.map((page) => (
              <li key={page.slug} className="rounded-xl border border-stock-line bg-white p-2">
                <a className="font-bold text-stock-ink underline" href={page.slug}>{page.title}</a>
                <span className="block text-xs">Expected canonical: {page.expectedCanonical}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Redirect validation samples">
          <h2 className="text-2xl font-black">Redirect samples</h2>
          <p className="mt-2 text-sm text-stock-muted">Legacy routes should stay permanent and resolve to the documented canonical URLs.</p>
          <ul className="mt-3 max-h-96 space-y-2 overflow-auto pr-2 text-sm text-stock-muted">
            {redirectSamples.map((sample) => (
              <li key={sample.sourcePath} className="rounded-xl border border-stock-line bg-white p-2">
                <code>{sample.sourcePath}</code>
                <span className="block text-xs">{sample.expectedStatus} → {sample.destinationPath}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Production validation script">
        <h2 className="text-2xl font-black">Optional production check script</h2>
        <p className="mt-2 text-sm text-stock-muted">After deploying, run <code>node scripts/check-production-seo.mjs https://stockcut.ymirtool.com</code> from a network that can resolve the production host. The script checks declared endpoints, sampled canonical HTML, sampled aliases, and expected security headers. It does not run a local build or test suite.</p>
      </section>
    </main>
  );
}
