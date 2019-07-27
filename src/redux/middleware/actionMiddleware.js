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
      action.aux.redirectToFn('/hand');
      return;
    }

    case actionTypes.LOAD_SESSION: {
      next(action);

      // Dispatch so it will be processed by above middleware and handle redirecting.
      store.dispatch({
        type: actionTypes.CREATE_HAND,
        payload: {
          hand: {
            currentBettingRound: bettingRounds.PRE_FLOP,
            buttonSeatIndex: null,
            heroSeatIndex: payload.session.defaultHeroSeatIndex,
            seats: payload.session.defaultSeats,
            smallBlind: payload.session.smallBlind,
            bigBlind: payload.session.bigBlind
          }
        },
        aux: {
          redirectToFn: action.aux.redirectToFn
        }
      });
      return;
    }

    default:
      next(action);
  }
};