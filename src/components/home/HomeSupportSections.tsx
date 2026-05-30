export function PopularCutListLinks() {
  return (
    <section className="sc4-seo-links" aria-label="Popular cut list calculators">
      <h2>Popular cut list calculators</h2>
      <div>
        <a href="/4x8-plywood-cut-list-optimizer">4x8 plywood cut list optimizer</a>
        <a href="/sheet-cutting-optimizer">Sheet cutting optimizer</a>
        <a href="/linear-cutting-optimizer">Linear cutting optimizer</a>
        <a href="/pvc-pipe-cutting-optimizer">PVC pipe cutting optimizer</a>
        <a href="/lumber-length-cutting-optimizer">Lumber length cutting optimizer</a>
        <a href="/steel-tube-cutting-optimizer">Steel tube cutting optimizer</a>
        <a href="/saw-kerf-calculator">Saw kerf calculator</a>
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
          <summary>Does StockCut upload my cut list?</summary>
          <p>No. Optimization runs in your browser. Your drafts are saved locally unless you choose to export a file or copy a share link.</p>
        </details>
      </div>
    </section>
  );
}
