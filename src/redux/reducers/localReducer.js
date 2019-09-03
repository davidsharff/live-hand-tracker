import _ from 'lodash';

import localActionTypes from '../localActionTypes';

// TODO: Support rake settings

const initialState =  {
  authToken: localStorage.getItem('authToken') || null
};

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case localActionTypes.SET_AUTH_TOKEN:
      return _.assign({}, state, { authToken: payload.authToken });

    // TODO: case: actionTypes.SET_SESSION_DEFAULT_SEATS
    default:
      return state;
  }
}

export function isValidSession(session) {
  return session.smallBlind && session.bigBlind && session.defaultSeats.length && session.defaultHeroSeatIndex;
}
