import { describe, expect, it } from 'vitest';
import { calculateRoomAreaSqft, calculateRoomVolumeCuft, calculateAcBtu, btuToTons, tonsToBtu, btuToThermalKw, pintsToLiters, litersToPints, lookupDehumidifierBase, calculateDehumidifierSize, achToCfm, cfmToAch, calculateBathroomFanCfm, calculateGarageVentilation } from '@/src/lib/calculators';

describe('HVAC calculator formulas', () => {
  it('calculates room area and volume', () => {
    expect(calculateRoomAreaSqft({ lengthFt: 12, widthFt: 10 })).toBe(120);
    expect(calculateRoomVolumeCuft({ lengthFt: 12, widthFt: 10, ceilingHeightFt: 8 })).toBe(960);
  });

  it('calculates AC BTU range and adjustments', () => {
    const base = calculateAcBtu({ areaSqft: 300, ceilingHeightFt: 8, sunExposure: 'average', occupants: 2 });
    expect(base.baseBtu).toBe(6000);
    expect(base.rangeLow).toBe(5500);
    expect(base.rangeHigh).toBe(6500);

    const adjusted = calculateAcBtu({ areaSqft: 300, ceilingHeightFt: 10, sunExposure: 'sunny', occupants: 4, kitchen: true, insulation: 'poor' });
    expect(adjusted.adjustments.length).toBeGreaterThanOrEqual(5);
    expect(adjusted.warnings.some((warning) => warning.includes('Manual J'))).toBe(true);
  });

  it('converts HVAC units', () => {
    expect(btuToTons(24000)).toBe(2);
    expect(tonsToBtu(1.5)).toBe(18000);
    expect(btuToThermalKw(12000)).toBeCloseTo(3.516852, 5);
    expect(pintsToLiters(50)).toBeCloseTo(23.6588, 3);
    expect(litersToPints(23.65882365)).toBeCloseTo(50, 3);
  });

  it('calculates dehumidifier sizing with warnings', () => {
    expect(lookupDehumidifierBase(1000, 'damp')).toEqual({ low: 35, high: 50 });
    const result = calculateDehumidifierSize({ areaSqft: 1000, dampness: 'very-damp', basement: true, waterIntrusion: true });
    expect(result.rangeHigh).toBeGreaterThanOrEqual(80);
    expect(result.warnings.some((warning) => warning.includes('Water intrusion'))).toBe(true);
    expect(result.warnings.some((warning) => warning.toLowerCase().includes('mold'))).toBe(true);
  });

  it('calculates CFM and ACH', () => {
    expect(achToCfm(1000, 6)).toBe(100);
    expect(cfmToAch(100, 1000)).toBe(6);
  });

  it('calculates bathroom and garage ventilation boundaries', () => {
    expect(calculateBathroomFanCfm({ areaSqft: 40, toilet: 1, shower: 0, tub: 0, jettedTub: 0 }).recommendedCfm).toBe(50);
    expect(calculateBathroomFanCfm({ areaSqft: 80, toilet: 1, shower: 1, tub: 1, jettedTub: 1 }).recommendedCfm).toBe(250);
    const garage = calculateGarageVentilation({ lengthFt: 20, widthFt: 20, ceilingHeightFt: 9, targetAch: 6 });
    expect(garage.cfm).toBe(360);
    expect(garage.warnings.some((warning) => warning.includes('CO control'))).toBe(true);
  });
});
