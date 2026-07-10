import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalPages, siteUrl } from '@/data/pages';
import { organizationJsonLd, websiteJsonLd } from '@/data/siteMeta';

const title = 'StockCut Site Map';
const description = 'Browse StockCut calculators, material presets, practical cutting guides, and policy pages.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/site-map' },
  robots: { index: true, follow: true }
};

const labels: Record<string, string> = {
  sheet: 'Sheet cutting tools',
  linear: 'Linear cutting tools',
  kerf: 'Kerf calculators',
  guide: 'Cutting guides',
  legal: 'Policies',
  about: 'About StockCut'
};

export default function SiteMapPage() {
  const grouped = canonicalPages.reduce<Record<string, typeof canonicalPages>>((groups, page) => {
    (groups[page.kind] ||= []).push(page);
    return groups;
  }, {});
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), websiteJsonLd(), {
      '@type': 'ItemList',
      name: title,
      itemListElement: canonicalPages.map((page, index) => ({
        '@type': 'ListItem', position: index + 1, name: page.title,
        url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`
      }))
    }]
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>
      <p className="mt-3 max-w-3xl text-stock-muted">{description}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {Object.entries(grouped).map(([kind, pages]) => (
          <section key={kind} className="tool-card">
            <h2 className="text-xl font-black">{labels[kind] ?? kind}</h2>
            <ul className="mt-4 space-y-3">
              {pages.map((page) => <li key={page.slug}><Link className="font-bold underline" href={page.slug}>{page.title}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
