import { siteContactEmail, siteDescription, siteName, siteUrl } from '@/data/siteMeta';

export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${siteName}`,
    '',
    siteDescription,
    '',
    '## Site',
    `URL: ${siteUrl}`,
    'Project: Local-first browser cut-list optimizer for sheet goods and linear stock.',
    'Data model: Cut lists are processed in the browser; share links use URL hash data rather than server upload.',
    '',
    '## Contact',
    `Corrections and bug reports: mailto:${siteContactEmail}`,
    'Security contact: /.well-known/security.txt',
    '',
    '## Machine-readable indexes',
    `${siteUrl}/sitemap.xml`,
    `${siteUrl}/feed.xml`,
    `${siteUrl}/llms.txt`,
    `${siteUrl}/llms-full.txt`,
    '',
    '## Boundaries',
    'StockCut provides planning estimates only. It is not CNC CAM, G-code output, certified manufacturing output, structural engineering, or a substitute for shop safety checks.',
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
