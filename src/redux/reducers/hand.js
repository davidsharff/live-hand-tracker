import _ from 'lodash';

import actionTypes from '../actionTypes';

import {
  positionLabelsMap, bettingRounds, handActionTypes, sortedBettingRounds, cards
} from "../../constants";

const cachedHand = JSON.parse(localStorage.getItem('hand'));
const initialState = cachedHand || null;

export default function handReducer(hand = initialState, action) {
  const { type, payload } = action;

  switch (type) {

    case actionTypes.CREATE_HAND:
      return _.assign({}, payload.handSessionDefaults, {
        buttonSeatIndex: null,
        actions: [],
        positions: [],
        currentBettingRound: bettingRounds.PRE_FLOP,
        board: []
      });

    case actionTypes.SET_HOLE_CARDS: {
      const { seatIndex, holeCards } = payload;
      return _.assign({}, hand, {
        seats: hand.seats.map((s, i) =>
          i === seatIndex
            ? _.assign({}, s, { holeCards })
            : s
        )
      });
    }

    case actionTypes.SET_BUTTON_INDEX: {
      const decoratedSeats = hand.seats.map((s, seatIndex) =>
        _.assign({}, s, { seatIndex })
      );

      const sortedActiveSeats = _(decoratedSeats.slice(payload.buttonSeatIndex + 1))
        .concat(decoratedSeats.slice(0, payload.buttonSeatIndex + 1))
        .filter('isActive')
        .value();

      const positionLabels = positionLabelsMap[sortedActiveSeats.length];

      const positions = sortedActiveSeats.map(({ seatIndex }, positionIndex) => ({
        seatIndex,
        label: positionLabels[positionIndex]
      }));

      return _.assign({}, hand, {
        buttonSeatIndex: payload.buttonSeatIndex, // TODO: i don't think we need this state.
        positions,
        actions: [
          {
            type: handActionTypes.POST,
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: positions[0].seatIndex, // TODO: special case two-handed
            amount: hand.smallBlind
          },
          {
            type: handActionTypes.POST,
            bettingRound: bettingRounds.PRE_FLOP,
            seatIndex: positions[1].seatIndex,
            amount: hand.bigBlind
          }
        ]
      });
    }

    case actionTypes.SET_NEW_ACTION: {
      const { type, amount, seatIndex } = payload;
      return _.assign({}, hand, {
        actions: [
          ...hand.actions,
          {
            type,
            bettingRound: hand.currentBettingRound,
            seatIndex,
            // TODO: this should record the new amount invested, and not the total price of call, and will require UI to use calc for total invested during round.
            amount: type === handActionTypes.RAISE || type === handActionTypes.BET
              ? amount
              : type === handActionTypes.CALL
                ? getCurrentAmountInvestedForSeat(hand, getLastLiveAction(hand).seatIndex) - getCurrentAmountInvestedForSeat(hand, seatIndex)
                : 0
          }
        ]
      });
    }

    case actionTypes.ADVANCE_BETTING_ROUND: {
      // TODO: validate that it isn't the river
      const { currentBettingRound } = hand;
      const currentBettingRoundIndex = sortedBettingRounds.indexOf(currentBettingRound);

      return _.assign({}, hand, {
        currentBettingRound: sortedBettingRounds[currentBettingRoundIndex + 1]
      });
    }

    case actionTypes.SET_BOARD_CARDS: {
      const { cards } = payload;

      return _.assign({}, hand, {
        board: cards
      });
    }

    // TODO: consider decorating seat index and then sorting based on button when button index is set.
    default:
      return hand;
  }
}

export function getDeck(hand) {
  return _.reject(cards, (c) =>
    _.includes(getHoleCards(hand), c) ||
    _.includes(hand.board, c)
  );
}

export function getHoleCards(hand) {
  return _.flatMap(hand.seats, 'holeCards');
}

export function getPositionLabelForSeatIndex(hand, seatIndex) {
  return _.find(hand.positions, { seatIndex }).label;
}

export function getAvailableActionForSeatIndex(hand, seatIndex) {
  const lastLiveAction = getLastLiveAction(hand);

  // TODO: better noun?
  const actionsThisRound = getCurrentActions(hand);

  const targetSeatLastAction = _.findLast(actionsThisRound, { seatIndex });

  // If there hasn't been any actions, check or bet.
  // If there has been action and...
  //  If there is no amount: check, bet
  //  If there is an amount and I'm less: call, raise, fold
  //  If there is an amount and I match and i'm big blind: check, raise
  //  If there is an amount and I match and i'm not big blind: impossible since we should be at next round

  // TODO: below is untested
  // TODO: I guess we'll have to support someone folding instead of checking. Code below assumes that is impossible.
  if (!lastLiveAction) {
    if (actionsThisRound.length === 0) {
      return [
        {
          type: handActionTypes.CHECK,
          amount: null
        },
        {
          type: handActionTypes.BET,
          amount: hand.bigBlind
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

  // TODO: reconsider names
  const lastAmount = getCurrentAmountInvestedForSeat(hand, lastLiveAction.seatIndex);

  const targetSeatAmountInvested = targetSeatLastAction
    ? getCurrentAmountInvestedForSeat(hand, targetSeatLastAction.seatIndex)
    : 0;

  if (lastAmount > targetSeatAmountInvested) {
    return [
      {
        type: handActionTypes.FOLD,
        amount: null
      },
      {
        type: handActionTypes.CALL,
        amount: lastAmount - targetSeatAmountInvested
      },
      {
        type: handActionTypes.RAISE,
        amount: lastAmount * 2
      }
    ];
  } else if (lastAmount === targetSeatAmountInvested) {
      if (targetSeatLastAction && targetSeatLastAction.type === handActionTypes.POST) {
        return [
          {
            type: handActionTypes.CHECK
          },
          {
            type: handActionTypes.RAISE,
            amount: lastAmount * 2
          }
        ];
      } else {
        // TODO: validate that there was no prior amount. Otherwise, middleware should have already advanced us to next hand.
        return [
          {
            type: handActionTypes.CHECK
          },
          {
            type: handActionTypes.BET,
            amount: hand.bigBlind
          }
        ];
      }
  }

}

export function getNextToActSeatIndex(hand) {
  const roundActions = getCurrentActions(hand);
  if (roundActions.length === 0) {
    return _(hand.positions) // TODO: duplication with activePositions logic below.
      .reject(({ seatIndex }) =>
        getLastActionTypeForSeat(hand, seatIndex) === handActionTypes.FOLD
      )
      .first()
      .seatIndex;
  }

  const lastActionSeatIndex = _.last(roundActions).seatIndex;

  const activePositions = hand.positions.filter(({ seatIndex }) => {
    const lastActionForPosition = _.last(getCurrentActionsForSeat(hand, seatIndex));
    return (
      seatIndex === lastActionSeatIndex || // Always include the position that just acted
      !lastActionForPosition ||  // Always include positions yet to act
      lastActionForPosition.type !== handActionTypes.FOLD // Only include positions that haven't folded.
    );
  });

  const currentPosition      = _.find(activePositions, { seatIndex: lastActionSeatIndex });
  const currentPositionIndex = _.findIndex(activePositions, { seatIndex: currentPosition.seatIndex });

  const nextPosition = currentPositionIndex === (activePositions.length - 1)
    ? activePositions[0]
    : activePositions[currentPositionIndex + 1];

  return nextPosition.seatIndex;
}

export function getLastActionTypeForSeat(hand, seatIndex) {
  const lastAction = _.last(getCurrentActionsForSeat(hand, seatIndex));
  return lastAction
    ? lastAction.type
    : null;
}

function getLastLiveAction(hand) {
  return _(hand.actions)
    .filter(({ type, bettingRound}) => bettingRound === hand.currentBettingRound && type !== handActionTypes.FOLD)
    .last();
}

export function getCurrentAmountInvestedForSeat(hand, seatIndex) {
  const lastAmount = _.sumBy(getCurrentActionsForSeat(hand, seatIndex), 'amount');
  return lastAmount;
}

export function getCurrentActions(hand) {
  return _.filter(hand.actions, { bettingRound: hand.currentBettingRound });
}

export function getCurrentActionsForSeat(hand, seatIndex) {
  return _.filter(hand.actions, (a) =>
    a.seatIndex === seatIndex &&
    (
      a.bettingRound === hand.currentBettingRound ||
      a.type === handActionTypes.FOLD
    )
  );
}

export function getAmountToContinue(hand) {
  return _(hand.seats)
    .map((seat, i) => ({amountInvested: getCurrentAmountInvestedForSeat(hand, i)}))
    .maxBy('amountInvested')
    .amountInvested;
}

export function getBoardForRound(hand, round) {
  // TODO: consider if makes sense for board to be collection of objects with round field.
  switch (round) {
    case bettingRounds.FLOP:
      return hand.board.slice(0, 3);
    case bettingRounds.TURN:
      return hand.board.slice(0, 4);
    case bettingRounds.RIVER:
      return hand.board.slice(0, 5);
    default:
      throw new Error(`Could not get board for round: ${round}`);
  }
}

export function isCurrentRoundComplete(hand) {
  const nextToActSeatIndex = getNextToActSeatIndex(hand);
  const nextSeatRoundActions = getCurrentActionsForSeat(hand, nextToActSeatIndex);
  if (nextSeatRoundActions.length) {
    const amountToContinue = getAmountToContinue(hand);
    const nextToActSeatIndex = getNextToActSeatIndex(hand);
    const nextToActAmountInvested = getCurrentAmountInvestedForSeat(hand, nextToActSeatIndex);

    if (amountToContinue === nextToActAmountInvested) {
      const nextToActLastAction = _.last(getCurrentActionsForSeat(hand, nextToActSeatIndex));
      return nextToActLastAction.type !== handActionTypes.POST;
    }
  }

  return false;
}