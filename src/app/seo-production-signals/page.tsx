import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { internalSeoEnabled } from '@/lib/internalSeoAccess';
import { organizationJsonLd, siteLastModified, siteName, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import {
  productionSignalDecisionRules,
  productionSignalInputFormats,
  productionSignalKpis,
  productionSignalPageTargets,
  productionSignalSources,
  productionSignalSummary,
  searchIntentBuckets
} from '@/data/seoProductionSignals';

const title = 'StockCut Production SEO Signals';
const description = 'Use the StockCut production SEO signals plan to import Search Console, PageSpeed, Rich Results, crawl, Bing, and CSP observations without guessing from source-only checks.';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title,
  description,
  alternates: { canonical: '/seo-production-signals' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-production-signals`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut production SEO signals dashboard and import plan' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = productionSignalSummary();
const coreTargets = productionSignalPageTargets().filter((page) => page.signalPriority !== 'supporting');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-production-signals#webpage`,
      url: `${siteUrl}/seo-production-signals`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage,
      about: ['Search Console performance exports', 'PageSpeed Insights measurements', 'Rich Results validation', 'production crawl checks', 'CSP report-only observations'],
      mentions: ['production-signals.json', 'release-checklist.json', 'seo-status.json', 'content-drift.json']
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-production-signals#sources`,
      name: 'StockCut production SEO signal sources',
      itemListElement: productionSignalSources.map((source, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: source.label,
        description: source.ownerAction
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-production-signals` }
      ]
    }
  ]
};

export default function SeoProductionSignalsPage() {
  if (!internalSeoEnabled()) notFound();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Production metrics · GSC · PageSpeed · Rich Results · crawl checks</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="Production signal summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Sources</p><p className="mt-2 text-3xl font-black">{summary.sourceCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Input formats</p><p className="mt-2 text-3xl font-black">{summary.inputFormatCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">KPIs</p><p className="mt-2 text-3xl font-black">{summary.kpiCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Tracked pages</p><p className="mt-2 text-3xl font-black">{summary.pageTargetCount}</p></div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="Production signal sources">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Data sources</p>
          <h2 className="mt-2 text-2xl font-black">What should drive the next SEO changes</h2>
          <p className="mt-2 text-sm text-stock-muted">The same model is available as JSON at <a className="font-bold text-stock-ink underline" href="/production-signals.json">/production-signals.json</a>. It declares accepted exports and decision rules; it does not publish private analytics rows. Evidence-gated action rules live at <a className="font-bold text-stock-ink underline" href="/optimization-decisions.json">/optimization-decisions.json</a> and CSP readiness lives at <a className="font-bold text-stock-ink underline" href="/csp-readiness.json">/csp-readiness.json</a>.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {productionSignalSources.map((source) => (
            <section key={source.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{source.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{source.ownerAction}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">Cadence: {source.cadence}</p>
              <ul className="mt-3 space-y-2 text-sm text-stock-muted">
                {source.useFor.map((item) => <li key={item}>• {item}</li>)}
              </ul>
              <p className="mt-3 rounded-xl bg-stock-paper p-3 text-sm text-stock-muted"><strong className="text-stock-ink">Do not infer:</strong> {source.doNotInfer}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Accepted production signal input formats">
          <h2 className="text-2xl font-black">Accepted input formats</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {productionSignalInputFormats.map((format) => (
              <li key={format.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{format.label}</span>
                <span className="block">Required: {format.requiredFields.join(', ')}</span>
                <span className="block text-xs">Files: {format.expectedFiles.join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Production SEO KPIs">
          <h2 className="text-2xl font-black">KPI gates</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {productionSignalKpis.map((kpi) => (
              <li key={kpi.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{kpi.label}</span>
                <span className="block">Target: {kpi.target}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{kpi.severity} · {kpi.source}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Search intent routing rules">
        <h2 className="text-2xl font-black">Search intent routing rules</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {searchIntentBuckets.map((bucket) => (
            <section key={bucket.id} className="rounded-2xl border border-stock-line bg-white p-4 text-sm text-stock-muted">
              <h3 className="font-black text-stock-ink">{bucket.label}</h3>
              <p className="mt-2">{bucket.decisionRule}</p>
              <p className="mt-2 text-xs"><strong>Patterns:</strong> {bucket.queryPatterns.join(', ')}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Core page signal targets">
          <h2 className="text-2xl font-black">Core page signal targets</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {coreTargets.map((page) => (
              <li key={page.slug} className="rounded-xl border border-stock-line bg-white p-3">
                <a className="font-bold text-stock-ink underline" href={page.slug}>{page.title}</a>
                <span className="block text-xs">Priority: {page.signalPriority} · primary query: {page.primaryQuery ?? 'not declared'}</span>
                <span className="mt-1 block">{page.evidenceSummary}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Decision rules for production data">
          <h2 className="text-2xl font-black">Decision rules</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {productionSignalDecisionRules.map((rule) => (
              <li key={rule} className="rounded-xl border border-stock-line bg-white p-3">{rule}</li>
            ))}
          </ul>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Local production signal analysis script">
        <h2 className="text-2xl font-black">Local analysis script</h2>
        <p className="mt-2 text-sm text-stock-muted">After exporting production metrics, place them in <code>seo-signals/</code> and run <code>node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json</code>. The script summarizes GSC query/page opportunities, PageSpeed records, Rich Results notes, and missing inputs without running a build or test suite.</p>
      </section>
    </main>
  );
}
