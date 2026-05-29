import type { LinearProjectInput, SheetProjectInput } from '@/core/types';

export type SheetPresetKey =
  | 'imperial-sheet'
  | 'metric-sheet'
  | 'plywood-4x8'
  | 'mdf-metric'
  | 'acrylic-metric'
  | 'melamine-cabinet'
  | 'cabinet'
  | 'bookshelf'
  | 'drawer-box'
  | 'closet-shelf'
  | 'workbench';

export type LinearPresetKey =
  | 'imperial-linear'
  | 'metric-linear'
  | 'linear-bar'
  | 'steel-tube'
  | 'aluminum-extrusion'
  | 'pvc-pipe'
  | 'lumber-length'
  | 'rebar';

function sheetProject(
  id: string,
  unit: SheetProjectInput['unit'],
  stockLabel: string,
  width: string,
  height: string,
  kerf: string,
  parts: SheetProjectInput['parts']
): SheetProjectInput {
  const stockMaterial = parts.find((part) => part.material?.trim())?.material ?? stockLabel;
  return {
    unit,
    kerf,
    strategy: 'least_waste',
    stock: { id: `${id}-stock`, label: stockLabel, width, height, quantity: 'auto', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material: stockMaterial, cost: '', grainDirection: 'none' },
    parts
  };
}

function linearProject(
  id: string,
  unit: LinearProjectInput['unit'],
  stockLabel: string,
  length: string,
  kerf: string,
  parts: LinearProjectInput['parts']
): LinearProjectInput {
  const stockMaterial = parts.find((part) => part.material?.trim())?.material ?? stockLabel;
  return {
    unit,
    kerf,
    strategy: 'least_waste',
    stock: { id: `${id}-stock`, label: stockLabel, length, quantity: 'auto', trimStart: '0', trimEnd: '0', material: stockMaterial, cost: '' },
    parts
  };
}

export const sheetPresets: Record<SheetPresetKey, SheetProjectInput> = {
  'imperial-sheet': sheetProject('imperial', 'in', 'Plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'p1', label: 'Cabinet side', width: '23 3/4', height: '34 1/2', quantity: '2', allowRotation: true, material: 'Plywood' },
    { id: 'p2', label: 'Shelf', width: '30', height: '11 1/4', quantity: '3', allowRotation: true, material: 'Plywood' },
    { id: 'p3', label: 'Top bottom', width: '30', height: '23 3/4', quantity: '2', allowRotation: true, material: 'Plywood' }
  ]),
  'metric-sheet': sheetProject('metric', 'mm', '2440 × 1220 mm MDF', '1220mm', '2440mm', '3mm', [
    { id: 'm1', label: 'Side panel', width: '600mm', height: '800mm', quantity: '2', allowRotation: true, material: 'MDF' },
    { id: 'm2', label: 'Shelf', width: '580mm', height: '300mm', quantity: '4', allowRotation: true, material: 'MDF' }
  ]),
  'plywood-4x8': sheetProject('plywood-4x8', 'in', 'Plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'pw1', label: 'Side panel', width: '23 3/4', height: '72', quantity: '2', allowRotation: true, material: 'Plywood' },
    { id: 'pw2', label: 'Shelf', width: '30', height: '11 1/4', quantity: '5', allowRotation: true, material: 'Plywood' },
    { id: 'pw3', label: 'Back rail', width: '30', height: '3 1/2', quantity: '3', allowRotation: true, material: 'Plywood' }
  ]),
  'mdf-metric': sheetProject('mdf', 'mm', 'MDF 2440 × 1220', '1220mm', '2440mm', '3mm', [
    { id: 'mdf1', label: 'Door panel', width: '500mm', height: '720mm', quantity: '4', allowRotation: true, material: 'MDF' },
    { id: 'mdf2', label: 'Drawer front', width: '480mm', height: '180mm', quantity: '4', allowRotation: true, material: 'MDF' }
  ]),
  'acrylic-metric': sheetProject('acrylic', 'mm', 'Acrylic sheet 1220 × 2440', '1220mm', '2440mm', '2mm', [
    { id: 'ac1', label: 'Display side', width: '300mm', height: '450mm', quantity: '4', allowRotation: true, material: 'Acrylic' },
    { id: 'ac2', label: 'Sign panel', width: '600mm', height: '300mm', quantity: '3', allowRotation: true, material: 'Acrylic' }
  ]),
  'melamine-cabinet': sheetProject('melamine', 'mm', 'Melamine board 2440 × 1220', '1220mm', '2440mm', '3mm', [
    { id: 'mel1', label: 'Cabinet side grain locked', width: '600mm', height: '720mm', quantity: '2', allowRotation: false, material: 'Melamine', grainLock: 'vertical', edgeBanding: { top: true, bottom: true } },
    { id: 'mel2', label: 'Shelf', width: '560mm', height: '300mm', quantity: '3', allowRotation: true, material: 'Melamine' },
    { id: 'mel3', label: 'Top bottom', width: '560mm', height: '560mm', quantity: '2', allowRotation: true, material: 'Melamine' }
  ]),
  'cabinet': sheetProject('cabinet', 'in', 'Cabinet plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'cab1', label: 'Base side', width: '23 3/4', height: '34 1/2', quantity: '2', allowRotation: false, material: 'Plywood', grainLock: 'vertical', edgeBanding: { top: true } },
    { id: 'cab2', label: 'Deck', width: '30', height: '23 3/4', quantity: '2', allowRotation: true, material: 'Plywood' },
    { id: 'cab3', label: 'Adjustable shelf', width: '29 1/4', height: '11 1/4', quantity: '3', allowRotation: true, material: 'Plywood' }
  ]),
  'bookshelf': sheetProject('bookshelf', 'in', 'Bookshelf plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'book1', label: 'Tall side', width: '11 1/4', height: '72', quantity: '2', allowRotation: false, material: 'Plywood', grainLock: 'vertical', edgeBanding: { left: true, right: true } },
    { id: 'book2', label: 'Shelf', width: '30', height: '11 1/4', quantity: '6', allowRotation: true, material: 'Plywood' },
    { id: 'book3', label: 'Top cap', width: '32', height: '12', quantity: '1', allowRotation: true, material: 'Plywood' }
  ]),
  'drawer-box': sheetProject('drawer-box', 'in', 'Drawer box plywood 5×5', '60 in', '60 in', '1/8', [
    { id: 'draw1', label: 'Drawer side', width: '4 1/2', height: '18', quantity: '8', allowRotation: true, material: 'Baltic birch' },
    { id: 'draw2', label: 'Drawer front back', width: '4 1/2', height: '24', quantity: '8', allowRotation: true, material: 'Baltic birch' },
    { id: 'draw3', label: 'Drawer bottom', width: '22 1/2', height: '16 1/2', quantity: '4', allowRotation: true, material: 'Baltic birch' }
  ]),
  'closet-shelf': sheetProject('closet', 'in', 'Closet shelf plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'closet1', label: 'Long shelf', width: '14', height: '48', quantity: '4', allowRotation: true, material: 'Plywood' },
    { id: 'closet2', label: 'Divider', width: '14', height: '32', quantity: '3', allowRotation: true, material: 'Plywood' }
  ]),
  'workbench': sheetProject('workbench', 'in', 'Workbench plywood 4×8', '48 in', '96 in', '1/8', [
    { id: 'bench1', label: 'Bench top layer', width: '30', height: '72', quantity: '2', allowRotation: true, material: 'Plywood' },
    { id: 'bench2', label: 'Lower shelf', width: '24', height: '60', quantity: '1', allowRotation: true, material: 'Plywood' },
    { id: 'bench3', label: 'Gusset', width: '8', height: '12', quantity: '6', allowRotation: true, material: 'Plywood' }
  ])
};


sheetPresets['plywood-4x8'].stock.cost = '48';
sheetPresets['plywood-4x8'].extraStocks = [
  { id: 'pw-offcut-1', label: 'Saved plywood offcut', width: '24 in', height: '48 in', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material: 'Plywood', cost: '0', isOffcut: true, grainDirection: 'none' }
];
sheetPresets['cabinet'].stock.cost = '62';
sheetPresets['cabinet'].extraStocks = [
  { id: 'cab-offcut-1', label: 'Cabinet offcut', width: '20 in', height: '32 in', quantity: '1', trimTop: '0', trimRight: '0', trimBottom: '0', trimLeft: '0', material: 'Plywood', cost: '0', isOffcut: true, grainDirection: 'none' }
];
sheetPresets['melamine-cabinet'].stock.cost = '70';
sheetPresets['drawer-box'].stock.cost = '58';

export const linearPresets: Record<LinearPresetKey, LinearProjectInput> = {
  'imperial-linear': linearProject('imperial-linear', 'in', '8 ft lumber', '96 in', '1/8', [
    { id: 'l1', label: 'Long rail', length: '42', quantity: '4', material: 'Lumber' },
    { id: 'l2', label: 'Short stile', length: '18 1/2', quantity: '6', material: 'Lumber' }
  ]),
  'metric-linear': linearProject('metric-linear', 'mm', '6 m aluminum extrusion', '6000mm', '2mm', [
    { id: 'e1', label: 'Frame long', length: '1200mm', quantity: '4', material: 'Aluminum extrusion' },
    { id: 'e2', label: 'Frame short', length: '760mm', quantity: '4', material: 'Aluminum extrusion' }
  ]),
  'linear-bar': linearProject('linear-bar', 'in', 'Bar stock 8 ft', '96 in', '1/8', [
    { id: 'bar1', label: 'Brace', length: '31 1/2', quantity: '5', material: 'Bar stock' },
    { id: 'bar2', label: 'Spacer', length: '12', quantity: '8', material: 'Bar stock' }
  ]),
  'steel-tube': linearProject('steel-tube', 'mm', 'Steel tube 6 m', '6000mm', '2mm', [
    { id: 'steel1', label: 'Leg tube', length: '900mm', quantity: '8', material: 'Steel tube' },
    { id: 'steel2', label: 'Cross tube', length: '1450mm', quantity: '6', material: 'Steel tube' }
  ]),
  'aluminum-extrusion': linearProject('aluminum', 'mm', 'Aluminum extrusion 6 m', '6000mm', '2mm', [
    { id: 'alu1', label: 'Vertical rail', length: '1800mm', quantity: '4', material: 'Aluminum extrusion' },
    { id: 'alu2', label: 'Horizontal rail', length: '760mm', quantity: '8', material: 'Aluminum extrusion' }
  ]),
  'pvc-pipe': linearProject('pvc', 'in', 'PVC pipe 10 ft', '120 in', '1/8', [
    { id: 'pvc1', label: 'Hoop upright', length: '36', quantity: '8', material: 'PVC pipe' },
    { id: 'pvc2', label: 'Cross connector', length: '18', quantity: '10', material: 'PVC pipe' }
  ]),
  'lumber-length': linearProject('lumber', 'in', '2×4 lumber 8 ft', '96 in', '1/8', [
    { id: 'lum1', label: 'Stud', length: '32', quantity: '12', material: 'Lumber' },
    { id: 'lum2', label: 'Cleat', length: '14 1/2', quantity: '10', material: 'Lumber' }
  ]),
  'rebar': linearProject('rebar', 'mm', 'Rebar 6 m', '6000mm', '3mm', [
    { id: 'reb1', label: 'Footing bar', length: '1800mm', quantity: '8', material: 'Rebar' },
    { id: 'reb2', label: 'Tie bar', length: '950mm', quantity: '12', material: 'Rebar' },
    { id: 'reb3', label: 'Short dowel', length: '420mm', quantity: '16', material: 'Rebar' }
  ])
};


linearPresets['imperial-linear'].stock.cost = '7.50';
linearPresets['imperial-linear'].extraStocks = [
  { id: 'lumber-offcut-1', label: '48 in saved offcut', length: '48 in', quantity: '1', trimStart: '0', trimEnd: '0', material: 'Lumber', cost: '0', isOffcut: true }
];
linearPresets['steel-tube'].stock.cost = '34';
linearPresets['aluminum-extrusion'].stock.cost = '42';
linearPresets['pvc-pipe'].stock.cost = '8';
linearPresets['lumber-length'].stock.cost = '6';
linearPresets['rebar'].stock.cost = '18';

export const defaultSheetProject = sheetPresets['imperial-sheet'];
export const metricSheetProject = sheetPresets['metric-sheet'];
export const defaultLinearProject = linearPresets['imperial-linear'];
export const linearMetricProject = linearPresets['metric-linear'];
