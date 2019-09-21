// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React, { useEffect }  from 'react';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';

import HandWizard from './HandWizard';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType, sessionType } from '../../types';

import {
  getCurrentActivePositions,
  getDeck,
  getIsHandComplete,
  getNextToActSeatIndex
} from "../../redux/reducers/handReducer";

function HandWizardConnector(props) {
  const { session, hand, deck, isHandComplete, history } = props;

  useEffect(() => window.scrollTo(0, 0), []);

  if (session === null) {
    return <Redirect to="/session" />;
  } else if (hand === null) {
    props.dispatch({
      type: actionTypes.CREATE_HAND
    });
    // TODO: real UI

    if (history.location.pathname !== '/hand/actions') {
      history.push('/hand/actions'); // Move routes into constants file
    }
    return <div>Loading hand...</div>;
  }

  const handleSaveHoleCards = (seatIndex, holeCards, isFinishedEditing) => {
    props.dispatch({
      type: actionTypes.SET_HOLE_CARDS,
      payload: {
        seatIndex,
        holeCards
      },
      aux: {
        isFinishedEditing,
        navToNextSeatIndex: (hand) => handleNavToSeatIndexActions(getNextToActSeatIndex(hand))
      }
    });
  };

  const handleSaveBoardCards = (cards, isFinishedEditing) => {
    props.dispatch({
      type: actionTypes.SET_BOARD_CARDS,
      payload: {
        cards
      },
      aux: {
        isFinishedEditing,
        navToNextSeatIndex: (hand) => handleNavToSeatIndexActions(getNextToActSeatIndex(hand))
      }
    });
  };

  const handleAddAction = (seatIndex, type, amount) => {
    props.dispatch({
      type: actionTypes.ADD_ACTION,
      payload: {
        seatIndex,
        type,
        amount
      },
      aux: {
        navToNextSeatIndex: (hand) => handleNavToSeatIndexActions(getNextToActSeatIndex(hand)),
        navToBoardInput: (bettingRound) => history.push(`/hand/cards/board/${bettingRound}`)
      }
    });
  };

  const handleClickSeat = (seatIndex) => {
    if (!hand.seats[seatIndex].isActive) {
      return;
    }

    // TODO: lookup url to make sure we aren't inputting hero hole cards.
    if (hand.buttonSeatIndex === null) {
      handleSetButtonIndex(seatIndex);
      history.push(`/hand/cards/seat/${hand.heroSeatIndex + 1}`);

      // Allow clicking ahead to input action if seat is live and hasn't acted this round.
    } else if (_.includes(props.location.pathname, 'actions') && !isHandComplete) {
      const activePositions = getCurrentActivePositions(hand);

      const lastSeatAction = _.findLast(hand.actions, { seatIndex });

      if (_.some(activePositions, { seatIndex }) && (!lastSeatAction || lastSeatAction.bettingRound !== hand.currentBettingRound)) {
        handleNavToSeatIndexActions(seatIndex);
      } else {
        // TODO: add real UI
        window.alert('You can only skip to seats that haven\'t acted this round');
      }
    }
  };

  const handleCreateNewHand = (seatIndex) => {
    localStorage.removeItem('hand');

    props.dispatch({
      type: actionTypes.CREATE_HAND
    });

    history.push('/hand/actions');
  };

  function handleNavToSeatIndexActions(seatIndex) {
    history.push(`/hand/actions/seat/${seatIndex + 1}`);
  };

  // TODO: explore / decide between const and named functions.
  function handleSetButtonIndex(buttonSeatIndex) {
    props.dispatch({
      type: actionTypes.SET_BUTTON_INDEX,
      payload: {
        buttonSeatIndex
      }
    });
    history.push('/hand/actions');
  }

  // TODO: any routes below should use handId param
  return (
    <Route path="/hand/:inputStepType" render={({ match }) => {

      if (match.isExact && hand.buttonSeatIndex !== null) {
        handleNavToSeatIndexActions(getNextToActSeatIndex(hand));
        return null;
      }

      return (
        <HandWizard
          matchParams={match.params}
          hand={hand}
          onAction={handleAddAction}
          blinds={{ small: session.smallBlind, big: session.bigBlind /* TODO: consider nesting under blinds in session state. */}}
          deck={deck}
          onSaveBoardCards={handleSaveBoardCards}
          onSaveHoleCards={handleSaveHoleCards}
          board={hand.board}
          isHandComplete={isHandComplete}
          onClickSeat={handleClickSeat}
          onCreateNewHand={handleCreateNewHand}
        />
      );
    }}/>
  );
}

HandWizardConnector.propTypes = {
  hand: handType,
  deck: deckType,
  session: sessionType
};

export default withRouter(connect((state) => ({
  hand: state.hand,
  // TODO: this can be removed when check for session happens in middleware
  deck: state.hand ? getDeck(state.hand) : null,
  session: state.session,
  hasSession: state.session !== null,
  currentBettingRound: state.hand !== null
    ? state.hand.currentBettingRound
    : null,
  isHandComplete: getIsHandComplete(state.hand)
}))(HandWizardConnector));