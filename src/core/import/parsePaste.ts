import type { GrainLock, LinearPartInput, SheetPartInput } from '@/core/types';

export interface PasteIssue { row: number; message: string }
export interface SheetPasteResult { ok: boolean; records: SheetPartInput[]; errors: PasteIssue[] }
export interface LinearPasteResult { ok: boolean; records: LinearPartInput[]; errors: PasteIssue[] }

function splitRow(row: string): string[] {
  return (row.includes('\t') ? row.split('\t') : row.split(',')).map((cell) => cell.trim());
}
function boolCell(value?: string): boolean {
  return /^(yes|true|1|band|edge|x)$/i.test(value ?? '');
}
function grainCell(value?: string): GrainLock {
  return /horizontal/i.test(value ?? '') ? 'horizontal' : /vertical/i.test(value ?? '') ? 'vertical' : 'none';
}

export function parseSheetPaste(text: string): SheetPasteResult {
  const records: SheetPartInput[] = [];
  const errors: PasteIssue[] = [];
  String(text).split(/\r?\n/).filter(Boolean).forEach((row, index) => {
    if (index === 0 && /label|width|height|quantity/i.test(row)) return;
    const cells = splitRow(row);
    if (cells.length < 4 || !cells[0] || !cells[1] || !cells[2] || !cells[3]) {
      errors.push({ row: index + 1, message: `Row ${index + 1} is missing label, width, height, or quantity.` });
      return;
    }
    const grainLock = grainCell(cells[6]);
    records.push({
      id: crypto.randomUUID(),
      label: cells[0],
      width: cells[1],
      height: cells[2],
      quantity: cells[3],
      allowRotation: grainLock === 'none' && !/^no|false|locked$/i.test(cells[4] || 'yes'),
      material: cells[5] || undefined,
      grainLock,
      edgeBanding: { top: boolCell(cells[7]), right: boolCell(cells[8]), bottom: boolCell(cells[9]), left: boolCell(cells[10]) }
    });
  });
  return { ok: errors.length === 0, records, errors };
}

export function parseLinearPaste(text: string): LinearPasteResult {
  const records: LinearPartInput[] = [];
  const errors: PasteIssue[] = [];
  String(text).split(/\r?\n/).filter(Boolean).forEach((row, index) => {
    if (index === 0 && /label|length|quantity/i.test(row)) return;
    const cells = splitRow(row);
    if (cells.length < 3 || !cells[0] || !cells[1] || !cells[2]) {
      errors.push({ row: index + 1, message: `Row ${index + 1} is missing label, length, or quantity.` });
      return;
    }
    records.push({ id: crypto.randomUUID(), label: cells[0], length: cells[1], quantity: cells[2], material: cells[3] || undefined });
  });
  return { ok: errors.length === 0, records, errors };
}
