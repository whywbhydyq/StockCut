'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { DisplayUnit, LinearOptimizationResult, LinearPartInput, LinearProjectInput, SheetOptimizationResult, SheetPartInput, SheetProjectInput } from '@/core/types';
import { sheetPresets, linearPresets } from '@/data/presets';
import { optimizeSheetProject } from '@/core/sheet-optimizer/guillotine';
import { optimizeLinearProject } from '@/core/linear-optimizer/bestFitDecreasing';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';
import { parseSheetPaste, parseLinearPaste } from '@/core/import/parsePaste';
import { parseSheetWorkbookFile, parseLinearWorkbookFile } from '@/core/import/parseWorkbook';
import { exportSheetResultCsv, exportLinearResultCsv, downloadText } from '@/core/export/exportCsv';
import { downloadSheetPdf, downloadLinearPdf } from '@/core/export/exportPdf';
import { downloadSheetDxf } from '@/core/export/exportDxf';
import { loadProject, saveProject } from '@/core/storage/projectStorage';
import { buildShareUrl } from '@/core/storage/shareProject';
import { trackEvent } from '@/core/analytics/trackEvent';

const SHEET_STORAGE_KEY = 'home-sheet-workspace-v1';
const LINEAR_STORAGE_KEY = 'home-linear-workspace-v1';

type HomeMode = 'sheet' | 'lumber' | 'tube';
type ActiveResult =
  | { kind: 'sheet'; result: SheetOptimizationResult }
  | { kind: 'linear'; result: LinearOptimizationResult }
  | null;

type ImportPreview =
  | { kind: 'sheet'; rows: SheetPartInput[] }
  | { kind: 'linear'; rows: LinearPartInput[] }
  | null;

function cloneProject<T>(project: T): T {
  return JSON.parse(JSON.stringify(project)) as T;
}

function newId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function compactDimension(value: string): string {
  return value.replace(/\s*in\b/i, '').replace(/\s*mm\b/i, '');
}

function isLinearMode(mode: HomeMode): boolean {
  return mode === 'lumber' || mode === 'tube';
}

function iconForMode(mode: HomeMode) {
  if (mode === 'sheet') {
    return (
      <svg viewBox="0 0 74 48" aria-hidden="true" className="h-10 w-14 shrink-0 text-slate-700">
        <path d="M7 26 43 10l24 12-36 16L7 26Z" fill="#f8fafc" stroke="currentColor" strokeWidth="2" />
        <path d="M15 26 43 14l15 7-36 12" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
    );
  }
  if (mode === 'lumber') {
    return (
      <svg viewBox="0 0 82 48" aria-hidden="true" className="h-10 w-16 shrink-0 text-slate-700">
        {[0, 1, 2, 3].map((offset) => (
          <path key={offset} d={`M8 ${18 + offset * 4} 54 ${8 + offset * 4} 74 ${18 + offset * 4} 28 ${29 + offset * 4}Z`} fill="#f8fafc" stroke="currentColor" strokeWidth="1.8" />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 82 48" aria-hidden="true" className="h-10 w-16 shrink-0 text-slate-700">
      <defs>
        <linearGradient id="tubeGradient" x1="0" x2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <path d="M22 16h44c6 0 10 4 10 9s-4 9-10 9H22Z" fill="url(#tubeGradient)" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="22" cy="25" rx="13" ry="9" fill="#f8fafc" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="22" cy="25" rx="7" ry="4.5" fill="#111827" opacity="0.85" />
    </svg>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-slate-200 px-2 py-2 text-center last:border-r-0">
      <span className="block text-[11px] font-medium text-slate-600">{label}</span>
      <strong className="mt-0.5 block font-mono text-base font-semibold text-slate-950">{value}</strong>
    </div>
  );
}

function StatusChip({ title, value, active }: { title: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className={active ? 'grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-sm text-emerald-700' : 'grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-sm text-slate-500'}>
        {active ? '✓' : '○'}
      </span>
      <span>
        <strong className="block text-xs text-slate-950">{title}</strong>
        <span className="text-[11px] text-slate-500">{value}</span>
      </span>
    </div>
  );
}

function ExampleSheetPreview({ mode }: { mode: HomeMode }) {
  const linear = isLinearMode(mode);
  return (
    <div className={`home-example-preview ${linear ? 'is-linear' : 'is-sheet'}`}>
      <div className="home-example-dimension home-example-dimension-y">{linear ? 'stock' : '48 in'}</div>
      <div className="home-example-canvas" aria-hidden="true">
        {linear ? (
          <>
            <span className="segment s1" />
            <span className="segment s2" />
            <span className="segment s3" />
            <span className="segment waste" />
          </>
        ) : (
          <>
            <span className="part p1" />
            <span className="part p2" />
            <span className="part p3" />
            <span className="part p4" />
            <span className="part p5" />
          </>
        )}
        <div className="home-example-copy">
          <strong>{linear ? 'Example stock preview' : 'Example sheet preview'}</strong>
          <span>Generated layout will use your parts</span>
        </div>
      </div>
      <div className="home-example-dimension home-example-dimension-x">{linear ? (mode === 'tube' ? '120 in' : '96 in') : '96 in'}</div>
    </div>
  );
}

function SheetResultPreview({ result, unit }: { result: SheetOptimizationResult; unit: DisplayUnit }) {
  const sheet = result.sheetsUsed[0];
  if (!sheet) return <ExampleSheetPreview mode="sheet" />;
  const scale = Math.min(100 / sheet.widthUm, 100 / sheet.heightUm);
  return (
    <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-slate-300 bg-white p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span>Sheet {sheet.sheetIndex} of {result.sheetsUsed.length}</span><span>{formatDimension(sheet.widthUm, unit)} × {formatDimension(sheet.heightUm, unit)}</span></div>
      <svg viewBox={`0 0 ${sheet.widthUm} ${sheet.heightUm}`} className="h-auto max-h-[260px] w-full rounded-lg bg-slate-50" role="img" aria-label="Optimized sheet layout preview">
        <rect width={sheet.widthUm} height={sheet.heightUm} fill="#f8fafc" stroke="#334155" strokeWidth={1 / scale} />
        <rect x={sheet.usableXUm} y={sheet.usableYUm} width={sheet.usableWidthUm} height={sheet.usableHeightUm} fill="none" stroke="#64748b" strokeDasharray={8 / scale} strokeWidth={1 / scale} />
        {sheet.offcuts.slice(0, 30).map((offcut, index) => <rect key={index} x={offcut.xUm} y={offcut.yUm} width={offcut.widthUm} height={offcut.heightUm} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1 / scale} />)}
        {sheet.placements.map((part, index) => (
          <g key={`${part.partId}-${part.instanceIndex}-${index}`}>
            <rect x={part.xUm} y={part.yUm} width={part.widthUm} height={part.heightUm} rx={2 / scale} fill={index % 3 === 0 ? '#dcfce7' : index % 3 === 1 ? '#ffedd5' : '#e0f2fe'} stroke="#334155" strokeWidth={1 / scale} />
            <text x={part.xUm + part.widthUm / 2} y={part.yUm + part.heightUm / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(Math.min(part.widthUm, part.heightUm) / 7, 65000)} fill="#0f172a">{part.partLabel.slice(0, 18)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function LinearResultPreview({ result, unit }: { result: LinearOptimizationResult; unit: DisplayUnit }) {
  const stock = result.stocksUsed[0];
  if (!stock) return <ExampleSheetPreview mode="lumber" />;
  return (
    <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-slate-300 bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span>Stock {stock.stockIndex} of {result.stocksUsed.length}</span><span>{formatDimension(stock.usableLengthUm, unit)} usable</span></div>
      <div className="relative h-20 overflow-hidden rounded-xl border border-slate-400 bg-slate-100">
        {stock.cuts.map((cut, index) => (
          <div key={`${cut.partId}-${cut.instanceIndex}-${index}`} className="absolute top-0 grid h-full place-items-center border-x border-slate-500 bg-emerald-50 px-1 text-center text-xs font-semibold text-slate-900" style={{ left: `${(cut.startUm / stock.usableLengthUm) * 100}%`, width: `${(cut.lengthUm / stock.usableLengthUm) * 100}%` }}>{cut.partLabel}</div>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-500">Used {formatDimension(stock.usedLengthUm, unit)} · offcut {formatDimension(stock.wasteLengthUm, unit)} · kerf cuts {stock.kerfCount}</p>
    </div>
  );
}

function IconButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="home-action-button">{children}</button>;
}

export function StockCutHomeWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<HomeMode>('sheet');
  const [sheetProject, setSheetProject] = useState<SheetProjectInput>(() => cloneProject(sheetPresets['imperial-sheet']));
  const [linearProject, setLinearProject] = useState<LinearProjectInput>(() => cloneProject(linearPresets['lumber-length']));
  const [result, setResult] = useState<ActiveResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState('');
  const [pendingImport, setPendingImport] = useState<ImportPreview>(null);

  useEffect(() => {
    setSheetProject(loadProject(SHEET_STORAGE_KEY, cloneProject(sheetPresets['imperial-sheet'])));
    setLinearProject(loadProject(LINEAR_STORAGE_KEY, cloneProject(linearPresets['lumber-length'])));
  }, []);

  useEffect(() => saveProject(SHEET_STORAGE_KEY, sheetProject), [sheetProject]);
  useEffect(() => saveProject(LINEAR_STORAGE_KEY, linearProject), [linearProject]);

  useEffect(() => {
    const applyHashMode = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#linear' || hash === '#lumber') {
        setMode('lumber');
        setLinearProject(cloneProject(linearPresets['lumber-length']));
        setResult(null);
        setError(null);
      }
      if (hash === '#tube' || hash === '#pipe') {
        setMode('tube');
        setLinearProject(cloneProject(linearPresets['pvc-pipe']));
        setResult(null);
        setError(null);
      }
      if (hash === '#sheet') {
        setMode('sheet');
        setResult(null);
        setError(null);
      }
    };
    applyHashMode();
    window.addEventListener('hashchange', applyHashMode);
    return () => window.removeEventListener('hashchange', applyHashMode);
  }, []);

  const activeProject = isLinearMode(mode) ? linearProject : sheetProject;
  const isSheetResult = result?.kind === 'sheet';
  const isLinearResult = result?.kind === 'linear';

  const summary = useMemo(() => {
    if (result?.kind === 'sheet') {
      return [
        ['Sheets used', String(result.result.sheetsUsed.length)],
        ['Yield', formatPercent(result.result.yieldRate)],
        ['Waste', formatPercent(result.result.wasteRate)],
        ['Unplaced', String(result.result.unplacedParts.length)],
        ['Est. stock cost', result.result.estimatedStockCost > 0 ? `$${result.result.estimatedStockCost.toFixed(2)}` : '—']
      ];
    }
    if (result?.kind === 'linear') {
      return [
        ['Stocks used', String(result.result.stocksUsed.length)],
        ['Yield', formatPercent(1 - result.result.wasteRate)],
        ['Waste', formatPercent(result.result.wasteRate)],
        ['Unplaced', String(result.result.unplacedCuts.length)],
        ['Est. stock cost', result.result.estimatedStockCost > 0 ? `$${result.result.estimatedStockCost.toFixed(2)}` : '—']
      ];
    }
    return [['Sheets used', '—'], ['Yield', '—'], ['Waste', '—'], ['Unplaced', '—'], ['Est. stock cost', '—']];
  }, [result]);

  const setModeAndPreset = (nextMode: HomeMode) => {
    setMode(nextMode);
    setResult(null);
    setError(null);
    setPendingImport(null);
    if (nextMode === 'lumber') setLinearProject(cloneProject(linearPresets['lumber-length']));
    if (nextMode === 'tube') setLinearProject(cloneProject(linearPresets['pvc-pipe']));
    trackEvent('sample_loaded', { mode: nextMode, sample: 'home-mode-switch' });
  };

  const updateSheetStock = (patch: Partial<SheetProjectInput['stock']>) => setSheetProject((project) => ({ ...project, stock: { ...project.stock, ...patch } }));
  const updateSheetPart = (id: string, patch: Partial<SheetPartInput>) => setSheetProject((project) => ({ ...project, parts: project.parts.map((part) => part.id === id ? { ...part, ...patch } : part) }));
  const updateLinearStock = (patch: Partial<LinearProjectInput['stock']>) => setLinearProject((project) => ({ ...project, stock: { ...project.stock, ...patch } }));
  const updateLinearPart = (id: string, patch: Partial<LinearPartInput>) => setLinearProject((project) => ({ ...project, parts: project.parts.map((part) => part.id === id ? { ...part, ...patch } : part) }));

  const generate = () => {
    setError(null);
    setPendingImport(null);
    try {
      if (isLinearMode(mode)) {
        trackEvent('optimize_linear_clicked', { source: 'home', mode });
        const nextResult = optimizeLinearProject(linearProject);
        setResult({ kind: 'linear', result: nextResult });
      } else {
        trackEvent('optimize_sheet_clicked', { source: 'home', mode });
        const nextResult = optimizeSheetProject(sheetProject);
        setResult({ kind: 'sheet', result: nextResult });
      }
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Optimization failed. Check dimensions, quantity, and kerf.');
    }
  };

  const loadSheetSample = () => {
    setMode('sheet');
    setSheetProject(cloneProject(sheetPresets['plywood-4x8']));
    setResult(null);
    setError(null);
    trackEvent('sample_loaded', { mode: 'sheet', sample: 'plywood-4x8', source: 'home' });
  };

  const loadLinearSample = (sample: 'lumber-length' | 'pvc-pipe' | 'steel-tube' | 'aluminum-extrusion') => {
    const nextMode: HomeMode = sample === 'lumber-length' ? 'lumber' : 'tube';
    setMode(nextMode);
    setLinearProject(cloneProject(linearPresets[sample]));
    setResult(null);
    setError(null);
    trackEvent('sample_loaded', { mode: 'linear', sample, source: 'home' });
  };

  const addPart = () => {
    if (isLinearMode(mode)) {
      setLinearProject((project) => ({ ...project, parts: [...project.parts, { id: newId('linear-part'), label: 'New cut', length: '', quantity: '1', material: project.stock.material ?? '' }] }));
      return;
    }
    setSheetProject((project) => ({ ...project, parts: [...project.parts, { id: newId('sheet-part'), label: 'New part', width: '', height: '', quantity: '1', allowRotation: true, material: project.stock.material ?? '' }] }));
  };

  const parsePastedRows = () => {
    if (!paste.trim()) {
      setError('Paste rows from Excel, Google Sheets, or a CSV-style table first.');
      return;
    }
    if (isLinearMode(mode)) {
      const parsed = parseLinearPaste(paste);
      if (!parsed.ok) {
        setPendingImport(null);
        setError(parsed.errors.map((item) => item.message).join('\n'));
        return;
      }
      setPendingImport({ kind: 'linear', rows: parsed.records });
    } else {
      const parsed = parseSheetPaste(paste);
      if (!parsed.ok) {
        setPendingImport(null);
        setError(parsed.errors.map((item) => item.message).join('\n'));
        return;
      }
      setPendingImport({ kind: 'sheet', rows: parsed.records });
    }
    setError(null);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    if (pendingImport.kind === 'sheet') setSheetProject((project) => ({ ...project, parts: pendingImport.rows }));
    if (pendingImport.kind === 'linear') setLinearProject((project) => ({ ...project, parts: pendingImport.rows }));
    setPendingImport(null);
    setPaste('');
    setPasteOpen(false);
    setResult(null);
    trackEvent('paste_import_used', { mode: pendingImport.kind, rows: pendingImport.rows.length, source: 'home' });
  };

  const importFile = (file?: File) => {
    if (!file) return;
    setError(null);
    const isWorkbook = /\.xlsx?$/.test(file.name.toLowerCase());
    const isJson = /\.json$/.test(file.name.toLowerCase()) || file.type === 'application/json';
    if (isJson) {
      void file.text().then((text) => {
        const parsed = JSON.parse(text) as SheetProjectInput | LinearProjectInput;
        if ('stock' in parsed && 'parts' in parsed && 'height' in (parsed as SheetProjectInput).stock) {
          setMode('sheet');
          setSheetProject(parsed as SheetProjectInput);
        } else {
          setMode('lumber');
          setLinearProject(parsed as LinearProjectInput);
        }
        setResult(null);
      }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not import JSON project.'));
      return;
    }
    if (isLinearMode(mode)) {
      const apply = (rows: LinearPartInput[]) => { setPendingImport({ kind: 'linear', rows }); setPasteOpen(true); };
      if (isWorkbook) void parseLinearWorkbookFile(file).then((parsed) => parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n'))).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read Excel file.'));
      else void file.text().then((text) => { const parsed = parseLinearPaste(text); parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')); }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read CSV file.'));
      return;
    }
    const apply = (rows: SheetPartInput[]) => { setPendingImport({ kind: 'sheet', rows }); setPasteOpen(true); };
    if (isWorkbook) void parseSheetWorkbookFile(file).then((parsed) => parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n'))).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read Excel file.'));
    else void file.text().then((text) => { const parsed = parseSheetPaste(text); parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')); }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read CSV file.'));
  };

  const copySummary = () => {
    if (!result) return;
    const text = result.kind === 'sheet'
      ? `StockCut: ${result.result.sheetsUsed.length} sheets, yield ${formatPercent(result.result.yieldRate)}, waste ${formatPercent(result.result.wasteRate)}, unplaced ${result.result.unplacedParts.length}.`
      : `StockCut: ${result.result.stocksUsed.length} stock lengths, waste ${formatPercent(result.result.wasteRate)}, unplaced ${result.result.unplacedCuts.length}.`;
    void navigator.clipboard.writeText(text);
  };

  const copyShareLink = () => {
    const link = isLinearMode(mode) ? buildShareUrl('linear-1d', linearProject) : buildShareUrl('sheet-2d', sheetProject);
    void navigator.clipboard.writeText(link);
    trackEvent('share_link_created', { mode: isLinearMode(mode) ? 'linear' : 'sheet', source: 'home' });
  };

  const exportCsv = () => {
    if (result?.kind === 'sheet') downloadText('stockcut-sheet-result.csv', exportSheetResultCsv(result.result, sheetProject.unit), 'text/csv');
    if (result?.kind === 'linear') downloadText('stockcut-linear-result.csv', exportLinearResultCsv(result.result, linearProject.unit), 'text/csv');
  };

  const downloadPdf = () => {
    if (result?.kind === 'sheet') void downloadSheetPdf(sheetProject, result.result);
    if (result?.kind === 'linear') void downloadLinearPdf(linearProject, result.result);
  };

  const exportJson = () => downloadText('stockcut-project.json', JSON.stringify(activeProject, null, 2), 'application/json');

  const warnings = result?.kind === 'sheet' ? result.result.warnings : result?.kind === 'linear' ? result.result.warnings : [];
  const hasResult = Boolean(result);

  return (
    <main className="home-shell" id="sheet">
      <section className="home-hero">
        <h1>Cut list optimizer for sheet goods, boards, pipe, and tube</h1>
        <p>Enter your stock size and parts. StockCut creates a kerf-aware layout, cut sequence, waste estimate, and printable cut list in your browser.</p>
        <div className="home-trust">▣ Saved locally in your browser <span>·</span> No upload</div>
      </section>

      <section className="home-mode-grid" aria-label="Choose what you need to cut">
        {([
          ['sheet', 'Sheet goods', 'Plywood · MDF · acrylic · melamine'],
          ['lumber', 'Boards / lumber', '2×4 · rails · shelves · straight stock'],
          ['tube', 'Pipe / tube / bar', 'PVC · steel tube · aluminum extrusion']
        ] as Array<[HomeMode, string, string]>).map(([key, title, description]) => (
          <button key={key} type="button" className={`home-mode-card ${mode === key ? 'is-active' : ''}`} onClick={() => setModeAndPreset(key)}>
            {iconForMode(key)}
            <span><strong>{title}</strong><small>{description}</small></span>
            <span className="home-radio">{mode === key ? '✓' : ''}</span>
          </button>
        ))}
      </section>

      <section className="home-workbench-grid">
        <section className="home-panel home-input-panel" id="import">
          <div className="home-panel-title"><span>1</span><h2>Enter stock and parts</h2></div>

          {!isLinearMode(mode) ? (
            <>
              <div className="home-fieldset-title">Stock size</div>
              <div className="home-fields sheet-fields">
                <label>Width<input value={compactDimension(sheetProject.stock.width)} onChange={(event) => updateSheetStock({ width: event.target.value })} /><span>in</span></label>
                <label>Height<input value={compactDimension(sheetProject.stock.height)} onChange={(event) => updateSheetStock({ height: event.target.value })} /><span>in</span></label>
                <label>Quantity<input value={sheetProject.stock.quantity} onChange={(event) => updateSheetStock({ quantity: event.target.value })} /></label>
                <label>Kerf<select value={sheetProject.kerf} onChange={(event) => setSheetProject((project) => ({ ...project, kerf: event.target.value }))}><option value="1/8">1/8 in</option><option value="1/16">1/16 in</option><option value="3mm">3 mm</option><option value="0">0</option></select></label>
              </div>
              <div className="home-table-header"><strong>Parts</strong><button type="button" onClick={addPart}>+ Add part</button></div>
              <div className="home-table-wrap">
                <table className="home-parts-table">
                  <thead><tr><th>#</th><th>Label</th><th>Width (in)</th><th>Height (in)</th><th>Qty</th><th>Rotation</th><th /></tr></thead>
                  <tbody>{sheetProject.parts.map((part, index) => (
                    <tr key={part.id}>
                      <td>{index + 1}</td>
                      <td><input value={part.label} onChange={(event) => updateSheetPart(part.id, { label: event.target.value })} /></td>
                      <td><input value={compactDimension(part.width)} onChange={(event) => updateSheetPart(part.id, { width: event.target.value })} /></td>
                      <td><input value={compactDimension(part.height)} onChange={(event) => updateSheetPart(part.id, { height: event.target.value })} /></td>
                      <td><input value={part.quantity} onChange={(event) => updateSheetPart(part.id, { quantity: event.target.value })} /></td>
                      <td><select value={part.allowRotation ? 'yes' : 'no'} onChange={(event) => updateSheetPart(part.id, { allowRotation: event.target.value === 'yes' })}><option value="yes">Allowed</option><option value="no">Locked</option></select></td>
                      <td><button type="button" aria-label={`Remove ${part.label}`} onClick={() => setSheetProject((project) => ({ ...project, parts: project.parts.filter((row) => row.id !== part.id) }))}>⌫</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="home-fieldset-title">Stock length</div>
              <div className="home-fields linear-fields">
                <label>Length<input value={linearProject.stock.length} onChange={(event) => updateLinearStock({ length: event.target.value })} /></label>
                <label>Quantity<input value={linearProject.stock.quantity} onChange={(event) => updateLinearStock({ quantity: event.target.value })} /></label>
                <label>Kerf<select value={linearProject.kerf} onChange={(event) => setLinearProject((project) => ({ ...project, kerf: event.target.value }))}><option value="1/8">1/8 in</option><option value="2mm">2 mm</option><option value="3mm">3 mm</option><option value="0">0</option></select></label>
              </div>
              <div className="home-table-header"><strong>Cuts</strong><button type="button" onClick={addPart}>+ Add cut</button></div>
              <div className="home-table-wrap">
                <table className="home-parts-table">
                  <thead><tr><th>#</th><th>Label</th><th>Length</th><th>Qty</th><th>Material</th><th>Notes</th><th /></tr></thead>
                  <tbody>{linearProject.parts.map((part, index) => (
                    <tr key={part.id}>
                      <td>{index + 1}</td>
                      <td><input value={part.label} onChange={(event) => updateLinearPart(part.id, { label: event.target.value })} /></td>
                      <td><input value={part.length} onChange={(event) => updateLinearPart(part.id, { length: event.target.value })} /></td>
                      <td><input value={part.quantity} onChange={(event) => updateLinearPart(part.id, { quantity: event.target.value })} /></td>
                      <td><input value={part.material ?? ''} onChange={(event) => updateLinearPart(part.id, { material: event.target.value })} /></td>
                      <td><input value={part.notes ?? ''} onChange={(event) => updateLinearPart(part.id, { notes: event.target.value })} /></td>
                      <td><button type="button" aria-label={`Remove ${part.label}`} onClick={() => setLinearProject((project) => ({ ...project, parts: project.parts.filter((row) => row.id !== part.id) }))}>⌫</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          {error && <pre className="home-error">{error}</pre>}
          {warnings.length > 0 && <div className="home-warning">{warnings.slice(0, 3).map((warning, index) => <p key={`${warning.code}-${index}`}>{warning.message}</p>)}</div>}

          <button type="button" className="home-generate" onClick={generate}>▦ {isLinearMode(mode) ? 'Generate cutting sequence' : 'Generate cut layout'}<small>Create optimized layout, cut list, and waste estimate</small></button>

          <div className="home-secondary-actions">
            <button type="button" onClick={isLinearMode(mode) ? () => loadLinearSample(mode === 'tube' ? 'pvc-pipe' : 'lumber-length') : loadSheetSample}>{isLinearMode(mode) ? (mode === 'tube' ? 'PVC pipe sample' : '8 ft lumber sample') : 'Load 4×8 plywood sample'}</button>
            <button type="button" onClick={() => setPasteOpen((open) => !open)}>Paste from spreadsheet</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>Import CSV / Excel</button>
            <input ref={fileInputRef} className="sr-only" type="file" accept=".csv,.txt,.xlsx,.xls,.json,text/csv,text/plain,application/json" onChange={(event: ChangeEvent<HTMLInputElement>) => importFile(event.currentTarget.files?.[0])} />
          </div>

          {pasteOpen && <div className="home-paste-box">
            <label>Paste rows from Excel / Google Sheets<textarea value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={isLinearMode(mode) ? 'Label\tLength\tQuantity\tMaterial\tNotes' : 'Label\tWidth\tHeight\tQuantity\tRotate\tMaterial'} /></label>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={parsePastedRows}>Preview pasted rows</button><button type="button" onClick={() => { setPasteOpen(false); setPendingImport(null); }}>Cancel</button></div>
            {pendingImport && <div className="home-import-preview"><strong>{pendingImport.rows.length} rows parsed.</strong><span>Existing rows will be replaced only after confirmation.</span><button type="button" onClick={confirmImport}>Confirm import</button></div>}
          </div>}

          <details className="home-advanced-inline">
            <summary>Advanced: reusable offcuts and mixed stock sizes</summary>
            <div className="home-advanced-note">Open Advanced controls below for strategy, grain direction, trim margins, edge banding, extra stock / offcut library, manual adjustment, and project import/export.</div>
          </details>
        </section>

        <section className="home-panel home-preview-panel">
          <div className="home-panel-title"><span>2</span><h2>See the layout before you cut</h2></div>
          <div className="home-preview-callout"><strong>{hasResult ? 'Optimized layout preview' : 'Preview will appear here after calculation'}</strong><span>{hasResult ? 'Review the first layout, then print or export your shop output.' : 'Example preview'}</span></div>
          {result?.kind === 'sheet' && <SheetResultPreview result={result.result} unit={sheetProject.unit} />}
          {result?.kind === 'linear' && <LinearResultPreview result={result.result} unit={linearProject.unit} />}
          {!result && <ExampleSheetPreview mode={mode} />}
          <div className="home-summary-grid">{summary.map(([label, value]) => <SummaryCell key={label} label={label} value={value} />)}</div>
          <div className="home-status-grid">
            <StatusChip title="Printable cut list" value={hasResult ? 'Ready' : 'Ready after calculation'} active={hasResult} />
            <StatusChip title="Cut sequence" value={hasResult ? 'Generated' : 'Generated after calculation'} active={hasResult} />
            <StatusChip title="Share link" value={hasResult ? 'Available' : 'Available after calculation'} active={hasResult} />
          </div>
        </section>
      </section>

      <div className="home-how"><strong>How it works:</strong> Enter your stock and parts → Generate layout → Review results → Print or export your cut list.</div>

      <section className="home-bottom-grid" id="examples">
        <div className="home-bottom-card">
          <h3>Exports and shop output</h3><p>Print, PDF, CSV, share link, DXF and more</p>
          <div className="home-export-grid">
            <IconButton disabled={!hasResult} onClick={() => window.print()}>▣ Print / Save PDF</IconButton>
            <IconButton disabled={!hasResult} onClick={downloadPdf}>⇩ Download PDF</IconButton>
            <IconButton disabled={!hasResult} onClick={exportCsv}>▤ Export CSV</IconButton>
            <IconButton disabled={!hasResult} onClick={copySummary}>▢ Copy summary</IconButton>
            <IconButton disabled={!hasResult} onClick={copyShareLink}>↗ Copy share link</IconButton>
            <IconButton disabled={!isSheetResult} onClick={() => result?.kind === 'sheet' && downloadSheetDxf(result.result)}>DXF Download</IconButton>
          </div>
          <details className="home-more"><summary>More exports</summary><button type="button" onClick={exportJson}>Download project JSON</button></details>
        </div>
        <div className="home-bottom-card">
          <h3>Advanced controls</h3><p>Strategy, grain direction, trim, edge banding, offcuts, and more</p>
          <div className="home-advanced-grid">
            <label>Strategy<select value={activeProject.strategy ?? 'least_waste'} onChange={(event) => isLinearMode(mode) ? setLinearProject((project) => ({ ...project, strategy: event.target.value as LinearProjectInput['strategy'] })) : setSheetProject((project) => ({ ...project, strategy: event.target.value as SheetProjectInput['strategy'] }))}><option value="least_waste">Least waste</option><option value="least_stock">Least stock</option><option value="fewer_cuts">Fewer cuts</option></select></label>
            {!isLinearMode(mode) && <label>Grain direction<select value={sheetProject.stock.grainDirection ?? 'none'} onChange={(event) => updateSheetStock({ grainDirection: event.target.value as SheetProjectInput['stock']['grainDirection'] })}><option value="none">None</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>}
            <button type="button" onClick={() => alert('Trim margins, edge banding, extra stock, offcut library, and manual adjustment are kept in the full optimizer pages. This homepage keeps them below the main workflow so first-time users can start quickly.')}>Open advanced notes</button>
            <button type="button" onClick={exportJson}>Project import / export</button>
          </div>
          <small>Kerf, units, decimals, trim margins and offcuts stay available without blocking the first calculation.</small>
        </div>
        <div className="home-bottom-card">
          <h3>Help and resources</h3><p>How it works, tips, and examples</p>
          <div className="home-help-buttons"><button type="button" onClick={() => setPasteOpen(true)}>How it works</button><button type="button" onClick={loadSheetSample}>Examples</button><button type="button" onClick={() => alert('StockCut runs in your browser. It creates practical cut lists for rectangular sheet goods and straight stock. It is not CNC toolpath software.')}>FAQ</button></div>
          <div className="home-tip">Tip: Start with a sample, then tweak parts or settings to improve yield.</div>
        </div>
      </section>

      <p className="home-privacy-note">▣ All calculations run in your browser. Your data never leaves your device.</p>
    </main>
  );
}
