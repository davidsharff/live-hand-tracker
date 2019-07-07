import PropTypes from 'prop-types';
import { cards, bettingRounds } from './constants';

export const holeCardsType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired;

export const handType = PropTypes.exact({
  bettingRound: PropTypes.oneOf(bettingRounds),
  heroSeatIndex: PropTypes.number,
  knownHoleCards: PropTypes.arrayOf(PropTypes.exact({
    seatIndex: PropTypes.number.isRequired,
    holeCards: holeCardsType
  })).isRequired
});