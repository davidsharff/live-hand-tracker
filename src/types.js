import _ from 'lodash';
import PropTypes from 'prop-types';
import { cards, bettingRounds, handActionTypes } from './constants';

export const holeCardsType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired; // TODO: shouldn't force required at top level.

export const seatsType = PropTypes.arrayOf(PropTypes.exact({
  isActive: PropTypes.bool,
  holeCards: holeCardsType
})).isRequired;

export const handType = PropTypes.exact({
  bettingRound: PropTypes.oneOf(_.values(bettingRounds)),
  // TODO: get hardcoded max for seats from constants?
  buttonSeatIndex: PropTypes.oneOf(_.range(0, 10)),
  heroSeatIndex: PropTypes.oneOf(_.range(0, 10)),
  seats: seatsType,
  smallBlind: PropTypes.number,
  bigBlind: PropTypes.number,
  actions: PropTypes.arrayOf(PropTypes.exact({
    bettingRound: PropTypes.oneOf(_.values(bettingRounds)),
    seatIndex: PropTypes.number,
    amount: PropTypes.number,
    actionType: PropTypes.oneOf(_.values(handActionTypes)),
  })).isRequired
});

export const sessionType = PropTypes.exact({
  location: PropTypes.string,
  defaultSeats: seatsType,
  defaultHeroSeatIndex: PropTypes.number,
  smallBlind: PropTypes.number, // This decision will force creating a new session if blinds change. Need to include duplicate session UI.
  bigBlind: PropTypes.number
});

export const deckType = PropTypes.arrayOf(PropTypes.oneOf(cards));