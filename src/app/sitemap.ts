import type { MetadataRoute } from 'next';
import { canonicalPages, siteUrl } from '@/data/pages';

const highPriorityToolKinds = new Set(['sheet', 'linear']);

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalPages.map((page) => ({
    url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`,
    lastModified: new Date('2026-05-30'),
    changeFrequency: page.kind === 'guide' ? 'monthly' : 'weekly',
    priority: page.slug === '/' ? 1 : highPriorityToolKinds.has(page.kind) ? 0.9 : 0.6
  }));
}
