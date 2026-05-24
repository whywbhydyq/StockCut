import type { DisplayUnit } from '@/core/types';
import { UM_PER_CM, UM_PER_INCH, UM_PER_MM } from './parseDimension';

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function formatDimension(valueUm: number, unit: DisplayUnit = 'in'): string {
  if (unit === 'mm') return `${Math.round(valueUm / UM_PER_MM)} mm`;
  if (unit === 'cm') return `${(valueUm / UM_PER_CM).toFixed(1).replace(/\.0$/, '')} cm`;
  const decimalInches = valueUm / UM_PER_INCH;
  if (unit === 'in') return `${decimalInches.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')} in`;
  const feet = Math.floor(decimalInches / 12);
  let inches = decimalInches - feet * 12;
  const whole = Math.floor(inches);
  const denominator = 16;
  let numerator = Math.round((inches - whole) * denominator);
  let wholeInches = whole;
  if (numerator === denominator) {
    wholeInches += 1;
    numerator = 0;
  }
  let inchText = String(wholeInches);
  if (numerator) {
    const divisor = gcd(numerator, denominator);
    inchText = `${wholeInches ? `${wholeInches} ` : ''}${numerator / divisor}/${denominator / divisor}`;
  }
  return feet > 0 ? `${feet}' ${inchText}"` : `${inchText}"`;
}

export function formatArea(areaUm2: number, unit: DisplayUnit): string {
  if (unit === 'mm' || unit === 'cm') return `${Math.round(areaUm2 / 1_000_000)} mm²`;
  return `${(areaUm2 / (UM_PER_INCH * UM_PER_INCH)).toFixed(2)} in²`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
