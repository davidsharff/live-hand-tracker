import _ from 'lodash';

export const PRE_FLOP = 'preflop';

export const bettingRounds = [
  PRE_FLOP
];
export const suits = ['club', 'heart', 'diamond', 'spade'];

export const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const cards = _.flatMap(suits, (s) => cardValues.map(c =>
  c + s.slice(0, 1)
));

export const defaultSeats = _.range(0, 10).map(() => ({
  isActive: true,
  holeCards: []
}));