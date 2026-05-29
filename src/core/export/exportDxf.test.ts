import { describe, expect, it } from 'vitest';
import { optimizeSheetProject } from '@/core/sheet-optimizer/guillotine';
import { sheetResultToDxf } from './exportDxf';

describe('sheetResultToDxf', () => {
  it('exports rectangular layout entities and labels', () => {
    const result = optimizeSheetProject({ unit: 'in', kerf: '0', stock: { id: 's', label: 'sheet', width: '48', height: '96', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0' }, parts: [{ id: 'p', label: 'Panel', width: '12', height: '12', quantity: '1', allowRotation: true }] });
    const dxf = sheetResultToDxf(result);
    expect(dxf).toContain('SECTION');
    expect(dxf).toContain('Panel');
    expect(dxf).toContain('not CNC toolpath');
  });
});
