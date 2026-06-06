import type { DisplayUnit, EdgeBanding, GrainLock, LinearPartInput, LinearProjectInput, LinearStockInput, OptimizationStrategy, SheetPartInput, SheetProjectInput, StockSheetInput } from '@/core/types';
import { parseDimension } from '@/core/units/parseDimension';
import { parseQuantity } from '@/core/validation/quantity';
import { MAX_DIMENSION_CHARS, MAX_EXPANDED_ITEMS, MAX_EXTRA_STOCK_ROWS, MAX_LABEL_CHARS, MAX_NOTE_CHARS, MAX_PART_QUANTITY, MAX_PROJECT_ROWS, MAX_STOCK_QUANTITY } from '@/core/validation/limits';

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

type UnknownRecord = Record<string, unknown>;

const DISPLAY_UNITS: readonly DisplayUnit[] = ['mm', 'cm', 'in', 'ft-in'];
const STRATEGIES: readonly OptimizationStrategy[] = ['least_stock', 'least_waste', 'fewer_cuts'];
const GRAIN_LOCKS: readonly GrainLock[] = ['none', 'horizontal', 'vertical'];

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function error<T>(message: string): ValidationResult<T> {
  return { ok: false, error: message };
}

function checked<T>(result: ValidationResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

function text(value: unknown, field: string, maxLength = MAX_LABEL_CHARS, fallback?: string): ValidationResult<string> {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return { ok: true, value: fallback };
    return error(`${field} is required.`);
  }
  const next = String(value).trim();
  if (!next) {
    if (fallback !== undefined) return { ok: true, value: fallback };
    return error(`${field} is required.`);
  }
  if (next.length > maxLength) return error(`${field} is too long.`);
  return { ok: true, value: next };
}

function optionalText(value: unknown, field: string, maxLength = MAX_LABEL_CHARS): ValidationResult<string | undefined> {
  if (value === undefined || value === null || value === '') return { ok: true, value: undefined };
  return text(value, field, maxLength);
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function displayUnit(value: unknown): ValidationResult<DisplayUnit> {
  if (DISPLAY_UNITS.includes(value as DisplayUnit)) return { ok: true, value: value as DisplayUnit };
  return error('Project unit must be mm, cm, in, or ft-in.');
}

function strategy(value: unknown): OptimizationStrategy | undefined {
  return STRATEGIES.includes(value as OptimizationStrategy) ? value as OptimizationStrategy : undefined;
}

function grainLock(value: unknown, fallback: GrainLock = 'none'): GrainLock {
  return GRAIN_LOCKS.includes(value as GrainLock) ? value as GrainLock : fallback;
}

function id(value: unknown, prefix: string, index: number): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  return raw && raw.length <= MAX_LABEL_CHARS ? raw : `${prefix}-${index + 1}`;
}

function dimensionText(value: unknown, field: string, unit: DisplayUnit, fallback?: string): ValidationResult<string> {
  const parsedText = text(value, field, MAX_DIMENSION_CHARS, fallback);
  if (!parsedText.ok) return parsedText;
  const parsedDimension = parseDimension(parsedText.value, unit);
  if (!parsedDimension.ok || parsedDimension.valueUm < 0) return error(`${field} must be a valid non-negative dimension.`);
  return parsedText;
}

function positiveDimensionText(value: unknown, field: string, unit: DisplayUnit): ValidationResult<string> {
  const parsedText = text(value, field, MAX_DIMENSION_CHARS);
  if (!parsedText.ok) return parsedText;
  const parsedDimension = parseDimension(parsedText.value, unit);
  if (!parsedDimension.ok || parsedDimension.valueUm <= 0) return error(`${field} must be a valid positive dimension.`);
  return parsedText;
}

function quantityText(value: unknown, field: string, max: number, allowAuto = false): ValidationResult<string> {
  const parsedText = text(value, field, MAX_DIMENSION_CHARS, allowAuto ? 'auto' : undefined);
  if (!parsedText.ok) return parsedText;
  const quantity = parseQuantity(parsedText.value, { allowAuto, max });
  if (!quantity.ok) return error(`${field}: ${quantity.error}`);
  return parsedText;
}

function validateEdgeBanding(value: unknown): EdgeBanding | undefined {
  if (!isRecord(value)) return undefined;
  return {
    top: booleanValue(value.top),
    right: booleanValue(value.right),
    bottom: booleanValue(value.bottom),
    left: booleanValue(value.left)
  };
}

function validateSheetStock(value: unknown, unit: DisplayUnit, index = 0): ValidationResult<StockSheetInput> {
  if (!isRecord(value)) return error('Sheet stock must be an object.');
  const label = text(value.label, 'Stock label', MAX_LABEL_CHARS, index === 0 ? 'Stock sheet' : `Extra stock ${index}`);
  const width = positiveDimensionText(value.width, 'Stock width', unit);
  const height = positiveDimensionText(value.height, 'Stock height', unit);
  const quantity = quantityText(value.quantity, 'Stock quantity', MAX_STOCK_QUANTITY, true);
  const trimTop = dimensionText(value.trimTop, 'Top trim', unit, '0');
  const trimRight = dimensionText(value.trimRight, 'Right trim', unit, '0');
  const trimBottom = dimensionText(value.trimBottom, 'Bottom trim', unit, '0');
  const trimLeft = dimensionText(value.trimLeft, 'Left trim', unit, '0');
  const material = optionalText(value.material, 'Stock material');
  const cost = optionalText(value.cost, 'Stock cost', MAX_DIMENSION_CHARS);
  const fields = [label, width, height, quantity, trimTop, trimRight, trimBottom, trimLeft, material, cost];
  const failed = fields.find((field) => !field.ok);
  if (failed && !failed.ok) return error(failed.error);
  return {
    ok: true,
    value: {
      id: id(value.id, 'sheet-stock', index),
      label: checked(label),
      width: checked(width),
      height: checked(height),
      quantity: checked(quantity),
      trimTop: checked(trimTop),
      trimRight: checked(trimRight),
      trimBottom: checked(trimBottom),
      trimLeft: checked(trimLeft),
      material: checked(material),
      grainDirection: grainLock(value.grainDirection),
      cost: checked(cost),
      isOffcut: booleanValue(value.isOffcut)
    }
  };
}

function validateSheetPart(value: unknown, unit: DisplayUnit, index: number): ValidationResult<SheetPartInput> {
  if (!isRecord(value)) return error(`Sheet part row ${index + 1} must be an object.`);
  const label = text(value.label, `Sheet part ${index + 1} label`, MAX_LABEL_CHARS, `Part ${index + 1}`);
  const width = positiveDimensionText(value.width, `Sheet part ${index + 1} width`, unit);
  const height = positiveDimensionText(value.height, `Sheet part ${index + 1} height`, unit);
  const quantity = quantityText(value.quantity, `Sheet part ${index + 1} quantity`, MAX_PART_QUANTITY);
  const material = optionalText(value.material, `Sheet part ${index + 1} material`);
  const fields = [label, width, height, quantity, material];
  const failed = fields.find((field) => !field.ok);
  if (failed && !failed.ok) return error(failed.error);
  const lock = grainLock(value.grainLock);
  return {
    ok: true,
    value: {
      id: id(value.id, 'sheet-part', index),
      label: checked(label),
      width: checked(width),
      height: checked(height),
      quantity: checked(quantity),
      allowRotation: lock === 'none' && booleanValue(value.allowRotation, true),
      material: checked(material),
      grainLock: lock,
      edgeBanding: validateEdgeBanding(value.edgeBanding)
    }
  };
}

function validateLinearStock(value: unknown, unit: DisplayUnit, index = 0): ValidationResult<LinearStockInput> {
  if (!isRecord(value)) return error('Linear stock must be an object.');
  const label = text(value.label, 'Stock label', MAX_LABEL_CHARS, index === 0 ? 'Stock length' : `Extra stock ${index}`);
  const length = positiveDimensionText(value.length, 'Stock length', unit);
  const quantity = quantityText(value.quantity, 'Stock quantity', MAX_STOCK_QUANTITY, true);
  const trimStart = dimensionText(value.trimStart, 'Start trim', unit, '0');
  const trimEnd = dimensionText(value.trimEnd, 'End trim', unit, '0');
  const material = optionalText(value.material, 'Stock material');
  const cost = optionalText(value.cost, 'Stock cost', MAX_DIMENSION_CHARS);
  const fields = [label, length, quantity, trimStart, trimEnd, material, cost];
  const failed = fields.find((field) => !field.ok);
  if (failed && !failed.ok) return error(failed.error);
  return {
    ok: true,
    value: {
      id: id(value.id, 'linear-stock', index),
      label: checked(label),
      length: checked(length),
      quantity: checked(quantity),
      trimStart: checked(trimStart),
      trimEnd: checked(trimEnd),
      material: checked(material),
      cost: checked(cost),
      isOffcut: booleanValue(value.isOffcut)
    }
  };
}

function validateLinearPart(value: unknown, unit: DisplayUnit, index: number): ValidationResult<LinearPartInput> {
  if (!isRecord(value)) return error(`Linear part row ${index + 1} must be an object.`);
  const label = text(value.label, `Linear cut ${index + 1} label`, MAX_LABEL_CHARS, `Cut ${index + 1}`);
  const length = positiveDimensionText(value.length, `Linear cut ${index + 1} length`, unit);
  const quantity = quantityText(value.quantity, `Linear cut ${index + 1} quantity`, MAX_PART_QUANTITY);
  const material = optionalText(value.material, `Linear cut ${index + 1} material`);
  const miterAngle = optionalText(value.miterAngle, `Linear cut ${index + 1} miter angle`, MAX_DIMENSION_CHARS);
  const notes = optionalText(value.notes, `Linear cut ${index + 1} notes`, MAX_NOTE_CHARS);
  const fields = [label, length, quantity, material, miterAngle, notes];
  const failed = fields.find((field) => !field.ok);
  if (failed && !failed.ok) return error(failed.error);
  return {
    ok: true,
    value: {
      id: id(value.id, 'linear-part', index),
      label: checked(label),
      length: checked(length),
      quantity: checked(quantity),
      material: checked(material),
      miterAngle: checked(miterAngle),
      notes: checked(notes)
    }
  };
}

function validateExpandedItemLimit(parts: Array<{ quantity: string }>, max = MAX_EXPANDED_ITEMS): ValidationResult<void> {
  let total = 0;
  for (const part of parts) {
    const quantity = parseQuantity(part.quantity, { max: MAX_PART_QUANTITY });
    if (!quantity.ok) return error(quantity.error);
    total += checked(quantity);
    if (total > max) return error(`Project expands to more than ${max.toLocaleString()} parts. Split it into smaller batches before optimizing.`);
  }
  return { ok: true, value: undefined };
}

export function validateSheetProjectInput(value: unknown): ValidationResult<SheetProjectInput> {
  if (!isRecord(value)) return error('JSON file is not a StockCut sheet project.');
  const unit = displayUnit(value.unit);
  if (!unit.ok) return error(unit.error);
  const kerf = dimensionText(value.kerf, 'Kerf', unit.value, '0');
  if (!kerf.ok) return error(kerf.error);
  const stock = validateSheetStock(value.stock, unit.value, 0);
  if (!stock.ok) return error(stock.error);
  const rawParts = Array.isArray(value.parts) ? value.parts : null;
  if (!rawParts) return error('Sheet project parts must be an array.');
  if (rawParts.length === 0) return error('Sheet project must contain at least one part.');
  if (rawParts.length > MAX_PROJECT_ROWS) return error(`Sheet project has too many part rows. Maximum is ${MAX_PROJECT_ROWS.toLocaleString()}.`);
  const parts: SheetPartInput[] = [];
  for (let index = 0; index < rawParts.length; index += 1) {
    const part = validateSheetPart(rawParts[index], unit.value, index);
    if (!part.ok) return error(part.error);
    parts.push(part.value);
  }
  const expanded = validateExpandedItemLimit(parts);
  if (!expanded.ok) return error(expanded.error);
  const rawExtraStocks = Array.isArray(value.extraStocks) ? value.extraStocks : [];
  if (rawExtraStocks.length > MAX_EXTRA_STOCK_ROWS) return error(`Project has too many extra stock rows. Maximum is ${MAX_EXTRA_STOCK_ROWS}.`);
  const extraStocks: StockSheetInput[] = [];
  for (let index = 0; index < rawExtraStocks.length; index += 1) {
    const parsed = validateSheetStock(rawExtraStocks[index], unit.value, index + 1);
    if (!parsed.ok) return error(parsed.error);
    extraStocks.push(parsed.value);
  }
  return { ok: true, value: { unit: unit.value, kerf: kerf.value, strategy: strategy(value.strategy), stock: stock.value, extraStocks, parts } };
}

export function validateLinearProjectInput(value: unknown): ValidationResult<LinearProjectInput> {
  if (!isRecord(value)) return error('JSON file is not a StockCut linear project.');
  const unit = displayUnit(value.unit);
  if (!unit.ok) return error(unit.error);
  const kerf = dimensionText(value.kerf, 'Kerf', unit.value, '0');
  if (!kerf.ok) return error(kerf.error);
  const stock = validateLinearStock(value.stock, unit.value, 0);
  if (!stock.ok) return error(stock.error);
  const rawParts = Array.isArray(value.parts) ? value.parts : null;
  if (!rawParts) return error('Linear project parts must be an array.');
  if (rawParts.length === 0) return error('Linear project must contain at least one cut.');
  if (rawParts.length > MAX_PROJECT_ROWS) return error(`Linear project has too many cut rows. Maximum is ${MAX_PROJECT_ROWS.toLocaleString()}.`);
  const parts: LinearPartInput[] = [];
  for (let index = 0; index < rawParts.length; index += 1) {
    const part = validateLinearPart(rawParts[index], unit.value, index);
    if (!part.ok) return error(part.error);
    parts.push(part.value);
  }
  const expanded = validateExpandedItemLimit(parts);
  if (!expanded.ok) return error(expanded.error);
  const rawExtraStocks = Array.isArray(value.extraStocks) ? value.extraStocks : [];
  if (rawExtraStocks.length > MAX_EXTRA_STOCK_ROWS) return error(`Project has too many extra stock rows. Maximum is ${MAX_EXTRA_STOCK_ROWS}.`);
  const extraStocks: LinearStockInput[] = [];
  for (let index = 0; index < rawExtraStocks.length; index += 1) {
    const parsed = validateLinearStock(rawExtraStocks[index], unit.value, index + 1);
    if (!parsed.ok) return error(parsed.error);
    extraStocks.push(parsed.value);
  }
  return { ok: true, value: { unit: unit.value, kerf: kerf.value, strategy: strategy(value.strategy), stock: stock.value, extraStocks, parts } };
}
