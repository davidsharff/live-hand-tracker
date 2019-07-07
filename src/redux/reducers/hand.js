import { bettingRounds } from '../../constants';

const initialState = {
  bettingRound: bettingRounds[0],
  heroSeatIndex: 3,
  knownHoleCards: []
};

export default function hand(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}