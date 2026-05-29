import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { PwaRegister } from '@/components/common/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://stockcut.ymirtool.com'),
  title: { default: 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut', template: '%s - StockCut' },
  description: 'Optimize sheet and linear stock cuts with kerf, labels, waste, offcuts, and printable layouts. Works locally for plywood, MDF, lumber, tube, and pipe.',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest'
};

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-lg font-black text-white shadow-sm" aria-hidden="true">S</span>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1653188471819736" />
      </head>
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1653188471819736"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <PwaRegister />
        <header className="home-site-header">
          <div className="home-site-header-inner">
            <Link href="/" className="home-logo" aria-label="StockCut home"><LogoMark /><span>StockCut</span></Link>
            <nav className="home-nav" aria-label="Primary navigation">
              <Link href="/#sheet">Sheet</Link>
              <Link href="/#sheet">Linear</Link>
              <Link href="/saw-kerf-calculator">Kerf</Link>
              <Link href="/#import">Examples</Link>
              <Link href="/#import">↥ Import</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mx-auto flex max-w-[1800px] flex-wrap justify-center gap-4 px-6 py-8 text-sm text-slate-500">
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link>
        </footer>
      </body>
    </html>
  );
}
