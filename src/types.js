import PropTypes from 'prop-types';
import { cards, bettingRounds } from './constants';

export const holeCardsType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired;

export const handType = PropTypes.exact({
  bettingRound: PropTypes.oneOf(bettingRounds),
  heroSeatIndex: PropTypes.number,
  seats: PropTypes.arrayOf(PropTypes.exact({
    isActive: PropTypes.bool,
    holeCards: holeCardsType
  })).isRequired
});

export const deckType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired;