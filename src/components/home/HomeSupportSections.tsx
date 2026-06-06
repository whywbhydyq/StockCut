import { seoIntentClusters, pagesForSlugs } from '@/data/seoIntentClusters';

export function PopularCutListLinks() {
  return (
    <section className="sc4-seo-links" aria-label="Popular cut list calculators">
      <h2>Popular cut list calculators</h2>
      <div>
        {seoIntentClusters.flatMap((cluster) => pagesForSlugs(cluster.primarySlugs)).slice(0, 12).map((page) => (
          <a key={page.slug} href={page.slug}>{page.primaryQuery ?? page.title}</a>
        ))}
      </div>
    </section>
  );
}

export function HomeFaqSection() {
  return (
    <section className="sc4-faq" aria-label="StockCut FAQ">
      <h2>StockCut FAQ</h2>
      <div>
        <details>
          <summary>Can I optimize 4×8 plywood sheets?</summary>
          <p>Yes. Use Sheet goods mode, load the 4×8 plywood sample, then replace the sample parts with your own cabinet, shelf, panel, or acrylic parts.</p>
        </details>
        <details>
          <summary>Can I use StockCut for pipe, tube, bar, or lumber?</summary>
          <p>Yes. Boards / lumber and Pipe / tube / bar modes keep separate drafts and generate straight-stock cutting sequences with kerf, waste, and unplaced-cut warnings.</p>
        </details>
        <details>
          <summary>Which page should I open first?</summary>
          <p>Use a sheet page when parts have width and height. Use a linear page when every cut is a single length. Use a kerf page when the math appears to fit but saw width changes the finished result.</p>
        </details>
        <details>
          <summary>Does StockCut upload my cut list?</summary>
          <p>No. Optimization runs in your browser. Your drafts are saved locally unless you choose to export a file or copy a share link.</p>
        </details>
      </div>
    </section>
  );
}
