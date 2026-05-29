import { ventilationAssumptions } from '@/src/lib/config/ventilation-assumptions';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';
import { ceilTo } from '@/src/lib/formatting/numbers';

export type BathroomFanInput = {
  areaSqft: number;
  toilet?: number;
  shower?: number;
  tub?: number;
  jettedTub?: number;
  ductLengthFt?: number;
};

export function calculateBathroomFanCfm(input: BathroomFanInput) {
  const areaSqft = Math.max(1, input.areaSqft);
  const areaRuleCfm = Math.max(areaSqft * ventilationAssumptions.smallBathroomCfmPerSqft, ventilationAssumptions.bathroomMinCfm);
  const fixtureRuleCfm =
    Math.max(0, input.toilet ?? 1) * ventilationAssumptions.fixtureCfm.toilet +
    Math.max(0, input.shower ?? 1) * ventilationAssumptions.fixtureCfm.shower +
    Math.max(0, input.tub ?? 0) * ventilationAssumptions.fixtureCfm.tub +
    Math.max(0, input.jettedTub ?? 0) * ventilationAssumptions.fixtureCfm.jettedTub;
  const recommendedCfm = ceilTo(Math.max(areaRuleCfm, fixtureRuleCfm), 10);
  const warnings = [
    PROFESSIONAL_BOUNDARY,
    'Bathroom fan sizing must also consider duct length, elbows, termination cap, fan curve, sone rating, installation manual, and local code.'
  ];
  if ((input.ductLengthFt ?? 0) > 25) warnings.push('Long duct runs and bends can reduce delivered airflow.');
  return { areaSqft, areaRuleCfm, fixtureRuleCfm, recommendedCfm, warnings };
}
