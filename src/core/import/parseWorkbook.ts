import type { LinearPasteResult, SheetPasteResult } from './parsePaste';
import { parseLinearPaste, parseSheetPaste } from './parsePaste';

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localHeaderOffset: number;
}

function u16(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}
function u32(data: Uint8Array, offset: number): number {
  return (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0;
}
function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder('utf-8').decode(data);
}
function xmlDecode(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
function columnIndex(cellRef: string): number {
  const letters = (cellRef.match(/^[A-Z]+/i)?.[0] ?? 'A').toUpperCase();
  let index = 0;
  for (const ch of letters) index = index * 26 + ch.charCodeAt(0) - 64;
  return Math.max(0, index - 1);
}
function findEndOfCentralDirectory(data: Uint8Array): number {
  for (let i = data.length - 22; i >= Math.max(0, data.length - 66000); i -= 1) {
    if (u32(data, i) === 0x06054b50) return i;
  }
  throw new Error('This file is not a readable .xlsx workbook.');
}
function readZipEntries(data: Uint8Array): ZipEntry[] {
  const eocd = findEndOfCentralDirectory(data);
  const entryCount = u16(data, eocd + 10);
  let offset = u32(data, eocd + 16);
  const entries: ZipEntry[] = [];
  for (let i = 0; i < entryCount; i += 1) {
    if (u32(data, offset) !== 0x02014b50) break;
    const method = u16(data, offset + 10);
    const compressedSize = u32(data, offset + 20);
    const nameLength = u16(data, offset + 28);
    const extraLength = u16(data, offset + 30);
    const commentLength = u16(data, offset + 32);
    const localHeaderOffset = u32(data, offset + 42);
    const name = decodeUtf8(data.slice(offset + 46, offset + 46 + nameLength));
    entries.push({ name, method, compressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress .xlsx files. Use CSV import or paste from Excel instead.');
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(data);
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function readZipText(data: Uint8Array, entries: ZipEntry[], name: string): Promise<string> {
  const entry = entries.find((candidate) => candidate.name === name);
  if (!entry) throw new Error(`Workbook entry not found: ${name}`);
  const local = entry.localHeaderOffset;
  if (u32(data, local) !== 0x04034b50) throw new Error(`Invalid workbook entry: ${name}`);
  const nameLength = u16(data, local + 26);
  const extraLength = u16(data, local + 28);
  const start = local + 30 + nameLength + extraLength;
  const compressed = data.slice(start, start + entry.compressedSize);
  if (entry.method === 0) return decodeUtf8(compressed);
  if (entry.method === 8) return decodeUtf8(await inflateRaw(compressed));
  throw new Error(`Unsupported compression method in workbook: ${entry.method}`);
}
function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  for (const match of xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)) {
    const parts = Array.from(match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map((t) => xmlDecode(t[1]));
    strings.push(parts.join(''));
  }
  return strings;
}
function parseWorksheetRows(xml: string, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/\br="([^"]+)"/)?.[1] ?? `A${rows.length + 1}`;
      const index = columnIndex(ref);
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? '';
      let value = '';
      if (type === 'inlineStr') value = xmlDecode(body.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? '');
      else {
        const raw = body.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? '';
        value = type === 's' ? (sharedStrings[Number(raw)] ?? '') : xmlDecode(raw);
      }
      cells[index] = value;
    }
    if (cells.some((cell) => String(cell ?? '').trim())) rows.push(cells.map((cell) => cell ?? ''));
  }
  return rows;
}

export async function parseXlsxWorkbookToTsv(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const entries = readZipEntries(data);
  const worksheetName = entries.map((entry) => entry.name).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)).sort()[0];
  if (!worksheetName) throw new Error('Workbook has no worksheet XML.');
  const sharedXml = entries.some((entry) => entry.name === 'xl/sharedStrings.xml') ? await readZipText(data, entries, 'xl/sharedStrings.xml') : '';
  const worksheetXml = await readZipText(data, entries, worksheetName);
  const rows = parseWorksheetRows(worksheetXml, parseSharedStrings(sharedXml));
  return rows.map((row) => row.map((cell) => String(cell).replace(/[\t\r\n]+/g, ' ').trim()).join('\t')).join('\n');
}

export async function parseSheetWorkbookFile(file: File): Promise<SheetPasteResult> {
  return parseSheetPaste(await parseXlsxWorkbookToTsv(await file.arrayBuffer()));
}

export async function parseLinearWorkbookFile(file: File): Promise<LinearPasteResult> {
  return parseLinearPaste(await parseXlsxWorkbookToTsv(await file.arrayBuffer()));
}
