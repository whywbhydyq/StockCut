export function encodeShareParams(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function decodeShareParams(search: string) {
  return Object.fromEntries(new URLSearchParams(search));
}
