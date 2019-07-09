import _ from 'lodash';

// TODO: change to sets everywhere it makes sense

export const PRE_FLOP = 'preflop';

export const bettingRounds = [
  PRE_FLOP
];
export const suits = ['club', 'heart', 'diamond', 'spade'];

export const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const cards = _.flatMap(suits, (s) => cardValues.map(c =>
  c + s.slice(0, 1)
));