import type { GrainLock, OptimizationWarning, OptimizedSheet, SheetOptimizationResult, SheetPartInput, SheetProjectInput, SheetPlacement, StockSheetInput, UnplacedPart } from '@/core/types';
import { parseDimension } from '@/core/units/parseDimension';
import { parseQuantity } from '@/core/validation/quantity';

interface PartInstance {
  partId: string;
  label: string;
  widthUm: number;
  heightUm: number;
  instanceIndex: number;
  allowRotation: boolean;
  material?: string;
  grainLock?: GrainLock;
  edgeBanding?: SheetPartInput['edgeBanding'];
}

interface FreeRect { xUm: number; yUm: number; widthUm: number; heightUm: number }
interface WorkingSheet extends OptimizedSheet { freeRects: FreeRect[] }
interface StockOption {
  input: StockSheetInput;
  widthUm: number;
  heightUm: number;
  trim: { top: number; right: number; bottom: number; left: number };
  usableWidthUm: number;
  usableHeightUm: number;
  quantity: number;
  opened: number;
  cost: number;
}

function parseCost(value?: string): number {
  if (!value?.trim()) return 0;
  const n = Number(value.replace(/[$,]/g, '').trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeMaterial(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function materialCompatible(part: PartInstance, stock: Pick<StockOption, 'input'> | Pick<OptimizedSheet, 'material'>): boolean {
  const partMaterial = normalizeMaterial(part.material);
  const stockMaterial = 'input' in stock ? normalizeMaterial(stock.input.material) : normalizeMaterial(stock.material);
  return !partMaterial || !stockMaterial || partMaterial === stockMaterial;
}

function expandParts(parts: SheetPartInput[], unit: SheetProjectInput['unit']): { parts: PartInstance[]; warnings: OptimizationWarning[] } {
  const expanded: PartInstance[] = [];
  const warnings: OptimizationWarning[] = [];
  for (const row of parts) {
    const width = parseDimension(row.width, unit);
    const height = parseDimension(row.height, unit);
    const quantity = parseQuantity(row.quantity);
    if (!width.ok || !height.ok || !quantity.ok) {
      warnings.push({ code: !quantity.ok ? 'INVALID_QUANTITY' : 'INVALID_DIMENSION', severity: 'error', partId: row.id, message: `${row.label || 'Part'} has invalid width, height, or quantity.` });
      continue;
    }
    if (width.valueUm <= 0 || height.valueUm <= 0) {
      warnings.push({ code: 'INVALID_DIMENSION', severity: 'error', partId: row.id, message: `${row.label || 'Part'} must have positive dimensions.` });
      continue;
    }
    const grainLock = row.grainLock ?? 'none';
    const canRotate = row.allowRotation && grainLock === 'none';
    for (let i = 1; i <= quantity.value; i += 1) {
      expanded.push({
        partId: row.id,
        label: row.label || `Part ${row.id}`,
        widthUm: width.valueUm,
        heightUm: height.valueUm,
        instanceIndex: i,
        allowRotation: canRotate,
        material: row.material,
        grainLock,
        edgeBanding: row.edgeBanding
      });
    }
  }
  expanded.sort((a, b) => b.widthUm * b.heightUm - a.widthUm * a.heightUm);
  return { parts: expanded, warnings };
}

function parseStockOption(stock: StockSheetInput, unit: SheetProjectInput['unit']): { option?: StockOption; warning?: OptimizationWarning } {
  const width = parseDimension(stock.width, unit);
  const height = parseDimension(stock.height, unit);
  const quantity = parseQuantity(stock.quantity, true);
  const trims = {
    top: parseDimension(stock.trimTop || '0', unit),
    right: parseDimension(stock.trimRight || '0', unit),
    bottom: parseDimension(stock.trimBottom || '0', unit),
    left: parseDimension(stock.trimLeft || '0', unit)
  };
  if (!width.ok || !height.ok || !quantity.ok || !trims.top.ok || !trims.right.ok || !trims.bottom.ok || !trims.left.ok) {
    return { warning: { code: 'INVALID_DIMENSION', severity: 'error', stockId: stock.id, message: `${stock.label || 'Stock'} has invalid dimensions, trim, quantity, or cost.` } };
  }
  const usableWidthUm = width.valueUm - trims.left.valueUm - trims.right.valueUm;
  const usableHeightUm = height.valueUm - trims.top.valueUm - trims.bottom.valueUm;
  if (usableWidthUm <= 0 || usableHeightUm <= 0) {
    return { warning: { code: 'TRIM_REDUCES_USABLE_AREA', severity: 'error', stockId: stock.id, message: `${stock.label || 'Stock'} trim leaves no usable sheet area.` } };
  }
  return {
    option: {
      input: stock,
      widthUm: width.valueUm,
      heightUm: height.valueUm,
      trim: { top: trims.top.valueUm, right: trims.right.valueUm, bottom: trims.bottom.valueUm, left: trims.left.valueUm },
      usableWidthUm,
      usableHeightUm,
      quantity: Math.min(quantity.value, 999),
      opened: 0,
      cost: parseCost(stock.cost)
    }
  };
}

function orientations(part: PartInstance): Array<{ widthUm: number; heightUm: number; rotated: boolean }> {
  const base = [{ widthUm: part.widthUm, heightUm: part.heightUm, rotated: false }];
  if (part.allowRotation && part.widthUm !== part.heightUm) base.push({ widthUm: part.heightUm, heightUm: part.widthUm, rotated: true });
  return base;
}

function makeSheet(option: StockOption, index: number): WorkingSheet {
  option.opened += 1;
  return {
    stockId: option.input.id,
    stockLabel: option.input.label,
    sheetIndex: index,
    widthUm: option.widthUm,
    heightUm: option.heightUm,
    usableXUm: option.trim.left,
    usableYUm: option.trim.top,
    usableWidthUm: option.usableWidthUm,
    usableHeightUm: option.usableHeightUm,
    material: option.input.material,
    grainDirection: option.input.grainDirection,
    stockCost: option.cost,
    isOffcut: option.input.isOffcut,
    placements: [],
    offcuts: [],
    freeRects: [{ xUm: option.trim.left, yUm: option.trim.top, widthUm: option.usableWidthUm, heightUm: option.usableHeightUm }]
  };
}

function rectArea(rect: FreeRect): number {
  return rect.widthUm * rect.heightUm;
}

function containsRect(a: FreeRect, b: FreeRect): boolean {
  return a.xUm <= b.xUm
    && a.yUm <= b.yUm
    && a.xUm + a.widthUm >= b.xUm + b.widthUm
    && a.yUm + a.heightUm >= b.yUm + b.heightUm;
}

function pruneFreeRects(rects: FreeRect[]): FreeRect[] {
  return rects
    .filter((rect) => rect.widthUm > 0 && rect.heightUm > 0)
    .filter((rect, index, all) => !all.some((other, otherIndex) => otherIndex !== index && containsRect(other, rect)))
    .sort((a, b) => rectArea(b) - rectArea(a));
}

function splitAfterPlacement(rect: FreeRect, widthUm: number, heightUm: number, kerfUm: number, mode: 'vertical-first' | 'horizontal-first'): FreeRect[] {
  const rightWidth = rect.widthUm - widthUm - kerfUm;
  const bottomHeight = rect.heightUm - heightUm - kerfUm;
  if (mode === 'vertical-first') {
    return [
      { xUm: rect.xUm + widthUm + kerfUm, yUm: rect.yUm, widthUm: rightWidth, heightUm: rect.heightUm },
      { xUm: rect.xUm, yUm: rect.yUm + heightUm + kerfUm, widthUm, heightUm: bottomHeight }
    ].filter((candidate) => candidate.widthUm > 0 && candidate.heightUm > 0);
  }
  return [
    { xUm: rect.xUm + widthUm + kerfUm, yUm: rect.yUm, widthUm: rightWidth, heightUm },
    { xUm: rect.xUm, yUm: rect.yUm + heightUm + kerfUm, widthUm: rect.widthUm, heightUm: bottomHeight }
  ].filter((candidate) => candidate.widthUm > 0 && candidate.heightUm > 0);
}

function scoreCandidate(rect: FreeRect, widthUm: number, heightUm: number, nextFreeRects: FreeRect[]): number {
  const wasteWidth = rect.widthUm - widthUm;
  const wasteHeight = rect.heightUm - heightUm;
  const leftoverArea = rectArea(rect) - widthUm * heightUm;
  const largestFreeArea = nextFreeRects.reduce((max, candidate) => Math.max(max, rectArea(candidate)), 0);
  const fragmentationPenalty = nextFreeRects.length * 1_000_000;
  const shortSidePenalty = Math.min(wasteWidth, wasteHeight);
  return leftoverArea - largestFreeArea * 0.18 + fragmentationPenalty + shortSidePenalty;
}

function placeInSheet(sheet: WorkingSheet, part: PartInstance, kerfUm: number): boolean {
  if (!materialCompatible(part, sheet)) return false;
  type PlacementCandidate = {
    rect: FreeRect;
    rectIndex: number;
    widthUm: number;
    heightUm: number;
    rotated: boolean;
    nextFreeRects: FreeRect[];
    score: number;
  };
  let best: PlacementCandidate | null = null;
  for (let rectIndex = 0; rectIndex < sheet.freeRects.length; rectIndex += 1) {
    const rect = sheet.freeRects[rectIndex];
    for (const orientation of orientations(part)) {
      if (orientation.widthUm > rect.widthUm || orientation.heightUm > rect.heightUm) continue;
      for (const splitMode of ['vertical-first', 'horizontal-first'] as const) {
        const remaining = sheet.freeRects.filter((_, index) => index !== rectIndex);
        const nextFreeRects = pruneFreeRects([...remaining, ...splitAfterPlacement(rect, orientation.widthUm, orientation.heightUm, kerfUm, splitMode)]);
        const score = scoreCandidate(rect, orientation.widthUm, orientation.heightUm, nextFreeRects);
        if (!best || score < best.score) best = { rect, rectIndex, ...orientation, nextFreeRects, score };
      }
    }
  }
  if (best === null) return false;
  const candidate = best;
  const placement: SheetPlacement = {
    partId: part.partId,
    partLabel: part.label,
    instanceIndex: part.instanceIndex,
    xUm: candidate.rect.xUm,
    yUm: candidate.rect.yUm,
    widthUm: candidate.widthUm,
    heightUm: candidate.heightUm,
    rotated: candidate.rotated,
    material: part.material,
    grainLock: part.grainLock,
    edgeBanding: part.edgeBanding
  };
  sheet.placements.push(placement);
  sheet.freeRects = candidate.nextFreeRects;
  return true;
}

function optionFits(option: StockOption, part: PartInstance): boolean {
  if (option.opened >= option.quantity || !materialCompatible(part, option)) return false;
  return orientations(part).some((o) => o.widthUm <= option.usableWidthUm && o.heightUm <= option.usableHeightUm);
}

function orderParts(parts: PartInstance[], order: string): PartInstance[] {
  const copy = [...parts];
  return copy.sort((a, b) => {
    if (order === 'locked-first') return Number(a.allowRotation) - Number(b.allowRotation) || b.widthUm * b.heightUm - a.widthUm * a.heightUm;
    if (order === 'long-edge') return Math.max(b.widthUm, b.heightUm) - Math.max(a.widthUm, a.heightUm) || b.widthUm * b.heightUm - a.widthUm * a.heightUm;
    if (order === 'wide-first') return b.widthUm - a.widthUm || b.heightUm - a.heightUm;
    if (order === 'tall-first') return b.heightUm - a.heightUm || b.widthUm - a.widthUm;
    if (order === 'short-edge') return Math.min(b.widthUm, b.heightUm) - Math.min(a.widthUm, a.heightUm) || b.widthUm * b.heightUm - a.widthUm * a.heightUm;
    return b.widthUm * b.heightUm - a.widthUm * a.heightUm;
  });
}

function scoreSheetResult(result: SheetOptimizationResult): number {
  return result.unplacedParts.length * 1_000_000_000
    + result.sheetsUsed.length * 1_000_000
    - Math.round(result.yieldRate * 100_000)
    + result.sheetsUsed.reduce((sum, sheet) => sum + sheet.offcuts.length, 0);
}

function packWithOrder(input: SheetProjectInput, order: string, started: number): SheetOptimizationResult {
  const kerf = parseDimension(input.kerf || '0', input.unit);
  if (!kerf.ok) {
    return { algorithm: 'Guillotine multi-order practical layout', durationMs: 0, sheetsUsed: [], unplacedParts: [], yieldRate: 0, wasteRate: 1, totalPartAreaUm2: 0, totalStockAreaUm2: 0, estimatedStockCost: 0, warnings: [{ code: 'INVALID_DIMENSION', severity: 'error', message: 'Kerf has an invalid value.' }] };
  }
  const warnings: OptimizationWarning[] = [];
  const stockInputs = [input.stock, ...(input.extraStocks ?? [])];
  const options: StockOption[] = [];
  for (const stock of stockInputs) {
    const parsed = parseStockOption(stock, input.unit);
    if (parsed.option) options.push(parsed.option);
    if (parsed.warning) warnings.push(parsed.warning);
  }
  const { parts, warnings: partWarnings } = expandParts(input.parts, input.unit);
  const strategy = input.strategy ?? 'least_waste';
  const orderedParts = orderParts(parts, order === 'strategy' && strategy === 'fewer_cuts' ? 'long-edge' : order);
  warnings.push(...partWarnings);
  const sheets: WorkingSheet[] = [];
  const unplacedParts: UnplacedPart[] = [];

  for (const part of orderedParts) {
    let placed = false;
    for (const sheet of sheets) {
      if (placeInSheet(sheet, part, kerf.valueUm)) { placed = true; break; }
    }
    if (!placed) {
      const option = options
        .filter((candidate) => optionFits(candidate, part))
        .sort((a, b) => {
          const areaA = a.usableWidthUm * a.usableHeightUm;
          const areaB = b.usableWidthUm * b.usableHeightUm;
          if (a.input.isOffcut !== b.input.isOffcut) return a.input.isOffcut ? -1 : 1;
          if (strategy === 'least_stock') return areaB - areaA;
          if (strategy === 'fewer_cuts') return Math.max(b.usableWidthUm, b.usableHeightUm) - Math.max(a.usableWidthUm, a.usableHeightUm);
          return areaA - areaB;
        })[0];
      if (option) {
        const sheet = makeSheet(option, sheets.length + 1);
        sheets.push(sheet);
        placed = placeInSheet(sheet, part, kerf.valueUm);
      }
    }
    if (!placed) {
      const fitsIfRotated = part.grainLock === 'none' && !part.allowRotation && options.some((option) => materialCompatible(part, option) && part.heightUm <= option.usableWidthUm && part.widthUm <= option.usableHeightUm && option.opened < option.quantity);
      const materialMismatch = Boolean(normalizeMaterial(part.material)) && options.length > 0 && !options.some((option) => materialCompatible(part, option));
      const reason = materialMismatch
        ? 'No stock with a matching material is available.'
        : fitsIfRotated
          ? 'Rotation is locked; this part would fit if rotation were allowed.'
          : 'Part is too large for available stock or all sheets are used.';
      unplacedParts.push({ partId: part.partId, label: part.label, widthUm: part.widthUm, heightUm: part.heightUm, reason });
      warnings.push({ code: materialMismatch ? 'MATERIAL_MISMATCH' : fitsIfRotated ? 'ROTATION_LOCKED_WOULD_FIT_IF_ROTATED' : 'NO_STOCK_AVAILABLE', severity: 'warning', partId: part.partId, message: `${part.label} could not be placed. ${reason}` });
    }
  }

  const cleanedSheets: OptimizedSheet[] = sheets.map(({ freeRects, ...sheet }) => ({
    ...sheet,
    offcuts: freeRects.map((rect) => ({ ...rect, areaUm2: rect.widthUm * rect.heightUm })).sort((a, b) => b.areaUm2 - a.areaUm2)
  }));
  const totalStockAreaUm2 = cleanedSheets.reduce((sum, sheet) => sum + sheet.widthUm * sheet.heightUm, 0);
  const totalPartAreaUm2 = cleanedSheets.reduce((sum, sheet) => sum + sheet.placements.reduce((partSum, placement) => partSum + placement.widthUm * placement.heightUm, 0), 0);
  const yieldRate = totalStockAreaUm2 ? totalPartAreaUm2 / totalStockAreaUm2 : 0;
  return {
    algorithm: `Guillotine multi-split layout (${order}), kerf-aware spacing, multi-stock aware, strategy: ${strategy}`,
    durationMs: Math.round(performance.now() - started),
    sheetsUsed: cleanedSheets,
    unplacedParts,
    yieldRate,
    wasteRate: totalStockAreaUm2 ? 1 - yieldRate : 1,
    totalPartAreaUm2,
    totalStockAreaUm2,
    estimatedStockCost: cleanedSheets.reduce((sum, sheet) => sum + (sheet.stockCost ?? 0), 0),
    warnings
  };
}

export function optimizeSheetProject(input: SheetProjectInput): SheetOptimizationResult {
  const started = performance.now();
  const attempts = ['strategy', 'area', 'long-edge', 'wide-first', 'tall-first', 'locked-first', 'short-edge'];
  let best: SheetOptimizationResult | null = null;
  for (const order of attempts) {
    const result = packWithOrder(input, order, started);
    if (!best || scoreSheetResult(result) < scoreSheetResult(best)) best = result;
    if (best.unplacedParts.length === 0 && (input.strategy ?? 'least_waste') === 'least_stock') break;
  }
  return best ?? packWithOrder(input, 'area', started);
}
