import { describe, expect, it } from 'vitest';
import { buildShareUrl } from './shareProject';

describe('buildShareUrl', () => {
  it('stores project data in the URL hash rather than the query string', () => {
    const url = buildShareUrl('sheet-2d', { unit: 'in', kerf: '1/8' }, 'https://stockcut.test/sheet-cutting-optimizer');
    expect(url).toContain('#stockcut=');
    expect(url).not.toContain('?');
  });
});
