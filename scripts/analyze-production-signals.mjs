#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
  if (arg.startsWith('--')) {
    const next = process.argv[index + 1];
    args.set(arg, next && !next.startsWith('--') ? next : 'true');
    if (next && !next.startsWith('--')) index += 1;
  }
}

const inputDir = path.resolve(String(args.get('--input') ?? 'seo-signals'));
const outFile = path.resolve(String(args.get('--out') ?? '.seo-cache/production-signals-summary.json'));

function printHelp() {
  console.log(`Analyze production SEO signal exports without running a build or test suite.\n\nUsage:\n  node scripts/analyze-production-signals.mjs --input seo-signals --out .seo-cache/production-signals-summary.json\n\nAccepted optional files:\n  search-console-queries.csv, gsc-queries.csv\n  search-console-pages.csv, gsc-pages.csv\n  pagespeed-mobile.json, pagespeed-desktop.json, psi-*.json\n  rich-results.json, structured-data-notes.json\n\nThe script emits a JSON summary with missing inputs and candidate optimization actions.`);
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listFiles(full));
    else if (/\.(csv|json)$/i.test(entry.name)) results.push(full);
  }
  return results;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/^top /, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function numberValue(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/,/g, '').replace('%', '').trim();
  const num = Number(normalized);
  if (!Number.isFinite(num)) return 0;
  if (String(value).includes('%')) return num / 100;
  return num;
}

function ctrValue(value) {
  const num = numberValue(value);
  return num > 1 ? num / 100 : num;
}

function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function compactPageSpeedRecord(file, json) {
  const lighthouse = json.lighthouseResult ?? json;
  const audits = lighthouse.audits ?? json.audits ?? {};
  const categories = lighthouse.categories ?? json.categories ?? {};
  const strategy = json.configSettings?.emulatedFormFactor ?? json.strategy ?? (file.toLowerCase().includes('mobile') ? 'mobile' : file.toLowerCase().includes('desktop') ? 'desktop' : 'unknown');
  const score = categories.performance?.score;
  return {
    file: path.basename(file),
    url: lighthouse.finalDisplayedUrl ?? lighthouse.finalUrl ?? json.url ?? null,
    strategy,
    performanceScore: typeof score === 'number' ? Math.round(score * 100) : json.performanceScore ?? null,
    lcp: audits['largest-contentful-paint']?.displayValue ?? json.lcp ?? null,
    inp: audits['interaction-to-next-paint']?.displayValue ?? json.inp ?? null,
    cls: audits['cumulative-layout-shift']?.displayValue ?? json.cls ?? null,
    totalBlockingTime: audits['total-blocking-time']?.displayValue ?? json.tbt ?? null,
    thirdPartySummary: audits['third-party-summary']?.displayValue ?? null
  };
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.reports)) return value.reports;
  if (value && Array.isArray(value.violations)) return value.violations;
  if (value && Array.isArray(value.records)) return value.records;
  if (value && typeof value === 'object') return [value];
  return [];
}

function normalizeCspRecord(file, record) {
  const report = record['csp-report'] ?? record.body ?? record;
  const effectiveDirective = report['effective-directive'] ?? report.effectiveDirective ?? report['violated-directive'] ?? report.violatedDirective ?? 'unknown';
  const blockedUri = report['blocked-uri'] ?? report.blockedUri ?? report.blockedURL ?? report.blockedUrl ?? '';
  const documentUri = report['document-uri'] ?? report.documentUri ?? report.url ?? '';
  return {
    file: path.basename(file),
    effectiveDirective,
    violatedDirective: report['violated-directive'] ?? report.violatedDirective ?? effectiveDirective,
    blockedUri,
    documentUri,
    disposition: report.disposition ?? record.disposition ?? 'report',
    sourceFile: report['source-file'] ?? report.sourceFile ?? null
  };
}

function summarizeCspRecords(files) {
  const records = files.flatMap((file) => toArray(safeReadJson(file)).map((record) => normalizeCspRecord(file, record)));
  const byDirective = new Map();
  const byBlockedUri = new Map();
  for (const record of records) {
    byDirective.set(record.effectiveDirective, (byDirective.get(record.effectiveDirective) ?? 0) + 1);
    const blocked = record.blockedUri || '(empty)';
    byBlockedUri.set(blocked, (byBlockedUri.get(blocked) ?? 0) + 1);
  }
  const unexpectedViolationCount = records.filter((record) => {
    const blocked = String(record.blockedUri || '').toLowerCase();
    if (!blocked || blocked === 'inline' || blocked === 'eval' || blocked === 'self') return true;
    return !blocked.includes('stockcut.ymirtool.com') && !blocked.includes('googlesyndication.com') && !blocked.includes('google.com') && !blocked.includes('googleadservices.com') && !blocked.includes('doubleclick.net') && !blocked.includes('gstatic.com') && !blocked.includes('googleusercontent.com');
  }).length;
  return {
    fileCount: files.length,
    recordCount: records.length,
    violationsByDirective: Object.fromEntries([...byDirective.entries()].sort()),
    topBlockedUris: [...byBlockedUri.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([blockedUri, count]) => ({ blockedUri, count })),
    unexpectedViolationCount,
    recommendation: records.length === 0 ? 'keep-report-only-until-real-csp-reports-exist' : unexpectedViolationCount === 0 ? 'eligible-for-manual-csp-enforcement-review' : 'keep-report-only-and-update-allowlist-after-review'
  };
}

function buildOptimizationCandidates({ searchConsoleOpportunities, pageSpeedRecords, richResultRecords, cspReadiness }) {
  const candidates = [];
  for (const opportunity of searchConsoleOpportunities) {
    candidates.push({
      action: opportunity.type.includes('low-ctr') ? 'rewrite-title-description' : 'strengthen-internal-links',
      status: 'candidate',
      source: 'google-search-console',
      label: opportunity.label,
      evidence: { impressions: opportunity.impressions, clicks: opportunity.clicks, ctr: opportunity.ctr, position: opportunity.position },
      decisionGate: opportunity.type.includes('low-ctr') ? 'metadata-rewrite-requires-stable-query-evidence' : 'internal-link-strengthening-before-page-sprawl',
      requiredReview: 'Confirm canonical page intent match before editing metadata, visible content, or internal links.'
    });
  }
  for (const record of pageSpeedRecords) {
    if (record.performanceScore != null && record.performanceScore < 70) {
      candidates.push({
        action: 'investigate-performance',
        status: 'candidate',
        source: 'pagespeed-insights',
        label: record.url ?? record.file,
        evidence: { strategy: record.strategy, performanceScore: record.performanceScore, lcp: record.lcp, inp: record.inp, cls: record.cls },
        decisionGate: 'performance-work-requires-deployed-measurement',
        requiredReview: 'Inspect deployed URL diagnostics before changing bundles, scripts, images, or ad loading.'
      });
    }
  }
  for (const record of richResultRecords) {
    if (record.valid === false || (Array.isArray(record.errors) && record.errors.length > 0)) {
      candidates.push({
        action: 'fix-schema-rendering',
        status: 'candidate',
        source: 'rich-results-test',
        label: record.url ?? record.file,
        evidence: { valid: record.valid ?? null, detectedTypes: record.detectedTypes ?? record.types ?? [], errors: record.errors ?? [] },
        decisionGate: 'schema-fixes-before-schema-expansion',
        requiredReview: 'Fix rendered JSON-LD before adding any new schema type.'
      });
    }
  }
  candidates.push({
    action: cspReadiness.recommendation === 'eligible-for-manual-csp-enforcement-review' ? 'enforce-csp' : 'keep-csp-report-only',
    status: cspReadiness.recommendation === 'eligible-for-manual-csp-enforcement-review' ? 'manual-review-required' : 'blocked',
    source: 'csp-report-only',
    label: 'Content-Security-Policy enforcement readiness',
    evidence: { recordCount: cspReadiness.recordCount, unexpectedViolationCount: cspReadiness.unexpectedViolationCount, recommendation: cspReadiness.recommendation },
    decisionGate: 'csp-enforcement-requires-clean-report-only-window',
    requiredReview: 'Review report-only violations and rollback plan before switching to enforced CSP.'
  });
  return candidates.slice(0, 150);
}

function analyzeSearchConsoleRows(rows, type) {
  const opportunities = [];
  for (const row of rows) {
    const impressions = numberValue(row.impressions);
    const clicks = numberValue(row.clicks);
    const ctr = ctrValue(row.ctr);
    const position = numberValue(row.position);
    const label = row.query || row.page || row.url || '(unknown)';
    if (impressions >= 100 && ctr > 0 && ctr < 0.02) {
      opportunities.push({ type: `${type}-low-ctr`, label, clicks, impressions, ctr, position, action: 'Review title/meta description and page intent fit before rewriting.' });
    }
    if (impressions >= 50 && position >= 4 && position <= 20) {
      opportunities.push({ type: `${type}-striking-distance`, label, clicks, impressions, ctr, position, action: 'Strengthen related links, intro copy, evidence, or examples on the matching canonical page.' });
    }
  }
  return opportunities.sort((a, b) => b.impressions - a.impressions).slice(0, 50);
}

const files = listFiles(inputDir);
const csvFiles = files.filter((file) => file.toLowerCase().endsWith('.csv'));
const jsonFiles = files.filter((file) => file.toLowerCase().endsWith('.json'));

const gscQueryFiles = csvFiles.filter((file) => /(?:search-console|gsc).*quer/i.test(path.basename(file)));
const gscPageFiles = csvFiles.filter((file) => /(?:search-console|gsc).*pages?/i.test(path.basename(file)));
const pageSpeedFiles = jsonFiles.filter((file) => /(?:pagespeed|psi)/i.test(path.basename(file)));
const richResultFiles = jsonFiles.filter((file) => /(?:rich-results|structured-data)/i.test(path.basename(file)));
const cspReportFiles = jsonFiles.filter((file) => /(?:csp|report-only|security-policy)/i.test(path.basename(file)));

const queryRows = gscQueryFiles.flatMap((file) => parseCsv(fs.readFileSync(file, 'utf8')));
const pageRows = gscPageFiles.flatMap((file) => parseCsv(fs.readFileSync(file, 'utf8')));
const pageSpeedRecords = pageSpeedFiles.map((file) => compactPageSpeedRecord(file, safeReadJson(file)));
const richResultRecords = richResultFiles.map((file) => ({ file: path.basename(file), ...safeReadJson(file) }));
const cspReadiness = summarizeCspRecords(cspReportFiles);

const missingInputs = [];
if (gscQueryFiles.length === 0) missingInputs.push('Search Console query CSV');
if (gscPageFiles.length === 0) missingInputs.push('Search Console page CSV');
if (pageSpeedFiles.length === 0) missingInputs.push('PageSpeed JSON');
if (richResultFiles.length === 0) missingInputs.push('Rich Results structured-data notes');
if (cspReportFiles.length === 0) missingInputs.push('CSP report-only violation JSON');

const searchConsoleOpportunities = [
  ...analyzeSearchConsoleRows(queryRows, 'query'),
  ...analyzeSearchConsoleRows(pageRows, 'page')
].slice(0, 100);
const optimizationActionCandidates = buildOptimizationCandidates({ searchConsoleOpportunities, pageSpeedRecords, richResultRecords, cspReadiness });

const summary = {
  generatedAt: new Date().toISOString(),
  inputDir,
  status: files.length === 0 ? 'no-inputs' : 'analyzed',
  fileCounts: {
    total: files.length,
    csv: csvFiles.length,
    json: jsonFiles.length,
    gscQueryFiles: gscQueryFiles.length,
    gscPageFiles: gscPageFiles.length,
    pageSpeedFiles: pageSpeedFiles.length,
    richResultFiles: richResultFiles.length,
    cspReportFiles: cspReportFiles.length
  },
  missingInputs,
  searchConsole: {
    queryRowCount: queryRows.length,
    pageRowCount: pageRows.length,
    opportunities: searchConsoleOpportunities
  },
  pageSpeed: {
    records: pageSpeedRecords,
    incompleteRecords: pageSpeedRecords.filter((record) => record.performanceScore == null || record.lcp == null || record.cls == null).map((record) => record.file)
  },
  richResults: {
    records: richResultRecords.map((record) => ({ file: record.file, valid: record.valid ?? null, detectedTypes: record.detectedTypes ?? record.types ?? [], errors: record.errors ?? [] }))
  },
  cspReadiness,
  optimizationActionCandidates,
  nextActions: files.length === 0 ? [
    'Export Search Console queries and pages for the last 28 days into seo-signals/.',
    'Save PageSpeed JSON for mobile and desktop priority pages into seo-signals/.',
    'Record Rich Results validation notes for homepage, sheet, linear, guide, and governance pages.',
    'Run this script again and review generated optimization action candidates before changing titles, descriptions, internal links, schema, performance settings, indexing actions, or CSP.'
  ] : [
    'Review low-CTR and striking-distance opportunities against canonical page intent before editing pages.',
    'Review optimizationActionCandidates and ship only actions backed by the required decision gate evidence.',
    'Use PageSpeed records to decide performance work; do not infer CWV pass from source-only checks.',
    'Fix Rich Results errors before expanding schema coverage.',
    'Keep raw exports out of git unless intentionally publishing aggregated summaries.'
  ]
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
console.log(`Production signal analysis written to ${outFile}`);
console.log(`Status: ${summary.status}; files: ${summary.fileCounts.total}; missing inputs: ${summary.missingInputs.length}`);
