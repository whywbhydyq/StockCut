import type { DisplayUnit, LinearStockInput, StockSheetInput } from '@/core/types';

const PREFIX = 'stockcut:offcut-inventory:';

export interface SheetOffcutInventoryItem {
  id: string;
  label: string;
  width: string;
  height: string;
  material?: string;
  grainDirection?: StockSheetInput['grainDirection'];
  unit: DisplayUnit;
  source: string;
  savedAt: string;
}

export interface LinearOffcutInventoryItem {
  id: string;
  label: string;
  length: string;
  material?: string;
  unit: DisplayUnit;
  source: string;
  savedAt: string;
}

function loadList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) as T[] : [];
  } catch {
    window.localStorage.removeItem(`${PREFIX}${key}`);
    return [];
  }
}

function saveList<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value.slice(0, 100)));
  } catch {
    // localStorage can be disabled or full; offcut inventory must not block optimization.
  }
}

export function loadSheetOffcutInventory(): SheetOffcutInventoryItem[] {
  return loadList<SheetOffcutInventoryItem>('sheet');
}

export function saveSheetOffcutInventory(items: SheetOffcutInventoryItem[]): void {
  saveList('sheet', items);
}

export function loadLinearOffcutInventory(): LinearOffcutInventoryItem[] {
  return loadList<LinearOffcutInventoryItem>('linear');
}

export function saveLinearOffcutInventory(items: LinearOffcutInventoryItem[]): void {
  saveList('linear', items);
}

export function sheetInventoryToStock(item: SheetOffcutInventoryItem): StockSheetInput {
  return {
    id: item.id,
    label: item.label,
    width: item.width,
    height: item.height,
    quantity: '1',
    trimTop: '0',
    trimRight: '0',
    trimBottom: '0',
    trimLeft: '0',
    material: item.material,
    grainDirection: item.grainDirection ?? 'none',
    cost: '0',
    isOffcut: true
  };
}

export function linearInventoryToStock(item: LinearOffcutInventoryItem): LinearStockInput {
  return {
    id: item.id,
    label: item.label,
    length: item.length,
    quantity: '1',
    trimStart: '0',
    trimEnd: '0',
    material: item.material,
    cost: '0',
    isOffcut: true
  };
}
