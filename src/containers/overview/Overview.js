import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';

import { handType } from '../../types';

import connect from "react-redux/es/connect/connect";
import { Col, Row } from "reactstrap";
import { bettingRounds, sortedBettingRounds } from "../../constants";
import { getBoardForRound } from "../../redux/reducers/hand";

function Overview(props) {
  const { hand } = props;
  console.log('overview!', props);
  const actionsByRound = _.groupBy(hand.actions, 'bettingRound');

  return(
    <Container fluid className="d-flex flex-column h-100">
      <Col className="mb-1 d-flex flex-column p-0">
        {
          sortedBettingRounds.map((round, i) =>
            <Col className="mb-1 d-flex flex-column  pt-0 pl-4 pt-4" key={round}>
              <h4>{ _.capitalize(round) }</h4>
              {
                round !== bettingRounds.PRE_FLOP &&
                <React.Fragment>
                  <div>Board:</div>
                  <Row className="m-0 mb-1">
                    {
                      getBoardForRound(hand, round).map((card) =>
                        <div key={card} className="mr-2">
                          { card }
                        </div>
                      )
                    }
                  </Row>
                </React.Fragment>
              }
              {
                actionsByRound[round].map((a, i) =>
                  <Row key={i} className="m-0">
                    <div className="mr-2">Seat&nbsp;{ a.seatIndex + 1}</div>
                    <div className="mr-2">{ a.type }</div>
                    {
                      !!a.amount &&
                      <div>${ a.amount }</div>
                    }
                  </Row>
                )
              }
            </Col>
          )
        }
      </Col>
    </Container>
  );
}

Overview.propTypes = {
  hand: handType
};

export default withRouter(connect((state) => ({
  hand: state.hand
}))(Overview));