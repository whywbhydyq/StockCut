#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const violations = [];
function check(label, fn) {
  try {
    fn();
  } catch (error) {
    violations.push({ label, message: error instanceof Error ? error.message : String(error) });
  }
}

check('package SEO scripts are present', () => {
  const packageJson = JSON.parse(read('package.json'));
  for (const scriptName of [
    'seo:verify-signals',
    'seo:analyze-signals',
    'seo:change-control',
    'seo:local-gates',
    'seo:change-template',
    'seo:archive-run',
    'seo:automation-check',
    'seo:offline-skills',
    'seo:drift-baseline',
    'seo:drift-compare'
  ]) {
    assert.ok(packageJson.scripts?.[scriptName], `${scriptName} script missing`);
  }
  assert.equal(packageJson.scripts['seo:automation-check'], 'node scripts/check-seo-automation-consistency.mjs');
  assert.equal(packageJson.scripts['seo:offline-skills'], 'node scripts/run-seo-offline-skills.mjs');
});

check('GitHub Actions workflow runs the allowed local gate only', () => {
  assert.ok(exists('.github/workflows/seo-local-gates.yml'), 'workflow file missing');
  const workflow = read('.github/workflows/seo-local-gates.yml');
  for (const required of ['node-version: \'20.x\'', 'npm ci --ignore-scripts', 'npm run seo:local-gates', 'actions/upload-artifact@v4']) {
    assert.ok(workflow.includes(required), `workflow missing ${required}`);
  }
  for (const forbidden of ['npm run build', 'npm test', 'vitest', 'playwright test', 'npx lighthouse']) {
    assert.ok(!workflow.toLowerCase().includes(forbidden), `workflow must not include ${forbidden}`);
  }
});

check('PR template documents evidence-gated SEO changes when Markdown templates are included', () => {
  if (!exists('.github/PULL_REQUEST_TEMPLATE/seo-change-control.md')) {
    return;
  }
  const template = read('.github/PULL_REQUEST_TEMPLATE/seo-change-control.md');
  for (const required of ['npm run seo:local-gates', 'optimizationActionCandidates', 'Raw Search Console', 'npm run seo:change-template', 'seo:offline-skills']) {
    assert.ok(template.includes(required), `PR template missing ${required}`);
  }
});

check('raw signal exports are ignored while documentation remains trackable', () => {
  const gitignore = read('.gitignore');
  for (const required of ['seo-signals/*', '!seo-signals/README.md', '!seo-signals/proposed-seo-changes.example.json']) {
    assert.ok(gitignore.includes(required), `.gitignore missing ${required}`);
  }
});

check('automation documentation exists when Markdown docs are included', () => {
  if (!exists('docs/SEO_DEPLOYMENT_GATES.md')) {
    return;
  }
  const docs = read('docs/SEO_DEPLOYMENT_GATES.md');
  for (const required of ['npm run seo:local-gates', 'Protected surfaces', '.github/workflows/seo-local-gates.yml', 'seo:offline-skills']) {
    assert.ok(docs.includes(required), `deployment docs missing ${required}`);
  }
});

check('local gate script includes automation consistency check', () => {
  const gateScript = read('scripts/run-seo-local-gates.mjs');
  assert.ok(gateScript.includes('check-seo-automation-consistency.mjs'), 'local gate script does not run automation consistency check');
  assert.ok(gateScript.includes('run-seo-offline-skills.mjs'), 'local gate script does not run offline SEO skill checks');
  assert.ok(gateScript.includes('seo-automation-consistency'), 'local gate step id missing');
});

check('public governance endpoints mention automation policy without exposing raw exports', () => {
  for (const file of [
    'src/data/seoGovernance.ts',
    'src/app/seo-status.json/route.ts',
    'src/app/release-checklist.json/route.ts',
    'src/app/production-signals.json/route.ts',
    'src/app/evidence-ledger.json/route.ts',
    'src/app/change-control.json/route.ts',
    'src/app/site-index.json/route.ts',
    'src/app/llms.txt/route.ts',
    'src/app/llms-full.txt/route.ts'
  ]) {
    assert.ok(read(file).includes('seoAutomationPolicy'), `${file} does not reference seoAutomationPolicy`);
  }
});



check('offline SEO skill scripts exist and Markdown deliverables are optional in no-md artifacts', () => {
  for (const file of [
    'scripts/run-seo-offline-skills.mjs',
    'scripts/capture-seo-source-baseline.mjs',
    'scripts/compare-seo-source-baseline.mjs'
  ]) {
    assert.ok(exists(file), `${file} missing`);
  }
  const docs = [
    ['docs/SEO_STRATEGY.md', 'seo-plan'],
    ['docs/SEO_FLOW_OPERATING_MODEL.md', 'seo-flow'],
    ['docs/SEO_KEYWORD_CLUSTER_MAP.md', 'seo-cluster'],
    ['docs/SEO_AUTHORITY_OUTREACH_PLAN.md', 'seo-backlinks'],
    ['docs/SEO_GOOGLE_OPERATIONS.md', 'seo-google'],
    ['docs/SEO_DRIFT_BASELINE.md', 'seo-drift']
  ];
  for (const [file, marker] of docs) {
    if (exists(file)) assert.ok(read(file).includes(marker), `${file} does not identify ${marker} execution`);
  }
});

const report = {
  generatedAt: new Date().toISOString(),
  status: violations.length === 0 ? 'passed' : 'failed',
  checkedFiles: [
    'package.json',
    '.github/workflows/seo-local-gates.yml',
    '.github/PULL_REQUEST_TEMPLATE/seo-change-control.md',
    '.gitignore',
    'docs/SEO_DEPLOYMENT_GATES.md',
    'scripts/run-seo-local-gates.mjs',
    'src/data/seoGovernance.ts',
    'docs/SEO_STRATEGY.md',
    'scripts/run-seo-offline-skills.mjs'
  ],
  skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse'],
  violations
};

const outArgIndex = process.argv.indexOf('--out');
if (outArgIndex !== -1) {
  const outFile = process.argv[outArgIndex + 1];
  if (outFile) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
  }
}

if (violations.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
