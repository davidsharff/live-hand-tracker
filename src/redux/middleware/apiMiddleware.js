import _ from 'lodash';
import actionTypes from '../actionTypes';
import { saveSessionAndHand } from '../../api';

export default store => next => action => {
  next(action);
  console.log('apiMiddleware!', action.type);
  // TODO: check
  if (_.includes(actionTypes, action.type)) {
    saveSessionAndHand(store.getState());
  }
};