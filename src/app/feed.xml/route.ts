import { canonicalPages, siteUrl } from '@/data/pages';
import { siteDescription, siteLastModified, siteName } from '@/data/siteMeta';

export const dynamic = 'force-static';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function pageUrl(slug: string) {
  return `${siteUrl}${slug === '/' ? '' : slug}`;
}

export function GET() {
  const lastBuildDate = new Date(siteLastModified).toUTCString();
  const items = canonicalPages.map((page) => {
    const url = pageUrl(page.slug);
    return [
      '<item>',
      `<title>${escapeXml(page.title)}</title>`,
      `<link>${escapeXml(url)}</link>`,
      `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `<description>${escapeXml(page.description)}</description>`,
      `<category>${escapeXml(page.kind)}</category>`,
      `<pubDate>${lastBuildDate}</pubDate>`,
      '</item>'
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(siteName)} canonical pages</title>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    `<language>en-US</language>`,
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `<atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    '</channel>',
    '</rss>'
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
