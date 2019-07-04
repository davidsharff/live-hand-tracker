import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row } from 'reactstrap';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

export default function ManageHoleCards(props) {

  return (
    <Col className="pb-2 d-flex flex-column flex-fill">
      <div>
        <Row className="d-flex flex-row flex-fill justify-content-around">
          <HoleCard card={props.holeCards[0]}/>
          <HoleCard card={props.holeCards[1]}
          />
        </Row>
      </div>
      <Col className="d-flex flex-column flex-fill">
        {
          _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
            <Row className="d-flex flex-row flex-fill justify-content-between" key={i}>
              {
                chunk.map((cv) =>
                  <Col className="d-flex flex-column align-items-center justify-content-center" key={cv}>
                    { cv }
                  </Col>
                )
              }
            </Row>
          )
        }
      </Col>
    </Col>
  );
}

ManageHoleCards.propTypes = {
  holeCards: holeCardsType
};

function HoleCard(props) {
  const suitAbbreviations = _.map(suits, s => s.slice(0, 1));
  return (
    <Col className="d-flex flex-column align-items-center">
      <HoleCardSlot className="mb-4 d-flex flex-column justify-content-center align-items-center">
        <span>{ props.card || 'As' }</span>
      </HoleCardSlot>
      <SuitContainer className="d-flex flex-column justify-content-between">
        <Row className="d-flex flex-row flex-fill">
          <Suit className="d-flex flex-column justify-content-center align-items-center">
            { suitAbbreviations[0] }
          </Suit>
          <Suit className="d-flex flex-column justify-content-center align-items-center">
            { suitAbbreviations[1] }
          </Suit>
        </Row>
        <Row className="d-flex flex-row flex-fill">
          <Suit className="d-flex flex-column justify-content-center align-items-center">
            { suitAbbreviations[2] }
          </Suit>
          <Suit className="d-flex flex-column justify-content-center align-items-center">
            { suitAbbreviations[3] }
          </Suit>
        </Row>
      </SuitContainer>
    </Col>
  );
}

const HoleCardSlot = styled(Col)`
  border: dotted 1px #333;
  min-height: 75px;
  width: 60px;
`;

const SuitContainer = styled(Col)`
  min-height: 100px;
  max-height: 100px;
`;

const Suit = styled(Col)`
  border: solid 1px #333;
  min-height: 50px;
`;