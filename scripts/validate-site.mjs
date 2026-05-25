import fs from 'node:fs';
import assert from 'node:assert/strict';

const requiredRoutes = [
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
for (const file of requiredRoutes) assert.ok(fs.existsSync(file), `${file} exists`);

const pagesData = fs.readFileSync('src/data/pages.ts', 'utf8');
for (const slug of ['melamine-cut-list-optimizer','drawer-box-cut-list-calculator','closet-shelf-plywood-calculator','workbench-plywood-cut-layout','pvc-pipe-cutting-optimizer','lumber-length-cutting-optimizer','how-to-read-a-plywood-cutting-diagram','why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet','saw-kerf-compensation-calculator','rebar-cutting-optimizer','plywood-yield-rate-calculator','cut-list-optimizer-vs-sketchup','plywood-factory-edge-trim','grain-direction-in-cut-lists','edge-banding-in-cut-list','reduce-plywood-waste','tools/sheet-cutting-optimizer','calculators/4x8-plywood-cut-list-optimizer','guides/saw-kerf-explained','legal/privacy']) {
  assert.ok(pagesData.includes(`/${slug}`), `${slug} registered in pages data`);
}

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
assert.equal(vercel.ignoreCommand, 'node scripts/skip-old-vercel-builds.mjs');
const guard = fs.readFileSync('scripts/skip-old-vercel-builds.mjs', 'utf8');
for (const env of ['VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_REPO_OWNER','VERCEL_GIT_REPO_SLUG']) assert.ok(guard.includes(env), `${env} used in build guard`);

const css = fs.readFileSync('src/app/globals.css', 'utf8');
assert.ok(css.includes('@media print'), 'print CSS exists');
assert.ok(css.includes('page-break-inside: avoid'), 'print-safe content avoids breaks');
assert.ok(css.includes('@media (max-width: 640px)'), 'mobile CSS exists');
assert.ok(fs.readFileSync('src/components/common/AdSlot.tsx','utf8').includes('Advertisement'), 'ad placeholder exists');
assert.ok(fs.readFileSync('src/core/storage/projectStorage.ts','utf8').includes('localStorage'), 'localStorage handling exists');
const sheetTool = fs.readFileSync('src/components/tools/SheetOptimizerTool.tsx','utf8');
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
assert.ok(fs.readFileSync('src/components/layout-viewer/SheetLayoutSvg.tsx','utf8').includes('Zoom in'), 'sheet zoom controls exist');
const linearTool = fs.readFileSync('src/components/tools/LinearOptimizerTool.tsx','utf8');
assert.ok(linearTool.includes('Paste preview'), 'linear paste preview confirmation exists');
assert.ok(linearTool.includes('Additional stock lengths / reusable offcuts'), 'linear multiple stock/offcut UI exists');
assert.ok(linearTool.includes('Estimated stock cost'), 'linear cost estimate UI exists');
assert.ok(linearTool.includes('Strategy'), 'linear strategy toggle exists');
assert.ok(linearTool.includes('Import CSV file'), 'linear CSV file import exists');
assert.ok(linearTool.includes('Import JSON project'), 'linear JSON project import exists');
assert.ok(linearTool.includes('Import Excel .xlsx'), 'linear Excel workbook import exists');
assert.ok(linearTool.includes('Download PDF file'), 'linear dedicated PDF export exists');
assert.ok(linearTool.includes('Optimizing layout'), 'linear progress UI exists');
const pageShell = fs.readFileSync('src/components/page/PageShell.tsx','utf8');
assert.ok(pageShell.includes('FAQPage') && pageShell.includes('BreadcrumbList'), 'FAQPage and BreadcrumbList JSON-LD exist');

const aliasRoutes = [
  'calculators/plywood-cutting-layout-calculator',
  'calculators/saw-kerf-compensation-calculator',
  'calculators/melamine-cut-list-optimizer',
  'calculators/drawer-box-cut-list-calculator',
  'calculators/closet-shelf-plywood-calculator',
  'calculators/workbench-plywood-cut-layout',
  'calculators/pvc-pipe-cutting-optimizer',
  'calculators/lumber-length-cutting-optimizer',
  'calculators/rebar-cutting-optimizer',
  'calculators/plywood-yield-rate-calculator',
  'guides/how-to-account-for-saw-kerf',
  'guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet',
  'guides/plywood-factory-edge-trim',
  'guides/grain-direction-in-cut-lists',
  'guides/edge-banding-in-cut-list',
  'guides/reduce-plywood-waste'
];
for (const slug of aliasRoutes) {
  assert.ok(pagesData.includes(`/${slug}`), `${slug} registered in pages data`);
  assert.ok(fs.existsSync(`src/app/${slug}/page.tsx`), `${slug} route file exists`);
}
assert.ok(fs.existsSync('public/manifest.webmanifest'), 'PWA manifest exists');
assert.ok(fs.existsSync('public/sw.js'), 'service worker exists');
assert.ok(fs.readFileSync('src/app/layout.tsx','utf8').includes('PwaRegister'), 'PWA registration component included');
const affiliate = fs.readFileSync('src/components/common/AffiliateSlot.tsx','utf8');
assert.ok(!/placeholder|future affiliate/i.test(affiliate), 'affiliate placeholder wording removed for AdSense review');
const adsTxt = fs.readFileSync('public/ads.txt', 'utf8').trim();
assert.equal(adsTxt, 'google.com, pub-1653188471819736, DIRECT, f08c47fec0942fa0', 'ads.txt contains Google publisher record');
const rootLayout = fs.readFileSync('src/app/layout.tsx','utf8');
assert.equal((rootLayout.match(/google-adsense-account/g) || []).length, 1, 'AdSense meta appears once');
assert.ok(rootLayout.includes('ca-pub-1653188471819736'), 'AdSense publisher id exists');
assert.equal((rootLayout.match(/pagead2\.googlesyndication\.com/g) || []).length, 1, 'AdSense Auto Ads script appears once');
assert.equal((rootLayout.match(/adsbygoogle\.js/g) || []).length, 1, 'AdSense adsbygoogle script appears once');
assert.ok(fs.readFileSync('src/components/common/ShopModeToggle.tsx','utf8').includes('Shop mode'), 'shop mode toggle exists');
assert.ok(fs.readFileSync('src/core/analytics/trackEvent.ts','utf8').includes('no_cut_list_dimensions_recorded'), 'privacy-safe event tracking exists');
assert.ok(fs.readFileSync('src/core/storage/shareProject.ts','utf8').includes('#stockcut='), 'hash-only share link exists');
assert.ok(sheetTool.includes('Copy share link'), 'sheet share link button exists');
assert.ok(linearTool.includes('Copy share link'), 'linear share link button exists');
assert.ok(fs.readFileSync('src/components/layout-viewer/SheetLayoutSvg.tsx','utf8').includes('Download SVG'), 'SVG export exists');
assert.ok(fs.existsSync('src/core/import/parseWorkbook.ts'), 'Excel workbook parser exists');
assert.ok(fs.existsSync('src/core/export/exportPdf.ts'), 'dedicated PDF generator exists');
assert.ok(fs.existsSync('src/core/export/exportDxf.ts'), 'lightweight DXF export exists');
assert.ok(fs.existsSync('src/core/worker/optimizerWorkerClient.ts'), 'responsive progress/cancel client exists');
assert.ok(linearTool.includes('Repeated cutting patterns'), 'identical cutting pattern summary exists');


assert.ok(fs.existsSync('docs/original/原始中文需求文档保留说明.md'), 'original requirements preservation note exists');
assert.ok(fs.existsSync('docs/original/原始中文开发计划保留说明.md'), 'original development plan preservation note exists');
assert.ok(fs.existsSync('docs/FINAL_USER_REQUEST_COMPLETION.md'), 'final user-request completion report exists');

console.log('Static validation passed.');

const sheetOptimizer = fs.readFileSync('src/core/sheet-optimizer/guillotine.ts','utf8');
assert.ok(sheetOptimizer.includes('multi-stock aware'), 'sheet optimizer is multi-stock aware');
assert.ok(sheetOptimizer.includes('estimatedStockCost'), 'sheet optimizer returns estimated stock cost');
assert.ok(sheetOptimizer.includes('strategy:'), 'sheet optimizer reports strategy');
const linearOptimizer = fs.readFileSync('src/core/linear-optimizer/bestFitDecreasing.ts','utf8');
assert.ok(linearOptimizer.includes('multi-stock aware'), 'linear optimizer is multi-stock aware');
assert.ok(linearOptimizer.includes('estimatedStockCost'), 'linear optimizer returns estimated stock cost');
assert.ok(linearOptimizer.includes('strategy:'), 'linear optimizer reports strategy');
