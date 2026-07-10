import { relatedPagesFor } from '@/data/seoIntentClusters';
import type { SeoPage } from '@/data/pages';

export function IntentNavigation({ page }: { page: SeoPage }) {
  const related = relatedPagesFor(page, 6);
  if (related.length === 0) return null;
  return (
    <section className="tool-card mt-4" aria-label="Continue your StockCut workflow">
      <h2 className="text-xl font-black text-stock-ink">Continue your workflow</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <a key={item.slug} className="rounded-2xl border border-stock-line bg-white p-3 no-underline hover:border-stock-accent hover:shadow-sm" href={item.slug}>
            <span className="block text-sm font-black text-stock-ink">{item.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
