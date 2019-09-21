import _ from 'lodash';

import actionTypes from '../actionTypes';
import {
  isCurrentRoundComplete,
  getIsHandComplete,
  getNextToActSeatIndex,
  getAmountToContinueForSeatIndex,
  getCurrentActivePositions
} from "../reducers/handReducer";
import { cascadeActionTypes } from '../../constants';

// TODO: add validateAction middleware.
// TODO: add pre and postActionValidation middleware. Post should be absolute last in chain before reducer and block _EVENT suffix actions from getting through.
// TODO: it'd be cleaner to have seperate hand and session middleware.
export default store => next => action => {
  const { type, payload } = action;

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
          },
          // TODO: use real uId generator
          handId: Math.round(Math.random() * 10000000)
        }
      });
      localStorage.setItem('hand', JSON.stringify(store.getState().hand));
      return;
    }

    // TODO: get rid of muck redux action type and replace with handActionType
    case actionTypes.ADD_ACTION: {
      const { cascadeActionType } = payload;

      if (cascadeActionType !== null) {
        createCascadingActions(store.getState().hand, action, next);
      }

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

function createCascadingActions(hand, action, next) {
  const { payload } = action;
  const { cascadeActionType } = payload;

  const activePositions = getCurrentActivePositions(hand);

  const initialPositionIndex = _.findIndex(activePositions, { seatIndex: getNextToActSeatIndex(hand)});
  const endPositionIndex = _.findIndex(activePositions, { seatIndex: payload.seatIndex });

  // Only calls are cascade-able action types that need an amount.
  const amount = cascadeActionType === cascadeActionTypes.CALL
    ? getAmountToContinueForSeatIndex(hand, activePositions[initialPositionIndex].seatIndex)
    : 0;

  activePositions.slice(initialPositionIndex, endPositionIndex).forEach(({ seatIndex }) =>
    next({
      type: actionTypes.CASCADE_ADD_ACTION,
      payload: {
        type: cascadeActionType,
        seatIndex,
        amount
      }
    })
  );
}