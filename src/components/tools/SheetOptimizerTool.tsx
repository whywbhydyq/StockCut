'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DisplayUnit, EdgeBanding, GrainLock, SheetPartInput, SheetProjectInput, SheetOptimizationResult, StockSheetInput } from '@/core/types';
import { sheetPresets, type SheetPresetKey } from '@/data/presets';
import { optimizeSheetProject } from '@/core/sheet-optimizer/guillotine';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';
import { parseSheetPaste } from '@/core/import/parsePaste';
import { parseSheetWorkbookFile } from '@/core/import/parseWorkbook';
import { exportSheetResultCsv, downloadText } from '@/core/export/exportCsv';
import { downloadSheetPdf } from '@/core/export/exportPdf';
import { loadProject, saveProject } from '@/core/storage/projectStorage';
import { buildShareUrl, readShareProjectFromHash } from '@/core/storage/shareProject';
import { trackEvent } from '@/core/analytics/trackEvent';
import { runSheetOptimizationInWorker, type WorkerProgress } from '@/core/worker/optimizerWorkerClient';
import { SheetLayoutSvg } from '@/components/layout-viewer/SheetLayoutSvg';

const key = 'sheet-project-v3';

function clonePreset(preset: SheetProjectInput): SheetProjectInput {
  return JSON.parse(JSON.stringify(preset)) as SheetProjectInput;
}

function newId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sheetCutSequence(result: SheetOptimizationResult): Array<{ sheet: number; step: number; label: string; x: number; y: number; width: number; height: number; rotated: boolean }> {
  return result.sheetsUsed.flatMap((sheet) => sheet.placements
    .slice()
    .sort((a, b) => a.yUm - b.yUm || a.xUm - b.xUm)
    .map((placement, index) => ({ sheet: sheet.sheetIndex, step: index + 1, label: `${placement.partLabel} #${placement.instanceIndex}`, x: placement.xUm, y: placement.yUm, width: placement.widthUm, height: placement.heightUm, rotated: placement.rotated })));
}

function emptyExtraStock(unit: DisplayUnit, material?: string): StockSheetInput {
  return { id: newId('sheet-stock'), label: 'Reusable offcut', width: unit === 'mm' ? '600mm' : '24 in', height: unit === 'mm' ? '900mm' : '36 in', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material, cost: '0', isOffcut: true, grainDirection: 'none' };
}

function edgeValue(edge: EdgeBanding | undefined, side: keyof EdgeBanding): boolean {
  return Boolean(edge?.[side]);
}

export function SheetOptimizerTool({ preset = 'imperial-sheet' }: { preset?: SheetPresetKey }) {
  const fallback = clonePreset(sheetPresets[preset] ?? sheetPresets['imperial-sheet']);
  const [project, setProject] = useState<SheetProjectInput>(fallback);
  const [result, setResult] = useState<SheetOptimizationResult | null>(null);
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pendingParts, setPendingParts] = useState<SheetPartInput[] | null>(null);
  const [workerProgress, setWorkerProgress] = useState<WorkerProgress | null>(null);
  const cancelWorkerRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const shared = readShareProjectFromHash<SheetProjectInput>('sheet-2d');
    setProject(shared ?? loadProject(`${key}:${preset}`, fallback));
  }, []);
  useEffect(() => saveProject(`${key}:${preset}`, project), [project, preset]);

  const updateStock = (name: keyof SheetProjectInput['stock'], value: string | boolean) => setProject((p) => ({ ...p, stock: { ...p.stock, [name]: value } }));
  const updateExtraStock = (id: string, patch: Partial<StockSheetInput>) => setProject((p) => ({ ...p, extraStocks: (p.extraStocks ?? []).map((stock) => stock.id === id ? { ...stock, ...patch } : stock) }));
  const updatePart = (id: string, patch: Partial<SheetPartInput>) => setProject((p) => ({ ...p, parts: p.parts.map((part) => part.id === id ? { ...part, ...patch } : part) }));
  const updateEdge = (id: string, side: keyof EdgeBanding, value: boolean) => updatePart(id, { edgeBanding: { ...(project.parts.find((part) => part.id === id)?.edgeBanding ?? {}), [side]: value } });
  const sequence = useMemo(() => result ? sheetCutSequence(result) : [], [result]);
  const summary = useMemo(() => result ? [
    ['Sheets', String(result.sheetsUsed.length)],
    ['Yield', formatPercent(result.yieldRate)],
    ['Waste', formatPercent(result.wasteRate)],
    ['Unplaced', String(result.unplacedParts.length)],
    ['Estimated stock cost', result.estimatedStockCost > 0 ? `$${result.estimatedStockCost.toFixed(2)}` : '—']
  ] : [], [result]);

  const optimize = () => {
    trackEvent('optimize_sheet_clicked', { strategy: project.strategy ?? 'least_waste', execution: 'worker' });
    setResult(null);
    setPasteError(null);
    const job = runSheetOptimizationInWorker(project, setWorkerProgress);
    cancelWorkerRef.current = job.cancel;
    setWorkerProgress({ percent: 1, message: 'Starting worker optimization.' });
    void job.promise
      .then((nextResult) => setResult(nextResult))
      .catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Optimization failed.'))
      .finally(() => {
        cancelWorkerRef.current = null;
        setWorkerProgress(null);
      });
  };
  const cancelOptimization = () => {
    cancelWorkerRef.current?.();
    cancelWorkerRef.current = null;
    setWorkerProgress(null);
    setPasteError('Optimization cancelled.');
    trackEvent('optimization_cancelled', { mode: 'sheet' });
  };
  const importPaste = () => {
    const parsed = parseSheetPaste(paste);
    if (!parsed.ok) {
      setPasteError(parsed.errors.map((error) => error.message).join('\n'));
      setPendingParts(null);
      return;
    }
    setPasteError(null);
    setPendingParts(parsed.records);
  };
  const confirmPaste = () => {
    if (!pendingParts) return;
    setProject((p) => ({ ...p, parts: pendingParts }));
    trackEvent('paste_import_used', { mode: 'sheet', rows: pendingParts.length });
    setPendingParts(null);
    setPaste('');
  };
  const importCsvFile = (file?: File) => {
    if (!file) return;
    void file.text().then((text) => {
      const parsed = parseSheetPaste(text);
      if (!parsed.ok) {
        setPasteError(parsed.errors.map((error) => error.message).join('\n'));
        setPendingParts(null);
        return;
      }
      setPasteError(null);
      setPendingParts(parsed.records);
      trackEvent('csv_import_used', { mode: 'sheet' });
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not read CSV file.'));
  };
  const importWorkbookFile = (file?: File) => {
    if (!file) return;
    void parseSheetWorkbookFile(file).then((parsed) => {
      if (!parsed.ok) {
        setPasteError(parsed.errors.map((error) => error.message).join('\n'));
        setPendingParts(null);
        return;
      }
      setPasteError(null);
      setPendingParts(parsed.records);
      trackEvent('xlsx_import_used', { mode: 'sheet' });
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not read Excel workbook.'));
  };
  const importJsonFile = (file?: File) => {
    if (!file) return;
    void file.text().then((text) => {
      const parsed = JSON.parse(text) as Partial<SheetProjectInput>;
      if (!parsed.stock || !Array.isArray(parsed.parts) || !parsed.unit || typeof parsed.kerf !== 'string') throw new Error('JSON file is not a StockCut sheet project.');
      setProject(parsed as SheetProjectInput);
      trackEvent('json_import_used', { mode: 'sheet' });
      setResult(null);
      setPasteError(null);
      setPendingParts(null);
    }).catch((error: unknown) => setPasteError(error instanceof Error ? error.message : 'Could not import JSON file.'));
  };
  const addRow = () => setProject((p) => ({ ...p, parts: [...p.parts, { id: newId('part'), label: `Part ${p.parts.length + 1}`, width: '', height: '', quantity: '1', allowRotation: true, material: p.stock.material, grainLock: 'none' }] }));
  const duplicateRow = (part: SheetPartInput) => setProject((p) => ({ ...p, parts: [...p.parts, { ...part, id: newId('part'), label: `${part.label} copy` }] }));
  const removeRow = (id: string) => setProject((p) => ({ ...p, parts: p.parts.filter((part) => part.id !== id) }));
  const addExtraStock = () => setProject((p) => ({ ...p, extraStocks: [...(p.extraStocks ?? []), emptyExtraStock(p.unit, p.stock.material)] }));
  const removeExtraStock = (id: string) => setProject((p) => ({ ...p, extraStocks: (p.extraStocks ?? []).filter((stock) => stock.id !== id) }));

  return (
    <section className="tool-card" id="sheet-tool">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">2D Sheet Cutting Optimizer</h2>
          <p className="text-sm text-stock-muted">Local, rectangular, kerf-aware practical layout. Multiple stock sizes and reusable rectangular offcuts are supported. Not CNC, DXF, G-code, angle cutting, or industrial nesting.</p>
        </div>
        <p className="rounded-full border border-stock-line px-3 py-1 text-xs text-stock-muted">Saved locally in your browser</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label>Unit<select value={project.unit} onChange={(e) => { trackEvent('unit_changed', { mode: 'sheet' }); setProject({ ...project, unit: e.target.value as DisplayUnit }); }}><option value="in">inch decimal</option><option value="ft-in">feet-inch display</option><option value="mm">mm</option><option value="cm">cm</option></select></label>
        <label>Strategy<select value={project.strategy ?? 'least_waste'} onChange={(e) => setProject({ ...project, strategy: e.target.value as SheetProjectInput['strategy'] })}><option value="least_waste">Least waste</option><option value="least_stock">Least stock</option><option value="fewer_cuts">Fewer cuts</option></select></label>
        <label>Kerf<input value={project.kerf} onChange={(e) => { trackEvent('kerf_changed', { mode: 'sheet' }); setProject({ ...project, kerf: e.target.value }); }} placeholder="1/8 or 3mm" /></label>
        <label>Primary stock quantity<input value={project.stock.quantity} onChange={(e) => updateStock('quantity', e.target.value)} placeholder="auto or 3" /></label>
        <label>Primary stock width<input value={project.stock.width} onChange={(e) => updateStock('width', e.target.value)} /></label>
        <label>Primary stock height<input value={project.stock.height} onChange={(e) => updateStock('height', e.target.value)} /></label>
        <label>Material<input value={project.stock.material ?? ''} onChange={(e) => updateStock('material', e.target.value)} /></label>
        <label>Cost per sheet<input value={project.stock.cost ?? ''} onChange={(e) => updateStock('cost', e.target.value)} placeholder="45.00" /></label>
        <label>Grain direction<select value={project.stock.grainDirection ?? 'none'} onChange={(e) => updateStock('grainDirection', e.target.value as GrainLock)}><option value="none">None</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
        <label>Trim top<input value={project.stock.trimTop} onChange={(e) => updateStock('trimTop', e.target.value)} /></label>
        <label>Trim right<input value={project.stock.trimRight} onChange={(e) => updateStock('trimRight', e.target.value)} /></label>
        <label>Trim bottom<input value={project.stock.trimBottom} onChange={(e) => updateStock('trimBottom', e.target.value)} /></label>
        <label>Trim left<input value={project.stock.trimLeft} onChange={(e) => updateStock('trimLeft', e.target.value)} /></label>
      </div>

      <div className="no-print mt-5 rounded-2xl border border-stock-line bg-[#fffaf2] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div><h3 className="font-bold">Additional stock sheets / reusable offcuts</h3><p className="text-sm text-stock-muted">Use this for multiple stock sizes or rectangular offcuts you want to use before buying another full sheet.</p></div>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={addExtraStock}>Add stock / offcut</button>
        </div>
        {(project.extraStocks ?? []).length > 0 && <div className="mt-3 overflow-x-auto rounded-2xl border border-stock-line bg-white"><table className="w-full min-w-[920px] text-sm"><thead><tr className="bg-[#f0e6d8]"><th className="p-2 text-left">Label</th><th className="p-2 text-left">Width</th><th className="p-2 text-left">Height</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Material</th><th className="p-2 text-left">Cost</th><th className="p-2 text-left">Offcut</th><th className="p-2 text-left">Actions</th></tr></thead><tbody>{(project.extraStocks ?? []).map((stock) => <tr key={stock.id} className="border-t border-stock-line"><td className="p-2"><input value={stock.label} onChange={(e) => updateExtraStock(stock.id, { label: e.target.value })} /></td><td className="p-2"><input value={stock.width} onChange={(e) => updateExtraStock(stock.id, { width: e.target.value })} /></td><td className="p-2"><input value={stock.height} onChange={(e) => updateExtraStock(stock.id, { height: e.target.value })} /></td><td className="p-2"><input value={stock.quantity} onChange={(e) => updateExtraStock(stock.id, { quantity: e.target.value })} /></td><td className="p-2"><input value={stock.material ?? ''} onChange={(e) => updateExtraStock(stock.id, { material: e.target.value })} /></td><td className="p-2"><input value={stock.cost ?? ''} onChange={(e) => updateExtraStock(stock.id, { cost: e.target.value })} /></td><td className="p-2"><input type="checkbox" checked={Boolean(stock.isOffcut)} onChange={(e) => updateExtraStock(stock.id, { isOffcut: e.target.checked })} /></td><td className="p-2"><button className="bg-[#eee5d8] text-stock-ink" onClick={() => removeExtraStock(stock.id)}>Remove</button></td></tr>)}</tbody></table></div>}
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-stock-line bg-white">
        <table className="w-full min-w-[1280px] text-sm">
          <thead><tr className="bg-[#f0e6d8]"><th className="p-2 text-left">Label</th><th className="p-2 text-left">Width</th><th className="p-2 text-left">Height</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Rotation</th><th className="p-2 text-left">Grain lock</th><th className="p-2 text-left">Material</th><th className="p-2 text-left">Edge banding T/R/B/L</th><th className="p-2 text-left">Actions</th></tr></thead>
          <tbody>{project.parts.map((part) => <tr key={part.id} className="border-t border-stock-line"><td className="p-2"><input value={part.label} onChange={(e) => updatePart(part.id, { label: e.target.value })} /></td><td className="p-2"><input value={part.width} onChange={(e) => updatePart(part.id, { width: e.target.value })} /></td><td className="p-2"><input value={part.height} onChange={(e) => updatePart(part.id, { height: e.target.value })} /></td><td className="p-2"><input value={part.quantity} onChange={(e) => updatePart(part.id, { quantity: e.target.value })} /></td><td className="p-2"><select value={part.allowRotation ? 'yes' : 'no'} onChange={(e) => updatePart(part.id, { allowRotation: e.target.value === 'yes' })}><option value="yes">Allow</option><option value="no">Locked</option></select></td><td className="p-2"><select value={part.grainLock ?? 'none'} onChange={(e) => updatePart(part.id, { grainLock: e.target.value as GrainLock, allowRotation: e.target.value === 'none' ? part.allowRotation : false })}><option value="none">None</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></td><td className="p-2"><input value={part.material ?? ''} onChange={(e) => updatePart(part.id, { material: e.target.value })} /></td><td className="p-2"><div className="flex gap-2"><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={edgeValue(part.edgeBanding, 'top')} onChange={(e) => updateEdge(part.id, 'top', e.target.checked)} />T</label><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={edgeValue(part.edgeBanding, 'right')} onChange={(e) => updateEdge(part.id, 'right', e.target.checked)} />R</label><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={edgeValue(part.edgeBanding, 'bottom')} onChange={(e) => updateEdge(part.id, 'bottom', e.target.checked)} />B</label><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={edgeValue(part.edgeBanding, 'left')} onChange={(e) => updateEdge(part.id, 'left', e.target.checked)} />L</label></div></td><td className="flex gap-2 p-2"><button className="bg-[#eee5d8] text-stock-ink" onClick={() => duplicateRow(part)}>Copy</button><button className="bg-[#eee5d8] text-stock-ink" onClick={() => removeRow(part.id)}>Remove</button></td></tr>)}</tbody>
        </table>
      </div>

      <div className="no-print mt-4 flex flex-wrap gap-3">
        <button className="bg-stock-accent text-white" onClick={addRow}>Add part</button>
        <button className="bg-stock-accent text-white" onClick={optimize}>Optimize</button>
        <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('sample_loaded', { mode: 'sheet', sample: 'plywood-4x8' }); setProject(clonePreset(sheetPresets['plywood-4x8'])); setResult(null); }}>4×8 plywood sample</button>
        <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('sample_loaded', { mode: 'sheet', sample: 'metric-sheet' }); setProject(clonePreset(sheetPresets['metric-sheet'])); setResult(null); }}>2440×1220 mm sample</button>
        {result && <>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('csv_export_clicked', { mode: 'sheet' }); downloadText('stockcut-sheet-result.csv', exportSheetResultCsv(result, project.unit), 'text/csv'); }}>CSV export</button>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('json_export_clicked', { mode: 'sheet' }); downloadText('stockcut-project.json', JSON.stringify(project, null, 2), 'application/json'); }}>JSON export</button>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={() => navigator.clipboard.writeText(`StockCut: ${result.sheetsUsed.length} sheets, yield ${formatPercent(result.yieldRate)}, waste ${formatPercent(result.wasteRate)}, estimated stock cost ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`)}>Copy summary</button>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { navigator.clipboard.writeText(buildShareUrl('sheet-2d', project)); trackEvent('share_link_created', { mode: 'sheet' }); }}>Copy share link</button>
          <button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('pdf_export_clicked', { mode: 'sheet' }); void downloadSheetPdf(project, result); }}>Download PDF file</button><button className="bg-[#eee5d8] text-stock-ink" onClick={() => { trackEvent('print_clicked', { mode: 'sheet' }); window.print(); }}>Browser Print / Save PDF</button>
        </>}
      </div>

      {workerProgress && <div className="no-print mt-4 rounded-2xl border border-stock-line bg-white p-4"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><strong>Optimizing in a Web Worker</strong><p className="text-sm text-stock-muted">{workerProgress.message}</p></div><button className="bg-[#eee5d8] text-stock-ink" onClick={cancelOptimization}>Cancel</button></div><progress className="mt-3 w-full" max={100} value={workerProgress.percent}>{workerProgress.percent}%</progress></div>}

      <div className="no-print mt-4">
        <label>Paste from Excel / Google Sheets<textarea className="mt-2 min-h-24" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Label&#9;Width&#9;Height&#9;Quantity&#9;Rotate&#9;Material&#9;Grain&#9;EdgeTop&#9;EdgeRight&#9;EdgeBottom&#9;EdgeLeft" /></label>
        <div className="mt-2 flex flex-wrap gap-2"><button className="bg-[#eee5d8] text-stock-ink" onClick={importPaste}>Preview pasted rows</button><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import CSV file<input className="sr-only" type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(e) => importCsvFile(e.currentTarget.files?.[0])} /></label><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import Excel .xlsx<input className="sr-only" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={(e) => importWorkbookFile(e.currentTarget.files?.[0])} /></label><label className="inline-flex cursor-pointer items-center rounded-xl bg-[#eee5d8] px-4 py-2 text-sm font-bold text-stock-ink">Import JSON project<input className="sr-only" type="file" accept="application/json,.json" onChange={(e) => importJsonFile(e.currentTarget.files?.[0])} /></label></div>
        {pasteError && <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{pasteError}</pre>}
        {pendingParts && <div className="mt-3 rounded-2xl border border-stock-line bg-white p-4"><h3 className="font-bold">Paste preview</h3><p className="text-sm text-stock-muted">{pendingParts.length} rows parsed. Existing rows will not be replaced until you confirm.</p><div className="mt-2 flex gap-2"><button className="bg-stock-accent text-white" onClick={confirmPaste}>Confirm import</button><button className="bg-[#eee5d8] text-stock-ink" onClick={() => setPendingParts(null)}>Cancel</button></div></div>}
      </div>

      {result && <div className="mt-6 space-y-5">
        <div className="grid gap-3 md:grid-cols-5">{summary.map(([label, value]) => <div key={label} className="rounded-2xl border border-stock-line bg-white p-4"><span className="text-xs uppercase text-stock-muted">{label}</span><strong className="block text-2xl">{value}</strong></div>)}</div>
        {result.warnings.length > 0 && <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">{result.warnings.map((w, i) => <p key={i}>{w.message}</p>)}</div>}
        {result.sheetsUsed.map((sheet) => <SheetLayoutSvg key={sheet.sheetIndex} sheet={sheet} unit={project.unit} />)}
        <div className="print-safe rounded-2xl border border-stock-line bg-white p-4"><h3 className="font-bold">Basic cut sequence</h3><table className="mt-2 w-full text-sm"><thead><tr><th className="p-2 text-left">Sheet</th><th className="p-2 text-left">Step</th><th className="p-2 text-left">Part</th><th className="p-2 text-left">Position</th><th className="p-2 text-left">Size</th><th className="p-2 text-left">Rotated</th></tr></thead><tbody>{sequence.map((step) => <tr key={`${step.sheet}-${step.step}-${step.label}`} className="border-t border-stock-line"><td className="p-2">{step.sheet}</td><td className="p-2">{step.step}</td><td className="p-2">{step.label}</td><td className="p-2">{formatDimension(step.x, project.unit)}, {formatDimension(step.y, project.unit)}</td><td className="p-2">{formatDimension(step.width, project.unit)} × {formatDimension(step.height, project.unit)}</td><td className="p-2">{step.rotated ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>
        {result.unplacedParts.length > 0 && <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><h3 className="font-bold">Unplaced parts</h3>{result.unplacedParts.map((part) => <p key={`${part.partId}-${part.label}`}>{part.label}: {part.reason}</p>)}</div>}
      </div>}
    </section>
  );
}
