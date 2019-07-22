import _ from 'lodash';

import actionTypes from '../actionTypes';

const initialState = null;

export default function handReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {

    case actionTypes.CREATE_HAND:
      return payload.hand;

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