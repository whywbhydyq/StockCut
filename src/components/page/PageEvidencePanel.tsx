import type { SeoPage } from '@/data/pages';
import { evidenceForPage } from '@/data/pageEvidence';

export function PageEvidencePanel({ page }: { page: SeoPage }) {
  const evidence = evidenceForPage(page);

  return (
    <section className="tool-card mt-4" aria-label="Evidence, scope, and verification notes">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stock-muted">How this tool works</p>
          <h2 className="mt-2 text-xl font-black text-stock-ink">{evidence.scopeLabel}</h2>
          <p className="mt-2 text-sm leading-6 text-stock-muted">{evidence.calculationScope}</p>
          <p className="mt-3 rounded-2xl border border-stock-line bg-white p-3 text-sm leading-6 text-stock-muted"><strong className="text-stock-ink">Calculation basis:</strong> {evidence.sourceOfTruth}</p>
          <p className="mt-3 rounded-2xl border border-stock-line bg-white p-3 text-sm leading-6 text-stock-muted"><strong className="text-stock-ink">Privacy model:</strong> {evidence.privacyNote}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-stock-line bg-white p-4">
            <h3 className="font-black text-stock-ink">Verify before cutting</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stock-muted">
              {evidence.verificationChecklist.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-stock-line bg-white p-4">
            <h3 className="font-black text-stock-ink">Boundaries</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stock-muted">
              {evidence.boundaries.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-stock-line bg-stock-paper p-4 md:col-span-2">
            <h3 className="font-black text-stock-ink">Result reference</h3>
            <p className="mt-2 text-sm leading-6 text-stock-muted">{evidence.citationSummary}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stock-muted">Exports: {evidence.exportFormats.join(' · ')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
