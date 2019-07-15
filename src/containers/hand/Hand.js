// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React from 'react';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import styled from 'styled-components';

import { getDeck } from "../../selectors";

import ManageHoleCards from './components/ManageHoleCards';
import Header from './components/Header';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType, sessionType } from '../../types';

function Hand(props) {
  const { session, hand } = props;

  if (session === null) {
    return <Redirect to="/session" />;
  }

  const handleSetHeroCards = (holeCards) => props.dispatch({
    type: actionTypes.SET_HERO_CARDS,
    payload: {
      holeCards: holeCards.map(({ value, suit}) => '' + value + suit)
    }
  });

  const heroHoleCards = hand.seats[props.hand.heroSeatIndex].holeCards;

  return (
    <HandContainer fluid className="d-flex flex-column">
      <Header location={session.location} smallBlind={session.smallBlind} bigBlind={session.bigBlind} totalPlayers={_.sumBy(hand.seats, 'isActive')} bettingRound={hand.bettingRound}/>
      {
        heroHoleCards.length === 0
          ? <ManageHoleCards deck={props.deck} onSetHoleCards={handleSetHeroCards} holeCards={heroHoleCards} />
          : <div>Input Hand Details</div>
      }
    </HandContainer>
  );
}

Hand.propTypes = {
  hand: handType,
  deck: deckType,
  session: sessionType
};

export default connect((state) => ({
  hand: state.hand,
  // TODO: this can be removed when check for session happens in middleware
  deck: state.hand ? getDeck(state) : null,
  session: state.session
}))(Hand);

const HandContainer = styled(Container)`
  height: 100%;
`;

