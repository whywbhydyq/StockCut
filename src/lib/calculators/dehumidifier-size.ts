import type { DampnessLevel } from '@/src/lib/config/dehumidifier-assumptions';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export type DehumidifierInput = {
  areaSqft: number;
  dampness: DampnessLevel;
  basement?: boolean;
  temperatureF?: number;
  waterIntrusion?: boolean;
  continuousDrain?: boolean;
};

const TABLE: Array<[number, Record<DampnessLevel, [number, number]>]> = [
  [500, { 'slightly-damp': [20, 30], damp: [25, 35], 'very-damp': [35, 50], wet: [50, 70] }],
  [1000, { 'slightly-damp': [30, 40], damp: [35, 50], 'very-damp': [50, 70], wet: [70, 90] }],
  [1500, { 'slightly-damp': [40, 50], damp: [50, 70], 'very-damp': [70, 90], wet: [90, 110] }],
  [999999, { 'slightly-damp': [50, 70], damp: [70, 90], 'very-damp': [90, 120], wet: [120, 150] }]
];

export function lookupDehumidifierBase(areaSqft: number, dampness: DampnessLevel) {
  const row = TABLE.find(([maxArea]) => areaSqft <= maxArea) ?? TABLE[TABLE.length - 1];
  const [low, high] = row[1][dampness];
  return { low, high };
}

export function calculateDehumidifierSize(input: DehumidifierInput) {
  const areaSqft = Math.max(1, input.areaSqft);
  const base = lookupDehumidifierBase(areaSqft, input.dampness);
  let low = base.low;
  let high = base.high;
  const adjustments: string[] = [];

  if (input.basement) {
    low += 5;
    high += 10;
    adjustments.push('Basement or below-grade adjustment');
  }

  if ((input.temperatureF ?? 70) < 60) {
    adjustments.push('Cool space: verify low-temperature operation because removal rate can drop.');
  }

  const warnings = [
    PROFESSIONAL_BOUNDARY,
    'Dehumidifier sizing is not mold remediation, waterproofing, or a guarantee of indoor air quality.'
  ];

  if (input.waterIntrusion) warnings.push('Water intrusion present: repair the water source before relying on a dehumidifier.');
  if (!input.continuousDrain) warnings.push('For unattended operation, consider a continuous drain or pump model.');

  return {
    areaSqft,
    rangeLow: low,
    rangeHigh: high,
    productClass: high <= 35 ? 'compact' : high <= 55 ? 'mid-size' : high <= 80 ? 'large' : 'high-capacity',
    drainageRecommendation: input.continuousDrain ? 'Continuous drain selected; verify hose or pump installation.' : 'Plan bucket emptying or choose a continuous drain model.',
    adjustments,
    warnings
  };
}
