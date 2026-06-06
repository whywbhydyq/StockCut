import type { GrainLock, LinearPartInput, SheetPartInput } from '@/core/types';
import { assertTextSize, MAX_CELL_CHARS, MAX_LABEL_CHARS, MAX_PASTE_COLUMNS, MAX_PASTE_ROWS, MAX_PASTE_TEXT_CHARS } from '@/core/validation/limits';

export interface PasteIssue { row: number; message: string }
export interface SheetPasteResult { ok: boolean; records: SheetPartInput[]; errors: PasteIssue[] }
export interface LinearPasteResult { ok: boolean; records: LinearPartInput[]; errors: PasteIssue[] }

interface ParsedRow { cells: string[]; rowNumber: number }

type HeaderMap = Record<string, number>;

const SHEET_HEADERS = {
  label: ['label', 'name', 'part', 'part name', 'part label', 'description'],
  width: ['width', 'w', 'x', 'part width'],
  height: ['height', 'h', 'y', 'part height'],
  quantity: ['quantity', 'qty', 'count', 'pieces', 'pcs'],
  rotate: ['rotate', 'rotation', 'allow rotation', 'can rotate', 'rotatable'],
  material: ['material', 'stock material', 'sheet material'],
  grain: ['grain', 'grain lock', 'grain direction'],
  edgeTop: ['edge top', 'edgetop', 'band top', 'top edge'],
  edgeRight: ['edge right', 'edgeright', 'band right', 'right edge'],
  edgeBottom: ['edge bottom', 'edgebottom', 'band bottom', 'bottom edge'],
  edgeLeft: ['edge left', 'edgeleft', 'band left', 'left edge']
} as const;

const LINEAR_HEADERS = {
  label: ['label', 'name', 'cut', 'part', 'part name', 'description'],
  length: ['length', 'len', 'l', 'cut length'],
  quantity: ['quantity', 'qty', 'count', 'pieces', 'pcs'],
  material: ['material', 'stock material'],
  miterAngle: ['miter', 'miter angle', 'angle', 'cut angle'],
  notes: ['notes', 'note', 'comment', 'comments']
} as const;

function makeId(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.();
  return random ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_\-./]+/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
}

function countDelimiter(row: string, delimiter: string): number {
  let count = 0;
  let quoted = false;
  for (let i = 0; i < row.length; i += 1) {
    const ch = row[i];
    if (ch === '"') {
      if (quoted && row[i + 1] === '"') i += 1;
      else quoted = !quoted;
    } else if (!quoted && ch === delimiter) count += 1;
  }
  return count;
}

function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).filter((line) => line.trim()).slice(0, 8);
  const candidates = ['\t', ',', ';'];
  const scores = candidates.map((delimiter) => ({
    delimiter,
    score: sample.reduce((sum, row) => sum + countDelimiter(row, delimiter), 0)
  }));
  return scores.sort((a, b) => b.score - a.score)[0]?.delimiter ?? '\t';
}


function limitCell(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > MAX_CELL_CHARS ? trimmed.slice(0, MAX_CELL_CHARS) : trimmed;
}

function makeLimitError(message: string): PasteIssue {
  return { row: 1, message };
}

function parseDelimitedRows(text: string): ParsedRow[] {
  assertTextSize(text, MAX_PASTE_TEXT_CHARS, 'Pasted table');
  const delimiter = detectDelimiter(text);
  const rows: ParsedRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let rowNumber = 1;
  let currentRowNumber = 1;

  const pushCell = () => {
    if (cells.length >= MAX_PASTE_COLUMNS) throw new Error(`Pasted table has too many columns. Maximum is ${MAX_PASTE_COLUMNS}.`);
    cells.push(limitCell(cell));
    cell = '';
  };
  const pushRow = () => {
    pushCell();
    if (cells.some((value) => value.trim())) {
      if (rows.length >= MAX_PASTE_ROWS) throw new Error(`Pasted table has too many rows. Maximum is ${MAX_PASTE_ROWS.toLocaleString()}.`);
      rows.push({ cells, rowNumber: currentRowNumber });
    }
    cells = [];
    currentRowNumber = rowNumber + 1;
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && ch === delimiter) {
      pushCell();
      continue;
    }
    if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      pushRow();
      rowNumber += 1;
      continue;
    }
    cell += ch;
  }
  if (cell || cells.length) pushRow();
  return rows;
}

function headerIndex(cells: string[], aliases: readonly string[]): number | undefined {
  const normalized = cells.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalized.indexOf(normalizeHeader(alias));
    if (index !== -1) return index;
  }
  return undefined;
}

function buildHeaderMap(cells: string[], headers: Record<string, readonly string[]>): HeaderMap {
  const map: HeaderMap = {};
  for (const [key, aliases] of Object.entries(headers)) {
    const index = headerIndex(cells, aliases);
    if (index !== undefined) map[key] = index;
  }
  return map;
}

function hasSheetHeader(cells: string[]): boolean {
  const map = buildHeaderMap(cells, SHEET_HEADERS);
  return map.label !== undefined && map.width !== undefined && map.height !== undefined && map.quantity !== undefined;
}

function hasLinearHeader(cells: string[]): boolean {
  const map = buildHeaderMap(cells, LINEAR_HEADERS);
  return map.label !== undefined && map.length !== undefined && map.quantity !== undefined;
}

function cell(cells: string[], map: HeaderMap | null, name: string, fallbackIndex: number): string {
  const index = map?.[name] ?? fallbackIndex;
  return String(cells[index] ?? '').trim();
}

function boolCell(value?: string): boolean {
  return /^(yes|true|1|band|edge|x|y)$/i.test(value ?? '');
}
function grainCell(value?: string): GrainLock {
  return /horizontal/i.test(value ?? '') ? 'horizontal' : /vertical/i.test(value ?? '') ? 'vertical' : 'none';
}
function allowRotationCell(value?: string): boolean {
  if (!String(value ?? '').trim()) return true;
  return !/^(no|false|0|locked|lock|fixed)$/i.test(String(value).trim());
}

export function parseSheetPaste(text: string): SheetPasteResult {
  const records: SheetPartInput[] = [];
  const errors: PasteIssue[] = [];
  let rows: ParsedRow[];
  try {
    rows = parseDelimitedRows(String(text));
  } catch (error) {
    return { ok: false, records, errors: [makeLimitError(error instanceof Error ? error.message : 'Pasted table could not be parsed.')] };
  }
  const header = rows[0] && hasSheetHeader(rows[0].cells) ? buildHeaderMap(rows[0].cells, SHEET_HEADERS) : null;
  const dataRows = header ? rows.slice(1) : rows;

  dataRows.forEach(({ cells, rowNumber }) => {
    const label = cell(cells, header, 'label', 0).slice(0, MAX_LABEL_CHARS);
    const width = cell(cells, header, 'width', 1);
    const height = cell(cells, header, 'height', 2);
    const quantity = cell(cells, header, 'quantity', 3);
    if (!label || !width || !height || !quantity) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber} is missing label, width, height, or quantity.` });
      return;
    }
    const grainLock = grainCell(cell(cells, header, 'grain', 6));
    records.push({
      id: makeId('sheet-part'),
      label,
      width,
      height,
      quantity,
      allowRotation: grainLock === 'none' && allowRotationCell(cell(cells, header, 'rotate', 4)),
      material: cell(cells, header, 'material', 5) || undefined,
      grainLock,
      edgeBanding: {
        top: boolCell(cell(cells, header, 'edgeTop', 7)),
        right: boolCell(cell(cells, header, 'edgeRight', 8)),
        bottom: boolCell(cell(cells, header, 'edgeBottom', 9)),
        left: boolCell(cell(cells, header, 'edgeLeft', 10))
      }
    });
  });
  return { ok: errors.length === 0 && records.length > 0, records, errors: records.length === 0 && errors.length === 0 ? [{ row: 1, message: 'No sheet rows were found.' }] : errors };
}

export function parseLinearPaste(text: string): LinearPasteResult {
  const records: LinearPartInput[] = [];
  const errors: PasteIssue[] = [];
  let rows: ParsedRow[];
  try {
    rows = parseDelimitedRows(String(text));
  } catch (error) {
    return { ok: false, records, errors: [makeLimitError(error instanceof Error ? error.message : 'Pasted table could not be parsed.')] };
  }
  const header = rows[0] && hasLinearHeader(rows[0].cells) ? buildHeaderMap(rows[0].cells, LINEAR_HEADERS) : null;
  const dataRows = header ? rows.slice(1) : rows;

  dataRows.forEach(({ cells, rowNumber }) => {
    const label = cell(cells, header, 'label', 0).slice(0, MAX_LABEL_CHARS);
    const length = cell(cells, header, 'length', 1);
    const quantity = cell(cells, header, 'quantity', 2);
    if (!label || !length || !quantity) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber} is missing label, length, or quantity.` });
      return;
    }
    records.push({
      id: makeId('linear-part'),
      label,
      length,
      quantity,
      material: cell(cells, header, 'material', 3) || undefined,
      miterAngle: cell(cells, header, 'miterAngle', 4) || undefined,
      notes: cell(cells, header, 'notes', 5).slice(0, MAX_CELL_CHARS) || undefined
    });
  });
  return { ok: errors.length === 0 && records.length > 0, records, errors: records.length === 0 && errors.length === 0 ? [{ row: 1, message: 'No linear cut rows were found.' }] : errors };
}
