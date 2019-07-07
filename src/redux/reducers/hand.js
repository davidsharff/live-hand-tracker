import _ from 'lodash';
import { bettingRounds, defaultSeats } from '../../constants';

import actionTypes from '../actionTypes';

const initialState = {
  bettingRound: bettingRounds[0],
  heroSeatIndex: 3,
  // TODO: consider using a set instead of array.
  seats: defaultSeats
};

export default function hand(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_HERO_CARDS: {
      const { holeCards } = payload;
      return _.assign({}, state, {
        seats: [
          ...state.seats.slice(0, state.heroSeatIndex),
          _.assign({}, state.seats[state.heroSeatIndex], { holeCards }),
          ...state.seats.slice(state.heroSeatIndex + 1)
        ]
      });
    }
    default:
      return state;
  }
}