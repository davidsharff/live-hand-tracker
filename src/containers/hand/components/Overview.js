import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Col, Row } from "reactstrap";

import { handType } from '../../../types';
import { bettingRounds, sortedBettingRounds } from "../../../constants";
import { getBoardForRound } from "../../../redux/reducers/hand";

function Overview(props) {
  const { hand } = props;
  const actionsByRound = _.groupBy(hand.actions, 'bettingRound');

  return(
    <Col className="mb-1 d-flex flex-column p-0">
      {
        sortedBettingRounds.map((round, i) =>
          <Col className="mb-1 d-flex flex-column  pb-4 pl-4 pt-0" key={round}>
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
  );
}

Overview.propTypes = {
  hand: handType
};

export default withRouter(connect((state) => ({
  hand: state.hand
}))(Overview));