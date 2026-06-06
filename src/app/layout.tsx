import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { AdSenseAutoAds } from '@/components/ads/AdSenseAutoAds';
import { siteDescription, siteKeywords, siteName, siteOgImage, siteUrl } from '@/data/siteMeta';
import { PwaRegister } from '@/components/common/PwaRegister';
import { HomeHeader } from '@/components/home/HomeHeader';
import './globals.css';

const defaultTitle = 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut';

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#7a4f2c'
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  generator: 'Next.js',
  title: { default: defaultTitle, template: '%s - StockCut' },
  description: siteDescription,
  keywords: siteKeywords,
  alternates: { canonical: '/' },
  openGraph: {
    title: defaultTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: siteOgImage,
        width: 1200,
        height: 630,
        alt: 'StockCut cut list optimizer with sheet layout blocks and kerf-aware planning summary'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} Cut List Optimizer`,
    description: siteDescription,
    images: [siteOgImage]
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'default'
  },
  other: {
    'baidu-site-verification': 'codeva-Kosxs1CyYp'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  category: 'technology',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="baidu-site-verification" content="codeva-Kosxs1CyYp" />
        <meta name="google-adsense-account" content="ca-pub-1653188471819736" />
        <link rel="alternate" type="application/rss+xml" title="StockCut canonical pages" href="/feed.xml" />
      </head>
      <body>
        <AdSenseAutoAds />
        <PwaRegister />
        <HomeHeader />
        {children}
        <footer className="mx-auto flex max-w-[1800px] flex-wrap justify-center gap-4 px-6 py-8 text-sm text-slate-500">
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/site-map">Site map</Link><Link href="/seo-quality">Quality gates</Link><Link href="/seo-release-checklist">Release checklist</Link><Link href="/seo-production-signals">Production signals</Link><Link href="/seo-optimization-decisions">Optimization decisions</Link><Link href="/seo-evidence-ledger">Evidence ledger</Link><Link href="/seo-change-control">Change control</Link><Link href="/feed.xml">RSS</Link><Link href="/seo-status.json">SEO status</Link>
        </footer>
      </body>
    </html>
  );
}
