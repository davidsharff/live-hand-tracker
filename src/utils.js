

export function isTinyScreen() {
  return window.matchMedia('(max-width: 320px)').matches;
}

export function isReasonableScreen() {
  return !window.matchMedia('(max-width: 320px)').matches;
}

export function formatSeatIndexLabel(seatIndex) {
  const seatNumStr = seatIndex + 1 + '';

  return `Seat: ${seatNumStr.length === 1 ? ('0' + seatNumStr) : seatNumStr}`;

}