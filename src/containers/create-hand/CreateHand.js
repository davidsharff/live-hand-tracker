import React from 'react';
import { connect } from 'react-redux';
import { Container, Row } from 'reactstrap';

import styled from 'styled-components';

import ManageHoleCards from './components/ManageHoleCards';


import { handType } from '../../types';

function CreateHand(props) {
  return (
    <CreateHandContainer fluid className="d-flex flex-column">
      <Row className="pb-2 d-flex flex-row align-items-center justify-content-center">
        <div>
          <div>Live Hand Tracker</div>
          <div>Round: { props.hand.bettingRound }</div>
        </div>
      </Row>
      {
        props.hand.heroCards.length === 0
          ? <ManageHoleCards holeCards={[]} />
          : <div>Input Hand Details</div>
      }
    </CreateHandContainer>
  );
}

CreateHand.propTypes = {
  hand: handType
};

export default connect((state) => (console.log('state', state) || {
  hand: state.hand
}))(CreateHand);

const CreateHandContainer = styled(Container)`
  height: 100%;
`;

