import type { DisplayUnit, LinearOptimizationResult, LinearProjectInput, OptimizedLinearStock, OptimizedSheet, SheetOptimizationResult, SheetProjectInput } from '@/core/types';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';

interface PdfPage {
  commands: string[];
}

const PAGE_W = 612;
const PAGE_H = 792;
const M = 42;

function escapePdfText(text: string): string {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function disclaimer(): string {
  return 'Planning tool only. Verify dimensions, kerf, material edges, grain direction, machine setup, and shop safety before cutting. StockCut does not guarantee a mathematically optimal or professionally reviewed fabrication plan.';
}

function wrapText(text: string, maxChars = 92): string[] {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function text(page: PdfPage, x: number, y: number, value: string, size = 10, bold = false): void {
  const font = bold ? 'F2' : 'F1';
  page.commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(value)}) Tj ET`);
}

function multiline(page: PdfPage, x: number, y: number, value: string, size = 9, maxChars = 88): number {
  let cursor = y;
  for (const line of wrapText(value, maxChars)) {
    text(page, x, cursor, line, size);
    cursor -= size + 4;
  }
  return cursor;
}

function rect(page: PdfPage, x: number, y: number, w: number, h: number, fillRgb: [number, number, number], strokeRgb: [number, number, number], strokeWidth = 0.7): void {
  const [fr, fg, fb] = fillRgb.map((v) => v / 255);
  const [sr, sg, sb] = strokeRgb.map((v) => v / 255);
  page.commands.push(`${fr.toFixed(3)} ${fg.toFixed(3)} ${fb.toFixed(3)} rg ${sr.toFixed(3)} ${sg.toFixed(3)} ${sb.toFixed(3)} RG ${strokeWidth.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re B`);
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, rgb: [number, number, number] = [116, 79, 42], width = 1): void {
  const [r, g, b] = rgb.map((v) => v / 255);
  page.commands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function buildPdf(pages: PdfPage[], filename: string): void {
  const objects: string[] = [];
  const pageIds: number[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  for (const page of pages) {
    const content = page.commands.join('\n');
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  for (const id of pageIds) objects[id - 1] = objects[id - 1].replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function drawHeader(page: PdfPage, title: string, subtitle: string): void {
  text(page, M, PAGE_H - M, title, 17, true);
  text(page, M, PAGE_H - M - 18, subtitle, 9);
}

function drawSheetLayout(page: PdfPage, sheet: OptimizedSheet, unit: DisplayUnit, topY: number): number {
  const boxW = PAGE_W - M * 2;
  const boxH = 410;
  const scale = Math.min(boxW / sheet.widthUm, boxH / sheet.heightUm);
  const drawW = sheet.widthUm * scale;
  const drawH = sheet.heightUm * scale;
  const originX = M + (boxW - drawW) / 2;
  const originY = topY - drawH;
  rect(page, originX, originY, drawW, drawH, [255, 250, 242], [75, 55, 40], 1.1);
  for (const offcut of sheet.offcuts.slice(0, 80)) {
    rect(page, originX + offcut.xUm * scale, originY + (sheet.heightUm - offcut.yUm - offcut.heightUm) * scale, Math.max(0.4, offcut.widthUm * scale), Math.max(0.4, offcut.heightUm * scale), [238, 229, 216], [216, 199, 182], 0.35);
  }
  for (const part of sheet.placements) {
    const x = originX + part.xUm * scale;
    const y = originY + (sheet.heightUm - part.yUm - part.heightUm) * scale;
    const w = Math.max(0.6, part.widthUm * scale);
    const h = Math.max(0.6, part.heightUm * scale);
    rect(page, x, y, w, h, [217, 233, 216], [47, 108, 70], 0.55);
    if (part.edgeBanding?.top) line(page, x, y + h, x + w, y + h);
    if (part.edgeBanding?.right) line(page, x + w, y, x + w, y + h);
    if (part.edgeBanding?.bottom) line(page, x, y, x + w, y);
    if (part.edgeBanding?.left) line(page, x, y, x, y + h);
    const label = `${part.partLabel} #${part.instanceIndex}${part.rotated ? ' R' : ''}${part.grainLock && part.grainLock !== 'none' ? ' G' : ''}`;
    if (w > 26 && h > 12) text(page, x + 3, y + h / 2 - 3, label.slice(0, 34), 6, true);
  }
  text(page, originX, originY - 14, `Offcuts are shaded. Kerf is spacing between placed rectangles. Sheet size: ${formatDimension(sheet.widthUm, unit)} x ${formatDimension(sheet.heightUm, unit)}.`, 7);
  return originY - 28;
}

function drawLinearLayout(page: PdfPage, stock: OptimizedLinearStock, unit: DisplayUnit, topY: number): number {
  const boxW = PAGE_W - M * 2;
  const barH = 42;
  const originX = M;
  const originY = topY - barH;
  rect(page, originX, originY, boxW, barH, [255, 250, 242], [75, 55, 40], 1);
  const scale = boxW / stock.usableLengthUm;
  for (const cut of stock.cuts) {
    const x = originX + cut.startUm * scale;
    const w = Math.max(1, cut.lengthUm * scale);
    rect(page, x, originY, w, barH, [217, 233, 216], [47, 108, 70], 0.55);
    if (w > 30) text(page, x + 3, originY + 18, `${cut.partLabel} #${cut.instanceIndex}`.slice(0, 34), 6, true);
  }
  const wasteX = originX + (stock.usedLengthUm * scale);
  const wasteW = Math.max(0, (stock.usableLengthUm - stock.usedLengthUm) * scale);
  if (wasteW > 1) rect(page, wasteX, originY, wasteW, barH, [238, 229, 216], [216, 199, 182], 0.35);
  text(page, M, originY - 14, `Offcut: ${formatDimension(stock.wasteLengthUm, unit)} | Kerf cuts: ${stock.kerfCount} | Used: ${formatDimension(stock.usedLengthUm, unit)} of ${formatDimension(stock.usableLengthUm, unit)}.`, 7);
  return originY - 28;
}

export async function downloadSheetPdf(project: SheetProjectInput, result: SheetOptimizationResult): Promise<void> {
  const unit: DisplayUnit = project.unit;
  const pages: PdfPage[] = [];
  const summary: PdfPage = { commands: [] };
  drawHeader(summary, 'StockCut Sheet Cutting Plan', `Date: ${today()} | Unit: ${unit} | Kerf: ${project.kerf} | Strategy: ${project.strategy ?? 'least_waste'}`);
  let y = PAGE_H - M - 46;
  y = multiline(summary, M, y, `Sheets used: ${result.sheetsUsed.length} | Yield: ${formatPercent(result.yieldRate)} | Waste: ${formatPercent(result.wasteRate)} | Estimated stock cost: ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`, 10);
  y = multiline(summary, M, y - 6, `Algorithm: ${result.algorithm}`, 9);
  text(summary, M, y - 6, 'Warnings', 11, true);
  y -= 22;
  const warnings = result.warnings.length ? result.warnings.map((w) => w.message) : ['None'];
  for (const warning of warnings.slice(0, 16)) y = multiline(summary, M + 12, y, `- ${warning}`, 8, 92);
  text(summary, M, y - 10, 'Disclaimer', 11, true);
  multiline(summary, M, y - 26, disclaimer(), 8, 92);
  pages.push(summary);

  for (const sheet of result.sheetsUsed) {
    const page: PdfPage = { commands: [] };
    drawHeader(page, `Sheet ${sheet.sheetIndex}: ${sheet.stockLabel}${sheet.isOffcut ? ' (offcut)' : ''}`, `${formatDimension(sheet.widthUm, unit)} x ${formatDimension(sheet.heightUm, unit)} | Usable ${formatDimension(sheet.usableWidthUm, unit)} x ${formatDimension(sheet.usableHeightUm, unit)} | Material: ${sheet.material ?? 'not set'}`);
    let cursor = drawSheetLayout(page, sheet, unit, PAGE_H - 92);
    text(page, M, cursor, 'Part list and cut sequence', 10, true);
    cursor -= 14;
    sheet.placements.slice().sort((a, b) => a.yUm - b.yUm || a.xUm - b.xUm).slice(0, 22).forEach((p, index) => {
      text(page, M, cursor, `${index + 1}. ${p.partLabel} #${p.instanceIndex}: ${formatDimension(p.widthUm, unit)} x ${formatDimension(p.heightUm, unit)} at ${formatDimension(p.xUm, unit)}, ${formatDimension(p.yUm, unit)}${p.rotated ? ' rotated' : ''}`, 7);
      cursor -= 10;
    });
    if (sheet.offcuts.length) {
      text(page, M, cursor - 4, 'Largest offcuts', 9, true);
      cursor -= 18;
      sheet.offcuts.slice().sort((a, b) => b.areaUm2 - a.areaUm2).slice(0, 8).forEach((o, index) => {
        text(page, M, cursor, `${index + 1}. ${formatDimension(o.widthUm, unit)} x ${formatDimension(o.heightUm, unit)} at ${formatDimension(o.xUm, unit)}, ${formatDimension(o.yUm, unit)}`, 7);
        cursor -= 9;
      });
    }
    text(page, M, 38, 'Planning tool only. Verify every dimension, kerf, grain direction, edge trim, and machine setup before cutting.', 7);
    pages.push(page);
  }
  if (result.unplacedParts.length) {
    const page: PdfPage = { commands: [] };
    drawHeader(page, 'Unplaced parts', 'Review before cutting');
    let cursor = PAGE_H - 92;
    result.unplacedParts.forEach((part) => { cursor = multiline(page, M, cursor, `- ${part.label}: ${part.reason}`, 9); });
    pages.push(page);
  }
  buildPdf(pages, `stockcut-sheet-plan-${today()}.pdf`);
}

export async function downloadLinearPdf(project: LinearProjectInput, result: LinearOptimizationResult): Promise<void> {
  const unit: DisplayUnit = project.unit;
  const pages: PdfPage[] = [];
  const summary: PdfPage = { commands: [] };
  drawHeader(summary, 'StockCut Linear Cutting Plan', `Date: ${today()} | Unit: ${unit} | Kerf: ${project.kerf} | Strategy: ${project.strategy ?? 'least_waste'}`);
  let y = PAGE_H - M - 46;
  y = multiline(summary, M, y, `Stocks used: ${result.stocksUsed.length} | Waste: ${formatPercent(result.wasteRate)} | Kerf loss: ${formatDimension(result.totalKerfLossUm, unit)} | Estimated stock cost: ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`, 10);
  y = multiline(summary, M, y - 6, `Algorithm: ${result.algorithm}`, 9);
  text(summary, M, y - 6, 'Warnings', 11, true);
  y -= 22;
  const warnings = result.warnings.length ? result.warnings.map((w) => w.message) : ['None'];
  for (const warning of warnings.slice(0, 16)) y = multiline(summary, M + 12, y, `- ${warning}`, 8, 92);
  text(summary, M, y - 10, 'Disclaimer', 11, true);
  multiline(summary, M, y - 26, disclaimer(), 8, 92);
  pages.push(summary);

  for (const stock of result.stocksUsed) {
    const page: PdfPage = { commands: [] };
    drawHeader(page, `Stock ${stock.stockIndex}: ${stock.stockLabel}${stock.isOffcut ? ' (offcut)' : ''}`, `${formatDimension(stock.lengthUm, unit)} | Usable ${formatDimension(stock.usableLengthUm, unit)} | Used ${formatDimension(stock.usedLengthUm, unit)} | Offcut ${formatDimension(stock.wasteLengthUm, unit)}`);
    let cursor = drawLinearLayout(page, stock, unit, PAGE_H - 112);
    text(page, M, cursor, 'Cut sequence', 10, true);
    cursor -= 16;
    stock.cuts.slice(0, 42).forEach((cut, index) => {
      text(page, M, cursor, `${index + 1}. ${cut.partLabel} #${cut.instanceIndex}: ${formatDimension(cut.lengthUm, unit)} starting at ${formatDimension(cut.startUm, unit)}${cut.miterAngle ? ` | angle ${cut.miterAngle}` : ''}${cut.notes ? ` | ${cut.notes}` : ''}`, 8);
      cursor -= 11;
    });
    text(page, M, 38, 'Planning tool only. Verify every dimension, kerf, trim, material, and machine setup before cutting.', 7);
    pages.push(page);
  }
  if (result.unplacedCuts.length) {
    const page: PdfPage = { commands: [] };
    drawHeader(page, 'Unplaced cuts', 'Review before cutting');
    let cursor = PAGE_H - 92;
    result.unplacedCuts.forEach((cut) => { cursor = multiline(page, M, cursor, `- ${cut.label}: ${cut.reason}`, 9); });
    pages.push(page);
  }
  buildPdf(pages, `stockcut-linear-plan-${today()}.pdf`);
}
