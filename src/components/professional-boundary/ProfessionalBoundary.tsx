import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export function ProfessionalBoundary({ variant = 'full' }: { variant?: 'short' | 'full' }) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
      <strong>Boundary:</strong> {variant === 'short' ? 'Preliminary educational estimate only; not professional HVAC design.' : PROFESSIONAL_BOUNDARY}
    </div>
  );
}
