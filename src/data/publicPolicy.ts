export const internalHumanRoutes = [
  '/seo-quality',
  '/seo-release-checklist',
  '/seo-production-signals',
  '/seo-optimization-decisions',
  '/seo-evidence-ledger',
  '/seo-change-control'
] as const;

export const internalMachineRoutes = [
  '/canonical-map.json',
  '/change-control.json',
  '/content-drift.json',
  '/content-inventory.json',
  '/csp-readiness.json',
  '/evidence-ledger.json',
  '/optimization-decisions.json',
  '/production-signals.json',
  '/quality-gates.json',
  '/release-checklist.json',
  '/seo-status.json',
  '/site-index.json'
] as const;

export const adsenseAllowedRoutes = new Set([
  '/',
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/saw-kerf-calculator',
  '/4x8-plywood-cut-list-optimizer',
  '/plywood-cutting-layout-calculator'
]);

export const detailedEvidenceRoutes = new Set([
  '/',
  '/sheet-cutting-optimizer',
  '/linear-cutting-optimizer',
  '/saw-kerf-calculator',
  '/4x8-plywood-cut-list-optimizer'
]);

export function isAdsenseAllowedRoute(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return adsenseAllowedRoutes.has(normalized);
}
