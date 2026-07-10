import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { internalSeoEnabled } from '@/lib/internalSeoAccess';
import { organizationJsonLd, siteLastModified, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { seoChangeControlPageRecords, seoChangeControlRules, seoChangeControlSummary, seoChangeControlWorkflow, seoChangeManifestExample } from '@/data/seoChangeControl';

const title = 'StockCut SEO Change Control';
const description = 'Review the evidence-backed gate that decides whether StockCut can ship metadata, internal-link, structured-data, performance, indexing, or CSP changes.';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title,
  description,
  alternates: { canonical: '/seo-change-control' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-change-control`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut SEO change control and evidence-backed release gate' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = seoChangeControlSummary();
const coreRecords = seoChangeControlPageRecords().filter((record) => record.signalPriority !== 'supporting');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-change-control#webpage`,
      url: `${siteUrl}/seo-change-control`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage,
      about: ['SEO change control', 'evidence-backed optimization', 'production signal candidates', 'CSP enforcement governance'],
      mentions: ['change-control.json', 'optimization-decisions.json', 'evidence-ledger.json', 'production-signals.json']
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-change-control#rules`,
      name: 'StockCut SEO change-control rules',
      itemListElement: seoChangeControlRules.map((rule, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: rule.label,
        description: rule.blockedWithout
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-change-control` }
      ]
    }
  ]
};

export default function SeoChangeControlPage() {
  if (!internalSeoEnabled()) notFound();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Change control · evidence-backed actions · release gate</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="SEO change-control summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Rules</p><p className="mt-2 text-3xl font-black">{summary.ruleCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Workflow steps</p><p className="mt-2 text-3xl font-black">{summary.workflowStepCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Protected surfaces</p><p className="mt-2 text-3xl font-black">{summary.protectedSurfaceCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Blocked by default</p><p className="mt-2 text-3xl font-black">{summary.blockedByDefaultCount}</p></div>
      </section>

      <section className="tool-card mt-4" aria-label="Default policy">
        <h2 className="text-2xl font-black">Default policy</h2>
        <p className="mt-2 text-sm leading-6 text-stock-muted">{summary.defaultPolicy}</p>
        <p className="mt-3 text-sm text-stock-muted">The machine-readable policy is published at <a className="font-bold text-stock-ink underline" href="/change-control.json">/change-control.json</a>. The local gate is <code>node scripts/check-seo-change-control.mjs</code>.</p>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Change-control rules">
        {seoChangeControlRules.map((rule) => (
          <section key={rule.id} className="tool-card">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">{rule.surface} · {rule.state}</p>
            <h2 className="mt-2 text-xl font-black">{rule.label}</h2>
            <p className="mt-2 text-sm leading-6 text-stock-muted">{rule.blockedWithout}</p>
            <p className="mt-3 rounded-xl bg-stock-paper p-3 text-sm text-stock-muted"><strong className="text-stock-ink">Required candidates:</strong> {rule.requiredActionCandidates.join(', ')}</p>
            <p className="mt-2 text-xs text-stock-muted">Protected files: {rule.protectedFiles.join(', ')}</p>
          </section>
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Change-control workflow">
          <h2 className="text-2xl font-black">Workflow</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {seoChangeControlWorkflow.map((step) => (
              <li key={step.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{step.label}</span>
                <span className="block">{step.commandOrArtifact}</span>
                <span className="mt-1 block text-xs">Pass condition: {step.passCondition}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="tool-card" aria-label="Proposed change manifest example">
          <h2 className="text-2xl font-black">Proposed change manifest</h2>
          <p className="mt-2 text-sm leading-6 text-stock-muted">Create <code>.seo-cache/proposed-seo-changes.json</code> only when a real production signal summary contains an action candidate. Example shape:</p>
          <pre className="mt-3 overflow-auto rounded-2xl bg-stock-ink p-4 text-xs text-white">{JSON.stringify(seoChangeManifestExample, null, 2)}</pre>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Core page change-control records">
        <h2 className="text-2xl font-black">Core page change-control records</h2>
        <p className="mt-2 text-sm text-stock-muted">Core pages stay blocked until verified production signals generate an accepted action candidate.</p>
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {coreRecords.map((record) => (
            <li key={record.slug} className="rounded-xl border border-stock-line bg-white p-3 text-sm text-stock-muted">
              <a className="font-bold text-stock-ink underline" href={record.slug}>{record.title}</a>
              <span className="mt-1 block">Default decision: {record.defaultDecision}</span>
              <span className="mt-1 block">Required evidence: {record.requiredEvidenceSources.join(', ') || 'record-only'}</span>
              <span className="mt-1 block text-xs">Allowed after candidate: {record.allowedActionsAfterCandidate.join(', ')}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
