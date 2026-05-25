import type { SheetOptimizationResult } from '@/core/types';

function line(x1: number, y1: number, x2: number, y2: number, layer = 'CUT'): string {
  return `0\nLINE\n8\n${layer}\n10\n${x1}\n20\n${y1}\n30\n0\n11\n${x2}\n21\n${y2}\n31\n0\n`;
}

function text(value: string, x: number, y: number, height: number): string {
  return `0\nTEXT\n8\nLABELS\n10\n${x}\n20\n${y}\n30\n0\n40\n${height}\n1\n${value.replace(/[\r\n]/g, ' ').slice(0, 80)}\n`;
}

function rectangle(x: number, y: number, w: number, h: number, layer = 'CUT'): string {
  return line(x, y, x + w, y, layer) + line(x + w, y, x + w, y + h, layer) + line(x + w, y + h, x, y + h, layer) + line(x, y + h, x, y, layer);
}

export function sheetResultToDxf(result: SheetOptimizationResult): string {
  const gap = 250000;
  let offsetX = 0;
  let body = '0\nSECTION\n2\nENTITIES\n';
  for (const sheet of result.sheetsUsed) {
    body += rectangle(offsetX, 0, sheet.widthUm, sheet.heightUm, 'SHEET');
    body += text(`Sheet ${sheet.sheetIndex}: ${sheet.stockLabel}. Planning DXF only; not CNC toolpath or G-code.`, offsetX + 10000, -80000, 60000);
    for (const part of sheet.placements) {
      body += rectangle(offsetX + part.xUm, part.yUm, part.widthUm, part.heightUm, 'PARTS');
      body += text(`${part.partLabel} #${part.instanceIndex}${part.rotated ? ' R' : ''}`, offsetX + part.xUm + 10000, part.yUm + part.heightUm / 2, Math.max(45000, Math.min(part.widthUm, part.heightUm) / 8));
    }
    for (const offcut of sheet.offcuts.slice(0, 40)) body += rectangle(offsetX + offcut.xUm, offcut.yUm, offcut.widthUm, offcut.heightUm, 'OFFCUTS');
    offsetX += sheet.widthUm + gap;
  }
  return `${body}0\nENDSEC\n0\nEOF\n`;
}

export function downloadSheetDxf(result: SheetOptimizationResult): void {
  const dxf = sheetResultToDxf(result);
  const url = URL.createObjectURL(new Blob([dxf], { type: 'application/dxf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stockcut-rectangular-layout-planning.dxf';
  link.click();
  URL.revokeObjectURL(url);
}
