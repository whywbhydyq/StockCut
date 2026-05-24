import type { Metadata } from 'next';
import { PageShell } from '@/components/page/PageShell';
import { pageBySlug } from '@/data/pages';

export const metadata: Metadata = { title: 'Free Sheet Cutting Optimizer with Kerf', description: pageBySlug('/').description, alternates: { canonical: '/' } };
export default function HomePage() { return <PageShell page={pageBySlug('/')} />; }
