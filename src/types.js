import _ from 'lodash';
import PT from 'prop-types';

import { cards, bettingRounds, handActionTypes } from './constants';

export const holeCardsType = PT.arrayOf(PT.oneOf(cards)).isRequired; // TODO: shouldn't force required at top level.

export const seatsType = PT.arrayOf(PT.exact({
  isActive: PT.bool.isRequired,
  holeCards: holeCardsType
})).isRequired;

export const handType = PT.exact({
  currentBettingRound: PT.oneOf(_.values(bettingRounds)).isRequired,
  // TODO: get hardcoded max for seats from constants?
  buttonSeatIndex: PT.oneOf(_.range(0, 10)),
  heroSeatIndex: PT.oneOf(_.range(0, 10)).isRequired,
  seats: seatsType, // TODO: consider a allTableSeats and activeSeats array where activeSeatsArray has tableSeatIndex attribute. Or make it a sorted positions array.
  positions: PT.arrayOf(PT.exact({
    seatIndex: PT.number.isRequired,
    label: PT.string.isRequired
  })).isRequired,
  smallBlind: PT.number.isRequired,
  bigBlind: PT.number.isRequired,
  actions: PT.arrayOf(PT.exact({
    type: PT.oneOf(_.values(handActionTypes)).isRequired, // TODO: could improve type-defs for different action types (e.g. post only works pre-flop, fold/call/check has no amount, etc.)
    bettingRound: PT.oneOf(_.values(bettingRounds)).isRequired,
    seatIndex: PT.number.isRequired,
    amount: PT.number
  })).isRequired,
  // This may need to include objects with betting round and cards keys, however, it's necessarily ordered data so starting with strings for now.
  board: PT.arrayOf(PT.oneOf(cards))
});

export const sessionType = PT.exact({
  location: PT.string,
  defaultSeats: seatsType,
  defaultHeroSeatIndex: PT.number,
  smallBlind: PT.number, // This decision will force creating a new session if blinds change. Need to include duplicate session UI.
  bigBlind: PT.number
});

export const deckType = PT.arrayOf(PT.oneOf(cards));