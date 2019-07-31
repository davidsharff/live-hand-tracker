import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row, Button } from 'reactstrap';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

const suitAbbreviations = _.map(suits, s => s.slice(0, 1));

export default function ManageCards(props) {

  const [selectedCardKey, setSelectedCardKey] = useState('card1');

  // TODO: should also check if props.cards is already filled out and use that instead.

  const [cards, setCards] = useState(
    _.range(0, props.numCards).reduce((obj, i) =>
        _.assign({}, obj, { ['card' + (i + 1)]: {
            value: props.cards.length > i ? props.cards[i].slice(0, -1) : null,
            suit: props.cards.length > i ? props.cards[i].slice(1, 2) : null,
          }})
      , {})
  );

  const handleClickCard = (cardKey) => setSelectedCardKey(cardKey);

  const handleClickSuit = (suit) => setCards(_.assign({}, cards, {
    [selectedCardKey]: _.assign({}, cards[selectedCardKey], {
      suit
    })
  }));

  const handleClickValue = (value) => {
    setCards(_.assign({}, cards, {
      [selectedCardKey]: _.assign({}, cards[selectedCardKey], {
        value
      })
    }));
  };

  const toggleCardIfComplete = () => {
    // Auto-toggle selected card the first time they fill out card1
    if (selectedCardKey === 'card1') {
      const card1 = cards['card1'];
      const card2 = cards['card2'];
      if (
        !!card1.value && !!card1.suit &&
        card2.value === null && card2.suit === null
      ) {
        setSelectedCardKey('card2');
      }
    }
  };

  const getPendingDeck = useCallback(() =>
    _.reject(props.deck, (c) =>
      c === (cards.card1.value + cards.card1.suit) ||
      c === (cards.card2.value + cards.card2.suit)
    ), [props.deck, cards]);

  useEffect(toggleCardIfComplete, [toggleCardIfComplete, cards]);

  return (
    <Col className="pb-2 d-flex flex-column flex-fill">
      <div>
        <Row className="d-flex flex-row flex-fill justify-content-around">
          <Col className="d-flex flex-column align-items-center">
            <CardSlot
              className="mb-4 d-flex flex-column justify-content-center align-items-center"
              onClick={() => handleClickCard('card1')}
              isSelected={selectedCardKey === 'card1'}
            >
              <span>{ `${cards.card1.value || ''}${cards.card1.suit || ''}` }</span>
            </CardSlot>
          </Col>
          <Col className="d-flex flex-column align-items-center">
            <CardSlot
              className="mb-4 d-flex flex-column justify-content-center align-items-center"
              onClick={() => handleClickCard('card2')}
              isSelected={selectedCardKey === 'card2'}
            >
              <span>{ `${cards.card2.value || ''}${cards.card2.suit || ''}` }</span>
            </CardSlot>
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
                      !isCardValueDisabled(getPendingDeck(), cards[selectedCardKey].suit, cv) &&
                      handleClickValue(cv)
                    }
                    disabled={isCardValueDisabled(getPendingDeck(), cards[selectedCardKey].suit, cv)}
                    isSelected={cards[selectedCardKey].value === cv}
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
                  !isSuitDisabled(getPendingDeck(), cards[selectedCardKey].value, suitAbbreviations[i]) &&
                  handleClickSuit(suitAbbreviations[i])
                }
                isSelected={cards[selectedCardKey].suit === suitAbbreviations[i]}
                disabled={isSuitDisabled(getPendingDeck(), cards[selectedCardKey].value, suitAbbreviations[i])}
              >
                { suitAbbreviations[i] }
              </Suit>
            )
          }
        </Row>
      </SuitContainer>
      <Button className="mb-4" color="success" onClick={() => props.onSave([cards.card1, cards.card2])}>
        Submit
      </Button>
    </Col>
  );
}

// TODO: set whether cards are disabled here via selector
ManageCards.propTypes = {
  cards: holeCardsType,
  // TODO: define cb param types
  onSave: PropTypes.func
};

// ...rest is a workaround to avoid unknown prop warning. See: https://github.com/styled-components/styled-components/issues/305
const CardSlot = styled(({ isSelected, ...rest }) => <Col { ...rest }/>)`
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