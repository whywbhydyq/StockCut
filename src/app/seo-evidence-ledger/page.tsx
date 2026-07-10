import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { internalSeoEnabled } from '@/lib/internalSeoAccess';
import { organizationJsonLd, siteLastModified, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { evidenceFileSpecs, evidenceLedgerSummary, evidenceWorkflowSteps, pageEvidenceLedgerRecords } from '@/data/seoEvidenceLedger';

const title = 'StockCut SEO Evidence Ledger';
const description = 'Map real Search Console, PageSpeed, Rich Results, production crawl, Bing, and CSP evidence files to the SEO actions StockCut is allowed to ship.';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title,
  description,
  alternates: { canonical: '/seo-evidence-ledger' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-evidence-ledger`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut SEO evidence ledger and production signal workflow' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = evidenceLedgerSummary();
const coreRecords = pageEvidenceLedgerRecords().filter((record) => record.signalPriority !== 'supporting');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-evidence-ledger#webpage`,
      url: `${siteUrl}/seo-evidence-ledger`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage,
      about: ['SEO evidence ledger', 'Search Console export validation', 'PageSpeed export validation', 'CSP report-only evidence', 'optimization action audit trail'],
      mentions: ['evidence-ledger.json', 'production-signals.json', 'optimization-decisions.json', 'csp-readiness.json']
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-evidence-ledger#signal-files`,
      name: 'StockCut production signal file requirements',
      itemListElement: evidenceFileSpecs.map((spec, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: spec.fileName,
        description: spec.acceptanceRule
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-evidence-ledger` }
      ]
    }
  ]
};

export default function SeoEvidenceLedgerPage() {
  if (!internalSeoEnabled()) notFound();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Evidence ledger · signal file verification · action gating</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="Evidence ledger summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Signal files</p><p className="mt-2 text-3xl font-black">{summary.expectedSignalFileCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Workflow steps</p><p className="mt-2 text-3xl font-black">{summary.workflowStepCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Page records</p><p className="mt-2 text-3xl font-black">{summary.pageLedgerRecordCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Blocked pending evidence</p><p className="mt-2 text-3xl font-black">{summary.blockedPendingSignalCount}</p></div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="Required production signal files">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Signal file contract</p>
          <h2 className="mt-2 text-2xl font-black">Required files before evidence-backed changes</h2>
          <p className="mt-2 text-sm text-stock-muted">The same contract is published at <a className="font-bold text-stock-ink underline" href="/evidence-ledger.json">/evidence-ledger.json</a>. Verify local exports with <code>node scripts/verify-seo-signal-files.mjs --input seo-signals --out .seo-cache/seo-signal-files-verification.json</code>.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {evidenceFileSpecs.map((spec) => (
            <section key={spec.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{spec.fileName}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{spec.acceptanceRule}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{spec.format} · fresh within {spec.freshnessDays} days · {spec.privacyClassification}</p>
              <p className="mt-3 rounded-xl bg-stock-paper p-3 text-sm text-stock-muted"><strong className="text-stock-ink">Expected fields:</strong> {spec.expectedFields.join(', ')}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Evidence workflow">
          <h2 className="text-2xl font-black">Evidence workflow</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {evidenceWorkflowSteps.map((step) => (
              <li key={step.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{step.label}</span>
                <span className="block">{step.commandOrSource}</span>
                <span className="mt-1 block text-xs">Output: {step.output}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="Evidence policy">
          <h2 className="text-2xl font-black">Default decision policy</h2>
          <p className="mt-2 text-sm leading-6 text-stock-muted">{summary.defaultPolicy}</p>
          <p className="mt-3 text-sm text-stock-muted">The ledger connects to <a className="font-bold text-stock-ink underline" href="/production-signals.json">/production-signals.json</a>, <a className="font-bold text-stock-ink underline" href="/optimization-decisions.json">/optimization-decisions.json</a>, and <a className="font-bold text-stock-ink underline" href="/csp-readiness.json">/csp-readiness.json</a>.</p>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Core page evidence ledger records">
        <h2 className="text-2xl font-black">Core page evidence ledger</h2>
        <p className="mt-2 text-sm text-stock-muted">Core records remain blocked until their required signal files are verified and the production signal analyzer emits an accepted action candidate.</p>
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {coreRecords.map((record) => (
            <li key={record.slug} className="rounded-xl border border-stock-line bg-white p-3 text-sm text-stock-muted">
              <a className="font-bold text-stock-ink underline" href={record.slug}>{record.title}</a>
              <span className="mt-1 block">State: {record.currentDecisionState}</span>
              <span className="mt-1 block">Required evidence: {record.requiredEvidenceSources.join(', ')}</span>
              <span className="mt-1 block text-xs">Allowed after evidence: {record.allowedActionsAfterEvidence.join(', ')}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
