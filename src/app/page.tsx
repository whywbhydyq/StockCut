import type { Metadata } from 'next';
import { StockCutHomeWorkspace } from '@/components/home/StockCutHomeWorkspace';

const title = 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut';
const description = 'Enter stock size, parts, kerf, and quantity to generate a browser-based cut layout, cutting sequence, waste estimate, and printable cut list for sheet goods, lumber, pipe, and tube.';
const siteUrl = 'https://stockcut.ymirtool.com';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'StockCut',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title,
    description
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'StockCut Cut List Optimizer',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      url: siteUrl,
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Sheet goods cut list optimizer',
        'Linear lumber cut optimizer',
        'Pipe and tube cutting sequence',
        'Kerf-aware layouts',
        'CSV import and printable PDF output',
        'Local browser-only calculation'
      ]
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
    </>
  );
}
