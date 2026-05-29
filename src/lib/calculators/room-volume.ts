import { calculateRoomAreaSqft, type RoomAreaInput } from './room-area';

export type RoomVolumeInput = RoomAreaInput & {
  ceilingHeightFt?: number;
};

export function calculateRoomVolumeCuft(input: RoomVolumeInput) {
  const height = Math.max(1, input.ceilingHeightFt ?? 8);
  return calculateRoomAreaSqft(input) * height;
}
