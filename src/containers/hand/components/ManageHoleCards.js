import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row, Button } from 'reactstrap';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

const suitAbbreviations = _.map(suits, s => s.slice(0, 1));

export default function ManageHoleCards(props) {

  const [selectedCardKey, setSelectedCardKey] = useState('cardOne');

  const [holeCards, setHoleCards] = useState({
    cardOne: {
      value: props.holeCards.length ? props.holeCards[0].slice(0, -1) : null,
      suit: props.holeCards.length  ? props.holeCards[0].slice(1, 2) : null
    },
    cardTwo: {
      value: props.holeCards.length ? props.holeCards[1].slice(0, -1) : null,
      suit: props.holeCards.length  ? props.holeCards[1].slice(1, 2) : null
    }
  });

  const handleClickCard = (cardKey) => setSelectedCardKey(cardKey);

  const handleClickSuit = (suit) => setHoleCards(_.assign({}, holeCards, {
    [selectedCardKey]: _.assign({}, holeCards[selectedCardKey], {
      suit
    })
  }));

  const handleClickValue = (value) => {
    setHoleCards(_.assign({}, holeCards, {
      [selectedCardKey]: _.assign({}, holeCards[selectedCardKey], {
        value
      })
    }));
  };

  const toggleCardIfComplete = () => {
    // Auto-toggle selected card the first time they fill out cardOne
    if (selectedCardKey === 'cardOne') {
      const cardOne = holeCards['cardOne'];
      const cardTwo = holeCards['cardTwo'];

      if (
        !!cardOne.value && !!cardOne.suit &&
        cardTwo.value === null && cardTwo.suit === null
      ) {
        setSelectedCardKey('cardTwo');
      }
    }
  };

  const getPendingDeck = useCallback(() =>
    _.reject(props.deck, (c) =>
      c === (holeCards.cardOne.value + holeCards.cardOne.suit) ||
      c === (holeCards.cardTwo.value + holeCards.cardTwo.suit)
    ), [props.deck, holeCards]);

  useEffect(toggleCardIfComplete, [toggleCardIfComplete, holeCards]);

  return (
    <Col className="pb-2 d-flex flex-column flex-fill">
      <div>
        <Row className="d-flex flex-row flex-fill justify-content-around">
          <Col className="d-flex flex-column align-items-center">
            <HoleCardSlot
              className="mb-4 d-flex flex-column justify-content-center align-items-center"
              onClick={() => handleClickCard('cardOne')}
              isSelected={selectedCardKey === 'cardOne'}
            >
              <span>{ `${holeCards.cardOne.value || ''}${holeCards.cardOne.suit || ''}` }</span>
            </HoleCardSlot>
          </Col>
          <Col className="d-flex flex-column align-items-center">
            <HoleCardSlot
              className="mb-4 d-flex flex-column justify-content-center align-items-center"
              onClick={() => handleClickCard('cardTwo')}
              isSelected={selectedCardKey === 'cardTwo'}
            >
              <span>{ `${holeCards.cardTwo.value || ''}${holeCards.cardTwo.suit || ''}` }</span>
            </HoleCardSlot>
          </Col>
        </Row>
      </div>
      <Col className="my-2 d-flex flex-column flex-fill">
        {
          _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
            <Row className="d-flex flex-row flex-fill justify-content-between" key={i}>
              {
                chunk.map((cv) =>
                  <ValueContainer
                    className="d-flex flex-column align-items-center justify-content-center"
                    key={cv}
                    onClick={() =>
                      !isCardValueDisabled(getPendingDeck(), holeCards[selectedCardKey].suit, cv) &&
                      handleClickValue(cv)
                    }
                    disabled={isCardValueDisabled(getPendingDeck(), holeCards[selectedCardKey].suit, cv)}
                    isSelected={holeCards[selectedCardKey].value === cv}
                  >
                    { cv }
                  </ValueContainer>
                )
              }
            </Row>
          )
        }
      </Col>
      <SuitContainer>
        <Row className="d-flex flex-row justify-content-between">
          {
            _.range(0, 4).map(i =>
              <Suit
                key={i}
                className="d-flex flex-column justify-content-center align-items-center"
                onClick={() =>
                  !isSuitDisabled(getPendingDeck(), holeCards[selectedCardKey].value, suitAbbreviations[i]) &&
                  handleClickSuit(suitAbbreviations[i])
                }
                isSelected={holeCards[selectedCardKey].suit === suitAbbreviations[i]}
                disabled={isSuitDisabled(getPendingDeck(), holeCards[selectedCardKey].value, suitAbbreviations[i])}
              >
                { suitAbbreviations[i] }
              </Suit>
            )
          }
        </Row>
      </SuitContainer>
      <Button className="mb-4" color="success" onClick={() => props.onSetHoleCards([holeCards.cardOne, holeCards.cardTwo])}>
        Submit
      </Button>
    </Col>
  );
}

// TODO: set whether cards are disabled here via selector
ManageHoleCards.propTypes = {
  holeCards: holeCardsType,
  // TODO: define cb param types
  onSetHoleCards: PropTypes.func
};

// ...rest is a workaround to avoid unknown prop warning. See: https://github.com/styled-components/styled-components/issues/305
const HoleCardSlot = styled(({ isSelected, ...rest }) => <Col { ...rest }/>)`
  border: dotted 1px #333;
  min-height: 100px;
  width: 80px;
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 3px;
  `};
`;

const SuitContainer = styled(Col)`
  min-height: 100px;
  max-height: 100px;
`;

const Suit = styled(({ disabled, isSelected, ...rest }) => <Col { ...rest }/>)`
  padding: 5px;
  border: solid 1px #333;
  max-width: 24%;
  background-color: ${p => !p.isSelected && p.disabled && '#eee'};
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 2px;
  `}
`;

const ValueContainer = styled(({ disabled, isSelected, ...rest }) => <Col { ...rest }/>)`
  border: solid 1px #333;
  background-color: ${p => !p.isSelected && p.disabled && '#eee'};
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 2px;
  `}
`;

function isCardValueDisabled(deck, selectedSuit, cardValue) {
  // TODO: test first condition when board cards are wired up.
  const noCardValueInDeck = !deck.some((c) => c.slice(0, -1) === cardValue);
  const noCardInDeck = !!selectedSuit && !_.includes(deck, (cardValue + selectedSuit));

  return noCardValueInDeck || noCardInDeck;
}

function isSuitDisabled(deck, selectedValue, suit) {
  return !!selectedValue && !_.includes(deck, (selectedValue + suit));
}