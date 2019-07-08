import _ from 'lodash';

import actionTypes from '../actionTypes';
import { defaultSeats } from '../../constants';

const initialSession =  {
  location: '',
  defaultHeroSeatIndex: null,
  defaultSeats
};

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = null, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.CREATE_SESSION:
      return initialSession;

    case actionTypes.UPDATE_SESSION_LOCATION: {
      return _.assign({}, state, {
        location: payload.location
      });
    }

    case actionTypes.UPDATE_SESSION_HERO_SEAT_INDEX: {
      return _.assign({}, state, {
        defaultHeroSeatIndex: payload.seatIndex
      });
    }

    case actionTypes.UPDATE_SESSION_IS_ACTIVE_SEAT: {
      const { seatIndex } = payload;

      const targetSeat = state.defaultSeats[seatIndex];

      return _.assign({}, state, {
        defaultSeats: [
          ...state.defaultSeats.slice(0, seatIndex),
          _.assign({}, targetSeat, { isActive: !targetSeat.isActive }),
          ...state.defaultSeats.slice(seatIndex + 1)
        ]
      });
    }

    case actionTypes.UPDATE_SESSION_TOTAL_SEATS: {
      const { defaultSeats } = state;
      const { change } = payload;

      return _.assign({}, state, {
        defaultSeats: change === - 1
          ? defaultSeats.slice(0, -1)
          : [
            ...defaultSeats,
            { isActive: true, holeCards: [] }
          ]
      });
    }
    // TODO: case: actionTypes.SET_SESSION_DEFAULT_SEATS
    default:
      return state;
  }
}
