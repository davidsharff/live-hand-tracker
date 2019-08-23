// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React, { useEffect }  from 'react';
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
  const { session, hand, deck, currentBettingRound, isHandComplete, history } = props;

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {

    // TODO: this prevents returning to any step prior to latest data.
    if (
      currentBettingRound &&
      currentBettingRound !== bettingRounds.PRE_FLOP
    ) {
      history.push(`/hand/board/${currentBettingRound}`);
    }
  }, [currentBettingRound, history]);

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
      // TODO: this should just go to /hand
      history.push('/hand/actions');
    }
  };

  const handleSaveBoardCards = (cards) => {
    props.dispatch({
      type: actionTypes.SET_BOARD_CARDS,
      payload: {
        cards
      }
    });

    history.push('/hand/actions');
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
        redirectToFn: (path) => history.push(path)
      }
    });
  };

  const handleClickSeat = (seatIndex) => {
    // TODO: lookup url to make sure we aren't inputting hero hole cards.
    if (hand.buttonSeatIndex === null) {
      handleSetButtonIndex(seatIndex);
      history.push(`/hand/cards/seat/${hand.heroSeatIndex}`);
    } else if (isHandComplete) {
      handleNavToSeatHoleCards(seatIndex);
    }
  };

  function handleNavToSeatHoleCards(seatIndex) {
    history.push(`/hand/cards/seat/${seatIndex}`);
  }

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

  // TODO: all routes below should use handId param
  return (
    <React.Fragment>
      <Header
        mainLabel="Hand #1"
        subLabel={session.location}
        onGoBack={() => history.push('/session/')}
      />
      <Switch>
        <Route exact path="/hand/overview" render={() =>
          <Overview hand={hand} />
        }/>
        <Route path="/hand/:inputStepType" render={({ match }) =>
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
