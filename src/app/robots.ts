import type { MetadataRoute } from 'next';
import { siteUrl } from '@/data/pages';
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
