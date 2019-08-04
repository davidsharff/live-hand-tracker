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
  CHECK: 'check'
};

export const positionLabels = {
  SB: 'SB',
  BB: 'BB'
};

const { SB, BB } = positionLabels;

export const positionLabelsMap = {
  // TODO: get feedback/lookup what labels should be for smaller tables.
  '10':['B', SB, BB, 'EP1', 'EP2', 'MP1', 'MP2', 'MP3', 'HJ', 'CO'],
  '9': ['B', SB, BB, 'EP1', 'EP2', 'MP1', 'MP2', 'HJ', 'CO'],
  '8': ['B', SB, BB, 'EP1', 'MP1', 'MP2', 'HJ', 'CO'],
  '7': ['B', SB, BB, 'EP1', 'MP1', 'HJ', 'CO'],
  '6': ['B', SB, BB, 'MP1', 'HJ', 'CO'],
  '5': ['B', SB, BB, 'HJ', 'CO'],
  '4': ['B', SB, BB, 'CO'],
  '3': ['B', SB, BB],
  '2': ['B', BB]
};

export const cardInputTypes = {
  HOLE_CARDS: 'hole-cards',
  ...bettingRounds
};