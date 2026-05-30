import { describe, expect, it } from 'vitest';
import { canonicalPages, canonicalSlugs, pageBySlug, redirectAliases } from './pages';
import { priorityLongTailAudit } from './longTailAuditMatrix';

describe('SEO page matrix', () => {
  it('keeps canonical pages separate from redirect aliases', () => {
    const canonicalSet = new Set(canonicalPages.map((page) => page.slug));
    const aliasSources = new Set(redirectAliases.map((alias) => alias.source));

    for (const slug of [
      '/',
      '/sheet-cutting-optimizer',
      '/linear-cutting-optimizer',
      '/saw-kerf-calculator',
      '/4x8-plywood-cut-list-optimizer',
      '/plywood-cutting-layout-calculator',
      '/pvc-pipe-cutting-optimizer',
      '/steel-tube-cutting-optimizer',
      '/how-to-account-for-saw-kerf',
      '/privacy'
    ]) {
      expect(canonicalSet.has(slug)).toBe(true);
      expect(canonicalSlugs.has(slug)).toBe(true);
      expect(pageBySlug(slug).slug).toBe(slug);
    }

    for (const alias of [
      '/tools/sheet-cutting-optimizer',
      '/calculators/4x8-plywood-cut-list-optimizer',
      '/guides/saw-kerf-explained',
      '/legal/privacy'
    ]) {
      expect(aliasSources.has(alias)).toBe(true);
      expect(canonicalSet.has(alias)).toBe(false);
    }
  });

  it('has audit coverage for the five priority long-tail pages', () => {
    const auditedSlugs = new Set(priorityLongTailAudit.map((item) => item.slug));
    for (const slug of [
      '/4x8-plywood-cut-list-optimizer',
      '/sheet-cutting-optimizer',
      '/linear-cutting-optimizer',
      '/pvc-pipe-cutting-optimizer',
      '/steel-tube-cutting-optimizer'
    ]) {
      expect(auditedSlugs.has(slug)).toBe(true);
    }
  });
});
