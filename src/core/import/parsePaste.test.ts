import { describe, expect, it } from 'vitest';
import { parseLinearPaste, parseSheetPaste } from './parsePaste';

describe('parseSheetPaste', () => {
  it('reports row errors for missing columns', () => {
    expect(parseSheetPaste('Only\t12\nGood\t12\t8\t2').ok).toBe(false);
  });
  it('parses optional material, grain, and edge banding columns', () => {
    const result = parseSheetPaste('Door\t12\t24\t1\tno\tMelamine\tvertical\tyes\ttrue\tno\t1');
    expect(result.ok).toBe(true);
    expect(result.records[0].material).toBe('Melamine');
    expect(result.records[0].grainLock).toBe('vertical');
    expect(result.records[0].edgeBanding?.right).toBe(true);
    expect(result.records[0].edgeBanding?.left).toBe(true);
  });
});

describe('parseLinearPaste', () => {
  it('parses optional material column', () => {
    const result = parseLinearPaste('Rail\t36\t2\tSteel tube');
    expect(result.ok).toBe(true);
    expect(result.records[0].material).toBe('Steel tube');
  });
});
