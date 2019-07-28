// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React  from 'react';
import _ from 'lodash';
import { Redirect, Route, withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import styled from 'styled-components';

import { getDeck } from "../../selectors";

import ManageHoleCards from './components/ManageHoleCards';
import Wizard from './components/Wizard';
import Header from './components/Header';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType, sessionType } from '../../types';

function Hand(props) {
  const { session, hand, deck} = props;

  if (session === null) {
    return <Redirect to="/session" />;
  }

  const heroHoleCards = hand.seats[props.hand.heroSeatIndex].holeCards;

  // if (!_.includes(props.history.location.pathname, 'input-wizard')) {
  //   props.history.push('/hand/input-wizard');
  // }

  if (
//    false &&
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
        holeCards: holeCards.map(({ value, suit}) => '' + value + suit)
      }
    });

    props.history.push('/hand/input-wizard');
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

  return (
    <HandContainer fluid className="d-flex flex-column">
      <Header location={session.location} smallBlind={session.smallBlind} bigBlind={session.bigBlind} totalPlayers={_.sumBy(hand.seats, 'isActive')} bettingRound={hand.currentBettingRound}/>
      <Switch>

        <Route exact path="/hand/manage-hole-cards" render={() =>
          <ManageHoleCards deck={deck} onSetHoleCards={handleSetHeroCards} holeCards={heroHoleCards} />
        }/>

        <Route exact path="/hand/input-wizard" render={() =>
          <Wizard
            hand={hand}
            onSetButtonSeatIndex={handleSetButtonIndex}
            onCall={(seatIndex) => props.dispatch({ type: actionTypes.CALL, payload: { seatIndex }})}
            blinds={{ small: session.smallBlind, big: session.bigBlind /* TODO: consider nesting under blinds in session state. */}}
          />
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
  deck: state.hand ? getDeck(state) : null,
  session: state.session
}))(Hand));

const HandContainer = styled(Container)`
  height: 100%;
`;

