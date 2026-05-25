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
  return rowsToCsv([
    ['sheet', 'stock_label', 'material', 'label', 'instance', 'x', 'y', 'width', 'height', 'rotated', 'grain_lock', 'edge_banding'],
    ...result.sheetsUsed.flatMap((sheet) => sheet.placements.map((p) => [sheet.sheetIndex, sheet.stockLabel, p.material ?? sheet.material ?? '', p.partLabel, p.instanceIndex, formatDimension(p.xUm, unit), formatDimension(p.yUm, unit), formatDimension(p.widthUm, unit), formatDimension(p.heightUm, unit), p.rotated ? 'yes' : 'no', p.grainLock ?? '', edgeText(p.edgeBanding)]))
  ]);
}
export function exportLinearResultCsv(result: LinearOptimizationResult, unit: DisplayUnit): string {
  return rowsToCsv([
    ['stock', 'stock_label', 'material', 'label', 'instance', 'start', 'length', 'miter_angle', 'notes'],
    ...result.stocksUsed.flatMap((stock) => stock.cuts.map((cut) => [stock.stockIndex, stock.stockLabel, stock.material ?? '', cut.partLabel, cut.instanceIndex, formatDimension(cut.startUm, unit), formatDimension(cut.lengthUm, unit), cut.miterAngle ?? '', cut.notes ?? '']))
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
