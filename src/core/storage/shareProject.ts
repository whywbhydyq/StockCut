import type { ProjectMode } from '@/core/types';

interface ShareEnvelope<T> {
  app: 'StockCut';
  version: 1;
  mode: ProjectMode;
  project: T;
}

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
  return `${base}#stockcut=${encodeBase64Utf8(JSON.stringify(envelope))}`;
}

export function readShareProjectFromHash<T>(expectedMode: ProjectMode): T | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.hash.match(/stockcut=([^&]+)/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeBase64Utf8(match[1])) as ShareEnvelope<T>;
    if (parsed.app !== 'StockCut' || parsed.version !== 1 || parsed.mode !== expectedMode || !parsed.project) return null;
    return parsed.project;
  } catch {
    return null;
  }
}
