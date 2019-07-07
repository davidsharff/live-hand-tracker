import { combineReducers } from 'redux';

import session from './session';
import hand from './hand';

export default combineReducers({
  session,
  hand
});