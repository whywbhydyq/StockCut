import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/src/components/pages/PageRenderer';
import { allContentPages, findPageBySlug } from '@/src/content/pages';
import { SITE } from '@/src/content/site';
import { structuredDataForPage } from '@/src/lib/seo/structured-data';

type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return allContentPages.map((page) => ({
    slug: page.path.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean)
  }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const page = findPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE.url}${page.path}`
    }
  };
}

export default function DynamicPage({ params }: { params: Params }) {
  const page = findPageBySlug(params.slug);
  if (!page) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataForPage(page)) }} />
      <PageRenderer page={page} />
    </>
  );
}

export const dynamicParams = false;
export const revalidate = false;
