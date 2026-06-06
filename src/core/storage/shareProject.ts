import type { ProjectMode } from '@/core/types';
import { MAX_SHARE_HASH_CHARS, MAX_SHARE_JSON_CHARS } from '@/core/validation/limits';
import type { ValidationResult } from '@/core/validation/projectSchema';

interface ShareEnvelope<T> {
  app: 'StockCut';
  version: 1;
  mode: ProjectMode;
  project: T;
}

type ProjectValidator<T> = (value: unknown) => ValidationResult<T>;

function encodeBase64Utf8(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64Utf8(value: string): string {
  return decodeURIComponent(escape(atob(value)));
}

export function buildShareUrl<T>(mode: ProjectMode, project: T, originPath?: string): string {
  if (typeof window === 'undefined' && !originPath) return '';
  const base = originPath ?? `${window.location.origin}${window.location.pathname}`;
  const envelope: ShareEnvelope<T> = { app: 'StockCut', version: 1, mode, project };
  const payload = JSON.stringify(envelope);
  if (payload.length > MAX_SHARE_JSON_CHARS) throw new Error('Project is too large for a browser share link. Download the JSON project instead.');
  const encoded = encodeBase64Utf8(payload);
  if (encoded.length > MAX_SHARE_HASH_CHARS) throw new Error('Project is too large for a browser share link. Download the JSON project instead.');
  return `${base}#stockcut=${encoded}`;
}

export function readShareProjectFromHash<T>(expectedMode: ProjectMode, validate?: ProjectValidator<T>): T | null {
  if (typeof window === 'undefined') return null;
  if (window.location.hash.length > MAX_SHARE_HASH_CHARS + 32) return null;
  const match = window.location.hash.match(/stockcut=([^&]+)/);
  if (!match || match[1].length > MAX_SHARE_HASH_CHARS) return null;
  try {
    const decoded = decodeBase64Utf8(match[1]);
    if (decoded.length > MAX_SHARE_JSON_CHARS) return null;
    const parsed = JSON.parse(decoded) as ShareEnvelope<unknown>;
    if (parsed.app !== 'StockCut' || parsed.version !== 1 || parsed.mode !== expectedMode || !parsed.project) return null;
    if (!validate) return parsed.project as T;
    const checked = validate(parsed.project);
    return checked.ok ? checked.value : null;
  } catch {
    return null;
  }
}
