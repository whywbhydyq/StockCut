import type { DisplayUnit } from '@/core/types';

export const UM_PER_MM = 1000;
export const UM_PER_INCH = 25400;
export const UM_PER_CM = 10000;
export const UM_PER_M = 1000000;

export type ParseResult = { ok: true; valueUm: number } | { ok: false; error: string };

function parseMixedNumber(input: string): number {
  const normalized = input.trim().replace(/[–—]/g, '-').replace(/^(\d+)\s*-(\d+)\s*\/(\d+)$/, '$1 $2/$3');
  if (!normalized) return Number.NaN;
  let total = 0;
  for (const part of normalized.split(/\s+/)) {
    if (!part) continue;
    const fraction = part.match(/^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (fraction) {
      const numerator = Number(fraction[1]);
      const denominator = Number(fraction[2]);
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return Number.NaN;
      total += numerator / denominator;
    } else {
      const value = Number(part);
      if (!Number.isFinite(value)) return Number.NaN;
      total += value;
    }
  }
  return total;
}

function multiplierFor(unit: DisplayUnit | 'm'): number {
  if (unit === 'mm') return UM_PER_MM;
  if (unit === 'cm') return UM_PER_CM;
  if (unit === 'm') return UM_PER_M;
  return UM_PER_INCH;
}

export function parseDimension(raw: string, defaultUnit: DisplayUnit = 'in'): ParseResult {
  const original = String(raw ?? '').trim();
  if (!original) return { ok: false, error: 'Dimension is missing.' };
  const text = original.toLowerCase().replace(/,/g, '').replace(/[×]/g, 'x');
  const twoDimensional = text.match(/^(.+?)\s*x\s*(.+)$/);
  if (twoDimensional) {
    const first = parseDimension(twoDimensional[1].trim(), defaultUnit);
    const second = parseDimension(twoDimensional[2].trim(), defaultUnit);
    if (first.ok && second.ok) return { ok: true, valueUm: Math.max(first.valueUm, second.valueUm) };
  }
  if (/\bft\b|\bfeet\b|\bfoot\b|'/.test(text)) {
    const match = text.match(/^(.+?)'\s*(.*?)"?$/) ?? text.match(/^(.+?)\s*(?:ft|feet|foot)\b\s*(.*?)$/);
    if (!match) return { ok: false, error: 'Could not parse feet-inch dimension.' };
    const feet = parseMixedNumber(match[1]);
    const inchRaw = match[2].replace(/\binches?\b|\bin\b|"/g, '').trim();
    const inches = inchRaw ? parseMixedNumber(inchRaw) : 0;
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) return { ok: false, error: 'Could not parse feet-inch dimension.' };
    const valueUm = Math.round((feet * 12 + inches) * UM_PER_INCH);
    return valueUm >= 0 ? { ok: true, valueUm } : { ok: false, error: 'Dimension must be non-negative.' };
  }
  const unitMatch = text.match(/(millimeters?|centimeters?|meters?|inches?|inch|mm|cm|m|in|")\s*$/);
  let unit: DisplayUnit | 'm' = defaultUnit;
  if (unitMatch) {
    const suffix = unitMatch[1];
    if (suffix === 'mm' || suffix.startsWith('millimeter')) unit = 'mm';
    else if (suffix === 'cm' || suffix.startsWith('centimeter')) unit = 'cm';
    else if (suffix === 'm' || suffix.startsWith('meter')) unit = 'm';
    else unit = 'in';
  }
  const numberText = text.replace(/(millimeters?|centimeters?|meters?|inches?|inch|mm|cm|m|in|")\s*$/, '').trim();
  const value = parseMixedNumber(numberText);
  if (!Number.isFinite(value) || value < 0) return { ok: false, error: 'Dimension must be a non-negative number.' };
  return { ok: true, valueUm: Math.round(value * multiplierFor(unit)) };
}
