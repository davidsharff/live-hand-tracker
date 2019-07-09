import PropTypes from 'prop-types';
import { cards, bettingRounds } from './constants';

export const holeCardsType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired; // TODO: shouldn't force required at top level.

export const seatsType = PropTypes.arrayOf(PropTypes.exact({
  isActive: PropTypes.bool,
  holeCards: holeCardsType
})).isRequired;

export const handType = PropTypes.exact({
  bettingRound: PropTypes.oneOf(bettingRounds),
  heroSeatIndex: PropTypes.number,
  seats: seatsType
});

export const sessionType = PropTypes.exact({
  location: PropTypes.string,
  defaultSeats: seatsType,
  defaultHeroSeatIndex: PropTypes.number,
  smallBlind: PropTypes.number, // This decision will force creating a new session if blinds change. Need to include duplicate session UI.
  bigBlind: PropTypes.number
});

export const deckType = PropTypes.arrayOf(PropTypes.oneOf(cards));