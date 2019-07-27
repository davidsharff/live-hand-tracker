import _ from 'lodash';

import actionTypes from '../actionTypes';
import { positionLabelsMap, positionLabels, bettingRounds, handActionTypes } from "../../constants";

const initialState = null;

export default function handReducer(handState = initialState, action) {
  const { type, payload } = action;

  switch (type) {

    case actionTypes.CREATE_HAND:
      return _.assign({}, payload.hand, { actions: [] }) ;

    case actionTypes.SET_HERO_CARDS: {
      const { holeCards } = payload;
      return _.assign({}, handState, {
        seats: [
          ...handState.seats.slice(0, handState.heroSeatIndex),
          _.assign({}, handState.seats[handState.heroSeatIndex], { holeCards }),
          ...handState.seats.slice(handState.heroSeatIndex + 1)
        ]
      });
    }

    case actionTypes.SET_BUTTON_INDEX: {
      // TODO: add validation that this action can only occur before any other action has been inputted.
      handState = _.assign({}, handState, {
        buttonSeatIndex: payload.buttonSeatIndex
      });

      return _.assign({}, handState, {
        actions: [
          {
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: getSeatIndexForPositionLabel(handState, positionLabels.SB, payload.buttonSeatIndex),
            amount: handState.smallBlind,
            actionType: handActionTypes.POST
          },
          {
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: getSeatIndexForPositionLabel(handState, positionLabels.BB),
            amount: handState.bigBlind,
            actionType: handActionTypes.POST
          }
        ]
      });
    }

    // TODO: consider decorating seat index and then sorting based on button when button index is set.
    default:
      return handState;
  }
}

function getSeatIndexForPositionLabel(hand, positionLabel, optionalButtonSeatIndex) {
  const buttonSeatIndex = optionalButtonSeatIndex || hand.buttonSeatIndex;

  const seatPositionLabels = hand.seats.map((s, i) =>
    getSeatPositionLabel(hand, i, buttonSeatIndex) || 'empty'
  );

  return seatPositionLabels.indexOf(positionLabel);
}

export function getSeatPositionLabel(hand, targetSeatIndex, buttonSeatIndex) {
  const decoratedSeats = hand.seats.map((s, i) => _.assign({}, s, {
    seatIndex: i
  }));

  const decoratedActiveSeats = _.filter(decoratedSeats, 'isActive');

  const convertedButtonIndex =_.findIndex(decoratedActiveSeats, { seatIndex: buttonSeatIndex });

  const seatsByPositionOrder = [
    ...decoratedActiveSeats.slice(convertedButtonIndex),
    ...decoratedActiveSeats.slice(0, convertedButtonIndex)
  ];

  const positionOrderIndex = _.findIndex(seatsByPositionOrder, { seatIndex: targetSeatIndex });

  const positionLabels = positionLabelsMap[decoratedActiveSeats.length];

  return positionLabels[positionOrderIndex];
}

export function getAvailableActionForSeatIndex(hand, seatIndex) {
  const lastAction = hand.actions.slice(-1)[0];

  if (seatIndex === lastAction.seatIndex) {
    return [];
  }

  const lastActionType = lastAction.actionType;

  switch (lastActionType) {
    case handActionTypes.POST:
      return [
        {
          type: handActionTypes.FOLD
        },
        {
          type: handActionTypes.CALL
        },
        {
          type: handActionTypes.RAISE,
          minAmount: lastAction.amount * 2
        }
      ];
    default:
      throw new Error(
        `Could not determine available action for seatIndex: ${seatIndex}. Last action type ${lastActionType}`
      );
  }

}

export function getNextToActSeatIndex(hand) {
  const lastActionSeatIndex = hand.actions.slice(-1)[0].seatIndex;

  const simpleNextSeatIndex = lastActionSeatIndex + 1;

  // TODO: do we need to validate here or perhaps on creating seatIndex field in action collection?
  return simpleNextSeatIndex === hand.seats.length
    ? 0
    : simpleNextSeatIndex;

}

// export function getSeatIndexForStep(hand, startingSeatIndex, step) {
//   const totalSeats = hand.seats.length;
//   const naieveNewSeatIndex = startingSeatIndex + step;
//
//   const newIndex = naieveNewSeatIndex >= totalSeats
//     ? naieveNewSeatIndex - totalSeats
//     : naieveNewSeatIndex;
// }