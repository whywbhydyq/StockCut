import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { PwaRegister } from '@/components/common/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://stockcut.ymirtool.com'),
  title: { default: 'StockCut — Free Cut List Optimizer', template: '%s — StockCut' },
  description: 'Free local-first sheet and linear cut list optimizer with kerf, labels, printable layouts, CSV/JSON export, and browser-only processing.',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest'
};

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
        <header className="sticky top-0 z-20 border-b border-stock-line bg-stock-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight no-underline">StockCut</Link>
            <nav className="flex flex-wrap gap-3 text-sm font-semibold text-stock-muted">
              <Link href="/sheet-cutting-optimizer">Sheet Optimizer</Link>
              <Link href="/linear-cutting-optimizer">Linear Optimizer</Link>
              <Link href="/saw-kerf-calculator">Kerf Calculator</Link>
              <Link href="/4x8-plywood-cut-list-optimizer">4×8 Plywood</Link>
              <Link href="/steel-tube-cutting-optimizer">Steel Tube</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mx-auto flex max-w-7xl flex-wrap gap-4 px-4 py-8 text-sm text-stock-muted">
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link>
        </footer>
      </body>
    </html>
  );
}
