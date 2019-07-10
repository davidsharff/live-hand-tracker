// TODO: clicking create hand button should move existing hand into a "hands" session collection and reset hand state with defaults
import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row } from 'reactstrap';
import styled from 'styled-components';

import { getDeck } from "../../selectors";

import ManageHoleCards from './components/ManageHoleCards';

import actionTypes from '../../redux/actionTypes';
import { handType, deckType } from '../../types';

function Hand(props) {
  if (!props.hasSession) {
    return <Redirect to="/session" />;
  }

  const handleSetHeroCards = (holeCards) => props.dispatch({
    type: actionTypes.SET_HERO_CARDS,
    payload: {
      holeCards: holeCards.map(({ value, suit}) => '' + value + suit)
    }
  });

  const heroHoleCards = props.hand.seats[props.hand.heroSeatIndex].holeCards;

  return (
    <HandContainer fluid className="d-flex flex-column">
      <Row className="pb-4 d-flex flex-row align-items-center justify-content-center">
        <div>
          <div>Live Hand Tracker</div>
          <div>Round: { props.hand.bettingRound }</div>
        </div>
      </Row>
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
  hasSession: PropTypes.bool
};

export default connect((state) => ({
  hand: state.hand,
  // TODO: this can be removed when check for session happens in middleware
  deck: state.hand ? getDeck(state) : null,
  hasSession: state.session !== null
}))(Hand);

const HandContainer = styled(Container)`
  height: 100%;
`;

