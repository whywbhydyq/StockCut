import type { Metadata } from 'next';
import { PageShell } from '@/components/page/PageShell';
import { pageBySlug } from '@/data/pages';
import { siteOgImage } from '@/data/siteMeta';

const page = pageBySlug('/cabinet-cut-list-optimizer');
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: page.slug }, openGraph: { title: page.title, description: page.description, url: page.slug, images: [{ url: siteOgImage, width: 1200, height: 630, alt: page.title }] }, twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [siteOgImage] } };
export default function Page() { return <PageShell page={page} />; }
