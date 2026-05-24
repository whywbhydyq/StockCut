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

const PROGRESS_WORKER_SOURCE = `
let timer = null;
self.onmessage = (event) => {
  if (event.data && event.data.type === 'cancel') {
    if (timer) clearInterval(timer);
    self.postMessage({ type: 'cancelled' });
    return;
  }
  let percent = 10;
  const messages = ['Validating dimensions and quantities.', 'Expanding repeated parts.', 'Trying stock and offcut placements.', 'Preparing printable result.'];
  let index = 0;
  self.postMessage({ type: 'progress', percent, message: messages[index] });
  timer = setInterval(() => {
    percent = Math.min(92, percent + 18);
    index = Math.min(messages.length - 1, index + 1);
    self.postMessage({ type: 'progress', percent, message: messages[index] });
  }, 80);
};
`;

function createProgressWorker(): Worker | null {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return null;
  const url = URL.createObjectURL(new Blob([PROGRESS_WORKER_SOURCE], { type: 'text/javascript' }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

function runWithProgress<T>(compute: () => T, onProgress: (progress: WorkerProgress) => void): WorkerResult<T> {
  const worker = createProgressWorker();
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (worker) {
    worker.onmessage = (event: MessageEvent<{ type: string; percent?: number; message?: string }>) => {
      if (event.data.type === 'progress') onProgress({ percent: event.data.percent ?? 0, message: event.data.message ?? 'Optimizing.' });
    };
    worker.postMessage({ type: 'start' });
  } else {
    onProgress({ percent: 10, message: 'Optimizing.' });
  }
  const promise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      if (cancelled) {
        reject(new Error('Optimization cancelled.'));
        return;
      }
      try {
        onProgress({ percent: 96, message: 'Finalizing layout.' });
        const result = compute();
        onProgress({ percent: 100, message: 'Optimization complete.' });
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Optimization failed.'));
      } finally {
        worker?.terminate();
      }
    }, 60);
  });
  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      worker?.postMessage({ type: 'cancel' });
      worker?.terminate();
    }
  };
}

export function runSheetOptimizationInWorker(project: SheetProjectInput, onProgress: (progress: WorkerProgress) => void): WorkerResult<SheetOptimizationResult> {
  return runWithProgress(() => optimizeSheetProject(project), onProgress);
}

export function runLinearOptimizationInWorker(project: LinearProjectInput, onProgress: (progress: WorkerProgress) => void): WorkerResult<LinearOptimizationResult> {
  return runWithProgress(() => optimizeLinearProject(project), onProgress);
}
