const PREFIX = 'stockcut:';

export function loadProject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(`${PREFIX}${key}`);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    window.localStorage.removeItem(`${PREFIX}${key}`);
    return fallback;
  }
}

export function saveProject<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Local storage can be full or disabled; never block the tool.
  }
}
