import _ from 'lodash';
import { cards } from './constants';

export function getDeck(state) {
  const { knownHoleCards } = state.hand;

  return _.reject(cards, (c) => _.includes(knownHoleCards, c));
}