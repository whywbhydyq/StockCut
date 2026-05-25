'use client';

import { useMemo, useState } from 'react';
import type { DisplayUnit } from '@/core/types';
import { parseDimension } from '@/core/units/parseDimension';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';

function parsePositiveNumber(value: string): number | null {
  const n = Number(value.replace(/[$,]/g, '').trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function PlywoodYieldCalculator() {
  const [unit, setUnit] = useState<DisplayUnit>('in');
  const [sheetWidth, setSheetWidth] = useState('48');
  const [sheetHeight, setSheetHeight] = useState('96');
  const [sheetCount, setSheetCount] = useState('1');
  const [partArea, setPartArea] = useState('2800');
  const [cost, setCost] = useState('');
  const result = useMemo(() => {
    const w = parseDimension(sheetWidth, unit);
    const h = parseDimension(sheetHeight, unit);
    const count = parsePositiveNumber(sheetCount);
    const finishedArea = parsePositiveNumber(partArea);
    const price = cost.trim() ? parsePositiveNumber(cost) : 0;
    if (!w.ok || !h.ok || !count || !finishedArea) return { ok: false as const, message: 'Enter valid sheet width, sheet height, sheet count, and finished part area.' };
    const totalArea = w.valueUm * h.valueUm * count;
    const areaFactor = unit === 'mm' ? 1_000_000 : unit === 'cm' ? 100_000_000 : 645_160_000;
    const finishedAreaUm2 = finishedArea * areaFactor;
    const yieldRate = Math.min(1, finishedAreaUm2 / totalArea);
    const wasteAreaUm2 = Math.max(0, totalArea - finishedAreaUm2);
    return { ok: true as const, totalArea, finishedAreaUm2, wasteAreaUm2, yieldRate, wasteRate: 1 - yieldRate, costWaste: price ? price * (1 - yieldRate) * count : 0 };
  }, [unit, sheetWidth, sheetHeight, sheetCount, partArea, cost]);
  return <section className="tool-card" id="yield-calculator">
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><h2 className="text-2xl font-black tracking-tight">Plywood Yield / Waste Calculator</h2><p className="text-sm text-stock-muted">Estimate sheet yield, waste area, sheet cost waste, and material usage before or after generating a full cutting layout.</p></div><span className="rounded-full border border-stock-line bg-white px-3 py-1 text-xs text-stock-muted">Standalone calculator</span></div>
    <div className="mt-4 grid gap-4 md:grid-cols-6"><label>Unit<select value={unit} onChange={(e) => setUnit(e.target.value as DisplayUnit)}><option value="in">square inches</option><option value="mm">square mm</option><option value="cm">square cm</option></select></label><label>Sheet width<input value={sheetWidth} onChange={(e) => setSheetWidth(e.target.value)} /></label><label>Sheet height<input value={sheetHeight} onChange={(e) => setSheetHeight(e.target.value)} /></label><label>Sheet count<input value={sheetCount} onChange={(e) => setSheetCount(e.target.value)} /></label><label>Finished part area<input value={partArea} onChange={(e) => setPartArea(e.target.value)} /></label><label>Cost / sheet<input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="optional" /></label></div>
    <div className="result-focus mt-4 rounded-2xl border border-stock-line bg-white p-4">{result.ok ? <div className="grid gap-3 md:grid-cols-4"><div><span className="text-xs uppercase text-stock-muted">Yield</span><strong className="block text-2xl">{formatPercent(result.yieldRate)}</strong></div><div><span className="text-xs uppercase text-stock-muted">Waste</span><strong className="block text-2xl">{formatPercent(result.wasteRate)}</strong></div><div><span className="text-xs uppercase text-stock-muted">Waste area</span><strong className="block text-xl">{formatDimension(Math.sqrt(result.wasteAreaUm2), unit)}²</strong></div><div><span className="text-xs uppercase text-stock-muted">Estimated waste cost</span><strong className="block text-xl">{result.costWaste ? `$${result.costWaste.toFixed(2)}` : '—'}</strong></div></div> : <p className="text-stock-warn">{result.message}</p>}<p className="mt-3 text-sm text-stock-muted">For full rectangular offcuts and printable layouts, use the sheet optimizer below. This quick calculator is only for area-level yield estimates.</p></div>
  </section>;
}
