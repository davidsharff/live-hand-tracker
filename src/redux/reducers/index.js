import { combineReducers } from 'redux';

import session from './sessionReducer';
import hand from './handReducer';

export default combineReducers({
  session,
  hand
});