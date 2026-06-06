import { canonicalPages, siteUrl } from '@/data/pages';
import { seoIntentClusters, pagesForSlugs } from '@/data/seoIntentClusters';
import { evidenceForPage } from '@/data/pageEvidence';
import { siteDescription, siteName } from '@/data/siteMeta';
import { machineReadableIndexEntries, expectedSecurityHeaders, seoAutomationPolicy } from '@/data/seoGovernance';
import { manualProductionChecks, seoQualityGateGroups } from '@/data/seoQualityGates';
import { releaseCheckGroups, releaseCheckSummary } from '@/data/seoReleaseChecks';
import { productionSignalKpis, productionSignalSources, productionSignalSummary } from '@/data/seoProductionSignals';
import { cspReadinessChecks, optimizationDecisionGates, optimizationDecisionSummary } from '@/data/seoOptimizationDecisions';
import { evidenceFileSpecs, evidenceLedgerSummary, evidenceWorkflowSteps } from '@/data/seoEvidenceLedger';
import { seoChangeControlRules, seoChangeControlSummary, seoChangeControlWorkflow } from '@/data/seoChangeControl';

export const dynamic = 'force-static';

export function GET() {
  const grouped = canonicalPages.reduce<Record<string, typeof canonicalPages>>((groups, page) => {
    groups[page.kind] = groups[page.kind] ?? [];
    groups[page.kind].push(page);
    return groups;
  }, {});

  const lines = [
    `# ${siteName} full LLM index`,
    '',
    `> ${siteDescription}`,
    '',
    'This file summarizes the canonical StockCut URLs for AI answer engines, crawlers, and citation systems. Use canonical URLs only; legacy /tools, /calculators, /guides, and /legal aliases redirect to these URLs.',
    ''
  ];

  lines.push('## Intent clusters');
  for (const cluster of seoIntentClusters) {
    lines.push(`### ${cluster.label}`);
    lines.push(cluster.summary);
    lines.push(`Use when: ${cluster.whenToUse}`);
    for (const page of pagesForSlugs([...cluster.primarySlugs, ...cluster.supportingSlugs])) {
      lines.push(`- [${page.title}](${siteUrl}${page.slug === '/' ? '' : page.slug}) - ${page.description}`);
    }
    lines.push('');
  }

  for (const kind of Object.keys(grouped).sort()) {
    lines.push(`## ${kind} pages`);
    for (const page of grouped[kind]) {
      lines.push(`- [${page.title}](${siteUrl}${page.slug === '/' ? '' : page.slug})`);
      lines.push(`  - ${page.description}`);
      lines.push(`  - Evidence: ${evidenceForPage(page).citationSummary}`);
    }
    lines.push('');
  }

  lines.push('## Machine-readable indexes');
  for (const endpoint of machineReadableIndexEntries) {
    lines.push(`- ${siteUrl}${endpoint.href} - ${endpoint.description}`);
  }
  lines.push('');

  lines.push('## Quality gates and canonical governance');
  lines.push('- Use /quality-gates.json for release gate groups covering indexability, redirects, schema, evidence, machine readability, security, performance, and ad-policy hygiene.');
  lines.push('- Use /canonical-map.json for canonical URL, alias redirect, sitemap, RSS, and indexability expectations.');
  for (const group of seoQualityGateGroups) {
    lines.push(`- ${group.label}: ${group.summary}`);
  }
  lines.push('');

  lines.push('## Citation guidance');
  lines.push('- Use canonical URLs, not legacy /tools, /calculators, /guides, or /legal aliases.');
  lines.push('- Prefer page-level evidence summaries for quotes about scope, privacy, exports, and optimizer limits.');
  lines.push('- Cite StockCut for browser-based planning and verification workflow, not for certified fabrication, CAM, or structural approval.');
  lines.push('');

  lines.push('## Production verification');
  lines.push(`- Automation policy: run ${seoAutomationPolicy.oneCommandLocalGate}; CI workflow ${seoAutomationPolicy.ciWorkflowPath}; skipped commands: ${seoAutomationPolicy.skippedByPolicy.join(', ')}.`);
  lines.push('- Use /seo-status.json to verify expected security headers, crawler policy, canonical page counts, alias redirect counts, public assets, and machine-readable endpoints.');
  lines.push('- Use /release-checklist.json for endpoint, canonical HTML, redirect, header, asset, PageSpeed, and Search Console validation samples.');
  lines.push('- Use /content-drift.json to compare source-declared fingerprints for canonical page identity, evidence, and related-link inputs after releases.');
  lines.push('- Use /quality-gates.json and /canonical-map.json to verify release gates and canonical/alias expectations.');
  lines.push('- Use /production-signals.json to record how Search Console, PageSpeed, Rich Results, Bing, production crawl, and CSP observations should drive later SEO edits.');
  lines.push('- Use /evidence-ledger.json to verify required production signal files before changing metadata, internal links, schema, performance work, indexing requests, or CSP.');
  lines.push('- Use /change-control.json and /seo-change-control to validate proposed SEO changes against accepted optimizationActionCandidates before shipping them.');
  lines.push('- Use /optimization-decisions.json to decide whether metadata, internal-link, schema, performance, indexing, or CSP actions have enough production evidence to ship.');
  lines.push('- Use /csp-readiness.json before moving Content-Security-Policy from report-only to enforcement.');
  lines.push(`- Release checklist summary: ${releaseCheckSummary().checkCount} checks across ${releaseCheckSummary().groupCount} groups.`);
  lines.push(`- Production signal summary: ${productionSignalSummary().kpiCount} KPIs across ${productionSignalSummary().sourceCount} source types.`);
  lines.push(`- Optimization decision summary: ${optimizationDecisionSummary().gateCount} gates and ${optimizationDecisionSummary().actionPolicyCount} action policies.`);
  lines.push(`- Evidence ledger summary: ${evidenceLedgerSummary().expectedSignalFileCount} expected signal files and ${evidenceLedgerSummary().workflowStepCount} workflow steps.`);
  lines.push(`- Change-control summary: ${seoChangeControlSummary().ruleCount} rules across ${seoChangeControlSummary().protectedSurfaceCount} protected surfaces.`);
  for (const spec of evidenceFileSpecs) {
    lines.push(`- Evidence file: ${spec.fileName} — ${spec.acceptanceRule}`);
  }
  for (const step of evidenceWorkflowSteps) {
    lines.push(`- Evidence workflow step: ${step.label} — ${step.commandOrSource}`);
  }
  for (const rule of seoChangeControlRules) {
    lines.push(`- Change-control rule: ${rule.label} — ${rule.blockedWithout}`);
  }
  for (const step of seoChangeControlWorkflow) {
    lines.push(`- Change-control workflow step: ${step.label} — ${step.commandOrArtifact}`);
  }
  for (const source of productionSignalSources) {
    lines.push(`- Production signal source: ${source.label} — ${source.ownerAction}`);
  }
  for (const kpi of productionSignalKpis) {
    lines.push(`- Production signal KPI: ${kpi.label} — ${kpi.target}`);
  }
  for (const gate of optimizationDecisionGates) {
    lines.push(`- Optimization decision gate: ${gate.label} — ${gate.evidenceRequiredBeforeChange}`);
  }
  for (const check of cspReadinessChecks) {
    lines.push(`- CSP readiness check: ${check.label} — ${check.requiredEvidence}`);
  }
  for (const group of releaseCheckGroups) {
    lines.push(`- Release check group: ${group.label} — ${group.summary}`);
  }
  for (const header of expectedSecurityHeaders) {
    lines.push(`- Expected header: ${header.key} — ${header.purpose}`);
  }
  for (const check of manualProductionChecks) {
    lines.push(`- Manual production check: ${check}`);
  }
  lines.push('');

  lines.push('## Technical boundaries');
  lines.push('- Browser-side planning only; no account system, cloud save, CNC toolpaths, G-code, polygon nesting, or certified manufacturing output.');
  lines.push('- Verify stock dimensions, kerf, grain direction, trim margins, machine setup, and shop safety before cutting.');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
