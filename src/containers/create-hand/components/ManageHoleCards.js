import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row, Button } from 'reactstrap';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

export default function ManageHoleCards(props) {

  const [holeCards, setHoleCards] = useState({
    cardOne: {
      value: props.holeCards.length ? props.holeCards[0].slice(0, 1) : null,
      suit: props.holeCards.length ? props.holeCards[0].slice(1, 2) : null
    },
    cardTwo: {
      value: props.holeCards.length ? props.holeCards[1].slice(0, 1) : null,
      suit: props.holeCards.length ? props.holeCards[1].slice(1, 2) : null
    }
  });

  const handleClickSuit = (suit, key) => setHoleCards(_.assign({}, holeCards, {
    [key]: _.assign({}, holeCards[key], {
      suit
    })
  }));

  return (
    <Col className="pb-2 d-flex flex-column flex-fill">
      <div>
        <Row className="d-flex flex-row flex-fill justify-content-around">
          <HoleCard card={holeCards.cardOne} onClickSuit={(suit) => handleClickSuit(suit, 'cardOne')} />
          <HoleCard card={holeCards.cardTwo} onClickSuit={(suit) => handleClickSuit(suit, 'cardTwo')} />
        </Row>
      </div>
      <Col className="my-4 d-flex flex-column flex-fill">
        {
          _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
            <Row className="d-flex flex-row flex-fill justify-content-between" key={i}>
              {
                chunk.map((cv) =>
                  <ValueContainer className="d-flex flex-column align-items-center justify-content-center" key={cv}>
                    { cv }
                  </ValueContainer>
                )
              }
            </Row>
          )
        }
      </Col>
      <Button className="mb-4" color="success">
        Submit
      </Button>
    </Col>
  );
}

ManageHoleCards.propTypes = {
  holeCards: holeCardsType,
  onSetHoleCards: PropTypes.func
};

function HoleCard(props) {
  const suitAbbreviations = _.map(suits, s => s.slice(0, 1));
  return (
    <Col className="d-flex flex-column align-items-center">
      <HoleCardSlot className="mb-4 d-flex flex-column justify-content-center align-items-center">
        <span>{ `${props.card.value || ''}${props.card.suit || ''}` }</span>
      </HoleCardSlot>
      <SuitContainer className="d-flex flex-column justify-content-between">
        <Row className="d-flex flex-row flex-fill">
          <Suit className="d-flex flex-column justify-content-center align-items-center" onClick={() => props.onClickSuit(suitAbbreviations[0])}>
            { suitAbbreviations[0] }
          </Suit>
          <Suit className="d-flex flex-column justify-content-center align-items-center" onClick={() => props.onClickSuit(suitAbbreviations[1])}>
            { suitAbbreviations[1] }
          </Suit>
        </Row>
        <Row className="d-flex flex-row flex-fill">
          <Suit className="d-flex flex-column justify-content-center align-items-center" onClick={() => props.onClickSuit(suitAbbreviations[2])}>
            { suitAbbreviations[2] }
          </Suit>
          <Suit className="d-flex flex-column justify-content-center align-items-center" onClick={() => props.onClickSuit(suitAbbreviations[3])}>
            { suitAbbreviations[3] }
          </Suit>
        </Row>
      </SuitContainer>
    </Col>
  );
}

const HoleCardSlot = styled(Col)`
  border: dotted 1px #333;
  min-height: 100px;
  width: 80px;
`;

const SuitContainer = styled(Col)`
  min-height: 100px;
  max-height: 100px;
`;

const Suit = styled(Col)`
  border: solid 1px #333;
  min-height: 50px;
`;

const ValueContainer = styled(Col)`
  border: solid 1px #333;
`;