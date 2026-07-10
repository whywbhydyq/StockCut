import { internalSeoEnabled, internalSeoUnavailable } from '@/lib/internalSeoAccess';
import { siteLastModified, siteName } from '@/data/siteMeta';
import { siteUrl } from '@/data/pages';
import { cspReadinessChecks, cspReadinessSummary, optimizationActionPolicies } from '@/data/seoOptimizationDecisions';

export const dynamic = 'force-static';

export function GET() {
  if (!internalSeoEnabled()) return internalSeoUnavailable();
  const body = {
    name: `${siteName} CSP enforcement readiness`,
    url: `${siteUrl}/csp-readiness.json`,
    lastModified: siteLastModified,
    purpose: 'Machine-readable readiness model for deciding whether StockCut can move Content-Security-Policy from report-only to enforcement after production report observation.',
    status: 'report-only is the safe default until production violations are reviewed after real app, crawler, and AdSense traffic',
    summary: cspReadinessSummary(),
    readinessChecks: cspReadinessChecks,
    allowedActions: optimizationActionPolicies.filter((policy) => policy.action === 'keep-csp-report-only' || policy.action === 'enforce-csp'),
    requiredProductionInputs: ['production crawl headers', 'CSP report-only violation logs', 'AdSense calculator-page observation', 'first-party asset navigation checks'],
    blockedUntil: 'No unexpected first-party, AdSense, frame, image, style, script, or connect violations remain in report-only observations.'
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
