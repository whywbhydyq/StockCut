#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const outFile = readArg('--out', '.seo-cache/proposed-seo-changes.json');
const action = readArg('--action', 'rewrite-title-description');
const url = readArg('--url', 'https://stockcut.ymirtool.com/sheet-cutting-optimizer');
const decisionGate = readArg('--decision-gate', 'metadata-rewrite-gate');
const candidateLabel = readArg('--candidate-label', 'paste candidate label from production-signals-summary.json');
const reviewerNote = readArg('--reviewer-note', 'Explain why this proposed change is supported by a matching optimizationActionCandidate.');

const template = {
  generatedAt: new Date().toISOString(),
  instructions: [
    'Keep this file local in .seo-cache unless the team intentionally wants to review the manifest in git.',
    'Do not add proposed changes unless scripts/analyze-production-signals.mjs produced matching optimizationActionCandidates from real production exports.',
    'Run npm run seo:local-gates before shipping SEO metadata, visible content, internal-link, schema, performance, indexing, or CSP changes.'
  ],
  changes: [
    {
      action,
      url,
      decisionGate,
      candidateLabel,
      sourceEvidence: [
        '.seo-cache/seo-signal-files-verification.json',
        '.seo-cache/production-signals-summary.json'
      ],
      filesChanged: [
        'src/data/pages.ts'
      ],
      reviewerNote
    }
  ]
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(template, null, 2)}\n`);
console.log(JSON.stringify({ status: 'created', outFile, action, url, decisionGate }, null, 2));
