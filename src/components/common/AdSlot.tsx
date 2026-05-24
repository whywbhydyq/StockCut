export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return <div className="ad-slot my-6 grid min-h-28 place-items-center rounded-2xl border border-dashed border-stock-line bg-white/50 text-sm text-stock-muted">{label}</div>;
}
