import actionTypes from '../actionTypes';
import {isCurrentRoundComplete, getIsHandComplete} from "../reducers/handReducer";

// TODO: add validateAction middleware.
// TODO: add pre and postActionValidation middleware. Post should be absolute last in chain before reducer and block _EVENT suffix actions from getting through.
// TODO: it'd be cleaner to have seperate hand and session middleware.
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
      {
        const { hand } = store.getState();

        if (isCurrentRoundComplete(hand) && !getIsHandComplete(hand)) {
          next({
            type: actionTypes.ADVANCE_BETTING_ROUND
          });

          action.aux.navToBoardInput(store.getState().hand.currentBettingRound);
          return;
        }
      }

      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      action.aux.navToNextSeatIndex(store.getState().hand);
      return;
    }

    // TODO: we should handle always saving to local storage on any hand action type.
    case actionTypes.SET_BOARD_CARDS: {
      next(action);

      if (action.aux.isFinishedEditing) {
        action.aux.navToNextSeatIndex(store.getState().hand);
      }

      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      return;
    }

    case actionTypes.SET_HOLE_CARDS: {
      next(action);
      // TODO: improvement on this approach is to use breaks instead of returns and then check generic bool for existance
      //       of aux nav cb and always call. Additionally, that's where hand would be saved to localStorage.
      if (action.aux.isFinishedEditing) {
        action.aux.navToNextSeatIndex(store.getState().hand);
      }

      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      return;
    }

    default:
      next(action);
      // TODO: de-dup setting hand in local storage
      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
  }
};