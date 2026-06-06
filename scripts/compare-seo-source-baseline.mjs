#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const baselineFile = readArg('--baseline', '.seo-cache/seo-source-baseline.json');
const currentFile = readArg('--current', '.seo-cache/seo-source-current.json');
const outFile = readArg('--out', '.seo-cache/seo-source-drift-report.json');

if (!fs.existsSync(baselineFile)) {
  const report = {
    generatedAt: new Date().toISOString(),
    status: 'missing-baseline',
    baselineFile,
    guidance: 'Run npm run seo:drift-baseline before comparing source-level SEO drift.',
    skippedByPolicy: ['production crawl', 'real seo-signals export']
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const capture = spawnSync('node', ['scripts/capture-seo-source-baseline.mjs', '--out', currentFile], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});
if ((capture.status ?? 0) !== 0) {
  console.error(capture.stderr || capture.stdout);
  process.exit(capture.status ?? 1);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const current = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
const baselineMap = new Map((baseline.files ?? []).map((entry) => [entry.path, entry]));
const currentMap = new Map((current.files ?? []).map((entry) => [entry.path, entry]));
const added = [];
const removed = [];
const changed = [];
for (const [file, entry] of currentMap) {
  if (!baselineMap.has(file)) added.push(file);
  else if (baselineMap.get(file).sha256 !== entry.sha256) changed.push(file);
}
for (const file of baselineMap.keys()) {
  if (!currentMap.has(file)) removed.push(file);
}
const report = {
  generatedAt: new Date().toISOString(),
  status: added.length || removed.length || changed.length ? 'drift-detected' : 'no-drift',
  baselineGeneratedAt: baseline.generatedAt ?? null,
  currentGeneratedAt: current.generatedAt ?? null,
  baselineAggregateSha256: baseline.aggregateSha256 ?? null,
  currentAggregateSha256: current.aggregateSha256 ?? null,
  counts: { added: added.length, removed: removed.length, changed: changed.length },
  added,
  removed,
  changed,
  policy: 'Drift is informational. Protected SEO changes still require accepted change-control candidates before title, description, internal-link, Schema, performance, indexing, or CSP changes are shipped.',
  skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse', 'real seo-signals export']
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
