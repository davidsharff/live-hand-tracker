import _ from 'lodash';

import actionTypes from '../../redux/actionTypes';

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = null, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.CREATE_SESSION: {
      return payload.session;
    }

    case actionTypes.UPDATE_SESSION_LOCATION: {
      return _.assign({}, state, {
        location: payload.location
      });
    }

    case actionTypes.UPDATE_SESSION_DEFAULT_HERO_SEAT_INDEX: {
      return _.assign({}, state, {
        defaultHeroSeatIndex: payload.seatIndex
      });
    }
    // TODO: case: actionTypes.SET_SESSION_DEFAULT_SEATS
    default:
      return state;
  }
}
