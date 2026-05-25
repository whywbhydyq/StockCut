import type { Metadata } from 'next';
import { PageShell } from '@/components/page/PageShell';
import { pageBySlug } from '@/data/pages';

const page = pageBySlug('/guides/grain-direction-in-cut-lists');
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: page.slug }, openGraph: { title: page.title, description: page.description, url: page.slug } };
export default function Page() { return <PageShell page={page} />; }
