export function parseQuantity(raw: string, allowAuto = false): { ok: true; value: number } | { ok: false; error: string } {
  const text = String(raw ?? '').trim().toLowerCase();
  if (allowAuto && (!text || text === 'auto' || text === 'unlimited')) return { ok: true, value: 999 };
  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) return { ok: false, error: 'Quantity must be a positive integer.' };
  return { ok: true, value };
}
