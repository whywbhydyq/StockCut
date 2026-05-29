import type { MetadataRoute } from 'next';
import { SITE } from '@/src/content/site';
import { allPagePaths } from '@/src/content/pages';

const primaryPaths = new Set([
  '/',
  '/room-ac-btu-calculator/',
  '/cfm-by-ach-calculator/',
  '/ach-calculator/',
  '/bathroom-fan-cfm-calculator/',
  '/dehumidifier-size-calculator/',
  '/basement-dehumidifier-size-calculator/',
  '/guides/cfm-vs-ach/',
  '/guides/how-many-btu-per-square-foot/'
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return allPagePaths.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date('2026-05-22'),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : primaryPaths.has(path) ? 0.9 : path.includes('calculator') ? 0.75 : 0.6
  }));
}
