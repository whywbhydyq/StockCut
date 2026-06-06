export const siteName = 'StockCut';
export const siteUrl = 'https://stockcut.ymirtool.com';
export const siteDescription = 'Optimize sheet and linear stock cuts with kerf, labels, waste, offcuts, and printable layouts. Works locally for plywood, MDF, lumber, tube, and pipe.';
export const siteLastModified = '2026-06-06';
export const siteContactEmail = 'ymirtool@ymirtool.com';
export const adSensePublisherId = 'ca-pub-1653188471819736';
export const siteOgImage = `${siteUrl}/stockcut-og.png`;
export const siteLogo = `${siteUrl}/icon-512.png`;
export const siteKeywords = [
  'cut list optimizer',
  'sheet cutting optimizer',
  'linear cutting optimizer',
  'plywood cut list',
  'saw kerf calculator',
  'lumber cut optimizer',
  'pipe cutting optimizer',
  'cutting layout calculator'
];

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: siteLogo,
      width: 512,
      height: 512
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteContactEmail,
      contactType: 'technical support'
    }
  };
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'en',
    publisher: { '@id': `${siteUrl}/#organization` },
    about: [
      { '@type': 'Thing', name: 'Cut list optimization' },
      { '@type': 'Thing', name: 'Sheet goods planning' },
      { '@type': 'Thing', name: 'Saw kerf' },
      { '@type': 'Thing', name: 'Linear stock cutting' }
    ]
  };
}
