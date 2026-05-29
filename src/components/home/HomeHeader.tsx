'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-lg font-black text-white shadow-sm" aria-hidden="true">S</span>
  );
}

function navClass(active: boolean) {
  return active ? 'is-active' : undefined;
}

export function HomeHeader() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setHash(window.location.hash || '#sheet');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const isHome = pathname === '/';
  const active = isHome ? hash : pathname;

  return (
    <header className="home-site-header">
      <div className="home-site-header-inner">
        <Link href="/" className="home-logo" aria-label="StockCut home"><LogoMark /><span>StockCut</span></Link>
        <nav className="home-nav" aria-label="Primary navigation">
          <Link href="/#sheet" className={navClass(isHome && (active === '#sheet' || active === ''))}>Sheet</Link>
          <Link href="/#linear" className={navClass(isHome && active === '#linear')}>Linear</Link>
          <Link href="/saw-kerf-calculator" className={navClass(pathname === '/saw-kerf-calculator')}>Kerf</Link>
          <Link href="/#examples" className={navClass(isHome && active === '#examples')}>Examples</Link>
          <Link href="/#import" className={navClass(isHome && active === '#import')}>↥ Import</Link>
        </nav>
      </div>
    </header>
  );
}
