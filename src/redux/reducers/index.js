import { combineReducers } from 'redux';

import session from './sessionReducer';
import hand from './handReducer';
import local from './localReducer';

export default combineReducers({
  session,
  hand,
  local
});