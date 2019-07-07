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
  defaultSeats: seatsType,
  defaultHeroSeatIndex: PropTypes.number.isRequired,
  location: PropTypes.string
}).isRequired;

export const deckType = PropTypes.arrayOf(PropTypes.oneOf(cards));