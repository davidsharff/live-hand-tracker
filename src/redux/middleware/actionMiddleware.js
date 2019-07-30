import _ from 'lodash';
import actionTypes from '../actionTypes';
import {
  getAmountToContinue,
  getCurrentActionsForSeat,
  getCurrentAmountInvestedForSeat,
  getNextToActSeatIndex
} from "../reducers/hand";
import {bettingRounds, handActionTypes} from "../../constants";

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

    case actionTypes.SET_NEW_ACTION: {
      next(action);
      const nextToActSeatIndex = getNextToActSeatIndex(store.getState().hand);
      const nextSeatRoundActions = getCurrentActionsForSeat(store.getState().hand, nextToActSeatIndex);
      if (nextSeatRoundActions.length) {
        const amountToContinue = getAmountToContinue(store.getState().hand);
        const nextToActSeatIndex = getNextToActSeatIndex(store.getState().hand);
        const nextToActAmountInvested = getCurrentAmountInvestedForSeat(store.getState().hand, nextToActSeatIndex);

        if (amountToContinue === nextToActAmountInvested) {
          const nextToActLastAction = _.last(getCurrentActionsForSeat(store.getState().hand, nextToActSeatIndex));

          if (store.getState().hand.currentBettingRound === bettingRounds.RIVER) {
          } else if (nextToActLastAction.type !== handActionTypes.POST){
            next({
              type: actionTypes.ADVANCE_BETTING_ROUND
            });
          }
        }
      }
      return;
    }

    default:
      next(action);
  }
};