

// TODO: discovered material-ui exposes mediaQuery hook. Use that instead. Only bummer is that it can't be directly
//       referenced in styled-components but that may have been bad practice regardless.

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