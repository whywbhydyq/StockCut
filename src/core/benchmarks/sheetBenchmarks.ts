import type { SheetProjectInput } from '@/core/types';
import { optimizeSheetProject } from '@/core/sheet-optimizer/guillotine';
import { parseDimension } from '@/core/units/parseDimension';

export interface PublicSheetBenchmarkCase {
  id: string;
  label: string;
  purpose: string;
  input: SheetProjectInput;
}

export interface PublicSheetBenchmarkResult {
  id: string;
  label: string;
  purpose: string;
  sheetsUsed: number;
  areaLowerBoundSheets: number;
  placedParts: number;
  unplacedParts: number;
  yieldRate: number;
  cutSteps: number;
  durationMs: number;
  algorithm: string;
}

const stock = (unit: SheetProjectInput['unit'], width: string, height: string, label: string) => ({
  id: `stock-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
  label,
  width,
  height,
  quantity: 'auto',
  trimTop: '0',
  trimRight: '0',
  trimBottom: '0',
  trimLeft: '0'
}) satisfies SheetProjectInput['stock'];

export const publicSheetBenchmarkCases: PublicSheetBenchmarkCase[] = [
  {
    id: 'cabinet-mix-4x8',
    label: '4 x 8 cabinet panel mix',
    purpose: 'Mixed rectangular cabinet sides, shelves, and a back panel on standard plywood.',
    input: {
      unit: 'in',
      kerf: '1/8',
      strategy: 'least_waste',
      stock: stock('in', '48', '96', '4 x 8 plywood'),
      parts: [
        { id: 'side', label: 'Cabinet side', width: '23', height: '34', quantity: '2', allowRotation: true },
        { id: 'shelf', label: 'Shelf', width: '22', height: '11', quantity: '4', allowRotation: true },
        { id: 'back', label: 'Back panel', width: '24', height: '30', quantity: '1', allowRotation: true }
      ]
    }
  },
  {
    id: 'metric-workshop-mix',
    label: '1220 x 2440 mm workshop mix',
    purpose: 'Metric panels with a 3 mm kerf and two repeated part sizes.',
    input: {
      unit: 'mm',
      kerf: '3mm',
      strategy: 'least_waste',
      stock: stock('mm', '1220mm', '2440mm', 'Metric sheet'),
      parts: [
        { id: 'large', label: 'Large panel', width: '600mm', height: '800mm', quantity: '3', allowRotation: true },
        { id: 'small', label: 'Small panel', width: '300mm', height: '400mm', quantity: '4', allowRotation: true }
      ]
    }
  },
  {
    id: 'kerf-boundary',
    label: 'Kerf boundary case',
    purpose: 'Exact half-sheet panels show why an area-only lower bound can be impossible after kerf.',
    input: {
      unit: 'in',
      kerf: '1/8',
      strategy: 'least_stock',
      stock: stock('in', '48', '96', '4 x 8 plywood'),
      parts: [{ id: 'half', label: 'Half-sheet panel', width: '24', height: '48', quantity: '4', allowRotation: true }]
    }
  }
];

function dimension(value: string, unit: SheetProjectInput['unit']) {
  const parsed = parseDimension(value || '0', unit);
  return parsed.ok ? parsed.valueUm : 0;
}

function areaLowerBound(input: SheetProjectInput) {
  const usableWidth = dimension(input.stock.width, input.unit) - dimension(input.stock.trimLeft, input.unit) - dimension(input.stock.trimRight, input.unit);
  const usableHeight = dimension(input.stock.height, input.unit) - dimension(input.stock.trimTop, input.unit) - dimension(input.stock.trimBottom, input.unit);
  const usableArea = Math.max(0, usableWidth) * Math.max(0, usableHeight);
  const partArea = input.parts.reduce((sum, part) => {
    const quantity = Math.max(0, Math.round(Number(part.quantity) || 0));
    return sum + dimension(part.width, input.unit) * dimension(part.height, input.unit) * quantity;
  }, 0);
  return usableArea > 0 && partArea > 0 ? Math.ceil(partArea / usableArea) : 0;
}

export function runPublicSheetBenchmarks(): PublicSheetBenchmarkResult[] {
  return publicSheetBenchmarkCases.map((benchmark) => {
    const result = optimizeSheetProject(benchmark.input);
    return {
      id: benchmark.id,
      label: benchmark.label,
      purpose: benchmark.purpose,
      sheetsUsed: result.sheetsUsed.length,
      areaLowerBoundSheets: areaLowerBound(benchmark.input),
      placedParts: result.sheetsUsed.reduce((sum, sheet) => sum + sheet.placements.length, 0),
      unplacedParts: result.unplacedParts.length,
      yieldRate: result.yieldRate,
      cutSteps: result.sheetsUsed.reduce((sum, sheet) => sum + sheet.cutSequence.length, 0),
      durationMs: result.durationMs,
      algorithm: result.algorithm
    };
  });
}
