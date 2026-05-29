import { describe, expect, it } from 'vitest';
import type { OptimizedSheet } from '@/core/types';
import { manuallyMoveSheetPlacement, recomputeSheetOffcuts, rotateSheetPlacement } from './manualAdjust';

function baseSheet(): OptimizedSheet {
  return {
    stockId: 's',
    stockLabel: 'sheet',
    sheetIndex: 1,
    widthUm: 1000,
    heightUm: 1000,
    usableXUm: 0,
    usableYUm: 0,
    usableWidthUm: 1000,
    usableHeightUm: 1000,
    placements: [
      { partId: 'a', partLabel: 'A', instanceIndex: 1, xUm: 0, yUm: 0, widthUm: 300, heightUm: 300, rotated: false },
      { partId: 'b', partLabel: 'B', instanceIndex: 1, xUm: 500, yUm: 0, widthUm: 300, heightUm: 300, rotated: false }
    ],
    offcuts: []
  };
}

describe('manual sheet adjustment', () => {
  it('moves a placement inside bounds and recomputes offcuts', () => {
    const moved = manuallyMoveSheetPlacement(baseSheet(), 'a:1', 100, 500);
    expect(moved.ok).toBe(true);
    expect(moved.sheet.placements[0].xUm).toBe(100);
    expect(moved.sheet.placements[0].yUm).toBe(500);
    expect(moved.sheet.offcuts.length).toBeGreaterThan(0);
  });

  it('blocks overlapping manual moves', () => {
    const moved = manuallyMoveSheetPlacement(baseSheet(), 'a:1', 550, 20);
    expect(moved.ok).toBe(false);
    expect(moved.message).toContain('overlaps');
  });

  it('blocks grain-locked rotations and allows normal rotations', () => {
    const locked = { ...baseSheet(), placements: [{ ...baseSheet().placements[0], grainLock: 'vertical' as const }] };
    expect(rotateSheetPlacement(locked, 'a:1').ok).toBe(false);
    const rotated = rotateSheetPlacement(baseSheet(), 'a:1');
    expect(rotated.ok).toBe(true);
  });

  it('finds empty offcut cells from current placement positions', () => {
    const offcuts = recomputeSheetOffcuts(baseSheet());
    expect(offcuts.reduce((sum, offcut) => sum + offcut.areaUm2, 0)).toBeGreaterThan(0);
  });
});
