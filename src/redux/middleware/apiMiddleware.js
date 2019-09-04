import _ from 'lodash';
import actionTypes from '../actionTypes';
import { updateHand, addHand } from '../../api';

export default store => next => action => {
  next(action);
  console.log('apiMiddleware!', action.type);
  // TODO: check
  if (
    !_.includes(actionTypes, action.type)
  ) {
    return;
  }

  if (action.type === actionTypes.CREATE_HAND) {
    addHand();
  } else {
    updateHand();
  }
};