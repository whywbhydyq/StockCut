import { calculateCfmByAch } from './cfm-ach';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export function calculateGarageVentilation(input: { lengthFt: number; widthFt: number; ceilingHeightFt: number; targetAch: number }) {
  const result = calculateCfmByAch(input);
  return {
    ...result,
    warnings: [
      PROFESSIONAL_BOUNDARY,
      'Garage ventilation estimate is educational only and must not be used for CO control, combustion appliances, commercial garages, or code compliance.',
      'Use CO detectors and consult a qualified professional for vehicle exhaust, fuel-burning equipment, or attached-garage safety questions.'
    ]
  };
}
