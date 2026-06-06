export const MAX_PART_QUANTITY = 9_999;
export const MAX_STOCK_QUANTITY = 999;
export const AUTO_STOCK_QUANTITY = 999;
export const MAX_EXPANDED_ITEMS = 20_000;
export const MAX_PROJECT_ROWS = 2_000;
export const MAX_EXTRA_STOCK_ROWS = 200;
export const MAX_PASTE_ROWS = 2_000;
export const MAX_PASTE_COLUMNS = 64;
export const MAX_PASTE_TEXT_CHARS = 1_000_000;
export const MAX_CELL_CHARS = 2_000;
export const MAX_LABEL_CHARS = 180;
export const MAX_DIMENSION_CHARS = 64;
export const MAX_NOTE_CHARS = 1_000;
export const MAX_CSV_TEXT_FILE_BYTES = 1_000_000;
export const MAX_JSON_FILE_BYTES = 1_000_000;
export const MAX_WORKBOOK_FILE_BYTES = 5_000_000;
export const MAX_WORKBOOK_ZIP_ENTRIES = 256;
export const MAX_WORKBOOK_ENTRY_BYTES = 8_000_000;
export const MAX_WORKBOOK_TOTAL_XML_BYTES = 16_000_000;
export const MAX_SHARE_HASH_CHARS = 120_000;
export const MAX_SHARE_JSON_CHARS = 500_000;
export const MAX_LOCAL_STORAGE_JSON_CHARS = 1_000_000;

export function formatByteLimit(bytes: number): string {
  if (bytes >= 1_000_000) return `${Math.floor(bytes / 1_000_000)} MB`;
  if (bytes >= 1_000) return `${Math.floor(bytes / 1_000)} KB`;
  return `${bytes} bytes`;
}

export function assertFileSize(file: File, maxBytes: number, label: string): void {
  if (file.size > maxBytes) {
    throw new Error(`${label} is too large. Maximum supported size is ${formatByteLimit(maxBytes)}.`);
  }
}

export function assertTextSize(text: string, maxChars: number, label: string): void {
  if (text.length > maxChars) {
    throw new Error(`${label} is too large. Reduce it below ${maxChars.toLocaleString()} characters.`);
  }
}
