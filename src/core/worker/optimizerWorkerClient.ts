import { optimizeLinearProject } from '@/core/linear-optimizer/bestFitDecreasing';
import { optimizeSheetProject } from '@/core/sheet-optimizer/guillotine';
import type { LinearOptimizationResult, LinearProjectInput, SheetOptimizationResult, SheetProjectInput } from '@/core/types';

export interface WorkerProgress {
  percent: number;
  message: string;
}

interface WorkerResult<T> {
  promise: Promise<T>;
  cancel: () => void;
}

type WorkerMode = 'sheet-2d' | 'linear-1d';

type WorkerResponse<T> =
  | { id: string; type: 'progress'; percent: number; message: string }
  | { id: string; type: 'result'; result: T }
  | { id: string; type: 'error'; message: string };

function hasRealWorkerSupport(): boolean {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined';
}

function runFallback<T>(compute: () => T, onProgress: (progress: WorkerProgress) => void): WorkerResult<T> {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const promise = new Promise<T>((resolve, reject) => {
    onProgress({ percent: 8, message: 'Worker unavailable; using responsive fallback calculation.' });
    timer = setTimeout(() => {
      if (cancelled) {
        reject(new Error('Optimization cancelled.'));
        return;
      }
      try {
        onProgress({ percent: 54, message: 'Calculating a practical kerf-aware layout.' });
        const result = compute();
        if (cancelled) {
          reject(new Error('Optimization cancelled.'));
          return;
        }
        onProgress({ percent: 100, message: 'Optimization complete.' });
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Optimization failed.'));
      }
    }, 20);
  });
  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    }
  };
}

function runInRealWorker<T extends SheetOptimizationResult | LinearOptimizationResult>(
  mode: WorkerMode,
  project: SheetProjectInput | LinearProjectInput,
  onProgress: (progress: WorkerProgress) => void
): WorkerResult<T> | null {
  if (!hasRealWorkerSupport()) return null;

  const id = `${mode}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let worker: Worker;
  try {
    worker = new Worker(new URL('./optimizer.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }

  let settled = false;
  const promise = new Promise<T>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerResponse<T>>) => {
      const message = event.data;
      if (message.id !== id || settled) return;
      if (message.type === 'progress') {
        onProgress({ percent: message.percent, message: message.message });
        return;
      }
      settled = true;
      worker.terminate();
      if (message.type === 'error') reject(new Error(message.message));
      else resolve(message.result);
    };
    worker.onerror = (event) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      reject(new Error(event.message || 'Optimization worker failed.'));
    };
    onProgress({ percent: 4, message: 'Starting background optimization worker.' });
    worker.postMessage({ id, mode, project });
  });

  return {
    promise,
    cancel: () => {
      if (settled) return;
      settled = true;
      worker.terminate();
    }
  };
}

export function runSheetOptimizationInWorker(project: SheetProjectInput, onProgress: (progress: WorkerProgress) => void): WorkerResult<SheetOptimizationResult> {
  return runInRealWorker<SheetOptimizationResult>('sheet-2d', project, onProgress)
    ?? runFallback(() => optimizeSheetProject(project), onProgress);
}

export function runLinearOptimizationInWorker(project: LinearProjectInput, onProgress: (progress: WorkerProgress) => void): WorkerResult<LinearOptimizationResult> {
  return runInRealWorker<LinearOptimizationResult>('linear-1d', project, onProgress)
    ?? runFallback(() => optimizeLinearProject(project), onProgress);
}
