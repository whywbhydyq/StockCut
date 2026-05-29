export type RoomAreaInput = {
  lengthFt?: number;
  widthFt?: number;
  areaSqft?: number;
};

export function calculateRoomAreaSqft(input: RoomAreaInput) {
  if (input.areaSqft && input.areaSqft > 0) return input.areaSqft;
  return Math.max(0, input.lengthFt ?? 0) * Math.max(0, input.widthFt ?? 0);
}
