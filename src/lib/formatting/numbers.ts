export function roundTo(value: number, step = 1) {
  return Math.round(value / step) * step;
}

export function ceilTo(value: number, step = 1) {
  return Math.ceil(value / step) * step;
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}
