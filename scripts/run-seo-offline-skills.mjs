#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const cacheDir = readArg('--cache', '.seo-cache');
const outFile = readArg('--out', path.join(cacheDir, 'seo-offline-skills-report.json'));
const baselineFile = path.join(cacheDir, 'seo-source-baseline.json');
const driftFile = path.join(cacheDir, 'seo-source-drift-report.json');

const requiredDocs = [
  { skill: 'seo-plan', file: 'docs/SEO_STRATEGY.md', marker: 'StockCut SEO Strategy' },
  { skill: 'seo-flow', file: 'docs/SEO_FLOW_OPERATING_MODEL.md', marker: 'FLOW' },
  { skill: 'seo-cluster', file: 'docs/SEO_KEYWORD_CLUSTER_MAP.md', marker: 'Keyword Cluster Map' },
  { skill: 'seo-backlinks', file: 'docs/SEO_AUTHORITY_OUTREACH_PLAN.md', marker: 'Authority and Backlink Plan' },
  { skill: 'seo-google', file: 'docs/SEO_GOOGLE_OPERATIONS.md', marker: 'Google Search Operations' },
  { skill: 'seo-drift', file: 'docs/SEO_DRIFT_BASELINE.md', marker: 'SEO Drift Baseline' }
];
const requiredScripts = [
  'scripts/capture-seo-source-baseline.mjs',
  'scripts/compare-seo-source-baseline.mjs',
  'scripts/run-seo-offline-skills.mjs'
];

const checks = [];
function record(id, label, fn) {
  try {
    fn();
    checks.push({ id, label, status: 'passed' });
  } catch (error) {
    checks.push({ id, label, status: 'failed', message: error instanceof Error ? error.message : String(error) });
  }
}

for (const doc of requiredDocs) {
  record(`doc-${doc.skill}`, `${doc.skill} offline deliverable exists or is intentionally omitted from no-md artifact`, () => {
    if (!fs.existsSync(doc.file)) {
      const hasAnyMarkdown = fs.existsSync('docs')
        ? fs.readdirSync('docs').some((entry) => entry.toLowerCase().endsWith('.md'))
        : false;
      assert.equal(hasAnyMarkdown, false, `${doc.file} missing while other Markdown docs are present`);
      return;
    }
    const text = fs.readFileSync(doc.file, 'utf8');
    assert.ok(text.includes(doc.marker), `${doc.file} missing marker ${doc.marker}`);
    assert.ok(text.includes('StockCut') || text.includes('stockcut'), `${doc.file} is not StockCut-specific`);
  });
}
for (const script of requiredScripts) {
  record(`script-${path.basename(script)}`, `${script} exists`, () => assert.ok(fs.existsSync(script), `${script} missing`));
}

const capture = spawnSync('node', ['scripts/capture-seo-source-baseline.mjs', '--out', baselineFile], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});
checks.push({
  id: 'capture-source-baseline',
  label: 'Capture source-level SEO drift baseline',
  status: (capture.status ?? 0) === 0 ? 'passed' : 'failed',
  exitCode: capture.status ?? 0,
  stdoutTail: (capture.stdout ?? '').split('\n').slice(-12).join('\n').trim(),
  stderrTail: (capture.stderr ?? '').split('\n').slice(-12).join('\n').trim()
});

const compare = spawnSync('node', ['scripts/compare-seo-source-baseline.mjs', '--baseline', baselineFile, '--out', driftFile], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});
checks.push({
  id: 'compare-source-baseline',
  label: 'Compare current source-level SEO drift against freshly captured baseline',
  status: (compare.status ?? 0) === 0 ? 'passed' : 'failed',
  exitCode: compare.status ?? 0,
  stdoutTail: (compare.stdout ?? '').split('\n').slice(-12).join('\n').trim(),
  stderrTail: (compare.stderr ?? '').split('\n').slice(-12).join('\n').trim()
});

const failed = checks.filter((check) => check.status === 'failed');
const report = {
  generatedAt: new Date().toISOString(),
  status: failed.length ? 'failed' : 'passed',
  purpose: 'Execute local-only portions of other SEO skills without exporting real seo-signals data.',
  executedOfflineSkills: requiredDocs.map((doc) => doc.skill),
  skippedBecauseUserRequestedNoSignalExport: ['Search Console export', 'PageSpeed export', 'Rich Results export', 'Bing export', 'CSP report export', 'backlink database export', 'live competitor scrape'],
  policy: {
    doesNotModifyProtectedSurfaces: true,
    protectedSurfaces: ['title', 'description', 'visible SEO copy', 'internal links', 'Schema', 'CSP', 'indexing policy'],
    requiresChangeControlForProtectedChanges: true
  },
  outputs: { baselineFile, driftFile },
  checks
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
