import Link from 'next/link';

export function CardGrid({ items }: { items: Array<{ href: string; title: string; description: string }> }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-3xl border border-line bg-white p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <strong className="text-lg text-ink">{item.title}</strong>
          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
        </Link>
      ))}
    </div>
  );
}
