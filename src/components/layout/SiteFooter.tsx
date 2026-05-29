import Link from 'next/link';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line py-10 text-sm text-slate-600 no-print">
      <div className="mx-auto max-w-6xl px-4">
        <p>{PROFESSIONAL_BOUNDARY}</p>
        <p className="mt-3 flex flex-wrap gap-3">
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/disclaimer/">Disclaimer</Link>
          <Link href="/contact/">Contact</Link>
        </p>
      </div>
    </footer>
  );
}
