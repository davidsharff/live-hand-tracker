import _ from 'lodash';

import actionTypes from '../actionTypes';
import { positionLabelsMap, bettingRounds, handActionTypes } from "../../constants";

const initialState = null;

export default function handReducer(handState = initialState, action) {
  const { type, payload } = action;

  switch (type) {

    case actionTypes.CREATE_HAND:
      return _.assign({}, payload.hand, { actions: [], positions: [] }) ;

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
      const decoratedSeats = handState.seats.map((s, seatIndex) =>
        _.assign({}, s, { seatIndex })
      );

      const sortedActiveSeats = _(decoratedSeats.slice(payload.buttonSeatIndex))
        .concat(decoratedSeats.slice(0, payload.buttonSeatIndex))
        .filter('isActive')
        .value();

      const positionLabels = positionLabelsMap[sortedActiveSeats.length];

      const positions = sortedActiveSeats.map(({ seatIndex }, positionIndex) => ({
        seatIndex,
        label: positionLabels[positionIndex]
      }));

      return _.assign({}, handState, {
        buttonSeatIndex: payload.buttonSeatIndex,
        positions,
        actions: [
          {
            type: handActionTypes.POST,
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: positions[1].seatIndex, // TODO: special case two-handed
            amount: handState.smallBlind
          },
          {
            type: handActionTypes.POST,
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: positions[2].seatIndex,
            amount: handState.bigBlind
          }
        ]
      });
    }

    // TODO: consider decorating seat index and then sorting based on button when button index is set.
    default:
      return handState;
  }
}

export function getPositionLabelForSeatIndex(hand, seatIndex) {
  return _.find(hand.positions, { seatIndex }).label;
}

export function getAvailableActionForSeatIndex(hand, seatIndex) {
  const lastAction = hand.actions.slice(-1)[0];

  if (seatIndex === lastAction.seatIndex) {
    return [];
  }

  // TODO: better noun?
  const actionsThisRound = _.filter(hand.actions, { bettingRound: hand.currentBettingRound });
  const lastLiveAction = _.reject(actionsThisRound, { type: handActionTypes.FOLD })[0];

  // TODO: below is untested
  // TODO: I guess we'll have to support someone folding instead of checking. Code below assumes that is impossible.
  if (!lastLiveAction) {
    if (actionsThisRound.length === 0) {
      return [
        {
          type: handActionTypes.CHECK
        },
        {
          type: handActionTypes.BET,
          minAmount: hand.bigBlind
        }
      ];
    } else {
      // TODO: I think this can handle checking if anyone is left to act. If so, someone must have folded unecessarily.
      return [
        {
          type: 'win'
        }
      ];
    }
  }

  // We had a live action this round.
  switch (lastLiveAction.type) {

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
        `Could not determine available action for seatIndex: ${seatIndex}. Last action type ${lastLiveAction}`
      );
  }

}

export function getNextToActSeatIndex(hand) {
  const roundActions = _.filter(hand.actions, { bettingRound: hand.currentBettingRound });

  if (roundActions.length === 0) {
    return hand.positions[0].seatIndex;
  }

  const currentPosition = _.find(hand.positions, { seatIndex: _.last(roundActions).seatIndex });
  const currentPositionIndex = _.findIndex(hand.positions, { label: currentPosition.label });

  const nextPosition = currentPositionIndex === (hand.positions.length - 1)
    ? hand.positions[0]
    : hand.positions[currentPositionIndex + 1];


  return nextPosition.seatIndex;
}