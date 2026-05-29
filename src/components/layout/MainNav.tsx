import Link from 'next/link';
import { SITE } from '@/src/content/site';

const navItems = [
  { href: '/room-ac-btu-calculator/', label: 'AC BTU' },
  { href: '/dehumidifier-size-calculator/', label: 'Dehumidifier' },
  { href: '/cfm-by-ach-calculator/', label: 'CFM / ACH' },
  { href: '/bathroom-fan-cfm-calculator/', label: 'Bathroom fan' },
  { href: '/guides/cfm-vs-ach/', label: 'Guides' },
  { href: '/templates/hvac-contractor-questions/', label: 'Questions' }
];

export function MainNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur no-print">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-black text-ink no-underline">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-700 text-white">H</span>
          {SITE.name}
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm font-semibold" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
