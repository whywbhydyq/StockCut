import { describe, expect, it } from 'vitest';
import { parseXlsxWorkbookToTsv } from './parseWorkbook';

function writeU16(out: number[], value: number): void { out.push(value & 0xff, (value >> 8) & 0xff); }
function writeU32(out: number[], value: number): void { out.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff); }
function bytes(text: string): number[] { return Array.from(new TextEncoder().encode(text)); }
function minimalStoredZip(files: Record<string, string>): ArrayBuffer {
  const out: number[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = bytes(name);
    const data = bytes(content);
    const localOffset = offset;
    writeU32(out, 0x04034b50); writeU16(out, 20); writeU16(out, 0); writeU16(out, 0); writeU16(out, 0); writeU16(out, 0); writeU32(out, 0); writeU32(out, data.length); writeU32(out, data.length); writeU16(out, nameBytes.length); writeU16(out, 0); out.push(...nameBytes, ...data);
    offset = out.length;
    writeU32(central, 0x02014b50); writeU16(central, 20); writeU16(central, 20); writeU16(central, 0); writeU16(central, 0); writeU16(central, 0); writeU16(central, 0); writeU32(central, 0); writeU32(central, data.length); writeU32(central, data.length); writeU16(central, nameBytes.length); writeU16(central, 0); writeU16(central, 0); writeU16(central, 0); writeU16(central, 0); writeU32(central, 0); writeU32(central, localOffset); central.push(...nameBytes);
  }
  const centralOffset = out.length;
  out.push(...central);
  writeU32(out, 0x06054b50); writeU16(out, 0); writeU16(out, 0); writeU16(out, Object.keys(files).length); writeU16(out, Object.keys(files).length); writeU32(out, central.length); writeU32(out, centralOffset); writeU16(out, 0);
  return new Uint8Array(out).buffer;
}

describe('parseXlsxWorkbookToTsv', () => {
  it('reads a minimal .xlsx worksheet into tab-separated rows', async () => {
    const sheet = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Label</t></is></c><c r="B1" t="inlineStr"><is><t>Width</t></is></c><c r="C1" t="inlineStr"><is><t>Height</t></is></c><c r="D1" t="inlineStr"><is><t>Quantity</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Side Panel</t></is></c><c r="B2"><v>24</v></c><c r="C2"><v>48</v></c><c r="D2"><v>2</v></c></row></sheetData></worksheet>`;
    const buffer = minimalStoredZip({ 'xl/worksheets/sheet1.xml': sheet });
    await expect(parseXlsxWorkbookToTsv(buffer)).resolves.toContain('Side Panel\t24\t48\t2');
  });
});
