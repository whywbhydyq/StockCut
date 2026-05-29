export function toCsv(rows: Array<Array<string | number | boolean | undefined>>) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');
}
