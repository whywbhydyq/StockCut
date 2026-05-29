import { describe, expect, it } from 'vitest';
import { optimizeLinearProject } from './bestFitDecreasing';

describe('optimizeLinearProject', () => {
  it('never exceeds usable stock length with kerf', () => {
    const r = optimizeLinearProject({ unit: 'in', kerf: '1/8', stock: { id: 's', label: 'stock', length: '96', quantity: 'auto', trimStart: '0', trimEnd: '0' }, parts: [{ id: 'p', label: 'Cut', length: '30', quantity: '3' }] });
    expect(r.stocksUsed.every((stock) => stock.usedLengthUm <= stock.usableLengthUm)).toBe(true);
  });

  it('reports selected optimization strategy', () => {
    const r = optimizeLinearProject({ unit: 'in', kerf: '0', strategy: 'fewer_cuts', stock: { id: 's', label: 'stock', length: '96', quantity: 'auto', trimStart: '0', trimEnd: '0' }, parts: [{ id: 'p', label: 'Cut', length: '24', quantity: '2' }] });
    expect(r.algorithm).toContain('fewer_cuts');
  });

  it('uses a reusable offcut before opening larger stock when it fits', () => {
    const r = optimizeLinearProject({
      unit: 'in',
      kerf: '1/8',
      stock: { id: 's', label: '8 ft lumber', length: '96', quantity: 'auto', trimStart: '0', trimEnd: '0', material: 'Lumber', cost: '8' },
      extraStocks: [{ id: 'o', label: 'Offcut', length: '40', quantity: '1', trimStart: '0', trimEnd: '0', material: 'Lumber', cost: '0', isOffcut: true }],
      parts: [{ id: 'p', label: 'Short', length: '30', quantity: '1', material: 'Lumber' }]
    });
    expect(r.stocksUsed[0].stockLabel).toBe('Offcut');
    expect(r.estimatedStockCost).toBe(0);
  });

  it('handles metric stock, trim, and stock quantity limits', () => {
    const r = optimizeLinearProject({ unit: 'mm', kerf: '3mm', stock: { id: 's', label: '6m bar', length: '6000mm', quantity: '1', trimStart: '10mm', trimEnd: '10mm' }, parts: [{ id: 'a', label: 'A', length: '1800mm', quantity: '2' }, { id: 'b', label: 'B', length: '1500mm', quantity: '2' }, { id: 'c', label: 'C', length: '1200mm', quantity: '2' }] });
    expect(r.stocksUsed.length).toBe(1);
    expect(r.unplacedCuts.length).toBeGreaterThan(0);
    expect(r.stocksUsed.every((stock) => stock.usedLengthUm <= stock.usableLengthUm)).toBe(true);
  });

  it('differs when kerf changes from zero to positive', () => {
    const input = { unit: 'mm' as const, stock: { id: 's', label: '6m bar', length: '6000mm', quantity: 'auto', trimStart: '0', trimEnd: '0' }, parts: [{ id: 'a', label: 'A', length: '2000mm', quantity: '3' }] };
    const zero = optimizeLinearProject({ ...input, kerf: '0' });
    const positive = optimizeLinearProject({ ...input, kerf: '3mm' });
    expect(zero.stocksUsed.length).not.toBe(positive.stocksUsed.length);
  });

  it('carries miter angle and shop notes into placements without changing straight-stock geometry', () => {
    const r = optimizeLinearProject({ unit: 'in', kerf: '0', stock: { id: 's', label: 'stock', length: '96', quantity: 'auto', trimStart: '0', trimEnd: '0' }, parts: [{ id: 'p', label: 'Rail', length: '24', quantity: '1', miterAngle: '45° both ends', notes: 'keep face side up' }] });
    expect(r.stocksUsed[0].cuts[0].miterAngle).toBe('45° both ends');
    expect(r.stocksUsed[0].cuts[0].notes).toBe('keep face side up');
    expect(r.stocksUsed[0].cuts[0].lengthUm).toBeGreaterThan(0);
  });

});
