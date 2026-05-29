'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DisplayUnit, LinearPartInput, LinearProjectInput, LinearOptimizationResult, LinearStockInput } from '@/core/types';
import { linearPresets, type LinearPresetKey } from '@/data/presets';
import { optimizeLinearProject } from '@/core/linear-optimizer/bestFitDecreasing';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';
import { parseLinearPaste } from '@/core/import/parsePaste';
import { parseLinearWorkbookFile } from '@/core/import/parseWorkbook';
import { exportLinearResultCsv, downloadText } from '@/core/export/exportCsv';
import { downloadLinearPdf } from '@/core/export/exportPdf';
import { loadProject, saveProject } from '@/core/storage/projectStorage';
import { linearInventoryToStock, loadLinearOffcutInventory, saveLinearOffcutInventory, type LinearOffcutInventoryItem } from '@/core/storage/offcutInventory';
import { buildShareUrl, readShareProjectFromHash } from '@/core/storage/shareProject';
import { trackEvent } from '@/core/analytics/trackEvent';
import { runLinearOptimizationInWorker, type WorkerProgress } from '@/core/worker/optimizerWorkerClient';
import { LinearLayoutBar } from '@/components/layout-viewer/LinearLayoutBar';

const key = 'linear-project-v3';
function clonePreset(preset: LinearProjectInput): LinearProjectInput { return JSON.parse(JSON.stringify(preset)) as LinearProjectInput; }
function newId(prefix: string): string { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function emptyExtraStock(unit: DisplayUnit, material?: string): LinearStockInput { return { id: newId('linear-stock'), label: 'Reusable offcut', length: unit === 'mm' ? '1200mm' : '48 in', quantity: '1', trimStart: '0', trimEnd: '0', material, cost: '0', isOffcut: true }; }

export function LinearOptimizerTool({ preset = 'imperial-linear' }: { preset?: LinearPresetKey }) {
  const fallback = clonePreset(linearPresets[preset] ?? linearPresets['imperial-linear']);
  const [project, setProject] = useState<LinearProjectInput>(fallback);
  const [result, setResult] = useState<LinearOptimizationResult | null>(null);
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pendingParts, setPendingParts] = useState<LinearPartInput[] | null>(null);
  const [workerProgress, setWorkerProgress] = useState<WorkerProgress | null>(null);
  const [inventory, setInventory] = useState<LinearOffcutInventoryItem[]>([]);
  const cancelWorkerRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const shared = readShareProjectFromHash<LinearProjectInput>('linear-1d');
    setProject(shared ?? loadProject(`${key}:${preset}`, fallback));
    setInventory(loadLinearOffcutInventory());
  }, []);
  useEffect(() => saveProject(`${key}:${preset}`, project), [project, preset]);

  const updateStock = (name: keyof LinearProjectInput['stock'], value: string | boolean) => setProject((p) => ({ ...p, stock: { ...p.stock, [name]: value } }));
  const updateExtraStock = (id: string, patch: Partial<LinearStockInput>) => setProject((p) => ({ ...p, extraStocks: (p.extraStocks ?? []).map((stock) => stock.id === id ? { ...stock, ...patch } : stock) }));
  const updatePart = (id: string, patch: Partial<LinearPartInput>) => setProject((p) => ({ ...p, parts: p.parts.map((part) => part.id === id ? { ...part, ...patch } : part) }));
  const summary = useMemo(() => result ? [['Stocks', String(result.stocksUsed.length)], ['Waste', formatPercent(result.wasteRate)], ['Unplaced', String(result.unplacedCuts.length)], ['Kerf loss', formatDimension(result.totalKerfLossUm, project.unit)], ['Estimated stock cost', result.estimatedStockCost > 0 ? `$${result.estimatedStockCost.toFixed(2)}` : '—']] : [], [result, project.unit]);
  const patterns = useMemo(() => {
    if (!result) return [] as Array<{ key: string; count: number; labels: string }>;
    const map = new Map<string, { count: number; labels: string }>();
    for (const stock of result.stocksUsed) {
      const labels = stock.cuts.map((cut) => `${cut.partLabel} ${formatDimension(cut.lengthUm, project.unit)}`).join(' + ');
      const key = stock.cuts.map((cut) => `${cut.partLabel}:${cut.lengthUm}`).join('|') || 'empty';
      const current = map.get(key);
      map.set(key, { count: (current?.count ?? 0) + 1, labels });
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value })).filter((pattern) => pattern.count > 1);
  }, [project.unit, result]);
  const importPaste = () => {
    const parsed = parseLinearPaste(paste);
    if (!parsed.ok) { setPasteError(parsed.errors.map((e) => e.message).join('\n')); setPendingParts(null); return; }
    setPasteError(null);
    setPendingParts(parsed.records);
  };
  const confirmPaste = () => {
    if (!pendingParts) return;
    setProject((p) => ({ ...p, parts: pendingParts }));
    trackEvent('paste_import_used', { mode: 'linear', rows: pendingParts.length });
    setPendingParts(null);
    setPaste('');
  };
  const importCsvFile = (file?: File) => {
    if (!file) return;
    void file.text().then((text) => {
      const parsed = parseLinearPaste(text);
      if (!parsed.ok) { setPasteError(parsed.errors.map((e) => e.message).join('\n')); setPendingParts(null); return; }
      setPasteError(null);
      setPendingParts(parsed.records);
      trackEvent('csv_import_used', { mode: 'linear' });
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not read CSV file.'));
  };
  const importWorkbookFile = (file?: File) => {
    if (!file) return;
    void parseLinearWorkbookFile(file).then((parsed) => {
      if (!parsed.ok) { setPasteError(parsed.errors.map((e) => e.message).join('\n')); setPendingParts(null); return; }
      setPasteError(null);
      setPendingParts(parsed.records);
      trackEvent('xlsx_import_used', { mode: 'linear' });
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not read Excel workbook.'));
  };
  const importJsonFile = (file?: File) => {
    if (!file) return;
    void file.text().then((text) => {
      const parsed = JSON.parse(text) as Partial<LinearProjectInput>;
      if (!parsed.stock || !Array.isArray(parsed.parts) || !parsed.unit || typeof parsed.kerf !== 'string') throw new Error('JSON file is not a StockCut linear project.');
      setProject(parsed as LinearProjectInput);
      trackEvent('json_import_used', { mode: 'linear' });
      setResult(null);
      setPasteError(null);
      setPendingParts(null);
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not import JSON file.'));
  };
  const addRow = () => setProject((p) => ({ ...p, parts: [...p.parts, { id: newId('cut'), label: `Cut ${p.parts.length + 1}`, length: '', quantity: '1', material: p.stock.material, miterAngle: '', notes: '' }] }));
  const duplicateRow = (part: LinearPartInput) => setProject((p) => ({ ...p, parts: [...p.parts, { ...part, id: newId('cut'), label: `${part.label} copy` }] }));
  const addExtraStock = () => setProject((p) => ({ ...p, extraStocks: [...(p.extraStocks ?? []), emptyExtraStock(p.unit, p.stock.material)] }));
  const resultOffcutsAsStock = () => result ? result.stocksUsed
    .filter((stock) => stock.wasteLengthUm > 0)
    .sort((a, b) => b.wasteLengthUm - a.wasteLengthUm)
    .slice(0, 12)
    .map((stock): LinearStockInput => ({
      id: newId('linear-offcut'),
      label: `Offcut B${stock.stockIndex}`,
      length: formatDimension(stock.wasteLengthUm, project.unit),
      quantity: '1',
      trimStart: '0',
      trimEnd: '0',
      material: stock.material ?? project.stock.material,
      cost: '0',
      isOffcut: true
    })) : [];
  const addResultOffcutsToStock = () => {
    const reusable = resultOffcutsAsStock();
    if (!reusable.length) return;
    setProject((p) => ({ ...p, extraStocks: [...(p.extraStocks ?? []), ...reusable] }));
    trackEvent('offcuts_saved_to_stock', { mode: 'linear', count: reusable.length });
  };
  const saveResultOffcutsToLibrary = () => {
    const now = new Date().toISOString();
    const reusable = resultOffcutsAsStock().map((stock): LinearOffcutInventoryItem => ({
      id: newId('linear-library-offcut'),
      label: stock.label,
      length: stock.length,
      material: stock.material,
      unit: project.unit,
      source: 'Linear optimizer result',
      savedAt: now
    }));
    if (!reusable.length) return;
    const next = [...reusable, ...inventory].slice(0, 100);
    setInventory(next);
    saveLinearOffcutInventory(next);
    trackEvent('offcuts_saved_to_library', { mode: 'linear', count: reusable.length });
  };
  const loadInventoryAsStock = () => {
    const stockRows = inventory.map(linearInventoryToStock);
    if (!stockRows.length) return;
    setProject((p) => ({ ...p, extraStocks: [...(p.extraStocks ?? []), ...stockRows] }));
    trackEvent('offcut_library_loaded', { mode: 'linear', count: stockRows.length });
  };
  const clearInventory = () => {
    setInventory([]);
    saveLinearOffcutInventory([]);
    trackEvent('offcut_library_cleared', { mode: 'linear' });
  };
  const removeExtraStock = (id: string) => setProject((p) => ({ ...p, extraStocks: (p.extraStocks ?? []).filter((stock) => stock.id !== id) }));

  return (
    <section className="app-workspace" id="linear-tool">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div><h2 className="text-2xl font-black tracking-tight">1D Linear Cutting Optimizer</h2><p className="text-sm text-stock-muted">Best-fit decreasing for lumber, steel tube, aluminum extrusion, PVC, rebar, and other straight stock. Multiple stock lengths and reusable offcuts are supported. Miter/angle fields are printed as planning notes; they do not change straight-stock geometry.</p></div>
        <p className="rounded-full border border-stock-line px-3 py-1 text-xs text-stock-muted">Saved locally in your browser</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label>Unit<select value={project.unit} onChange={(e) => { trackEvent('unit_changed', { mode: 'linear' }); setProject({ ...project, unit: e.target.value as DisplayUnit }); }}><option value="in">inch</option><option value="ft-in">feet-inch display</option><option value="mm">mm</option><option value="cm">cm</option></select></label>
        <label>Strategy<select value={project.strategy ?? 'least_waste'} onChange={(e) => setProject({ ...project, strategy: e.target.value as LinearProjectInput['strategy'] })}><option value="least_waste">Least waste</option><option value="least_stock">Least stock</option><option value="fewer_cuts">Fewer cuts</option></select></label>
        <label>Kerf<input value={project.kerf} onChange={(e) => { trackEvent('kerf_changed', { mode: 'linear' }); setProject({ ...project, kerf: e.target.value }); }} /></label>
        <label>Primary stock quantity<input value={project.stock.quantity} onChange={(e) => updateStock('quantity', e.target.value)} /></label>
        <label>Primary stock length<input value={project.stock.length} onChange={(e) => updateStock('length', e.target.value)} /></label>
        <label>Material<input value={project.stock.material ?? ''} onChange={(e) => updateStock('material', e.target.value)} /></label>
        <label>Cost per stock<input value={project.stock.cost ?? ''} onChange={(e) => updateStock('cost', e.target.value)} placeholder="12.50" /></label>
        <label>Trim start<input value={project.stock.trimStart} onChange={(e) => updateStock('trimStart', e.target.value)} /></label>
        <label>Trim end<input value={project.stock.trimEnd} onChange={(e) => updateStock('trimEnd', e.target.value)} /></label>
      </div>

      <div className="no-print mt-5 rounded-2xl border border-stock-line bg-[#fffaf2] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div><h3 className="font-bold">Additional stock lengths / reusable offcuts</h3><p className="text-sm text-stock-muted">Use this for mixed standard lengths or leftover straight stock.</p></div>
          <button className="btn-secondary" onClick={addExtraStock}>Add stock / offcut</button>
        </div>
        <div className="mt-3 rounded-2xl border border-dashed border-stock-line bg-white/70 p-3"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><p className="text-sm text-stock-muted"><strong className="text-stock-ink">Offcut library:</strong> {inventory.length} saved straight offcut{inventory.length === 1 ? '' : 's'} in this browser.</p><div className="flex flex-wrap gap-2"><button className="btn-secondary" disabled={!inventory.length} onClick={loadInventoryAsStock}>Load library into stock</button><button className="btn-secondary" disabled={!inventory.length} onClick={clearInventory}>Clear library</button></div></div>{inventory.length > 0 && <p className="mt-2 text-xs text-stock-muted">Latest: {inventory.slice(0, 4).map((item) => `${item.label} ${item.length}`).join(' · ')}</p>}</div>
        {(project.extraStocks ?? []).length > 0 && <div className="mt-3 overflow-x-auto rounded-2xl border border-stock-line bg-white"><table className="w-full min-w-[820px] text-sm"><thead><tr className="bg-[#f0e6d8]"><th className="p-2 text-left">Label</th><th className="p-2 text-left">Length</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Material</th><th className="p-2 text-left">Cost</th><th className="p-2 text-left">Offcut</th><th className="p-2 text-left">Actions</th></tr></thead><tbody>{(project.extraStocks ?? []).map((stock) => <tr key={stock.id} className="border-t border-stock-line"><td className="p-2"><input value={stock.label} onChange={(e) => updateExtraStock(stock.id, { label: e.target.value })} /></td><td className="p-2"><input value={stock.length} onChange={(e) => updateExtraStock(stock.id, { length: e.target.value })} /></td><td className="p-2"><input value={stock.quantity} onChange={(e) => updateExtraStock(stock.id, { quantity: e.target.value })} /></td><td className="p-2"><input value={stock.material ?? ''} onChange={(e) => updateExtraStock(stock.id, { material: e.target.value })} /></td><td className="p-2"><input value={stock.cost ?? ''} onChange={(e) => updateExtraStock(stock.id, { cost: e.target.value })} /></td><td className="p-2"><input type="checkbox" checked={Boolean(stock.isOffcut)} onChange={(e) => updateExtraStock(stock.id, { isOffcut: e.target.checked })} /></td><td className="p-2"><button className="btn-danger" onClick={() => removeExtraStock(stock.id)}>Remove</button></td></tr>)}</tbody></table></div>}
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-stock-line bg-white">
        <table className="w-full min-w-[1060px] text-sm"><thead><tr className="bg-[#f0e6d8]"><th className="p-2 text-left">Label</th><th className="p-2 text-left">Length</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Material</th><th className="p-2 text-left">Miter / angle note</th><th className="p-2 text-left">Shop notes</th><th className="p-2 text-left">Actions</th></tr></thead><tbody>{project.parts.map((part) => <tr key={part.id} className="border-t border-stock-line"><td className="p-2"><input value={part.label} onChange={(e) => updatePart(part.id, { label: e.target.value })} /></td><td className="p-2"><input value={part.length} onChange={(e) => updatePart(part.id, { length: e.target.value })} /></td><td className="p-2"><input value={part.quantity} onChange={(e) => updatePart(part.id, { quantity: e.target.value })} /></td><td className="p-2"><input value={part.material ?? ''} onChange={(e) => updatePart(part.id, { material: e.target.value })} /></td><td className="p-2"><input value={part.miterAngle ?? ''} placeholder="45° miter" onChange={(e) => updatePart(part.id, { miterAngle: e.target.value })} /></td><td className="p-2"><input value={part.notes ?? ''} placeholder="cut both ends" onChange={(e) => updatePart(part.id, { notes: e.target.value })} /></td><td className="flex gap-2 p-2"><button className="btn-secondary" onClick={() => duplicateRow(part)}>Copy</button><button className="btn-danger" onClick={() => setProject((p) => ({ ...p, parts: p.parts.filter((x) => x.id !== part.id) }))}>Remove</button></td></tr>)}</tbody></table>
      </div>
      <div className="no-print mt-4 flex flex-wrap gap-3"><button className="btn-primary" onClick={addRow}>Add cut</button><button className="btn-primary" onClick={() => { trackEvent('optimize_linear_clicked', { strategy: project.strategy ?? 'least_waste', execution: 'worker' }); setResult(null); setPasteError(null); const job = runLinearOptimizationInWorker(project, setWorkerProgress); cancelWorkerRef.current = job.cancel; setWorkerProgress({ percent: 1, message: 'Starting layout optimization.' }); void job.promise.then((nextResult) => setResult(nextResult)).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Optimization failed.')).finally(() => { cancelWorkerRef.current = null; setWorkerProgress(null); }); }}>Optimize</button><button className="btn-secondary" onClick={() => { trackEvent('sample_loaded', { mode: 'linear', sample: 'imperial-linear' }); setProject(clonePreset(linearPresets['imperial-linear'])); setResult(null); }}>8 ft sample</button><button className="btn-secondary" onClick={() => { trackEvent('sample_loaded', { mode: 'linear', sample: 'metric-linear' }); setProject(clonePreset(linearPresets['metric-linear'])); setResult(null); }}>6 m sample</button>{result && <><button className="btn-secondary" onClick={() => { trackEvent('csv_export_clicked', { mode: 'linear' }); downloadText('stockcut-linear-result.csv', exportLinearResultCsv(result, project.unit), 'text/csv'); }}>CSV export</button><button className="btn-secondary" onClick={() => { trackEvent('json_export_clicked', { mode: 'linear' }); downloadText('stockcut-linear-project.json', JSON.stringify(project, null, 2), 'application/json'); }}>JSON export</button><button className="btn-secondary" onClick={() => navigator.clipboard.writeText(`StockCut linear: ${result.stocksUsed.length} stocks, waste ${formatPercent(result.wasteRate)}, estimated stock cost ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`)}>Copy summary</button><button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(buildShareUrl('linear-1d', project)); trackEvent('share_link_created', { mode: 'linear' }); }}>Copy share link</button><button className="btn-secondary" onClick={addResultOffcutsToStock}>Use offcuts as stock</button><button className="btn-secondary" onClick={saveResultOffcutsToLibrary}>Save offcuts to library</button><button className="btn-secondary" onClick={() => { trackEvent('pdf_export_clicked', { mode: 'linear' }); void downloadLinearPdf(project, result); }}>Download PDF file</button><button className="btn-secondary" onClick={() => { trackEvent('print_clicked', { mode: 'linear' }); window.print(); }}>Browser Print / Save PDF</button></>}</div>
      {workerProgress && <div className="no-print mt-4 rounded-2xl border border-stock-line bg-white p-4"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><strong>Optimizing layout</strong><p className="text-sm text-stock-muted">{workerProgress.message}</p></div><button className="btn-secondary" onClick={() => { cancelWorkerRef.current?.(); cancelWorkerRef.current = null; setWorkerProgress(null); setPasteError('Optimization cancelled.'); trackEvent('optimization_cancelled', { mode: 'linear' }); }}>Cancel</button></div><progress className="mt-3 w-full" max={100} value={workerProgress.percent}>{workerProgress.percent}%</progress></div>}<div className="no-print mt-4"><label>Paste from Excel / Google Sheets<textarea className="mt-2 min-h-24" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Label&#9;Length&#9;Quantity&#9;Material&#9;Miter angle&#9;Notes" /></label><div className="mt-2 flex flex-wrap gap-2"><button className="btn-secondary" onClick={importPaste}>Preview pasted rows</button><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import CSV file<input className="sr-only" type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(e) => importCsvFile(e.currentTarget.files?.[0])} /></label><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import Excel .xlsx<input className="sr-only" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={(e) => importWorkbookFile(e.currentTarget.files?.[0])} /></label><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import JSON project<input className="sr-only" type="file" accept="application/json,.json" onChange={(e) => importJsonFile(e.currentTarget.files?.[0])} /></label></div>{pasteError && <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{pasteError}</pre>}{pendingParts && <div className="mt-3 rounded-2xl border border-stock-line bg-white p-4"><h3 className="font-bold">Paste preview</h3><p className="text-sm text-stock-muted">{pendingParts.length} rows parsed. Existing rows will not be replaced until you confirm.</p><div className="mt-2 flex gap-2"><button className="btn-primary" onClick={confirmPaste}>Confirm import</button><button className="btn-secondary" onClick={() => setPendingParts(null)}>Cancel</button></div></div>}</div>
      {result && <div className="mt-6"><div className="grid gap-3 md:grid-cols-5">{summary.map(([label, value]) => <div key={label} className="rounded-2xl border border-stock-line bg-white p-4"><span className="text-xs uppercase text-stock-muted">{label}</span><strong className="block text-2xl">{value}</strong></div>)}</div>{result.warnings.length > 0 && <div className="mt-4 rounded-2xl status-warning">{result.warnings.map((w, i) => <p key={i}>{w.message}</p>)}</div>}{result.stocksUsed.map((stock) => <LinearLayoutBar key={stock.stockIndex} stock={stock} unit={project.unit} />)}{patterns.length > 0 && <div className="print-safe rounded-2xl border border-stock-line bg-white p-4"><h3 className="font-bold">Repeated cutting patterns</h3><ul className="mt-2 list-disc pl-5 text-sm text-stock-muted">{patterns.map((pattern) => <li key={pattern.key}>Cut this pattern {pattern.count} times: {pattern.labels}</li>)}</ul></div>}{result.unplacedCuts.length > 0 && <div className="rounded-2xl status-danger"><h3 className="font-bold">Unplaced cuts</h3>{result.unplacedCuts.map((cut, i) => <p key={`${cut.partId}-${i}`}>{cut.label}: {cut.reason}</p>)}</div>}</div>}
    </section>
  );
}
