import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoAds } from '@/components/ads/AdSenseAutoAds';
import { PwaRegister } from '@/components/common/PwaRegister';
import { HomeHeader } from '@/components/home/HomeHeader';
import './globals.css';

const siteDescription = 'Optimize sheet and linear stock cuts with kerf, labels, waste, offcuts, and printable layouts. Works locally for plywood, MDF, lumber, tube, and pipe.';

export const metadata: Metadata = {
  metadataBase: new URL('https://stockcut.ymirtool.com'),
  title: { default: 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut', template: '%s - StockCut' },
  description: siteDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut',
    description: siteDescription,
    url: 'https://stockcut.ymirtool.com',
    siteName: 'StockCut',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'StockCut Cut List Optimizer',
    description: siteDescription
  },
  other: {
    'baidu-site-verification': 'codeva-Kosxs1CyYp'
  },
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="baidu-site-verification" content="codeva-Kosxs1CyYp" />
        <meta name="google-adsense-account" content="ca-pub-1653188471819736" />
      </head>
      <body>
        <AdSenseAutoAds />
        <PwaRegister />
        <HomeHeader />
        {children}
        <footer className="mx-auto flex max-w-[1800px] flex-wrap justify-center gap-4 px-6 py-8 text-sm text-slate-500">
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link>
        </footer>
      </body>
    </html>
  );
}
