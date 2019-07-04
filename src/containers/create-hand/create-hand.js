import React from 'react';
import { connect } from 'react-redux';
import { Container, Row } from 'reactstrap';

function CreateHand(props) {
  return (
    <Container fluid>
      <Row className="d-flex flex-row align-items-center justify-content-center">
        <div>
          <div>Live Hand Tracker</div>
          <div>Round: { props.hand.bettingRound }</div>
        </div>
      </Row>
    </Container>
  );
}

export default connect((state) => (console.log('state', state) || {
  hand: state.hand
}))(CreateHand);