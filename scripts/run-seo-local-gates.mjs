#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}
function hasFlag(flag) {
  return args.includes(flag);
}

const signalDir = readArg('--input', 'seo-signals');
const cacheDir = readArg('--cache', '.seo-cache');
const productionBaseUrl = readArg('--base-url', '');
const outFile = readArg('--out', path.join(cacheDir, 'seo-local-gates-report.json'));
const includeProduction = Boolean(productionBaseUrl) || hasFlag('--production');

const commands = [
  {
    id: 'verify-signal-files',
    label: 'Verify production signal file shapes',
    command: 'node',
    args: ['scripts/verify-seo-signal-files.mjs', '--input', signalDir, '--out', path.join(cacheDir, 'seo-signal-files-verification.json')],
    blocking: false
  },
  {
    id: 'analyze-production-signals',
    label: 'Analyze production signal exports',
    command: 'node',
    args: ['scripts/analyze-production-signals.mjs', '--input', signalDir, '--out', path.join(cacheDir, 'production-signals-summary.json')],
    blocking: false
  },
  {
    id: 'check-seo-change-control',
    label: 'Gate proposed SEO changes against real action candidates',
    command: 'node',
    args: [
      'scripts/check-seo-change-control.mjs',
      '--summary', path.join(cacheDir, 'production-signals-summary.json'),
      '--verification', path.join(cacheDir, 'seo-signal-files-verification.json'),
      '--changes', path.join(cacheDir, 'proposed-seo-changes.json'),
      '--out', path.join(cacheDir, 'seo-change-control-report.json')
    ],
    blocking: true
  },
  {
    id: 'seo-offline-skills',
    label: 'Run local-only outputs for remaining SEO skills without real signal exports',
    command: 'node',
    args: ['scripts/run-seo-offline-skills.mjs', '--cache', cacheDir, '--out', path.join(cacheDir, 'seo-offline-skills-report.json')],
    blocking: true
  },
  {
    id: 'typecheck',
    label: 'Run TypeScript typecheck only',
    command: 'npm',
    args: ['run', 'typecheck'],
    blocking: true
  },
  {
    id: 'validate-site',
    label: 'Run source-level SEO/site validation',
    command: 'node',
    args: ['scripts/validate-site.mjs'],
    blocking: true
  },
  {
    id: 'seo-automation-consistency',
    label: 'Verify SEO automation, CI, privacy ignores, and change-control documentation',
    command: 'node',
    args: ['scripts/check-seo-automation-consistency.mjs', '--out', path.join(cacheDir, 'seo-automation-consistency-report.json')],
    blocking: true
  },
  {
    id: 'audit-production-dependencies',
    label: 'Run production dependency audit',
    command: 'npm',
    args: ['audit', '--omit=dev', '--json'],
    blocking: true,
    outputFile: path.join(cacheDir, 'npm-audit-prod.json')
  },
  {
    id: 'audit-all-dependencies',
    label: 'Run full dependency audit',
    command: 'npm',
    args: ['audit', '--json'],
    blocking: true,
    outputFile: path.join(cacheDir, 'npm-audit-full.json')
  }
];

if (includeProduction) {
  if (!productionBaseUrl) {
    console.error('Missing --base-url for --production mode. Example: --base-url https://stockcut.ymirtool.com');
    process.exit(2);
  }
  commands.push({
    id: 'check-production-seo',
    label: 'Check deployed SEO endpoints, headers, canonical HTML, and redirect samples',
    command: 'node',
    args: ['scripts/check-production-seo.mjs', productionBaseUrl],
    blocking: true,
    outputFile: path.join(cacheDir, 'production-seo-check.json')
  });
}

function runCommand(step) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(step.command, step.args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  });
  const endedAt = new Date().toISOString();
  if (step.outputFile) {
    fs.mkdirSync(path.dirname(step.outputFile), { recursive: true });
    const output = result.stdout && result.stdout.trim() ? result.stdout : result.stderr;
    fs.writeFileSync(step.outputFile, output ?? '');
  }
  return {
    id: step.id,
    label: step.label,
    command: [step.command, ...step.args].join(' '),
    blocking: step.blocking,
    exitCode: result.status ?? 0,
    signal: result.signal ?? null,
    startedAt,
    endedAt,
    stdoutTail: (result.stdout ?? '').split('\n').slice(-20).join('\n').trim(),
    stderrTail: (result.stderr ?? '').split('\n').slice(-20).join('\n').trim(),
    outputFile: step.outputFile ?? null,
    status: (result.status ?? 0) === 0 ? 'passed' : step.blocking ? 'failed' : 'recorded'
  };
}

fs.mkdirSync(cacheDir, { recursive: true });
const reports = [];
for (const step of commands) {
  console.log(`\n[${step.id}] ${step.label}`);
  const report = runCommand(step);
  reports.push(report);
  console.log(`${report.status.toUpperCase()} (${report.exitCode}) ${report.command}`);
  if (report.status === 'failed') break;
}

const blocked = reports.some((report) => report.status === 'failed');
const output = {
  generatedAt: new Date().toISOString(),
  status: blocked ? 'failed' : 'passed',
  policy: {
    skippedCommands: ['npm run build', 'npm test', 'vitest', 'playwright test', 'local Lighthouse'],
    productionCheckRequiresBaseUrl: true,
    signalFilesMayBeMissing: 'Missing signal files are recorded by the verifier and analyzer; they are not treated as build failures unless proposed SEO changes depend on them.',
    allowedCommands: ['npm run typecheck', 'node scripts/validate-site.mjs', 'npm audit --omit=dev --json', 'npm audit --json', 'npm run seo:verify-signals', 'npm run seo:analyze-signals', 'npm run seo:change-control', 'npm run seo:automation-check', 'npm run seo:archive-run', 'npm run seo:offline-skills', 'npm run seo:drift-baseline', 'npm run seo:drift-compare']
  },
  inputs: { signalDir, cacheDir, productionBaseUrl: productionBaseUrl || null, includeProduction },
  reports
};
fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nSEO local gates ${output.status}. Report: ${outFile}`);
if (blocked) process.exitCode = 1;
