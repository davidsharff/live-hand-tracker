// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React, { useEffect }  from 'react';
import _ from 'lodash';
import { Redirect, Route, withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import HandWizard from './components/HandWizard';
import Header from '../../components/Header';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType, sessionType } from '../../types';
import { bettingRounds } from "../../constants";

import {getDeck, getNextSeatIndex, getIsHandComplete} from "../../redux/reducers/hand";
import Overview from "./components/Overview";

function Hand(props) {
  const { session, hand, deck, currentBettingRound, isHandComplete } = props;

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {

    // TODO: this prevents returning to any step prior to latest data.
    if (
      currentBettingRound &&
      currentBettingRound !== bettingRounds.PRE_FLOP
    ) {
      props.history.push(`/hand/board/${currentBettingRound}`);
    }
  }, [currentBettingRound, props.history]);

  if (session === null) {
    return <Redirect to="/session" />;
  } else if (hand === null) {
    props.dispatch({
      type: actionTypes.CREATE_HAND
    });
    // TODO: real UI
    return <div>Loading hand...</div>;
  }

  const handleSaveHoleCards = (seatIndex, holeCards) => {
    props.dispatch({
      type: actionTypes.SET_HOLE_CARDS,
      payload: {
        seatIndex,
        holeCards
      }
    });

    if (isHandComplete) {
      const nextSeatIndex = getNextSeatIndex(hand, seatIndex);
      handleNavToSeatHoleCards(nextSeatIndex);
    } else {
      props.history.push('/hand/actions');
    }
  };

  const handleSaveBoardCards = (cards) => {
    props.dispatch({
      type: actionTypes.SET_BOARD_CARDS,
      payload: {
        cards
      }
    });

    props.history.push('/hand/actions');
  };

  const handleAddAction = (seatIndex, type, amount) => {
    props.dispatch({
      type: actionTypes.SET_NEW_ACTION,
      payload: {
        seatIndex,
        type,
        amount
      },
      aux: {
        redirectToFn: (path) => props.history.push(path)
      }
    });
  };

  function handleNavToSeatHoleCards(seatIndex) {
    props.history.push(`/hand/cards/seat/${seatIndex}`);
  }

  // TODO: explore / decide between const and named functions.
  function handleSetButtonIndex(buttonSeatIndex) {
    props.dispatch({
      type: actionTypes.SET_BUTTON_INDEX,
      payload: {
        buttonSeatIndex
      }
    });
    props.history.push('/hand/actions');
  }

  // TODO: all routes below should use handId param
  return (
    <React.Fragment>
      <Header
        mainLabel="Hand #1"
        subLabel={session.location}
        smallBlind={session.smallBlind}
        bigBlind={session.bigBlind}
        totalPlayers={_.sumBy(hand.seats, 'isActive')}
        bettingRound={hand.currentBettingRound}
        shouldCollapse={false}
      />
      <Switch>
        <Route exact path="/hand/overview" render={() =>
          <Overview hand={hand} />
        }/>
        <Route path="/hand/:inputStepType" render={({ match }) =>
          <HandWizard
            matchParams={match.params}
            hand={hand}
            onSetButtonSeatIndex={handleSetButtonIndex}
            onAction={handleAddAction}
            blinds={{ small: session.smallBlind, big: session.bigBlind /* TODO: consider nesting under blinds in session state. */}}
            deck={deck}
            onSaveBoardCards={handleSaveBoardCards}
            onSaveHoleCards={handleSaveHoleCards}
            board={hand.board}
            isHandComplete={isHandComplete}
            onNavToSeatHoleCards={handleNavToSeatHoleCards}
          />
        }/>
      </Switch>
    </React.Fragment>
  );
}

Hand.propTypes = {
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
}))(Hand));
