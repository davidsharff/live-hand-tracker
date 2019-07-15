import React from 'react';
import _ from 'lodash';
import { Container, Row, Col } from 'reactstrap';


export default function HandHeader(props) {
  return (
    <Container>
      <Col style={{fontSize: '14px'}}>
        <Row className="d-flex flex-row justify-content-center align-items-center">
          <div>Blinds {props.smallBlind}/{props.bigBlind}&nbsp;</div>
          <div>Players {props.totalPlayers}&nbsp;</div>
          <div>{props.location}</div>
        </Row>
        <Row className="d-flex flex-row justify-content-center align-items-center">
          <div>Hand #1:&nbsp;{_.capitalize(props.bettingRound)}</div>
        </Row>
      </Col>
    </Container>
  );
}