export type DisplayUnit = 'mm' | 'cm' | 'in' | 'ft-in';
export type ProjectMode = 'sheet-2d' | 'linear-1d';
export type OptimizationStrategy = 'least_stock' | 'least_waste' | 'fewer_cuts';

export interface DimensionValue {
  valueUm: number;
  originalInput?: string;
}

export type GrainLock = 'none' | 'horizontal' | 'vertical';

export interface EdgeBanding {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

export interface SheetPartInput {
  id: string;
  label: string;
  width: string;
  height: string;
  quantity: string;
  allowRotation: boolean;
  material?: string;
  grainLock?: GrainLock;
  edgeBanding?: EdgeBanding;
}


export interface StockSheetInput {
  id: string;
  label: string;
  width: string;
  height: string;
  quantity: string;
  trimTop: string;
  trimRight: string;
  trimBottom: string;
  trimLeft: string;
  material?: string;
  grainDirection?: GrainLock;
  cost?: string;
  isOffcut?: boolean;
}


export interface LinearPartInput {
  id: string;
  label: string;
  length: string;
  quantity: string;
  material?: string;
  /** Planning note only: miter/angle metadata is printed/exported, but it does not change straight-stock length geometry. */
  miterAngle?: string;
  notes?: string;
}

export interface LinearStockInput {
  id: string;
  label: string;
  length: string;
  quantity: string;
  trimStart: string;
  trimEnd: string;
  material?: string;
  cost?: string;
  isOffcut?: boolean;
}


export interface SheetProjectInput {
  unit: DisplayUnit;
  kerf: string;
  strategy?: OptimizationStrategy;
  stock: StockSheetInput;
  extraStocks?: StockSheetInput[];
  parts: SheetPartInput[];
}


export interface LinearProjectInput {
  unit: DisplayUnit;
  kerf: string;
  strategy?: OptimizationStrategy;
  stock: LinearStockInput;
  extraStocks?: LinearStockInput[];
  parts: LinearPartInput[];
}


export type IssueSeverity = 'info' | 'warning' | 'error';
export type IssueCode =
  | 'INVALID_DIMENSION'
  | 'INVALID_QUANTITY'
  | 'KERF_TOO_LARGE'
  | 'PART_TOO_WIDE_FOR_STOCK'
  | 'PART_TOO_TALL_FOR_STOCK'
  | 'PART_TOO_LONG_FOR_STOCK'
  | 'ROTATION_LOCKED_WOULD_FIT_IF_ROTATED'
  | 'KERF_CAUSES_OVERFLOW'
  | 'TRIM_REDUCES_USABLE_AREA'
  | 'NO_STOCK_AVAILABLE'
  | 'MATERIAL_MISMATCH'
  | 'PASTE_ROW_ERROR'
  | 'MANUAL_LAYOUT_ADJUSTED';

export interface OptimizationWarning {
  code: IssueCode;
  message: string;
  suggestedFix?: string;
  partId?: string;
  stockId?: string;
  severity: IssueSeverity;
}

export interface SheetPlacement {
  partId: string;
  partLabel: string;
  instanceIndex: number;
  xUm: number;
  yUm: number;
  widthUm: number;
  heightUm: number;
  rotated: boolean;
  material?: string;
  grainLock?: GrainLock;
  edgeBanding?: EdgeBanding;
}


export interface OffcutRegion {
  xUm: number;
  yUm: number;
  widthUm: number;
  heightUm: number;
  areaUm2: number;
}

export interface OptimizedSheet {
  stockId: string;
  stockLabel: string;
  sheetIndex: number;
  widthUm: number;
  heightUm: number;
  usableXUm: number;
  usableYUm: number;
  usableWidthUm: number;
  usableHeightUm: number;
  placements: SheetPlacement[];
  offcuts: OffcutRegion[];
  material?: string;
  grainDirection?: GrainLock;
  stockCost?: number;
  isOffcut?: boolean;
}


export interface UnplacedPart {
  partId: string;
  label: string;
  widthUm: number;
  heightUm: number;
  reason: string;
}

export interface SheetOptimizationResult {
  algorithm: string;
  durationMs: number;
  sheetsUsed: OptimizedSheet[];
  unplacedParts: UnplacedPart[];
  yieldRate: number;
  wasteRate: number;
  totalPartAreaUm2: number;
  totalStockAreaUm2: number;
  estimatedStockCost: number;
  warnings: OptimizationWarning[];
}


export interface LinearPlacement {
  partId: string;
  partLabel: string;
  instanceIndex: number;
  startUm: number;
  lengthUm: number;
  miterAngle?: string;
  notes?: string;
}

export interface OptimizedLinearStock {
  stockId: string;
  stockLabel: string;
  stockIndex: number;
  lengthUm: number;
  usableLengthUm: number;
  cuts: LinearPlacement[];
  kerfCount: number;
  usedLengthUm: number;
  wasteLengthUm: number;
  material?: string;
  stockCost?: number;
  isOffcut?: boolean;
}


export interface UnplacedLinearCut {
  partId: string;
  label: string;
  lengthUm: number;
  reason: string;
}

export interface LinearOptimizationResult {
  algorithm: string;
  durationMs: number;
  stocksUsed: OptimizedLinearStock[];
  unplacedCuts: UnplacedLinearCut[];
  totalStockLengthUm: number;
  totalCutLengthUm: number;
  totalKerfLossUm: number;
  estimatedStockCost: number;
  wasteRate: number;
  warnings: OptimizationWarning[];
}

