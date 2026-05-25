import type { OffcutRegion, OptimizedSheet, SheetPlacement } from '@/core/types';

export interface ManualAdjustmentResult {
  ok: boolean;
  sheet: OptimizedSheet;
  message?: string;
}

function rectsOverlap(a: SheetPlacement, b: SheetPlacement): boolean {
  return a.xUm < b.xUm + b.widthUm
    && a.xUm + a.widthUm > b.xUm
    && a.yUm < b.yUm + b.heightUm
    && a.yUm + a.heightUm > b.yUm;
}

function placementKey(placement: Pick<SheetPlacement, 'partId' | 'instanceIndex'>): string {
  return `${placement.partId}:${placement.instanceIndex}`;
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values.filter((value) => Number.isFinite(value)).map((value) => Math.round(value)))).sort((a, b) => a - b);
}

export function recomputeSheetOffcuts(sheet: OptimizedSheet): OffcutRegion[] {
  const usableRight = sheet.usableXUm + sheet.usableWidthUm;
  const usableBottom = sheet.usableYUm + sheet.usableHeightUm;
  const xs = uniqueSorted([sheet.usableXUm, usableRight, ...sheet.placements.flatMap((p) => [p.xUm, p.xUm + p.widthUm])])
    .filter((value) => value >= sheet.usableXUm && value <= usableRight);
  const ys = uniqueSorted([sheet.usableYUm, usableBottom, ...sheet.placements.flatMap((p) => [p.yUm, p.yUm + p.heightUm])])
    .filter((value) => value >= sheet.usableYUm && value <= usableBottom);
  const cells: OffcutRegion[] = [];
  for (let yi = 0; yi < ys.length - 1; yi += 1) {
    const yUm = ys[yi];
    const heightUm = ys[yi + 1] - yUm;
    if (heightUm <= 0) continue;
    let run: OffcutRegion | null = null;
    for (let xi = 0; xi < xs.length - 1; xi += 1) {
      const xUm = xs[xi];
      const widthUm = xs[xi + 1] - xUm;
      if (widthUm <= 0) continue;
      const occupied = sheet.placements.some((p) => xUm >= p.xUm && xUm + widthUm <= p.xUm + p.widthUm && yUm >= p.yUm && yUm + heightUm <= p.yUm + p.heightUm);
      if (!occupied) {
        if (run && run.yUm === yUm && run.heightUm === heightUm && run.xUm + run.widthUm === xUm) {
          run.widthUm += widthUm;
          run.areaUm2 = run.widthUm * run.heightUm;
        } else {
          run = { xUm, yUm, widthUm, heightUm, areaUm2: widthUm * heightUm };
          cells.push(run);
        }
      } else {
        run = null;
      }
    }
  }
  return cells.filter((offcut) => offcut.widthUm > 0 && offcut.heightUm > 0).sort((a, b) => b.areaUm2 - a.areaUm2);
}

export function manuallyMoveSheetPlacement(sheet: OptimizedSheet, key: string, xUm: number, yUm: number): ManualAdjustmentResult {
  const index = sheet.placements.findIndex((placement) => placementKey(placement) === key);
  if (index < 0) return { ok: false, sheet, message: 'Select a placed part before adjusting the layout.' };
  const target = sheet.placements[index];
  const maxX = sheet.usableXUm + sheet.usableWidthUm - target.widthUm;
  const maxY = sheet.usableYUm + sheet.usableHeightUm - target.heightUm;
  const moved: SheetPlacement = {
    ...target,
    xUm: Math.round(Math.max(sheet.usableXUm, Math.min(maxX, xUm))),
    yUm: Math.round(Math.max(sheet.usableYUm, Math.min(maxY, yUm)))
  };
  const placements = sheet.placements.map((placement, i) => i === index ? moved : placement);
  const collision = placements.some((placement, i) => i !== index && rectsOverlap(moved, placement));
  if (collision) return { ok: false, sheet, message: 'Manual move blocked: that position overlaps another part.' };
  const nextSheet: OptimizedSheet = { ...sheet, placements };
  return { ok: true, sheet: { ...nextSheet, offcuts: recomputeSheetOffcuts(nextSheet) } };
}

export function rotateSheetPlacement(sheet: OptimizedSheet, key: string): ManualAdjustmentResult {
  const index = sheet.placements.findIndex((placement) => placementKey(placement) === key);
  if (index < 0) return { ok: false, sheet, message: 'Select a placed part before rotating.' };
  const target = sheet.placements[index];
  if (target.grainLock && target.grainLock !== 'none') return { ok: false, sheet, message: 'Rotation blocked: this part has grain direction locked.' };
  const rotated: SheetPlacement = { ...target, widthUm: target.heightUm, heightUm: target.widthUm, rotated: !target.rotated };
  const maxX = sheet.usableXUm + sheet.usableWidthUm - rotated.widthUm;
  const maxY = sheet.usableYUm + sheet.usableHeightUm - rotated.heightUm;
  rotated.xUm = Math.round(Math.max(sheet.usableXUm, Math.min(maxX, rotated.xUm)));
  rotated.yUm = Math.round(Math.max(sheet.usableYUm, Math.min(maxY, rotated.yUm)));
  if (rotated.widthUm > sheet.usableWidthUm || rotated.heightUm > sheet.usableHeightUm) return { ok: false, sheet, message: 'Rotation blocked: rotated part is larger than the usable sheet area.' };
  const placements = sheet.placements.map((placement, i) => i === index ? rotated : placement);
  const collision = placements.some((placement, i) => i !== index && rectsOverlap(rotated, placement));
  if (collision) return { ok: false, sheet, message: 'Rotation blocked: rotated part overlaps another part.' };
  const nextSheet: OptimizedSheet = { ...sheet, placements };
  return { ok: true, sheet: { ...nextSheet, offcuts: recomputeSheetOffcuts(nextSheet) } };
}
