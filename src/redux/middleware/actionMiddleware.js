//import _ from 'lodash';
import actionTypes from '../actionTypes';
import { bettingRounds } from '../../constants';

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

    case actionTypes.LOAD_SESSION: {
      next(action);
      next({
        type: actionTypes.CREATE_HAND,
        payload: {
          hand: {
            bettingRound: bettingRounds[0],
            buttonSeatIndex: null,
            heroSeatIndex: payload.session.defaultHeroSeatIndex,
            seats: payload.session.defaultSeats
          }
        }
      });

      action.aux.redirectToFn('/hand');
      return;
    }

    default:
      next(action);
  }
};