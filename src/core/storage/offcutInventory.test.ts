import { describe, expect, it } from 'vitest';
import { linearInventoryToStock, sheetInventoryToStock } from './offcutInventory';

describe('offcut inventory conversion', () => {
  it('converts sheet inventory records back into reusable sheet stock', () => {
    const stock = sheetInventoryToStock({ id: 'o1', label: 'Offcut', width: '24 in', height: '36 in', unit: 'in', source: 'test', savedAt: '2026-05-25T00:00:00.000Z', material: 'Plywood', grainDirection: 'none' });
    expect(stock.isOffcut).toBe(true);
    expect(stock.quantity).toBe('1');
    expect(stock.width).toBe('24 in');
  });

  it('converts linear inventory records back into reusable straight stock', () => {
    const stock = linearInventoryToStock({ id: 'l1', label: 'Bar offcut', length: '48 in', unit: 'in', source: 'test', savedAt: '2026-05-25T00:00:00.000Z', material: 'Lumber' });
    expect(stock.isOffcut).toBe(true);
    expect(stock.length).toBe('48 in');
  });
});
