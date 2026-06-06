import type { Metadata } from 'next';
import { organizationJsonLd, siteLastModified, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import {
  cspReadinessChecks,
  cspReadinessSummary,
  optimizationActionPolicies,
  optimizationDecisionGates,
  optimizationDecisionSummary,
  pageOptimizationDecisionRecords
} from '@/data/seoOptimizationDecisions';

const title = 'StockCut SEO Optimization Decisions';
const description = 'Use real Search Console, PageSpeed, Rich Results, production crawl, and CSP report-only data to decide which StockCut SEO changes are allowed, blocked, or ready to ship.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/seo-optimization-decisions' },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/seo-optimization-decisions`,
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut SEO optimization decision gates and CSP readiness model' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const summary = optimizationDecisionSummary();
const cspSummary = cspReadinessSummary();
const corePages = pageOptimizationDecisionRecords().filter((record) => record.signalPriority !== 'supporting');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/seo-optimization-decisions#webpage`,
      url: `${siteUrl}/seo-optimization-decisions`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: siteLastModified,
      image: siteOgImage,
      about: ['SEO decision gates', 'Search Console evidence', 'PageSpeed evidence', 'CSP readiness', 'internal linking governance'],
      mentions: ['optimization-decisions.json', 'csp-readiness.json', 'production-signals.json', 'release-checklist.json']
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/seo-optimization-decisions#gates`,
      name: 'StockCut SEO optimization decision gates',
      itemListElement: optimizationDecisionGates.map((gate, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: gate.label,
        description: gate.evidenceRequiredBeforeChange
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteUrl}/seo-optimization-decisions` }
      ]
    }
  ]
};

export default function SeoOptimizationDecisionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mb-6">
        <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Production data · decision gates · CSP readiness</p>
        <h1 className="max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-stock-muted">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4" aria-label="Optimization decision summary">
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Decision gates</p><p className="mt-2 text-3xl font-black">{summary.gateCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Action policies</p><p className="mt-2 text-3xl font-black">{summary.actionPolicyCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">CSP checks</p><p className="mt-2 text-3xl font-black">{summary.cspReadinessCheckCount}</p></div>
        <div className="tool-card"><p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Tracked pages</p><p className="mt-2 text-3xl font-black">{summary.pageDecisionRecordCount}</p></div>
      </section>

      <section className="tool-card mt-4 space-y-5" aria-label="Optimization decision gates">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Decision model</p>
          <h2 className="mt-2 text-2xl font-black">What can change only after production evidence</h2>
          <p className="mt-2 text-sm text-stock-muted">The same model is published as JSON at <a className="font-bold text-stock-ink underline" href="/optimization-decisions.json">/optimization-decisions.json</a>. CSP-specific readiness is published at <a className="font-bold text-stock-ink underline" href="/csp-readiness.json">/csp-readiness.json</a>.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {optimizationDecisionGates.map((gate) => (
            <section key={gate.id} className="rounded-2xl border border-stock-line bg-white p-4">
              <h3 className="font-black text-stock-ink">{gate.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stock-muted">{gate.evidenceRequiredBeforeChange}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{gate.area} · {gate.severity}</p>
              <p className="mt-3 rounded-xl bg-stock-paper p-3 text-sm text-stock-muted"><strong className="text-stock-ink">Threshold:</strong> {gate.threshold}</p>
              <p className="mt-3 text-sm text-stock-muted"><strong className="text-stock-ink">Allowed:</strong> {gate.allowedActions.join(', ')}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="tool-card" aria-label="Optimization action policies">
          <h2 className="text-2xl font-black">Action policies</h2>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {optimizationActionPolicies.map((policy) => (
              <li key={policy.action} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{policy.action}</span>
                <span className="block">{policy.whenAllowed}</span>
                <span className="mt-1 block text-xs">Output: {policy.outputArtifact}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-label="CSP readiness checks">
          <h2 className="text-2xl font-black">CSP enforcement readiness</h2>
          <p className="mt-2 text-sm text-stock-muted">Current default: <strong>{cspSummary.defaultAction}</strong>. Move to enforced CSP only after the must-pass checks are clean in production.</p>
          <ul className="mt-3 space-y-3 text-sm text-stock-muted">
            {cspReadinessChecks.map((check) => (
              <li key={check.id} className="rounded-xl border border-stock-line bg-white p-3">
                <span className="block font-bold text-stock-ink">{check.label}</span>
                <span className="block">{check.requiredEvidence}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">{check.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="tool-card mt-4" aria-label="Core page optimization decision records">
        <h2 className="text-2xl font-black">Core page decision records</h2>
        <p className="mt-2 text-sm text-stock-muted">These records define which page-level actions are allowed only after Search Console, PageSpeed, Rich Results, crawl, or CSP evidence exists.</p>
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {corePages.map((record) => (
            <li key={record.slug} className="rounded-xl border border-stock-line bg-white p-3 text-sm text-stock-muted">
              <a className="font-bold text-stock-ink underline" href={record.slug}>{record.title}</a>
              <span className="mt-1 block">Allowed after evidence: {record.allowedOptimizationActions.join(', ')}</span>
              <span className="mt-1 block text-xs">Priority: {record.signalPriority} · primary query: {record.primaryQuery ?? 'not declared'}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
