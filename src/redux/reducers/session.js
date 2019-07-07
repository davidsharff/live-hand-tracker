import actionTypes from '../../redux/actionTypes';

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = null, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.CREATE_SESSION: {
      return payload.session;
    }
    // TODO: case: actionTypes.SET_SESSION_DEFAULT_SEATS
    default:
      return state;
  }
}
