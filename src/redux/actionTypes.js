// TODO: consider nesting under reducerName or breaking out files
export default {
  CREATE_SESSION: 'CREATE_SESSION',
  LOAD_SESSION: 'LOAD_SESSION',
  UPDATE_SESSION_IS_ACTIVE_SEAT: 'UPDATE_SESSION_IS_ACTIVE_SEAT',
  UPDATE_SESSION_TOTAL_SEATS: 'UPDATE_SESSION_TOTAL_SEATS',
  UPDATE_SESSION_LOCATION: 'UPDATE_SESSION_LOCATION',
  UPDATE_SESSION_HERO_SEAT_INDEX: 'UPDATE_SESSION_HERO_SEAT_INDEX',
  UPDATE_SESSION_SMALL_BLIND: 'UPDATE_SESSION_SMALL_BLIND',
  UPDATE_SESSION_BIG_BLIND: 'UPDATE_SESSION_BIG_BLIND',

  CREATE_HAND: 'CREATE_HAND',
  SET_HERO_CARDS: 'SET_HERO_CARDS',

  // Pure events. These should be handled and squashed in middleware (never hit reducer on their own but can spawn other actions)
  EDIT_SESSION_COMPLETE_EVENT: 'EDIT_SESSION_COMPLETE_EVENT'
};