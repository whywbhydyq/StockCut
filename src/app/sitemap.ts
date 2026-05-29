import type { MetadataRoute } from 'next';
import { pages, siteUrl } from '@/data/pages';

const canonicalSlugs = new Set([
  '/',
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/saw-kerf-calculator',
  '/4x8-plywood-cut-list-optimizer',
  '/steel-tube-cutting-optimizer',
  '/cabinet-cut-list-optimizer',
  '/pvc-pipe-cutting-optimizer',
  '/lumber-length-cutting-optimizer',
  '/guides/how-to-account-for-saw-kerf',
  '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet',
  '/guides/reduce-plywood-waste',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/about',
  '/contact'
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return pages
    .filter((page) => canonicalSlugs.has(page.slug))
    .map((page) => ({
      url: `${siteUrl}${page.slug === '/' ? '' : page.slug}`,
      lastModified: new Date('2026-05-24'),
      changeFrequency: page.kind === 'guide' ? 'monthly' : 'weekly',
      priority: page.slug === '/' ? 1 : page.kind === 'sheet' || page.kind === 'linear' ? 0.9 : 0.6
    }));
}
