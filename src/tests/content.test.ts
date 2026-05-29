import { describe, expect, it } from 'vitest';
import { allContentPages, allPagePaths, allTools, guidePages, longTailPages, supportPages } from '@/src/content/pages';

describe('content registry', () => {
  it('contains required first-version pages', () => {
    expect(allTools.length).toBeGreaterThanOrEqual(10);
    expect(allPagePaths).toContain('/room-ac-btu-calculator/');
    expect(allPagePaths).toContain('/dehumidifier-size-calculator/');
    expect(allPagePaths).toContain('/bathroom-fan-cfm-calculator/');
    expect(allPagePaths).toContain('/guides/cfm-vs-ach/');
    expect(allContentPages.length).toBeGreaterThanOrEqual(35);
  });

  it('each page has SEO basics', () => {
    for (const page of allContentPages) {
      expect(page.h1.length).toBeGreaterThan(5);
      expect(page.title.length).toBeGreaterThan(5);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.path.endsWith('/')).toBe(true);
    }
  });

  it('expanded article pages are not direct-answer-only placeholders', () => {
    for (const page of [...guidePages, ...longTailPages, ...supportPages]) {
      expect(page.directAnswer?.length ?? 0).toBeGreaterThan(60);
      expect(page.sections?.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(page.sections?.some((section) => section.body.join(' ').length > 100)).toBe(true);
    }
  });

  it('priority content pages include internal related links', () => {
    const priorityPaths = [
      '/guides/how-many-btu-per-square-foot/',
      '/guides/portable-ac-sacc-vs-btu/',
      '/guides/what-size-dehumidifier-for-basement/',
      '/guides/cfm-vs-ach/',
      '/guides/bathroom-fan-cfm-guide/',
      '/room-size/what-size-ac-for-300-sq-ft/',
      '/privacy/',
      '/terms/',
      '/disclaimer/'
    ];

    for (const path of priorityPaths) {
      const page = allContentPages.find((item) => item.path === path);
      expect(page).toBeDefined();
      expect(page?.sections?.length ?? 0).toBeGreaterThanOrEqual(1);
      if (page?.kind !== 'support') {
        expect(page?.relatedLinks?.length ?? 0).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
