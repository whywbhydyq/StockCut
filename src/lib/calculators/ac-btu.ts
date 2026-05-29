import { acSizingAssumptions, commonAcSizesBtu } from '@/src/lib/config/ac-sizing-assumptions';
import { calculateRoomAreaSqft } from './room-area';
import { calculateRoomVolumeCuft } from './room-volume';
import { btuToTons } from './btu-conversions';
import { roundTo, ceilTo } from '@/src/lib/formatting/numbers';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export type AcBtuInput = {
  lengthFt?: number;
  widthFt?: number;
  areaSqft?: number;
  ceilingHeightFt?: number;
  sunExposure?: 'average' | 'shaded' | 'sunny';
  occupants?: number;
  kitchen?: boolean;
  insulation?: 'poor' | 'average' | 'good';
};

export type Adjustment = {
  label: string;
  valueBtu: number;
  note: string;
};

export function calculateAcBtu(input: AcBtuInput) {
  const areaSqft = calculateRoomAreaSqft(input);
  const ceilingHeightFt = Math.max(1, input.ceilingHeightFt ?? 8);
  const occupants = Math.max(0, Math.round(input.occupants ?? 2));
  const baseBtu = areaSqft * acSizingAssumptions.baseBtuPerSqft;
  const adjustments: Adjustment[] = [];
  let adjustedBtu = baseBtu;

  if (input.sunExposure === 'shaded') {
    const valueBtu = adjustedBtu * acSizingAssumptions.shadeAdjustment;
    adjustedBtu += valueBtu;
    adjustments.push({ label: 'Heavy shade', valueBtu, note: '-10% DOE room AC adjustment' });
  }

  if (input.sunExposure === 'sunny') {
    const valueBtu = adjustedBtu * acSizingAssumptions.sunAdjustment;
    adjustedBtu += valueBtu;
    adjustments.push({ label: 'Very sunny room', valueBtu, note: '+10% DOE room AC adjustment' });
  }

  if (occupants > 2) {
    const valueBtu = (occupants - 2) * acSizingAssumptions.extraPersonBtu;
    adjustedBtu += valueBtu;
    adjustments.push({ label: 'Additional occupants', valueBtu, note: '600 BTU/h per person after two people' });
  }

  if (input.kitchen) {
    adjustedBtu += acSizingAssumptions.kitchenExtraBtu;
    adjustments.push({ label: 'Kitchen or heat source', valueBtu: acSizingAssumptions.kitchenExtraBtu, note: '+4,000 BTU/h' });
  }

  if (ceilingHeightFt !== acSizingAssumptions.baseCeilingHeightFt) {
    const before = adjustedBtu;
    adjustedBtu *= ceilingHeightFt / acSizingAssumptions.baseCeilingHeightFt;
    adjustments.push({ label: 'Ceiling height', valueBtu: adjustedBtu - before, note: 'Advanced height factor, not a DOE precision model' });
  }

  if (input.insulation === 'poor') {
    const valueBtu = adjustedBtu * 0.1;
    adjustedBtu += valueBtu;
    adjustments.push({ label: 'Poor insulation', valueBtu, note: 'Cautionary +10% comfort adjustment' });
  }

  if (input.insulation === 'good') {
    const valueBtu = adjustedBtu * -0.05;
    adjustedBtu += valueBtu;
    adjustments.push({ label: 'Good insulation', valueBtu, note: 'Cautionary -5% comfort adjustment' });
  }

  const rangeLow = Math.max(0, roundTo(adjustedBtu * acSizingAssumptions.rangeLowFactor, 500));
  const rangeHigh = Math.max(rangeLow, roundTo(adjustedBtu * acSizingAssumptions.rangeHighFactor, 500));
  const commonSizes = commonAcSizesBtu.filter((size) => size >= rangeLow && size <= rangeHigh + 1000);

  return {
    areaSqft,
    volumeCuft: calculateRoomVolumeCuft(input),
    baseBtu,
    adjustedBtu,
    rangeLow,
    rangeHigh,
    tonsLow: btuToTons(rangeLow),
    tonsHigh: btuToTons(rangeHigh),
    commonSizes: commonSizes.length ? commonSizes : [ceilTo(rangeHigh, 1000)],
    adjustments,
    warnings: [
      PROFESSIONAL_BOUNDARY,
      'Room AC estimates are not Manual J and must not be used for whole-home HVAC equipment selection.',
      ...(input.sunExposure === 'sunny' ? ['Large sunny windows can increase load beyond a simple area rule.'] : []),
      ...(input.kitchen ? ['Kitchen and equipment heat make comfort less predictable.'] : [])
    ]
  };
}
