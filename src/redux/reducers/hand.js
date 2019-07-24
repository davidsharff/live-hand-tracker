import _ from 'lodash';

import actionTypes from '../actionTypes';

const initialState = null;

export default function handReducer(handState = initialState, action) {
  const { type, payload } = action;

  switch (type) {

    case actionTypes.CREATE_HAND:
      return payload.hand;

    case actionTypes.SET_HERO_CARDS: {
      const { holeCards } = payload;
      return _.assign({}, handState, {
        seats: [
          ...handState.seats.slice(0, handState.heroSeatIndex),
          _.assign({}, handState.seats[handState.heroSeatIndex], { holeCards }),
          ...handState.seats.slice(handState.heroSeatIndex + 1)
        ]
      });
    }

    case actionTypes.SET_BUTTON_INDEX: {
      return _.assign({}, handState, {
        buttonSeatIndex: payload.buttonSeatIndex
      });
    }

    // TODO: consider decorating seat index and then sorting based on button when button index is set.
    default:
      return handState;
  }
}