import React from 'react';
//import _ from 'lodash';
import { connect } from 'react-redux';
import { Container, Row } from 'reactstrap';
import styled from 'styled-components';

import { getDeck } from "../../selectors";

import ManageHoleCards from './components/ManageHoleCards';


import actionTypes from '../../redux/actionTypes';
import { handType, deckType } from '../../types';

function Hand(props) {

  const handleSetHeroCards = (holeCards) => props.dispatch({
    type: actionTypes.SET_HERO_CARDS,
    payload: {
      holeCards: holeCards.map(({ value, suit}) => '' + value + suit)
    }
  });

  const heroHoleCards = props.hand.seats[props.hand.heroSeatIndex].holeCards;

  return (
    <CreateHandContainer fluid className="d-flex flex-column">
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
    </CreateHandContainer>
  );
}

Hand.propTypes = {
  hand: handType,
  deck: deckType
};

export default connect((state) => ({
  hand: state.hand,
  deck: getDeck(state)
}))(Hand);

const CreateHandContainer = styled(Container)`
  height: 100%;
`;

