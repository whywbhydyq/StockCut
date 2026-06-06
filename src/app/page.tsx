import type { Metadata } from 'next';
import { StockCutHomeWorkspace } from '@/components/home/StockCutHomeWorkspace';
import { PageEvidencePanel } from '@/components/page/PageEvidencePanel';
import { organizationJsonLd, siteLastModified, siteName, siteOgImage, siteUrl, websiteJsonLd } from '@/data/siteMeta';
import { intentClusterJsonLd, priorityIndexPages } from '@/data/seoIntentClusters';
import { pageBySlug } from '@/data/pages';
import { evidenceJsonLd, pageAboutTerms, pageMentions } from '@/data/pageEvidence';

const title = 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut';
const description = 'Enter stock size, parts, kerf, and quantity to generate a browser-based cut layout, cutting sequence, waste estimate, and printable cut list for sheet goods, lumber, pipe, and tube.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    type: 'website',
    images: [{ url: siteOgImage, width: 1200, height: 630, alt: 'StockCut cut list optimizer layout preview' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteOgImage]
  }
};

const page = pageBySlug('/');
const priorityPages = priorityIndexPages();
const aboutTerms = pageAboutTerms(page);
const mentions = pageMentions(page);

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      '@type': 'WebApplication',
      name: 'StockCut Cut List Optimizer',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      url: siteUrl,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      publisher: { '@id': `${siteUrl}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
      softwareVersion: '1.0.0',
      browserRequirements: 'Requires a modern browser with JavaScript enabled; calculations run locally in the browser.',
      dateModified: siteLastModified,
      image: siteOgImage,
      about: aboutTerms.map((name) => ({ '@type': 'Thing', name })),
      mentions: mentions.map((name) => ({ '@type': 'Thing', name })),
      featureList: [
        'Sheet goods cut list optimizer',
        'Linear lumber cut optimizer',
        'Pipe and tube cutting sequence',
        'Kerf-aware layouts',
        'CSV import and printable PDF output',
        'Local browser-only calculation'
      ]
    },
    intentClusterJsonLd(),
    evidenceJsonLd(page),
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/#priority-pages`,
      name: 'StockCut priority calculators and guides',
      itemListElement: priorityPages.map((page, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: page.title,
        description: page.description,
        url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl }
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StockCutHomeWorkspace />
      <div className="mx-auto max-w-7xl px-4"><PageEvidencePanel page={page} /></div>
    </>
  );
}
