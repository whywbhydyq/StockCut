import { AUTO_STOCK_QUANTITY, MAX_PART_QUANTITY } from '@/core/validation/limits';

interface QuantityOptions {
  allowAuto?: boolean;
  max?: number;
}

export function parseQuantity(raw: string, optionsOrAllowAuto: QuantityOptions | boolean = false): { ok: true; value: number } | { ok: false; error: string } {
  const options: QuantityOptions = typeof optionsOrAllowAuto === 'boolean' ? { allowAuto: optionsOrAllowAuto } : optionsOrAllowAuto;
  const allowAuto = Boolean(options.allowAuto);
  const max = options.max ?? (allowAuto ? AUTO_STOCK_QUANTITY : MAX_PART_QUANTITY);
  const text = String(raw ?? '').trim().toLowerCase();
  if (allowAuto && (!text || text === 'auto' || text === 'unlimited')) return { ok: true, value: Math.min(AUTO_STOCK_QUANTITY, max) };
  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) return { ok: false, error: 'Quantity must be a positive integer.' };
  if (value > max) return { ok: false, error: `Quantity cannot exceed ${max.toLocaleString()}.` };
  return { ok: true, value };
}
