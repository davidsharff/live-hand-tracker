import PropTypes from 'prop-types';
import { cards, bettingRounds } from './constants';

export const holeCardsType = PropTypes.arrayOf(PropTypes.oneOf(cards)).isRequired;

export const handType = PropTypes.exact({
  heroCards: holeCardsType,
  bettingRound: PropTypes.oneOf(bettingRounds)
});