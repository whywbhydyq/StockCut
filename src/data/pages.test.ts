import { describe, expect, it } from 'vitest';
import { pages } from './pages';

describe('SEO page matrix', () => {
  it('includes remaining requirement pages and aliases', () => {
    const slugs = new Set(pages.map((page) => page.slug));
    for (const slug of [
      '/saw-kerf-compensation-calculator',
      '/rebar-cutting-optimizer',
      '/plywood-yield-rate-calculator',
      '/cut-list-optimizer-vs-sketchup',
      '/plywood-factory-edge-trim',
      '/grain-direction-in-cut-lists',
      '/edge-banding-in-cut-list',
      '/reduce-plywood-waste',
      '/tools/sheet-cutting-optimizer',
      '/calculators/4x8-plywood-cut-list-optimizer',
      '/guides/saw-kerf-explained'
    ]) {
      expect(slugs.has(slug)).toBe(true);
    }
  });
});
