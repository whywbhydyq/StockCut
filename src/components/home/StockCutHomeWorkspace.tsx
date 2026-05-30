'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { DisplayUnit, LinearOptimizationResult, LinearPartInput, LinearProjectInput, SheetOptimizationResult, SheetPartInput, SheetProjectInput } from '@/core/types';
import { sheetPresets, linearPresets } from '@/data/presets';
import { runLinearOptimizationInWorker, runSheetOptimizationInWorker, type WorkerProgress } from '@/core/worker/optimizerWorkerClient';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';
import { parseSheetPaste, parseLinearPaste } from '@/core/import/parsePaste';
import { loadProject, saveProject } from '@/core/storage/projectStorage';
import { buildShareUrl } from '@/core/storage/shareProject';
import { trackEvent } from '@/core/analytics/trackEvent';
import { HomeFaqSection, PopularCutListLinks } from '@/components/home/HomeSupportSections';

const SHEET_STORAGE_KEY = 'sc6-sheet-workspace-v6';
const LINEAR_STORAGE_KEY = 'sc6-linear-workspace-v6';
const LUMBER_STORAGE_KEY = 'sc6-lumber-workspace-v7';
const TUBE_STORAGE_KEY = 'sc6-tube-workspace-v7';

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


function createHomeSheetProject(): SheetProjectInput {
  const project = cloneProject(sheetPresets['imperial-sheet']);
  delete project.extraStocks;
  project.stock.cost = '';
  return project;
}

function createHomeLinearProject(mode: HomeMode = 'lumber'): LinearProjectInput {
  const project = cloneProject(linearPresets[mode === 'tube' ? 'pvc-pipe' : 'lumber-length']);
  delete project.extraStocks;
  project.stock.cost = '';
  return project;
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
    <div className="border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
      <span className="block text-[12px] font-medium text-slate-600">{label}</span>
      <strong className="mt-1 block font-mono text-xl font-semibold text-slate-950">{value}</strong>
    </div>
  );
}

function StatusChip({ title, value, active }: { title: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className={active ? 'grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700' : 'grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500'}>
        {active ? '✓' : '○'}
      </span>
      <span>
        <strong className="block text-sm text-slate-950">{title}</strong>
        <span className="text-xs text-slate-500">{value}</span>
      </span>
    </div>
  );
}

function ExampleSheetPreview({ mode }: { mode: HomeMode }) {
  const isLinear = isLinearMode(mode);
  if (isLinear) {
    return (
      <div className="sc4-example-preview sc4-example-linear" aria-label="Example straight stock preview">
        <div className="sc4-example-linear-bar">
          <span className="segment segment-a" />
          <span className="segment segment-b" />
          <span className="segment segment-c" />
          <span className="segment segment-waste" />
        </div>
        <div className="sc4-example-caption"><span>0 in</span><strong>{mode === 'tube' ? '120 in' : '96 in'}</strong></div>
      </div>
    );
  }

  return (
    <div className="sc4-example-preview sc4-example-sheet" aria-label="Example sheet preview">
      <span className="sc4-dim-y">48 in</span>
      <div className="sc4-example-board">
        <span className="part part-a" />
        <span className="part part-b" />
        <span className="part part-c" />
        <span className="part part-d" />
        <span className="part part-e" />
      </div>
      <div className="sc4-dim-x"><span /> <strong>96 in</strong> <span /></div>
    </div>
  );
}

function SheetResultPreview({ result, unit }: { result: SheetOptimizationResult; unit: DisplayUnit }) {
  const sheet = result.sheetsUsed[0];
  if (!sheet) return <ExampleSheetPreview mode="sheet" />;
  const landscape = sheet.heightUm > sheet.widthUm;
  const boardWidthUm = landscape ? sheet.heightUm : sheet.widthUm;
  const boardHeightUm = landscape ? sheet.widthUm : sheet.heightUm;
  const scale = Math.min(100 / boardWidthUm, 100 / boardHeightUm);
  const mapRect = (rect: { xUm: number; yUm: number; widthUm: number; heightUm: number }) => landscape
    ? { x: rect.yUm, y: rect.xUm, width: rect.heightUm, height: rect.widthUm }
    : { x: rect.xUm, y: rect.yUm, width: rect.widthUm, height: rect.heightUm };
  const usable = landscape
    ? { x: sheet.usableYUm, y: sheet.usableXUm, width: sheet.usableHeightUm, height: sheet.usableWidthUm }
    : { x: sheet.usableXUm, y: sheet.usableYUm, width: sheet.usableWidthUm, height: sheet.usableHeightUm };
  return (
    <div className="sc4-result-preview sc4-sheet-result">
      <div className="sc4-result-meta"><span>Sheet {sheet.sheetIndex} of {result.sheetsUsed.length}</span><span>{formatDimension(boardWidthUm, unit)} × {formatDimension(boardHeightUm, unit)}</span></div>
      <svg viewBox={`0 0 ${boardWidthUm} ${boardHeightUm}`} className="sc4-result-svg" role="img" aria-label="Optimized sheet layout preview">
        <rect width={boardWidthUm} height={boardHeightUm} fill="#f8fafc" stroke="#334155" strokeWidth={1 / scale} />
        <rect x={usable.x} y={usable.y} width={usable.width} height={usable.height} fill="none" stroke="#64748b" strokeDasharray={8 / scale} strokeWidth={1 / scale} />
        {sheet.offcuts.slice(0, 30).map((offcut, index) => {
          const rect = mapRect(offcut);
          return <rect key={index} x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1 / scale} />;
        })}
        {sheet.placements.map((part, index) => {
          const rect = mapRect(part);
          return (
            <g key={`${part.partId}-${part.instanceIndex}-${index}`}>
              <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={2 / scale} fill={index % 3 === 0 ? '#dcfce7' : index % 3 === 1 ? '#ffedd5' : '#e0f2fe'} stroke="#334155" strokeWidth={1 / scale} />
              <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(Math.min(rect.width, rect.height) / 7, 52000)} fill="#0f172a">{part.partLabel.slice(0, 16)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LinearResultPreview({ result, unit }: { result: LinearOptimizationResult; unit: DisplayUnit }) {
  const stock = result.stocksUsed[0];
  if (!stock) return <ExampleSheetPreview mode="lumber" />;
  return (
    <div className="sc4-result-preview sc4-linear-result">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span>Stock {stock.stockIndex} of {result.stocksUsed.length}</span><span>{formatDimension(stock.usableLengthUm, unit)} usable</span></div>
      <div className="sc4-linear-result-bar">
        {stock.cuts.map((cut, index) => (
          <div key={`${cut.partId}-${cut.instanceIndex}-${index}`} className="sc4-linear-result-cut" style={{ left: `${(cut.startUm / stock.usableLengthUm) * 100}%`, width: `${(cut.lengthUm / stock.usableLengthUm) * 100}%` }}>{cut.partLabel}</div>
        ))}
      </div>
      <p className="sc4-result-note">Used {formatDimension(stock.usedLengthUm, unit)} · offcut {formatDimension(stock.wasteLengthUm, unit)} · kerf cuts {stock.kerfCount}</p>
    </div>
  );
}

function IconButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void | Promise<void> }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="sc4-action-button">{children}</button>;
}

function downloadClientText(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function StockCutHomeWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelOptimizationRef = useRef<(() => void) | null>(null);
  const optimizeRunIdRef = useRef(0);
  const [mode, setMode] = useState<HomeMode>('sheet');
  const [sheetProject, setSheetProject] = useState<SheetProjectInput>(() => createHomeSheetProject());
  const [lumberProject, setLumberProject] = useState<LinearProjectInput>(() => createHomeLinearProject('lumber'));
  const [tubeProject, setTubeProject] = useState<LinearProjectInput>(() => createHomeLinearProject('tube'));
  const linearProject = mode === 'tube' ? tubeProject : lumberProject;
  const setLinearProject = mode === 'tube' ? setTubeProject : setLumberProject;
  const [result, setResult] = useState<ActiveResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const [workerProgress, setWorkerProgress] = useState<WorkerProgress | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState('');
  const [pendingImport, setPendingImport] = useState<ImportPreview>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    setSheetProject(loadProject(SHEET_STORAGE_KEY, createHomeSheetProject()));
    setLumberProject(loadProject(LUMBER_STORAGE_KEY, loadProject(LINEAR_STORAGE_KEY, createHomeLinearProject('lumber'))));
    setTubeProject(loadProject(TUBE_STORAGE_KEY, createHomeLinearProject('tube')));
  }, []);

  useEffect(() => {
    const resolveModeFromHash = (hash: string): HomeMode | null => {
      if (hash === '#linear') return 'lumber';
      if (hash === '#tube') return 'tube';
      if (hash === '#sheet' || hash === '') return 'sheet';
      return null;
    };
    const syncModeFromHash = () => {
      const nextMode = resolveModeFromHash(window.location.hash);
      if (!nextMode) return;
      setMode((currentMode) => {
        if (currentMode !== nextMode) {
          setResult(null);
          setError(null);
          setPendingImport(null);
          setPasteOpen(false);
        }
        return nextMode;
      });
    };
    syncModeFromHash();
    window.addEventListener('hashchange', syncModeFromHash);
    return () => window.removeEventListener('hashchange', syncModeFromHash);
  }, []);

  useEffect(() => {
    const openImport = () => {
      setPasteOpen(true);
      setPendingImport(null);
      setError(null);
      window.requestAnimationFrame(() => fileInputRef.current?.click());
    };
    const shouldOpenFromNavigation = window.location.hash === '#import' || window.sessionStorage.getItem('stockcut-open-import') === '1';
    if (shouldOpenFromNavigation) {
      window.sessionStorage.removeItem('stockcut-open-import');
      window.requestAnimationFrame(openImport);
    }
    window.addEventListener('stockcut:open-import', openImport);
    return () => window.removeEventListener('stockcut:open-import', openImport);
  }, []);

  useEffect(() => saveProject(SHEET_STORAGE_KEY, sheetProject), [sheetProject]);
  useEffect(() => saveProject(LUMBER_STORAGE_KEY, lumberProject), [lumberProject]);
  useEffect(() => saveProject(TUBE_STORAGE_KEY, tubeProject), [tubeProject]);

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

  const clearOutput = () => {
    cancelOptimizationRef.current?.();
    cancelOptimizationRef.current = null;
    setWorkerProgress(null);
    setResult(null);
    setError(null);
    setModeNotice(null);
  };

  const selectMode = (nextMode: HomeMode) => {
    if (nextMode === mode) return;
    cancelOptimizationRef.current?.();
    cancelOptimizationRef.current = null;
    setWorkerProgress(null);
    setMode(nextMode);
    setResult(null);
    setError(null);
    setPendingImport(null);
    setPasteOpen(false);
    setPaste('');
    const label = nextMode === 'sheet' ? 'Sheet goods' : nextMode === 'tube' ? 'Pipe / tube / bar' : 'Boards / lumber';
    setModeNotice(`${label} draft restored. Use the sample button if you want to replace it.`);
    window.history.replaceState(null, '', `#${nextMode === 'sheet' ? 'sheet' : nextMode === 'tube' ? 'tube' : 'linear'}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    trackEvent('mode_switched', { mode: nextMode, source: 'home', preservedDraft: true });
  };

  const updateSheetStock = (patch: Partial<SheetProjectInput['stock']>) => { clearOutput(); setSheetProject((project) => ({ ...project, stock: { ...project.stock, ...patch } })); };
  const updateSheetPart = (id: string, patch: Partial<SheetPartInput>) => { clearOutput(); setSheetProject((project) => ({ ...project, parts: project.parts.map((part) => part.id === id ? { ...part, ...patch } : part) })); };
  const updateLinearStock = (patch: Partial<LinearProjectInput['stock']>) => { clearOutput(); setLinearProject((project) => ({ ...project, stock: { ...project.stock, ...patch } })); };
  const updateLinearPart = (id: string, patch: Partial<LinearPartInput>) => { clearOutput(); setLinearProject((project) => ({ ...project, parts: project.parts.map((part) => part.id === id ? { ...part, ...patch } : part) })); };

  const generate = () => {
    setError(null);
    setModeNotice(null);
    setPendingImport(null);
    cancelOptimizationRef.current?.();
    const runId = optimizeRunIdRef.current + 1;
    optimizeRunIdRef.current = runId;
    setWorkerProgress({ percent: 1, message: 'Preparing optimization.' });
    if (isLinearMode(mode)) {
      trackEvent('optimize_linear_clicked', { source: 'home', mode });
      const worker = runLinearOptimizationInWorker(linearProject, setWorkerProgress);
      cancelOptimizationRef.current = worker.cancel;
      void worker.promise.then((nextResult) => {
        if (optimizeRunIdRef.current !== runId) return;
        cancelOptimizationRef.current = null;
        setWorkerProgress(null);
        setResult({ kind: 'linear', result: nextResult });
      }).catch((caught: unknown) => {
        if (optimizeRunIdRef.current !== runId) return;
        cancelOptimizationRef.current = null;
        setWorkerProgress(null);
        setResult(null);
        setError(caught instanceof Error ? caught.message : 'Optimization failed. Check dimensions, quantity, and kerf.');
      });
      return;
    }
    trackEvent('optimize_sheet_clicked', { source: 'home', mode });
    const worker = runSheetOptimizationInWorker(sheetProject, setWorkerProgress);
    cancelOptimizationRef.current = worker.cancel;
    void worker.promise.then((nextResult) => {
      if (optimizeRunIdRef.current !== runId) return;
      cancelOptimizationRef.current = null;
      setWorkerProgress(null);
      setResult({ kind: 'sheet', result: nextResult });
    }).catch((caught: unknown) => {
      if (optimizeRunIdRef.current !== runId) return;
      cancelOptimizationRef.current = null;
      setWorkerProgress(null);
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Optimization failed. Check dimensions, quantity, and kerf.');
    });
  };

  const cancelOptimization = () => {
    optimizeRunIdRef.current += 1;
    cancelOptimizationRef.current?.();
    cancelOptimizationRef.current = null;
    setWorkerProgress(null);
    setError('Optimization cancelled.');
  };

  const loadSheetSample = () => {
    setMode('sheet');
    setSheetProject(createHomeSheetProject());
    setResult(null);
    setError(null);
    setPendingImport(null);
    setPasteOpen(false);
    setPaste('');
    window.history.replaceState(null, '', '#sheet');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    trackEvent('sample_loaded', { mode: 'sheet', sample: '4x8-home-clean', source: 'home' });
  };

  const loadLinearSample = (sample: 'lumber-length' | 'pvc-pipe' | 'steel-tube' | 'aluminum-extrusion') => {
    const nextMode: HomeMode = sample === 'lumber-length' ? 'lumber' : 'tube';
    setMode(nextMode);
    const nextProject = sample === 'lumber-length' ? createHomeLinearProject('lumber') : (() => { const project = cloneProject(linearPresets[sample]); delete project.extraStocks; project.stock.cost = ''; return project; })();
    if (nextMode === 'lumber') setLumberProject(nextProject);
    else setTubeProject(nextProject);
    setResult(null);
    setError(null);
    setPendingImport(null);
    setPasteOpen(false);
    setPaste('');
    window.history.replaceState(null, '', nextMode === 'lumber' ? '#linear' : '#tube');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    trackEvent('sample_loaded', { mode: 'linear', sample, source: 'home' });
  };

  const addPart = () => {
    clearOutput();
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
    setError(null);
    setPaste('');
    setPasteOpen(false);
    setResult(null);
    trackEvent('paste_import_used', { mode: pendingImport.kind, rows: pendingImport.rows.length, source: 'home' });
  };

  const importFile = (file?: File) => {
    if (!file) return;
    setError(null);
    const isWorkbook = /\.(xlsx|xls)$/i.test(file.name);
    const isJson = /\.json$/i.test(file.name) || file.type === 'application/json';
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
      const apply = (rows: LinearPartInput[]) => { setResult(null); setError(null); setPendingImport({ kind: 'linear', rows }); setPasteOpen(true); };
      if (isWorkbook) void import('@/core/import/parseWorkbook')
        .then(({ parseLinearWorkbookFile }) => parseLinearWorkbookFile(file))
        .then((parsed) => parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')))
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read Excel workbook.'));
      else void file.text().then((text) => { const parsed = parseLinearPaste(text); parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')); }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read CSV file.'));
      return;
    }
    const apply = (rows: SheetPartInput[]) => { setResult(null); setError(null); setPendingImport({ kind: 'sheet', rows }); setPasteOpen(true); };
    if (isWorkbook) void import('@/core/import/parseWorkbook')
      .then(({ parseSheetWorkbookFile }) => parseSheetWorkbookFile(file))
      .then((parsed) => parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read Excel workbook.'));
    else void file.text().then((text) => { const parsed = parseSheetPaste(text); parsed.ok ? apply(parsed.records) : setError(parsed.errors.map((item) => item.message).join('\n')); }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not read CSV file.'));
  };

  const markCopied = (key: string) => {
    setCopyStatus(key);
    window.setTimeout(() => setCopyStatus(null), 1600);
  };

  const copySummary = () => {
    if (!result) return;
    const text = result.kind === 'sheet'
      ? `StockCut: ${result.result.sheetsUsed.length} sheets, yield ${formatPercent(result.result.yieldRate)}, waste ${formatPercent(result.result.wasteRate)}, unplaced ${result.result.unplacedParts.length}.`
      : `StockCut: ${result.result.stocksUsed.length} stock lengths, waste ${formatPercent(result.result.wasteRate)}, unplaced ${result.result.unplacedCuts.length}.`;
    void navigator.clipboard.writeText(text).then(() => markCopied('summary')).catch(() => setError('Copy failed. Select the summary text and copy manually.'));
  };

  const copyShareLink = () => {
    const link = isLinearMode(mode) ? buildShareUrl('linear-1d', linearProject) : buildShareUrl('sheet-2d', sheetProject);
    void navigator.clipboard.writeText(link).then(() => markCopied('share')).catch(() => setError('Copy failed. Download the project JSON instead, or copy the browser address manually.'));
    trackEvent('share_link_created', { mode: isLinearMode(mode) ? 'linear' : 'sheet', source: 'home' });
  };

  const confirmPartialExport = (format: string): boolean => {
    if (!result || unplacedCount === 0) return true;
    return window.confirm(`This is a partial layout with ${unplacedCount} unplaced item${unplacedCount === 1 ? '' : 's'}. The ${format} export will include placed items plus an unplaced section. Continue?`);
  };

  const exportCsv = async () => {
    if (!result || !confirmPartialExport('CSV')) return;
    const { exportSheetResultCsv, exportLinearResultCsv, downloadText } = await import('@/core/export/exportCsv');
    if (result.kind === 'sheet') downloadText(result.result.unplacedParts.length ? 'stockcut-sheet-partial-result.csv' : 'stockcut-sheet-result.csv', exportSheetResultCsv(result.result, sheetProject.unit), 'text/csv');
    if (result.kind === 'linear') downloadText(result.result.unplacedCuts.length ? 'stockcut-linear-partial-result.csv' : 'stockcut-linear-result.csv', exportLinearResultCsv(result.result, linearProject.unit), 'text/csv');
  };

  const downloadPdf = async () => {
    if (!result || !confirmPartialExport('PDF')) return;
    const { downloadSheetPdf, downloadLinearPdf } = await import('@/core/export/exportPdf');
    if (result.kind === 'sheet') await downloadSheetPdf(sheetProject, result.result);
    if (result.kind === 'linear') await downloadLinearPdf(linearProject, result.result);
  };

  const downloadDxf = async () => {
    if (result?.kind !== 'sheet' || !confirmPartialExport('DXF')) return;
    const { downloadSheetDxf } = await import('@/core/export/exportDxf');
    downloadSheetDxf(result.result);
  };

  const exportJson = () => downloadClientText('stockcut-project.json', JSON.stringify(activeProject, null, 2), 'application/json');

  const bumpQuantity = (value: string): string => {
    const parsed = Number(String(value || '').trim());
    return String(Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) + 1 : 2);
  };

  const addOneStockForUnplaced = () => {
    clearOutput();
    if (isLinearMode(mode)) {
      setLinearProject((project) => ({ ...project, stock: { ...project.stock, quantity: bumpQuantity(project.stock.quantity) } }));
      setModeNotice('Added one more stock length. Run Generate again to retry the unplaced cuts.');
      return;
    }
    setSheetProject((project) => ({ ...project, stock: { ...project.stock, quantity: bumpQuantity(project.stock.quantity) } }));
    setModeNotice('Added one more sheet. Run Generate again to retry the unplaced parts.');
  };

  const allowRotationForUnplacedParts = () => {
    if (result?.kind !== 'sheet') return;
    const unplacedIds = new Set(result.result.unplacedParts.map((part) => part.partId));
    clearOutput();
    setSheetProject((project) => ({
      ...project,
      parts: project.parts.map((part) => unplacedIds.has(part.id) && (part.grainLock ?? 'none') === 'none' ? { ...part, allowRotation: true } : part)
    }));
    setModeNotice('Rotation enabled for unplaced sheet parts where grain is not locked. Run Generate again.');
  };

  const warnings = result?.kind === 'sheet' ? result.result.warnings : result?.kind === 'linear' ? result.result.warnings : [];
  const hasResult = Boolean(result);
  const placedCount = result?.kind === 'sheet'
    ? result.result.sheetsUsed.reduce((sum, sheet) => sum + sheet.placements.length, 0)
    : result?.kind === 'linear'
      ? result.result.stocksUsed.reduce((sum, stock) => sum + stock.cuts.length, 0)
      : 0;
  const unplacedCount = result?.kind === 'sheet' ? result.result.unplacedParts.length : result?.kind === 'linear' ? result.result.unplacedCuts.length : 0;
  const hasPlacedOutput = placedCount > 0;
  const hasCompleteOutput = hasPlacedOutput && unplacedCount === 0;
  const hasRotationFix = result?.kind === 'sheet' && result.result.warnings.some((warning) => warning.code === 'ROTATION_LOCKED_WOULD_FIT_IF_ROTATED');
  const previewTitle = !hasResult
    ? 'Preview will appear here after calculation'
    : hasCompleteOutput
      ? 'Optimized layout preview'
      : hasPlacedOutput
        ? 'Partial layout preview'
        : 'No layout could be placed';
  const previewSubtext = !hasResult
    ? 'Example preview'
    : hasCompleteOutput
      ? 'Review the first layout, then print or export.'
      : hasPlacedOutput
        ? 'Review placed parts and fix the warnings before cutting.'
        : 'Fix stock size, material, quantity, or part dimensions and run again.';

  return (
    <main className="sc4-shell" id="sheet">
      <section className="sc4-hero">
        <h1>Cut list optimizer for sheet goods, boards, pipe, and tube</h1>
        <p>Enter your stock size and parts. StockCut creates a kerf-aware layout, cut sequence, waste estimate, and printable cut list in your browser.</p>
        <div className="sc4-trust">▣ Saved locally in your browser <span>·</span> No upload</div>
      </section>

      <section className="sc4-mode-grid" aria-label="Choose what you need to cut">
        {([
          ['sheet', 'Sheet goods', 'Plywood · MDF · acrylic · melamine'],
          ['lumber', 'Boards / lumber', '2×4 · rails · shelves · straight stock'],
          ['tube', 'Pipe / tube / bar', 'PVC · steel tube · aluminum extrusion']
        ] as Array<[HomeMode, string, string]>).map(([key, title, description]) => (
          <button key={key} type="button" className={`sc4-mode-card ${mode === key ? 'is-active' : ''}`} onClick={() => selectMode(key)}>
            {iconForMode(key)}
            <span><strong>{title}</strong><small>{description}</small></span>
            <span className="sc4-radio">{mode === key ? '✓' : ''}</span>
          </button>
        ))}
      </section>

      <section className="sc4-workbench-grid">
        <section className="sc4-panel sc4-input-panel" id="import">
          <div className="sc4-panel-title"><span>1</span><h2>Enter stock and parts</h2></div>

          {!isLinearMode(mode) ? (
            <>
              <div className="sc4-fieldset-title">Stock size</div>
              <div className="sc4-fields sheet-fields">
                <label>Width<input value={compactDimension(sheetProject.stock.width)} onChange={(event) => updateSheetStock({ width: event.target.value })} /><span>in</span></label>
                <label>Height<input value={compactDimension(sheetProject.stock.height)} onChange={(event) => updateSheetStock({ height: event.target.value })} /><span>in</span></label>
                <label>Quantity<input value={sheetProject.stock.quantity} onChange={(event) => updateSheetStock({ quantity: event.target.value })} /></label>
                <label>Kerf<select value={sheetProject.kerf} onChange={(event) => { clearOutput(); setSheetProject((project) => ({ ...project, kerf: event.target.value })); }}><option value="1/8">1/8 in</option><option value="1/16">1/16 in</option><option value="3mm">3 mm</option><option value="0">0</option></select></label>
              </div>
              <div className="sc4-table-header"><strong>Parts</strong><button type="button" onClick={addPart}>+ Add part</button></div>
              <div className="sc4-table-wrap">
                <table className="sc4-parts-table">
                  <thead><tr><th>#</th><th>Label</th><th>Width (in)</th><th>Height (in)</th><th>Qty</th><th>Rotation</th><th /></tr></thead>
                  <tbody>{sheetProject.parts.map((part, index) => (
                    <tr key={part.id}>
                      <td>{index + 1}</td>
                      <td><input value={part.label} onChange={(event) => updateSheetPart(part.id, { label: event.target.value })} /></td>
                      <td><input value={compactDimension(part.width)} onChange={(event) => updateSheetPart(part.id, { width: event.target.value })} /></td>
                      <td><input value={compactDimension(part.height)} onChange={(event) => updateSheetPart(part.id, { height: event.target.value })} /></td>
                      <td><input value={part.quantity} onChange={(event) => updateSheetPart(part.id, { quantity: event.target.value })} /></td>
                      <td><select value={part.allowRotation ? 'yes' : 'no'} onChange={(event) => updateSheetPart(part.id, { allowRotation: event.target.value === 'yes' })}><option value="yes">Allowed</option><option value="no">Locked</option></select></td>
                      <td><button type="button" aria-label={`Remove ${part.label}`} onClick={() => { clearOutput(); setSheetProject((project) => ({ ...project, parts: project.parts.filter((row) => row.id !== part.id) })); }}>⌫</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="sc4-fieldset-title">Stock length</div>
              <div className="sc4-fields linear-fields">
                <label>Length<input value={linearProject.stock.length} onChange={(event) => updateLinearStock({ length: event.target.value })} /></label>
                <label>Quantity<input value={linearProject.stock.quantity} onChange={(event) => updateLinearStock({ quantity: event.target.value })} /></label>
                <label>Kerf<select value={linearProject.kerf} onChange={(event) => { clearOutput(); setLinearProject((project) => ({ ...project, kerf: event.target.value })); }}><option value="1/8">1/8 in</option><option value="2mm">2 mm</option><option value="3mm">3 mm</option><option value="0">0</option></select></label>
              </div>
              <div className="sc4-table-header"><strong>Cuts</strong><button type="button" onClick={addPart}>+ Add cut</button></div>
              <div className="sc4-table-wrap">
                <table className="sc4-parts-table">
                  <thead><tr><th>#</th><th>Label</th><th>Length</th><th>Qty</th><th>Material</th><th>Notes</th><th /></tr></thead>
                  <tbody>{linearProject.parts.map((part, index) => (
                    <tr key={part.id}>
                      <td>{index + 1}</td>
                      <td><input value={part.label} onChange={(event) => updateLinearPart(part.id, { label: event.target.value })} /></td>
                      <td><input value={part.length} onChange={(event) => updateLinearPart(part.id, { length: event.target.value })} /></td>
                      <td><input value={part.quantity} onChange={(event) => updateLinearPart(part.id, { quantity: event.target.value })} /></td>
                      <td><input value={part.material ?? ''} onChange={(event) => updateLinearPart(part.id, { material: event.target.value })} /></td>
                      <td><input value={part.notes ?? ''} onChange={(event) => updateLinearPart(part.id, { notes: event.target.value })} /></td>
                      <td><button type="button" aria-label={`Remove ${part.label}`} onClick={() => { clearOutput(); setLinearProject((project) => ({ ...project, parts: project.parts.filter((row) => row.id !== part.id) })); }}>⌫</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          {modeNotice && <div className="sc4-notice">{modeNotice}</div>}
          {error && <pre className="sc4-error">{error}</pre>}
          {workerProgress && <div className="sc4-progress"><div><strong>{workerProgress.message}</strong><span>{workerProgress.percent}%</span></div><progress max={100} value={workerProgress.percent}>{workerProgress.percent}%</progress><button type="button" onClick={cancelOptimization}>Cancel</button></div>}

          <button type="button" className="sc4-generate" onClick={generate} disabled={Boolean(workerProgress)}>▦ {workerProgress ? 'Optimizing…' : isLinearMode(mode) ? 'Generate cutting sequence' : 'Generate cut layout'}<small>Create multi-order layout, cut list, and waste estimate</small></button>

          <div className="sc4-secondary-actions">
            <button type="button" onClick={isLinearMode(mode) ? () => loadLinearSample(mode === 'tube' ? 'pvc-pipe' : 'lumber-length') : loadSheetSample}>{isLinearMode(mode) ? (mode === 'tube' ? 'PVC pipe sample' : '8 ft lumber sample') : 'Load 4×8 plywood sample'}</button>
            <button type="button" onClick={() => setPasteOpen((open) => !open)}>Paste from spreadsheet</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>Import CSV / Excel</button>
            <input ref={fileInputRef} className="sr-only" type="file" accept=".csv,.txt,.xlsx,.xls,.json,text/csv,text/plain,application/json" onChange={(event: ChangeEvent<HTMLInputElement>) => { importFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
          </div>

          {pasteOpen && <div className="sc4-paste-box">
            <label>Paste rows from Excel / Google Sheets<textarea value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={isLinearMode(mode) ? 'Label\tLength\tQuantity\tMaterial\tNotes' : 'Label\tWidth\tHeight\tQuantity\tRotate\tMaterial'} /></label>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={parsePastedRows}>Preview pasted rows</button><button type="button" onClick={() => { setPasteOpen(false); setPendingImport(null); }}>Cancel</button></div>
            {pendingImport && <div className="sc4-import-preview"><strong>{pendingImport.rows.length} rows parsed.</strong><span>Existing rows will be replaced only after confirmation.</span><button type="button" onClick={confirmImport}>Confirm import</button></div>}
          </div>}

          <details className="sc4-advanced-inline">
            <summary>Advanced: reusable offcuts and mixed stock sizes</summary>
            <div className="sc4-advanced-note">Open Advanced controls below for strategy, grain direction, trim margins, edge banding, extra stock / offcut library, manual adjustment, and project import/export.</div>
          </details>
        </section>

        <section className="sc4-panel sc4-preview-panel">
          <div className="sc4-panel-title"><span>2</span><h2>See the layout before you cut</h2></div>
          <div className="sc4-preview-callout"><strong>{previewTitle}</strong><span>{previewSubtext}</span></div>
          {result?.kind === 'sheet' && <SheetResultPreview result={result.result} unit={sheetProject.unit} />}
          {result?.kind === 'linear' && <LinearResultPreview result={result.result} unit={linearProject.unit} />}
          {!result && <ExampleSheetPreview mode={mode} />}
          <div className="sc4-summary-grid">{summary.map(([label, value]) => <SummaryCell key={label} label={label} value={value} />)}</div>
          <div className="sc4-status-grid">
            <StatusChip title="Printable cut list" value={!hasResult ? 'Ready after calculation' : hasPlacedOutput ? 'Ready' : 'Fix inputs first'} active={hasPlacedOutput} />
            <StatusChip title="Cut sequence" value={!hasResult ? 'After calculation' : hasPlacedOutput ? 'Generated' : 'Not generated'} active={hasPlacedOutput} />
            <StatusChip title="Share link" value={hasResult ? 'Project link available' : 'Available after calculation'} active={hasResult} />
          </div>
          {warnings.length > 0 && <div className="sc4-warning">{warnings.slice(0, 2).map((warning, index) => <p key={`${warning.code}-${index}`}>{warning.message}</p>)}</div>}
        </section>
      </section>

      <div className="sc4-how"><strong>How it works:</strong> Enter your stock and parts → Generate layout → Review results → Print or export your cut list.</div>

      <section className="sc4-bottom-grid" id="examples">
        <div className="sc4-bottom-card">
          <h3>Exports and shop output</h3><p>{hasCompleteOutput ? 'Print, PDF, CSV, share link, DXF and more' : hasPlacedOutput ? 'Partial layout found. Fix unplaced parts or confirm before exporting.' : hasResult ? 'No placed layout yet. Fix the warnings before printing or exporting a cut list.' : 'Generate a layout first, then print or export your cut list.'}</p>
          {hasPlacedOutput && unplacedCount > 0 && <div className="sc4-export-warning"><strong>{unplacedCount} item{unplacedCount === 1 ? '' : 's'} unplaced.</strong><span>You can fix the inputs first, or export a clearly marked partial report after confirmation.</span><div className="sc4-fix-buttons"><button type="button" onClick={addOneStockForUnplaced}>Add one more stock</button>{hasRotationFix && <button type="button" onClick={allowRotationForUnplacedParts}>Allow rotation and retry</button>}</div></div>}
          {hasPlacedOutput ? (
            <>
              <div className="sc4-export-grid">
                <IconButton disabled={!hasPlacedOutput} onClick={() => { if (confirmPartialExport('browser print')) window.print(); }}>▣ Print / Save PDF</IconButton>
                <IconButton disabled={!hasPlacedOutput} onClick={downloadPdf}>⇩ Download PDF</IconButton>
                <IconButton disabled={!hasPlacedOutput} onClick={exportCsv}>▤ Export CSV</IconButton>
                <IconButton onClick={copySummary}>▢ {copyStatus === 'summary' ? 'Copied summary' : 'Copy summary'}</IconButton>
                <IconButton onClick={copyShareLink}>↗ {copyStatus === 'share' ? 'Copied link' : 'Copy share link'}</IconButton>
                <IconButton disabled={!isSheetResult || !hasPlacedOutput} onClick={downloadDxf}>DXF Download</IconButton>
              </div>
              <details className="sc4-more"><summary>More exports</summary><button type="button" onClick={exportJson}>Download project JSON</button></details>
            </>
          ) : <div className="sc4-bottom-inline">Print / PDF · CSV · Share link · DXF unlock after Generate</div>}
        </div>
        <div className="sc4-bottom-card">
          <h3>Advanced controls</h3><p>Strategy, grain direction, trim, offcuts, project import/export</p>
          <details className="sc4-more"><summary>Open advanced controls</summary>
            <div className="sc4-advanced-grid">
              <label>Strategy<select value={activeProject.strategy ?? 'least_waste'} onChange={(event) => { clearOutput(); isLinearMode(mode) ? setLinearProject((project) => ({ ...project, strategy: event.target.value as LinearProjectInput['strategy'] })) : setSheetProject((project) => ({ ...project, strategy: event.target.value as SheetProjectInput['strategy'] })); }}><option value="least_waste">Least waste</option><option value="least_stock">Least stock</option><option value="fewer_cuts">Fewer cuts</option></select></label>
              {!isLinearMode(mode) && <label>Grain direction<select value={sheetProject.stock.grainDirection ?? 'none'} onChange={(event) => updateSheetStock({ grainDirection: event.target.value as SheetProjectInput['stock']['grainDirection'] })}><option value="none">None</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>}
              <button type="button" onClick={exportJson}>Download project JSON</button><button type="button" onClick={() => fileInputRef.current?.click()}>Import project / CSV</button>
            </div>
          </details>
        </div>
        <div className="sc4-bottom-card">
          <h3>Help and resources</h3><p>How it works, examples, FAQ</p>
          <div className="sc4-help-buttons"><button type="button" onClick={() => document.querySelector('.sc4-how')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>How it works</button><button type="button" onClick={() => isLinearMode(mode) ? loadLinearSample(mode === 'tube' ? 'pvc-pipe' : 'lumber-length') : loadSheetSample()}>Examples</button><Link href="/how-to-account-for-saw-kerf">Kerf FAQ</Link><Link href="/cut-list-optimizer-vs-excel">Cut list FAQ</Link></div>
        </div>
      </section>


      <PopularCutListLinks />
      <HomeFaqSection />

      <p className="sc4-privacy-note">▣ All calculations run in your browser. Your data never leaves your device.</p>
    </main>
  );
}
