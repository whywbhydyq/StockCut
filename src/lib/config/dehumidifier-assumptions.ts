export const dehumidifierAssumptions = {
  sourceId: 'energy-star-dehumidifier',
  unit: 'pints_per_day',
  model: 'area plus dampness level with basement and low-temperature cautions',
  notes: 'Estimate only. Actual needs depend on moisture source, air leakage, temperature, drainage and product rating method.'
} as const;

export type DampnessLevel = 'slightly-damp' | 'damp' | 'very-damp' | 'wet';

export const dampnessLevels: Record<DampnessLevel, string> = {
  'slightly-damp': 'Feels humid or mildly clammy',
  damp: 'Musty smell or frequent high humidity',
  'very-damp': 'Visible condensation or persistent dampness',
  wet: 'Water marks, seepage, or active moisture source'
};
