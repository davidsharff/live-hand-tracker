import _ from 'lodash';
import { Hand as pokersolver } from 'pokersolver';
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
        id: payload.handId, // TODO: also make sure we save a sessionId
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

    case actionTypes.CASCADE_ADD_ACTION:
    case actionTypes.ADD_ACTION: {
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
  return hand.seats[seatIndex].isActive
    ? _.find(hand.positions, { seatIndex }).label
    : null;
}

export function getAvailableActionForSeatIndex(hand, seatIndex) {
  if (getIsHandComplete(hand)) {
    return [
      {
        type: handActionTypes.MUCK,
        amount: null
      },
      {
        type: handActionTypes.REVEAL,
        amount: null
      }
    ];
  }
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
    return [
      {
        type: handActionTypes.CHECK,
        amount: null
      },
      {
        type: handActionTypes.BET,
        amount: hand.bigBlind
      },
      {
        type: handActionTypes.MUCK,
        amount: null
      }
    ];
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
          },
          {
            type: handActionTypes.MUCK,
            amount: null
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
          },
          {
            type: handActionTypes.MUCK,
            amount: null
          }
        ];
      }
  }

}

export function getNextToActSeatIndex(hand) {
  const roundActions = getCurrentActions(hand);
  if (roundActions.length === 0) {
    const nextToActPosition = _(hand.positions) // TODO: duplication with activePositions logic below.
      .reject(({ seatIndex }) =>
        getLastActionTypeForSeat(hand, seatIndex) === handActionTypes.FOLD ||
        getLastActionTypeForSeat(hand, seatIndex) === handActionTypes.MUCK
      )
      .first();

    return nextToActPosition ? nextToActPosition.seatIndex : null;
  }

  const lastActionSeatIndex = _.last(roundActions).seatIndex;

  const activePositions = hand.positions.filter(({ seatIndex }) => {
    const lastActionForPosition = _.last(getCurrentActionsForSeat(hand, seatIndex));
    return (
      seatIndex === lastActionSeatIndex || // Always include the position that just acted
      !lastActionForPosition ||  // Always include positions yet to act
      (
        // Only include positions that haven't folded.
        lastActionForPosition.type !== handActionTypes.FOLD &&
        lastActionForPosition.type !== handActionTypes.MUCK
      )
    );
  });

  const currentPosition      = _.find(activePositions, { seatIndex: lastActionSeatIndex });
  const currentPositionIndex = _.findIndex(activePositions, { seatIndex: currentPosition.seatIndex });

  const nextPosition = currentPositionIndex === (activePositions.length - 1)
    ? activePositions[0]
    : activePositions[currentPositionIndex + 1];

  return nextPosition.seatIndex;
}

export function getLastLiveActionForSeat(hand, seatIndex) {
  return _.last(getCurrentActionsForSeat(hand, seatIndex)) || null;
}

export function getLastActionTypeForSeat(hand, seatIndex) {
  const lastAction = getLastLiveActionForSeat(hand, seatIndex);
  return lastAction
    ? lastAction.type
    : null;
}

export function getLastLiveAction(hand) {
  return _(hand.actions)
    .filter(({ type, bettingRound}) =>
      bettingRound === hand.currentBettingRound &&
      type !== handActionTypes.FOLD &&
      type !== handActionTypes.MUCK
    )
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
      a.type === handActionTypes.FOLD ||
      a.type === handActionTypes.MUCK
    )
  );
}

export function getAmountToContinueForSeatIndex(hand, seatIndex) {
  const maxAmountPosition = _(getCurrentActivePositions(hand))
    .reject({ seatIndex })
    .map((p) => ({ amountInvested: getCurrentAmountInvestedForSeat(hand, p.seatIndex) }))
    .maxBy('amountInvested');

    return maxAmountPosition
      ? maxAmountPosition.amountInvested
      : 0;
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
  if (hand !== null && hand.buttonSeatIndex !== null) {
    const nextToActSeatIndex = getNextToActSeatIndex(hand);
    const nextSeatRoundActions = getCurrentActionsForSeat(hand, nextToActSeatIndex);
    if (nextSeatRoundActions.length) {
      const nextToActSeatIndex = getNextToActSeatIndex(hand);
      const amountToContinue = getAmountToContinueForSeatIndex(hand, nextToActSeatIndex);
      const nextToActAmountInvested = getCurrentAmountInvestedForSeat(hand, nextToActSeatIndex);

      return (
        (
          nextToActAmountInvested > 0 && amountToContinue === 0
        ) ||
        (
          amountToContinue === nextToActAmountInvested &&
          _.last(nextSeatRoundActions).type !== handActionTypes.POST
        )
      );
    }
  }
  return false;
}

export function getIsHandComplete(hand) {
  return isCurrentRoundComplete(hand) && (
    hand.currentBettingRound === bettingRounds.RIVER ||
    getCurrentActivePositions(hand).length <= 1
  );
}

export function getCurrentActivePositions(hand) {
  return hand.positions.filter(({ seatIndex }) =>
    hand.seats[seatIndex].isActive &&
    (
      !_.some(hand.actions, { seatIndex, type: handActionTypes.FOLD }) &&
      // TODO: this really needs to distinguish edge-case of excluding river mucks if they happen while action is live.
      //       To accomplish, the isCurrentRoundComplete selector can be used to find the last live action and only include
      //       mucks that happened after river completed.
      !_.some(hand.actions, { seatIndex, type: handActionTypes.MUCK })
    )
  );
}

export function getNextSeatIndex(hand, startingSeatIndex) {
  const naiveNextSeatIndex = (startingSeatIndex + 1) === hand.seats.length
    ? 0
    : (startingSeatIndex + 1);

  const naiveNextSeat = hand.seats[naiveNextSeatIndex];

  if (!naiveNextSeat.isActive) {
    return getNextSeatIndex(hand, naiveNextSeatIndex);
  }

  return naiveNextSeatIndex;
}

export function getTotalPotSizeDuringRound(hand, targetRound) {
  return _(hand.actions)
    .filter(({ bettingRound }) => sortedBettingRounds.indexOf(bettingRound) <= sortedBettingRounds.indexOf(targetRound))
    .sumBy('amount');
}

// TODO: this fn was built out should be refactored to always return records for all positions active during the river
//       where folds/mucks of losing players are captured in the decorated position.
export function getResultDecoratedPositions(hand) {
  if (!getIsHandComplete(hand)) {
    return [];
  }

  const activePositions = getCurrentActivePositions(hand);

  const potSize = getTotalPotSizeDuringRound(hand, bettingRounds.RIVER);

  // All but one position folded and remaining winner mucked.
  if (activePositions.length === 0) {
    const lastAction = _.last(hand.actions);

    if (lastAction.type !== handActionTypes.MUCK) {
      throw new Error(`Cannot determine winner, unexpected last action type. Action type: ${lastAction.type}. Seat Index: ${lastAction.seatIndex}`);
    }

    const muckedWinningPosition = _.find(hand.positions, { seatIndex: _.last(hand.actions).seatIndex });
    return [
      _.assign({}, muckedWinningPosition, {
        holeCards: [],
        handCards: [],
        handDescription: 'Mucked', // TODO: move to constant if this continues to be relied on post-refactor.
        amountWon: potSize
      })
    ];
  }

  const awaitingHoleCards = activePositions.some(({ seatIndex }) =>
    (
      seatIndex === hand.heroSeatIndex &&
      !_.find(hand.actions, { seatIndex, type: handActionTypes.REVEAL })
    ) ||
    (
      seatIndex !== hand.heroSeatIndex &&
      hand.seats[seatIndex].holeCards.length < 2
    )
  );

  // At least 1 active position that hasn't revealed hole cards.
  if (awaitingHoleCards) {
    return [];
  }

  const boardCards = hand.board;

  // One player remaining who chose to reveal cards.
  if (activePositions.length === 1) {
    const position = activePositions[0];

    const solvedHand = pokersolver.solve([...hand.seats[position.seatIndex].holeCards, ...boardCards]);

    const revealedWinningPosition = _.assign({}, position, {
      holeCards: hand.seats[position.seatIndex].holeCards,
      handCards: solvedHand.cards,
      handDescription: solvedHand.descr,
      amountWon: potSize
    });

    return [revealedWinningPosition];
  }

  // More than one active position with hole cards. Evaluate hand strengths to determine winner.

  const decoratedPositions = activePositions.map((p) => {
    const solvedHand = pokersolver.solve([...hand.seats[p.seatIndex].holeCards, ...boardCards]);

    return _.assign({}, p, {
      solvedHand,
      holeCards: hand.seats[p.seatIndex].holeCards,
      handCards: solvedHand.cards,
      handDescription: solvedHand.descr
    });
  });

  // TODO: I think the solver returns if the hand is possible. Consider using for validation.
  const solvedWinners = pokersolver.winners(_.map(decoratedPositions, 'solvedHand'));

  // TODO: in add HOLE_CARDS middleware, check if valid state to determine winner, and spawn actions to stamp these calc values on seat records.
  // TODO: fix handling of remainder in split pots
  return decoratedPositions
    .map((p, i) => _.omit(
      _.assign({}, p, {
        amountWon: p.handDescription === solvedWinners[0].descr ? potSize / solvedWinners.length : 0
      }),
      'solvedHand'
      )
    );
}

export function getSkippedSeatIndicesForSeatIndex(hand, selectedSeatIndex) {
  const activePositions = getCurrentActivePositions(hand);
  const actingSeatIndex   = _.findIndex(activePositions, { seatIndex: selectedSeatIndex });

  const sortedPositions = [
    ...activePositions.slice(actingSeatIndex + 1),
    ...activePositions.slice(0, actingSeatIndex + 1)
  ];

  const sortedNextToActIndex = _.findIndex(sortedPositions, { seatIndex: getNextToActSeatIndex(hand)});

  return _.map(sortedPositions.slice(sortedNextToActIndex, -1), 'seatIndex');
}

// TODO: really bringing some weak sauce with this name. Improve.
export function getSeatIndicesThatCompletedHand(hand) {
  if (!getIsHandComplete(hand)) {
    return [];
  };

  const resultDecoratedPositions = getResultDecoratedPositions(hand);
  const activePositions = getCurrentActivePositions(hand);

  if (activePositions === 0) {
    // Everyone else folded and last player mucked
    return _.last(hand.actions).seatIndex;
  }

  return _(resultDecoratedPositions)
    .filter('amountWon')
    .map('seatIndex')
    .value();
}