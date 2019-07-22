//import _ from 'lodash';
import actionTypes from '../actionTypes';

export default store => next => action => {
  const { type, payload } = action;

  console.log('handMiddleware type', type, 'payload', payload);

  switch(type) {

    case actionTypes.CREATE_SESSION: {
      next(action);
      return;
    }

    case actionTypes.CREATE_HAND: {
      next(action);
      return;
    }

    default:
      next(action);
  }
};