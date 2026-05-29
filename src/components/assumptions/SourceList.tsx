import { SOURCES } from '@/src/lib/config/sources';

export function SourceList() {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black tracking-tight">Sources and maintained assumptions</h2>
      <p className="mt-2 text-slate-600">Sizing assumptions are centralized and show source URLs, check dates and notes.</p>
      <ul className="mt-4 space-y-3">
        {SOURCES.map((source) => (
          <li key={source.id} className="rounded-2xl bg-slate-50 p-4">
            <a href={source.url} rel="nofollow noopener" className="font-bold">
              {source.name}
            </a>
            <p className="text-sm text-slate-600">Checked {source.lastCheckedAt}. {source.notes}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
