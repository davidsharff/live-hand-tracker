import { combineReducers } from 'redux';

import heroSession from './heroSession';
import hand from './hand';

export default combineReducers({
  heroSession,
  hand
});