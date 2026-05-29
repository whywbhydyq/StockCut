export function btuToTons(btuPerHour: number) {
  return btuPerHour / 12000;
}

export function tonsToBtu(tons: number) {
  return tons * 12000;
}

export function btuToThermalKw(btuPerHour: number) {
  return btuPerHour * 0.000293071;
}

export function thermalKwToBtu(thermalKw: number) {
  return thermalKw / 0.000293071;
}

export function inputWattsFromEer(btuPerHour: number, eer: number) {
  return eer > 0 ? btuPerHour / eer : 0;
}

export function pintsToLiters(pints: number) {
  return pints * 0.473176473;
}

export function litersToPints(liters: number) {
  return liters / 0.473176473;
}
