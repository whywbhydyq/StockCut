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

  const openImport = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('stockcut-open-import', '1');
      if (isHome) window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('stockcut:open-import')));
    }
  };

  return (
    <header className="sc4-site-header">
      <div className="sc4-site-header-inner">
        <Link href="/" className="sc4-logo" aria-label="StockCut home"><LogoMark /><span>StockCut</span></Link>
        <nav className="sc4-nav" aria-label="Primary navigation">
          <Link href="/#sheet" className={navClass(isHome && (active === '#sheet' || active === ''))}>Sheet</Link>
          <Link href="/#linear" className={navClass(isHome && active === '#linear')}>Linear</Link>
          <Link href="/#tube" className={navClass(isHome && active === '#tube')}>Tube</Link>
          <Link href="/saw-kerf-calculator" className={navClass(pathname === '/saw-kerf-calculator')}>Kerf</Link>
          <Link href="/#examples" className={navClass(isHome && active === '#examples')}>Examples</Link>
          <Link href="/#import" onClick={openImport} className={navClass(isHome && active === '#import')}>↥ Import</Link>
        </nav>
      </div>
    </header>
  );
}
