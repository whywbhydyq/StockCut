#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const summaryFile = readArg('--summary', '.seo-cache/production-signals-summary.json');
const verificationFile = readArg('--verification', '.seo-cache/seo-signal-files-verification.json');
const changesFile = readArg('--changes', '.seo-cache/proposed-seo-changes.json');
const outFile = readArg('--out', '.seo-cache/seo-change-control-report.json');

const actionRequirements = {
  'rewrite-title-description': ['gsc-query-export', 'gsc-page-export'],
  'strengthen-internal-links': ['gsc-query-export', 'gsc-page-export'],
  'add-visible-evidence': ['gsc-query-export'],
  'fix-schema-rendering': ['rich-results', 'production-crawl'],
  'investigate-performance': ['pagespeed-mobile', 'pagespeed-desktop'],
  'enforce-csp': ['csp-report-only', 'production-crawl'],
  'request-indexing': ['production-crawl', 'gsc-page-export'],
  'keep-csp-report-only': [],
  'no-change': []
};

function safeReadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function toChangeArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.changes)) return value.changes;
  if (value && Array.isArray(value.proposedChanges)) return value.proposedChanges;
  return [];
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function candidateMatches(change, candidate) {
  const actionMatch = normalizeText(change.action) === normalizeText(candidate.action);
  if (!actionMatch) return false;
  const changeUrl = normalizeText(change.url ?? change.page ?? change.slug);
  const candidateText = normalizeText(`${candidate.label ?? ''} ${candidate.source ?? ''} ${candidate.decisionGate ?? ''} ${JSON.stringify(candidate.evidence ?? {})}`);
  const label = normalizeText(change.candidateLabel ?? change.label ?? '');
  const gate = normalizeText(change.decisionGate ?? '');
  return (!label || candidateText.includes(label)) && (!gate || normalizeText(candidate.decisionGate).includes(gate)) && (!changeUrl || candidateText.includes(changeUrl));
}

const summary = safeReadJson(summaryFile, null);
const verification = safeReadJson(verificationFile, null);
const changesRaw = fs.existsSync(changesFile) ? safeReadJson(changesFile, []) : [];
const proposedChanges = toChangeArray(changesRaw);
const candidates = Array.isArray(summary?.optimizationActionCandidates) ? summary.optimizationActionCandidates : [];
const validSources = new Set((verification?.checks ?? []).filter((check) => check.status === 'valid-shape').map((check) => check.id));

const reports = proposedChanges.map((change, index) => {
  const action = change.action;
  const requiredSources = actionRequirements[action] ?? [];
  const missingEvidenceSources = requiredSources.filter((source) => !validSources.has(source));
  const matchingCandidate = candidates.find((candidate) => candidateMatches(change, candidate));
  const missingFields = ['action', 'decisionGate', 'sourceEvidence', 'filesChanged', 'reviewerNote'].filter((field) => change[field] == null || (Array.isArray(change[field]) && change[field].length === 0) || String(change[field]).trim() === '');
  const status = missingFields.length === 0 && missingEvidenceSources.length === 0 && matchingCandidate ? 'accepted' : 'blocked';
  return {
    index,
    action,
    url: change.url ?? change.page ?? change.slug ?? null,
    status,
    matchedCandidate: matchingCandidate ? { action: matchingCandidate.action, label: matchingCandidate.label, source: matchingCandidate.source, decisionGate: matchingCandidate.decisionGate } : null,
    missingFields,
    missingEvidenceSources,
    message: status === 'accepted' ? 'Proposed change has required manifest fields, valid source files, and a matching optimizationActionCandidate.' : 'Proposed change is blocked until manifest fields, evidence files, and matching optimizationActionCandidate are present.'
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  inputs: { summaryFile, verificationFile, changesFile },
  status: proposedChanges.length === 0 ? 'no-proposed-changes' : reports.some((report) => report.status === 'blocked') ? 'blocked' : 'accepted',
  summaryAvailable: Boolean(summary),
  verificationAvailable: Boolean(verification),
  optimizationActionCandidateCount: candidates.length,
  proposedChangeCount: proposedChanges.length,
  acceptedChangeCount: reports.filter((report) => report.status === 'accepted').length,
  blockedChangeCount: reports.filter((report) => report.status === 'blocked').length,
  reports,
  noChangePolicy: 'No proposed SEO changes means metadata, internal links, schema, performance, indexing, and CSP remain unchanged. This is valid when production signals are missing or inconclusive.'
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (output.status === 'blocked') process.exitCode = 1;
