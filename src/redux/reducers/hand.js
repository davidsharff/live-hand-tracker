import _ from 'lodash';
import { bettingRounds } from '../../constants';

import actionTypes from '../actionTypes';

const initialState = {
  bettingRound: bettingRounds[0],
  heroSeatIndex: 3,
  knownHoleCards: []
};

export default function hand(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_HERO_CARDS: {
      return _.assign({}, state, {
        knownHoleCards: _.some(state.knownHoleCards, {seatIndex: state.heroSeatIndex})
          ? _.map(state.knownHoleCards, (o) =>
            o.seatIndex === state.heroSeatIndex
              ? _.assign(o, {holeCards: payload.holeCards})
              : o
          )
          : [...state.knownHoleCards, {seatIndex: state.heroSeatIndex, holeCards: payload.holeCards}]
      });
    }
    default:
      return state;
  }
}