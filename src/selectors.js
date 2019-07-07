import _ from 'lodash';
import { cards } from './constants';

export function getDeck(state) {
  const { seats } = state.hand;

  return _.reject(cards, (c) => _.includes(_.map(seats, 'holeCards'), c));
}