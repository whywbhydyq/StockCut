import { runPublicSheetBenchmarks } from '@/core/benchmarks/sheetBenchmarks';
import { formatPercent } from '@/core/units/formatDimension';

export function OptimizerBenchmarkSection() {
  const results = runPublicSheetBenchmarks();

  return (
    <section className="sc4-benchmark-section" aria-labelledby="optimizer-benchmark-title">
      <div>
        <span className="sc4-benchmark-kicker">Reproducible cases</span>
        <h2 id="optimizer-benchmark-title">What the sheet optimizer actually produces</h2>
        <p>
          These cases run during the production build against the same deterministic heuristic used by the tool. They are not an optimality proof.
          The lower bound uses area only and intentionally ignores kerf, geometry, grain, and cut-order constraints.
        </p>
      </div>
      <div className="sc4-benchmark-table-wrap">
        <table>
          <thead>
            <tr><th>Case</th><th>Sheets</th><th>Area lower bound</th><th>Yield</th><th>Placed</th><th>Cut steps</th></tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td><strong>{result.label}</strong><span>{result.purpose}</span></td>
                <td>{result.sheetsUsed}</td>
                <td>{result.areaLowerBoundSheets}</td>
                <td>{formatPercent(result.yieldRate)}</td>
                <td>{result.placedParts}</td>
                <td>{result.cutSteps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sc4-benchmark-note">Algorithm class: multi-order guillotine heuristic. Results are reproducible for the published inputs; they do not claim the global minimum number of sheets.</p>
    </section>
  );
}
