import { describe, expect, it } from 'vitest';
import { optimizeSheetProject } from './guillotine';

describe('optimizeSheetProject', () => {
  it('makes kerf-aware 48x96 layouts differ', () => {
    const base = { unit: 'in' as const, stock: { id: 's', label: 'sheet', width: '48', height: '96', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'A', width: '24', height: '48', quantity: '2', allowRotation: false }] };
    expect(JSON.stringify(optimizeSheetProject({ ...base, kerf: '0' }))).not.toEqual(JSON.stringify(optimizeSheetProject({ ...base, kerf: '1/8' })));
  });

  it('arranges 2440x1220 mm stock', () => {
    const r = optimizeSheetProject({ unit: 'mm', kerf: '3mm', stock: { id: 's', label: 'sheet', width: '1220mm', height: '2440mm', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'P', width: '600mm', height: '800mm', quantity: '3', allowRotation: true }] });
    expect(r.sheetsUsed.length).toBeGreaterThan(0);
  });

  it('marks oversized parts unplaced', () => {
    const r = optimizeSheetProject({ unit: 'in', kerf: '0', stock: { id: 's', label: 'sheet', width: '10', height: '10', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'Huge', width: '11', height: '11', quantity: '1', allowRotation: true }] });
    expect(r.unplacedParts).toHaveLength(1);
  });

  it('differs when rotation is locked vs allowed', () => {
    const common = { unit: 'in' as const, kerf: '0', stock: { id: 's', label: 'sheet', width: '10', height: '20', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' } };
    const locked = optimizeSheetProject({ ...common, parts: [{ id: 'p', label: 'R', width: '18', height: '8', quantity: '1', allowRotation: false }] });
    const allowed = optimizeSheetProject({ ...common, parts: [{ id: 'p', label: 'R', width: '18', height: '8', quantity: '1', allowRotation: true }] });
    expect(locked.unplacedParts).toHaveLength(1);
    expect(allowed.sheetsUsed[0].placements).toHaveLength(1);
  });

  it('uses reusable offcuts and includes stock cost estimates', () => {
    const r = optimizeSheetProject({
      unit: 'in',
      kerf: '0',
      stock: { id: 's', label: 'Full sheet', width: '48', height: '96', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material: 'Plywood', cost: '50' },
      extraStocks: [{ id: 'o', label: 'Saved offcut', width: '20', height: '20', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material: 'Plywood', cost: '0', isOffcut: true }],
      parts: [{ id: 'p', label: 'Small', width: '10', height: '10', quantity: '1', allowRotation: true, material: 'Plywood' }]
    });
    expect(r.sheetsUsed[0].stockLabel).toBe('Saved offcut');
    expect(r.estimatedStockCost).toBe(0);
  });

  it('reports selected optimization strategy', () => {
    const r = optimizeSheetProject({ unit: 'in', kerf: '0', strategy: 'least_stock', stock: { id: 's', label: 'sheet', width: '48', height: '96', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'Panel', width: '12', height: '12', quantity: '1', allowRotation: true }] });
    expect(r.algorithm).toContain('least_stock');
  });

  it('keeps edge banding and grain metadata in placements', () => {
    const r = optimizeSheetProject({ unit: 'in', kerf: '0', stock: { id: 's', label: 'sheet', width: '24', height: '24', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'Door', width: '10', height: '10', quantity: '1', allowRotation: true, grainLock: 'vertical', edgeBanding: { top: true, right: true } }] });
    expect(r.sheetsUsed[0].placements[0].grainLock).toBe('vertical');
    expect(r.sheetsUsed[0].placements[0].edgeBanding?.top).toBe(true);
  });

  it('respects trim margins and keeps placements inside usable area', () => {
    const r = optimizeSheetProject({ unit: 'in', kerf: '0', stock: { id: 's', label: 'sheet', width: '10', height: '10', quantity: '1', trimTop: '1', trimRight: '1', trimBottom: '1', trimLeft: '1' }, parts: [{ id: 'p', label: 'Trimmed', width: '8', height: '8', quantity: '1', allowRotation: false }] });
    expect(r.sheetsUsed[0].placements[0].xUm).toBeGreaterThan(0);
    expect(r.sheetsUsed[0].placements[0].yUm).toBeGreaterThan(0);
  });

  it('does not exceed stock bounds and stays deterministic', () => {
    const input = { unit: 'in' as const, kerf: '1/8', stock: { id: 's', label: 'sheet', width: '48', height: '96', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'a', label: 'A', width: '20', height: '30', quantity: '3', allowRotation: true }, { id: 'b', label: 'B', width: '10', height: '18', quantity: '4', allowRotation: true }] };
    const a = optimizeSheetProject(input);
    const b = optimizeSheetProject(input);
    expect(JSON.stringify(a.sheetsUsed)).toEqual(JSON.stringify(b.sheetsUsed));
    for (const sheet of a.sheetsUsed) {
      for (const p of sheet.placements) {
        expect(p.xUm + p.widthUm).toBeLessThanOrEqual(sheet.widthUm);
        expect(p.yUm + p.heightUm).toBeLessThanOrEqual(sheet.heightUm);
      }
    }
    expect(a.yieldRate).toBeGreaterThan(0);
    expect(a.wasteRate).toBeLessThan(1);
  });

  it('handles a 100 part workload inside the performance budget', () => {
    const parts = Array.from({ length: 25 }, (_, index) => ({ id: `p${index}`, label: `Shelf ${index + 1}`, width: '11.5', height: '7.25', quantity: '4', allowRotation: true }));
    const started = performance.now();
    const r = optimizeSheetProject({ unit: 'in', kerf: '1/8', stock: { id: 's', label: '4x8 plywood', width: '48', height: '96', quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts });
    expect(r.sheetsUsed.length).toBeGreaterThan(0);
    expect(performance.now() - started).toBeLessThan(3000);
  });

});
