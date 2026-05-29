'use client';

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement } from 'react';
import type { DisplayUnit, EdgeBanding, OptimizedSheet, SheetPlacement } from '@/core/types';
import { formatDimension } from '@/core/units/formatDimension';
import { manuallyMoveSheetPlacement, rotateSheetPlacement } from '@/core/sheet-optimizer/manualAdjust';

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

function keyFor(part: Pick<SheetPlacement, 'partId' | 'instanceIndex'>): string {
  return `${part.partId}:${part.instanceIndex}`;
}

function selectedPlacement(sheet: OptimizedSheet, selectedKey: string | null): SheetPlacement | null {
  if (!selectedKey) return null;
  return sheet.placements.find((part) => keyFor(part) === selectedKey) ?? null;
}

export function SheetLayoutSvg({ sheet, unit, onSheetChange }: { sheet: OptimizedSheet; unit: DisplayUnit; onSheetChange?: (sheet: OptimizedSheet) => void }) {
  const [zoom, setZoom] = useState(100);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ xUm: number; yUm: number } | null>(null);
  const [manualMessage, setManualMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const selected = useMemo(() => selectedPlacement(sheet, selectedKey), [sheet, selectedKey]);

  const serializedSvg = () => svgRef.current ? new XMLSerializer().serializeToString(svgRef.current) : '';
  const pointerToSheet = (event: ReactPointerEvent<Element>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const transformed = point.matrixTransform(matrix.inverse());
    return { xUm: transformed.x, yUm: transformed.y };
  };
  const applyManualMove = (key: string, xUm: number, yUm: number) => {
    if (!onSheetChange) return;
    const result = manuallyMoveSheetPlacement(sheet, key, xUm, yUm);
    if (result.ok) {
      onSheetChange(result.sheet);
      setManualMessage('Manual adjustment applied. Offcut regions were recalculated from the edited layout. Re-optimize to restore the generated cut order.');
    } else {
      setManualMessage(result.message ?? 'Manual move blocked.');
    }
  };
  const downloadSvg = () => {
    const source = serializedSvg();
    if (!source) return;
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockcut-sheet-${sheet.sheetIndex}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const downloadPng = () => {
    const source = serializedSvg();
    if (!source) return;
    const image = new Image();
    const svgUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1200, Math.round(sheet.widthUm / Math.max(sheet.widthUm, sheet.heightUm) * 1800));
      canvas.height = Math.max(900, Math.round(sheet.heightUm / Math.max(sheet.widthUm, sheet.heightUm) * 1800));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `stockcut-sheet-${sheet.sheetIndex}.png`;
      link.click();
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  };
  const rotateSelected = () => {
    if (!selectedKey || !onSheetChange) return;
    const result = rotateSheetPlacement(sheet, selectedKey);
    if (result.ok) {
      onSheetChange(result.sheet);
      setManualMessage('Selected part rotated. Offcuts were recalculated from the edited layout.');
    } else {
      setManualMessage(result.message ?? 'Rotation blocked.');
    }
  };
  const nudgeSelected = (dx: number, dy: number) => {
    if (!selected || !selectedKey) return;
    applyManualMove(selectedKey, selected.xUm + dx, selected.yUm + dy);
  };
  const labelSize = Math.max(Math.min(sheet.widthUm, sheet.heightUm) / 28, 60000);
  const stroke = Math.max(sheet.widthUm, sheet.heightUm) / 700;
  const nudgeStep = unit === 'mm' ? 10_000_000 : 12_700_000;
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
          {onSheetChange && <button className={manualMode ? 'bg-[#2f6c46] px-3 py-1 text-white' : 'bg-[#eee5d8] px-3 py-1 text-stock-ink'} onClick={() => { setManualMode((value) => !value); setManualMessage(null); }}>Manual adjust</button>}
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={downloadSvg}>Download SVG</button>
          <button className="bg-[#eee5d8] px-3 py-1 text-stock-ink" onClick={downloadPng}>Download PNG</button>
        </div>
      </div>
      {manualMode && <div className="no-print mb-3 rounded-2xl border border-[#c7b49d] bg-white p-3 text-xs text-stock-muted">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p><strong className="text-stock-ink">Manual layout adjustment:</strong> select a part, drag it inside the usable sheet area, or use nudges. Moves that overlap another part are blocked.</p>
          <div className="grid grid-cols-3 gap-1 md:w-48">
            <span />
            <button className="bg-[#eee5d8] px-2 py-1 text-stock-ink" disabled={!selected} onClick={() => nudgeSelected(0, -nudgeStep)}>↑</button>
            <span />
            <button className="bg-[#eee5d8] px-2 py-1 text-stock-ink" disabled={!selected} onClick={() => nudgeSelected(-nudgeStep, 0)}>←</button>
            <button className="bg-[#eee5d8] px-2 py-1 text-stock-ink" disabled={!selected} onClick={rotateSelected}>Rotate</button>
            <button className="bg-[#eee5d8] px-2 py-1 text-stock-ink" disabled={!selected} onClick={() => nudgeSelected(nudgeStep, 0)}>→</button>
            <span />
            <button className="bg-[#eee5d8] px-2 py-1 text-stock-ink" disabled={!selected} onClick={() => nudgeSelected(0, nudgeStep)}>↓</button>
            <span />
          </div>
        </div>
        {selected && <p className="mt-2">Selected: <strong>{selected.partLabel} #{selected.instanceIndex}</strong> at {formatDimension(selected.xUm, unit)}, {formatDimension(selected.yUm, unit)}.</p>}
        {manualMessage && <p className="mt-2 text-stock-warn">{manualMessage}</p>}
      </div>}
      <div className="overflow-auto rounded-2xl border border-stock-line bg-white p-2">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${sheet.widthUm} ${sheet.heightUm}`}
          style={{ width: `${zoom}%` }}
          className="h-auto min-w-full rounded-xl bg-white"
          role="img"
          aria-label={`Cutting layout for sheet ${sheet.sheetIndex}`}
          onPointerMove={(event) => {
            if (!manualMode || !dragKey || !dragOffset) return;
            const point = pointerToSheet(event);
            if (!point) return;
            applyManualMove(dragKey, point.xUm - dragOffset.xUm, point.yUm - dragOffset.yUm);
          }}
          onPointerUp={(event) => { if (dragKey) event.currentTarget.releasePointerCapture(event.pointerId); setDragKey(null); setDragOffset(null); }}
          onPointerLeave={() => { setDragKey(null); setDragOffset(null); }}
        >
          <rect width={sheet.widthUm} height={sheet.heightUm} fill="#fffaf2" stroke="#4b3728" strokeWidth={Math.max(sheet.widthUm, sheet.heightUm) / 450} />
          <rect x={sheet.usableXUm} y={sheet.usableYUm} width={sheet.usableWidthUm} height={sheet.usableHeightUm} fill="none" stroke="#b08968" strokeDasharray={Math.max(sheet.widthUm, sheet.heightUm) / 180} strokeWidth={Math.max(sheet.widthUm, sheet.heightUm) / 900} />
          {sheet.offcuts.slice(0, 60).map((offcut, index) => <rect key={`offcut-${index}`} x={offcut.xUm} y={offcut.yUm} width={offcut.widthUm} height={offcut.heightUm} fill="#eee5d8" stroke="#d8c7b6" strokeWidth={Math.max(sheet.widthUm, sheet.heightUm) / 900} />)}
          {sheet.placements.map((part, index) => {
            const partKey = keyFor(part);
            const isSelected = selectedKey === partKey;
            return (
              <g key={`${part.partId}-${part.instanceIndex}-${index}`} onPointerDown={(event) => {
                if (!manualMode) return;
                event.stopPropagation();
                const point = pointerToSheet(event);
                setSelectedKey(partKey);
                if (point) {
                  setDragKey(partKey);
                  setDragOffset({ xUm: point.xUm - part.xUm, yUm: point.yUm - part.yUm });
                  svgRef.current?.setPointerCapture(event.pointerId);
                }
              }} className={manualMode ? 'cursor-move' : undefined}>
                <rect x={part.xUm} y={part.yUm} width={part.widthUm} height={part.heightUm} fill="#d9e9d8" stroke={isSelected ? '#8a4f22' : '#2f6c46'} strokeWidth={isSelected ? stroke * 2.4 : stroke} />
                {edgeLines(part, stroke)}
                <text x={part.xUm + part.widthUm / 2} y={part.yUm + part.heightUm / 2} textAnchor="middle" dominantBaseline="middle" fontSize={labelSize} fontWeight="800" fill="#173d27">{part.partLabel} #{part.instanceIndex}{part.rotated ? ' R' : ''}{part.grainLock && part.grainLock !== 'none' ? ' G' : ''}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-stock-muted">Offcut areas are shaded. Kerf is represented as spacing between placed rectangles. Brown strokes mark edge banding sides when selected. Manual edits are planning adjustments; verify cut order before cutting.</p>
    </div>
  );
}
