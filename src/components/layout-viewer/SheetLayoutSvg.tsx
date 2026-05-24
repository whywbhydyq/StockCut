'use client';

import { useRef, useState, type ReactElement } from 'react';
import type { DisplayUnit, EdgeBanding, OptimizedSheet, SheetPlacement } from '@/core/types';
import { formatDimension } from '@/core/units/formatDimension';

function edgeLines(part: SheetPlacement, strokeWidth: number) {
  const edge = part.edgeBanding;
  if (!edge) return null;
  const lines: ReactElement[] = [];
  const push = (key: keyof EdgeBanding, x1: number, y1: number, x2: number, y2: number) => {
    if (edge[key]) lines.push(<line key={`${part.partId}-${part.instanceIndex}-${key}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a4f22" strokeWidth={strokeWidth * 2.4} strokeLinecap="round" />);
  };
  push('top', part.xUm, part.yUm, part.xUm + part.widthUm, part.yUm);
  push('right', part.xUm + part.widthUm, part.yUm, part.xUm + part.widthUm, part.yUm + part.heightUm);
  push('bottom', part.xUm, part.yUm + part.heightUm, part.xUm + part.widthUm, part.yUm + part.heightUm);
  push('left', part.xUm, part.yUm, part.xUm, part.yUm + part.heightUm);
  return lines;
}

export function SheetLayoutSvg({ sheet, unit }: { sheet: OptimizedSheet; unit: DisplayUnit }) {
  const [zoom, setZoom] = useState(100);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const downloadSvg = () => {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockcut-sheet-${sheet.sheetIndex}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const labelSize = Math.max(Math.min(sheet.widthUm, sheet.heightUm) / 28, 60000);
  const stroke = Math.max(sheet.widthUm, sheet.heightUm) / 700;
  return (
    <div className="print-safe my-4">
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-bold">Sheet {sheet.sheetIndex}: {sheet.stockLabel}{sheet.isOffcut ? ' (offcut)' : ''}</h3>
          <p className="text-xs text-stock-muted">{formatDimension(sheet.widthUm, unit)} × {formatDimension(sheet.heightUm, unit)}{sheet.material ? ` · ${sheet.material}` : ''}{sheet.stockCost ? ` · stock cost $${sheet.stockCost.toFixed(2)}` : ''}</p>
        </div>
        <div className="no-print flex flex-wrap gap-2 text-xs">
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={() => setZoom((value) => Math.max(50, value - 25))}>Zoom out</button>
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={() => setZoom(100)}>Fit to screen</button>
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={() => setZoom((value) => Math.min(250, value + 25))}>Zoom in</button>
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={downloadSvg}>Download SVG</button>
        </div>
      </div>
      <div className="overflow-auto rounded-2xl border border-stock-line bg-white p-2">
        <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${sheet.widthUm} ${sheet.heightUm}`} style={{ width: `${zoom}%` }} className="h-auto min-w-full rounded-xl bg-white" role="img" aria-label={`Cutting layout for sheet ${sheet.sheetIndex}`}>
          <rect width={sheet.widthUm} height={sheet.heightUm} fill="#fffaf2" stroke="#4b3728" strokeWidth={Math.max(sheet.widthUm, sheet.heightUm) / 450} />
          {sheet.offcuts.slice(0, 60).map((offcut, index) => <rect key={`offcut-${index}`} x={offcut.xUm} y={offcut.yUm} width={offcut.widthUm} height={offcut.heightUm} fill="#eee5d8" stroke="#d8c7b6" strokeWidth={Math.max(sheet.widthUm, sheet.heightUm) / 900} />)}
          {sheet.placements.map((part, index) => (
            <g key={`${part.partId}-${part.instanceIndex}-${index}`}>
              <rect x={part.xUm} y={part.yUm} width={part.widthUm} height={part.heightUm} fill="#d9e9d8" stroke="#2f6c46" strokeWidth={stroke} />
              {edgeLines(part, stroke)}
              <text x={part.xUm + part.widthUm / 2} y={part.yUm + part.heightUm / 2} textAnchor="middle" dominantBaseline="middle" fontSize={labelSize} fontWeight="800" fill="#173d27">{part.partLabel} #{part.instanceIndex}{part.rotated ? ' R' : ''}{part.grainLock && part.grainLock !== 'none' ? ' G' : ''}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-xs text-stock-muted">Offcut areas are shaded. Kerf is represented as spacing between placed rectangles. Brown strokes mark edge banding sides when selected.</p>
    </div>
  );
}
