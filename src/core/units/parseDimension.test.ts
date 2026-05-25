import { describe, expect, it } from 'vitest';
import { parseDimension } from './parseDimension';

describe('parseDimension', () => {
  it('parses fractional inches', () => expect(parseDimension('12 1/2', 'in')).toEqual({ ok: true, valueUm: 317500 }));
  it('parses hyphenated fractional inches', () => expect(parseDimension('12-1/2', 'in')).toEqual({ ok: true, valueUm: 317500 }));
  it('parses feet-inch', () => expect(parseDimension(`1' 3 3/4"`, 'in')).toEqual({ ok: true, valueUm: 400050 }));
  it('parses explicit feet', () => expect(parseDimension('4 ft', 'in')).toEqual({ ok: true, valueUm: 1219200 }));
  it('accepts 4x8 ft shorthand by returning the larger side for single-dimension validation', () => expect(parseDimension('4x8 ft', 'in')).toEqual({ ok: true, valueUm: 2438400 }));
  it('parses explicit inch suffix', () => expect(parseDimension('96 in', 'mm')).toEqual({ ok: true, valueUm: 2438400 }));
  it('parses metric units', () => expect(parseDimension('122cm', 'mm')).toEqual({ ok: true, valueUm: 1220000 }));
  it('rejects invalid dimensions', () => {
    expect(parseDimension('abc', 'in').ok).toBe(false);
    expect(parseDimension('12//5', 'in').ok).toBe(false);
    expect(parseDimension('', 'in').ok).toBe(false);
  });
});
