import actionTypes from '../actionTypes';
import {isCurrentRoundComplete, getIsHandComplete} from "../reducers/hand";

// TODO: add validateAction middleware.
// TODO: add pre and postActionValidation middleware. Post should be absolute last in chain before reducer and block _EVENT suffix actions from getting through.
export default store => next => action => {
  const { type } = action;

  switch(type) {

    case actionTypes.CREATE_SESSION: {
      next(action);
      return;
    }

    case actionTypes.CREATE_HAND: {
      const session = store.getState().session;
      next({
        type,
        payload: {
          handSessionDefaults: {
            heroSeatIndex: session.defaultHeroSeatIndex,
            seats: session.defaultSeats,
            smallBlind: session.smallBlind,
            bigBlind: session.bigBlind
          }
        }
      });
      return;
    }

    case actionTypes.SET_NEW_ACTION: {
      next(action);
      const { hand } = store.getState();

      if (isCurrentRoundComplete(hand) && !getIsHandComplete(hand)) {
        next({
          type: actionTypes.ADVANCE_BETTING_ROUND
        });
      }
      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      return;
    }

    // TODO: we should handle always saving to local storage on any hand action type.
    case actionTypes.SET_BOARD_CARDS: {
      next(action);
      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      return;
    }

    default:
      next(action);
  }
};