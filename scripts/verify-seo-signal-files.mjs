#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputDir = readArg('--input', 'seo-signals');
const outFile = readArg('--out', '.seo-cache/seo-signal-files-verification.json');

const specs = [
  {
    id: 'gsc-query-export',
    fileName: 'search-console-queries.csv',
    format: 'csv',
    requiredFields: ['Query', 'Page', 'Clicks', 'Impressions', 'CTR', 'Position']
  },
  {
    id: 'gsc-page-export',
    fileName: 'gsc-pages.csv',
    format: 'csv',
    requiredFields: ['Page', 'Clicks', 'Impressions', 'CTR', 'Position']
  },
  {
    id: 'pagespeed-mobile',
    fileName: 'pagespeed-mobile.json',
    format: 'json',
    requiredFields: ['lighthouseResult', 'loadingExperience']
  },
  {
    id: 'pagespeed-desktop',
    fileName: 'pagespeed-desktop.json',
    format: 'json',
    requiredFields: ['lighthouseResult']
  },
  {
    id: 'rich-results',
    fileName: 'rich-results.json',
    format: 'json',
    requiredFields: ['url', 'detectedTypes', 'errors', 'warnings']
  },
  {
    id: 'production-crawl',
    fileName: 'production-crawl.json',
    format: 'json',
    requiredFields: ['url', 'status', 'canonical', 'headers', 'jsonLdTypes']
  },
  {
    id: 'csp-report-only',
    fileName: 'csp-reports.json',
    format: 'json',
    requiredFields: ['directive', 'blockedUri', 'documentUri', 'count']
  },
  {
    id: 'bing-webmaster-tools',
    fileName: 'bing-indexing.csv',
    format: 'csv',
    requiredFields: ['URL', 'Clicks', 'Impressions', 'CTR', 'Position']
  }
];

function splitCsvLine(line) {
  const cells = [];
  let cell = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function verifyCsv(filePath, requiredFields) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? '';
  const headers = splitCsvLine(firstLine).map((header) => header.trim());
  const missingFields = requiredFields.filter((field) => !headers.includes(field));
  const rowCount = text.split(/\r?\n/).filter((line, index) => index > 0 && line.trim().length > 0).length;
  return { headers, missingFields, rowCount };
}

function findJsonFields(value, requiredFields) {
  const asArray = Array.isArray(value) ? value : [value];
  const keys = new Set();
  for (const item of asArray) {
    if (item && typeof item === 'object') {
      for (const key of Object.keys(item)) keys.add(key);
    }
  }
  return requiredFields.filter((field) => !keys.has(field));
}

function verifyJson(filePath, requiredFields) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const missingFields = findJsonFields(parsed, requiredFields);
  const itemCount = Array.isArray(parsed) ? parsed.length : 1;
  return { missingFields, itemCount };
}

const checks = specs.map((spec) => {
  const filePath = path.join(inputDir, spec.fileName);
  if (!fs.existsSync(filePath)) {
    return {
      id: spec.id,
      fileName: spec.fileName,
      status: 'missing',
      missingFields: spec.requiredFields,
      message: 'File not found. This blocks evidence-backed SEO action candidates that depend on this source.'
    };
  }

  try {
    const stats = fs.statSync(filePath);
    const verification = spec.format === 'csv' ? verifyCsv(filePath, spec.requiredFields) : verifyJson(filePath, spec.requiredFields);
    return {
      id: spec.id,
      fileName: spec.fileName,
      status: verification.missingFields.length === 0 ? 'valid-shape' : 'invalid-shape',
      bytes: stats.size,
      ...verification,
      message: verification.missingFields.length === 0 ? 'Required fields are present.' : 'Required fields are missing.'
    };
  } catch (error) {
    return {
      id: spec.id,
      fileName: spec.fileName,
      status: 'parse-error',
      missingFields: spec.requiredFields,
      message: error instanceof Error ? error.message : String(error)
    };
  }
});

const summary = {
  generatedAt: new Date().toISOString(),
  inputDir,
  expectedFiles: specs.length,
  presentFiles: checks.filter((check) => check.status !== 'missing').length,
  validShapeFiles: checks.filter((check) => check.status === 'valid-shape').length,
  invalidShapeFiles: checks.filter((check) => check.status === 'invalid-shape').length,
  parseErrorFiles: checks.filter((check) => check.status === 'parse-error').length,
  missingFiles: checks.filter((check) => check.status === 'missing').map((check) => check.fileName),
  analysisAllowed: checks.some((check) => check.status === 'valid-shape'),
  decisionPolicy: 'Valid file shape is necessary but not sufficient. Ship SEO changes only when scripts/analyze-production-signals.mjs emits an action candidate that passes /optimization-decisions.json gates.'
};

const output = { summary, checks };
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
