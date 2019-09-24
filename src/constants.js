import _ from 'lodash';

// TODO: change to sets everywhere it makes sense

export const PRE_FLOP = 'preflop';

export const bettingRounds = {
  PRE_FLOP,
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river'
};

// TODO: there could be better way to define these.
export const sortedBettingRounds = [bettingRounds.PRE_FLOP, bettingRounds.FLOP, bettingRounds.TURN, bettingRounds.RIVER];
export const suits = ['club', 'heart', 'diamond', 'spade'];

// TODO: change 10 --> T so that all cards have same str length.
export const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const cards = _.flatMap(suits, (s) => cardValues.map(c =>
  c + s.slice(0, 1)
));

export const handActionTypes = {
  POST: 'post',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  FOLD: 'fold',
  CHECK: 'check',
  MUCK: 'muck',
  REVEAL: 'reveal'
};

export const passiveActionTypes = [
  handActionTypes.CHECK,
  handActionTypes.CALL,
  handActionTypes.MUCK,
  handActionTypes.FOLD
];

export const cascadeActionTypes = [
  handActionTypes.FOLD,
  handActionTypes.CHECK
];

export const positionLabels = {
  SB: 'SB',
  BB: 'BB'
};

const { SB, BB } = positionLabels;

export const positionLabelsMap = {
  // TODO: get feedback/lookup what labels should be for smaller tables.
  '10':[SB, BB, 'E1', 'E2', 'M1', 'M2', 'M3', 'HJ', 'CO', 'B'],
  '9': [SB, BB, 'E1', 'E2', 'M1', 'M2', 'HJ', 'CO', 'B'],
  '8': [SB, BB, 'E1', 'M1', 'M2', 'HJ', 'CO', 'B'],
  '7': [SB, BB, 'E1', 'M1', 'HJ', 'CO', 'B'],
  '6': [SB, BB, 'M1', 'HJ', 'CO', 'B'],
  '5': [SB, BB, 'HJ', 'CO', 'B'],
  '4': [SB, BB, 'CO', 'B'],
  '3': [SB, BB, 'B'],
  '2': [BB, 'B']
};

export const cardInputTypes = {
  HOLE_CARDS: 'hole-cards',
  ...bettingRounds
};