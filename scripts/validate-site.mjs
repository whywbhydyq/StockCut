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
  'src/app/contact/page.tsx',
  'src/app/site-map/page.tsx',
  'src/app/seo-quality/page.tsx',
  'src/app/seo-evidence-ledger/page.tsx'
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
  '/privacy',
  '/site-map',
  '/seo-quality'
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
assert.ok(rootPage.includes('PageEvidencePanel'), 'home page evidence panel is mounted');
assert.ok(rootPage.includes('evidenceJsonLd'), 'home page evidence JSON-LD exists');
assert.ok(rootPage.includes('intentClusterJsonLd'), 'home page intent cluster JSON-LD exists');
assert.ok(rootPage.includes('#priority-pages'), 'home page priority ItemList JSON-LD exists');
assert.ok(rootPage.includes('BreadcrumbList'), 'home page BreadcrumbList JSON-LD exists');
assert.ok(!rootPage.includes('FAQPage'), 'home page FAQPage JSON-LD is not used as a growth lever');

const pageShell = read('src/components/page/PageShell.tsx');
assert.ok(pageShell.includes('const guide = guideContentBySlug[page.slug]'), 'guide content lookup is defined inside GuideContent');
assert.ok(pageShell.includes('WebApplication') && pageShell.includes('BreadcrumbList'), 'tool page WebApplication and BreadcrumbList JSON-LD exist');
assert.ok(pageShell.includes('IntentNavigation'), 'contextual intent navigation is mounted');
assert.ok(pageShell.includes('PageEvidencePanel'), 'page evidence panel is mounted');
assert.ok(pageShell.includes('evidenceJsonLd'), 'page evidence JSON-LD is emitted');
assert.ok(pageShell.includes('relatedLink'), 'tool pages expose related canonical links in JSON-LD');
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
assert.ok(fs.existsSync('src/data/seoIntentClusters.ts'), 'SEO intent cluster data exists');
assert.ok(fs.existsSync('src/app/site-index.json/route.ts'), 'machine-readable site index route exists');
assert.ok(fs.existsSync('src/app/content-inventory.json/route.ts'), 'machine-readable content inventory route exists');
assert.ok(fs.existsSync('src/app/site-map/page.tsx'), 'human-readable site map route exists');
assert.ok(fs.existsSync('src/data/pageEvidence.ts'), 'page evidence governance data exists');
assert.ok(fs.existsSync('src/components/page/PageEvidencePanel.tsx'), 'page evidence panel exists');
assert.ok(read('src/app/llms.txt/route.ts').includes('/site-index.json'), 'llms.txt links machine-readable site index');
assert.ok(read('src/app/llms.txt/route.ts').includes('/content-inventory.json'), 'llms.txt links content inventory');
assert.ok(read('src/app/llms.txt/route.ts').includes('/site-map'), 'llms.txt links human-readable site map');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Intent clusters'), 'llms-full describes intent clusters');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Citation guidance'), 'llms-full includes citation guidance');
const siteMapPage = read('src/app/site-map/page.tsx');
assert.ok(siteMapPage.includes('Machine-readable indexes'), 'site map lists machine-readable indexes');
assert.ok(siteMapPage.includes('Legacy redirected paths'), 'site map lists legacy redirected paths');
assert.ok(siteMapPage.includes('content-inventory.json'), 'site map links content inventory');
const contentInventory = read('src/app/content-inventory.json/route.ts');
assert.ok(contentInventory.includes('evidenceForPage'), 'content inventory includes page evidence');
assert.ok(contentInventory.includes('relatedPagesFor'), 'content inventory includes related canonical pages');
assert.ok(contentInventory.includes('schemaTypes'), 'content inventory includes schema type coverage');
const siteIndex = read('src/app/site-index.json/route.ts');
assert.ok(siteIndex.includes('contentInventory'), 'site-index exposes content inventory URL');
assert.ok(siteIndex.includes('humanReadableSiteMap'), 'site-index exposes human-readable site map URL');
assert.ok(siteIndex.includes('citationSummary'), 'site-index includes citation summaries');
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


assert.ok(fs.existsSync('src/data/seoGovernance.ts'), 'SEO governance data exists');
assert.ok(fs.existsSync('src/app/feed.xml/route.ts'), 'RSS feed route exists');
assert.ok(fs.existsSync('src/app/seo-status.json/route.ts'), 'SEO status route exists');
assert.ok(fs.existsSync('src/app/humans.txt/route.ts'), 'humans.txt route exists');
assert.ok(fs.existsSync('src/app/.well-known/security.txt/route.ts'), 'security.txt route exists');
const seoGovernance = read('src/data/seoGovernance.ts');
for (const endpoint of ['/feed.xml', '/seo-status.json', '/humans.txt', '/.well-known/security.txt']) {
  assert.ok(seoGovernance.includes(endpoint), `${endpoint} is listed in SEO governance data`);
}
for (const header of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Content-Security-Policy-Report-Only']) {
  assert.ok(seoGovernance.includes(header), `${header} is declared in SEO governance expected headers`);
}
const feedRoute = read('src/app/feed.xml/route.ts');
assert.ok(feedRoute.includes('application/rss+xml'), 'RSS feed returns application/rss+xml');
assert.ok(feedRoute.includes('canonicalPages'), 'RSS feed is sourced from canonical pages');
assert.ok(!feedRoute.includes('redirectAliases'), 'RSS feed does not include alias redirects');
const seoStatusRoute = read('src/app/seo-status.json/route.ts');
assert.ok(seoStatusRoute.includes('expectedSecurityHeaders'), 'SEO status exposes expected security headers');
assert.ok(seoStatusRoute.includes('crawlTargets'), 'SEO status exposes crawl targets');
assert.ok(seoStatusRoute.includes('skippedByPolicy'), 'SEO status documents skipped local checks');
assert.ok(read('src/app/humans.txt/route.ts').includes('Machine-readable indexes'), 'humans.txt lists machine-readable indexes');
assert.ok(read('src/app/.well-known/security.txt/route.ts').includes('Canonical:'), 'security.txt declares canonical URL');
assert.ok(read('src/app/robots.ts').includes('publicCrawlerAgents'), 'robots uses shared public crawler list');
assert.ok(read('src/app/robots.ts').includes('host'), 'robots declares host');
assert.ok(read('src/app/layout.tsx').includes('application/rss+xml'), 'root layout advertises RSS feed');
assert.ok(read('src/app/layout.tsx').includes('/seo-status.json'), 'footer links SEO status JSON');
assert.ok(read('src/app/site-map/page.tsx').includes('Production verification checklist'), 'site map includes production verification checklist');
assert.ok(read('src/app/site-index.json/route.ts').includes('seoStatus'), 'site-index exposes SEO status');
assert.ok(read('src/app/site-index.json/route.ts').includes('updateFeed'), 'site-index exposes RSS feed');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('governanceEndpoints'), 'content inventory exposes governance endpoints');
assert.ok(read('src/app/llms.txt/route.ts').includes('/seo-status.json'), 'llms.txt links SEO status');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Production verification'), 'llms-full includes production verification section');


assert.ok(fs.existsSync('src/data/seoQualityGates.ts'), 'SEO quality gate data exists');
assert.ok(fs.existsSync('src/app/quality-gates.json/route.ts'), 'SEO quality gates JSON route exists');
assert.ok(fs.existsSync('src/app/canonical-map.json/route.ts'), 'canonical map JSON route exists');
assert.ok(fs.existsSync('src/app/seo-quality/page.tsx'), 'human-readable SEO quality page exists');
const seoQualityGates = read('src/data/seoQualityGates.ts');
for (const gateArea of ['indexability', 'redirects', 'structured-data', 'content-evidence', 'machine-readability', 'security', 'performance', 'ads-policy']) {
  assert.ok(seoQualityGates.includes(gateArea), `${gateArea} quality gate area exists`);
}
assert.ok(seoQualityGates.includes('manualProductionChecks'), 'manual production checks are declared');
assert.ok(seoQualityGates.includes('canonicalAliasMap'), 'canonical alias map helper exists');
assert.ok(seoQualityGates.includes('pageQualityRecord'), 'page quality record helper exists');
const qualityGatesRoute = read('src/app/quality-gates.json/route.ts');
assert.ok(qualityGatesRoute.includes('seoQualityGateGroups'), 'quality-gates route exposes gate groups');
assert.ok(qualityGatesRoute.includes('canonicalAliasMap'), 'quality-gates route exposes canonical alias map');
assert.ok(qualityGatesRoute.includes('pageCoverage'), 'quality-gates route exposes page coverage');
const canonicalMapRoute = read('src/app/canonical-map.json/route.ts');
assert.ok(canonicalMapRoute.includes('canonicalPolicy'), 'canonical-map route exposes canonical policy');
assert.ok(canonicalMapRoute.includes('aliasRedirects'), 'canonical-map route exposes alias redirects');
assert.ok(canonicalMapRoute.includes('expectedStatus: 308'), 'canonical-map route documents permanent redirect status');
assert.ok(read('src/data/seoGovernance.ts').includes('/quality-gates.json'), 'SEO governance lists quality-gates endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/canonical-map.json'), 'SEO governance lists canonical-map endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-quality'), 'SEO governance lists SEO quality page in crawl targets');
assert.ok(read('src/app/seo-status.json/route.ts').includes('qualityGateSummary'), 'SEO status exposes quality gate summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('qualityGates'), 'site-index exposes quality gates URL');
assert.ok(read('src/app/site-index.json/route.ts').includes('canonicalMap'), 'site-index exposes canonical map URL');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('qualityGateCoverage'), 'content inventory exposes page quality gate coverage');
assert.ok(read('src/app/site-map/page.tsx').includes('SEO quality gates'), 'site map includes SEO quality gates section');
assert.ok(read('src/app/llms.txt/route.ts').includes('/quality-gates.json'), 'llms.txt links quality gates');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Quality gates and canonical governance'), 'llms-full includes quality gate section');
assert.ok(read('src/app/layout.tsx').includes('/seo-quality'), 'footer links SEO quality page');

assert.ok(fs.existsSync('src/data/seoReleaseChecks.ts'), 'SEO release check data exists');
assert.ok(fs.existsSync('src/app/release-checklist.json/route.ts'), 'release checklist JSON route exists');
assert.ok(fs.existsSync('src/app/content-drift.json/route.ts'), 'content drift JSON route exists');
assert.ok(fs.existsSync('src/app/seo-release-checklist/page.tsx'), 'human-readable release checklist page exists');
assert.ok(fs.existsSync('scripts/check-production-seo.mjs'), 'production SEO check script exists');
const seoReleaseChecks = read('src/data/seoReleaseChecks.ts');
for (const checkGroup of ['endpoints', 'canonical-html', 'redirects', 'structured-data', 'headers', 'assets', 'performance', 'search-console']) {
  assert.ok(seoReleaseChecks.includes(checkGroup), `${checkGroup} release check group exists`);
}
assert.ok(seoReleaseChecks.includes('contentDriftFingerprints'), 'content drift fingerprint helper exists');
assert.ok(seoReleaseChecks.includes('productionEndpointChecks'), 'production endpoint check helper exists');
assert.ok(seoReleaseChecks.includes('canonicalHtmlChecks'), 'canonical HTML check helper exists');
const releaseChecklistRoute = read('src/app/release-checklist.json/route.ts');
assert.ok(releaseChecklistRoute.includes('releaseCheckGroups'), 'release checklist exposes check groups');
assert.ok(releaseChecklistRoute.includes('productionEndpointChecks'), 'release checklist exposes endpoint checks');
assert.ok(releaseChecklistRoute.includes('redirectCheckSamples'), 'release checklist exposes redirect samples');
const contentDriftRoute = read('src/app/content-drift.json/route.ts');
assert.ok(contentDriftRoute.includes('contentDriftFingerprints'), 'content drift route exposes fingerprints');
assert.ok(contentDriftRoute.includes('driftPolicy'), 'content drift route exposes drift policy');
assert.ok(read('src/data/seoGovernance.ts').includes('/release-checklist.json'), 'SEO governance lists release checklist endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/content-drift.json'), 'SEO governance lists content drift endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-release-checklist'), 'SEO governance lists release checklist page in crawl targets');
assert.ok(read('src/data/pages.ts').includes('/seo-release-checklist'), 'canonical pages include release checklist page');
assert.ok(read('src/app/seo-status.json/route.ts').includes('releaseCheckSummary'), 'SEO status exposes release check summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('contentDrift'), 'site-index exposes content drift URL');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('contentDriftFingerprints'), 'content inventory exposes drift fingerprints');
assert.ok(read('src/app/site-map/page.tsx').includes('/release-checklist.json'), 'site map links release checklist JSON');
assert.ok(read('src/app/seo-quality/page.tsx').includes('/content-drift.json'), 'SEO quality page references content drift');
assert.ok(read('src/app/llms.txt/route.ts').includes('/release-checklist.json'), 'llms.txt links release checklist');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('content-drift.json'), 'llms-full links content drift');
assert.ok(read('src/app/layout.tsx').includes('/seo-release-checklist'), 'footer links release checklist page');


assert.ok(fs.existsSync('src/data/seoProductionSignals.ts'), 'SEO production signal data exists');
assert.ok(fs.existsSync('src/app/production-signals.json/route.ts'), 'production signals JSON route exists');
assert.ok(fs.existsSync('src/app/seo-production-signals/page.tsx'), 'human-readable production signals page exists');
assert.ok(fs.existsSync('scripts/analyze-production-signals.mjs'), 'production signal analysis script exists');
const seoProductionSignals = read('src/data/seoProductionSignals.ts');
for (const signalSource of ['google-search-console', 'pagespeed-insights', 'rich-results-test', 'bing-webmaster-tools', 'production-crawl', 'csp-report-only']) {
  assert.ok(seoProductionSignals.includes(signalSource), `${signalSource} production signal source exists`);
}
for (const exportedName of ['productionSignalSources', 'productionSignalInputFormats', 'productionSignalKpis', 'searchIntentBuckets', 'productionSignalDecisionRules', 'productionSignalPageTargets', 'productionSignalSummary']) {
  assert.ok(seoProductionSignals.includes(exportedName), `${exportedName} is declared`);
}
const productionSignalsRoute = read('src/app/production-signals.json/route.ts');
assert.ok(productionSignalsRoute.includes('productionSignalSummary'), 'production-signals route exposes summary');
assert.ok(productionSignalsRoute.includes('productionSignalSources'), 'production-signals route exposes signal sources');
assert.ok(productionSignalsRoute.includes('productionSignalPageTargets'), 'production-signals route exposes page targets');
assert.ok(productionSignalsRoute.includes('analyze-production-signals.mjs'), 'production-signals route documents local analysis script');
const productionSignalsPage = read('src/app/seo-production-signals/page.tsx');
assert.ok(productionSignalsPage.includes('StockCut Production SEO Signals'), 'production signals page has expected title');
assert.ok(productionSignalsPage.includes('/production-signals.json'), 'production signals page links JSON endpoint');
assert.ok(productionSignalsPage.includes('Local analysis script'), 'production signals page documents local analysis script');
assert.ok(read('src/data/seoGovernance.ts').includes('/production-signals.json'), 'SEO governance lists production signals endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-production-signals'), 'SEO governance lists production signals page in crawl targets');
assert.ok(read('src/data/pages.ts').includes('/seo-production-signals'), 'canonical pages include production signals page');
assert.ok(read('src/data/seoReleaseChecks.ts').includes('production-signals'), 'release checks include production signal group');
assert.ok(read('src/app/seo-status.json/route.ts').includes('productionSignalSummary'), 'SEO status exposes production signal summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('productionSignals'), 'site-index exposes production signals URL');
assert.ok(read('src/app/site-index.json/route.ts').includes('productionSignalSummary'), 'site-index exposes production signal summary');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('productionSignalTargets'), 'content inventory exposes production signal targets');
assert.ok(read('src/app/site-map/page.tsx').includes('/production-signals.json'), 'site map links production signals JSON');
assert.ok(read('src/app/llms.txt/route.ts').includes('/production-signals.json'), 'llms.txt links production signals');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Production signal summary'), 'llms-full includes production signal summary');
assert.ok(read('src/app/layout.tsx').includes('/seo-production-signals'), 'footer links production signals page');
assert.ok(read('scripts/analyze-production-signals.mjs').includes('Search Console'), 'production signal analysis script handles Search Console inputs');
assert.ok(read('scripts/analyze-production-signals.mjs').includes('PageSpeed'), 'production signal analysis script handles PageSpeed inputs');


assert.ok(fs.existsSync('src/data/seoOptimizationDecisions.ts'), 'SEO optimization decision data exists');
assert.ok(fs.existsSync('src/app/optimization-decisions.json/route.ts'), 'optimization decisions JSON route exists');
assert.ok(fs.existsSync('src/app/csp-readiness.json/route.ts'), 'CSP readiness JSON route exists');
assert.ok(fs.existsSync('src/app/seo-optimization-decisions/page.tsx'), 'human-readable optimization decisions page exists');
const seoOptimizationDecisions = read('src/data/seoOptimizationDecisions.ts');
for (const decisionGate of ['metadata-rewrite-requires-stable-query-evidence', 'internal-link-strengthening-before-page-sprawl', 'schema-fixes-before-schema-expansion', 'performance-work-requires-deployed-measurement', 'csp-enforcement-requires-clean-report-only-window', 'indexing-actions-require-url-inspection-context']) {
  assert.ok(seoOptimizationDecisions.includes(decisionGate), `${decisionGate} optimization decision gate exists`);
}
for (const actionName of ['rewrite-title-description', 'strengthen-internal-links', 'fix-schema-rendering', 'investigate-performance', 'keep-csp-report-only', 'enforce-csp']) {
  assert.ok(seoOptimizationDecisions.includes(actionName), `${actionName} optimization action policy exists`);
}
assert.ok(seoOptimizationDecisions.includes('cspReadinessChecks'), 'CSP readiness checks are declared');
assert.ok(seoOptimizationDecisions.includes('pageOptimizationDecisionRecords'), 'page optimization decision records helper exists');
assert.ok(read('src/app/optimization-decisions.json/route.ts').includes('optimizationDecisionGates'), 'optimization decisions route exposes decision gates');
assert.ok(read('src/app/optimization-decisions.json/route.ts').includes('pageOptimizationDecisionRecords'), 'optimization decisions route exposes page decision records');
assert.ok(read('src/app/csp-readiness.json/route.ts').includes('cspReadinessChecks'), 'CSP readiness route exposes readiness checks');
assert.ok(read('src/app/seo-optimization-decisions/page.tsx').includes('StockCut SEO Optimization Decisions'), 'optimization decisions page has expected title');
assert.ok(read('src/app/seo-optimization-decisions/page.tsx').includes('/optimization-decisions.json'), 'optimization decisions page links JSON endpoint');
assert.ok(read('src/app/seo-optimization-decisions/page.tsx').includes('/csp-readiness.json'), 'optimization decisions page links CSP readiness endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/optimization-decisions.json'), 'SEO governance lists optimization decisions endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/csp-readiness.json'), 'SEO governance lists CSP readiness endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-optimization-decisions'), 'SEO governance lists optimization decisions page in crawl targets');
assert.ok(read('src/data/pages.ts').includes('/seo-optimization-decisions'), 'canonical pages include optimization decisions page');
assert.ok(read('src/data/seoReleaseChecks.ts').includes('optimization-decisions'), 'release checks include optimization decision group');
assert.ok(read('src/app/seo-status.json/route.ts').includes('optimizationDecisionSummary'), 'SEO status exposes optimization decision summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('optimizationDecisionSummary'), 'site-index exposes optimization decision summary');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('optimizationDecisionTargets'), 'content inventory exposes optimization decision targets');
assert.ok(read('src/app/production-signals.json/route.ts').includes('optimizationDecisions'), 'production signals route links optimization decisions');
assert.ok(read('src/app/quality-gates.json/route.ts').includes('optimizationDecisionSummary'), 'quality gates route exposes optimization decision summary');
assert.ok(read('src/app/site-map/page.tsx').includes('/optimization-decisions.json'), 'site map links optimization decisions JSON');
assert.ok(read('src/app/llms.txt/route.ts').includes('/optimization-decisions.json'), 'llms.txt links optimization decisions');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Optimization decision summary'), 'llms-full includes optimization decision summary');
assert.ok(read('src/app/layout.tsx').includes('/seo-optimization-decisions'), 'footer links optimization decisions page');
const productionSignalScript = read('scripts/analyze-production-signals.mjs');
assert.ok(productionSignalScript.includes('cspReadiness'), 'production signal analysis script summarizes CSP readiness');
assert.ok(productionSignalScript.includes('optimizationActionCandidates'), 'production signal analysis script emits optimization action candidates');
assert.ok(productionSignalScript.includes('CSP report-only violation JSON'), 'production signal analysis script documents CSP input files');


assert.ok(fs.existsSync('src/data/seoEvidenceLedger.ts'), 'SEO evidence ledger data exists');
assert.ok(fs.existsSync('src/app/evidence-ledger.json/route.ts'), 'evidence ledger JSON route exists');
assert.ok(fs.existsSync('src/app/seo-evidence-ledger/page.tsx'), 'human-readable evidence ledger page exists');
assert.ok(fs.existsSync('scripts/verify-seo-signal-files.mjs'), 'SEO signal file verification script exists');
assert.ok(fs.existsSync('seo-signals/README.md'), 'SEO signal input README exists');
const seoEvidenceLedger = read('src/data/seoEvidenceLedger.ts');
for (const sourceId of ['gsc-query-export', 'gsc-page-export', 'pagespeed-mobile', 'pagespeed-desktop', 'rich-results', 'production-crawl', 'csp-report-only', 'bing-webmaster-tools']) {
  assert.ok(seoEvidenceLedger.includes(sourceId), `${sourceId} evidence source exists`);
}
for (const exportedName of ['evidenceFileSpecs', 'evidenceWorkflowSteps', 'pageEvidenceLedgerRecords', 'evidenceLedgerSummary']) {
  assert.ok(seoEvidenceLedger.includes(exportedName), `${exportedName} is declared`);
}
assert.ok(read('src/app/evidence-ledger.json/route.ts').includes('evidenceFileSpecs'), 'evidence ledger route exposes signal file specs');
assert.ok(read('src/app/evidence-ledger.json/route.ts').includes('pageEvidenceLedgerRecords'), 'evidence ledger route exposes page ledger records');
assert.ok(read('src/app/seo-evidence-ledger/page.tsx').includes('StockCut SEO Evidence Ledger'), 'evidence ledger page has expected title');
assert.ok(read('src/app/seo-evidence-ledger/page.tsx').includes('/evidence-ledger.json'), 'evidence ledger page links JSON endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/evidence-ledger.json'), 'SEO governance lists evidence ledger endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-evidence-ledger'), 'SEO governance lists evidence ledger page in crawl targets');
assert.ok(read('src/data/pages.ts').includes('/seo-evidence-ledger'), 'canonical pages include evidence ledger page');
assert.ok(read('src/data/seoReleaseChecks.ts').includes('evidence-ledger'), 'release checks include evidence ledger group');
assert.ok(read('src/app/seo-status.json/route.ts').includes('evidenceLedgerSummary'), 'SEO status exposes evidence ledger summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('evidenceLedgerSummary'), 'site-index exposes evidence ledger summary');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('evidenceLedgerTargets'), 'content inventory exposes evidence ledger targets');
assert.ok(read('src/app/production-signals.json/route.ts').includes('evidenceFileSpecs'), 'production signals route exposes evidence file specs');
assert.ok(read('src/app/optimization-decisions.json/route.ts').includes('pageEvidenceLedgerRecords'), 'optimization decisions route exposes page evidence ledger');
assert.ok(read('src/app/quality-gates.json/route.ts').includes('evidenceLedgerSummary'), 'quality gates expose evidence ledger summary');
assert.ok(read('src/app/release-checklist.json/route.ts').includes('verify-seo-signal-files.mjs'), 'release checklist includes signal file verification command');
assert.ok(read('src/app/site-map/page.tsx').includes('/evidence-ledger.json'), 'site map links evidence ledger JSON');
assert.ok(read('src/app/llms.txt/route.ts').includes('/evidence-ledger.json'), 'llms.txt links evidence ledger');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Evidence ledger summary'), 'llms-full includes evidence ledger summary');
assert.ok(read('src/app/layout.tsx').includes('/seo-evidence-ledger'), 'footer links evidence ledger page');
assert.ok(read('scripts/verify-seo-signal-files.mjs').includes('search-console-queries.csv'), 'signal file verification script checks Search Console query export');

assert.ok(fs.existsSync('src/data/seoChangeControl.ts'), 'SEO change-control data exists');
assert.ok(fs.existsSync('src/app/change-control.json/route.ts'), 'SEO change-control JSON route exists');
assert.ok(fs.existsSync('src/app/seo-change-control/page.tsx'), 'human-readable SEO change-control page exists');
assert.ok(fs.existsSync('scripts/check-seo-change-control.mjs'), 'SEO change-control local gate script exists');
const seoChangeControl = read('src/data/seoChangeControl.ts');
for (const ruleId of ['metadata-change-control', 'internal-link-change-control', 'visible-evidence-change-control', 'schema-change-control', 'performance-change-control', 'csp-change-control', 'indexing-change-control', 'governance-change-control']) {
  assert.ok(seoChangeControl.includes(ruleId), `${ruleId} change-control rule exists`);
}
for (const exportedName of ['seoChangeControlRules', 'seoChangeControlWorkflow', 'seoChangeControlPageRecords', 'seoChangeControlSummary']) {
  assert.ok(seoChangeControl.includes(exportedName), `${exportedName} is declared`);
}
assert.ok(read('src/app/change-control.json/route.ts').includes('seoChangeControlRules'), 'change-control route exposes rules');
assert.ok(read('src/app/change-control.json/route.ts').includes('proposedChangeManifestExample'), 'change-control route exposes manifest example');
assert.ok(read('src/app/seo-change-control/page.tsx').includes('StockCut SEO Change Control'), 'change-control page has expected title');
assert.ok(read('src/data/seoGovernance.ts').includes('/change-control.json'), 'SEO governance lists change-control endpoint');
assert.ok(read('src/data/seoGovernance.ts').includes('/seo-change-control'), 'SEO governance lists change-control page in crawl targets');
assert.ok(read('src/data/pages.ts').includes('/seo-change-control'), 'canonical pages include change-control page');
assert.ok(read('src/app/seo-status.json/route.ts').includes('seoChangeControlSummary'), 'SEO status exposes change-control summary');
assert.ok(read('src/app/site-index.json/route.ts').includes('seoChangeControlSummary'), 'site-index exposes change-control summary');
assert.ok(read('src/app/content-inventory.json/route.ts').includes('changeControlTargets'), 'content inventory exposes change-control targets');
assert.ok(read('src/app/quality-gates.json/route.ts').includes('seoChangeControlSummary'), 'quality gates expose change-control summary');
assert.ok(read('src/app/release-checklist.json/route.ts').includes('check-seo-change-control.mjs'), 'release checklist includes change-control script');
assert.ok(read('src/app/production-signals.json/route.ts').includes('changeControlScript'), 'production signals route includes change-control script');
assert.ok(read('src/app/optimization-decisions.json/route.ts').includes('changeControlRules'), 'optimization decisions route exposes change-control rules');
assert.ok(read('src/app/evidence-ledger.json/route.ts').includes('changeControlScript'), 'evidence ledger route documents change-control script');
assert.ok(read('src/app/site-map/page.tsx').includes('/change-control.json'), 'site map links change-control JSON');
assert.ok(read('src/app/llms.txt/route.ts').includes('/change-control.json'), 'llms.txt links change-control JSON');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('Change-control summary'), 'llms-full includes change-control summary');
assert.ok(read('src/app/layout.tsx').includes('/seo-change-control'), 'footer links change-control page');
assert.ok(read('scripts/check-seo-change-control.mjs').includes('optimizationActionCandidates'), 'change-control script reads optimization action candidates');
assert.ok(read('seo-signals/README.md').includes('check-seo-change-control.mjs'), 'SEO signal README documents change-control gate');


assert.ok(fs.existsSync('scripts/run-seo-local-gates.mjs'), 'one-command SEO local gates script exists');
assert.ok(fs.existsSync('scripts/create-seo-change-template.mjs'), 'SEO proposed change template script exists');
assert.ok(fs.existsSync('scripts/archive-seo-signal-run.mjs'), 'SEO signal run archive script exists');
assert.ok(fs.existsSync('seo-signals/proposed-seo-changes.example.json'), 'SEO proposed change example manifest exists');
const packageJson = read('package.json');
for (const scriptName of ['seo:verify-signals', 'seo:analyze-signals', 'seo:change-control', 'seo:local-gates', 'seo:change-template', 'seo:archive-run', 'seo:automation-check', 'seo:ci']) {
  assert.ok(packageJson.includes(scriptName), `${scriptName} npm script exists`);
}
const localGateScript = read('scripts/run-seo-local-gates.mjs');
assert.ok(localGateScript.includes('verify-seo-signal-files.mjs'), 'local gates script runs signal verification');
assert.ok(localGateScript.includes('analyze-production-signals.mjs'), 'local gates script runs production signal analysis');
assert.ok(localGateScript.includes('check-seo-change-control.mjs'), 'local gates script runs change-control gate');
assert.ok(localGateScript.includes('npm run typecheck'), 'local gates script runs typecheck');
assert.ok(localGateScript.includes('scripts/validate-site.mjs'), 'local gates script runs static validation');
assert.ok(localGateScript.includes('npm audit'), 'local gates script runs dependency audits');
assert.ok(localGateScript.includes('npm run build'), 'local gates script documents build as skipped policy, not as an executed command');
assert.ok(read('src/app/release-checklist.json/route.ts').includes('npm run seo:local-gates'), 'release checklist includes one-command local gates');
assert.ok(read('src/app/production-signals.json/route.ts').includes('localGateScript'), 'production signals route documents one-command local gate');
assert.ok(read('src/app/change-control.json/route.ts').includes('proposedChangeTemplate'), 'change-control route documents proposed change template');
assert.ok(read('src/app/evidence-ledger.json/route.ts').includes('archiveScript'), 'evidence ledger route documents signal run archive script');
assert.ok(read('seo-signals/README.md').includes('npm run seo:local-gates'), 'SEO signal README documents one-command local gate');
assert.ok(read('seo-signals/README.md').includes('proposed-seo-changes.example.json'), 'SEO signal README links proposed change example');

assert.ok(fs.existsSync('.github/workflows/seo-local-gates.yml'), 'GitHub Actions SEO local gates workflow exists');
assert.ok(fs.existsSync('.github/PULL_REQUEST_TEMPLATE/seo-change-control.md'), 'SEO change-control PR template exists');
assert.ok(fs.existsSync('scripts/check-seo-automation-consistency.mjs'), 'SEO automation consistency script exists');
assert.ok(fs.existsSync('docs/SEO_DEPLOYMENT_GATES.md'), 'SEO deployment gate documentation exists');
const workflow = read('.github/workflows/seo-local-gates.yml');
assert.ok(workflow.includes("node-version: '20.x'"), 'SEO workflow uses Node 20');
assert.ok(workflow.includes('npm ci --ignore-scripts'), 'SEO workflow installs dependencies without lifecycle scripts');
assert.ok(workflow.includes('npm run seo:local-gates'), 'SEO workflow runs one-command local gates');
assert.ok(workflow.includes('actions/upload-artifact@v4'), 'SEO workflow archives derived reports as artifacts');
assert.ok(!workflow.includes('npm run build'), 'SEO workflow does not run npm run build');
assert.ok(!workflow.toLowerCase().includes('vitest'), 'SEO workflow does not run Vitest');
assert.ok(!workflow.toLowerCase().includes('playwright test'), 'SEO workflow does not run Playwright');
assert.ok(!workflow.toLowerCase().includes('lighthouse'), 'SEO workflow does not run Lighthouse');
const prTemplate = read('.github/PULL_REQUEST_TEMPLATE/seo-change-control.md');
assert.ok(prTemplate.includes('npm run seo:local-gates'), 'PR template requires the local gate');
assert.ok(prTemplate.includes('optimizationActionCandidates'), 'PR template requires production-signal action candidates for protected changes');
assert.ok(prTemplate.includes('Raw Search Console'), 'PR template warns against committing raw production exports');
const deploymentGatesDoc = read('docs/SEO_DEPLOYMENT_GATES.md');
assert.ok(deploymentGatesDoc.includes('.github/workflows/seo-local-gates.yml'), 'deployment gate docs reference CI workflow');
assert.ok(deploymentGatesDoc.includes('Protected surfaces'), 'deployment gate docs describe protected SEO surfaces');
const gitignore = read('.gitignore');
assert.ok(gitignore.includes('seo-signals/*'), 'raw SEO signal files are ignored');
assert.ok(gitignore.includes('!seo-signals/README.md'), 'SEO signal README stays trackable');
assert.ok(gitignore.includes('!seo-signals/proposed-seo-changes.example.json'), 'SEO proposed change example stays trackable');
assert.ok(read('scripts/run-seo-local-gates.mjs').includes('check-seo-automation-consistency.mjs'), 'local gates run automation consistency check');
assert.ok(read('src/data/seoGovernance.ts').includes('seoAutomationPolicy'), 'SEO governance exports automation policy');
assert.ok(read('src/app/seo-status.json/route.ts').includes('seoAutomationPolicy'), 'SEO status exposes automation policy');
assert.ok(read('src/app/release-checklist.json/route.ts').includes('seoAutomationPolicy'), 'release checklist exposes automation policy');
assert.ok(read('src/app/production-signals.json/route.ts').includes('seoAutomationPolicy'), 'production signals expose automation policy');
assert.ok(read('src/app/evidence-ledger.json/route.ts').includes('seoAutomationPolicy'), 'evidence ledger exposes automation policy');
assert.ok(read('src/app/change-control.json/route.ts').includes('seoAutomationPolicy'), 'change-control exposes automation policy');
assert.ok(read('src/app/site-index.json/route.ts').includes('seoAutomationPolicy'), 'site-index exposes automation policy');
assert.ok(read('src/app/llms.txt/route.ts').includes('seoAutomationPolicy'), 'llms.txt references automation policy');
assert.ok(read('src/app/llms-full.txt/route.ts').includes('seoAutomationPolicy'), 'llms-full references automation policy');
assert.ok(read('seo-signals/README.md').includes('npm run seo:automation-check'), 'SEO signal README documents automation consistency command');


assert.ok(fs.existsSync('docs/SEO_STRATEGY.md'), 'offline seo-plan strategy document exists');
assert.ok(fs.existsSync('docs/SEO_FLOW_OPERATING_MODEL.md'), 'offline seo-flow operating model exists');
assert.ok(fs.existsSync('docs/SEO_KEYWORD_CLUSTER_MAP.md'), 'offline seo-cluster map exists');
assert.ok(fs.existsSync('docs/SEO_AUTHORITY_OUTREACH_PLAN.md'), 'offline seo-backlinks authority plan exists');
assert.ok(fs.existsSync('docs/SEO_GOOGLE_OPERATIONS.md'), 'offline seo-google operations guide exists');
assert.ok(fs.existsSync('docs/SEO_DRIFT_BASELINE.md'), 'offline seo-drift baseline guide exists');
assert.ok(fs.existsSync('scripts/run-seo-offline-skills.mjs'), 'offline SEO skill runner exists');
assert.ok(fs.existsSync('scripts/capture-seo-source-baseline.mjs'), 'source-level SEO baseline capture script exists');
assert.ok(fs.existsSync('scripts/compare-seo-source-baseline.mjs'), 'source-level SEO baseline compare script exists');
for (const [file, marker] of [
  ['docs/SEO_STRATEGY.md', 'seo-plan'],
  ['docs/SEO_FLOW_OPERATING_MODEL.md', 'seo-flow'],
  ['docs/SEO_KEYWORD_CLUSTER_MAP.md', 'seo-cluster'],
  ['docs/SEO_AUTHORITY_OUTREACH_PLAN.md', 'seo-backlinks'],
  ['docs/SEO_GOOGLE_OPERATIONS.md', 'seo-google'],
  ['docs/SEO_DRIFT_BASELINE.md', 'seo-drift']
]) {
  assert.ok(read(file).includes(marker), `${file} records ${marker} execution`);
  assert.ok(read(file).includes('StockCut') || read(file).includes('stockcut'), `${file} is StockCut-specific`);
}
for (const scriptName of ['seo:offline-skills', 'seo:drift-baseline', 'seo:drift-compare']) {
  assert.ok(packageJson.includes(scriptName), `${scriptName} npm script exists`);
}
assert.ok(read('scripts/run-seo-local-gates.mjs').includes('run-seo-offline-skills.mjs'), 'local gates run offline SEO skill checks');
assert.ok(read('scripts/run-seo-offline-skills.mjs').includes('skippedBecauseUserRequestedNoSignalExport'), 'offline skill runner records skipped signal exports');
assert.ok(read('scripts/capture-seo-source-baseline.mjs').includes('aggregateSha256'), 'source baseline records aggregate hash');
assert.ok(read('scripts/compare-seo-source-baseline.mjs').includes('drift-detected'), 'source drift compare reports drift state');
assert.ok(read('.github/workflows/seo-local-gates.yml').includes('seo-offline-skills-report.json'), 'SEO workflow archives offline skill report');
assert.ok(read('docs/SEO_DEPLOYMENT_GATES.md').includes('npm run seo:offline-skills'), 'deployment docs describe offline SEO skill gate');
assert.ok(read('seo-signals/README.md').includes('npm run seo:offline-skills'), 'SEO signal README documents offline skill fallback');
assert.ok(read('src/data/seoGovernance.ts').includes('offlineSkillCommand'), 'SEO automation policy exposes offline skill command');
assert.ok(read('src/app/release-checklist.json/route.ts').includes('seo:offline-skills'), 'release checklist allows offline skill command');


console.log('Static validation passed.');
