export const acSizingAssumptions = {
  sourceId: 'doe-room-ac',
  baseBtuPerSqft: 20,
  shadeAdjustment: -0.1,
  sunAdjustment: 0.1,
  extraPersonBtu: 600,
  kitchenExtraBtu: 4000,
  baseCeilingHeightFt: 8,
  rangeLowFactor: 0.9,
  rangeHighFactor: 1.1,
  notes: 'Preliminary room-level estimate only. Ceiling-height and insulation adjustments are explicit calculator assumptions, not a full Manual J model.'
} as const;

export const commonAcSizesBtu = [5000, 6000, 8000, 10000, 12000, 14000, 15000, 18000, 24000] as const;
