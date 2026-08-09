import { describe, expect, it } from 'vitest';
import { publicSheetBenchmarkCases, runPublicSheetBenchmarks } from './sheetBenchmarks';

describe('public sheet optimizer benchmarks', () => {
  it('publishes multiple deterministic, reproducible cases without pretending to prove optimality', () => {
    expect(publicSheetBenchmarkCases.length).toBeGreaterThanOrEqual(3);
    const first = runPublicSheetBenchmarks();
    const second = runPublicSheetBenchmarks();
    expect(first.map(({ durationMs: _duration, ...result }) => result)).toEqual(second.map(({ durationMs: _duration, ...result }) => result));
    for (const result of first) {
      expect(result.sheetsUsed).toBeGreaterThanOrEqual(result.areaLowerBoundSheets);
      expect(result.unplacedParts).toBe(0);
      expect(result.placedParts).toBeGreaterThan(0);
      expect(result.cutSteps).toBeGreaterThan(0);
      expect(result.algorithm).toContain('Guillotine');
    }
  });
});
