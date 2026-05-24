import type { DisplayUnit, LinearOptimizationResult, LinearProjectInput, SheetOptimizationResult, SheetProjectInput } from '@/core/types';
import { formatDimension, formatPercent } from '@/core/units/formatDimension';

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function disclaimer(): string {
  return 'Planning tool only. Verify dimensions, kerf, material edges, grain direction, machine setup, and shop safety before cutting. StockCut does not guarantee a mathematically optimal or professionally reviewed fabrication plan.';
}
function wrapText(text: string, maxChars = 92): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}
function buildPdf(lines: string[], filename: string): void {
  const pageCapacity = 46;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += pageCapacity) pages.push(lines.slice(i, i + pageCapacity));
  const objects: string[] = [];
  const pageIds: number[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  for (const page of pages) {
    const content = ['BT', '/F1 10 Tf', '54 730 Td', '14 TL', ...page.flatMap((line, index) => index === 0 ? [`(${escapePdfText(line)}) Tj`] : ['T*', `(${escapePdfText(line)}) Tj`]), 'ET'].join('\n');
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
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
function add(lines: string[], text = ''): void {
  wrapText(text).forEach((line) => lines.push(line));
}

export async function downloadSheetPdf(project: SheetProjectInput, result: SheetOptimizationResult): Promise<void> {
  const unit: DisplayUnit = project.unit;
  const lines: string[] = [];
  add(lines, 'StockCut Sheet Cutting Plan');
  add(lines, `Date: ${today()} | Unit: ${unit} | Kerf: ${project.kerf} | Strategy: ${project.strategy ?? 'least_waste'}`);
  add(lines, `Sheets used: ${result.sheetsUsed.length} | Yield: ${formatPercent(result.yieldRate)} | Waste: ${formatPercent(result.wasteRate)} | Estimated stock cost: ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`);
  add(lines, `Algorithm: ${result.algorithm}`);
  add(lines, 'Warnings');
  if (result.warnings.length) result.warnings.forEach((warning) => add(lines, `- ${warning.message}`)); else add(lines, '- None');
  result.sheetsUsed.forEach((sheet) => {
    add(lines, '');
    add(lines, `Sheet ${sheet.sheetIndex}: ${sheet.stockLabel} (${formatDimension(sheet.widthUm, unit)} x ${formatDimension(sheet.heightUm, unit)})`);
    add(lines, `Usable: ${formatDimension(sheet.usableWidthUm, unit)} x ${formatDimension(sheet.usableHeightUm, unit)} | Material: ${sheet.material ?? 'not set'} | Offcut source: ${sheet.isOffcut ? 'yes' : 'no'}`);
    sheet.placements.slice().sort((a, b) => a.yUm - b.yUm || a.xUm - b.xUm).forEach((p, index) => add(lines, `${index + 1}. ${p.partLabel} #${p.instanceIndex}: ${formatDimension(p.widthUm, unit)} x ${formatDimension(p.heightUm, unit)} at ${formatDimension(p.xUm, unit)}, ${formatDimension(p.yUm, unit)}${p.rotated ? ' rotated' : ''}`));
    sheet.offcuts.slice(0, 10).forEach((o, index) => add(lines, `Offcut ${index + 1}: ${formatDimension(o.widthUm, unit)} x ${formatDimension(o.heightUm, unit)} at ${formatDimension(o.xUm, unit)}, ${formatDimension(o.yUm, unit)}`));
  });
  if (result.unplacedParts.length) {
    add(lines, 'Unplaced parts');
    result.unplacedParts.forEach((part) => add(lines, `- ${part.label}: ${part.reason}`));
  }
  add(lines, 'Disclaimer');
  add(lines, disclaimer());
  buildPdf(lines, `stockcut-sheet-plan-${today()}.pdf`);
}

export async function downloadLinearPdf(project: LinearProjectInput, result: LinearOptimizationResult): Promise<void> {
  const unit: DisplayUnit = project.unit;
  const lines: string[] = [];
  add(lines, 'StockCut Linear Cutting Plan');
  add(lines, `Date: ${today()} | Unit: ${unit} | Kerf: ${project.kerf} | Strategy: ${project.strategy ?? 'least_waste'}`);
  add(lines, `Stocks used: ${result.stocksUsed.length} | Waste: ${formatPercent(result.wasteRate)} | Kerf loss: ${formatDimension(result.totalKerfLossUm, unit)} | Estimated stock cost: ${result.estimatedStockCost ? `$${result.estimatedStockCost.toFixed(2)}` : 'not set'}`);
  add(lines, `Algorithm: ${result.algorithm}`);
  add(lines, 'Warnings');
  if (result.warnings.length) result.warnings.forEach((warning) => add(lines, `- ${warning.message}`)); else add(lines, '- None');
  result.stocksUsed.forEach((stock) => {
    add(lines, '');
    add(lines, `Stock ${stock.stockIndex}: ${stock.stockLabel} (${formatDimension(stock.lengthUm, unit)})`);
    add(lines, `Usable: ${formatDimension(stock.usableLengthUm, unit)} | Used: ${formatDimension(stock.usedLengthUm, unit)} | Offcut: ${formatDimension(stock.wasteLengthUm, unit)} | Kerf cuts: ${stock.kerfCount}`);
    stock.cuts.forEach((cut, index) => add(lines, `${index + 1}. ${cut.partLabel} #${cut.instanceIndex}: ${formatDimension(cut.lengthUm, unit)} starting at ${formatDimension(cut.startUm, unit)}`));
  });
  if (result.unplacedCuts.length) {
    add(lines, 'Unplaced cuts');
    result.unplacedCuts.forEach((cut) => add(lines, `- ${cut.label}: ${cut.reason}`));
  }
  add(lines, 'Disclaimer');
  add(lines, disclaimer());
  buildPdf(lines, `stockcut-linear-plan-${today()}.pdf`);
}
