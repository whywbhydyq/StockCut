export function PageSupportSections() {
  return (
    <>
      <section className="guide-card grid gap-4 md:grid-cols-3">
        <div className="tool-card">
          <h2 className="font-black">What StockCut does</h2>
          <p className="text-sm text-stock-muted">It creates practical rectangular sheet and straight-stock layouts with kerf, labels, waste, offcuts, cut sequence tables, and print-friendly output.</p>
        </div>
        <div className="tool-card">
          <h2 className="font-black">What it does not do</h2>
          <p className="text-sm text-stock-muted">No accounts, cloud save, CNC toolpaths, G-code, true angle-cut geometry, circular parts, triangle parts, polygon nesting, enterprise inventory, or AI cabinet design. The DXF export is a rectangular planning outline, not machine-ready CAM.</p>
        </div>
        <div className="tool-card">
          <h2 className="font-black">Privacy model</h2>
          <p className="text-sm text-stock-muted">Cut lists are processed in the browser. Autosave uses localStorage. The tool does not upload or cloud-save your project data.</p>
        </div>
      </section>
      <section className="tool-card mt-4" aria-label="StockCut tool FAQ">
        <h2 className="font-black">Quick FAQ</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <details className="rounded-xl border border-stock-line bg-stock-paper p-3">
            <summary className="cursor-pointer font-bold text-stock-ink">Does StockCut upload my cut list?</summary>
            <p className="mt-2 text-sm text-stock-muted">No. StockCut calculates and autosaves in your browser and does not cloud-save cut lists.</p>
          </details>
          <details className="rounded-xl border border-stock-line bg-stock-paper p-3">
            <summary className="cursor-pointer font-bold text-stock-ink">Does StockCut guarantee a mathematically optimal layout?</summary>
            <p className="mt-2 text-sm text-stock-muted">No. It creates practical kerf-aware layouts for planning and printing; verify before cutting.</p>
          </details>
          <details className="rounded-xl border border-stock-line bg-stock-paper p-3">
            <summary className="cursor-pointer font-bold text-stock-ink">Can I print or save a PDF?</summary>
            <p className="mt-2 text-sm text-stock-muted">Yes. Use the print button and choose Save as PDF in your browser.</p>
          </details>
        </div>
      </section>
    </>
  );
}
