import type { LinearPasteResult, SheetPasteResult } from './parsePaste';
import { parseLinearPaste, parseSheetPaste } from './parsePaste';
import { assertFileSize, MAX_WORKBOOK_ENTRY_BYTES, MAX_WORKBOOK_FILE_BYTES, MAX_WORKBOOK_TOTAL_XML_BYTES, MAX_WORKBOOK_ZIP_ENTRIES } from '@/core/validation/limits';

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

interface CfbDirectoryEntry {
  name: string;
  type: number;
  startSector: number;
  size: number;
}

interface BiffSheetRef {
  name: string;
  offset: number;
  visible: boolean;
}

const CFB_MAGIC = 'd0cf11e0a1b11ae1';
const FREE_SECTOR = 0xffffffff;
const END_OF_CHAIN = 0xfffffffe;
const MAX_CHAIN_LENGTH = 200000;

function u16(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}
function u32(data: Uint8Array, offset: number): number {
  return (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0;
}
function i32(data: Uint8Array, offset: number): number {
  return new DataView(data.buffer, data.byteOffset + offset, 4).getInt32(0, true);
}
function f64(data: Uint8Array, offset: number): number {
  return new DataView(data.buffer, data.byteOffset + offset, 8).getFloat64(0, true);
}
function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder('utf-8').decode(data);
}
function decodeUtf16Le(data: Uint8Array): string {
  return new TextDecoder('utf-16le').decode(data);
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
function rowsToTsv(rows: string[][]): string {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row) => row.map((cell) => String(cell ?? '').replace(/[\t\r\n]+/g, ' ').trim()).join('\t'))
    .join('\n');
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
    const uncompressedSize = u32(data, offset + 24);
    const nameLength = u16(data, offset + 28);
    const extraLength = u16(data, offset + 30);
    const commentLength = u16(data, offset + 32);
    const localHeaderOffset = u32(data, offset + 42);
    const name = decodeUtf8(data.slice(offset + 46, offset + 46 + nameLength));
    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  if (entries.length > MAX_WORKBOOK_ZIP_ENTRIES) throw new Error(`Workbook has too many ZIP entries. Maximum is ${MAX_WORKBOOK_ZIP_ENTRIES}.`);
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
  if (entry.uncompressedSize > MAX_WORKBOOK_ENTRY_BYTES) throw new Error(`Workbook entry is too large: ${name}.`);
  if (entry.compressedSize > MAX_WORKBOOK_FILE_BYTES) throw new Error(`Workbook entry is too large: ${name}.`);
  const compressed = data.slice(start, start + entry.compressedSize);
  if (entry.method === 0) {
    const text = decodeUtf8(compressed);
    if (text.length > MAX_WORKBOOK_ENTRY_BYTES) throw new Error(`Workbook entry is too large: ${name}.`);
    return text;
  }
  if (entry.method === 8) {
    const inflated = await inflateRaw(compressed);
    if (inflated.byteLength > MAX_WORKBOOK_ENTRY_BYTES) throw new Error(`Workbook entry is too large: ${name}.`);
    return decodeUtf8(inflated);
  }
  throw new Error(`Unsupported compression method in workbook: ${entry.method}`);
}

function normalizeWorkbookTarget(target: string): string {
  const cleaned = target.replace(/^\//, '').replace(/^xl\//, '');
  return `xl/${cleaned}`.replace(/\/+/g, '/');
}

async function findWorksheetName(data: Uint8Array, entries: ZipEntry[]): Promise<string | null> {
  const workbookEntry = entries.find((entry) => entry.name === 'xl/workbook.xml');
  const relsEntry = entries.find((entry) => entry.name === 'xl/_rels/workbook.xml.rels');
  if (!workbookEntry || !relsEntry) return null;
  const workbookXml = await readZipText(data, entries, workbookEntry.name);
  const relsXml = await readZipText(data, entries, relsEntry.name);
  const relTargets = new Map<string, string>();
  for (const rel of relsXml.matchAll(/<Relationship\b([^>]*)\/?>(?:<\/Relationship>)?/g)) {
    const attrs = rel[1];
    const id = attrs.match(/\bId="([^"]+)"/)?.[1];
    const target = attrs.match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target && /worksheets\//i.test(target)) relTargets.set(id, normalizeWorkbookTarget(target));
  }
  for (const sheet of workbookXml.matchAll(/<sheet\b([^>]*)\/?>(?:<\/sheet>)?/g)) {
    const attrs = sheet[1];
    const state = attrs.match(/\bstate="([^"]+)"/)?.[1] ?? 'visible';
    const relId = attrs.match(/\br:id="([^"]+)"/)?.[1];
    const target = relId ? relTargets.get(relId) : undefined;
    if (target && state !== 'hidden' && state !== 'veryHidden' && entries.some((entry) => entry.name === target)) return target;
  }
  return null;
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

function isCfb(data: Uint8Array): boolean {
  return Array.from(data.slice(0, 8)).map((byte) => byte.toString(16).padStart(2, '0')).join('') === CFB_MAGIC;
}
function sectorOffset(sector: number, sectorSize: number): number {
  return (sector + 1) * sectorSize;
}
function readSector(data: Uint8Array, sector: number, sectorSize: number): Uint8Array {
  const offset = sectorOffset(sector, sectorSize);
  return data.slice(offset, offset + sectorSize);
}
function sectorChain(startSector: number, table: number[]): number[] {
  const chain: number[] = [];
  let current = startSector >>> 0;
  const seen = new Set<number>();
  while (current !== END_OF_CHAIN && current !== FREE_SECTOR && current < table.length && !seen.has(current) && chain.length < MAX_CHAIN_LENGTH) {
    seen.add(current);
    chain.push(current);
    current = table[current] >>> 0;
  }
  return chain;
}
function chainBytes(data: Uint8Array, chain: number[], sectorSize: number, size?: number): Uint8Array {
  const output = new Uint8Array(chain.length * sectorSize);
  chain.forEach((sector, index) => output.set(readSector(data, sector, sectorSize), index * sectorSize));
  return size !== undefined ? output.slice(0, size) : output;
}
function readUInt32Entries(data: Uint8Array): number[] {
  const entries: number[] = [];
  for (let offset = 0; offset + 4 <= data.length; offset += 4) entries.push(u32(data, offset));
  return entries;
}
function readCfbDirectory(data: Uint8Array, sectorSize: number, fat: number[], firstDirSector: number): CfbDirectoryEntry[] {
  const directoryBytes = chainBytes(data, sectorChain(firstDirSector, fat), sectorSize);
  const entries: CfbDirectoryEntry[] = [];
  for (let offset = 0; offset + 128 <= directoryBytes.length; offset += 128) {
    const item = directoryBytes.slice(offset, offset + 128);
    const nameLength = u16(item, 64);
    const nameBytes = item.slice(0, Math.max(0, nameLength - 2));
    const name = decodeUtf16Le(nameBytes).replace(/\u0000/g, '').trim();
    const type = item[66];
    const startSector = u32(item, 116);
    const size = u32(item, 120);
    if (name && type) entries.push({ name, type, startSector, size });
  }
  return entries;
}
function readCfbStream(data: Uint8Array, entry: CfbDirectoryEntry, directory: CfbDirectoryEntry[], sectorSize: number, miniSectorSize: number, miniCutoff: number, fat: number[], miniFat: number[]): Uint8Array {
  if (entry.size > 0 && entry.size < miniCutoff && miniFat.length) {
    const root = directory.find((item) => item.type === 5);
    if (root && root.startSector !== FREE_SECTOR) {
      const miniStream = chainBytes(data, sectorChain(root.startSector, fat), sectorSize, root.size);
      const miniChain = sectorChain(entry.startSector, miniFat);
      const output = new Uint8Array(miniChain.length * miniSectorSize);
      miniChain.forEach((sector, index) => output.set(miniStream.slice(sector * miniSectorSize, sector * miniSectorSize + miniSectorSize), index * miniSectorSize));
      return output.slice(0, entry.size);
    }
  }
  return chainBytes(data, sectorChain(entry.startSector, fat), sectorSize, entry.size);
}
function readCfbWorkbookStream(buffer: ArrayBuffer): Uint8Array {
  if (buffer.byteLength > MAX_WORKBOOK_FILE_BYTES) throw new Error('Workbook file is too large.');
  const data = new Uint8Array(buffer);
  if (!isCfb(data)) throw new Error('This file is not a readable binary .xls workbook.');
  const sectorSize = 2 ** u16(data, 30);
  const miniSectorSize = 2 ** u16(data, 32);
  const firstDirSector = u32(data, 48);
  const miniCutoff = u32(data, 56);
  const firstMiniFatSector = u32(data, 60);
  const numberOfMiniFatSectors = u32(data, 64);
  const firstDifatSector = u32(data, 68);
  const numberOfDifatSectors = u32(data, 72);
  const difat: number[] = [];
  for (let offset = 76; offset < 512; offset += 4) {
    const sector = u32(data, offset);
    if (sector !== FREE_SECTOR) difat.push(sector);
  }
  let currentDifat = firstDifatSector;
  for (let index = 0; index < numberOfDifatSectors && currentDifat !== END_OF_CHAIN && currentDifat !== FREE_SECTOR; index += 1) {
    const sector = readSector(data, currentDifat, sectorSize);
    for (let offset = 0; offset < sectorSize - 4; offset += 4) {
      const value = u32(sector, offset);
      if (value !== FREE_SECTOR) difat.push(value);
    }
    currentDifat = u32(sector, sectorSize - 4);
  }
  const fat = readUInt32Entries(chainBytes(data, difat, sectorSize));
  const miniFat = firstMiniFatSector !== FREE_SECTOR && numberOfMiniFatSectors > 0
    ? readUInt32Entries(chainBytes(data, sectorChain(firstMiniFatSector, fat).slice(0, numberOfMiniFatSectors), sectorSize))
    : [];
  const directory = readCfbDirectory(data, sectorSize, fat, firstDirSector);
  const workbook = directory.find((entry) => entry.type === 2 && /^(workbook|book)$/i.test(entry.name));
  if (!workbook) throw new Error('Binary .xls workbook stream was not found.');
  if (workbook.size > MAX_WORKBOOK_ENTRY_BYTES) throw new Error('Binary .xls workbook stream is too large.');
  return readCfbStream(data, workbook, directory, sectorSize, miniSectorSize, miniCutoff, fat, miniFat);
}

function decodeBiffString(data: Uint8Array, offset: number): { value: string; nextOffset: number } {
  const length = u16(data, offset);
  const flags = data[offset + 2] ?? 0;
  let cursor = offset + 3;
  const richRuns = flags & 0x08 ? u16(data, cursor) : 0;
  if (flags & 0x08) cursor += 2;
  const extSize = flags & 0x04 ? u32(data, cursor) : 0;
  if (flags & 0x04) cursor += 4;
  const byteLength = length * ((flags & 0x01) ? 2 : 1);
  const raw = data.slice(cursor, cursor + byteLength);
  const value = (flags & 0x01) ? decodeUtf16Le(raw) : Array.from(raw).map((byte) => String.fromCharCode(byte)).join('');
  cursor += byteLength + richRuns * 4 + extSize;
  return { value, nextOffset: cursor };
}
function parseBoundSheets(workbook: Uint8Array): BiffSheetRef[] {
  const sheets: BiffSheetRef[] = [];
  for (let offset = 0; offset + 4 <= workbook.length;) {
    const type = u16(workbook, offset);
    const length = u16(workbook, offset + 2);
    const body = workbook.slice(offset + 4, offset + 4 + length);
    if (type === 0x0085 && body.length >= 8) {
      const sheetOffset = u32(body, 0);
      const state = body[4] ?? 0;
      const nameLength = body[6] ?? 0;
      const flags = body[7] ?? 0;
      const nameRaw = body.slice(8, 8 + nameLength * ((flags & 0x01) ? 2 : 1));
      const name = flags & 0x01 ? decodeUtf16Le(nameRaw) : Array.from(nameRaw).map((byte) => String.fromCharCode(byte)).join('');
      sheets.push({ name, offset: sheetOffset, visible: state === 0 });
    }
    offset += 4 + length;
  }
  return sheets;
}
function parseSst(workbook: Uint8Array): string[] {
  const strings: string[] = [];
  for (let offset = 0; offset + 4 <= workbook.length;) {
    const type = u16(workbook, offset);
    const length = u16(workbook, offset + 2);
    if (type === 0x00fc) {
      const body = workbook.slice(offset + 4, offset + 4 + length);
      const unique = u32(body, 4);
      let cursor = 8;
      for (let index = 0; index < unique && cursor + 3 <= body.length; index += 1) {
        const decoded = decodeBiffString(body, cursor);
        strings.push(decoded.value);
        cursor = decoded.nextOffset;
      }
      return strings;
    }
    offset += 4 + length;
  }
  return strings;
}
function decodeRk(value: number): string {
  const raw = value >>> 0;
  const isInteger = Boolean(raw & 0x02);
  const divideBy100 = Boolean(raw & 0x01);
  let numberValue: number;
  if (isInteger) numberValue = (raw >> 2);
  else {
    const bytes = new ArrayBuffer(8);
    const view = new DataView(bytes);
    view.setUint32(4, raw & 0xfffffffc, true);
    numberValue = view.getFloat64(0, true);
  }
  if (divideBy100) numberValue /= 100;
  return Number.isFinite(numberValue) ? String(numberValue) : '';
}
function setCell(rows: string[][], row: number, col: number, value: string): void {
  if (!rows[row]) rows[row] = [];
  rows[row][col] = value;
}
function parseBiffRows(workbook: Uint8Array, sheetOffset: number, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  for (let offset = sheetOffset; offset + 4 <= workbook.length;) {
    const type = u16(workbook, offset);
    const length = u16(workbook, offset + 2);
    const body = workbook.slice(offset + 4, offset + 4 + length);
    if (type === 0x000a) break;
    if (type === 0x00fd && body.length >= 10) setCell(rows, u16(body, 0), u16(body, 2), sharedStrings[u32(body, 6)] ?? '');
    else if (type === 0x0203 && body.length >= 14) setCell(rows, u16(body, 0), u16(body, 2), String(f64(body, 6)));
    else if (type === 0x027e && body.length >= 10) setCell(rows, u16(body, 0), u16(body, 2), decodeRk(u32(body, 6)));
    else if (type === 0x00bd && body.length >= 10) {
      const row = u16(body, 0);
      const firstCol = u16(body, 2);
      const lastCol = u16(body, body.length - 2);
      let cursor = 4;
      for (let col = firstCol; col <= lastCol && cursor + 6 <= body.length - 2; col += 1) {
        setCell(rows, row, col, decodeRk(u32(body, cursor + 2)));
        cursor += 6;
      }
    } else if (type === 0x0204 && body.length >= 8) {
      const row = u16(body, 0);
      const col = u16(body, 2);
      const length8 = u16(body, 6);
      const raw = body.slice(8, 8 + length8);
      setCell(rows, row, col, Array.from(raw).map((byte) => String.fromCharCode(byte)).join(''));
    } else if (type === 0x0006 && body.length >= 14) {
      const marker = body.slice(6, 14);
      if (!(marker[6] === 0xff && marker[7] === 0xff)) setCell(rows, u16(body, 0), u16(body, 2), String(f64(body, 6)));
    }
    offset += 4 + length;
  }
  return rows.map((row) => row ?? []);
}

export async function parseXlsxWorkbookToTsv(buffer: ArrayBuffer): Promise<string> {
  if (buffer.byteLength > MAX_WORKBOOK_FILE_BYTES) throw new Error('Workbook file is too large.');
  const data = new Uint8Array(buffer);
  const entries = readZipEntries(data);
  const worksheetName = await findWorksheetName(data, entries)
    ?? entries.map((entry) => entry.name).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)).sort()[0];
  if (!worksheetName) throw new Error('Workbook has no worksheet XML.');
  const sharedXml = entries.some((entry) => entry.name === 'xl/sharedStrings.xml') ? await readZipText(data, entries, 'xl/sharedStrings.xml') : '';
  const worksheetXml = await readZipText(data, entries, worksheetName);
  if (sharedXml.length + worksheetXml.length > MAX_WORKBOOK_TOTAL_XML_BYTES) throw new Error('Workbook XML content is too large.');
  const rows = parseWorksheetRows(worksheetXml, parseSharedStrings(sharedXml));
  if (rows.length === 0) throw new Error('The first visible worksheet has no readable rows.');
  return rowsToTsv(rows);
}

export function parseXlsWorkbookToTsv(buffer: ArrayBuffer): string {
  const workbook = readCfbWorkbookStream(buffer);
  const sheet = parseBoundSheets(workbook).find((candidate) => candidate.visible) ?? parseBoundSheets(workbook)[0];
  if (!sheet) throw new Error('Binary .xls workbook has no visible worksheets.');
  const rows = parseBiffRows(workbook, sheet.offset, parseSst(workbook));
  const tsv = rowsToTsv(rows);
  if (!tsv.trim()) throw new Error('The first visible .xls worksheet has no readable rows.');
  return tsv;
}

export async function parseWorkbookToTsv(file: File): Promise<string> {
  assertFileSize(file, MAX_WORKBOOK_FILE_BYTES, 'Workbook file');
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();
  if (/\.xls$/i.test(name) && !/\.xlsx$/i.test(name)) return parseXlsWorkbookToTsv(buffer);
  return parseXlsxWorkbookToTsv(buffer);
}

export async function parseSheetWorkbookFile(file: File): Promise<SheetPasteResult> {
  return parseSheetPaste(await parseWorkbookToTsv(file));
}

export async function parseLinearWorkbookFile(file: File): Promise<LinearPasteResult> {
  return parseLinearPaste(await parseWorkbookToTsv(file));
}
