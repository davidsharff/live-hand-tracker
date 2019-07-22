//import _ from 'lodash';
import actionTypes from '../actionTypes';

// TODO: add validateAction middleware.
// TODO: add pre and postActionValidation middleware. Post should be absolute last in chain before reducer and block _EVENT suffix actions from getting through.
export default store => next => action => {
  const { type, payload } = action;

  switch(type) {

    case actionTypes.CREATE_SESSION: {
      next(action);
      return;
    }

    case actionTypes.CREATE_HAND: {
      next(action);
      return;
    }

    case actionTypes.EDIT_SESSION_COMPLETE_EVENT: {
      localStorage.setItem('savedSession', JSON.stringify(payload.session));

      if (store.getState().hand === null) {
        next({
          type: actionTypes.CREATE_HAND,
          payload: {
            hand: payload.hand
          }
        });
      }

      payload.redirectToFn('/hand');
      return;
    }

    default:
      next(action);
  }
};