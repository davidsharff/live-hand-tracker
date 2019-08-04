// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React, { useEffect }  from 'react';
import _ from 'lodash';
import { Redirect, Route, withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import styled from 'styled-components';

import ManageHoleCards from './components/ManageCards';
import Wizard from './components/Wizard';
import Header from './components/Header';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType, sessionType } from '../../types';
import {bettingRounds, cardInputTypes} from "../../constants";

import { getDeck } from "../../redux/reducers/hand";
import Overview from "./components/Overview";

function Hand(props) {
  const { session, hand, deck, currentBettingRound } = props;

  useEffect(() => {
    if (
      _.includes(props.history.location, '/hand/input-wizard') &&
      currentBettingRound &&
      currentBettingRound !== bettingRounds.PRE_FLOP
    ) {
      props.history.push(`/hand/input-wizard/cards/${currentBettingRound}`);
    }
  }, [currentBettingRound, props.history]);

  if (session === null) {
    return <Redirect to="/session" />;
  }

  const heroHoleCards = hand.seats[props.hand.heroSeatIndex].holeCards;

  // if (!_.includes(props.history.location.pathname, 'input-wizard')) {
  //   props.history.push('/hand/input-wizard');
  // }

  if (
   // false &&
    session &&
    heroHoleCards.length < 2 &&
    props.location.pathname !== '/hand/manage-hole-cards'
  ) {
    return (
      <Redirect to="/hand/manage-hole-cards" />
    );
  }

  const handleSetHeroCards = (holeCards) => {
    props.dispatch({
      type: actionTypes.SET_HERO_CARDS,
      payload: {
        holeCards
      }
    });

    props.history.push('/hand/input-wizard');
  };

  const handleSaveBoardCards = (cards) => {
    props.dispatch({
      type: actionTypes.SET_BOARD_CARDS,
      payload: {
        cards
      }
    });

    props.history.push('/hand/input-wizard');
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

  // TODO: explore / decide between const and named functions.
  function handleSetButtonIndex(buttonSeatIndex) {
    props.dispatch({
      type: actionTypes.SET_BUTTON_INDEX,
      payload: {
        buttonSeatIndex
      }
    });
  }

  // TODO: all routes below should use handId param
  return (
    <HandContainer fluid className="d-flex flex-column">
      <Header
        location={session.location}
        smallBlind={session.smallBlind}
        bigBlind={session.bigBlind}
        totalPlayers={_.sumBy(hand.seats, 'isActive')}
        bettingRound={hand.currentBettingRound}
        shouldCollapse={false}
      />
      <Switch>

        {/* TODO: this can go away and be a step in the wizard instead like board cards. */}
        <Route exact path="/hand/manage-hole-cards" render={() =>
          <ManageHoleCards deck={deck} onSave={handleSetHeroCards} cards={heroHoleCards} type={cardInputTypes.HOLE_CARDS} />
        }/>

        <Route path="/hand/input-wizard" render={() =>
          <Wizard
            hand={hand}
            onSetButtonSeatIndex={handleSetButtonIndex}
            onAction={handleAddAction}
            blinds={{ small: session.smallBlind, big: session.bigBlind /* TODO: consider nesting under blinds in session state. */}}
            deck={deck}
            onSaveBoardCards={handleSaveBoardCards}
            board={hand.board}
          />
        }/>
        <Route exact path="/hand/overview" render={() =>
          <Overview hand={hand} />
        }/>

      </Switch>
    </HandContainer>
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
    : null
}))(Hand));

const HandContainer = styled(Container)`
  height: 100%;
`;

