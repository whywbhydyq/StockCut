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
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Can I optimize 4x8 plywood sheets?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter a 48 x 96 inch sheet, kerf, and rectangular parts to generate a printable cut layout and waste estimate.' } },
        { '@type': 'Question', name: 'Can I use StockCut for pipe or tube cutting?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to pipe, tube, bar, or lumber mode to optimize straight stock lengths with kerf and cut sequence output.' } },
        { '@type': 'Question', name: 'Does StockCut upload my cut list?', acceptedAnswer: { '@type': 'Answer', text: 'No. StockCut calculations run in the browser and project data is saved locally unless you choose to export or share it.' } }
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
