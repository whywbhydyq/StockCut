import type { MetadataRoute } from 'next';
import { siteUrl } from '@/data/pages';
import { publicCrawlerAgents } from '@/data/seoGovernance';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: publicCrawlerAgents.map((userAgent) => ({ userAgent, allow: '/' })),
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
