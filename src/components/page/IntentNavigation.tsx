import { clusterForPage, relatedPagesFor } from '@/data/seoIntentClusters';
import type { SeoPage } from '@/data/pages';

export function IntentNavigation({ page }: { page: SeoPage }) {
  const cluster = clusterForPage(page);
  const related = relatedPagesFor(page, 6);
  if (!cluster || related.length === 0) return null;

  return (
    <section className="tool-card mt-4" aria-label="Choose the right StockCut page">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">Search intent match</p>
          <h2 className="mt-2 text-xl font-black text-stock-ink">{cluster.label}</h2>
          <p className="mt-2 text-sm leading-6 text-stock-muted">{cluster.summary}</p>
          <p className="mt-2 rounded-2xl border border-stock-line bg-white p-3 text-sm text-stock-muted"><strong className="text-stock-ink">When to use this cluster:</strong> {cluster.whenToUse}</p>
        </div>
        <div>
          <h3 className="font-black text-stock-ink">Related calculators and guides</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <a key={item.slug} className="rounded-2xl border border-stock-line bg-white p-3 no-underline hover:border-stock-accent hover:shadow-sm" href={item.slug}>
                <span className="block text-sm font-black text-stock-ink">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-stock-muted">{item.description}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
