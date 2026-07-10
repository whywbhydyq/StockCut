import { canonicalPages, siteUrl } from '@/data/pages';
export const dynamic = 'force-static';
export function GET() {
  const lines = [
    '# StockCut',
    '',
    'StockCut provides browser-based sheet and linear cutting calculators, kerf tools, and practical cutting guides.',
    'Calculations are planning estimates and should be verified against physical material, blade kerf, defects, grain direction, and shop safety procedures.',
    '',
    '## Public pages',
    ...canonicalPages.map((page) => `- ${page.title}: ${siteUrl}${page.slug === '/' ? '' : page.slug}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
