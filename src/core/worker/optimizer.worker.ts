import { optimizeLinearProject } from '../linear-optimizer/bestFitDecreasing';
import { optimizeSheetProject } from '../sheet-optimizer/guillotine';
import type { LinearOptimizationResult, LinearProjectInput, SheetOptimizationResult, SheetProjectInput } from '../types';

type WorkerMode = 'sheet-2d' | 'linear-1d';

interface WorkRequest {
  id: string;
  mode: WorkerMode;
  project: SheetProjectInput | LinearProjectInput;
}

type WorkResponse =
  | { id: string; type: 'progress'; percent: number; message: string }
  | { id: string; type: 'result'; result: SheetOptimizationResult | LinearOptimizationResult }
  | { id: string; type: 'error'; message: string };

const ctx = self as unknown as {
  postMessage: (message: WorkResponse) => void;
  onmessage: ((event: MessageEvent<WorkRequest>) => void) | null;
};

function postProgress(id: string, percent: number, message: string): void {
  ctx.postMessage({ id, type: 'progress', percent, message });
}

ctx.onmessage = (event: MessageEvent<WorkRequest>) => {
  const { id, mode, project } = event.data;
  try {
    postProgress(id, 12, 'Validating dimensions, quantities, stock, and kerf.');
    postProgress(id, 38, 'Running layout search away from the main UI thread.');
    const result = mode === 'sheet-2d'
      ? optimizeSheetProject(project as SheetProjectInput)
      : optimizeLinearProject(project as LinearProjectInput);
    postProgress(id, 100, 'Optimization complete.');
    ctx.postMessage({ id, type: 'result', result });
  } catch (error) {
    ctx.postMessage({ id, type: 'error', message: error instanceof Error ? error.message : 'Optimization failed.' });
  }
};
