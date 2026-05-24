import type { DisplayUnit, OptimizedLinearStock } from '@/core/types';
import { formatDimension } from '@/core/units/formatDimension';

export function LinearLayoutBar({ stock, unit }: { stock: OptimizedLinearStock; unit: DisplayUnit }) {
  return (
    <div className="print-safe my-4 rounded-2xl border border-stock-line bg-white p-4">
      <h3 className="font-bold">Stock {stock.stockIndex}: {stock.stockLabel}{stock.isOffcut ? ' (offcut)' : ''}</h3>
      <p className="text-xs text-stock-muted">Usable {formatDimension(stock.usableLengthUm, unit)}{stock.material ? ` · ${stock.material}` : ''}{stock.stockCost ? ` · stock cost $${stock.stockCost.toFixed(2)}` : ''}</p>
      <div className="relative mt-3 h-16 overflow-hidden rounded-xl border border-stock-line bg-[#f0e6d8]">
        {stock.cuts.map((cut, index) => <div key={`${cut.partId}-${cut.instanceIndex}-${index}`} className="absolute top-0 grid h-full place-items-center border-x border-stock-ok bg-[#d9e9d8] text-xs font-bold" style={{ left: `${(cut.startUm / stock.usableLengthUm) * 100}%`, width: `${(cut.lengthUm / stock.usableLengthUm) * 100}%` }}>{cut.partLabel}</div>)}
      </div>
      <p className="mt-2 text-sm text-stock-muted">Used {formatDimension(stock.usedLengthUm, unit)} · offcut {formatDimension(stock.wasteLengthUm, unit)} · kerf cuts {stock.kerfCount}</p>
    </div>
  );
}
