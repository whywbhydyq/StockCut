import { calculateRoomVolumeCuft, type RoomVolumeInput } from './room-volume';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';

export function achToCfm(volumeCuft: number, targetAch: number) {
  return (volumeCuft * targetAch) / 60;
}

export function cfmToAch(cfm: number, volumeCuft: number) {
  return volumeCuft > 0 ? (cfm * 60) / volumeCuft : 0;
}

export function calculateCfmByAch(input: RoomVolumeInput & { targetAch: number }) {
  const volumeCuft = calculateRoomVolumeCuft(input);
  return {
    volumeCuft,
    targetAch: input.targetAch,
    cfm: achToCfm(volumeCuft, input.targetAch),
    warnings: [PROFESSIONAL_BOUNDARY, 'CFM/ACH math does not design ducts, prove indoor air quality, or establish code compliance.']
  };
}

export function calculateAch(input: RoomVolumeInput & { cfm: number }) {
  const volumeCuft = calculateRoomVolumeCuft(input);
  return {
    volumeCuft,
    cfm: input.cfm,
    ach: cfmToAch(input.cfm, volumeCuft),
    warnings: [PROFESSIONAL_BOUNDARY, 'ACH is an airflow ratio, not a health, odor, source-control, or code-compliance guarantee.']
  };
}
