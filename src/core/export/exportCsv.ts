import type { LinearOptimizationResult, SheetOptimizationResult, DisplayUnit } from '@/core/types';
import { formatDimension } from '@/core/units/formatDimension';

function quote(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function rowsToCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(quote).join(',')).join('\n');
}
function edgeText(edge: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean } | undefined): string {
  if (!edge) return '';
  return ['top', 'right', 'bottom', 'left'].filter((side) => edge[side as keyof typeof edge]).join('|');
}
export function exportSheetResultCsv(result: SheetOptimizationResult, unit: DisplayUnit): string {
  const placedRows = result.sheetsUsed.flatMap((sheet) => sheet.placements.map((p) => [
    'placed',
    sheet.sheetIndex,
    sheet.stockLabel,
    p.material ?? sheet.material ?? '',
    p.partLabel,
    p.instanceIndex,
    formatDimension(p.xUm, unit),
    formatDimension(p.yUm, unit),
    formatDimension(p.widthUm, unit),
    formatDimension(p.heightUm, unit),
    p.rotated ? 'yes' : 'no',
    p.grainLock ?? '',
    edgeText(p.edgeBanding),
    ''
  ]));
  const unplacedRows = result.unplacedParts.map((part) => [
    'unplaced',
    '',
    '',
    '',
    part.label,
    '',
    '',
    '',
    formatDimension(part.widthUm, unit),
    formatDimension(part.heightUm, unit),
    '',
    '',
    '',
    part.reason
  ]);
  const warningRows = result.warnings.map((warning) => ['warning', '', '', '', '', '', '', '', '', '', '', '', '', warning.message]);
  return rowsToCsv([
    ['status', 'sheet', 'stock_label', 'material', 'label', 'instance', 'x', 'y', 'width', 'height', 'rotated', 'grain_lock', 'edge_banding', 'note'],
    ...placedRows,
    ...unplacedRows,
    ...warningRows
  ]);
}
export function exportLinearResultCsv(result: LinearOptimizationResult, unit: DisplayUnit): string {
  const placedRows = result.stocksUsed.flatMap((stock) => stock.cuts.map((cut) => [
    'placed',
    stock.stockIndex,
    stock.stockLabel,
    stock.material ?? '',
    cut.partLabel,
    cut.instanceIndex,
    formatDimension(cut.startUm, unit),
    formatDimension(cut.lengthUm, unit),
    cut.miterAngle ?? '',
    cut.notes ?? ''
  ]));
  const unplacedRows = result.unplacedCuts.map((cut) => [
    'unplaced',
    '',
    '',
    '',
    cut.label,
    '',
    '',
    formatDimension(cut.lengthUm, unit),
    '',
    cut.reason
  ]);
  const warningRows = result.warnings.map((warning) => ['warning', '', '', '', '', '', '', '', '', warning.message]);
  return rowsToCsv([
    ['status', 'stock', 'stock_label', 'material', 'label', 'instance', 'start', 'length', 'miter_angle', 'notes'],
    ...placedRows,
    ...unplacedRows,
    ...warningRows
  ]);
}
export function downloadText(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
