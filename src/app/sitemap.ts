import type { MetadataRoute } from 'next';
import { pages, siteUrl } from '@/data/pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({ url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`, lastModified: new Date('2026-05-24'), changeFrequency: page.kind === 'guide' ? 'monthly' : 'weekly', priority: page.slug === '/' ? 1 : page.kind === 'sheet' || page.kind === 'linear' ? 0.9 : 0.6 }));
}
