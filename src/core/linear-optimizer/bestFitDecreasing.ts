import type { LinearOptimizationResult, LinearPartInput, LinearProjectInput, LinearStockInput, OptimizationWarning, OptimizedLinearStock, UnplacedLinearCut } from '@/core/types';
import { parseDimension } from '@/core/units/parseDimension';
import { parseQuantity } from '@/core/validation/quantity';

interface CutInstance { partId: string; label: string; lengthUm: number; instanceIndex: number; material?: string; miterAngle?: string; notes?: string }
interface StockOption { input: LinearStockInput; lengthUm: number; usableLengthUm: number; quantity: number; opened: number; material?: string; cost: number; isOffcut?: boolean }

function parseCost(value?: string): number {
  if (!value?.trim()) return 0;
  const n = Number(value.replace(/[$,]/g, '').trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function normalizeMaterial(value?: string): string { return (value ?? '').trim().toLowerCase(); }
function compatible(cut: CutInstance, stock: StockOption | OptimizedLinearStock): boolean {
  const cutMaterial = normalizeMaterial(cut.material);
  const stockMaterial = normalizeMaterial('input' in stock ? stock.input.material : stock.material);
  return !cutMaterial || !stockMaterial || cutMaterial === stockMaterial;
}

function expandCuts(parts: LinearPartInput[], unit: LinearProjectInput['unit']): { cuts: CutInstance[]; warnings: OptimizationWarning[] } {
  const cuts: CutInstance[] = [];
  const warnings: OptimizationWarning[] = [];
  for (const row of parts) {
    const length = parseDimension(row.length, unit);
    const quantity = parseQuantity(row.quantity);
    if (!length.ok || !quantity.ok) {
      warnings.push({ code: !quantity.ok ? 'INVALID_QUANTITY' : 'INVALID_DIMENSION', severity: 'error', partId: row.id, message: `${row.label || 'Cut'} has invalid length or quantity.` });
      continue;
    }
    if (length.valueUm <= 0) {
      warnings.push({ code: 'INVALID_DIMENSION', severity: 'error', partId: row.id, message: `${row.label || 'Cut'} must have a positive length.` });
      continue;
    }
    for (let i = 1; i <= quantity.value; i += 1) cuts.push({ partId: row.id, label: row.label || `Cut ${row.id}`, lengthUm: length.valueUm, instanceIndex: i, material: row.material, miterAngle: row.miterAngle, notes: row.notes });
  }
  cuts.sort((a, b) => b.lengthUm - a.lengthUm);
  return { cuts, warnings };
}

function parseStockOption(stock: LinearStockInput, unit: LinearProjectInput['unit']): { option?: StockOption; warning?: OptimizationWarning } {
  const length = parseDimension(stock.length, unit);
  const trimStart = parseDimension(stock.trimStart || '0', unit);
  const trimEnd = parseDimension(stock.trimEnd || '0', unit);
  const quantity = parseQuantity(stock.quantity, true);
  if (!length.ok || !trimStart.ok || !trimEnd.ok || !quantity.ok) {
    return { warning: { code: 'INVALID_DIMENSION', severity: 'error', stockId: stock.id, message: `${stock.label || 'Stock'} has invalid length, trim, quantity, or cost.` } };
  }
  const usableLengthUm = length.valueUm - trimStart.valueUm - trimEnd.valueUm;
  if (usableLengthUm <= 0) return { warning: { code: 'TRIM_REDUCES_USABLE_AREA', severity: 'error', stockId: stock.id, message: `${stock.label || 'Stock'} trim leaves no usable stock length.` } };
  return { option: { input: stock, lengthUm: length.valueUm, usableLengthUm, quantity: Math.min(quantity.value, 999), opened: 0, material: stock.material, cost: parseCost(stock.cost), isOffcut: stock.isOffcut } };
}

export function optimizeLinearProject(input: LinearProjectInput): LinearOptimizationResult {
  const started = performance.now();
  const kerf = parseDimension(input.kerf || '0', input.unit);
  const warnings: OptimizationWarning[] = [];
  if (!kerf.ok) {
    return { algorithm: 'Best-fit decreasing', durationMs: 0, stocksUsed: [], unplacedCuts: [], totalStockLengthUm: 0, totalCutLengthUm: 0, totalKerfLossUm: 0, estimatedStockCost: 0, wasteRate: 1, warnings: [{ code: 'INVALID_DIMENSION', severity: 'error', message: 'Kerf has an invalid value.' }] };
  }
  const options: StockOption[] = [];
  for (const stock of [input.stock, ...(input.extraStocks ?? [])]) {
    const parsed = parseStockOption(stock, input.unit);
    if (parsed.option) options.push(parsed.option);
    if (parsed.warning) warnings.push(parsed.warning);
  }
  const { cuts, warnings: cutWarnings } = expandCuts(input.parts, input.unit);
  const strategy = input.strategy ?? 'least_waste';
  const orderedCuts = [...cuts].sort((a, b) => {
    if (strategy === 'fewer_cuts') return b.lengthUm - a.lengthUm;
    return b.lengthUm - a.lengthUm;
  });
  warnings.push(...cutWarnings);
  const stocks: OptimizedLinearStock[] = [];
  const unplacedCuts: UnplacedLinearCut[] = [];

  const openStock = (option: StockOption): OptimizedLinearStock | null => {
    if (option.opened >= option.quantity) return null;
    option.opened += 1;
    const stock: OptimizedLinearStock = {
      stockId: option.input.id,
      stockLabel: option.input.label,
      stockIndex: stocks.length + 1,
      lengthUm: option.lengthUm,
      usableLengthUm: option.usableLengthUm,
      cuts: [],
      kerfCount: 0,
      usedLengthUm: 0,
      wasteLengthUm: option.usableLengthUm,
      material: option.material,
      stockCost: option.cost,
      isOffcut: option.isOffcut
    };
    stocks.push(stock);
    return stock;
  };

  for (const cut of orderedCuts) {
    let best: { stock: OptimizedLinearStock; requiredUm: number; remainingUm: number } | null = null;
    for (const stock of stocks) {
      if (!compatible(cut, stock)) continue;
      const requiredUm = cut.lengthUm + (stock.cuts.length ? kerf.valueUm : 0);
      const remainingUm = stock.wasteLengthUm - requiredUm;
      if (remainingUm >= 0 && (!best || remainingUm < best.remainingUm)) best = { stock, requiredUm, remainingUm };
    }
    if (!best) {
      const option = options
        .filter((candidate) => candidate.opened < candidate.quantity && compatible(cut, candidate) && cut.lengthUm <= candidate.usableLengthUm)
        .sort((a, b) => {
          if (strategy === 'least_stock') return b.usableLengthUm - a.usableLengthUm;
          if (strategy === 'fewer_cuts') return b.usableLengthUm - a.usableLengthUm;
          return a.usableLengthUm - b.usableLengthUm;
        })[0];
      const stock = option ? openStock(option) : null;
      if (stock) best = { stock, requiredUm: cut.lengthUm, remainingUm: stock.wasteLengthUm - cut.lengthUm };
    }
    if (!best || best.remainingUm < 0) {
      const materialMismatch = normalizeMaterial(cut.material) && options.length > 0 && !options.some((option) => compatible(cut, option));
      const reason = materialMismatch ? 'No stock with a matching material is available.' : 'Cut is longer than usable stock length or no stock remains available.';
      unplacedCuts.push({ partId: cut.partId, label: cut.label, lengthUm: cut.lengthUm, reason });
      warnings.push({ code: materialMismatch ? 'MATERIAL_MISMATCH' : 'NO_STOCK_AVAILABLE', severity: 'warning', partId: cut.partId, message: `${cut.label} could not be placed. ${reason}` });
      continue;
    }
    const startUm = best.stock.usedLengthUm + (best.stock.cuts.length ? kerf.valueUm : 0);
    best.stock.cuts.push({ partId: cut.partId, partLabel: cut.label, instanceIndex: cut.instanceIndex, startUm, lengthUm: cut.lengthUm, miterAngle: cut.miterAngle, notes: cut.notes });
    best.stock.kerfCount = Math.max(0, best.stock.cuts.length - 1);
    best.stock.usedLengthUm += cut.lengthUm + (best.stock.cuts.length > 1 ? kerf.valueUm : 0);
    best.stock.wasteLengthUm = best.stock.usableLengthUm - best.stock.usedLengthUm;
  }
  const totalStockLengthUm = stocks.reduce((sum, stock) => sum + stock.usableLengthUm, 0);
  const totalCutLengthUm = stocks.reduce((sum, stock) => sum + stock.cuts.reduce((cutSum, cut) => cutSum + cut.lengthUm, 0), 0);
  const totalKerfLossUm = stocks.reduce((sum, stock) => sum + stock.kerfCount * kerf.valueUm, 0);
  return {
    algorithm: `Best-fit decreasing, kerf-aware, multi-stock aware, strategy: ${strategy}`,
    durationMs: Math.round(performance.now() - started),
    stocksUsed: stocks,
    unplacedCuts,
    totalStockLengthUm,
    totalCutLengthUm,
    totalKerfLossUm,
    estimatedStockCost: stocks.reduce((sum, stock) => sum + (stock.stockCost ?? 0), 0),
    wasteRate: totalStockLengthUm ? 1 - totalCutLengthUm / totalStockLengthUm : 1,
    warnings
  };
}
