import type { Metadata } from 'next';
import Link from 'next/link';
import { HvacHomeWorkspace } from '@/src/components/home/HvacHomeWorkspace';
import { SourceList } from '@/src/components/assumptions/SourceList';
import { CardGrid } from '@/src/components/ui/CardGrid';
import { allTools, guidePages, longTailPages } from '@/src/content/pages';
import { SITE } from '@/src/content/site';

const HOME_TITLE = 'AC BTU, Dehumidifier Size & CFM Calculators';
const HOME_DESCRIPTION =
  'Estimate room AC BTU, dehumidifier pints per day and CFM by ACH from room inputs. Results show formulas, assumptions and professional boundaries.';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description:
      'Enter room dimensions and conditions to estimate AC BTU, dehumidifier capacity or airflow with visible formulas and planning boundaries.',
    url: '/',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: HOME_TITLE,
    description:
      'Estimate AC BTU, dehumidifier pints/day or CFM by ACH from room inputs, with formulas and assumptions shown.'
  }
};

const focusedTools = allTools.filter((tool) =>
  ['/room-ac-btu-calculator/', '/dehumidifier-size-calculator/', '/cfm-by-ach-calculator/', '/ach-calculator/', '/bathroom-fan-cfm-calculator/', '/window-ac-size-calculator/'].includes(tool.path)
);

const focusedGuides = [...guidePages, ...longTailPages].filter((page) =>
  ['/guides/how-many-btu-per-square-foot/', '/guides/why-oversized-ac-does-not-dehumidify/', '/guides/cfm-vs-ach/', '/dehumidifier/what-size-dehumidifier-for-1000-sq-ft-basement/', '/room-size/what-size-ac-for-300-sq-ft/'].includes(page.path)
);

const homeStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HVAC Calculators',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    description: HOME_DESCRIPTION,
    url: SITE.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which HVAC calculator should I start with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with AC BTU for room cooling, Dehumidifier Size for moisture control, and CFM by ACH for airflow math. These are preliminary room-level planning tools, not professional HVAC design.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are these results final HVAC sizing recommendations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Results are educational preliminary estimates. Final equipment selection, duct design, code compliance, safety and installation decisions require qualified professional review.'
        }
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE.url
      }
    ]
  }
];

export default function HomePage() {
  return (
    <>
      {homeStructuredData.map((item, index) => (
        <script
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <HvacHomeWorkspace />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Core HVAC calculators</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Use these as focused follow-up pages when you need a dedicated calculator, extra examples or direct sharing links.</p>
          </div>
          <Link className="font-bold" href="/templates/hvac-contractor-questions/">Open planning questions</Link>
        </div>
        <CardGrid items={focusedTools.map((tool) => ({ href: tool.path, title: tool.h1, description: tool.description }))} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-3xl font-black tracking-tight">Guides and worked examples</h2>
        <CardGrid items={focusedGuides.map((page) => ({ href: page.path, title: page.h1, description: page.description }))} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SourceList />
      </section>
    </>
  );
}
