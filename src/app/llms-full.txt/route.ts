import { canonicalPages, siteUrl } from '@/data/pages';
export const dynamic = 'force-static';
export function GET() {
  const lines = ['# StockCut public content index', ''];
  for (const page of canonicalPages) {
    lines.push(`## ${page.title}`, `${siteUrl}${page.slug === '/' ? '' : page.slug}`, page.description, '');
  }
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
