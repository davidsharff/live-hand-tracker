import _ from 'lodash';

import actionTypes from '../actionTypes';

const baseSession =  {
  location: '',
  defaultHeroSeatIndex: null,
  defaultSeats: [],
  smallBlind: null,
  bigBlind: null
};

const cachedSession = JSON.parse(localStorage.getItem('savedSession'));
const initialState = cachedSession || null;

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.CREATE_SESSION:
      return baseSession;

    case actionTypes.UPDATE_SESSION_LOCATION: {
      return _.assign({}, state, {
        location: payload.location
      });
    }

    case actionTypes.UPDATE_SESSION_HERO_SEAT_INDEX: {
      return _.assign({}, state, {
        defaultHeroSeatIndex: payload.seatIndex,
        defaultSeats: state.defaultSeats.map((s, i) =>
          i === payload.seatIndex
            ? _.assign({}, s, { isActive: true })
            : s
        )
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
        defaultSeats: change < 0
          ? defaultSeats.slice(0, change)
          : change > 0
            ? [ ...defaultSeats, ...(_.range(0, change).map(() => ({ isActive: true, holeCards: []})))]
            : defaultSeats
      });
    }

    case actionTypes.UPDATE_SESSION_SMALL_BLIND: {
      return _.assign({}, state, {
        smallBlind: payload.smallBlind
      });
    }

    case actionTypes.UPDATE_SESSION_BIG_BLIND: {
      return _.assign({}, state, {
        bigBlind: payload.bigBlind
      });
    }
    // TODO: case: actionTypes.SET_SESSION_DEFAULT_SEATS
    default:
      return state;
  }
}

export function isValidSession(session) {
  return session.smallBlind && session.bigBlind && session.defaultSeats.length && session.defaultHeroSeatIndex;
}
