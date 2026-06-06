import { MAX_LOCAL_STORAGE_JSON_CHARS } from '@/core/validation/limits';
import type { ValidationResult } from '@/core/validation/projectSchema';

const PREFIX = 'stockcut:';

type ProjectValidator<T> = (value: unknown) => ValidationResult<T>;

export function loadProject<T>(key: string, fallback: T, validate?: ProjectValidator<T>): T {
  if (typeof window === 'undefined') return fallback;
  const storageKey = `${PREFIX}${key}`;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return fallback;
    if (value.length > MAX_LOCAL_STORAGE_JSON_CHARS) {
      window.localStorage.removeItem(storageKey);
      return fallback;
    }
    const parsed = JSON.parse(value) as unknown;
    if (!validate) return parsed as T;
    const checked = validate(parsed);
    if (!checked.ok) {
      window.localStorage.removeItem(storageKey);
      return fallback;
    }
    return checked.value;
  } catch {
    window.localStorage.removeItem(storageKey);
    return fallback;
  }
}

export function saveProject<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_LOCAL_STORAGE_JSON_CHARS) return;
    window.localStorage.setItem(`${PREFIX}${key}`, serialized);
  } catch {
    // Local storage can be full or disabled; never block the tool.
  }
}
