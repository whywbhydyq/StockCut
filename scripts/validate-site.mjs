import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (file) => fs.readFileSync(file, 'utf8');
const pages = read('src/data/pages.ts');
const shell = read('src/components/page/PageShell.tsx');
const layout = read('src/app/layout.tsx');
const ads = read('src/components/ads/AdSenseAutoAds.tsx');
const config = read('next.config.ts');
const sitemap = read('src/app/sitemap.ts');
for (const route of ['/seo-quality','/seo-release-checklist','/seo-production-signals','/seo-optimization-decisions','/seo-evidence-ledger','/seo-change-control']) {
  assert.ok(!pages.includes(`slug: '${route}'`), `${route} must not be canonical or in sitemap.`);
  const source = read(`src/app${route}/page.tsx`);
  assert.ok(source.includes('internalSeoEnabled') && source.includes('notFound()'), `${route} must be unavailable unless the internal feature flag is explicitly enabled.`);
}
for (const route of ['/canonical-map.json','/change-control.json','/content-drift.json','/content-inventory.json','/csp-readiness.json','/evidence-ledger.json','/optimization-decisions.json','/production-signals.json','/quality-gates.json','/release-checklist.json','/seo-status.json','/site-index.json']) {
  const source = read(`src/app${route}/route.ts`);
  assert.ok(source.includes('internalSeoUnavailable'), `${route} must return a non-public response by default.`);
}
const internalAccess = read('src/lib/internalSeoAccess.ts');
assert.ok(internalAccess.includes("ENABLE_INTERNAL_SEO_ENDPOINTS === '1'") && internalAccess.includes('status: 410'), 'Internal SEO routes must default to 410 and require an explicit environment flag.');
assert.ok(shell.indexOf("page.kind === 'sheet'") < shell.indexOf('print-title'), 'Tool must render before descriptive title.');
assert.ok(!shell.includes('<AdSlot') && !shell.includes('<AffiliateSlot') && !shell.includes('<PageSupportSections'), 'Page shell must not include empty monetization/filler slots.');
assert.ok(ads.includes('isAdsenseAllowedRoute'), 'AdSense must use explicit allowlist.');
assert.ok(!layout.includes('Quality gates') && !layout.includes('Production signals'), 'Public footer must not expose internal governance pages.');
assert.ok(config.includes('X-Robots-Tag') && config.includes('internalMachineRoutes'), 'Internal pages and endpoints require noindex headers.');
assert.ok(!read('src/app/humans.txt/route.ts').includes('site-index.json'), 'Public humans.txt must not advertise internal governance endpoints.');
assert.ok(sitemap.includes('canonicalPages'), 'Sitemap should be generated from public canonical pages.');
console.log('StockCut validation passed: public tools retained, tool-first rendering, internal SEO governance isolated, sitemap and advertising policies enforced.');
