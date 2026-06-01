import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');

const requiredCanonicalRoutes = [
  'src/app/page.tsx',
  'src/app/sheet-cutting-optimizer/page.tsx',
  'src/app/linear-cutting-optimizer/page.tsx',
  'src/app/saw-kerf-calculator/page.tsx',
  'src/app/plywood-cutting-layout-calculator/page.tsx',
  'src/app/4x8-plywood-cut-list-optimizer/page.tsx',
  'src/app/mdf-sheet-cut-calculator/page.tsx',
  'src/app/acrylic-sheet-cutting-layout-tool/page.tsx',
  'src/app/melamine-cut-list-optimizer/page.tsx',
  'src/app/cabinet-cut-list-optimizer/page.tsx',
  'src/app/bookshelf-cut-list-calculator/page.tsx',
  'src/app/drawer-box-cut-list-calculator/page.tsx',
  'src/app/closet-shelf-plywood-calculator/page.tsx',
  'src/app/workbench-plywood-cut-layout/page.tsx',
  'src/app/linear-bar-cutting-list-optimizer/page.tsx',
  'src/app/steel-tube-cutting-optimizer/page.tsx',
  'src/app/aluminum-extrusion-cut-list-optimizer/page.tsx',
  'src/app/pvc-pipe-cutting-optimizer/page.tsx',
  'src/app/lumber-length-cutting-optimizer/page.tsx',
  'src/app/how-to-account-for-saw-kerf/page.tsx',
  'src/app/guillotine-cut-vs-nesting/page.tsx',
  'src/app/cut-list-optimizer-vs-excel/page.tsx',
  'src/app/how-to-read-a-plywood-cutting-diagram/page.tsx',
  'src/app/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/disclaimer/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx'
];
for (const file of requiredCanonicalRoutes) assert.ok(fs.existsSync(file), `${file} exists`);

const pagesData = read('src/data/pages.ts');
assert.ok(pagesData.includes('export const canonicalPages'), 'canonicalPages export exists');
assert.ok(pagesData.includes('export const redirectAliases'), 'redirectAliases export exists');
assert.ok(pagesData.includes('export const pages: SeoPage[] = canonicalPages'), 'backward-compatible pages alias is canonical-only');
assert.ok(pagesData.includes('export const canonicalSlugs'), 'canonicalSlugs export exists');

for (const slug of [
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/4x8-plywood-cut-list-optimizer',
  '/plywood-cutting-layout-calculator',
  '/pvc-pipe-cutting-optimizer',
  '/steel-tube-cutting-optimizer',
  '/how-to-account-for-saw-kerf',
  '/privacy'
]) {
  assert.ok(pagesData.includes(`slug: '${slug}'`), `${slug} is a canonical page`);
}

for (const source of [
  '/tools/sheet-cutting-optimizer',
  '/calculators/4x8-plywood-cut-list-optimizer',
  '/guides/saw-kerf-explained',
  '/legal/privacy'
]) {
  assert.ok(pagesData.includes(`source: '${source}'`), `${source} is a redirect alias`);
  assert.ok(!pagesData.includes(`slug: '${source}'`), `${source} is not a canonical page slug`);
}

const sitemap = read('src/app/sitemap.ts');
assert.ok(sitemap.includes('canonicalPages'), 'sitemap reads canonicalPages');
assert.ok(!sitemap.includes('redirectAliases'), 'sitemap does not read redirectAliases');

const nextConfig = read('next.config.ts');
assert.ok(nextConfig.includes('redirectAliases'), 'next.config reads redirectAliases');
assert.ok(!nextConfig.includes('ignoreBuildErrors'), 'Next build errors are not ignored');

const robots = read('src/app/robots.ts');
assert.ok(robots.includes('sitemap'), 'robots declares sitemap');

const vercel = JSON.parse(read('vercel.json'));
assert.equal(vercel.ignoreCommand, 'node scripts/skip-old-vercel-builds.mjs');
const guard = read('scripts/skip-old-vercel-builds.mjs');
for (const env of ['VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_REPO_OWNER','VERCEL_GIT_REPO_SLUG']) assert.ok(guard.includes(env), `${env} used in build guard`);

const rootPage = read('src/app/page.tsx');
assert.ok(rootPage.includes('WebApplication'), 'home page WebApplication JSON-LD exists');
assert.ok(rootPage.includes('BreadcrumbList'), 'home page BreadcrumbList JSON-LD exists');
assert.ok(!rootPage.includes('FAQPage'), 'home page FAQPage JSON-LD is not used as a growth lever');

const pageShell = read('src/components/page/PageShell.tsx');
assert.ok(pageShell.includes('const guide = guideContentBySlug[page.slug]'), 'guide content lookup is defined inside GuideContent');
assert.ok(pageShell.includes('WebApplication') && pageShell.includes('BreadcrumbList'), 'tool page WebApplication and BreadcrumbList JSON-LD exist');
assert.ok(!pageShell.includes('FAQPage'), 'generic tool pages do not emit FAQPage JSON-LD');
assert.ok(pageShell.includes('PageSupportSections'), 'PageShell support sections are split into a separate component');

const homeWorkspace = read('src/components/home/StockCutHomeWorkspace.tsx');
assert.ok(homeWorkspace.includes('HomeSupportSections'), 'home support sections are split out of the large home workspace');
assert.ok(homeWorkspace.includes("import('@/core/import/parseWorkbook')"), 'workbook parser is lazy-loaded');
assert.ok(homeWorkspace.includes("import('@/core/export/exportCsv')"), 'CSV export is lazy-loaded');
assert.ok(homeWorkspace.includes("import('@/core/export/exportPdf')"), 'PDF export is lazy-loaded');
assert.ok(homeWorkspace.includes("import('@/core/export/exportDxf')"), 'DXF export is lazy-loaded');

const longTailAudit = read('src/data/longTailAuditMatrix.ts');
for (const slug of [
  '/4x8-plywood-cut-list-optimizer',
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/pvc-pipe-cutting-optimizer',
  '/steel-tube-cutting-optimizer'
]) {
  assert.ok(longTailAudit.includes(`slug: '${slug}'`), `${slug} has priority long-tail audit coverage`);
}
assert.ok(read('docs/LONG_TAIL_PRESET_AUDIT.md').includes('/4x8-plywood-cut-list-optimizer'), 'long-tail audit document exists');
assert.ok(read('docs/SEARCH_CONSOLE_REVIEW_PLAN.md').includes('Week 4'), 'GSC review plan exists');

const css = read('src/app/globals.css');
assert.ok(css.includes('@media print'), 'print CSS exists');
assert.ok(css.includes('@media (max-width: 640px)'), 'mobile CSS exists');
assert.ok(read('src/components/common/AdSlot.tsx').includes('Advertisement'), 'ad placeholder exists');
assert.ok(read('src/core/storage/projectStorage.ts').includes('localStorage'), 'localStorage handling exists');

const sheetTool = read('src/components/tools/SheetOptimizerTool.tsx');
assert.ok(sheetTool.includes('Basic cut sequence'), '2D basic cut sequence exists');
assert.ok(sheetTool.includes('Paste preview'), 'sheet paste preview confirmation exists');
assert.ok(sheetTool.includes('Additional stock sheets / reusable offcuts'), 'sheet multiple stock/offcut UI exists');
assert.ok(sheetTool.includes('Edge banding T/R/B/L'), 'sheet edge banding UI exists');
assert.ok(sheetTool.includes('Estimated stock cost'), 'sheet cost estimate UI exists');
assert.ok(sheetTool.includes('Strategy'), 'sheet strategy toggle exists');
assert.ok(sheetTool.includes('Import CSV file'), 'sheet CSV file import exists');
assert.ok(sheetTool.includes('Import JSON project'), 'sheet JSON project import exists');
assert.ok(sheetTool.includes('Import Excel .xlsx'), 'sheet Excel workbook import exists');
assert.ok(sheetTool.includes('Download PDF file'), 'sheet dedicated PDF export exists');
assert.ok(sheetTool.includes('Optimizing layout'), 'sheet progress UI exists');

const linearTool = read('src/components/tools/LinearOptimizerTool.tsx');
assert.ok(linearTool.includes('Paste preview'), 'linear paste preview confirmation exists');
assert.ok(linearTool.includes('Additional stock lengths / reusable offcuts'), 'linear multiple stock/offcut UI exists');
assert.ok(linearTool.includes('Estimated stock cost'), 'linear cost estimate UI exists');
assert.ok(linearTool.includes('Strategy'), 'linear strategy toggle exists');
assert.ok(linearTool.includes('Import CSV file'), 'linear CSV file import exists');
assert.ok(linearTool.includes('Import JSON project'), 'linear JSON project import exists');
assert.ok(linearTool.includes('Import Excel .xlsx'), 'linear Excel workbook import exists');
assert.ok(linearTool.includes('Download PDF file'), 'linear dedicated PDF export exists');
assert.ok(linearTool.includes('Optimizing layout'), 'linear progress UI exists');
assert.ok(linearTool.includes('Repeated cutting patterns'), 'identical cutting pattern summary exists');

assert.ok(read('src/components/layout-viewer/SheetLayoutSvg.tsx').includes('Zoom in'), 'sheet zoom controls exist');
assert.ok(read('src/components/layout-viewer/SheetLayoutSvg.tsx').includes('Download SVG'), 'SVG export exists');
assert.ok(fs.existsSync('src/core/import/parseWorkbook.ts'), 'Excel workbook parser exists');
assert.ok(fs.existsSync('src/core/export/exportPdf.ts'), 'dedicated PDF generator exists');
assert.ok(fs.existsSync('src/core/export/exportDxf.ts'), 'lightweight DXF export exists');
assert.ok(fs.existsSync('src/core/worker/optimizerWorkerClient.ts'), 'responsive progress/cancel client exists');

const affiliate = read('src/components/common/AffiliateSlot.tsx');
assert.ok(!/placeholder|future affiliate/i.test(affiliate), 'affiliate placeholder wording removed for AdSense review');
const adsTxt = read('public/ads.txt').trim();
assert.equal(adsTxt, 'google.com, pub-1653188471819736, DIRECT, f08c47fec0942fa0', 'ads.txt contains Google publisher record');
const rootLayout = read('src/app/layout.tsx');
assert.equal((rootLayout.match(/google-adsense-account/g) || []).length, 1, 'AdSense meta appears once');
assert.ok(rootLayout.includes('ca-pub-1653188471819736'), 'AdSense publisher id exists');
assert.ok(rootLayout.includes('<AdSenseAutoAds />'), 'AdSense Auto Ads route gate is mounted');
assert.equal((rootLayout.match(/pagead2\.googlesyndication\.com/g) || []).length, 0, 'AdSense script is not globally loaded in root layout');
assert.equal((rootLayout.match(/adsbygoogle\.js/g) || []).length, 0, 'adsbygoogle script is not globally loaded in root layout');
const adsenseGate = read('src/components/ads/AdSenseAutoAds.tsx');
assert.ok(adsenseGate.includes('usePathname'), 'AdSense gate is route-aware');
assert.equal((adsenseGate.match(/pagead2\.googlesyndication\.com/g) || []).length, 1, 'AdSense Auto Ads script appears once in route gate');
assert.equal((adsenseGate.match(/adsbygoogle\.js/g) || []).length, 1, 'AdSense adsbygoogle script appears once in route gate');
for (const deniedPath of ['/about', '/privacy', '/terms', '/disclaimer', '/contact', '/404', '/_not-found']) {
  assert.ok(adsenseGate.includes(`'${deniedPath}'`), `AdSense gate denies ${deniedPath}`);
}

assert.ok(read('src/components/common/ShopModeToggle.tsx').includes('Shop mode'), 'shop mode toggle exists');
assert.ok(read('src/core/analytics/trackEvent.ts').includes('no_cut_list_dimensions_recorded'), 'privacy-safe event tracking exists');
assert.ok(read('src/core/storage/shareProject.ts').includes('#stockcut='), 'hash-only share link exists');
assert.ok(sheetTool.includes('Copy share link'), 'sheet share link button exists');
assert.ok(linearTool.includes('Copy share link'), 'linear share link button exists');

const sheetOptimizer = read('src/core/sheet-optimizer/guillotine.ts');
assert.ok(sheetOptimizer.includes('multi-stock aware'), 'sheet optimizer is multi-stock aware');
assert.ok(sheetOptimizer.includes('estimatedStockCost'), 'sheet optimizer returns estimated stock cost');
assert.ok(sheetOptimizer.includes('strategy:'), 'sheet optimizer reports strategy');
const linearOptimizer = read('src/core/linear-optimizer/bestFitDecreasing.ts');
assert.ok(linearOptimizer.includes('multi-stock aware'), 'linear optimizer is multi-stock aware');
assert.ok(linearOptimizer.includes('estimatedStockCost'), 'linear optimizer returns estimated stock cost');
assert.ok(linearOptimizer.includes('strategy:'), 'linear optimizer reports strategy');

console.log('Static validation passed.');
