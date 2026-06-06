import { siteContactEmail, siteUrl } from '@/data/siteMeta';

export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `Contact: mailto:${siteContactEmail}`,
    `Policy: ${siteUrl}/contact`,
    `Preferred-Languages: en`,
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    'Expires: 2027-06-06T00:00:00Z',
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
